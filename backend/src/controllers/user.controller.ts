import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import bcrypt from 'bcrypt';

// @desc    Get all users (optionally filter by role)
// @route   GET /api/users
// @access  Private (Admin, Manager)
export const getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { role } = req.query;
  const query: any = role ? { role } : {};
  
  if (req.user?.role === 'Manager') {
    if (role === 'Customer') {
      // Manager can see all customers to register machines and assign tickets
      query.role = 'Customer';
    } else {
      // Otherwise, restrict managers to seeing ONLY their assigned engineers
      query.role = 'Engineer';
      query.managerId = req.user.id;
    }
  }

  const users = await User.find(query).select('-passwordHash').populate('managerId', 'name');
  res.json(users);
});

// @desc    Create a user
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, password, role, managerId } = req.body;
  
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name, email, passwordHash, role, managerId: managerId || null
  });

  res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

// @desc    Update a user
// @route   PATCH /api/users/:id
// @access  Private (Admin)
export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, email, role, managerId, isActive } = req.body;
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  user.managerId = managerId !== undefined ? managerId : user.managerId;
  user.isActive = isActive !== undefined ? isActive : user.isActive;

  const updatedUser = await user.save();
  res.json({ id: updatedUser._id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, isActive: updatedUser.isActive });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  
  await user.deleteOne();
  res.json({ message: 'User removed' });
});
