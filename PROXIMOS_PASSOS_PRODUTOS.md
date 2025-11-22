# 📦 Próximos Passos - Backend de Produtos

## ✅ O que foi feito
- ✅ Formulário de desconto progressivo melhorado (autocomplete, por categoria, todos produtos)
- ✅ Backend antigo de produtos removido (estava incompatível)

## 🎯 O que precisa ser feito

### 1. Criar Model de Produto compatível com Flutter

O Flutter espera produtos com esta estrutura:

```javascript
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "priceTags": [
    {
      "_id": "string",
      "name": "string",  // ex: "Preço Normal", "Promoção"
      "price": number
    }
  ],
  "categories": [
    {
      "_id": "string",
      "name": "string",
      "image": "string"
    }
  ],
  "images": ["string"],
  "createdAt": "ISO Date",
  "updatedAt": "ISO Date"
}
```

### 2. Criar Controller e Rotas

- GET `/api/products` - Listar produtos
  - Query params: `keyword`, `pageSize`, `page`, `categories`
  - Resposta: `{ "data": [...], "meta": { "totalPages", "currentPage", "total", "pageSize" } }`

### 3. Criar Seed com produtos reais

Usar produtos que já existem no app ou criar novos compatíveis.

### 4. Atualizar Admin Panel

- Página de produtos para usar nova estrutura
- Formulário de cadastro/edição

## 📝 Estrutura de Referência

Arquivos Flutter para referência:
- `lib/data/models/product/product_model.dart`
- `lib/data/models/product/price_tag_model.dart`
- `lib/data/models/category/category_model.dart`
- `lib/data/data_sources/remote/product_remote_data_source.dart`

## 🚀 Como continuar

Na próxima sessão, começar por:
1. Criar `backend/models/Product.js` compatível
2. Criar `backend/controllers/productController.js`
3. Criar `backend/routes/productRoutes.js`
4. Criar `backend/seed/seedProducts.js` com produtos de teste
5. Testar no app Flutter
