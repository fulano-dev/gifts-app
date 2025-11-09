const db = require('../config/database');

// Listar experiências ativas
exports.listExperiences = async (req, res) => {
    try {
        const { active } = req.query;
        let query = 'SELECT * FROM experiences_WED';
        let params = [];

        if (active !== undefined) {
            query += ' WHERE active = ?';
            params.push(active === 'true' ? 1 : 0);
        }

        query += ' ORDER BY created_at DESC';

        const [experiences] = await db.query(query, params);
        res.json(experiences);
    } catch (error) {
        console.error('Erro ao listar experiências:', error);
        res.status(500).json({ error: 'Erro ao listar experiências' });
    }
};

// Buscar experiência por ID
exports.getExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const [experiences] = await db.query('SELECT * FROM experiences_WED WHERE id = ?', [id]);
        
        if (experiences.length === 0) {
            return res.status(404).json({ error: 'Experiência não encontrada' });
        }

        res.json(experiences[0]);
    } catch (error) {
        console.error('Erro ao buscar experiência:', error);
        res.status(500).json({ error: 'Erro ao buscar experiência' });
    }
};

// Criar experiência
exports.createExperience = async (req, res) => {
    try {
        const { title, description, image_url, price, total_quotas } = req.body;

        const [result] = await db.query(
            'INSERT INTO experiences_WED (title, description, image_url, price, total_quotas, available_quotas) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description, image_url, price, total_quotas, total_quotas]
        );

        res.status(201).json({
            message: 'Experiência criada com sucesso',
            experienceId: result.insertId
        });
    } catch (error) {
        console.error('Erro ao criar experiência:', error);
        res.status(500).json({ error: 'Erro ao criar experiência' });
    }
};

// Atualizar experiência
exports.updateExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, image_url, price, total_quotas, available_quotas, active } = req.body;

        await db.query(
            'UPDATE experiences_WED SET title = ?, description = ?, image_url = ?, price = ?, total_quotas = ?, available_quotas = ?, active = ? WHERE id = ?',
            [title, description, image_url, price, total_quotas, available_quotas, active, id]
        );

        res.json({ message: 'Experiência atualizada com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar experiência:', error);
        res.status(500).json({ error: 'Erro ao atualizar experiência' });
    }
};

// Deletar experiência
exports.deleteExperience = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar se existem compras relacionadas
        const [purchases] = await db.query('SELECT COUNT(*) as count FROM purchases WHERE experience_id = ?', [id]);
        
        if (purchases[0].count > 0) {
            return res.status(400).json({ error: 'Não é possível deletar uma experiência com compras associadas' });
        }

        await db.query('DELETE FROM experiences_WED_WED WHERE id = ?', [id]);
        res.json({ message: 'Experiência deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar experiência:', error);
        res.status(500).json({ error: 'Erro ao deletar experiência' });
    }
};
