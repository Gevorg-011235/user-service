import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import verifyToken from './middleware/auth.js';
import User from './models/User.js';

const app = express();

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

app.use(
  cors({
    origin: corsOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false
  })
);

const MONGO_URI =
  process.env.MONGO_URI ??
  'mongodb://root:password@mongo:27017/auth-demo?authSource=admin';

mongoose
  .connect(MONGO_URI)
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

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Пользователь заблокирован' });
    }
    return res.json({
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      birthDate: user.birthDate,
      role: user.role,
      isActive: user.isActive,
      message: `Привет, ${user.username}! Ты авторизован 🎉`
    });
  } catch (err) {
    return res.status(500).json({ message: 'Ошибка при получении данных' });
  }
});

