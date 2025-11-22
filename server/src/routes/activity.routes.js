import express from 'express';
import { getDocumentActivities, getUserActivities } from '../controllers/activity.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/document/:documentId', authenticateToken, getDocumentActivities);
router.get('/user', authenticateToken, getUserActivities);

export default router;