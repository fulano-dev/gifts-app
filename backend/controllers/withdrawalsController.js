const db = require('../config/database');

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

        res.status(201).json({
            message: 'Solicitação de saque criada com sucesso',
            withdrawalId: result.insertId
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

        await db.query(
            'UPDATE withdrawals_WED SET status = ?, notes = ?, processed_at = NOW(), processed_by = ? WHERE id = ?',
            [status, notes, req.user.id, id]
        );

        res.json({ message: 'Saque processado com sucesso' });
    } catch (error) {
        console.error('Erro ao processar saque:', error);
        res.status(500).json({ error: 'Erro ao processar saque' });
    }
};
