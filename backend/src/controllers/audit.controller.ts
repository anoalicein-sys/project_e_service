import { Response } from 'express';
import AuditLog from '../models/AuditLog';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin)
export const getAuditLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const logs = await AuditLog.find()
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(100); // Last 100 logs for performance
  res.json(logs);
});
