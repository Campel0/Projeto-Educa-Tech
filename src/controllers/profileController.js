// src/controllers/profileController.js

const db = require('../config/database'); // Importa a conexão do banco

// 1. MOSTRAR a página de perfil
const getProfilePage = async (req, res) => {
    
    // Pega o ID do "crachá" (sessão)
    const userId = req.session.alunoId; 

    try {
        // Query que busca TUDO sobre o aluno
        const query = `
            SELECT 
                a.nome AS username,
                a.idade,
                a.turma,
                a.descricao,
                a.avatar,
                COALESCE(SUM(p.pontos), 0) AS total_pontos,
                COALESCE(COUNT(DISTINCT p.id_jogo), 0) AS total_jogos
            FROM 
                alunos AS a
            LEFT JOIN 
                pontuacoes AS p ON a.id_aluno = p.id_aluno
            WHERE 
                a.id_aluno = ?
            GROUP BY
                a.id_aluno, a.nome, a.idade, a.turma, a.descricao, a.avatar;
        `;

        const [rows] = await db.query(query, [userId]);
        
        if (rows.length === 0) {
            req.session.destroy(); // Limpa sessão inválida
            return res.redirect('/login');
        }

        const dadosDoUsuario = rows[0];
        const level = Math.floor(dadosDoUsuario.total_pontos / 500) + 1;

        // Envia todos os dados para o EJS
        const profileData = {
            username: dadosDoUsuario.username,
            idade: dadosDoUsuario.idade,
            turma: dadosDoUsuario.turma,
            descricao: dadosDoUsuario.descricao || '', // Garante que não seja 'null'
            avatar: dadosDoUsuario.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${dadosDoUsuario.username}`, 
            points: dadosDoUsuario.total_pontos,
            level: level, 
            games: dadosDoUsuario.total_jogos
        };

        res.render('profile', profileData);

    } catch (error) {
        console.error('Erro ao buscar dados do perfil:', error);
        res.status(500).send('Erro interno do servidor ao carregar o perfil.');
    }
};

// Exporta a função
module.exports = {
    getProfilePage
};