import express from 'express';
import { submitFeedback, getFeedback } from '../controllers/feedback.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRoles(['Customer']), submitFeedback);
router.get('/:reportId', getFeedback);

export default router;
