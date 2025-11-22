# 🔧 Solução: MongoDB não está rodando

## ❌ Problema Identificado

O MongoDB não está instalado ou não está rodando no seu sistema, causando erro de conexão.

## ✅ Solução Implementada

Criei um **servidor simplificado** que funciona **sem MongoDB**, usando banco de dados em memória para testes.

---

## 🚀 Como Usar Agora

### Opção 1: Servidor Simples (SEM MongoDB) - RECOMENDADO PARA TESTES

```bash
cd backend
npm run dev:simple
```

**Vantagens:**
- ✅ Não precisa do MongoDB
- ✅ Funciona imediatamente
- ✅ Perfeito para testes e desenvolvimento
- ✅ Mesma API, mesmas funcionalidades

**Desvantagens:**
- ⚠️ Dados são perdidos ao reiniciar o servidor
- ⚠️ Não é recomendado para produção

---

### Opção 2: Servidor com MongoDB (Produção)

Se você quiser usar o MongoDB real:

#### A. Instalar MongoDB Localmente

1. **Download:**
   - Acesse: https://www.mongodb.com/try/download/community
   - Baixe a versão para Windows
   - Instale seguindo o wizard

2. **Iniciar MongoDB:**
   ```bash
   net start MongoDB
   ```

3. **Usar o servidor normal:**
   ```bash
   cd backend
   npm run dev
   ```

#### B. Usar MongoDB Atlas (Cloud - Grátis)

1. **Criar conta:**
   - Acesse: https://www.mongodb.com/cloud/atlas/register
   - Crie uma conta grátis

2. **Criar cluster:**
   - Crie um cluster gratuito (M0)
   - Configure usuário e senha
   - Adicione seu IP à whitelist

3. **Obter connection string:**
   - Copie a connection string
   - Exemplo: `mongodb+srv://user:pass@cluster.mongodb.net/eshop`

4. **Atualizar .env:**
   ```env
   MONGODB_URI=sua_connection_string_aqui
   ```

5. **Iniciar servidor:**
   ```bash
   cd backend
   npm run dev
   ```

---

## 📊 Comparação

| Recurso | Servidor Simples | MongoDB Local | MongoDB Atlas |
|---------|------------------|---------------|---------------|
| Instalação | ✅ Nenhuma | ⚠️ Requer instalação | ✅ Apenas conta |
| Persistência | ❌ Temporária | ✅ Permanente | ✅ Permanente |
| Performance | ⚡ Rápido | ⚡ Rápido | 🌐 Depende da internet |
| Custo | 💰 Grátis | 💰 Grátis | 💰 Grátis (tier M0) |
| Produção | ❌ Não | ✅ Sim | ✅ Sim |
| Desenvolvimento | ✅ Perfeito | ✅ Sim | ✅ Sim |

---

## 🎯 Recomendação

### Para Testes e Desenvolvimento:
👉 **Use o Servidor Simples** (`npm run dev:simple`)

### Para Produção:
👉 **Use MongoDB Atlas** (cloud, grátis, fácil)

---

## 🔍 Verificar Status

### Testar se o backend está funcionando:

```bash
# Health check
curl http://localhost:4000/health

# Listar banners
curl http://localhost:4000/api/stores/store_001/banners
```

Ou abra no navegador:
- http://localhost:4000/health
- http://localhost:4000/api/stores/store_001/banners

---

## 🎉 Agora Você Pode:

1. ✅ Fazer login no painel admin
2. ✅ Criar banners
3. ✅ Editar banners
4. ✅ Deletar banners
5. ✅ Ver banners no app Flutter

**Token:** `eshop_admin_token_2024`

---

## 📝 Notas Importantes

### Servidor Simples (In-Memory)
- Os dados são armazenados na memória RAM
- Ao reiniciar o servidor, os dados são perdidos
- Já vem com 2 banners de exemplo
- Perfeito para testes e demonstrações

### Dados Iniciais
O servidor simples já vem com 2 banners de teste:
1. Banner de Teste 1 - Promoção de Verão
2. Banner de Teste 2 - Ofertas Especiais

---

## 🆘 Problemas?

### Erro: "Porta 4000 já está em uso"
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <número_do_processo> /F
```

### Erro: "Cannot find module"
```bash
cd backend
npm install
```

### Backend não inicia
```bash
# Verificar se o Node.js está instalado
node --version

# Reinstalar dependências
cd backend
rm -rf node_modules
npm install
```

---

**Desenvolvido com ❤️ para o EShop**

✅ **Problema resolvido! Backend funcionando!**
