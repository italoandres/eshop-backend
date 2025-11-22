# 🎯 EShop Banner API

API REST para gerenciamento de banners do aplicativo EShop.

## 📋 Pré-requisitos

- Node.js 16+ 
- MongoDB 4.4+
- npm ou yarn

## 🚀 Instalação

1. **Instalar dependências:**
```bash
cd backend
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. **Iniciar MongoDB:**
```bash
# Windows (se instalado como serviço)
net start MongoDB

# macOS/Linux
mongod

# Ou usar Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

4. **Popular banco de dados com dados de teste:**
```bash
npm run seed
```

5. **Iniciar servidor:**
```bash
# Desenvolvimento (com auto-reload)
npm run dev

# Produção
npm start
```

## 📡 Endpoints

### Públicos (App Flutter)

#### GET /api/stores/:storeId/banners
Retorna banners ativos para uma loja específica.

**Exemplo:**
```bash
curl http://localhost:4000/api/stores/store_001/banners
```

**Resposta:**
```json
[
  {
    "_id": "...",
    "storeId": "store_001",
    "title": "Black Friday",
    "imageUrl": "https://...",
    "targetUrl": "https://...",
    "order": 1,
    "active": true,
    "startAt": null,
    "endAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Protegidos (Admin) - Requer Token

**Header necessário:**
```
Authorization: Bearer eshop_admin_token_2024
```

#### GET /api/admin/stores/:storeId/banners
Lista todos os banners (incluindo inativos).

#### POST /api/stores/:storeId/banners
Cria um novo banner.

**Body:**
```json
{
  "title": "Novo Banner",
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "targetUrl": "https://exemplo.com/destino",
  "order": 1,
  "active": true,
  "startAt": "2024-01-01T00:00:00.000Z",
  "endAt": "2024-12-31T23:59:59.000Z"
}
```

#### PUT /api/stores/:storeId/banners/:id
Atualiza um banner existente.

#### DELETE /api/stores/:storeId/banners/:id
Deleta um banner.

## 🧪 Testando a API

### Com cURL:

```bash
# Listar banners ativos
curl http://localhost:4000/api/stores/store_001/banners

# Criar banner (com autenticação)
curl -X POST http://localhost:4000/api/stores/store_001/banners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eshop_admin_token_2024" \
  -d '{
    "title": "Teste",
    "imageUrl": "https://exemplo.com/img.jpg",
    "targetUrl": "https://exemplo.com",
    "order": 1,
    "active": true
  }'
```

### Com Postman:

1. Importar collection (criar arquivo `postman_collection.json`)
2. Configurar variável `baseUrl` = `http://localhost:4000`
3. Configurar header `Authorization` = `Bearer eshop_admin_token_2024`

## 🔧 Configuração no Flutter

Atualizar `lib/core/constant/strings.dart`:

```dart
const String baseUrl = 'http://SEU_IP:4000';
// Exemplo: const String baseUrl = 'http://192.168.1.100:4000';
```

**Importante:** Use o IP da sua máquina, não `localhost`, para testar no dispositivo físico.

## 📁 Estrutura do Projeto

```
backend/
├── models/
│   └── Banner.js          # Schema Mongoose
├── controllers/
│   └── bannerController.js # Lógica de negócio
├── routes/
│   └── bannerRoutes.js    # Definição de rotas
├── middleware/
│   └── auth.js            # Autenticação
├── seed/
│   └── seedBanners.js     # Dados de teste
├── .env                   # Variáveis de ambiente
├── .env.example           # Exemplo de configuração
├── server.js              # Servidor principal
├── package.json           # Dependências
└── README.md              # Este arquivo
```

## 🐛 Troubleshooting

### MongoDB não conecta
- Verificar se o MongoDB está rodando: `mongosh`
- Verificar a URI no `.env`

### CORS error no Flutter
- Adicionar o IP/porta do seu servidor no `ALLOWED_ORIGINS` do `.env`
- Reiniciar o servidor

### Banners não aparecem no app
- Verificar se o seed foi executado: `npm run seed`
- Testar endpoint manualmente: `curl http://localhost:4000/api/stores/store_001/banners`
- Verificar logs do servidor

## 📝 Próximos Passos

1. ✅ Backend funcionando
2. ⏳ Conectar Flutter à API real
3. ⏳ Criar painel admin web
4. ⏳ Implementar upload de imagens

## 📄 Licença

MIT
