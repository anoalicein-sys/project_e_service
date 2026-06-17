import express from 'express';
import { login, bootstrapAdmin } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, registerAdminSchema } from '../schemas/auth.schema';

const router = express.Router();

router.post('/login', validate(loginSchema), login);
router.post('/bootstrap-admin', validate(registerAdminSchema), bootstrapAdmin);

export default router;
