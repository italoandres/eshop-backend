const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: [true, 'Store ID é obrigatório'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Título é obrigatório'],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'URL da imagem é obrigatória'],
    },
    targetUrl: {
      type: String,
      required: [true, 'URL de destino é obrigatória'],
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    startAt: {
      type: Date,
      default: null,
    },
    endAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Índice composto para queries otimizadas
BannerSchema.index({ storeId: 1, active: 1, order: 1 });

// Método para verificar se o banner está ativo no período
BannerSchema.methods.isActiveNow = function () {
  if (!this.active) return false;

  const now = new Date();

  // Se tem startAt, verificar se já começou
  if (this.startAt && this.startAt > now) return false;

  // Se tem endAt, verificar se ainda não terminou
  if (this.endAt && this.endAt < now) return false;

  return true;
};

module.exports = mongoose.model('Banner', BannerSchema);
