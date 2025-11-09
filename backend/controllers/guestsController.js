const db = require('../config/database');
const { sendEmail } = require('../services/emailService');

// Listar convidados com busca
exports.listGuests = async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM guests_WED';
        let params = [];

        if (search) {
            query += ' WHERE name LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY name ASC';

        const [guests] = await db.query(query, params);
        res.json(guests);
    } catch (error) {
        console.error('Erro ao listar convidados:', error);
        res.status(500).json({ error: 'Erro ao listar convidados' });
    }
};

// Buscar convidado por ID
exports.getGuest = async (req, res) => {
    try {
        const { id } = req.params;
        const [guests] = await db.query('SELECT * FROM guests_WED WHERE id = ?', [id]);
        
        if (guests.length === 0) {
            return res.status(404).json({ error: 'Convidado não encontrado' });
        }

        res.json(guests[0]);
    } catch (error) {
        console.error('Erro ao buscar convidado:', error);
        res.status(500).json({ error: 'Erro ao buscar convidado' });
    }
};

// Criar convidado
exports.createGuest = async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        const [result] = await db.query(
            'INSERT INTO guests_WED (name, email, phone) VALUES (?, ?, ?)',
            [name, email, phone]
        );

        res.status(201).json({
            message: 'Convidado criado com sucesso',
            guestId: result.insertId
        });
    } catch (error) {
        console.error('Erro ao criar convidado:', error);
        res.status(500).json({ error: 'Erro ao criar convidado' });
    }
};

// Atualizar convidado
exports.updateGuest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phone, confirmed } = req.body;

        await db.query(
            'UPDATE guests_WED SET name = ?, email = ?, phone = ?, confirmed = ? WHERE id = ?',
            [name, email, phone, confirmed, id]
        );

        res.json({ message: 'Convidado atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar convidado:', error);
        res.status(500).json({ error: 'Erro ao atualizar convidado' });
    }
};

// Deletar convidado
exports.deleteGuest = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM guests_WED_WED WHERE id = ?', [id]);
        res.json({ message: 'Convidado deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar convidado:', error);
        res.status(500).json({ error: 'Erro ao deletar convidado' });
    }
};

// Confirmar presença (público)
exports.confirmPresence = async (req, res) => {
    try {
        const { guestIds, email } = req.body;

        if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
            return res.status(400).json({ error: 'IDs de convidados inválidos' });
        }

        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Email válido é obrigatório' });
        }

        // Atualizar confirmação e email dos convidados
        const placeholders = guestIds.map(() => '?').join(',');
        
        // Atualizar cada convidado com o email fornecido
        for (const guestId of guestIds) {
            await db.query(
                `UPDATE guests_WED SET confirmed = TRUE, confirmed_at = NOW(), email = ? WHERE id = ?`,
                [email, guestId]
            );
        }

        // Buscar convidados confirmados
        const [guests] = await db.query(
            `SELECT * FROM guests_WED WHERE id IN (${placeholders})`,
            guestIds
        );

        // Buscar informações do casamento
        const [settings] = await db.query('SELECT * FROM settings_WED');
        const weddingInfo = {};
        settings.forEach(s => {
            weddingInfo[s.setting_key] = s.setting_value;
        });

        // Preparar lista de nomes dos convidados
        const guestNames = guests.map(g => g.name).join(', ');
        const guestCount = guests.length;

        console.log(`✅ [CONFIRMATION] ${guestCount} convidado(s) confirmaram presença:`, guestNames);

        // Template de email
        const emailStyle = `
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                .content { padding: 40px 30px; }
                .info-box { background: #f3f4f6; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
                .highlight-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; color: white; }
            </style>
        `;

        // 1. EMAIL PARA O CONVIDADO
        try {
            const emailHtml = `
                ${emailStyle}
                <div class="container">
                    <div class="header">
                        <div style="font-size: 64px; margin-bottom: 10px;">💍</div>
                        <h1>Presença Confirmada!</h1>
                    </div>
                    <div class="content">
                        <p style="font-size: 18px; color: #374151;">Olá!</p>
                        <p>Sua presença foi confirmada com sucesso para o casamento de <strong>${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}</strong>!</p>
                        
                        <div class="info-box">
                            <h3 style="margin-top: 0; color: #374151;">📅 Detalhes do Evento</h3>
                            <p style="margin: 10px 0;"><strong>Data:</strong> ${new Date(weddingInfo.wedding_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            <p style="margin: 10px 0;"><strong>Horário:</strong> ${weddingInfo.wedding_time}</p>
                            <p style="margin: 10px 0;"><strong>Local:</strong> ${weddingInfo.wedding_location}</p>
                        </div>

                        <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; color: #1e40af;"><strong>Confirmados:</strong> ${guestNames}</p>
                        </div>

                        <div class="highlight-box">
                            <h3 style="margin: 0 0 15px 0; font-size: 24px;">🎁 Lista de Presentes Online</h3>
                            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
                                Quer nos presentear? Agora ficou mais fácil!<br>
                                <strong>Compre seu presente diretamente pelo convite digital</strong> com pagamento 100% seguro via MercadoPago.
                            </p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/presentes" 
                               style="display: inline-block; background: white; color: #667eea; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-top: 10px;">
                                ✨ Ver Lista de Presentes
                            </a>
                            <p style="margin: 20px 0 0 0; font-size: 14px; opacity: 0.9;">
                                Escolha experiências incríveis para nossa lua de mel!
                            </p>
                        </div>

                        <p style="text-align: center; color: #374151; font-size: 16px; margin-top: 30px;">
                            ❤️ Estamos muito felizes com sua presença!
                        </p>
                    </div>
                    <div class="footer">
                        <p style="margin: 0;">Até breve!</p>
                        <p style="margin: 5px 0 0 0; font-weight: 600;">${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}</p>
                    </div>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: `Confirmação de Presença - Casamento ${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}`,
                html: emailHtml
            });

            console.log(`✅ [CONFIRMATION] Email enviado para convidado: ${email}`);
        } catch (emailError) {
            console.error('❌ [CONFIRMATION] Erro ao enviar email para convidado:', emailError.message);
        }

        // 2. BUSCAR NOIVOS E ADMIN
        const [users] = await db.query('SELECT name, email, role FROM users_WED WHERE role IN ("couple", "admin")');
        const coupleUsers = users.filter(u => u.role === 'couple');
        const adminUsers = users.filter(u => u.role === 'admin');

        console.log(`📧 [CONFIRMATION] Encontrados ${coupleUsers.length} noivo(s) e ${adminUsers.length} admin(s)`);

        // 3. EMAIL PARA OS NOIVOS
        for (const couple of coupleUsers) {
            try {
                console.log(`📤 [CONFIRMATION] Enviando email para noivo(a): ${couple.email}`);
                await sendEmail({
                    to: couple.email,
                    subject: `🎉 ${guestCount} ${guestCount === 1 ? 'pessoa confirmou' : 'pessoas confirmaram'} presença no seu casamento!`,
                    html: `
                        ${emailStyle}
                        <div class="container">
                            <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
                                <h1>Nova Confirmação!</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 18px; color: #374151;">Olá <strong>${couple.name}</strong>,</p>
                                <p style="font-size: 16px; color: #059669; font-weight: 600;">
                                    ${guestCount === 1 ? 'Uma pessoa confirmou' : `${guestCount} pessoas confirmaram`} presença no seu casamento! 🥳
                                </p>
                                
                                <div class="info-box" style="border-left-color: #10b981;">
                                    <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">
                                        👥 ${guestCount === 1 ? 'Convidado Confirmado:' : 'Convidados Confirmados:'}
                                    </p>
                                    <p style="margin: 0; color: #059669; font-size: 18px; font-weight: 600;">
                                        ${guestNames}
                                    </p>
                                </div>

                                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0 0 5px 0; color: #1e40af;"><strong>📧 Email:</strong> ${email}</p>
                                    <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 14px;">
                                        ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0; padding: 25px; background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 12px;">
                                    <p style="margin: 0; font-size: 20px; color: #065f46; font-weight: 600;">
                                        💚 Mais uma confirmação para o grande dia!
                                    </p>
                                </div>
                            </div>
                            <div class="footer">
                                <p style="margin: 0;">Sistema de Presentes - Casamento</p>
                            </div>
                        </div>
                    `
                });
                console.log(`✅ [CONFIRMATION] Email enviado para noivo(a): ${couple.email}`);
            } catch (emailError) {
                console.error(`❌ [CONFIRMATION] Erro ao enviar email para noivo: ${emailError.message}`);
            }
        }

        // 4. EMAIL PARA O ADMIN
        for (const admin of adminUsers) {
            try {
                console.log(`📤 [CONFIRMATION] Enviando email para admin: ${admin.email}`);
                await sendEmail({
                    to: admin.email,
                    subject: `📋 Confirmação de Presença - Casamento ${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}`,
                    html: `
                        ${emailStyle}
                        <div class="container">
                            <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                                <div style="font-size: 64px; margin-bottom: 10px;">📋</div>
                                <h1>Nova Confirmação</h1>
                            </div>
                            <div class="content">
                                <p style="font-size: 18px; color: #374151;">Olá <strong>${admin.name}</strong>,</p>
                                <p>
                                    ${guestCount === 1 ? 'Um convidado confirmou' : `${guestCount} convidados confirmaram`} presença no 
                                    casamento de <strong>${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}</strong>.
                                </p>
                                
                                <div class="info-box" style="border-left-color: #3b82f6;">
                                    <p style="margin: 0 0 10px 0; color: #1f2937; font-weight: 600;">
                                        👥 ${guestCount === 1 ? 'Convidado:' : 'Convidados:'}
                                    </p>
                                    <p style="margin: 0 0 15px 0; color: #3b82f6; font-size: 18px; font-weight: 600;">
                                        ${guestNames}
                                    </p>
                                    <p style="margin: 10px 0 0 0; color: #6b7280;">
                                        <strong>Email:</strong> ${email}
                                    </p>
                                </div>

                                <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 0 0 5px 0; color: #1e40af; font-weight: 600;">🎊 Evento:</p>
                                    <p style="margin: 5px 0; color: #6b7280;">
                                        ${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}
                                    </p>
                                    <p style="margin: 5px 0; color: #6b7280;">
                                        ${new Date(weddingInfo.wedding_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} 
                                        às ${weddingInfo.wedding_time}
                                    </p>
                                </div>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/painel/convidados" 
                                       style="display: inline-block; background: #3b82f6; color: white; padding: 15px 40px; 
                                              text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                        Ver Lista de Convidados
                                    </a>
                                </div>
                            </div>
                            <div class="footer">
                                <p style="margin: 0;">Sistema Administrativo - Casamentos</p>
                            </div>
                        </div>
                    `
                });
                console.log(`✅ [CONFIRMATION] Email enviado para admin: ${admin.email}`);
            } catch (emailError) {
                console.error(`❌ [CONFIRMATION] Erro ao enviar email para admin: ${emailError.message}`);
            }
        }

        res.json({
            message: 'Presença confirmada com sucesso',
            guests,
            emailSent: true
        });
    } catch (error) {
        console.error('Erro ao confirmar presença:', error);
        res.status(500).json({ error: 'Erro ao confirmar presença' });
    }
};

// Listar convidados confirmados
exports.listConfirmedGuests = async (req, res) => {
    try {
        const [guests] = await db.query(
            'SELECT * FROM guests_WED WHERE confirmed = TRUE ORDER BY confirmed_at DESC'
        );
        res.json(guests);
    } catch (error) {
        console.error('Erro ao listar convidados confirmados:', error);
        res.status(500).json({ error: 'Erro ao listar convidados confirmados' });
    }
};
