// src/routes/authRoutes.js

const express = require('express');
const router = express.Router();

// Importa o "Gerente" (Controller)
const authController = require('../controllers/authController');
// Importa os "Seguranças" (Middleware)
const { checarSeAdmin } = require('../middleware/authMiddleware');

// --- Rotas Públicas (Qualquer um pode acessar) ---
router.get('/login', authController.getLoginPage);
router.post('/login', authController.postLogin);
router.get('/logout', authController.getLogout);

// --- Rotas de Admin (Protegidas pelo 'checarSeAdmin') ---
router.get('/admin', checarSeAdmin, authController.getAdminPage);
router.get('/cadastro', checarSeAdmin, authController.getRegisterPage);
router.post('/cadastro', checarSeAdmin, authController.postRegister);

module.exports = router;