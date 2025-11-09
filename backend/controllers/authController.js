const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Buscar usuário
        const [users] = await db.query('SELECT * FROM users_WED WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const user = users[0];

        // Verificar senha
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Gerar token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro ao fazer login' });
    }
};

// Obter perfil do usuário logado
exports.getProfile = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role, pix_key FROM users_WED WHERE id = ?',
            [req.user.id]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
};

// Atualizar perfil
exports.updateProfile = async (req, res) => {
    try {
        const { name, pix_key } = req.body;
        
        await db.query(
            'UPDATE users_WED SET name = ?, pix_key = ? WHERE id = ?',
            [name, pix_key, req.user.id]
        );

        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
};

// Criar usuário (apenas admin)
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Verificar se email já existe
        const [existing] = await db.query('SELECT id FROM users_WED WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Email já cadastrado' });
        }

        // Hash da senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserir usuário
        const [result] = await db.query(
            'INSERT INTO users_WED (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role]
        );

        res.status(201).json({ 
            message: 'Usuário criado com sucesso',
            userId: result.insertId 
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};

// Listar usuários (apenas admin)
exports.listUsers = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, email, role, pix_key, created_at FROM users_WED ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

// Deletar usuário (apenas admin)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Não permitir deletar o próprio usuário
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'Não é possível deletar seu próprio usuário' });
        }

        await db.query('DELETE FROM users_WED WHERE id = ?', [id]);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
};
