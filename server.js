require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bannerRoutes = require('./routes/bannerRoutes');
const discountRuleRoutes = require('./routes/discountRules');
const productRoutes = require('./routes/productRoutes');
const storeSettingsRoutes = require('./routes/storeSettings');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS === '*' 
    ? '*' 
    : (process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || '*'),
  credentials: true,
}));
// Aumentar limite para aceitar imagens em base64 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', bannerRoutes);
app.use('/api/discount-rules', discountRuleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/store-settings', storeSettingsRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ message: 'Erro interno do servidor', error: err.message });
});

// MongoDB Connection
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso!');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 API disponível em: http://localhost:${PORT}/api`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch((err) => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await mongoose.connection.close();
  process.exit(0);
});
