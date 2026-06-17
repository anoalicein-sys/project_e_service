import express from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

const router = express.Router();

router.use(requireAuth);
router.get('/', requireRoles(['Admin']), getAuditLogs);

export default router;
