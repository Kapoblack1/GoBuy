const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone : { type: String, required: true },
  password: { type: String, required: true },
  isSeller: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  profileImage: { type: String, default: '' }, // Caminho da imagem de perfil
  isAdmin : { type : Boolean, default : false},
  
});

module.exports = mongoose.model('User', userSchema);
