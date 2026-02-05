import type { JwtPayload } from 'jsonwebtoken';
import type { IUserDoc } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { userId: string; email: string; username: string };
      currentUser?: IUserDoc;
    }
  }
}

export {};

