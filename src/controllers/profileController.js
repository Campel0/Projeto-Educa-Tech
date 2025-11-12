const db = require('../config/database');

// 1. MOSTRAR a página de perfil
const getProfilePage = async (req, res) => {
    const userId = req.session.alunoId; 

    try {
        const query = `
            SELECT 
                a.nome AS username, a.idade, a.turma, a.descricao, a.avatar,
                COALESCE(SUM(p.pontos), 0) AS total_pontos,
                COALESCE(COUNT(DISTINCT p.id_jogo), 0) AS total_jogos
            FROM alunos AS a
            LEFT JOIN pontuacoes AS p ON a.id_aluno = p.id_aluno
            WHERE a.id_aluno = ?
            GROUP BY a.id_aluno;
        `;

        const [rows] = await db.query(query, [userId]);
        
        if (rows.length === 0) {
            req.session.destroy();
            return res.redirect('/login');
        }

        const dadosDoUsuario = rows[0];
        const level = Math.floor(dadosDoUsuario.total_pontos / 500) + 1;

        // --- LÓGICA DO AVATAR ---
        // Pega a "semente" do avatar (ex: 'a1b2c3d') ou usa o username se não houver
        const avatarSeed = dadosDoUsuario.avatar || dadosDoUsuario.username;
        // Monta a URL completa do avatar
        const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;
        // --- FIM DA LÓGICA DO AVATAR ---

        const profileData = {
            username: dadosDoUsuario.username,
            idade: dadosDoUsuario.idade,
            turma: dadosDoUsuario.turma,
            descricao: dadosDoUsuario.descricao || '',
            avatarUrl: avatarUrl, // 👈 Enviamos a URL completa para o EJS
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

/**
 * 2. PROCESSAR a atualização da descrição
 */
const updateProfile = async (req, res) => {
    // Pega o ID do aluno da sessão (seguro)
    const userId = req.session.alunoId;
    // Pega a nova descrição do formulário
    const { descricao } = req.body;

    try {
        // Atualiza o banco de dados
        const updateQuery = 'UPDATE alunos SET descricao = ? WHERE id_aluno = ?';
        await db.query(updateQuery, [descricao, userId]);
        
        // Redireciona de volta para o perfil para ver a mudança
        res.redirect('/perfil');

    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).send('Erro ao salvar alterações.');
    }
};

/**
 * 3. PROCESSAR a troca de avatar
 */
const updateAvatar = async (req, res) => {
    const userId = req.session.alunoId;

    // Gera uma "semente" aleatória (ex: "kfr83j")
    const newSeed = Math.random().toString(36).substring(2, 10);

    try {
        // Salva a nova semente no banco
        const updateQuery = 'UPDATE alunos SET avatar = ? WHERE id_aluno = ?';
        await db.query(updateQuery, [newSeed, userId]);
        
        // Redireciona de volta para o perfil para ver o novo avatar
        res.redirect('/perfil');

    } catch (error) {
        console.error('Erro ao atualizar avatar:', error);
        res.status(500).send('Erro ao salvar alterações.');
    }
};

// Exporta tudo
module.exports = {
    getProfilePage,
    updateProfile,
    updateAvatar
};