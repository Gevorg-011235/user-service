const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

const verifyToken = (req, res, next) => {
  const token = req.cookies && req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Доступ запрещен' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // теперь req.user.email существует
    next();
  } catch (err) {
    res.status(403).json({ message: 'Неверный токен' });
  }
};

module.exports = verifyToken;
