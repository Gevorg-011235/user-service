const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const verifyToken = require('./middleware/auth');
const User = require('./models/User');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
}));

// Подключение к MongoDB
mongoose.connect('mongodb://root:password@mongo:27017/auth-demo?authSource=admin')
  .then(() => {
    console.log('MongoDB connected');

    app.listen(3000, () => {
      console.log('🚀 Server started on port 3000');
    });
  })
  .catch(err => {
    console.error('❌ Mongo connection error:', err);
    process.exit(1);
  });

// Роуты auth
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Защищённый маршрут dashboard - получает свежие данные из БД
app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Пользователь заблокирован' });
    }
    res.json({
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      birthDate: user.birthDate,
      role: user.role,
      isActive: user.isActive,
      message: `Привет, ${user.username}! Ты авторизован 🎉`
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении данных' });
  }
});
