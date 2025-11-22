const express = require('express');
const router = express.Router();
const discountRuleController = require('../controllers/discountRuleController');

// Middleware de autenticação (simplificado - ajustar conforme seu sistema)
const authMiddleware = (req, res, next) => {
  // TODO: Implementar verificação de token JWT
  // Por enquanto, apenas simula usuário autenticado
  req.user = { id: 'admin', role: 'admin' };
  next();
};

// Rotas públicas (app pode acessar)
router.get('/product/:productId', discountRuleController.getRuleByProduct);
router.post('/calculate', discountRuleController.calculateDiscount);

// Rotas protegidas (apenas admin)
router.post('/', authMiddleware, discountRuleController.createRule);
router.get('/', authMiddleware, discountRuleController.listRules);
router.get('/:id', authMiddleware, discountRuleController.getRule);
router.put('/:id', authMiddleware, discountRuleController.updateRule);
router.delete('/:id', authMiddleware, discountRuleController.deleteRule);
router.patch('/:id/toggle', authMiddleware, discountRuleController.toggleRule);

module.exports = router;
