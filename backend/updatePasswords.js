const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
    try {
        console.log('🔄 Atualizando senhas dos usuários...\n');

        // Gerar hashes
        const adminHash = await bcrypt.hash('admin123', 10);
        const noivosHash = await bcrypt.hash('noivos123', 10);

        // Atualizar admin
        await db.query(
            "UPDATE users_WED SET password = ? WHERE email = 'admin@casamento.com'",
            [adminHash]
        );
        console.log('✅ Senha do admin atualizada');

        // Atualizar noivos
        await db.query(
            "UPDATE users_WED SET password = ? WHERE email = 'noivos@casamento.com'",
            [noivosHash]
        );
        console.log('✅ Senha dos noivos atualizada');

        console.log('\n✅ Senhas atualizadas com sucesso!');
        console.log('   Admin: admin@casamento.com / admin123');
        console.log('   Noivos: noivos@casamento.com / noivos123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao atualizar senhas:', error.message);
        process.exit(1);
    }
}

updatePasswords();
