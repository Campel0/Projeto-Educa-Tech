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

// 7. MOSTRAR a página de gestão de alunos (NOVO)
const getAlunosPage = async (req, res) => {
    try {
        // Busca todos os alunos, ordenados por nome
        const query = 'SELECT id_aluno, nome, usuario, turma FROM alunos ORDER BY nome';
        const [alunos] = await db.query(query);

        // Renderiza a nova view e passa a lista de alunos
        res.render('adminAlunos', { alunos: alunos });

    } catch (error) {
        console.error('Erro ao buscar lista de alunos:', error);
        res.status(500).send('Erro interno do servidor.');
    }
};

// 8. MOSTRAR a página para editar um aluno
const getEditarAlunoPage = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        
        // Busca o aluno específico no banco
        const query = 'SELECT id_aluno, nome, usuario, turma, idade FROM alunos WHERE id_aluno = ?';
        const [alunos] = await db.query(query, [id]);

        if (alunos.length === 0) {
            return res.status(404).send('Aluno não encontrado.');
        }
        
        // Renderiza a nova view de edição e passa os dados do aluno
        res.render('adminEditarAluno', { aluno: alunos[0] });

    } catch (error) {
        console.error('Erro ao buscar aluno para edição:', error);
        res.status(500).send('Erro interno do servidor.');
    }
};

// 9. PROCESSAR a atualização do aluno
const postEditarAluno = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        // Pega os dados do formulário
        const { nome, usuario, turma, idade, senha } = req.body;

        // Lógica de senha: Só atualiza se uma NOVA senha for digitada
        if (senha && senha.trim() !== '') {
            // Se uma nova senha foi fornecida, hasheia e atualiza
            const hashedPassword = await bcrypt.hash(senha, saltRounds);
            const query = `
                UPDATE alunos 
                SET nome = ?, usuario = ?, turma = ?, idade = ?, senha = ? 
                WHERE id_aluno = ?`;
            await db.query(query, [nome, usuario, turma, idade, hashedPassword, id]);
        
        } else {
            // Se o campo senha veio vazio, NÃO atualiza a senha
            const query = `
                UPDATE alunos 
                SET nome = ?, usuario = ?, turma = ?, idade = ? 
                WHERE id_aluno = ?`;
            await db.query(query, [nome, usuario, turma, idade, id]);
        }
        
        // Redireciona de volta para a lista de alunos
        res.redirect('/admin/alunos');

    } catch (error) {
        console.error('Erro ao atualizar aluno:', error);
        res.status(500).send('Erro interno do servidor.');
    }
};

// 10. PROCESSAR a exclusão do aluno
const postExcluirAluno = async (req, res) => {
    try {
        const { id } = req.params; // Pega o ID da URL
        
        // Deleta o aluno
        // NOTA: Graças ao "ON DELETE CASCADE" no seu SQL,
        // todas as pontuações deste aluno serão deletadas automaticamente.
        const query = 'DELETE FROM alunos WHERE id_aluno = ?';
        await db.query(query, [id]);

        // Redireciona de volta para a lista de alunos
        res.redirect('/admin/alunos');

    } catch (error)
    {
        console.error('Erro ao excluir aluno:', error);
        res.status(500).send('Erro interno do servidor.');
    }
};

module.exports = {
    getLoginPage,
    postLogin,
    getRegisterPage,
    postRegister,
    getAdminPage,
    getLogout,
    getAlunosPage,
    getEditarAlunoPage, 
    postEditarAluno,   
    postExcluirAluno   
};
