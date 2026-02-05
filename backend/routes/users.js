const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

const router = express.Router();

// Middleware to load current user and ensure active
router.use(verifyToken);
router.use(async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.userId);
    if (!currentUser) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    if (!currentUser.isActive) {
      return res.status(403).json({ message: 'Пользователь заблокирован' });
    }
    req.currentUser = currentUser;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при проверке пользователя' });
  }
});

// GET /api/users/:id — admin или сам
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Некорректный ID' });
  }

  const isSelf = req.currentUser._id.toString() === id;
  const isAdmin = req.currentUser.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении пользователя' });
  }
});

// GET /api/users — только admin
router.get('/', async (req, res) => {
  if (req.currentUser.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

// PATCH /api/users/:id/block — admin или сам
router.patch('/:id/block', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Некорректный ID' });
  }

  const isSelf = req.currentUser._id.toString() === id;
  const isAdmin = req.currentUser.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({ message: 'Пользователь заблокирован', user });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при блокировке пользователя' });
  }
});

module.exports = router;
