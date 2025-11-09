const db = require('../config/database');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const { sendEmail } = require('../services/emailService');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN
});

const preference = new Preference(client);
const payment = new Payment(client);

// Criar preferência de pagamento
exports.createPayment = async (req, res) => {
    try {
        const { items, guest_name, guest_email, message } = req.body;

        // Validar dados
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Nenhum item selecionado' });
        }

        // Verificar disponibilidade e calcular total
        let total = 0;
        const purchaseItems = [];

        for (const item of items) {
            const [experiences] = await db.query(
                'SELECT * FROM experiences_WED WHERE id = ? AND active = TRUE',
                [item.experience_id]
            );

            if (experiences.length === 0) {
                return res.status(404).json({ error: `Experiência ${item.experience_id} não encontrada` });
            }

            const experience = experiences[0];

            if (experience.available_quotas < item.quantity) {
                return res.status(400).json({ 
                    error: `Quantidade indisponível para ${experience.title}` 
                });
            }

            const itemTotal = experience.price * item.quantity;
            total += itemTotal;

            purchaseItems.push({
                title: experience.title,
                unit_price: parseFloat(experience.price),
                quantity: item.quantity,
                experience_id: experience.id
            });
        }

        // Criar preferência no Mercado Pago
        const preferenceData = {
            items: purchaseItems.map(item => ({
                title: item.title,
                unit_price: item.unit_price,
                quantity: item.quantity
            })),
            payer: {
                name: guest_name,
                email: guest_email
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/pagamento/sucesso`,
                failure: `${process.env.FRONTEND_URL}/pagamento/erro`,
                pending: `${process.env.FRONTEND_URL}/pagamento/pendente`
            },
            auto_return: 'approved',
            notification_url: `${process.env.FRONTEND_URL}/api/payments/webhook`,
            metadata: {
                guest_name,
                guest_email,
                message,
                items: JSON.stringify(purchaseItems)
            }
        };

        const response = await preference.create({ body: preferenceData });

        // Salvar compra pendente
        for (const item of purchaseItems) {
            // Obter configurações
            const [settings] = await db.query('SELECT * FROM settings_WED WHERE setting_key IN ("admin_fee_percentage", "mercadopago_fee_percentage")');
            const adminFee = parseFloat(settings.find(s => s.setting_key === 'admin_fee_percentage')?.setting_value || 5);
            const mpFee = parseFloat(settings.find(s => s.setting_key === 'mercadopago_fee_percentage')?.setting_value || 5);

            const itemTotal = item.unit_price * item.quantity;
            const mpFeeAmount = itemTotal * (mpFee / 100);
            const adminFeeAmount = itemTotal * (adminFee / 100);
            const coupleAmount = itemTotal - mpFeeAmount - adminFeeAmount;

            await db.query(
                `INSERT INTO purchases_WED 
                (guest_name, guest_email, experience_id, quantity, price, total_amount, message, payment_id, 
                payment_status, mercadopago_fee, admin_fee_percentage, admin_fee_amount, couple_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)`,
                [guest_name, guest_email, item.experience_id, item.quantity, item.unit_price, 
                 itemTotal, message, response.body.id, mpFeeAmount, adminFee, adminFeeAmount, coupleAmount]
            );
        }

        res.json({
            preference_id: response.body.id,
            init_point: response.body.init_point
        });
    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({ error: 'Erro ao criar pagamento' });
    }
};

// Webhook do Mercado Pago
exports.paymentWebhook = async (req, res) => {
    try {
        const { type, data } = req.body;

        if (type === 'payment') {
            const paymentId = data.id;
            
            // Buscar informações do pagamento
            const paymentInfo = await payment.get({ id: paymentId });
            
            // Atualizar status da compra
            await db.query(
                'UPDATE purchases_WED SET payment_status = ? WHERE payment_id = ?',
                [paymentInfo.status, paymentInfo.external_reference]
            );

            // Se aprovado, atualizar quotas disponíveis
            if (paymentInfo.status === 'approved') {
                const [purchases] = await db.query(
                    'SELECT * FROM purchases_WED WHERE payment_id = ?',
                    [paymentInfo.external_reference]
                );

                for (const purchase of purchases) {
                    await db.query(
                        'UPDATE experiences_WED SET available_quotas = available_quotas - ? WHERE id = ?',
                        [purchase.quantity, purchase.experience_id]
                    );
                }

                // Enviar email de confirmação
                if (purchases.length > 0) {
                    const purchase = purchases[0];
                    await sendEmail({
                        to: purchase.guest_email,
                        subject: 'Presente Confirmado - Casamento Vanessa & Guilherme',
                        html: `
                            <h1>Obrigado pelo seu presente! 🎁</h1>
                            <p>Olá ${purchase.guest_name},</p>
                            <p>Seu presente foi confirmado com sucesso!</p>
                            <p><strong>Valor:</strong> R$ ${purchase.total_amount.toFixed(2)}</p>
                            ${purchase.message ? `<p><strong>Sua mensagem:</strong> ${purchase.message}</p>` : ''}
                            <p>Vanessa & Guilherme agradecem de coração! ❤️</p>
                        `
                    });
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.sendStatus(500);
    }
};

// Listar compras
exports.listPurchases = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT p.*, e.title as experience_title 
            FROM purchases_WED p
            JOIN experiences_WED e ON p.experience_id = e.id
        `;
        let params = [];

        if (status) {
            query += ' WHERE p.payment_status = ?';
            params.push(status);
        }

        query += ' ORDER BY p.created_at DESC';

        const [purchases] = await db.query(query, params);
        res.json(purchases);
    } catch (error) {
        console.error('Erro ao listar compras:', error);
        res.status(500).json({ error: 'Erro ao listar compras' });
    }
};

// Dashboard financeiro
exports.getFinancialSummary = async (req, res) => {
    try {
        const [summary] = await db.query(`
            SELECT 
                SUM(total_amount) as total_received,
                SUM(mercadopago_fee) as total_mp_fee,
                SUM(admin_fee_amount) as total_admin_fee,
                SUM(couple_amount) as total_couple_amount,
                COUNT(*) as total_purchases
            FROM purchases_WED
            WHERE payment_status = 'approved'
        `);

        const [withdrawals] = await db.query(`
            SELECT SUM(amount) as total_withdrawn
            FROM withdrawals
            WHERE status = 'approved'
        `);

        const totalWithdrawn = withdrawals[0].total_withdrawn || 0;
        const availableBalance = (summary[0].total_couple_amount || 0) - totalWithdrawn;

        res.json({
            total_received: summary[0].total_received || 0,
            total_mp_fee: summary[0].total_mp_fee || 0,
            total_admin_fee: summary[0].total_admin_fee || 0,
            total_couple_amount: summary[0].total_couple_amount || 0,
            total_withdrawn: totalWithdrawn,
            available_balance: availableBalance,
            total_purchases: summary[0].total_purchases || 0
        });
    } catch (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
    }
};
