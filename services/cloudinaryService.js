const { v2: cloudinary } = require('cloudinary');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadImage = async (imageData, folder = 'eshop', customTransformation = null) => {
  try {
    // Default transformation for banners (1200x600)
    const defaultTransformation = [
      { width: 1200, height: 600, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ];

    // Logo transformation (800x800) - used when folder is 'eshop/logos'
    const logoTransformation = [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto:good' },
      { fetch_format: 'auto' },
    ];

    // Determine which transformation to use
    let transformation = defaultTransformation;
    if (customTransformation) {
      transformation = customTransformation;
    } else if (folder === 'eshop/logos') {
      transformation = logoTransformation;
    }

    const result = await cloudinary.uploader.upload(imageData, {
      folder,
      resource_type: 'image',
      transformation,
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Erro Cloudinary:', error);
    throw new Error('Falha ao fazer upload');
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Imagem deletada: ${publicId}`);
  } catch (error) {
    console.error('Erro ao deletar:', error);
  }
};

const uploadMultipleImages = async (images, folder = 'eshop') => {
  const uploadPromises = images.map((image) => uploadImage(image, folder));
  return await Promise.all(uploadPromises);
};

const isBase64Image = (str) => {
  if (!str || typeof str !== 'string') return false;
  return str.startsWith('data:image/');
};

module.exports = { uploadImage, deleteImage, uploadMultipleImages, isBase64Image, cloudinary };
