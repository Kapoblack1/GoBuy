const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middlewares/authMiddleware");
const Cart = require('../models/Cart'); // seu modelo mongoose
const multer = require("multer");
const path = require('path');

const router = express.Router();

//configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Garante que a pasta "uploads" exista
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });
// Fazer pedido
router.post("/", authMiddleware, upload.array("images"), async (req, res) => {
  try {
    const { cart, productLink, priceUSD, description } = req.body;

    // Extrair caminhos das imagens salvas
    const imagens = req.files.map(file => file.path); // Use file.filename if needed

    const newOrder = new Order({
      cart,
      buyer: req.userId,
      productLink,
      priceUSD,
      description,
      images: imagens, // ✅ use files from multer
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Erro ao salvar pedido:", err);
    res.status(500).json({ error: err.message });
  }
});

// Atualizar comprovativo
// só para o comprovativo
router.post(
  "/:id/payment-proof",
  authMiddleware,
  upload.single("comprovativo"), // um arquivo
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ error: "Pedido não encontrado" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Arquivo não enviado." });
      }

      // salva o caminho no pedido
      order.paymentProofUrl = req.file.path;
      await order.save();

      res.json({
        message: "Comprovativo enviado com sucesso.",
        order,
      });
    } catch (err) {
      console.error("Erro ao enviar comprovativo:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


// GET /api/orders/myOrders
router.get('/myOrders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.userId }).populate('cart');
    res.status(200).json(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
});


// GET /api/orders/cart/:cartId/buyer/:buyerId
router.get('/cart/:cartId/buyer/:buyerId', async (req, res) => {
  const { cartId, buyerId } = req.params;

  try {
    const orders = await Order.find({
      cart: cartId,
      buyer: buyerId
    })
    .populate('cart')   // se quiser trazer info do carrinho
    .populate('buyer'); // se quiser trazer info do comprador

    res.json(orders);
  } catch (err) {
    console.error('Erro ao buscar ordens:', err);
    res.status(500).json({ message: 'Erro ao buscar ordens', error: err.message });
  }

  
});

// PATCH /api/orders/cart/:cartId/buyer/:buyerId/status
router.patch('/cart/:cartId/buyer/:buyerId/status', authMiddleware, async (req, res) => {
  const { cartId, buyerId } = req.params;
  const { status } = req.body;
  console.log("Atualizando status para:", status);
  console.log("Cart ID:", cartId);
  console.log("Buyer ID:", buyerId);

  try {
    // Validar status contra o enum
    const allowedStatus = ['Pedido Feito', 'Aceite', 'Em Progresso', 'Enviado', 'Entregue', 'Negado', 'Cancelado'];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ message: `Status inválido. Use um dos seguintes: ${allowedStatus.join(', ')}` });
    }

    // Atualizar todas as ordens do comprador nesse carrinho
    const result = await Order.updateMany(
      { cart: cartId, buyer: buyerId },
      { $set: { status } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Nenhum pedido encontrado para atualizar." });
    }
    if (result.modifiedCount === 0) {
      return res.status(200).json({ message: "Nenhum pedido foi alterado." });
    }
    console.log("Pedidos atualizados:", result.modifiedCount);
    

    res.json({ message: "Status atualizado com sucesso!", updatedCount: result.modifiedCount });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    res.status(500).json({ message: "Erro ao atualizar status", error: err.message });
  }
});



module.exports = router;
