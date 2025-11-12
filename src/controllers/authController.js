// src/controllers/authController.js

const db = require('../config/database'); // Importa a conexão do banco
const bcrypt = require('bcrypt'); // Importa o bcrypt
const saltRounds = 10; // Define o "custo" do hash

// 1. MOSTRAR a página de login
const getLoginPage = (req, res) => {
    res.render('login');
};

// 2. PROCESSAR a tentativa de login
const postLogin = async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        // Tenta encontrar como ALUNO
        const queryAluno = 'SELECT * FROM alunos WHERE usuario = ?';
        const [alunos] = await db.query(queryAluno, [usuario]);

        if (alunos.length > 0) {
            const aluno = alunos[0];
            const senhaCorreta = await bcrypt.compare(senha, aluno.senha);

            if (senhaCorreta) {
                req.session.alunoId = aluno.id_aluno;
                req.session.role = 'aluno';
                return res.redirect('/perfil');
            }
        }

        // Tenta como PROFESSOR
        const queryProf = 'SELECT * FROM professores WHERE usuario = ?';
        const [professores] = await db.query(queryProf, [usuario]);

        if (professores.length > 0) {
            const professor = professores[0];
            const senhaCorreta = await bcrypt.compare(senha, professor.senha);

            if (senhaCorreta) {
                req.session.alunoId = professor.id_professor;
                req.session.role = 'professor';
                req.session.isAdmin = professor.is_admin;
                return res.redirect('/admin'); 
            }
        }
        
        // Se falhar em ambos, volta ao login
        console.log('Tentativa de login falhou: usuário ou senha incorretos');
        res.redirect('/login');

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).send('Erro interno do servidor.');
    }
};

// 3. MOSTRAR a página de cadastro (para admins)
const getRegisterPage = (req, res) => {
    res.render('cadastro');
};

// 4. PROCESSAR o novo cadastro de aluno
const postRegister = async (req, res) => {
    const { nome, idade, turma, usuario, senha } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(senha, saltRounds);
        const insertQuery = `
            INSERT INTO alunos 
            (nome, idade, turma, usuario, senha) 
            VALUES (?, ?, ?, ?, ?);
        `;
        
        await db.query(insertQuery, [nome, idade, turma, usuario, hashedPassword]);
        
        // Redireciona o admin de volta para o painel
        res.redirect('/admin');

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).send('Usuário já existe.');
        }
        res.status(500).send('Erro ao cadastrar.');
    }
};

// 5. MOSTRAR o painel de admin
const getAdminPage = (req, res) => {
    res.render('admin');
};

// 6. PROCESSAR o logout
const getLogout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Erro ao fazer logout.');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};

// Exporta todas as funções
module.exports = {
    getLoginPage,
    postLogin,
    getRegisterPage,
    postRegister,
    getAdminPage,
    getLogout
};