const Banner = require('../models/Banner');

// @desc    Get all active banners for a store
// @route   GET /api/stores/:storeId/banners
// @access  Public
exports.getBanners = async (req, res) => {
  try {
    const { storeId } = req.params;
    const now = new Date();

    // Query para buscar banners ativos
    const query = {
      storeId,
      active: true,
      $or: [{ startAt: null }, { startAt: { $lte: now } }],
    };

    // Adicionar filtro de endAt se existir
    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });

    // Filtrar banners que ainda não expiraram
    const activeBanners = banners.filter((banner) => {
      if (!banner.endAt) return true;
      return banner.endAt >= now;
    });

    // Retornar no formato esperado pelo app Flutter
    res.json({ data: activeBanners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Erro ao buscar banners', error: error.message });
  }
};

// @desc    Get all banners for admin (including inactive)
// @route   GET /api/admin/stores/:storeId/banners
// @access  Private (Admin)
exports.getAllBanners = async (req, res) => {
  try {
    const { storeId } = req.params;
    const banners = await Banner.find({ storeId }).sort({ order: 1, createdAt: -1 });

    res.json(banners);
  } catch (error) {
    console.error('Error fetching all banners:', error);
    res.status(500).json({ message: 'Erro ao buscar banners', error: error.message });
  }
};

// @desc    Create a new banner
// @route   POST /api/stores/:storeId/banners
// @access  Private (Admin)
exports.createBanner = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { title, imageUrl, targetUrl, order, active, startAt, endAt } = req.body;

    // LOG DETALHADO
    console.log('=== CREATE BANNER ===');
    console.log('StoreId:', storeId);
    console.log('Body:', JSON.stringify(req.body).substring(0, 200));
    console.log('Title:', title);
    console.log('ImageUrl exists:', !!imageUrl, 'Length:', imageUrl?.length || 0);
    console.log('TargetUrl:', targetUrl);

    // Validar campos obrigatórios
    if (!title || !imageUrl || !targetUrl) {
      console.error('❌ MISSING FIELDS:', { title: !!title, imageUrl: !!imageUrl, targetUrl: !!targetUrl });
      return res.status(400).json({ 
        message: 'Campos obrigatórios faltando', 
        required: ['title', 'imageUrl', 'targetUrl'],
        received: { title: !!title, imageUrl: !!imageUrl, targetUrl: !!targetUrl }
      });
    }

    const banner = await Banner.create({
      storeId,
      title,
      imageUrl,
      targetUrl,
      order: order || 0,
      active: active !== undefined ? active : true,
      startAt: startAt || null,
      endAt: endAt || null,
    });

    console.log('✅ Banner created:', banner._id);
    res.status(201).json(banner);
  } catch (error) {
    console.error('❌ Error creating banner:', error.message);
    res.status(400).json({ message: 'Erro ao criar banner', error: error.message });
  }
};

// @desc    Update a banner
// @route   PUT /api/stores/:storeId/banners/:id
// @access  Private (Admin)
exports.updateBanner = async (req, res) => {
  try {
    const { storeId, id } = req.params;
    const { title, imageUrl, targetUrl, order, active, startAt, endAt } = req.body;

    const banner = await Banner.findOne({ _id: id, storeId });

    if (!banner) {
      return res.status(404).json({ message: 'Banner não encontrado' });
    }

    // Atualizar campos
    if (title !== undefined) banner.title = title;
    if (imageUrl !== undefined) banner.imageUrl = imageUrl;
    if (targetUrl !== undefined) banner.targetUrl = targetUrl;
    if (order !== undefined) banner.order = order;
    if (active !== undefined) banner.active = active;
    if (startAt !== undefined) banner.startAt = startAt || null;
    if (endAt !== undefined) banner.endAt = endAt || null;

    await banner.save();

    res.json(banner);
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(400).json({ message: 'Erro ao atualizar banner', error: error.message });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/stores/:storeId/banners/:id
// @access  Private (Admin)
exports.deleteBanner = async (req, res) => {
  try {
    const { storeId, id } = req.params;

    const banner = await Banner.findOneAndDelete({ _id: id, storeId });

    if (!banner) {
      return res.status(404).json({ message: 'Banner não encontrado' });
    }

    res.json({ message: 'Banner deletado com sucesso', banner });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({ message: 'Erro ao deletar banner', error: error.message });
  }
};
