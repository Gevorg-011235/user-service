import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import verifyToken from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user?.userId);
    if (!currentUser) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    if (!currentUser.isActive) {
      return res.status(403).json({ message: 'Пользователь заблокирован' });
    }
    req.currentUser = currentUser;
    return next();
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка при проверке пользователя' });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Некорректный ID' });
  }

  const isSelf = req.currentUser?._id.toString() === id;
  const isAdmin = req.currentUser?.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка при получении пользователя' });
  }
});

router.get('/', async (req, res) => {
  if (req.currentUser?.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const users = await User.find().select('-password');
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка при получении списка пользователей' });
  }
});

router.patch('/:id/block', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Некорректный ID' });
  }

  const isSelf = req.currentUser?._id.toString() === id;
  const isAdmin = req.currentUser?.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }
  if (isSelf && isAdmin) {
    return res.status(400).json({ message: 'Администратор не может заблокировать сам себя' });
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
    return res.json({ message: 'Пользователь заблокирован', user });
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка при блокировке пользователя' });
  }
});

router.patch('/:id/unblock', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Некорректный ID' });
  }

  const isSelf = req.currentUser?._id.toString() === id;
  const isAdmin = req.currentUser?.role === 'admin';

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ message: 'Доступ запрещен' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    return res.json({ message: 'Пользователь разблокирован', user });
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка при разблокировке пользователя' });
  }
});

export default router;

