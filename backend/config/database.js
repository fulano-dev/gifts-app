const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 5, // Reduzido para evitar sobrecarga
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 60000, // 60 segundos
    acquireTimeout: 60000,
    timeout: 60000,
    // Configurações para reconexão
    maxIdle: 10,
    idleTimeout: 60000,
    // SSL se necessário
    ssl: process.env.DB_SSL === 'true' ? {
        rejectUnauthorized: false
    } : false
});

// Testar conexão com retry
const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            const connection = await pool.getConnection();
            console.log('✅ Conectado ao banco de dados MySQL');
            connection.release();
            return true;
        } catch (err) {
            console.error(`❌ Tentativa ${i + 1}/${retries} falhou:`, err.message);
            if (i < retries - 1) {
                console.log('⏳ Aguardando 5 segundos antes de tentar novamente...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    console.error('❌ Não foi possível conectar ao banco de dados após todas as tentativas');
    return false;
};

testConnection();

module.exports = pool;
