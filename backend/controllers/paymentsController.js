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
            notification_url: `${process.env.BACKEND_URL}/payments/webhook`,
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
            // Obter apenas a taxa administrativa (MP será calculado depois)
            const [settings] = await db.query('SELECT * FROM settings_WED WHERE setting_key = "admin_fee_percentage"');
            const adminFeePercentage = parseFloat(settings[0]?.setting_value || 10);

            const itemTotal = item.unit_price * item.quantity;
            const adminFeeAmount = itemTotal * (adminFeePercentage / 100);
            const coupleAmount = itemTotal - adminFeeAmount;

            console.log(`📊 [CREATE_PAYMENT] Item: ${item.title}`);
            console.log(`   Valor: R$ ${itemTotal.toFixed(2)}`);
            console.log(`   Taxa Admin (${adminFeePercentage}%): R$ ${adminFeeAmount.toFixed(2)}`);
            console.log(`   Valor Noivos: R$ ${coupleAmount.toFixed(2)}`);

            await db.query(
                `INSERT INTO purchases_WED 
                (guest_name, guest_email, experience_id, quantity, price, total_amount, message, payment_id, 
                payment_status, mercadopago_fee, admin_fee_percentage, admin_fee_amount, couple_amount) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, ?, ?, ?)`,
                [guest_name, guest_email, item.experience_id, item.quantity, item.unit_price, 
                 itemTotal, message, externalRef, adminFeePercentage, adminFeeAmount, coupleAmount]
            );
        }

        console.log('💾 [CREATE_PAYMENT] Salvo no banco com payment_id:', externalRef);
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
                    transaction_details: paymentInfo.transaction_details,
                    fee_details: paymentInfo.fee_details,
                    payer: paymentInfo.payer?.email
                }, null, 2));

                const externalRef = paymentInfo.external_reference;
                const mpPaymentId = paymentInfo.id;
                const status = paymentInfo.status;
                
                // Buscar taxa REAL do MercadoPago da API
                const transactionAmount = parseFloat(paymentInfo.transaction_amount) || 0;
                const netReceivedAmount = parseFloat(paymentInfo.transaction_details?.net_received_amount) || transactionAmount;
                const mpFeeReal = transactionAmount - netReceivedAmount;

                if (!externalRef) {
                    console.error('❌ [WEBHOOK] External reference não encontrado no pagamento');
                    return;
                }

                console.log('🔑 [WEBHOOK] External Reference:', externalRef);
                console.log('📊 [WEBHOOK] Status:', status);
                console.log('💰 [WEBHOOK] Valor transação:', transactionAmount);
                console.log('💵 [WEBHOOK] Valor líquido recebido:', netReceivedAmount);
                console.log('💳 [WEBHOOK] Taxa MercadoPago REAL:', mpFeeReal.toFixed(2));
                
                // Atualizar status da compra com external_reference E payment_id do MercadoPago
                console.log('💾 [WEBHOOK] Atualizando status no banco...');
                const [updateResult] = await db.query(
                    'UPDATE purchases_WED SET payment_status = ?, mercadopago_payment_id = ?, mercadopago_fee = ? WHERE payment_id = ?',
                    [status, mpPaymentId, mpFeeReal, externalRef]
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
                        console.log('📧 [WEBHOOK] Enviando emails...');
                        
                        try {
                            const totalAmount = parseFloat(purchase.total_amount) || 0;
                            const mpFee = parseFloat(purchase.mercadopago_fee) || 0;
                            const adminFee = parseFloat(purchase.admin_fee_amount) || 0;
                            const coupleAmount = parseFloat(purchase.couple_amount) || 0;
                            
                            // Buscar nome da experiência
                            const [experiences] = await db.query(
                                'SELECT title FROM experiences_WED WHERE id = ?',
                                [purchase.experience_id]
                            );
                            const experienceTitle = experiences[0]?.title || 'Presente';
                            
                            // Buscar dados dos noivos e admin
                            const [users] = await db.query(
                                'SELECT name, email, role FROM users_WED WHERE role IN ("couple", "admin")'
                            );
                            const coupleUsers = users.filter(u => u.role === 'couple');
                            const adminUsers = users.filter(u => u.role === 'admin');
                            
                            // Template de email bonito
                            const emailStyle = `
                                <style>
                                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
                                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                                    .content { padding: 40px 30px; }
                                    .gift-box { background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
                                    .amount { font-size: 36px; font-weight: bold; color: #667eea; margin: 10px 0; }
                                    .message-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; font-style: italic; }
                                    .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
                                    .details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
                                    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
                                    .details-row:last-child { border-bottom: none; font-weight: bold; color: #10b981; }
                                    .emoji { font-size: 48px; margin: 20px 0; }
                                </style>
                            `;
                            
                            // 1. EMAIL PARA O CONVIDADO
                            await sendEmail({
                                to: purchase.guest_email,
                                subject: '🎁 Presente Confirmado - Casamento Vanessa & Guilherme',
                                html: `
                                    ${emailStyle}
                                    <div class="container">
                                        <div class="header">
                                            <div class="emoji">🎉</div>
                                            <h1>Presente Confirmado!</h1>
                                        </div>
                                        <div class="content">
                                            <p style="font-size: 18px; color: #374151;">Olá <strong>${purchase.guest_name}</strong>,</p>
                                            <p>Seu presente foi confirmado com sucesso! Vanessa & Guilherme agradecem de coração pela sua generosidade e carinho.</p>
                                            
                                            <div class="gift-box">
                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">PRESENTE SELECIONADO</p>
                                                <h2 style="margin: 10px 0; color: #1f2937;">${experienceTitle}</h2>
                                                <p style="margin: 0; color: #6b7280;">Quantidade: ${purchase.quantity}</p>
                                            </div>
                                            
                                            <div style="text-align: center; margin: 30px 0;">
                                                <p style="margin: 0; color: #6b7280; font-size: 14px;">VALOR DO PRESENTE</p>
                                                <div class="amount">R$ ${totalAmount.toFixed(2)}</div>
                                            </div>
                                            
                                            ${purchase.message ? `
                                                <div class="message-box">
                                                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">SUA MENSAGEM PARA OS NOIVOS:</p>
                                                    <p style="margin: 10px 0 0 0; color: #78350f;">"${purchase.message}"</p>
                                                </div>
                                            ` : ''}
                                            
                                            <p style="color: #6b7280; margin-top: 30px;">O casal receberá uma notificação sobre seu presente e sua mensagem especial.</p>
                                            
                                            <div style="text-align: center; margin: 30px 0;">
                                                <p style="font-size: 24px; margin: 0;">💝</p>
                                                <p style="color: #667eea; font-weight: 600; margin: 10px 0;">Obrigado por fazer parte deste momento especial!</p>
                                            </div>
                                        </div>
                                        <div class="footer">
                                            <p style="margin: 0;">Vanessa & Guilherme</p>
                                            <p style="margin: 5px 0 0 0; font-size: 12px;">❤️ Casamento 2025</p>
                                        </div>
                                    </div>
                                `
                            });
                            console.log('✅ [WEBHOOK] Email enviado para convidado:', purchase.guest_email);
                            
                            // 2. EMAIL PARA OS NOIVOS
                            for (const couple of coupleUsers) {
                                await sendEmail({
                                    to: couple.email,
                                    subject: `🎁 Novo Presente Recebido de ${purchase.guest_name}`,
                                    html: `
                                        ${emailStyle}
                                        <div class="container">
                                            <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                                <div class="emoji">💝</div>
                                                <h1>Vocês receberam um presente!</h1>
                                            </div>
                                            <div class="content">
                                                <p style="font-size: 18px; color: #374151;">Olá <strong>${couple.name}</strong>,</p>
                                                <p>Parabéns! Vocês acabaram de receber um novo presente!</p>
                                                
                                                <div class="gift-box" style="border-left-color: #10b981;">
                                                    <p style="margin: 0; color: #6b7280; font-size: 14px;">PRESENTE</p>
                                                    <h2 style="margin: 10px 0; color: #1f2937;">${experienceTitle}</h2>
                                                    <p style="margin: 5px 0; color: #6b7280;">Quantidade: ${purchase.quantity}</p>
                                                    <p style="margin: 5px 0; color: #6b7280;">De: <strong>${purchase.guest_name}</strong></p>
                                                    <p style="margin: 5px 0; color: #6b7280;">Email: ${purchase.guest_email}</p>
                                                </div>
                                                
                                                <div style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px;">
                                                    <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">💰 VALOR DISPONÍVEL PARA SAQUE</p>
                                                    <div style="font-size: 42px; font-weight: bold; color: #059669; margin: 10px 0;">R$ ${coupleAmount.toFixed(2)}</div>
                                                    <p style="margin: 5px 0 0 0; color: #047857; font-size: 12px;">Taxa administrativa já descontada (${purchase.admin_fee_percentage}%)</p>
                                                </div>
                                                
                                                ${purchase.message ? `
                                                    <div class="message-box">
                                                        <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">💌 MENSAGEM DO CONVIDADO:</p>
                                                        <p style="margin: 10px 0 0 0; color: #78350f; font-size: 16px;">"${purchase.message}"</p>
                                                    </div>
                                                ` : ''}
                                                
                                                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                                                    <p style="margin: 0; font-size: 18px; color: #10b981; font-weight: 600;">🎉 Parabéns pelo novo presente!</p>
                                                    <p style="margin: 10px 0 0 0; color: #059669; font-size: 14px;">Você pode solicitar o saque no painel administrativo.</p>
                                                </div>
                                            </div>
                                            <div class="footer">
                                                <p style="margin: 0;">Sistema de Presentes - Casamento</p>
                                            </div>
                                        </div>
                                    `
                                });
                                console.log('✅ [WEBHOOK] Email enviado para noivo(a):', couple.email);
                            }
                            
                            // 3. EMAIL PARA O ADMIN
                            for (const admin of adminUsers) {
                                const adminProfit = adminFee; // O lucro do admin é a taxa administrativa
                                
                                await sendEmail({
                                    to: admin.email,
                                    subject: `💰 Novo Pagamento - Casamento Vanessa & Guilherme`,
                                    html: `
                                        ${emailStyle}
                                        <div class="container">
                                            <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                                <div class="emoji">💰</div>
                                                <h1>Novo Pagamento Recebido</h1>
                                            </div>
                                            <div class="content">
                                                <p style="font-size: 18px; color: #374151;">Olá <strong>${admin.name}</strong>,</p>
                                                <p>Um novo pagamento para o casamento de <strong>Vanessa & Guilherme</strong> foi recebido com sucesso!</p>
                                                
                                                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #eff6ff; border-radius: 8px;">
                                                    <p style="margin: 0; color: #6b7280; font-size: 14px;">VALOR RECEBIDO</p>
                                                    <div class="amount" style="color: #3b82f6;">R$ ${totalAmount.toFixed(2)}</div>
                                                </div>
                                                
                                                <div class="gift-box" style="border-left-color: #3b82f6;">
                                                    <p style="margin: 0; color: #6b7280; font-size: 14px;">DETALHES DA COMPRA</p>
                                                    <p style="margin: 10px 0 5px 0;"><strong>Presente:</strong> ${experienceTitle}</p>
                                                    <p style="margin: 5px 0;"><strong>Quantidade:</strong> ${purchase.quantity}</p>
                                                    <p style="margin: 5px 0;"><strong>Comprador:</strong> ${purchase.guest_name}</p>
                                                    <p style="margin: 5px 0;"><strong>Email:</strong> ${purchase.guest_email}</p>
                                                </div>
                                                
                                                <div class="details">
                                                    <div class="details-row">
                                                        <span>💰 Valor Total Pago:</span>
                                                        <span style="font-weight: 600;">R$ ${totalAmount.toFixed(2)}</span>
                                                    </div>
                                                    <div class="details-row">
                                                        <span>💳 Taxa MercadoPago:</span>
                                                        <span style="color: #ef4444;">- R$ ${mpFee.toFixed(2)}</span>
                                                    </div>
                                                    <div class="details-row">
                                                        <span>📊 Sua Taxa Administrativa (${purchase.admin_fee_percentage}%):</span>
                                                        <span style="color: #3b82f6; font-weight: 600;">R$ ${adminProfit.toFixed(2)}</span>
                                                    </div>
                                                    <div class="details-row">
                                                        <span>💚 Valor dos Noivos:</span>
                                                        <span style="color: #10b981;">R$ ${coupleAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                
                                                <div style="text-align: center; margin: 30px 0; padding: 20px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 12px;">
                                                    <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: 600;">💵 SEU LUCRO NESTA TRANSAÇÃO</p>
                                                    <div style="font-size: 42px; font-weight: bold; color: #2563eb; margin: 10px 0;">R$ ${adminProfit.toFixed(2)}</div>
                                                    <p style="margin: 5px 0 0 0; color: #1d4ed8; font-size: 12px;">Taxa de ${purchase.admin_fee_percentage}% sobre R$ ${totalAmount.toFixed(2)}</p>
                                                </div>
                                                
                                                <div style="text-align: center; margin: 30px 0;">
                                                    <p style="color: #6b7280; font-size: 14px; margin: 0;">ID do Pagamento MercadoPago</p>
                                                    <p style="color: #3b82f6; font-family: monospace; margin: 5px 0;">#${mpPaymentId}</p>
                                                </div>
                                            </div>
                                            <div class="footer">
                                                <p style="margin: 0;">Sistema Administrativo - Casamentos</p>
                                            </div>
                                        </div>
                                    `
                                });
                                console.log('✅ [WEBHOOK] Email enviado para admin:', admin.email);
                            }
                            
                            console.log('✅ [WEBHOOK] Todos os emails enviados com sucesso!');
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
        const userRole = req.user?.role || 'couple'; // Pega role do usuário autenticado
        
        const [summary] = await db.query(`
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_received,
                COALESCE(SUM(mercadopago_fee), 0) as total_mp_fee,
                COALESCE(SUM(admin_fee_amount), 0) as total_admin_fee,
                COALESCE(SUM(couple_amount), 0) as total_couple_amount,
                COUNT(*) as total_purchases
            FROM purchases_WED
            WHERE payment_status = 'approved'
        `);

        const [withdrawals] = await db.query(`
            SELECT COALESCE(SUM(amount), 0) as total_withdrawn
            FROM withdrawals_WED
            WHERE status = 'approved'
        `);

        const totalWithdrawn = parseFloat(withdrawals[0].total_withdrawn) || 0;
        const totalCoupleAmount = parseFloat(summary[0].total_couple_amount) || 0;
        const availableBalance = totalCoupleAmount - totalWithdrawn;
        const totalReceived = parseFloat(summary[0].total_received) || 0;
        const totalMpFee = parseFloat(summary[0].total_mp_fee) || 0;
        const totalAdminFee = parseFloat(summary[0].total_admin_fee) || 0;

        // Admin vê tudo, incluindo taxa MP e seu lucro
        if (userRole === 'admin') {
            res.json({
                total_received: totalReceived,
                total_mp_fee: totalMpFee,
                total_admin_fee: totalAdminFee, // Lucro do admin
                total_couple_amount: totalCoupleAmount,
                total_withdrawn: totalWithdrawn,
                available_balance: availableBalance,
                total_purchases: parseInt(summary[0].total_purchases) || 0,
                admin_profit: totalAdminFee, // Lucro total do admin
                role: 'admin'
            });
        } else {
            // Noivos veem apenas o saldo disponível (sem detalhes de taxa MP)
            res.json({
                total_received: totalReceived,
                total_couple_amount: totalCoupleAmount,
                total_withdrawn: totalWithdrawn,
                available_balance: availableBalance,
                total_purchases: parseInt(summary[0].total_purchases) || 0,
                role: 'couple'
            });
        }
    } catch (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
    }
};
