const mongoose = require('mongoose');

const discountTierSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: Number.isInteger,
      message: 'Quantidade deve ser um número inteiro'
    }
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 99,
    validate: {
      validator: (value) => value > 0 && value < 100,
      message: 'Desconto deve estar entre 1% e 99%'
    }
  }
}, { _id: true });

const discountRuleSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: false, // Agora é opcional
    index: true
  },
  applicableProducts: {
    type: [String], // Array de IDs de produtos
    default: []
  },
  applyToAll: {
    type: Boolean,
    default: false // Se true, aplica para todos os produtos
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  tiers: {
    type: [discountTierSchema],
    required: true,
    validate: {
      validator: function(tiers) {
        // Mínimo 2 tiers
        if (tiers.length < 2) return false;
        
        // Máximo 10 tiers
        if (tiers.length > 10) return false;
        
        // Ordenar por quantidade
        const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
        
        // Validar progressão
        for (let i = 1; i < sorted.length; i++) {
          // Quantidade deve ser única
          if (sorted[i].quantity === sorted[i-1].quantity) return false;
          
          // Desconto deve aumentar
          if (sorted[i].discountPercent <= sorted[i-1].discountPercent) return false;
        }
        
        return true;
      },
      message: 'Tiers inválidos: devem ter 2-10 níveis com quantidades únicas e descontos crescentes'
    }
  },
  createdBy: {
    type: String,
    required: true
  },
  analytics: {
    views: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Índices compostos para performance
discountRuleSchema.index({ productId: 1, isActive: 1 });
discountRuleSchema.index({ createdAt: -1 });

// Método para verificar se está ativa no momento
discountRuleSchema.methods.isCurrentlyActive = function() {
  if (!this.isActive) return false;
  
  const now = new Date();
  
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  
  return true;
};

// Método para obter tier aplicável
discountRuleSchema.methods.getApplicableTier = function(quantity) {
  const eligibleTiers = this.tiers
    .filter(tier => quantity >= tier.quantity)
    .sort((a, b) => b.quantity - a.quantity);
  
  return eligibleTiers.length > 0 ? eligibleTiers[0] : null;
};

// Método para obter próximo tier
discountRuleSchema.methods.getNextTier = function(currentQuantity) {
  const nextTiers = this.tiers
    .filter(tier => tier.quantity > currentQuantity)
    .sort((a, b) => a.quantity - b.quantity);
  
  return nextTiers.length > 0 ? nextTiers[0] : null;
};

// Método para calcular desconto
discountRuleSchema.methods.calculateDiscount = function(quantity, originalPrice) {
  const tier = this.getApplicableTier(quantity);
  
  if (!tier) {
    return {
      hasDiscount: false,
      originalPrice,
      finalPrice: originalPrice,
      discountPercent: 0,
      savings: 0,
      nextTier: this.tiers.sort((a, b) => a.quantity - b.quantity)[0]
    };
  }
  
  const discountAmount = originalPrice * (tier.discountPercent / 100);
  const finalPrice = Math.round((originalPrice - discountAmount) * 100) / 100;
  const nextTier = this.getNextTier(quantity);
  
  return {
    hasDiscount: true,
    originalPrice,
    finalPrice,
    discountPercent: tier.discountPercent,
    savings: Math.round(discountAmount * 100) / 100,
    currentTier: tier,
    nextTier
  };
};

// Middleware para ordenar tiers antes de salvar
discountRuleSchema.pre('save', function(next) {
  if (this.tiers && this.tiers.length > 0) {
    this.tiers.sort((a, b) => a.quantity - b.quantity);
  }
  next();
});

const DiscountRule = mongoose.model('DiscountRule', discountRuleSchema);

module.exports = DiscountRule;
