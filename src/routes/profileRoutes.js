// src/routes/profileRoutes.js

const express = require('express');
const router = express.Router();

// Importa o "Gerente" (Controller)
const profileController = require('../controllers/profileController');
// Importa o "Segurança" (Middleware)
const { checarSeLogado } = require('../middleware/authMiddleware');

// Rota de Perfil (Protegida pelo 'checarSeLogado')
// Quando alguém visitar /perfil, o 'checarSeLogado' roda primeiro.
// Se ele deixar, o 'getProfilePage' é chamado.
router.get('/perfil', checarSeLogado, profileController.getProfilePage);

module.exports = router;