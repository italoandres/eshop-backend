require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');
    
    const products = await Product.find();
    console.log(`📦 TOTAL DE PRODUTOS: ${products.length}\n`);
    
    products.forEach((p, index) => {
      console.log(`${index + 1}. ${p.name}`);
      console.log(`   ID: ${p._id}`);
      console.log(`   Preço: R$ ${p.priceTags[0]?.price || 'N/A'}`);
      console.log(`   Promoção: ${p.activePromotion ? 'SIM' : 'NÃO'}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

checkProducts();
