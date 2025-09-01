const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productLink: { type: String, required: true },
  priceUSD: { type: Number, required: true },
  description: { type: String },
  images: { type: [String], required: true }, // <--- alterado para array
  paymentProofUrl: { type: String },
  status: {
    type: String,
    enum: ['Pedido Feito', 'Aceite', 'Em Progresso', 'Enviado', 'Entregue','Negado', 'Cancelado'],
    default: 'Pedido Feito',
  },
});

module.exports = mongoose.model('Order', orderSchema);
