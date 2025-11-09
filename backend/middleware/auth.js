const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    next();
};

const coupleOrAdminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'couple') {
        return res.status(403).json({ error: 'Acesso negado.' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, coupleOrAdminMiddleware };
