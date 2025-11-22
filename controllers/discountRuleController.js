const DiscountRule = require('../models/DiscountRule');

// Cache simples em memória (em produção, usar Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(productId) {
  return `discount:${productId}`;
}

function setCache(key, value) {
  cache.set(key, {
    value,
    timestamp: Date.now()
  });
}

function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  
  // Verificar TTL
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return cached.value;
}

function invalidateCache(productId) {
  cache.delete(getCacheKey(productId));
}

// Criar nova regra
exports.createRule = async (req, res) => {
  try {
    const { productId, applicableProducts, applyToAll, name, description, tiers, startDate, endDate } = req.body;
    
    // Validar campos obrigatórios
    if (!name || !tiers || tiers.length < 2) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: 'name e pelo menos 2 tiers são obrigatórios'
      });
    }
    
    // Validar que pelo menos uma opção de produto foi fornecida
    if (!productId && (!applicableProducts || applicableProducts.length === 0) && !applyToAll) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: 'Especifique productId, applicableProducts ou applyToAll'
      });
    }
    
    // Criar regra
    const rule = new DiscountRule({
      productId: productId || null,
      applicableProducts: applicableProducts || [],
      applyToAll: applyToAll || false,
      name,
      description,
      tiers,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: true,
      createdBy: req.user?.id || 'admin'
    });
    
    await rule.save();
    
    // Invalidar cache para todos os produtos afetados
    if (applyToAll) {
      cache.clear(); // Limpar todo o cache
    } else if (productId) {
      invalidateCache(productId);
    } else if (applicableProducts) {
      applicableProducts.forEach(id => invalidateCache(id));
    }
    
    res.status(201).json({
      success: true,
      message: 'Regra criada com sucesso',
      rule
    });
  } catch (error) {
    console.error('Erro ao criar regra:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Erro de validação',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao criar regra',
      details: error.message
    });
  }
};

// Listar todas as regras
exports.listRules = async (req, res) => {
  try {
    const { status, productId, page = 1, limit = 50 } = req.query;
    
    // Construir filtro
    const filter = {};
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    if (productId) {
      filter.productId = productId;
    }
    
    // Buscar com paginação
    const skip = (page - 1) * limit;
    const rules = await DiscountRule.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await DiscountRule.countDocuments(filter);
    
    res.json({
      success: true,
      rules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar regras:', error);
    res.status(500).json({ 
      error: 'Erro ao listar regras',
      details: error.message
    });
  }
};

// Obter regra específica
exports.getRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rule = await DiscountRule.findById(id);
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Regra não encontrada'
      });
    }
    
    res.json({
      success: true,
      rule
    });
  } catch (error) {
    console.error('Erro ao obter regra:', error);
    res.status(500).json({ 
      error: 'Erro ao obter regra',
      details: error.message
    });
  }
};

// Obter regra ativa de um produto
exports.getRuleByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Tentar cache primeiro
    const cacheKey = getCacheKey(productId);
    const cached = getCache(cacheKey);
    
    if (cached) {
      return res.json({
        success: true,
        rule: cached,
        cached: true
      });
    }
    
    // Buscar regra ativa (prioridade: específica > array > todos)
    let rule = await DiscountRule.findOne({
      productId,
      isActive: true
    });
    
    // Se não encontrou específica, buscar em applicableProducts
    if (!rule) {
      rule = await DiscountRule.findOne({
        applicableProducts: productId,
        isActive: true
      });
    }
    
    // Se não encontrou, buscar regra global
    if (!rule) {
      rule = await DiscountRule.findOne({
        applyToAll: true,
        isActive: true
      });
    }
    
    if (!rule) {
      return res.json({
        success: true,
        rule: null,
        message: 'Nenhuma regra ativa para este produto'
      });
    }
    
    // Verificar se está no período válido
    if (!rule.isCurrentlyActive()) {
      return res.json({
        success: true,
        rule: null,
        message: 'Regra fora do período de validade'
      });
    }
    
    // Cachear
    setCache(cacheKey, rule);
    
    res.json({
      success: true,
      rule,
      cached: false
    });
  } catch (error) {
    console.error('Erro ao obter regra do produto:', error);
    res.status(500).json({ 
      error: 'Erro ao obter regra do produto',
      details: error.message
    });
  }
};

// Atualizar regra
exports.updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const rule = await DiscountRule.findById(id);
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Regra não encontrada'
      });
    }
    
    // Atualizar campos permitidos
    const allowedUpdates = ['name', 'description', 'tiers', 'isActive', 'startDate', 'endDate'];
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        rule[field] = updates[field];
      }
    });
    
    await rule.save();
    
    // Invalidar cache
    invalidateCache(rule.productId);
    
    res.json({
      success: true,
      message: 'Regra atualizada com sucesso',
      rule
    });
  } catch (error) {
    console.error('Erro ao atualizar regra:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Erro de validação',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Erro ao atualizar regra',
      details: error.message
    });
  }
};

// Deletar regra
exports.deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rule = await DiscountRule.findByIdAndDelete(id);
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Regra não encontrada'
      });
    }
    
    // Invalidar cache
    invalidateCache(rule.productId);
    
    res.json({
      success: true,
      message: 'Regra deletada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar regra:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar regra',
      details: error.message
    });
  }
};

// Calcular desconto
exports.calculateDiscount = async (req, res) => {
  try {
    const { productId, quantity, originalPrice } = req.body;
    
    // Validar entrada
    if (!productId || !quantity || !originalPrice) {
      return res.status(400).json({ 
        error: 'Dados inválidos',
        details: 'productId, quantity e originalPrice são obrigatórios'
      });
    }
    
    if (quantity < 1 || originalPrice <= 0) {
      return res.status(400).json({ 
        error: 'Valores inválidos',
        details: 'quantity deve ser >= 1 e originalPrice deve ser > 0'
      });
    }
    
    // Buscar regra ativa (com cache)
    const cacheKey = getCacheKey(productId);
    let rule = getCache(cacheKey);
    
    if (!rule) {
      rule = await DiscountRule.findOne({
        productId,
        isActive: true
      });
      
      if (rule) {
        setCache(cacheKey, rule);
      }
    }
    
    // Se não tem regra ou não está ativa
    if (!rule || !rule.isCurrentlyActive()) {
      return res.json({
        success: true,
        hasDiscount: false,
        originalPrice,
        finalPrice: originalPrice,
        discountPercent: 0,
        savings: 0,
        message: 'Nenhuma promoção ativa para este produto'
      });
    }
    
    // Calcular desconto
    const result = rule.calculateDiscount(quantity, originalPrice);
    
    res.json({
      success: true,
      ...result,
      rule: {
        id: rule._id,
        name: rule.name,
        description: rule.description,
        allTiers: rule.tiers
      }
    });
  } catch (error) {
    console.error('Erro ao calcular desconto:', error);
    res.status(500).json({ 
      error: 'Erro ao calcular desconto',
      details: error.message
    });
  }
};

// Ativar/Desativar regra
exports.toggleRule = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rule = await DiscountRule.findById(id);
    
    if (!rule) {
      return res.status(404).json({ 
        error: 'Regra não encontrada'
      });
    }
    
    rule.isActive = !rule.isActive;
    await rule.save();
    
    // Invalidar cache
    invalidateCache(rule.productId);
    
    res.json({
      success: true,
      message: `Regra ${rule.isActive ? 'ativada' : 'desativada'} com sucesso`,
      rule
    });
  } catch (error) {
    console.error('Erro ao alternar regra:', error);
    res.status(500).json({ 
      error: 'Erro ao alternar regra',
      details: error.message
    });
  }
};

module.exports = exports;
