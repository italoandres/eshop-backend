require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Razer Viper V3 Pro',
    description: 'Mouse gamer sem fio Razer Viper V3 Pro com sensor óptico de 30.000 DPI, switches ópticos Gen-3, bateria de até 90 horas e design ambidestro ultra-leve.',
    priceTags: [
      { name: 'Branco', price: 151.99 },
      { name: 'Preto', price: 151.99 }
    ],
    categories: [
      { name: 'Periféricos', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' },
      { name: 'Mouses', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' }
    ],
    images: [
      'https://assets.razerzone.com/eeimages/support/products/1854/1854_viper_v3_pro.png',
      'https://via.placeholder.com/800x800/FFFFFF/000000?text=Razer+Viper+V3+Pro'
    ],
    originalPrice: 199.99,
    discountPercentage: 24,
    rating: 4.8,
    reviewCount: 1245,
    soldCount: 3890,
    shippingInfo: {
      isFree: true,
      shippingCost: 0,
      estimatedDeliveryStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedDeliveryEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'Bose QuietComfort',
    description: 'Fone de ouvido premium Bose QuietComfort com cancelamento de ruído ativo de classe mundial, áudio espacial, bateria de 24 horas e conforto excepcional.',
    priceTags: [
      { name: 'Branco', price: 196.00 },
      { name: 'Preto', price: 196.00 }
    ],
    categories: [
      { name: 'Áudio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
      { name: 'Fones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }
    ],
    images: [
      'https://assets.bose.com/content/dam/cloudassets/Bose_DAM/Web/consumer_electronics/global/products/headphones/qc_earbuds_ii/product_silo_images/QC_Earbuds_II_SOAPSTONE_EC_1.png',
      'https://via.placeholder.com/800x800/F5F5F5/000000?text=Bose+QuietComfort'
    ],
    originalPrice: 279.00,
    discountPercentage: 30,
    rating: 4.7,
    reviewCount: 2341,
    soldCount: 5678,
    shippingInfo: {
      isFree: true,
      shippingCost: 0,
      estimatedDeliveryStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedDeliveryEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'Razer Viper V2 Pro',
    description: 'Mouse gamer sem fio Razer Viper V2 Pro ultra-leve com apenas 58g, sensor Focus Pro 30K, switches ópticos Gen-3 e bateria de até 80 horas.',
    priceTags: [
      { name: 'Preto', price: 79.99 },
      { name: 'Branco', price: 79.99 }
    ],
    categories: [
      { name: 'Periféricos', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' },
      { name: 'Mouses', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' }
    ],
    images: [
      'https://assets.razerzone.com/eeimages/support/products/1854/1854_viper_v2_pro.png',
      'https://via.placeholder.com/800x800/000000/FFFFFF?text=Razer+Viper+V2+Pro'
    ],
    originalPrice: 149.99,
    discountPercentage: 47,
    rating: 4.9,
    reviewCount: 3456,
    soldCount: 8901,
    shippingInfo: {
      isFree: true,
      shippingCost: 0,
      estimatedDeliveryStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      estimatedDeliveryEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'ASUS ROG Strix G16',
    description: 'Notebook gamer ASUS ROG Strix G16 com processador Intel Core i9-13980HX, RTX 4070, 16GB DDR5, SSD 1TB, tela 16" QHD 240Hz.',
    priceTags: [
      { name: 'Padrão', price: 1310.00 }
    ],
    categories: [
      { name: 'Computadores', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' },
      { name: 'Notebooks', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400' }
    ],
    images: [
      'https://dlcdnwebimgs.asus.com/gain/8B0B5DB4-3F3C-4F5D-9F5F-8B0B5DB43F3C/w800',
      'https://via.placeholder.com/800x800/000000/FF00FF?text=ASUS+ROG+Strix+G16'
    ],
    originalPrice: 1899.00,
    discountPercentage: 31,
    rating: 4.8,
    reviewCount: 892,
    soldCount: 1567,
    shippingInfo: {
      isFree: false,
      shippingCost: 29.90,
      estimatedDeliveryStart: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      estimatedDeliveryEnd: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'Razer DeathAdder',
    description: 'Mouse gamer Razer DeathAdder Essential com sensor óptico de 6.400 DPI, 5 botões programáveis, design ergonômico e iluminação Chroma RGB.',
    priceTags: [
      { name: 'Azul Claro', price: 18.99 },
      { name: 'Preto', price: 18.99 }
    ],
    categories: [
      { name: 'Periféricos', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' },
      { name: 'Mouses', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' }
    ],
    images: [
      'https://assets.razerzone.com/eeimages/support/products/1384/1384_deathadder_essential.png',
      'https://via.placeholder.com/800x800/87CEEB/000000?text=Razer+DeathAdder'
    ],
    originalPrice: 49.99,
    discountPercentage: 62,
    rating: 4.6,
    reviewCount: 5678,
    soldCount: 12345,
    shippingInfo: {
      isFree: true,
      shippingCost: 0,
      estimatedDeliveryStart: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      estimatedDeliveryEnd: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    }
  },
  {
    name: 'Rapoo MT760 Multi-Mode',
    description: 'Mouse sem fio Rapoo MT760 com conexão Bluetooth e 2.4GHz, sensor de 3200 DPI, design ergonômico silencioso e bateria recarregável.',
    priceTags: [
      { name: 'Branco', price: 49.99 },
      { name: 'Cinza', price: 49.99 }
    ],
    categories: [
      { name: 'Periféricos', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' },
      { name: 'Mouses', image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400' }
    ],
    images: [
      'https://via.placeholder.com/800x800/E0E0E0/000000?text=Rapoo+MT760',
      'https://via.placeholder.com/800x800/FFFFFF/666666?text=Rapoo+MT760+Multi'
    ],
    originalPrice: 79.99,
    discountPercentage: 38,
    rating: 4.4,
    reviewCount: 1234,
    soldCount: 2890,
    shippingInfo: {
      isFree: true,
      shippingCost: 0,
      estimatedDeliveryStart: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      estimatedDeliveryEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conectado ao MongoDB');

    // Limpar produtos existentes
    await Product.deleteMany({});
    console.log('🗑️  Produtos antigos removidos');

    // Inserir novos produtos
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ ${products.length} produtos criados com sucesso!`);

    console.log('\n📦 Produtos criados:');
    products.forEach(product => {
      const mainPrice = product.priceTags[product.priceTags.length - 1].price;
      console.log(`  - ${product.name} - R$ ${mainPrice}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Seed concluído! Produtos prontos para o app Flutter!');
  } catch (error) {
    console.error('❌ Erro ao criar produtos:', error);
    process.exit(1);
  }
}

seedProducts();
