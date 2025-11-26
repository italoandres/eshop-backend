const Product = require('../models/Product');
const { uploadImage, isBase64Image } = require('../services/cloudinaryService');

/**
 * Processa imagens das variantes, fazendo upload para Cloudinary se necessário
 * @param {Array} variants - Array de variantes do produto
 * @returns {Promise<Array>} - Variantes com URLs do Cloudinary
 */
async function processVariantImages(variants) {
  if (!variants || variants.length === 0) {
    return variants;
  }

  console.log(`📦 Processando ${variants.length} variante(s)...`);

  // Processar cada variante
  const processedVariants = await Promise.all(
    variants.map(async (variant) => {
      if (!variant.images || variant.images.length === 0) {
        return variant;
      }

      console.log(`🎨 Processando cor: ${variant.color} (${variant.images.length} foto(s))`);

      // Processar cada imagem da variante
      const processedImages = await Promise.all(
        variant.images.map(async (image, index) => {
          // Se já é URL do Cloudinary ou externa, manter
          if (!isBase64Image(image.url)) {
            console.log(`  ✓ Foto ${index + 1}: URL externa (mantida)`);
            return image;
          }

          // É base64, fazer upload
          console.log(`  📤 Foto ${index + 1}: Fazendo upload...`);
          try {
            const uploadResult = await uploadImage(image.url, 'eshop/products');
            console.log(`  ✅ Foto ${index + 1}: Upload concluído`);
            
            return {
              ...image,
              url: uploadResult.url // Substitui base64 pela URL do Cloudinary
            };
          } catch (error) {
            console.error(`  ❌ Foto ${index + 1}: Erro no upload:`, error.message);
            throw new Error(`Erro ao fazer upload da foto ${index + 1} da cor ${variant.color}`);
          }
        })
      );

      return {
        ...variant,
        images: processedImages
      };
    })
  );

  console.log('✅ Todas as variantes processadas!');
  return processedVariants;
}

// Listar produtos com filtros
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      keyword = '',
      pageSize = 20,
      page = 1,
      categories = '[]',
      featuredSection = '' // novo parâmetro
    } = req.query;

    const query = {};
    
    // Filtro de busca por palavra-chave
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Filtro por categorias
    const categoryIds = JSON.parse(categories);
    if (categoryIds.length > 0) {
      query['categories._id'] = { $in: categoryIds };
    }
    
    // Filtro por seção destacada
    if (featuredSection) {
      const sectionMap = {
        'highlights': 'featuredSections.highlights',
        'newArrivals': 'featuredSections.newArrivals',
        'offers': 'featuredSections.offers',
        'main': 'featuredSections.main'
      };
      
      if (sectionMap[featuredSection]) {
        query[sectionMap[featuredSection]] = true;
      }
    }

    // ✅ VALIDAÇÃO: Garantir valores positivos
    const limit = Math.max(1, parseInt(pageSize) || 20);
    const pageNum = Math.max(1, parseInt(page) || 1);
    const skip = Math.max(0, (pageNum - 1) * limit);

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .exec();

    const total = await Product.countDocuments(query);

    console.log(`📊 GET PRODUCTS - Encontrados: ${products.length} produtos`);

    // Converte para formato compatível com Flutter
    const compatibleProducts = products.map(p => p.toCompatibleFormat());

    console.log(`✅ GET PRODUCTS - Retornando ${compatibleProducts.length} produtos compatíveis`);
    if (compatibleProducts.length > 0) {
      console.log(`📦 Primeiro produto:`, {
        id: compatibleProducts[0]._id,
        name: compatibleProducts[0].name,
        hasImages: !!compatibleProducts[0].images,
        imagesCount: compatibleProducts[0].images?.length || 0,
        hasPriceTags: !!compatibleProducts[0].priceTags,
        priceTagsCount: compatibleProducts[0].priceTags?.length || 0,
        hasVariants: !!compatibleProducts[0].variants,
        variantsCount: compatibleProducts[0].variants?.length || 0
      });
    }

    // Formato compatível com Flutter
    res.json({
      data: compatibleProducts,
      meta: {
        totalPages: Math.ceil(total / limit),
        currentPage: pageNum,
        total: total,
        pageSize: limit
      }
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ message: error.message });
  }
};

// Buscar produto por ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    // Retorna formato compatível
    const compatible = product.toCompatibleFormat();
    res.json(compatible);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Criar produto
exports.createProduct = async (req, res) => {
  try {
    console.log('🎯 CREATE PRODUCT - Recebido:', {
      hasVariants: !!req.body.variants,
      variantsCount: req.body.variants?.length || 0,
      firstVariant: req.body.variants?.[0] ? {
        color: req.body.variants[0].color,
        imagesCount: req.body.variants[0].images?.length || 0,
        firstImageType: req.body.variants[0].images?.[0]?.url?.substring(0, 30)
      } : null
    });

    // ✨ Processar imagens das variantes (upload para Cloudinary)
    if (req.body.variants && req.body.variants.length > 0) {
      console.log('🚀 Iniciando processamento de imagens...');
      try {
        req.body.variants = await processVariantImages(req.body.variants);
      } catch (uploadError) {
        console.error('❌ Erro ao processar imagens:', uploadError.message);
        return res.status(500).json({ 
          message: 'Erro ao fazer upload das imagens', 
          error: uploadError.message 
        });
      }
    }
    
    const product = new Product(req.body);
    
    // ✅ Converter variants → priceTags/images/categories ANTES de salvar
    if (product.variants && product.variants.length > 0) {
      // Extrair imagens das variantes
      if (!product.images || product.images.length === 0) {
        product.images = product.variants.flatMap(v => 
          v.images ? v.images.map(img => img.url) : []
        );
      }
      
      // Extrair priceTags das variantes
      if (!product.priceTags || product.priceTags.length === 0) {
        const allPrices = product.variants.flatMap(v => 
          v.sizes ? v.sizes.map(s => s.price) : []
        );
        
        if (allPrices.length > 0) {
          const minPrice = Math.min(...allPrices);
          const maxPrice = Math.max(...allPrices);
          
          if (minPrice === maxPrice) {
            product.priceTags = [{ name: 'Preço', price: minPrice }];
          } else {
            product.priceTags = [
              { name: 'A partir de', price: minPrice },
              { name: 'Até', price: maxPrice }
            ];
          }
        }
      }
      
      // Criar categoria padrão se não existir
      if (!product.categories || product.categories.length === 0) {
        product.categories = [
          { 
            name: 'Produtos', 
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' 
          }
        ];
      }
    }
    
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Atualizar produto
exports.updateProduct = async (req, res) => {
  try {
    console.log('🎯 UPDATE PRODUCT - Recebido:', {
      productId: req.params.id,
      hasVariants: !!req.body.variants,
      variantsCount: req.body.variants?.length || 0,
      firstVariant: req.body.variants?.[0] ? {
        color: req.body.variants[0].color,
        imagesCount: req.body.variants[0].images?.length || 0,
        firstImageType: req.body.variants[0].images?.[0]?.url?.substring(0, 30)
      } : null
    });

    // Buscar produto existente
    const existingProduct = await Product.findById(req.params.id);
    
    if (!existingProduct) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // ✨ Processar imagens das variantes (upload para Cloudinary)
    if (req.body.variants && req.body.variants.length > 0) {
      console.log('🚀 Iniciando processamento de imagens...');
      try {
        req.body.variants = await processVariantImages(req.body.variants);
      } catch (uploadError) {
        console.error('❌ Erro ao processar imagens:', uploadError.message);
        return res.status(500).json({ 
          message: 'Erro ao fazer upload das imagens', 
          error: uploadError.message 
        });
      }
    }
    
    // Atualizar campos
    Object.assign(existingProduct, req.body);
    
    // ✅ Converter variants → priceTags/images/categories ANTES de salvar
    if (existingProduct.variants && existingProduct.variants.length > 0) {
      // Extrair imagens das variantes
      if (!existingProduct.images || existingProduct.images.length === 0) {
        existingProduct.images = existingProduct.variants.flatMap(v => 
          v.images ? v.images.map(img => img.url) : []
        );
      }
      
      // Extrair priceTags das variantes
      if (!existingProduct.priceTags || existingProduct.priceTags.length === 0) {
        const allPrices = existingProduct.variants.flatMap(v => 
          v.sizes ? v.sizes.map(s => s.price) : []
        );
        
        if (allPrices.length > 0) {
          const minPrice = Math.min(...allPrices);
          const maxPrice = Math.max(...allPrices);
          
          if (minPrice === maxPrice) {
            existingProduct.priceTags = [{ name: 'Preço', price: minPrice }];
          } else {
            existingProduct.priceTags = [
              { name: 'A partir de', price: minPrice },
              { name: 'Até', price: maxPrice }
            ];
          }
        }
      }
      
      // Criar categoria padrão se não existir
      if (!existingProduct.categories || existingProduct.categories.length === 0) {
        existingProduct.categories = [
          { 
            name: 'Produtos', 
            image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400' 
          }
        ];
      }
    }
    
    const updatedProduct = await existingProduct.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deletar produto
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};