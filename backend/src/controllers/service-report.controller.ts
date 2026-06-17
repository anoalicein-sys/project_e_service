import { Response } from 'express';
import ServiceReport from '../models/ServiceReport';
import Machine from '../models/Machine';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateServiceReportPDF } from '../utils/pdfGenerator';
import { asyncHandler } from '../utils/asyncHandler';

// @desc    Get all service reports
// @route   GET /api/service-reports
// @access  Private (Scoped by role)
export const getServiceReports = asyncHandler(async (req: AuthRequest, res: Response) => {
  let query = {};
  
  if (req.user?.role === 'Customer') {
    query = { customerId: req.user.id };
  } else if (req.user?.role === 'Engineer') {
    query = { engineerId: req.user.id };
  }

  const reports = await ServiceReport.find(query)
    .populate('customerId', 'name email')
    .populate('machineId', 'model serialNo')
    .populate('engineerId', 'name email')
    .populate('requestId', 'issueDescription status');

  res.json(reports);
});

// @desc    Create a drafted service report
// @route   POST /api/service-reports
// @access  Private (Engineer)
export const createServiceReport = async (req: AuthRequest, res: Response) => {
  try {
    const { machineId } = req.body;

    const machine = await Machine.findById(machineId);
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    const report = await ServiceReport.create({
      ...req.body,
      customerId: machine.customerId,
      engineerId: req.user?.id,
      approvalStatus: 'Draft'
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ message: 'Server error creating report' });
  }
};

// @desc    Update and submit a drafted report
// @route   PATCH /api/service-reports/:id
// @access  Private (Engineer)
export const updateServiceReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await ServiceReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.engineerId.toString() !== req.user?.id) {
      return res.status(403).json({ message: 'Forbidden: You did not create this report' });
    }

    if (report.approvalStatus === 'Approved') {
      return res.status(400).json({ message: 'Cannot modify an approved report' });
    }

    const updatedReport = await ServiceReport.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );

    res.json(updatedReport);
  } catch (error) {
    console.error('Update Report Error:', error);
    res.status(500).json({ message: 'Server error updating report' });
  }
};

// @desc    Approve a service report
// @route   PATCH /api/service-reports/:id/approve
// @access  Private (Manager, Admin)
export const approveServiceReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await ServiceReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.approvalStatus = 'Approved';
    await report.save();

    res.json({ message: 'Report approved successfully', report });
  } catch (error) {
    console.error('Approve Report Error:', error);
    res.status(500).json({ message: 'Server error approving report' });
  }
};

// @desc    Generate PDF of an approved report
// @route   GET /api/service-reports/:id/pdf
// @access  Private (All roles, scoped)
export const getServiceReportPdf = async (req: AuthRequest, res: Response) => {
  try {
    const report = await ServiceReport.findById(req.params.id)
      .populate('customerId', 'name email')
      .populate('machineId', 'model serialNo')
      .populate('engineerId', 'name');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Zero-Trust Scope Checking
    if (req.user?.role === 'Customer' && report.customerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You do not own this report' });
    }
    if (req.user?.role === 'Engineer' && report.engineerId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You did not write this report' });
    }

    // Only approved reports can be exported to PDF
    if (report.approvalStatus !== 'Approved') {
      return res.status(400).json({ message: 'Can only generate PDF for Approved reports' });
    }

    const pdfBuffer = await generateServiceReportPDF(report.toObject());

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=ServiceReport_${report.reportNo}.pdf`,
      'Content-Length': pdfBuffer.length
    });

    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: 'Server error generating PDF' });
  }
};
