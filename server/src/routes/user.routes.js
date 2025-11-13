import express from 'express';
import { updateSettings, getSettings } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticateToken);

router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
