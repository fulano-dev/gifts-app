const db = require('../config/database');
const { sendEmail } = require('../services/emailService');

// Solicitar saque
exports.requestWithdrawal = async (req, res) => {
    try {
        const { amount, pix_key } = req.body;

        // Verificar saldo disponível
        const [summary] = await db.query(`
            SELECT SUM(couple_amount) as total_couple_amount
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

        if (amount > availableBalance) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Criar solicitação
        const [result] = await db.query(
            'INSERT INTO withdrawals_WED (user_id, amount, pix_key, status) VALUES (?, ?, ?, "pending")',
            [req.user.id, amount, pix_key]
        );

        const withdrawalId = result.insertId;
        console.log('💰 [WITHDRAWAL] Nova solicitação de saque #', withdrawalId);
        console.log('💰 [WITHDRAWAL] Valor:', amount, 'PIX:', pix_key);

        // Buscar dados do usuário solicitante
        const [users] = await db.query('SELECT name, email FROM users_WED WHERE id = ?', [req.user.id]);
        const requesterName = users[0]?.name || 'Usuário';
        const requesterEmail = users[0]?.email || '';

        // Buscar admins
        const [admins] = await db.query('SELECT name, email FROM users_WED WHERE role = "admin"');

        // Template de email
        const emailStyle = `
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .content { padding: 40px 30px; }
                .amount-box { background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
                .amount { font-size: 48px; font-weight: bold; color: #059669; margin: 10px 0; }
                .info-box { background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px; }
            </style>
        `;

        // 1. EMAIL PARA OS NOIVOS (confirmação)
        try {
            await sendEmail({
                to: requesterEmail,
                subject: '✅ Solicitação de Saque Recebida',
                html: `
                    ${emailStyle}
                    <div class="container">
                        <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                            <div style="font-size: 64px; margin-bottom: 10px;">✅</div>
                            <h1>Solicitação Recebida!</h1>
                        </div>
                        <div class="content">
                            <p style="font-size: 18px; color: #374151;">Olá <strong>${requesterName}</strong>,</p>
                            <p>Sua solicitação de saque foi recebida com sucesso e está sendo analisada.</p>
                            
                            <div class="amount-box">
                                <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">VALOR SOLICITADO</p>
                                <div class="amount">R$ ${parseFloat(amount).toFixed(2)}</div>
                            </div>
                            
                            <div class="info-box">
                                <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">📋 Detalhes do Saque:</p>
                                <p style="margin: 5px 0; color: #6b7280;"><strong>Chave PIX:</strong> ${pix_key}</p>
                                <p style="margin: 5px 0; color: #6b7280;"><strong>ID da Solicitação:</strong> #${withdrawalId}</p>
                                <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> Aguardando aprovação</p>
                            </div>
                            
                            <div class="warning-box">
                                <p style="margin: 0 0 10px 0; color: #92400e; font-weight: 600;">⏱️ Tempo de Processamento</p>
                                <p style="margin: 0; color: #78350f;">
                                    O saque será processado em <strong>até 48 horas úteis</strong>. 
                                    Você receberá um email assim que o valor for transferido para sua conta.
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                                <p style="margin: 0; font-size: 16px; color: #059669;">
                                    💚 Fique tranquilo! Você será notificado por email assim que o saque for processado.
                                </p>
                            </div>
                        </div>
                        <div class="footer">
                            <p style="margin: 0;">Sistema de Presentes - Casamento</p>
                        </div>
                    </div>
                `
            });
            console.log('✅ [WITHDRAWAL] Email enviado para noivo(a):', requesterEmail);
        } catch (emailError) {
            console.error('❌ [WITHDRAWAL] Erro ao enviar email para noivo:', emailError.message);
        }

        // 2. EMAIL PARA OS ADMINS (notificação)
        for (const admin of admins) {
            try {
                await sendEmail({
                    to: admin.email,
                    subject: `🔔 Nova Solicitação de Saque - ${requesterName}`,
                    html: `
                        ${emailStyle}
                        <div class="container">
                            <div class="header" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                                <div style="font-size: 64px; margin-bottom: 10px;">🔔</div>
                                <h1>Nova Solicitação de Saque</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 18px; color: #374151;">Olá <strong>${admin.name}</strong>,</p>
                                <p>Uma nova solicitação de saque foi recebida e aguarda sua aprovação.</p>
                                
                                <div class="amount-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
                                    <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">VALOR SOLICITADO</p>
                                    <div class="amount" style="color: #d97706;">R$ ${parseFloat(amount).toFixed(2)}</div>
                                </div>
                                
                                <div class="info-box" style="border-left-color: #f59e0b;">
                                    <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">👤 Solicitante:</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Nome:</strong> ${requesterName}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Email:</strong> ${requesterEmail}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Chave PIX:</strong> ${pix_key}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>ID:</strong> #${withdrawalId}</p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <p style="color: #6b7280; margin-bottom: 15px;">Acesse o painel administrativo para aprovar ou recusar:</p>
                                    <a href="${process.env.FRONTEND_URL}/painel/saques" 
                                       style="display: inline-block; background: #f59e0b; color: white; padding: 15px 40px; 
                                              text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                        Gerenciar Saques
                                    </a>
                                </div>
                                
                                <div class="warning-box">
                                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                                        ⚠️ <strong>Lembrete:</strong> O prazo de processamento é de até 48 horas úteis após a aprovação.
                                    </p>
                                </div>
                            </div>
                            <div class="footer">
                                <p style="margin: 0;">Sistema Administrativo - Casamentos</p>
                            </div>
                        </div>
                    `
                });
                console.log('✅ [WITHDRAWAL] Email enviado para admin:', admin.email);
            } catch (emailError) {
                console.error('❌ [WITHDRAWAL] Erro ao enviar email para admin:', emailError.message);
            }
        }

        res.status(201).json({
            message: 'Solicitação de saque criada com sucesso',
            withdrawalId
        });
    } catch (error) {
        console.error('Erro ao solicitar saque:', error);
        res.status(500).json({ error: 'Erro ao solicitar saque' });
    }
};

// Listar saques
exports.listWithdrawals = async (req, res) => {
    try {
        const { status } = req.query;
        
        let query = `
            SELECT w.*, u.name as user_name, u.email as user_email
            FROM withdrawals_WED w
            JOIN users_WED u ON w.user_id = u.id
        `;
        let params = [];

        // Se não for admin, mostrar apenas os próprios saques
        if (req.user.role !== 'admin') {
            query += ' WHERE w.user_id = ?';
            params.push(req.user.id);
            
            if (status) {
                query += ' AND w.status = ?';
                params.push(status);
            }
        } else if (status) {
            query += ' WHERE w.status = ?';
            params.push(status);
        }

        query += ' ORDER BY w.requested_at DESC';

        const [withdrawals] = await db.query(query, params);
        res.json(withdrawals);
    } catch (error) {
        console.error('Erro ao listar saques:', error);
        res.status(500).json({ error: 'Erro ao listar saques' });
    }
};

// Processar saque (admin apenas)
exports.processWithdrawal = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        console.log(`💰 [WITHDRAWAL] Processando saque #${id} - Status: ${status}`);

        // Buscar dados do saque
        const [withdrawals] = await db.query(`
            SELECT w.*, u.name as user_name, u.email as user_email
            FROM withdrawals_WED w
            JOIN users_WED u ON w.user_id = u.id
            WHERE w.id = ?
        `, [id]);

        if (withdrawals.length === 0) {
            return res.status(404).json({ error: 'Saque não encontrado' });
        }

        const withdrawal = withdrawals[0];

        // Atualizar status
        await db.query(
            'UPDATE withdrawals_WED SET status = ?, notes = ?, processed_at = NOW(), processed_by = ? WHERE id = ?',
            [status, notes, req.user.id, id]
        );

        console.log(`✅ [WITHDRAWAL] Saque #${id} atualizado para: ${status}`);

        // Template de email
        const emailStyle = `
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .content { padding: 40px 30px; }
                .amount-box { border-radius: 12px; padding: 25px; margin: 20px 0; text-align: center; }
                .amount { font-size: 48px; font-weight: bold; margin: 10px 0; }
                .info-box { background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            </style>
        `;

        // Enviar email para o solicitante
        try {
            if (status === 'approved') {
                // EMAIL DE APROVAÇÃO
                await sendEmail({
                    to: withdrawal.user_email,
                    subject: '✅ Saque Aprovado - Valor Transferido!',
                    html: `
                        ${emailStyle}
                        <div class="container">
                            <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
                                <h1>Saque Aprovado!</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 18px; color: #374151;">Olá <strong>${withdrawal.user_name}</strong>,</p>
                                <p style="font-size: 16px; color: #059669; font-weight: 600;">Ótimas notícias! Seu saque foi aprovado e processado com sucesso! 🎊</p>
                                
                                <div class="amount-box" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);">
                                    <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600;">VALOR TRANSFERIDO</p>
                                    <div class="amount" style="color: #059669;">R$ ${parseFloat(withdrawal.amount).toFixed(2)}</div>
                                </div>
                                
                                <div class="info-box" style="border-left-color: #10b981;">
                                    <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">📋 Detalhes da Transferência:</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Chave PIX:</strong> ${withdrawal.pix_key}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>ID da Solicitação:</strong> #${id}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                                </div>
                                
                                <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
                                    <p style="margin: 0; color: #065f46; font-weight: 600;">💰 O valor já está disponível na sua conta!</p>
                                    <p style="margin: 10px 0 0 0; color: #047857; font-size: 14px;">
                                        Verifique sua conta vinculada à chave PIX informada. Em alguns casos, pode levar alguns minutos para o valor aparecer.
                                    </p>
                                </div>
                                
                                ${notes ? `
                                    <div style="background: #f3f4f6; border-left: 4px solid #6366f1; padding: 15px; margin: 20px 0; border-radius: 8px;">
                                        <p style="margin: 0 0 5px 0; color: #1f2937; font-weight: 600;">📝 Observações:</p>
                                        <p style="margin: 0; color: #6b7280; font-style: italic;">"${notes}"</p>
                                    </div>
                                ` : ''}
                                
                                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f0fdf4; border-radius: 8px;">
                                    <p style="margin: 0; font-size: 18px; color: #059669; font-weight: 600;">
                                        ✅ Transação concluída com sucesso!
                                    </p>
                                </div>
                            </div>
                            <div class="footer">
                                <p style="margin: 0;">Sistema de Presentes - Casamento</p>
                            </div>
                        </div>
                    `
                });
                console.log('✅ [WITHDRAWAL] Email de aprovação enviado para:', withdrawal.user_email);
            } else {
                // EMAIL DE REJEIÇÃO
                await sendEmail({
                    to: withdrawal.user_email,
                    subject: '❌ Solicitação de Saque Recusada',
                    html: `
                        ${emailStyle}
                        <div class="container">
                            <div class="header" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                                <div style="font-size: 64px; margin-bottom: 10px;">❌</div>
                                <h1>Saque Recusado</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 18px; color: #374151;">Olá <strong>${withdrawal.user_name}</strong>,</p>
                                <p>Infelizmente, sua solicitação de saque não pôde ser aprovada.</p>
                                
                                <div class="amount-box" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);">
                                    <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">VALOR SOLICITADO</p>
                                    <div class="amount" style="color: #dc2626;">R$ ${parseFloat(withdrawal.amount).toFixed(2)}</div>
                                </div>
                                
                                <div class="info-box" style="border-left-color: #ef4444;">
                                    <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">📋 Detalhes:</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Chave PIX:</strong> ${withdrawal.pix_key}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>ID da Solicitação:</strong> #${id}</p>
                                    <p style="margin: 5px 0; color: #6b7280;"><strong>Status:</strong> Recusado</p>
                                </div>
                                
                                ${notes ? `
                                    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 8px;">
                                        <p style="margin: 0 0 5px 0; color: #92400e; font-weight: 600;">📝 Motivo da Recusa:</p>
                                        <p style="margin: 0; color: #78350f;">"${notes}"</p>
                                    </div>
                                ` : ''}
                                
                                <div style="text-align: center; margin: 30px 0; padding: 20px; background: #fef2f2; border-radius: 8px;">
                                    <p style="margin: 0 0 10px 0; color: #dc2626; font-weight: 600;">
                                        ℹ️ O que fazer agora?
                                    </p>
                                    <p style="margin: 0; color: #991b1b; font-size: 14px;">
                                        Se tiver dúvidas, entre em contato com o suporte ou faça uma nova solicitação corrigindo as informações.
                                    </p>
                                </div>
                            </div>
                            <div class="footer">
                                <p style="margin: 0;">Sistema de Presentes - Casamento</p>
                            </div>
                        </div>
                    `
                });
                console.log('✅ [WITHDRAWAL] Email de rejeição enviado para:', withdrawal.user_email);
            }
        } catch (emailError) {
            console.error('❌ [WITHDRAWAL] Erro ao enviar email:', emailError.message);
        }

        res.json({ message: 'Saque processado com sucesso' });
    } catch (error) {
        console.error('Erro ao processar saque:', error);
        res.status(500).json({ error: 'Erro ao processar saque' });
    }
};
