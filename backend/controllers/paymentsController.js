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
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛒 [CREATE_PAYMENT]', new Date().toISOString());
    
    try {
        const { items, guest_name, guest_email, message } = req.body;
        
        console.log('📦 [CREATE_PAYMENT] Items:', items?.length || 0);
        console.log('👤 [CREATE_PAYMENT] Guest:', guest_name, '-', guest_email);

        // Validar dados
        if (!items || items.length === 0) {
            console.log('❌ [CREATE_PAYMENT] Nenhum item selecionado');
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

        console.log(`💰 [CREATE_PAYMENT] Total: R$ ${total.toFixed(2)}`);

        // Criar preferência no Mercado Pago
        const externalRef = `gift_${Date.now()}`;
        console.log('🔑 [CREATE_PAYMENT] External Reference:', externalRef);
        
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
            notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
            statement_descriptor: 'Casamento',
            external_reference: externalRef,
            metadata: {
                guest_name,
                guest_email,
                message,
                items: JSON.stringify(purchaseItems)
            }
        };

        console.log('🌐 [CREATE_PAYMENT] Webhook URL:', preferenceData.notification_url);
        console.log('📤 [CREATE_PAYMENT] Enviando ao MercadoPago...');

        const response = await preference.create({ body: preferenceData });

        // A resposta da API v2 retorna os dados diretamente, não em response.body
        const preferenceId = response.id || response.body?.id;
        const initPoint = response.init_point || response.body?.init_point;

        if (!preferenceId) {
            console.error('❌ [CREATE_PAYMENT] Preference ID não encontrado:', response);
            throw new Error('Não foi possível obter ID da preferência');
        }

        console.log('✅ [CREATE_PAYMENT] Preferência criada:', preferenceId);
        console.log('🔗 [CREATE_PAYMENT] Init Point:', initPoint);

        // Salvar compra pendente
        console.log('💾 [CREATE_PAYMENT] Salvando no banco...');
        
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
                 itemTotal, message, preferenceId, mpFeeAmount, adminFee, adminFeeAmount, coupleAmount]
            );
        }

        console.log('✅ [CREATE_PAYMENT] Sucesso! Retornando init_point');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        res.json({
            preference_id: preferenceId,
            init_point: initPoint
        });
    } catch (error) {
        console.error('❌ [CREATE_PAYMENT] ERRO:', error.message);
        console.error('❌ [CREATE_PAYMENT] Stack:', error.stack);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        res.status(500).json({ error: 'Erro ao criar pagamento' });
    }
};

// Webhook do Mercado Pago
exports.paymentWebhook = async (req, res) => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📨 [WEBHOOK]', new Date().toISOString());
    console.log('📨 [WEBHOOK] Body:', JSON.stringify(req.body, null, 2));
    console.log('📨 [WEBHOOK] Query:', JSON.stringify(req.query, null, 2));
    
    // IMPORTANTE: Responder 200 IMEDIATAMENTE (MercadoPago exige resposta rápida)
    res.sendStatus(200);
    console.log('✅ [WEBHOOK] Resposta 200 enviada imediatamente');

    // Processar notificação de forma assíncrona
    (async () => {
        try {
            const { type, data } = req.body;
            console.log('🔔 [WEBHOOK] Type:', type);
            console.log('🔔 [WEBHOOK] Data:', JSON.stringify(data, null, 2));

            if (type === 'payment') {
                const paymentId = data.id;
                console.log('💳 [WEBHOOK] Payment ID:', paymentId);
                
                // Buscar informações do pagamento
                console.log('🔍 [WEBHOOK] Buscando informações do pagamento...');
                const paymentInfo = await payment.get({ id: paymentId });
                
                console.log('💳 [WEBHOOK] Payment Info:', JSON.stringify({
                    id: paymentInfo.id,
                    status: paymentInfo.status,
                    external_reference: paymentInfo.external_reference,
                    transaction_amount: paymentInfo.transaction_amount,
                    payer: paymentInfo.payer?.email
                }, null, 2));

                const externalRef = paymentInfo.external_reference;
                const mpPaymentId = paymentInfo.id;
                const status = paymentInfo.status;

                if (!externalRef) {
                    console.error('❌ [WEBHOOK] External reference não encontrado no pagamento');
                    return;
                }

                console.log('🔑 [WEBHOOK] External Reference:', externalRef);
                console.log('📊 [WEBHOOK] Status:', status);
                
                // Atualizar status da compra com external_reference E payment_id do MercadoPago
                console.log('💾 [WEBHOOK] Atualizando status no banco...');
                const [updateResult] = await db.query(
                    'UPDATE purchases_WED SET payment_status = ?, mercadopago_payment_id = ? WHERE payment_id = ?',
                    [status, mpPaymentId, externalRef]
                );
                
                console.log('💾 [WEBHOOK] Linhas afetadas:', updateResult.affectedRows);

                // Se aprovado, atualizar quotas disponíveis
                if (status === 'approved') {
                    console.log('🎉 [WEBHOOK] PAGAMENTO APROVADO!');
                    
                    const [purchases] = await db.query(
                        'SELECT * FROM purchases_WED WHERE payment_id = ?',
                        [externalRef]
                    );

                    console.log('🛒 [WEBHOOK] Compras encontradas:', purchases.length);

                    for (const purchase of purchases) {
                        console.log(`📦 [WEBHOOK] Atualizando quota exp ${purchase.experience_id} - Qtd: ${purchase.quantity}`);
                        
                        await db.query(
                            'UPDATE experiences_WED SET available_quotas = available_quotas - ? WHERE id = ?',
                            [purchase.quantity, purchase.experience_id]
                        );
                    }

                    // Enviar email de confirmação
                    if (purchases.length > 0) {
                        const purchase = purchases[0];
                        console.log('📧 [WEBHOOK] Enviando email para:', purchase.guest_email);
                        
                        try {
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
                            console.log('✅ [WEBHOOK] Email enviado com sucesso!');
                        } catch (emailError) {
                            console.error('❌ [WEBHOOK] Erro ao enviar email:', emailError.message);
                        }
                    }

                    console.log('🎉 [WEBHOOK] Processamento concluído com sucesso!');
                } else {
                    console.log('⚠️ [WEBHOOK] Status não aprovado:', status);
                }
            } else {
                console.log('ℹ️ [WEBHOOK] Tipo de notificação ignorado:', type);
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        } catch (error) {
            console.error('❌ [WEBHOOK] ERRO:', error.message);
            console.error('❌ [WEBHOOK] Stack:', error.stack);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        }
    })();
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
            FROM withdrawals_WED
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
