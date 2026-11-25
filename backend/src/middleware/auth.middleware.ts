import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../config/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'STUDENT';
  studentId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No authorization token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true
      }
    });

    if (!dbUser) {
      res.status(401).json({ error: 'Session account no longer exists. Please sign in again.' });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role as 'ADMIN' | 'STUDENT',
      studentId: dbUser.studentId
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired authorization token.' });
    return;
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden. Administrator privileges required.' });
    return;
  }
  next();
};

export const requireStudent = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({ error: 'Forbidden. Student privileges required.' });
    return;
  }
  next();
};
