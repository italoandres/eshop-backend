const mongoose = require('mongoose');

const priceTagSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ex: "Preço Normal", "Promoção"
  price: { type: Number, required: true }
});

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }
});

const shippingInfoSchema = new mongoose.Schema({
  isFree: { type: Boolean, default: false },
  shippingCost: { type: Number, default: 0 },
  estimatedDeliveryStart: { type: Date },
  estimatedDeliveryEnd: { type: Date }
});

const promotionSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  description: { type: String },
  minPurchase: { type: Number },
  discount: { type: Number }
});

// Nova estrutura de variações
const variantImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  isCover: { type: Boolean, default: false }
});

const variantSizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  sku: { type: String, required: true },
  ean: { type: String },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  images: [variantImageSchema],
  sizes: [variantSizeSchema]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  
  // Estrutura antiga (compatibilidade)
  priceTags: [priceTagSchema],
  categories: [categorySchema],
  images: [{ type: String }],
  
  // Nova estrutura de variações
  availableSizes: [{ type: String }],
  variants: [variantSchema],
  
  // Campos para tela de detalhes
  originalPrice: { type: Number },
  discountPercentage: { type: Number },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  soldCount: { type: Number, default: 0 },
  shippingInfo: shippingInfoSchema,
  activePromotion: promotionSchema,
  
  // Peso e dimensões para cálculo de frete
  weight: { type: Number }, // em kg
  dimensions: {
    length: { type: Number }, // em cm
    width: { type: Number }, // em cm
    height: { type: Number } // em cm
  },
  
  // Seções onde o produto deve ser destacado
  featuredSections: {
    highlights: { type: Boolean, default: false }, // Destaques
    newArrivals: { type: Boolean, default: false }, // Lançamentos
    offers: { type: Boolean, default: false }, // Ofertas
    main: { type: Boolean, default: false } // Principal
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware para atualizar updatedAt
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para converter variantes para formato antigo (compatibilidade)
productSchema.methods.toCompatibleFormat = function() {
  const product = this.toObject();
  
  // Se tem variantes, converte para formato antigo
  if (product.variants && product.variants.length > 0) {
    // Pega a primeira imagem de capa de qualquer variante
    const coverImage = product.variants
      .flatMap(v => v.images)
      .find(img => img.isCover);
    
    // Se não tem images antigas, usa as das variantes
    if (!product.images || product.images.length === 0) {
      product.images = product.variants
        .flatMap(v => v.images.map(img => img.url));
    }
    
    // Se não tem priceTags antigos, cria a partir das variantes
    if (!product.priceTags || product.priceTags.length === 0) {
      const allPrices = product.variants.flatMap(v => 
        v.sizes.map(s => ({ name: `${v.color} - ${s.size}`, price: s.price }))
      );
      
      // Pega o menor e maior preço
      if (allPrices.length > 0) {
        const minPrice = Math.min(...allPrices.map(p => p.price));
        const maxPrice = Math.max(...allPrices.map(p => p.price));
        
        if (minPrice === maxPrice) {
          product.priceTags = [{ name: 'Preço', price: minPrice }];
        } else {
          product.priceTags = [
            { name: 'A partir de', price: minPrice },
            { name: 'Até', price: maxPrice }
          ];
        }
      }
    }
    
    // Se não tem categories, cria uma padrão
    if (!product.categories || product.categories.length === 0) {
      product.categories = [];
    }
  }
  
  return product;
};

module.exports = mongoose.model('Product', productSchema);
