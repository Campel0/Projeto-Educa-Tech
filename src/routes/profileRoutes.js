const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { checarSeLogado } = require('../middleware/authMiddleware');

// Rota para MOSTRAR o perfil (a que já tínhamos)
router.get('/perfil', checarSeLogado, profileController.getProfilePage);

// Rota para PROCESSAR a atualização da descrição
router.post('/perfil/atualizar', checarSeLogado, profileController.updateProfile);

// Rota para GERAR um novo avatar aleatório
router.get('/perfil/novo-avatar', checarSeLogado, profileController.updateAvatar);

// 👆 FIM DAS ROTAS 👆
// -----------------------------------------------------------------

module.exports = router;