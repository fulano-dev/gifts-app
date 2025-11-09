const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const initDatabase = require('./config/initDatabase');
const db = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuração CORS mais permissiva para produção
const corsOptions = {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
    optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/experiences', require('./routes/experiences'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/withdrawals', require('./routes/withdrawals'));
app.use('/api/settings', require('./routes/settings'));

// Rota de teste
app.get('/', (req, res) => {
    res.json({ 
        message: 'API do Sistema de Convite de Casamento',
        version: '1.0.0',
        status: 'online'
    });
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota de teste de banco de dados
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT 1 as test, NOW() as timestamp');
        res.json({ 
            success: true, 
            message: '✅ Conexão com banco de dados OK',
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: '❌ Erro ao conectar no banco de dados',
            error: error.message,
            code: error.code
        });
    }
});

// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno do servidor' });
});

// Inicializar banco de dados e iniciar servidor
async function startServer() {
    try {
        // Inicializar banco de dados
        await initDatabase();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📍 Acesse: http://localhost:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('❌ Falha ao iniciar o servidor:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
