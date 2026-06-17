import express from 'express';
import { getUsers, createUser, deleteUser, updateUser } from '../controllers/user.controller';
import { requireAuth, requireRoles } from '../middleware/auth.middleware';

const router = express.Router();

router.use(requireAuth);

// Admins and Managers can list users
router.route('/')
  .get(requireRoles(['Admin', 'Manager']), getUsers)
  .post(requireRoles(['Admin']), createUser);

router.route('/:id')
  .patch(requireRoles(['Admin']), updateUser)
  .delete(requireRoles(['Admin']), deleteUser);

export default router;
