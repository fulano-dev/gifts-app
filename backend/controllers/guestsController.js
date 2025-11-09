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

        // Enviar email de confirmação
        try {
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6366f1;">Presença Confirmada! 💍</h2>
                    <p>Olá!</p>
                    <p>Sua presença foi confirmada com sucesso para o casamento de <strong>${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}</strong>!</p>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #374151;">Detalhes do Evento</h3>
                        <p style="margin: 10px 0;"><strong>📅 Data:</strong> ${new Date(weddingInfo.wedding_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        <p style="margin: 10px 0;"><strong>🕐 Horário:</strong> ${weddingInfo.wedding_time}</p>
                        <p style="margin: 10px 0;"><strong>📍 Local:</strong> ${weddingInfo.wedding_location}</p>
                    </div>

                    <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0;"><strong>Confirmados:</strong> ${guestNames}</p>
                    </div>

                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin: 30px 0; text-align: center; color: white;">
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

                    <p style="text-align: center; color: #374151; font-size: 16px;">Estamos muito felizes com sua presença!</p>
                    
                    <p style="margin-top: 30px; color: #6b7280; font-size: 14px; text-align: center;">
                        Até breve!<br>
                        <strong>${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}</strong>
                    </p>
                </div>
            `;

            await sendEmail({
                to: email,
                subject: `Confirmação de Presença - Casamento ${weddingInfo.couple_name_1} & ${weddingInfo.couple_name_2}`,
                html: emailHtml
            });

            console.log(`Email de confirmação enviado para: ${email}`);
        } catch (emailError) {
            console.error('Erro ao enviar email:', emailError);
            // Não retornar erro para o usuário, pois a confirmação foi salva
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
