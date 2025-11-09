const bcrypt = require('bcryptjs');

// Script para gerar hash de senha
// Uso: node generatePassword.js sua-senha

const password = process.argv[2];

if (!password) {
    console.log('❌ Por favor, forneça uma senha como argumento');
    console.log('Uso: node generatePassword.js sua-senha');
    process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);

console.log('\n✅ Senha hasheada com sucesso!');
console.log('\nSenha original:', password);
console.log('Hash gerado:', hash);
console.log('\nUse este hash no SQL para inserir/atualizar senhas no banco de dados.\n');
