import { Request, Response } from 'express';
import User from '../models/User';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true }).select('+passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id.toString(), user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// A utility route to bootstrap the first admin account
export const bootstrapAdmin = async (req: Request, res: Response) => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin user already exists. Bootstrap disabled.' });
    }

    const { name, email, password } = req.body;
    const passwordHash = await hashPassword(password);

    const admin = await User.create({
      name,
      email,
      passwordHash,
      role: 'Admin',
      isActive: true
    });

    res.status(201).json({ message: 'Admin user created successfully', email: admin.email });
  } catch (error) {
    console.error('Bootstrap Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
