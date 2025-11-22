const StoreSettings = require('../models/StoreSettings');

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
    console.error('[StoreSettings] Error getting settings:', error);
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
    const updateData = req.body;

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
    console.error('[StoreSettings] Error updating settings:', error);
    res.status(400).json({
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
    const { logoUrl } = req.body;

    if (!logoUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL da logo é obrigatória',
      });
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
    console.error('[StoreSettings] Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer upload da logo',
      error: error.message,
    });
  }
};
