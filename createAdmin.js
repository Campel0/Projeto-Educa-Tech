// createAdmin.js
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Defina aqui o usuário e a senha que você quer
const adminUser = 'admin';
const adminPassword = 'admin123'; // Mude se quiser

async function hashPassword() {
    try {
        const hash = await bcrypt.hash(adminPassword, saltRounds);
        
        console.log('--- Script para Criar Admin ---');
        console.log('Usuário:', adminUser);
        console.log('Senha Pura:', adminPassword);
        console.log('Senha Hasheada (para o SQL):', hash);
        console.log('\nCopie o comando SQL abaixo e rode no seu MySQL Workbench:');
        
        // Gera o comando SQL completo
        console.log(`
INSERT INTO professores 
(nome, usuario, senha, is_admin) 
VALUES 
('Professor Admin', '${adminUser}', '${hash}', TRUE);
        `);

    } catch (err) {
        console.error('Erro ao gerar hash:', err);
    }
}

hashPassword();