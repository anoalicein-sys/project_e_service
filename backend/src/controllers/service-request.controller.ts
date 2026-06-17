import { Response } from 'express';
import ServiceRequest from '../models/ServiceRequest';
import Machine from '../models/Machine';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all service requests (Scoped)
// @route   GET /api/service-requests
// @access  Private
export const getServiceRequests = async (req: AuthRequest, res: Response) => {
  try {
    let query = {};
    
    // ZERO-TRUST enforcement
    if (req.user?.role === 'Customer') {
      query = { customerId: req.user.id };
    } else if (req.user?.role === 'Engineer') {
      query = { assignedEngineerId: req.user.id };
    }
    // Admin and Manager see all.

    const requests = await ServiceRequest.find(query)
      .populate('customerId', 'name email')
      .populate('machineId', 'type model serialNo')
      .populate('assignedEngineerId', 'name');
      
    res.json(requests);
  } catch (error) {
    console.error('Get Requests Error:', error);
    res.status(500).json({ message: 'Server error retrieving service requests' });
  }
};

// @desc    Create a service request
// @route   POST /api/service-requests
// @access  Private (Customer, Admin)
export const createServiceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { machineId, issueDescription } = req.body;
    
    // Verify machine exists and belongs to customer (if customer)
    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    if (req.user?.role === 'Customer' && machine.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this machine' });
    }

    // Identify customer ID based on role
    const customerId = req.user?.role === 'Customer' ? req.user.id : machine.customerId;

    const newRequest = await ServiceRequest.create({
      customerId,
      machineId,
      issueDescription,
      status: 'Open'
    });

    res.status(201).json(newRequest);
  } catch (error) {
    console.error('Create Request Error:', error);
    res.status(500).json({ message: 'Server error creating service request' });
  }
};

// @desc    Assign engineer to service request
// @route   PATCH /api/service-requests/:id/assign
// @access  Private (Manager, Admin)
export const assignEngineer = async (req: AuthRequest, res: Response) => {
  try {
    const { assignedEngineerId } = req.body;

    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest) {
      return res.status(404).json({ message: 'Service request not found' });
    }

    serviceRequest.assignedEngineerId = assignedEngineerId;
    serviceRequest.status = 'Assigned';
    await serviceRequest.save();

    res.json(serviceRequest);
  } catch (error) {
    console.error('Assign Engineer Error:', error);
    res.status(500).json({ message: 'Server error assigning engineer' });
  }
};
