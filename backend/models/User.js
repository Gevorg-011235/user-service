const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  birthDate: { type: Date, required: false },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user', required: true },
  isActive: { type: Boolean, default: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
