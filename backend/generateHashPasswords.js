const bcrypt = require('bcryptjs');

async function generateHashes() {
    const adminHash = await bcrypt.hash('admin123', 10);
    const noivosHash = await bcrypt.hash('noivos123', 10);
    
    console.log('\n=== Hashes gerados ===');
    console.log('Admin (admin123):', adminHash);
    console.log('Noivos (noivos123):', noivosHash);
    console.log('\n');
}

generateHashes();
