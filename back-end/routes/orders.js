const express = require('express');
const Order = require('../models/Order');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Fazer pedido
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { cartId, productLink, priceUSD, description, images } = req.body;

    const newOrder = new Order({
      cart: cartId,
      buyer: req.userId,
      productLink,
      priceUSD,
      description,
      images,
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar comprovativo
router.post('/:id/payment-proof', authMiddleware, async (req, res) => {
  try {
    const { paymentProofUrl } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });

    order.paymentProofUrl = paymentProofUrl;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ver pedidos do usuário
router.get('/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.userId }).populate('cart');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
