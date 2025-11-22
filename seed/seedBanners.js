require('dotenv').config();
const mongoose = require('mongoose');
const Banner = require('../models/Banner');

const seedBanners = [
  {
    storeId: 'eshop_001',
    title: 'Black Friday - Ofertas Imperdíveis',
    imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=400&fit=crop',
    targetUrl: 'https://www.example.com/ofertas',
    order: 1,
    active: true,
    startAt: null,
    endAt: null,
  },
  {
    storeId: 'eshop_001',
    title: 'Tecnologia com Desconto',
    imageUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200&h=400&fit=crop',
    targetUrl: 'https://www.example.com/tecnologia',
    order: 2,
    active: true,
    startAt: null,
    endAt: null,
  },
  {
    storeId: 'eshop_001',
    title: 'Frete Grátis em Compras Acima de R$ 100',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=400&fit=crop',
    targetUrl: 'https://www.example.com/frete-gratis',
    order: 3,
    active: true,
    startAt: null,
    endAt: null,
  },
];

async function seed() {
  try {
    console.log('🌱 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado!');

    console.log('🗑️  Limpando banners existentes...');
    await Banner.deleteMany({ storeId: 'eshop_001' });

    console.log('📝 Inserindo banners de teste...');
    const banners = await Banner.insertMany(seedBanners);

    console.log(`✅ ${banners.length} banners inseridos com sucesso!`);
    console.log('\n📋 Banners criados:');
    banners.forEach((banner, index) => {
      console.log(`  ${index + 1}. ${banner.title} (ID: ${banner._id})`);
    });

    console.log('\n🎉 Seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
}

seed();
