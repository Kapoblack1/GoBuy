const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const authMiddleware = require('../middlewares/authMiddleware');

// Criar conversa (comprador e vendedor)
router.post('/conversation', authMiddleware, async (req, res) => {
  const { receiverId } = req.body;

  try {
    const existing = await Conversation.findOne({
      members: { $all: [req.userId, receiverId] }
    });

    if (existing) return res.json(existing);

    const conversation = new Conversation({
      members: [req.userId, receiverId]
    });

    const saved = await conversation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enviar mensagem
router.post('/message', authMiddleware, async (req, res) => {
  const { conversationId, text } = req.body;

  try {
    const message = new Message({
      conversationId,
      sender: req.userId,
      text
    });

    const saved = await message.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar mensagens de uma conversa
router.get('/messages/:conversationId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;