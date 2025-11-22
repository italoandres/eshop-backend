# 🚀 Guia de Deploy - Backend API

Este guia mostra como fazer deploy do backend para cada cliente.

## 📋 Pré-requisitos

- Conta no MongoDB Atlas (gratuita)
- Conta no Render.com (gratuita)
- Conta no Netlify (gratuita) - para o painel admin

---

## 1️⃣ CONFIGURAR MONGODB ATLAS

### Passo 1: Criar Cluster
1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Crie um novo cluster (M0 - Free)
4. Aguarde 3-5 minutos para provisionar

### Passo 2: Configurar Acesso
1. Database Access → Add New Database User
   - Username: `admin_user`
   - Password: Gere uma senha forte
   - Role: `Atlas admin`

2. Network Access → Add IP Address
   - Clique em "Allow Access from Anywhere"
   - IP: `0.0.0.0/0`

### Passo 3: Obter Connection String
1. Clusters → Connect → Connect your application
2. Copie a string de conexão:
   ```
   mongodb+srv://admin_user:<password>@cluster0.xxxxx.mongodb.net/eshop-banners?retryWrites=true&w=majority
   ```
3. Substitua `<password>` pela senha criada

---

## 2️⃣ FAZER DEPLOY NO RENDER

### Passo 1: Criar Conta
1. Acesse: https://render.com
2. Faça login com GitHub

### Passo 2: Criar Web Service
1. Dashboard → New → Web Service
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `cliente-nome-api` (ex: `loja-joao-api`)
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend/backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Passo 3: Configurar Variáveis de Ambiente
Adicione as seguintes variáveis:

```env
MONGODB_URI=mongodb+srv://admin_user:SUA_SENHA@cluster0.xxxxx.mongodb.net/eshop-banners?retryWrites=true&w=majority
PORT=4001
NODE_ENV=production
ADMIN_TOKEN=gere_um_token_secreto_aqui_123456
ALLOWED_ORIGINS=https://seu-painel-admin.netlify.app,https://seu-app.com
```

**⚠️ IMPORTANTE:**
- Substitua `SUA_SENHA` pela senha do MongoDB
- Gere um token único para `ADMIN_TOKEN`
- Adicione os domínios corretos em `ALLOWED_ORIGINS`

### Passo 4: Deploy
1. Clique em "Create Web Service"
2. Aguarde 5-10 minutos para o deploy
3. Sua API estará disponível em: `https://cliente-nome-api.onrender.com`

### Passo 5: Testar
```bash
curl https://cliente-nome-api.onrender.com/health
```

Deve retornar: `{"status":"OK","timestamp":"..."}`

---

## 3️⃣ CONFIGURAR PAINEL ADMIN

### Passo 1: Atualizar URL da API
No código do painel admin, atualize a URL base:

```javascript
// src/config/api.js (ou similar)
const API_BASE_URL = 'https://cliente-nome-api.onrender.com';
const ADMIN_TOKEN = 'seu_token_secreto_aqui';
```

### Passo 2: Deploy no Netlify
1. Acesse: https://app.netlify.com
2. Sites → Add new site → Import an existing project
3. Conecte seu repositório
4. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist` ou `build`
5. Deploy!

### Passo 3: Configurar Domínio Customizado (Opcional)
1. Site settings → Domain management
2. Add custom domain: `admin.loja-cliente.com`

---

## 4️⃣ CONFIGURAR APP FLUTTER

### Atualizar URL da API no App

```dart
// lib/core/config/api_config.dart
class ApiConfig {
  static const String baseUrl = 'https://cliente-nome-api.onrender.com';
  static const String defaultStoreId = 'store_001';
}
```

### Build do App
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release

# Web
flutter build web --release
```

---

## 5️⃣ POPULAR DADOS INICIAIS

### Via Painel Admin
1. Acesse o painel admin
2. Faça login com o token configurado
3. Crie banners, produtos, etc.

### Via Script (Opcional)
```bash
# No diretório backend/backend
node seed/seedBanners.js
```

---

## 🔧 TROUBLESHOOTING

### Erro de CORS
- Adicione o domínio do painel admin em `ALLOWED_ORIGINS`
- Reinicie o serviço no Render

### MongoDB não conecta
- Verifique se o IP `0.0.0.0/0` está liberado
- Verifique a senha na connection string

### API retorna 500
- Verifique os logs no Render Dashboard
- Verifique se todas as variáveis de ambiente estão configuradas

---

## 📊 CUSTOS

### Gratuito (Tier Free)
- **MongoDB Atlas**: 512MB storage
- **Render**: 750 horas/mês (suficiente para 1 instância 24/7)
- **Netlify**: 100GB bandwidth/mês

### Quando Escalar
- MongoDB Atlas: $9/mês (2GB)
- Render: $7/mês (instância dedicada)
- Netlify: Gratuito (até 100GB)

---

## 🎯 CHECKLIST DE DEPLOY

- [ ] MongoDB Atlas configurado
- [ ] Backend deployado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Health check funcionando
- [ ] Painel admin deployado no Netlify
- [ ] Painel admin conectado à API
- [ ] App Flutter apontando para API correta
- [ ] Dados iniciais populados
- [ ] Testes de criação/edição funcionando

---

## 📞 SUPORTE

Se tiver problemas:
1. Verifique os logs no Render Dashboard
2. Teste os endpoints com curl
3. Verifique as variáveis de ambiente

---

**Pronto! Cada cliente terá sua própria instância independente! 🚀**
