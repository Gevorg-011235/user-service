const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: isProduction,
  maxAge: 60 * 60 * 1000
};

const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const trimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmed);
};

const isValidUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 30) return false;
  if (/\s/.test(trimmed)) return false;
  return true;
};

const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 6;
};

const isValidFullName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return false;
  const trimmed = fullName.trim();
  return trimmed.length >= 3 && trimmed.length <= 100;
};

const isValidBirthDate = (birthDate) => {
  if (!birthDate) return false;
  const parsed = new Date(birthDate);
  return !Number.isNaN(parsed.getTime());
};

// REGISTER
router.post('/register', async (req, res) => {
  const { email, username, password, fullName, birthDate } = req.body;

  // Проверка на пустые поля
  if (!email || !username || !password || !fullName || !birthDate) {
    return res.status(400).json({ message: 'Все поля обязательны' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Некорректный email' });
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({ message: 'Имя пользователя должно быть от 3 до 30 символов без пробелов' });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
  }

  const parsedBirthDate = new Date(birthDate);
  if (Number.isNaN(parsedBirthDate.getTime())) {
    return res.status(400).json({ message: 'Некорректная дата рождения' });
  }

  try {
    // Проверка на существующий email или username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Email или username уже зарегистрирован' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email,
      username,
      fullName: fullName.trim(),
      birthDate: parsedBirthDate,
      password: hashedPassword
    });
    res.json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email и пароль обязательны' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Некорректный email' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Пользователь заблокирован' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    // JWT содержит userId, email и username
    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('token', token, cookieOptions);
    res.json({ email: user.email, username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при входе' });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction
  });
  res.json({ message: 'Вы вышли из системы' });
});

// GET PROFILE - получить данные профиля текущего пользователя
router.get('/profile', verifyToken, async (req, res) => {
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
      birthDate: user.birthDate
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
});

// UPDATE PROFILE - обновить данные профиля
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { email, username, password, fullName, birthDate } = req.body;
    const userId = req.user.userId;

    // Проверка пустых полей
    if (!email || !username || !fullName || !birthDate) {
      return res.status(400).json({ message: 'Email, username, ФИО и дата рождения обязательны' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Некорректный email' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ message: 'Имя пользователя должно быть от 3 до 30 символов без пробелов' });
    }

    if (!isValidFullName(fullName)) {
      return res.status(400).json({ message: 'ФИО должно быть от 3 до 100 символов' });
    }

    if (!isValidBirthDate(birthDate)) {
      return res.status(400).json({ message: 'Некорректная дата рождения' });
    }

    // Проверка на уникальность email и username
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
      _id: { $ne: userId } // исключаем текущего пользователя
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email или username уже используется' });
    }

    const updateData = {
      email,
      username,
      fullName: fullName.trim(),
      birthDate: new Date(birthDate)
    };

    // Если пользователь хочет изменить пароль
    if (password) {
      if (!isValidPassword(password)) {
        return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов' });
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json({
      message: 'Профиль успешно обновлен',
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      birthDate: user.birthDate
    });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка при обновлении профиля' });
  }
});

module.exports = router;
