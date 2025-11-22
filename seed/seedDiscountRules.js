require('dotenv').config();
const mongoose = require('mongoose');
const DiscountRule = require('../models/DiscountRule');

const sampleRules = [
  {
    productId: 'product-1',
    name: 'Desconto Progressivo - Fone Bluetooth',
    description: 'Quanto mais você compra, mais desconto você ganha!',
    isActive: true,
    tiers: [
      { quantity: 1, discountPercent: 25 },
      { quantity: 2, discountPercent: 40 },
      { quantity: 3, discountPercent: 68 }
    ],
    createdBy: 'admin',
    analytics: {
      views: 0,
      conversions: 0,
      revenue: 0
    }
  },
  {
    productId: 'product-2',
    name: 'Promoção Relâmpago - Camiseta',
    description: 'Compre mais e economize muito!',
    isActive: true,
    tiers: [
      { quantity: 2, discountPercent: 15 },
      { quantity: 4, discountPercent: 30 },
      { quantity: 6, discountPercent: 50 }
    ],
    createdBy: 'admin',
    analytics: {
      views: 0,
      conversions: 0,
      revenue: 0
    }
  },
  {
    productId: 'product-3',
    name: 'Black Friday - Tênis Esportivo',
    description: 'Desconto especial para compras em quantidade!',
    isActive: false, // Inativa para teste
    tiers: [
      { quantity: 1, discountPercent: 10 },
      { quantity: 2, discountPercent: 20 },
      { quantity: 3, discountPercent: 35 },
      { quantity: 5, discountPercent: 50 }
    ],
    createdBy: 'admin',
    analytics: {
      views: 0,
      conversions: 0,
      revenue: 0
    }
  }
];

async function seedDiscountRules() {
  try {
    console.log('🌱 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado ao MongoDB');

    console.log('🗑️  Limpando regras existentes...');
    await DiscountRule.deleteMany({});
    console.log('✅ Regras limpas');

    console.log('📝 Criando regras de exemplo...');
    const created = await DiscountRule.insertMany(sampleRules);
    console.log(`✅ ${created.length} regras criadas com sucesso!`);

    console.log('\n📊 Regras criadas:');
    created.forEach((rule, index) => {
      console.log(`\n${index + 1}. ${rule.name}`);
      console.log(`   Produto: ${rule.productId}`);
      console.log(`   Status: ${rule.isActive ? '🟢 Ativa' : '🔴 Inativa'}`);
      console.log(`   Tiers:`);
      rule.tiers.forEach(tier => {
        console.log(`     - ${tier.quantity} unidade(s) = ${tier.discountPercent}% OFF`);
      });
    });

    console.log('\n🎉 Seed concluído com sucesso!');
    
    // Testar cálculo
    console.log('\n🧪 Testando cálculo de desconto...');
    const testRule = created[0];
    const testPrice = 50.00;
    
    console.log(`\nProduto: ${testRule.name}`);
    console.log(`Preço original: R$ ${testPrice.toFixed(2)}`);
    
    [1, 2, 3, 4].forEach(qty => {
      const result = testRule.calculateDiscount(qty, testPrice);
      console.log(`\n${qty} unidade(s):`);
      console.log(`  Desconto: ${result.discountPercent}%`);
      console.log(`  Preço final: R$ ${result.finalPrice.toFixed(2)}`);
      console.log(`  Economia: R$ ${result.savings.toFixed(2)}`);
      if (result.nextTier) {
        console.log(`  Próximo tier: ${result.nextTier.quantity} unidades = ${result.nextTier.discountPercent}%`);
      } else {
        console.log(`  🏆 Desconto máximo atingido!`);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seedDiscountRules();
