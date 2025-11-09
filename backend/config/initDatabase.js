const db = require('./database');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    try {
        console.log('🔍 Verificando estrutura do banco de dados...');

        // Verificar se as tabelas existem
        let existingTables = [];
        let needsCreation = false;
        
        try {
            const [tables] = await db.query(`
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = ? 
                AND TABLE_NAME IN ('users_WED', 'guests_WED', 'experiences_WED', 'purchases_WED', 'withdrawals_WED', 'settings_WED')
            `, [process.env.DB_NAME]);

            existingTables = tables.map(t => t.TABLE_NAME);
        } catch (error) {
            console.log('⚠️  Erro ao verificar tabelas, vamos criá-las...');
            needsCreation = true;
        }

        const requiredTables = ['users_WED', 'guests_WED', 'experiences_WED', 'purchases_WED', 'withdrawals_WED', 'settings_WED'];
        const missingTables = requiredTables.filter(t => !existingTables.includes(t));

        if (missingTables.length > 0 || needsCreation) {
            if (missingTables.length > 0) {
                console.log(`⚠️  Tabelas não encontradas: ${missingTables.join(', ')}`);
            }
            console.log('📦 Criando estrutura do banco de dados...');

            // Ler e executar schema.sql
            const schemaPath = path.join(__dirname, '../database/schema.sql');
            let schemaSql = fs.readFileSync(schemaPath, 'utf8');
            
            // Remover comentários de linha única
            schemaSql = schemaSql.replace(/^--.*$/gm, '');
            
            // Dividir por ponto e vírgula, mas só executar comandos CREATE TABLE e INSERT
            const statements = schemaSql
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && 
                       (stmt.toUpperCase().startsWith('CREATE TABLE') || 
                        stmt.toUpperCase().startsWith('INSERT INTO')));

            console.log(`📋 Encontrados ${statements.length} comandos SQL`);

            for (const statement of statements) {
                try {
                    // Extrair o tipo e nome para log
                    let logMsg = 'Executando comando';
                    if (statement.toUpperCase().startsWith('CREATE TABLE')) {
                        const tableNameMatch = statement.match(/CREATE TABLE.*?(\w+_WED)/i);
                        const tableName = tableNameMatch ? tableNameMatch[1] : 'desconhecida';
                        logMsg = `Tabela ${tableName}`;
                    } else if (statement.toUpperCase().startsWith('INSERT INTO')) {
                        const tableNameMatch = statement.match(/INSERT INTO\s+(\w+_WED)/i);
                        const tableName = tableNameMatch ? tableNameMatch[1] : 'desconhecida';
                        logMsg = `Dados em ${tableName}`;
                    }
                    
                    await db.query(statement);
                    console.log(`  ✅ ${logMsg}`);
                } catch (error) {
                    // Ignorar erros de duplicação e tabelas já existentes
                    if (error.message.includes('already exists') || 
                        error.message.includes('Duplicate entry') ||
                        error.message.includes('ON DUPLICATE KEY UPDATE')) {
                        console.log(`  ℹ️  Já existe, pulando`);
                    } else {
                        console.error(`  ❌ Erro:`, error.message);
                        // Não re-lançar erro, apenas logar
                    }
                }
            }

            console.log('✅ Estrutura do banco criada com sucesso!\n');

            // Verificar se há dados de exemplo para inserir
            try {
                const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users_WED');
                const [guestsCount] = await db.query('SELECT COUNT(*) as count FROM guests_WED');
                const [experiencesCount] = await db.query('SELECT COUNT(*) as count FROM experiences_WED');

                if (guestsCount[0].count === 0 || experiencesCount[0].count === 0) {
                    console.log('📝 Inserindo dados de exemplo...');
                    
                    // Ler e executar sample-data.sql
                    const sampleDataPath = path.join(__dirname, '../database/sample-data.sql');
                    
                    if (fs.existsSync(sampleDataPath)) {
                        const sampleDataSql = fs.readFileSync(sampleDataPath, 'utf8');
                        
                        const dataCommands = sampleDataSql
                            .split(';')
                            .map(cmd => cmd.trim())
                            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

                        for (const command of dataCommands) {
                            try {
                                await db.query(command);
                            } catch (error) {
                                console.error('Erro ao inserir dados de exemplo:', error.message);
                            }
                        }

                        console.log('✅ Dados de exemplo inseridos com sucesso!');
                    } else {
                        console.log('ℹ️  Arquivo de dados de exemplo não encontrado.');
                    }
                } else {
                    console.log('ℹ️  Banco já contém dados, pulando inserção de exemplos.');
                }
            } catch (error) {
                console.log('⚠️  Erro ao verificar dados existentes:', error.message);
            }
        } else {
            console.log('✅ Todas as tabelas existem!');
            
            // Verificar se há usuários cadastrados
            const [usersCount] = await db.query('SELECT COUNT(*) as count FROM users_WED');
            if (usersCount[0].count === 0) {
                console.log('⚠️  Nenhum usuário encontrado, criando usuários padrão...');
                
                // Executar apenas os INSERTs de usuários do schema
                const bcrypt = require('bcryptjs');
                const adminPassword = await bcrypt.hash('admin123', 10);
                const couplePassword = await bcrypt.hash('noivos123', 10);
                
                await db.query(
                    "INSERT INTO users_WED (name, email, password, role) VALUES ('Administrador', 'admin@casamento.com', ?, 'admin')",
                    [adminPassword]
                );
                
                await db.query(
                    "INSERT INTO users_WED (name, email, password, role) VALUES ('Vanessa e Guilherme', 'noivos@casamento.com', ?, 'couple')",
                    [couplePassword]
                );
                
                console.log('✅ Usuários padrão criados!');
            }
        }

        console.log('🎉 Banco de dados pronto para uso!\n');
    } catch (error) {
        console.error('❌ Erro ao inicializar banco de dados:', error.message);
        console.error('📝 Detalhes:', error);
        process.exit(1);
    }
}

module.exports = initDatabase;
