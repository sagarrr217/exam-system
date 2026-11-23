import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, studentId, department, role = 'STUDENT' } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists.' });
      return;
    }

    if (studentId) {
      const existingStudentId = await prisma.user.findUnique({ where: { studentId } });
      if (existingStudentId) {
        res.status(400).json({ error: 'Student ID already assigned to another account.' });
        return;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
        studentId: role === 'STUDENT' ? studentId || `STU-${Date.now().toString().slice(-5)}` : null,
        department
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, studentId: user.studentId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register account.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (role && user.role !== role) {
      res.status(403).json({ error: `Unauthorized. This account does not have ${role} access.` });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, studentId: user.studentId },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn as any }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        department: user.department
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        department: true,
        createdAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
};
