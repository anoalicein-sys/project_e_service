import { Response } from 'express';
import Feedback from '../models/Feedback';
import ServiceReport from '../models/ServiceReport';
import { AuthRequest } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Submit feedback for a report
// @route   POST /api/feedback
// @access  Private (Customer)
export const submitFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { reportId, rating, comments, customerSignature } = req.body;
  
  const report = await ServiceReport.findById(reportId);
  if (!report) {
    res.status(404);
    throw new Error('Service Report not found');
  }

  if (report.customerId.toString() !== req.user?.id) {
    res.status(403);
    throw new Error('Forbidden: You can only review your own reports');
  }

  const feedbackExists = await Feedback.findOne({ reportId });
  if (feedbackExists) {
    res.status(400);
    throw new Error('Feedback already submitted for this report');
  }

  const feedback = await Feedback.create({
    reportId,
    customerId: req.user.id,
    rating,
    comments
  });

  if (customerSignature) {
    report.customerSignature = customerSignature;
    await report.save();
  }

  res.status(201).json(feedback);
});

// @desc    Get feedback for a report
// @route   GET /api/feedback/:reportId
// @access  Private
export const getFeedback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const feedback = await Feedback.findOne({ reportId: req.params.reportId });
  res.json(feedback); // Can be null if no feedback
});
