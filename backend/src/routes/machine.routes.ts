import express from 'express';
import { getMachines, createMachine, getMachineById } from '../controllers/machine.controller';
import { validate } from '../middleware/validate.middleware';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';
import { createMachineSchema } from '../schemas/machine.schema';

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(requireAuth);

router.route('/')
  .get(getMachines)
  .post(requireRoles(['Admin', 'Manager']), validate(createMachineSchema), createMachine);

router.route('/:id')
  .get(getMachineById);

export default router;
