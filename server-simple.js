require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
// Aumentar limite para aceitar imagens em base64 (10MB)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Banco de dados em memória (para testes sem MongoDB)
let banners = [
  {
    _id: '1',
    title: 'Banner de Teste 1',
    description: 'Promoção de Verão',
    imageUrl: 'https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Banner+1',
    link: 'https://example.com',
    order: 0,
    isActive: true,
    storeId: 'store_001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: '2',
    title: 'Banner de Teste 2',
    description: 'Ofertas Especiais',
    imageUrl: 'https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Banner+2',
    link: 'https://example.com',
    order: 1,
    isActive: true,
    storeId: 'store_001',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

let nextId = 3;

// Middleware de autenticação simples
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }
  
  if (token !== 'eshop_admin_token_2024') {
    return res.status(403).json({ message: 'Token inválido' });
  }
  
  next();
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'In-Memory (Test Mode)',
  });
});

// Listar banners ativos (público)
app.get('/api/stores/:storeId/banners', (req, res) => {
  try {
    const activeBanners = banners
      .filter(b => b.isActive && b.storeId === req.params.storeId)
      .sort((a, b) => a.order - b.order);
    res.json(activeBanners);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar banners', error: error.message });
  }
});

// Listar todos os banners (admin)
app.get('/api/admin/stores/:storeId/banners', authMiddleware, (req, res) => {
  try {
    const storeBanners = banners
      .filter(b => b.storeId === req.params.storeId)
      .sort((a, b) => a.order - b.order);
    res.json(storeBanners);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar banners', error: error.message });
  }
});

// Criar banner (admin)
app.post('/api/stores/:storeId/banners', authMiddleware, (req, res) => {
  try {
    const newBanner = {
      _id: String(nextId++),
      ...req.body,
      storeId: req.params.storeId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    banners.push(newBanner);
    console.log('✅ Banner criado:', newBanner.title);
    res.status(201).json(newBanner);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar banner', error: error.message });
  }
});

// Atualizar banner (admin)
app.put('/api/stores/:storeId/banners/:id', authMiddleware, (req, res) => {
  try {
    const index = banners.findIndex(b => b._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Banner não encontrado' });
    }
    
    banners[index] = {
      ...banners[index],
      ...req.body,
      _id: req.params.id,
      storeId: req.params.storeId,
      updatedAt: new Date(),
    };
    
    console.log('✅ Banner atualizado:', banners[index].title);
    res.json(banners[index]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar banner', error: error.message });
  }
});

// Deletar banner (admin)
app.delete('/api/stores/:storeId/banners/:id', authMiddleware, (req, res) => {
  try {
    const index = banners.findIndex(b => b._id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: 'Banner não encontrado' });
    }
    
    const deleted = banners.splice(index, 1)[0];
    console.log('✅ Banner deletado:', deleted.title);
    res.json({ message: 'Banner deletado com sucesso', banner: deleted });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar banner', error: error.message });
  }
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

// Start server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('🚀 Servidor rodando na porta', PORT);
  console.log('📍 API disponível em: http://localhost:' + PORT + '/api');
  console.log('🏥 Health check: http://localhost:' + PORT + '/health');
  console.log('💾 Modo: In-Memory Database (Test Mode)');
  console.log('🔑 Token: eshop_admin_token_2024');
  console.log('');
  console.log('✅ Servidor pronto para uso!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  process.exit(0);
});
