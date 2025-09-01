const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Garante que a pasta "uploads" exista
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// 📌 Registro com imagem de perfil e contas bancárias
router.post('/register', upload.single('profileImage'), async (req, res) => {
  try {
    const { name, email, password, isSeller, phone, contasBancarias } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Imagem de perfil obrigatória.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let contas = [];
    if (contasBancarias) {
      // Garantir que vem como array
      try {
        contas = JSON.parse(contasBancarias); // caso venha como string no multipart/form-data
      } catch (e) {
        contas = contasBancarias; // se já vier como array no JSON normal
      }
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isSeller,
      phone,
      profileImage: req.file.path,
      contasBancarias: contas // salva lista de IBANs
    });

    await newUser.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login (sem alterações)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Obter dados de um usuário pelo ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // sem senha
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isSeller: user.isSeller,
      profileImage: user.profileImage 
        ? `${req.protocol}://${req.get('host')}/${user.profileImage}`
        : null,
      contasBancarias: user.contasBancarias || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:sellerId/rating
router.patch('/auth/:sellerId/rating', async (req, res) => {
  const { sellerId } = req.params;
  const { rating } = req.body;
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: "Rating deve ser entre 0 e 5" });
  }
  console.log("Atualizando rating para:", sellerId, "com rating:", rating);
  try {
    const user = await User.findById(sellerId);
    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    // Calcula novo rating médio
    user.rating = ((user.rating * user.totalRatings) + rating) / (user.totalRatings + 1);
    user.totalRatings += 1;
    console.log("Novo rating:", user.rating, "Total ratings:", user.totalRatings);
    await user.save();
    res.json({ message: "Rating atualizado!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
