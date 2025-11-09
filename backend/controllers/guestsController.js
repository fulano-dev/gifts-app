const db = require('../config/database');

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
        const { guestIds } = req.body;

        if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
            return res.status(400).json({ error: 'IDs de convidados inválidos' });
        }

        // Atualizar confirmação
        const placeholders = guestIds.map(() => '?').join(',');
        await db.query(
            `UPDATE guests_WED SET confirmed = TRUE, confirmed_at = NOW() WHERE id IN (${placeholders})`,
            guestIds
        );

        // Buscar convidados confirmados
        const [guests] = await db.query(
            `SELECT * FROM guests_WED WHERE id IN (${placeholders})`,
            guestIds
        );

        res.json({
            message: 'Presença confirmada com sucesso',
            guests
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
