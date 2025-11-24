const StoreSettings = require('../models/StoreSettings');
const { uploadImage, isBase64Image } = require('../services/cloudinaryService');

// @desc    Get store settings
// @route   GET /api/store-settings/:storeId
// @access  Public
exports.getStoreSettings = async (req, res) => {
  try {
    const { storeId } = req.params;

    let settings = await StoreSettings.findOne({ storeId });

    // Se não existir, criar configurações padrão
    if (!settings) {
      settings = await StoreSettings.create({
        storeId,
        storeName: 'Minha Loja',
        logoUrl: '',
        primaryColor: '#FF6B6B',
        secondaryColor: '#4ECDC4',
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('❌ [StoreSettings] Error getting settings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar configurações da loja',
      error: error.message,
    });
  }
};

// @desc    Update store settings
// @route   PUT /api/store-settings/:storeId
// @access  Private
exports.updateStoreSettings = async (req, res) => {
  try {
    const { storeId } = req.params;
    let updateData = req.body;

    // Upload de logo para Cloudinary se for base64
    if (updateData.logoUrl && isBase64Image(updateData.logoUrl)) {
      console.log('📤 Upload de logo para Cloudinary...');
      try {
        const uploadResult = await uploadImage(updateData.logoUrl, 'eshop/logos');
        updateData.logoUrl = uploadResult.url;
        console.log('✅ Logo uploaded:', updateData.logoUrl);
      } catch (uploadError) {
        console.error('❌ Erro no upload do logo:', uploadError.message);
        return res.status(500).json({
          success: false,
          message: 'Erro ao fazer upload da logo',
          error: uploadError.message,
        });
      }
    }

    let settings = await StoreSettings.findOne({ storeId });

    if (!settings) {
      // Criar se não existir
      settings = await StoreSettings.create({
        storeId,
        ...updateData,
      });
    } else {
      // Atualizar
      settings = await StoreSettings.findOneAndUpdate(
        { storeId },
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('❌ [StoreSettings] Error updating settings:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar configurações da loja',
      error: error.message,
    });
  }
};

// @desc    Upload logo
// @route   POST /api/store-settings/:storeId/logo
// @access  Private
exports.uploadLogo = async (req, res) => {
  try {
    const { storeId } = req.params;
    let { logoUrl } = req.body;

    if (!logoUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL da logo é obrigatória',
      });
    }

    // Upload de logo para Cloudinary se for base64
    if (isBase64Image(logoUrl)) {
      console.log('📤 Upload de logo para Cloudinary...');
      try {
        const uploadResult = await uploadImage(logoUrl, 'eshop/logos');
        logoUrl = uploadResult.url;
        console.log('✅ Logo uploaded:', logoUrl);
      } catch (uploadError) {
        console.error('❌ Erro no upload do logo:', uploadError.message);
        return res.status(500).json({
          success: false,
          message: 'Erro ao fazer upload da logo',
          error: uploadError.message,
        });
      }
    }

    let settings = await StoreSettings.findOne({ storeId });

    if (!settings) {
      settings = await StoreSettings.create({
        storeId,
        storeName: 'Minha Loja',
        logoUrl,
      });
    } else {
      settings.logoUrl = logoUrl;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Logo atualizada com sucesso',
    });
  } catch (error) {
    console.error('❌ [StoreSettings] Error uploading logo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da logo',
      error: error.message,
    });
  }
};
