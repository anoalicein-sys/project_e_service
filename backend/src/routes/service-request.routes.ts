import express from 'express';
import { getServiceRequests, createServiceRequest, assignEngineer } from '../controllers/service-request.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';
import { createServiceRequestSchema, assignEngineerSchema } from '../schemas/service-request.schema';

const router = express.Router();

router.use(requireAuth);

router.route('/')
  .get(getServiceRequests)
  .post(requireRoles(['Customer', 'Admin']), validate(createServiceRequestSchema), createServiceRequest);

router.route('/:id/assign')
  .patch(requireRoles(['Manager', 'Admin']), validate(assignEngineerSchema), assignEngineer);

export default router;
