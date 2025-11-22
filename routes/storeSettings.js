const express = require('express');
const router = express.Router();
const {
  getStoreSettings,
  updateStoreSettings,
  uploadLogo,
} = require('../controllers/storeSettingsController');

// Rotas públicas
router.get('/:storeId', getStoreSettings);

// Rotas privadas (adicionar autenticação depois)
router.put('/:storeId', updateStoreSettings);
router.post('/:storeId/logo', uploadLogo);

module.exports = router;
