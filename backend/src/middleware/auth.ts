import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

export default function verifyToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (!token) return res.status(401).json({ message: 'Доступ запрещен' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded as { userId: string; email: string; username: string };
    return next();
  } catch (err) {
    return res.status(403).json({ message: 'Неверный токен' });
  }
}

