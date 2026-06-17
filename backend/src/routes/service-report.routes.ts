import express from 'express';
import { 
  createServiceReport, 
  updateServiceReport, 
  approveServiceReport, 
  getServiceReportPdf 
} from '../controllers/service-report.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';
import { auditLogger } from '../middleware/audit.middleware';
import { createServiceReportSchema, updateServiceReportSchema } from '../schemas/service-report.schema';

const router = express.Router();

router.use(requireAuth);
router.use(auditLogger('ServiceReport'));

router.route('/')
  .post(requireRoles(['Engineer', 'Admin']), validate(createServiceReportSchema), createServiceReport);

router.route('/:id')
  .patch(requireRoles(['Engineer', 'Admin']), validate(updateServiceReportSchema), updateServiceReport);

router.route('/:id/approve')
  .patch(requireRoles(['Manager', 'Admin']), approveServiceReport);

router.route('/:id/pdf')
  .get(getServiceReportPdf);

export default router;
