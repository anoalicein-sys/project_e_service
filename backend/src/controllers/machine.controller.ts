import { Response } from 'express';
import Machine from '../models/Machine';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all machines (Scoped by Role)
// @route   GET /api/machines
// @access  Private
export const getMachines = async (req: AuthRequest, res: Response) => {
  try {
    let query = {};
    
    // ZERO-TRUST enforcement
    if (req.user?.role === 'Customer') {
      query = { customerId: req.user.id };
    }
    // Admin, Manager, and Engineer can see all machines, or we can scope further if needed.

    const machines = await Machine.find(query).populate('customerId', 'name email');
    res.json(machines);
  } catch (error) {
    console.error('Get Machines Error:', error);
    res.status(500).json({ message: 'Server error retrieving machines' });
  }
};

// @desc    Create a machine
// @route   POST /api/machines
// @access  Private (Admin, Manager)
export const createMachine = async (req: AuthRequest, res: Response) => {
  try {
    const { customerId, type, model, serialNo, installDate, status } = req.body;

    const existingMachine = await Machine.findOne({ serialNo });
    if (existingMachine) {
      return res.status(400).json({ message: 'Machine with this serial number already exists' });
    }

    const machine = await Machine.create({
      customerId,
      type,
      model,
      serialNo,
      installDate,
      status
    });

    res.status(201).json(machine);
  } catch (error) {
    console.error('Create Machine Error:', error);
    res.status(500).json({ message: 'Server error creating machine' });
  }
};

// @desc    Get single machine
// @route   GET /api/machines/:id
// @access  Private
export const getMachineById = async (req: AuthRequest, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id).populate('customerId', 'name email');

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // ZERO-TRUST enforcement
    if (req.user?.role === 'Customer' && machine.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this machine' });
    }

    res.json(machine);
  } catch (error) {
    console.error('Get Machine Error:', error);
    res.status(500).json({ message: 'Server error retrieving machine' });
  }
};

// @desc    Update a machine
// @route   PATCH /api/machines/:id
// @access  Private (Admin, Manager)
export const updateMachine = async (req: AuthRequest, res: Response) => {
  try {
    const { model, type, status, location } = req.body;
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    if (req.user?.role === 'Customer' && machine.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (model) machine.model = model;
    if (type) machine.type = type;
    if (status) machine.status = status;
    if (location) machine.location = location;

    const updatedMachine = await machine.save();
    res.json(updatedMachine);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating machine' });
  }
};

// @desc    Delete a machine
// @route   DELETE /api/machines/:id
// @access  Private (Admin)
export const deleteMachine = async (req: AuthRequest, res: Response) => {
  try {
    const machine = await Machine.findById(req.params.id);
    if (!machine) return res.status(404).json({ message: 'Machine not found' });
    
    await machine.deleteOne();
    res.json({ message: 'Machine removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting machine' });
  }
};
