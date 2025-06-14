const express = require('express');
const multer = require('multer');
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
    const { platform, cartName, description, exchangeRate, openDate, closeDate } = req.body;

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
      isWaitingForDispute: false
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
    const carts = await Cart.find().populate('seller', 'name email rating profileImage').where('isOpen', true);
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

//ver carrinhos de um vendedor específico
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const carts = await Cart.find({
      seller: req.params.sellerId
    }).populate('seller', 'name email rating profileImage');
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

module.exports = router;
