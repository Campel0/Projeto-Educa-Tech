const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { checarSeAdmin } = require('../middleware/authMiddleware');

// --- Rotas Públicas ---
router.get('/login', authController.getLoginPage);
router.post('/login', authController.postLogin);
router.get('/logout', authController.getLogout);

// --- Rotas de Admin ---
router.get('/admin', checarSeAdmin, authController.getAdminPage);
router.get('/cadastro', checarSeAdmin, authController.getRegisterPage);
router.post('/cadastro', checarSeAdmin, authController.postRegister);

// Rota para MOSTRAR a lista de todos os alunos
router.get('/admin/alunos', checarSeAdmin, authController.getAlunosPage);

// Rota para MOSTRAR a lista de todos os alunos
router.get('/admin/alunos', checarSeAdmin, authController.getAlunosPage);

// Rota para MOSTRAR o formulário de edição de um aluno
router.get('/admin/aluno/:id/editar', checarSeAdmin, authController.getEditarAlunoPage);

// Rota para PROCESSAR a atualização do aluno
router.post('/admin/aluno/:id/editar', checarSeAdmin, authController.postEditarAluno);

// Rota para PROCESSAR a exclusão do aluno
router.post('/admin/aluno/:id/excluir', checarSeAdmin, authController.postExcluirAluno);

module.exports = router;