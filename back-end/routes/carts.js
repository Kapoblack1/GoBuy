const express = require('express');
const multer = require('multer');
const Order = require("../models/Order");
const Cart = require('../models/Cart'); // seu modelo mongoose
const authMiddleware = require('../middlewares/authMiddleware'); // middleware de autenticação
const path = require('path');
const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, 'uploads/'); // corrigido aqui
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});


const upload = multer({ storage: storage });
router.post('/', authMiddleware, upload.array('images'), async (req, res) => {
  try {
    const { platform, cartName, description, exchangeRate, openDate, closeDate, deliveryDate } = req.body;

    // Extrair caminhos das imagens salvas
    const imageUrls = req.files.map(file => file.path); // ou use `file.filename` se quiser salvar só o nome

    const newCart = new Cart({
      seller: req.userId,
      platform,
      cartName,
      description,
      exchangeRate,
      openDate,
      closeDate,
      imageUrls,
      avaluation: 0,
      avaluationCount: 0,
      // Status do carrinho
      // Inicializando todos os status como false, exceto isOpen
      isOpen: true,
      isClosed: false,
      isCancelled: false,
      isFinished: false,
      isPaid: false,
      isDelivered: false,
      isRefunded: false,
      isDisputed: false,
      isInProgress: false,
      isWaitingForPayment: false,
      isWaitingForDelivery: false,
      isWaitingForRefund: false,
      isWaitingForDispute: false,
      deliveryDays: parseInt(req.body.deliveryDays) || 0, // Garantindo que deliveryDays seja um número
      deliveryDate: deliveryDate // Convertendo para Date
    });

    await newCart.save();
    res.status(201).json(newCart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



// Ver todos carrinhos abertos
router.get('/', async (req, res) => {
  try {
    let carts = await Cart.find()
      .populate('seller', 'name email rating profileImage')
      .where('isOpen', true)
      .lean();

    // Adicionar quantidade de itens e total
    carts = await Promise.all(
      carts.map(async cart => {
        const orders = await Order.find({ cart: cart._id });

        const itemCount = orders.length;
        const totalPrice = orders.reduce((sum, order) => {
          return sum + (order.priceUSD * cart.exchangeRate);
        }, 0);

        return {
          ...cart,
          itemCount,
          totalPrice
        };
      })
    );

    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Ver detalhes de um carrinho
router.get('/:id', async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate('seller', 'name email rating profileImage');
    if (!cart) return res.status(404).json({ error: 'Carrinho não encontrado' });

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ver carrinhos de um vendedor específico
router.get('/seller/:sellerId', async (req, res) => {
  try {
    let carts = await Cart.find({
      seller: req.params.sellerId
    })
      .populate('seller', 'name email rating profileImage')
      .lean();

    // Adicionar quantidade de itens e preço total
    carts = await Promise.all(
      carts.map(async cart => {
        const orders = await Order.find({ cart: cart._id });

        const itemCount = orders.length;
        const totalPrice = orders.reduce((sum, order) => {
          return sum + (order.priceUSD * cart.exchangeRate);
        }, 0);

        return {
          ...cart,
          itemCount,
          totalPrice
        };
      })
    );

    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/platform/:platform', async (req, res) => {
  try {
    const platform = req.params.platform;
    const carts = await Cart.find({ platform }).populate('seller', 'name email rating profileImage');
    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/buyer/my-carts', authMiddleware, async (req, res) => {
  try {
    const buyerId = req.userId;

    // Buscar todos os pedidos do comprador
    const orders = await Order.find({ buyer: buyerId });

    // Extrair IDs únicos dos carrinhos
    const cartIds = [...new Set(orders.map(order => order.cart.toString()))];

    // Buscar os carrinhos
    const carts = await Cart.find({ _id: { $in: cartIds } })
      .populate('seller', 'name email phone rating profileImage contasBancarias')
      .lean();

    // Adicionar quantidade de itens e preço total
    const cartsWithCountAndTotal = await Promise.all(
      carts.map(async cart => {
        // Buscar todos os pedidos desse carrinho feitos pelo comprador atual
        const cartOrders = await Order.find({ cart: cart._id, buyer: buyerId });

        const itemCount = cartOrders.length;

        // Calcular total em KZ (priceUSD * exchangeRate)
        const totalPrice = cartOrders.reduce((sum, order) => {
          return sum + (order.priceUSD * cart.exchangeRate);
        }, 0);

        return {
          ...cart,
          itemCount,
          totalPrice // total já multiplicado pelo câmbio
        };
      })
    );

    res.status(200).json(cartsWithCountAndTotal);
  } catch (err) {
    console.error('Erro ao buscar carrinhos do comprador:', err);
    res.status(500).json({ error: 'Erro ao buscar carrinhos' });
  }
});


router.post("/:cartId/payment-proof", authMiddleware, upload.single("paymentProof"), async (req, res) => {
  try {
    const { cartId } = req.params;

    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ error: "Carrinho não encontrado" });

    // Remove comprovativo antigo desse comprador
    cart.paymentProofs = cart.paymentProofs.filter(
      proof => proof.buyer.toString() !== req.userId
    );

    // Adiciona novo comprovativo
    cart.paymentProofs.push({
      buyer: req.userId,
      proofUrl: req.file.path,
      paidAt: new Date()
    });

    // Inicializa buyerCartProgress se não existir
    if (!Array.isArray(cart.buyerCartProgress)) {
      cart.buyerCartProgress = [];
    }

    // Remove progresso antigo desse comprador
    cart.buyerCartProgress = cart.buyerCartProgress.filter(
      progress => progress.buyer.toString() !== req.userId
    );

    // Adiciona progresso inicial já como "Em Progresso"
    cart.buyerCartProgress.push({
      buyer: req.userId,
      status: "Em Progresso",
      updatedAt: new Date()
    });

    await cart.save();

    // 📌 Atualiza TODAS as orders desse carrinho para esse comprador
    await Order.updateMany(
      { cart: cartId, buyer: req.userId },
      { $set: { status: "Em Progresso" } }
    );

    res.json({ message: "Comprovativo adicionado, progresso e orders atualizados", cart });
  } catch (err) {
    console.error("Erro ao enviar comprovativo:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/cart/:cartId/buyer/:buyerId", async (req, res) => {
  try {
    const orders = await Order.find({
      cart: req.params.cartId,
      buyer: req.params.buyerId
    })
    .populate("product")
    .populate("buyer");

    res.json(orders); // ✅ Sempre JSON
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao buscar ordens" }); // ✅ JSON no erro
  }
});

// Ver carrinhos abertos de um vendedor específico
router.get('/seller/:sellerId/open', async (req, res) => {
  try {
    let carts = await Cart.find({
      seller: req.params.sellerId,
      status: { $ne: 'Fechado' }, // $ne = not equal
      isOpen: true // só carrinhos abertos

      
    })
      .populate('seller', 'name email rating profileImage')
      .lean();

    // Adicionar quantidade de itens e preço total
    carts = await Promise.all(
      carts.map(async cart => {
        const orders = await Order.find({ cart: cart._id });

        const itemCount = orders.length;
        const totalPrice = orders.reduce((sum, order) => {
          return sum + (order.priceUSD * cart.exchangeRate);
        }, 0);

        return {
          ...cart,
          itemCount,
          totalPrice
        };
      })
    );

    res.json(carts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/cart/:cartId/status
router.put('/cart/:cartId/status', async (req, res) => {
  const { status, buyerId } = req.body;

  try {
    // Atualiza todas as orders do carrinho
    await Order.updateMany(
      { cart: req.params.cartId },
      { $set: { status } }
    );

    // Atualiza o buyerCartProgress do comprador
    await BuyerCartProgress.updateOne(
      { buyer: buyerId, cart: req.params.cartId },
      { $set: { status } }
    );

    res.json({ message: `Carrinho e pedidos atualizados para ${status}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// PATCH /api/orders/:cartId/buyer-progress
// Atualiza o status do comprador no carrinho
router.patch('/:cartId/buyer-progress', async (req, res) => {
  const { cartId } = req.params;
  const { buyerId, status } = req.body;
  console.log("\n\n\nAtualizando status do comprador:", { cartId, buyerId, status });
  try {
    // Busca o carrinho
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return res.status(404).json({ message: 'Carrinho não encontrado.' });
    }
    console.log("Carrinho encontrado:", cart);
    // Atualiza o status do comprador específico
    let updated = false;
    cart.buyerCartProgress = cart.buyerCartProgress.map(item => {
      if (item.buyer.toString() === buyerId) {
        updated = true;
        return { ...item, status };
      }
      return item;
    });

    if (!updated) {
      return res.status(404).json({ message: 'Comprador não encontrado no carrinho.' });
    }

    await cart.save();
    console.log("Status do comprador atualizado:", cart.buyerCartProgress);
    res.json({ message: 'Status do comprador atualizado com sucesso!', cart });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar buyerCartProgress.', error: err });
  }
});


// Atualiza o cartProgress do comprador, incluindo status, rating, feedback e imagens
router.patch('/:cartId/buyer-progress-feed', async (req, res) => {
  const { cartId } = req.params;
  const { buyerId, status, rating, feedback, imagens } = req.body;

  try {
    const cart = await Cart.findById(cartId);
    if (!cart) return res.status(404).json({ message: 'Carrinho não encontrado.' });

    let updated = false;
    cart.buyerCartProgress = cart.buyerCartProgress.map(item => {
      // Garante que funciona se buyer for ObjectId ou objeto
      const itemBuyerId = item.buyer?._id ? item.buyer._id.toString() : item.buyer.toString();
      if (itemBuyerId === buyerId) {
        updated = true;
        return {
          ...item,
          status: status || item.status,
          rating: rating !== undefined ? rating : item.rating,
          feedback: feedback !== undefined ? feedback : item.feedback,
          imagens: imagens !== undefined ? imagens : item.imagens,
        };
      }
      return item;
    });

    if (!updated) return res.status(404).json({ message: 'Comprador não encontrado no carrinho.' });

    await cart.save();
    res.json({ message: 'Feedback salvo com sucesso!', cart });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao salvar feedback.', error: err });
  }
});





module.exports = router;
