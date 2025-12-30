
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmailVerification = require('../models/EmailVerification');
const PasswordReset = require('../models/PasswordReset');
const { generateOTP, sendVerificationEmail, sendAccountActivatedEmail, sendPasswordResetEmail } = require('../services/emailService');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Endpoint para verificar se email já existe
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }
    
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    
    res.json({ 
      exists: !!existingUser,
      message: existingUser ? 'Email já está em uso' : 'Email disponível'
    });
    
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

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

    // Validação de email no backend
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido.' });
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso.' });
    }

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
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isSeller,
      phone,
      profileImage: req.file.path,
      contasBancarias: contas, // salva lista de IBANs
      isEmailVerified: false, // Email não verificado inicialmente
      isActive: false // Conta não ativa até verificar email
    });

    await newUser.save();

    // Gerar e enviar código OTP
    const otpCode = generateOTP();
    
    // Salvar código de verificação no banco
    const emailVerification = new EmailVerification({
      email: newUser.email,
      code: otpCode,
      userId: newUser._id,
      type: 'registration'
    });
    
    await emailVerification.save();
    
    // Enviar email com código
    const emailResult = await sendVerificationEmail(newUser.email, otpCode, newUser.name);
    
    if (!emailResult.success) {
      console.error('[REGISTER] Erro ao enviar email de verificação:', emailResult.error);
      // Não falhar o registro se o email não foi enviado
    }

    res.status(201).json({ 
      message: 'Usuário registrado com sucesso! Verifique seu email para ativar a conta.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isEmailVerified: false,
        requiresVerification: true
      },
      emailSent: emailResult.success
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificar código OTP
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email e código são obrigatórios' });
    }

    // Buscar verificação pendente
    const verification = await EmailVerification.findOne({
      email: email.toLowerCase().trim(),
      code: code,
      isUsed: false
    });

    if (!verification) {
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }

    // Verificar tentativas
    if (verification.attempts >= 3) {
      return res.status(400).json({ error: 'Muitas tentativas. Solicite um novo código.' });
    }

    // Incrementar tentativas
    verification.attempts += 1;
    await verification.save();

    // Buscar usuário
    const user = await User.findById(verification.userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Marcar verificação como usada
    verification.isUsed = true;
    await verification.save();

    // Ativar conta do usuário
    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    user.isActive = true;
    await user.save();

    // Enviar email de confirmação
    await sendAccountActivatedEmail(user.email, user.name);

    res.json({
      message: 'Email verificado com sucesso! Sua conta foi ativada.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: true,
        isActive: true
      }
    });

  } catch (error) {
    console.error('[VERIFY-EMAIL] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Reenviar código OTP
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'Email já verificado' });
    }

    // Invalidar códigos anteriores
    await EmailVerification.updateMany(
      { email: user.email, isUsed: false },
      { isUsed: true }
    );

    // Gerar novo código
    const otpCode = generateOTP();
    
    const emailVerification = new EmailVerification({
      email: user.email,
      code: otpCode,
      userId: user._id,
      type: 'resend'
    });
    
    await emailVerification.save();
    
    // Enviar email
    const emailResult = await sendVerificationEmail(user.email, otpCode, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Erro ao enviar email' });
    }

    res.json({ 
      message: 'Novo código enviado para seu email',
      emailSent: true 
    });

  } catch (error) {
    console.error('[RESEND-VERIFICATION] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login (sem alterações)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    // 🔒 Verificar se a conta foi deletada (soft delete)
    if (user.isDeleted) {
      return res.status(403).json({ error: 'Esta conta foi desativada' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Senha incorreta' });

    // ✅ LOGIN PERMITIDO MESMO SEM VERIFICAÇÃO DE EMAIL
    // A verificação de email é opcional - apenas recomendada no registro

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    // Remover senha do objeto de resposta
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ token, user: userResponse });
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
      isActive: user.isActive ?? false,
      isEmailVerified: user.isEmailVerified ?? false,
      profileImage: user.profileImage 
        ? `${req.protocol}://${req.get('host')}/${user.profileImage}`
        : null,
      contasBancarias: user.contasBancarias || [],
      rating: user.rating ?? 0,
      totalRatings: user.totalRatings ?? 0,
      totalEarnings: user.totalEarnings ?? 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Atualizar dados do usuário
router.put('/:id', async (req, res) => {
  try {
    const { name, email, telefone, phone } = req.body;
    const userId = req.params.id;

    // Validações básicas
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const updateData = {
      name: name.trim(),
      email,
      telefone: telefone || phone, // aceita ambos os campos
      phone: telefone || phone      // mantém compatibilidade
    };

    const user = await User.findByIdAndUpdate(
      userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      telefone: user.telefone || user.phone,
      phone: user.phone || user.telefone,
      isSeller: user.isSeller,
      profileImage: user.profileImage 
        ? `${req.protocol}://${req.get('host')}/${user.profileImage}`
        : null,
      contasBancarias: user.contasBancarias || [],
      rating: user.rating ?? 0,
      totalRatings: user.totalRatings ?? 0
    });
  } catch (err) {
    console.error('Erro ao atualizar usuário:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Adicionar conta bancária
router.post('/:id/conta-bancaria', async (req, res) => {
  try {
    const { banco, iban } = req.body;
    const userId = req.params.id;

    // Validações
    if (!banco || !banco.trim()) {
      return res.status(400).json({ error: 'Nome do banco é obrigatório' });
    }

    if (!iban || !iban.trim()) {
      return res.status(400).json({ error: 'IBAN é obrigatório' });
    }

    // Limpar IBAN (remover espaços)
    const ibanLimpo = iban.replace(/\s/g, '');
    
    if (ibanLimpo.length < 10) {
      return res.status(400).json({ error: 'IBAN deve ter pelo menos 10 dígitos' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se o IBAN já existe
    const ibanExiste = user.contasBancarias?.some(conta => conta.iban === ibanLimpo);
    if (ibanExiste) {
      return res.status(400).json({ error: 'Este IBAN já está cadastrado' });
    }

    // Adicionar nova conta
    const novaConta = {
      banco: banco.trim(),
      iban: ibanLimpo
    };

    if (!user.contasBancarias) {
      user.contasBancarias = [];
    }

    user.contasBancarias.push(novaConta);
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      telefone: user.telefone || user.phone,
      phone: user.phone || user.telefone,
      isSeller: user.isSeller,
      profileImage: user.profileImage 
        ? `${req.protocol}://${req.get('host')}/${user.profileImage}`
        : null,
      contasBancarias: user.contasBancarias || [],
      rating: user.rating ?? 0,
      totalRatings: user.totalRatings ?? 0
    });
  } catch (err) {
    console.error('Erro ao adicionar conta bancária:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Remover conta bancária
router.delete('/:id/conta-bancaria/:contaId', async (req, res) => {
  try {
    const { id: userId, contaId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (!user.contasBancarias || user.contasBancarias.length === 0) {
      return res.status(404).json({ error: 'Nenhuma conta bancária encontrada' });
    }

    // Verificar se é a última conta
    if (user.contasBancarias.length <= 1) {
      return res.status(400).json({ error: 'Deve manter pelo menos uma conta bancária' });
    }

    // Remover a conta específica
    const contaIndex = user.contasBancarias.findIndex(conta => conta._id.toString() === contaId);
    
    if (contaIndex === -1) {
      return res.status(404).json({ error: 'Conta bancária não encontrada' });
    }

    user.contasBancarias.splice(contaIndex, 1);
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      telefone: user.telefone || user.phone,
      phone: user.phone || user.telefone,
      isSeller: user.isSeller,
      profileImage: user.profileImage 
        ? `${req.protocol}://${req.get('host')}/${user.profileImage}`
        : null,
      contasBancarias: user.contasBancarias || [],
      rating: user.rating ?? 0,
      totalRatings: user.totalRatings ?? 0
    });
  } catch (err) {
    console.error('Erro ao remover conta bancária:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:sellerId/rating
router.patch('/:sellerId/rating', async (req, res) => {
  const { sellerId } = req.params;
  console.log("[RATING] PATCH recebido! sellerId:", sellerId, "body:", req.body);
  const { rating } = req.body;
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: "Rating deve ser entre 0 e 5" });
  }
  console.log("[RATING] PATCH recebido para vendedor:", sellerId, "com rating:", rating);
  try {
    const user = await User.findById(sellerId);
    if (!user) {
      console.log("[RATING] Usuário não encontrado:", sellerId);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    console.log("[RATING] Usuário antes:", { rating: user.rating, totalRatings: user.totalRatings });
    // Calcula novo rating médio
    user.rating = ((user.rating * user.totalRatings) + rating) / (user.totalRatings + 1);
    user.totalRatings += 1;
    console.log("[RATING] Usuário depois:", { rating: user.rating, totalRatings: user.totalRatings });
    await user.save();
    console.log("[RATING] Usuário salvo no banco!");
    res.json({ message: "Rating atualizado!", user });
  } catch (err) {
    console.log("[RATING] Erro ao atualizar rating:", err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/auth/:buyerId/rating-buyer
router.patch('/:buyerId/rating-buyer', async (req, res) => {
  const { buyerId } = req.params;
  const { rating } = req.body;
  if (rating < 0 || rating > 5) {
    return res.status(400).json({ message: "Rating deve ser entre 0 e 5" });
  }
  console.log("[RATING-BUYER] PATCH recebido para comprador:", buyerId, "com rating:", rating);
  try {
    const user = await User.findById(buyerId);
    if (!user) {
      console.log("[RATING-BUYER] Usuário não encontrado:", buyerId);
      return res.status(404).json({ message: "Usuário não encontrado" });
    }
    console.log("[RATING-BUYER] Usuário antes:", { rating: user.rating, totalRatings: user.totalRatings });
    // Calcula novo rating médio
    user.rating = ((user.rating * user.totalRatings) + rating) / (user.totalRatings + 1);
    user.totalRatings += 1;
    console.log("[RATING-BUYER] Usuário depois:", { rating: user.rating, totalRatings: user.totalRatings });
    await user.save();
    console.log("[RATING-BUYER] Usuário salvo no banco!");
    res.json({ message: "Rating do comprador atualizado!", user });
  } catch (err) {
    console.log("[RATING-BUYER] Erro ao atualizar rating:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/:userId/profile-image - Upload de foto de perfil
router.post('/:userId/profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    console.log('[PROFILE-IMAGE] Upload para usuário:', userId, 'arquivo:', req.file.path);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Atualizar o caminho da imagem de perfil
    user.profileImage = req.file.path;
    await user.save();

    console.log('[PROFILE-IMAGE] Imagem atualizada com sucesso:', req.file.path);

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      telefone: user.telefone || user.phone,
      phone: user.phone || user.telefone,
      isSeller: user.isSeller,
      profileImage: user.profileImage,
      contasBancarias: user.contasBancarias || [],
      rating: user.rating ?? 0,
      totalRatings: user.totalRatings ?? 0
    });
  } catch (err) {
    console.error('[PROFILE-IMAGE] Erro no upload:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Salvar push token (melhorado)
router.post('/push-token', async (req, res) => {
  try {
    const { userId, pushToken, platform } = req.body;
    
    if (!userId || !pushToken) {
      return res.status(400).json({ error: 'userId e pushToken são obrigatórios' });
    }

    if (!pushToken.startsWith('ExponentPushToken[')) {
      return res.status(400).json({ error: 'Token de push inválido' });
    }

    console.log(`[AUTH] 📱 Registrando push token para usuário: ${userId} | Platform: ${platform}`);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        pushToken,
        platform: platform || 'unknown',
        pushTokenUpdatedAt: new Date(),
        $unset: { pushTokenInvalidatedAt: 1 } // Remove invalidação anterior
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    console.log(`[AUTH] ✅ Push token registrado para: ${user.name} | Token: ${pushToken.substring(0, 30)}...`);
    
    res.json({ 
      message: 'Push token registrado com sucesso',
      user: {
        id: user._id,
        name: user.name,
        pushToken: pushToken.substring(0, 30) + '...',
        platform: user.platform,
        registeredAt: user.pushTokenUpdatedAt
      }
    });
  } catch (err) {
    console.error('[AUTH] ❌ Erro ao registrar push token:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Verificar status do token de push
router.get('/push-token-status/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const hasValidToken = user.pushToken && user.pushToken.startsWith('ExponentPushToken[');
    const wasInvalidated = !!user.pushTokenInvalidatedAt;
    const needsReregistration = !hasValidToken || wasInvalidated;

    console.log(`[AUTH] 🔍 Status do token para ${user.name}:`, {
      hasValidToken,
      wasInvalidated,
      needsReregistration,
      lastUpdate: user.pushTokenUpdatedAt
    });

    res.json({
      needsReregistration,
      hasValidToken,
      wasInvalidated,
      lastUpdate: user.pushTokenUpdatedAt,
      invalidatedAt: user.pushTokenInvalidatedAt,
      userName: user.name
    });
  } catch (err) {
    console.error('[AUTH] ❌ Erro ao verificar status do token:', err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 Rota para alterar senha
router.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    // Validar nova senha
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Hash da nova senha
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      updatedAt: new Date()
    });

    console.log(`[AUTH] ✅ Senha alterada para usuário ${user.email}`);
    res.json({ message: 'Senha alterada com sucesso' });

  } catch (err) {
    console.error('[AUTH] ❌ Erro ao alterar senha:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 📌 Rota para deletar conta (SOFT DELETE)
router.delete('/delete-account', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'ID do usuário é obrigatório' });
    }

    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verificar se já foi deletado
    if (user.isDeleted) {
      return res.status(400).json({ error: 'Conta já foi deletada' });
    }

    // 🔒 SOFT DELETE - Marcar como inativa em vez de deletar fisicamente
    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletionReason: 'user_request',
      isActive: false
    });

    console.log(`[AUTH] 🔒 Conta marcada como deletada (soft delete): ${user.email}`);
    res.json({ message: 'Conta desativada com sucesso' });

  } catch (err) {
    console.error('[AUTH] ❌ Erro ao desativar conta:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 📌 Solicitar recuperação de senha
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Invalidar códigos anteriores
    await PasswordReset.updateMany(
      { email: user.email, used: false },
      { used: true }
    );

    // Gerar novo código
    const resetCode = generateOTP();
    
    const passwordReset = new PasswordReset({
      email: user.email,
      code: resetCode
    });
    
    await passwordReset.save();
    
    // Enviar email
    const emailResult = await sendPasswordResetEmail(user.email, resetCode, user.name);
    
    if (!emailResult.success) {
      return res.status(500).json({ error: 'Erro ao enviar email de recuperação' });
    }

    res.json({ 
      message: 'Código de recuperação enviado para seu email',
      emailSent: true 
    });

  } catch (error) {
    console.error('[FORGOT-PASSWORD] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 📌 Redefinir senha com código
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, código e nova senha são obrigatórios' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
    }

    // Buscar código de recuperação válido
    const passwordReset = await PasswordReset.findOne({
      email: email.toLowerCase().trim(),
      code: code,
      used: false
    });

    if (!passwordReset) {
      return res.status(400).json({ error: 'Código inválido ou expirado' });
    }

    // Buscar usuário
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha do usuário
    user.password = hashedPassword;
    await user.save();

    // Marcar código como usado
    passwordReset.used = true;
    await passwordReset.save();

    console.log(`[RESET-PASSWORD] ✅ Senha redefinida para usuário ${user.email}`);
    res.json({ message: 'Senha redefinida com sucesso' });

  } catch (error) {
    console.error('[RESET-PASSWORD] Erro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
