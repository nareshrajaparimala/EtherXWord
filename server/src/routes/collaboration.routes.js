import express from 'express';
import {
  getCollaborativeDocuments,
  getCollaborationRequests,
  sendCollaborationInvite,
  updateCollaboratorPermission,
  leaveCollaboration,
  getDocumentActivity
} from '../controllers/collaboration.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get documents shared with user
router.get('/documents', getCollaborativeDocuments);

// Get collaboration requests
router.get('/requests', getCollaborationRequests);

// Send collaboration invitation
router.post('/invite', sendCollaborationInvite);

// Update collaborator permission
router.patch('/documents/:documentId/collaborators/:collaboratorId', updateCollaboratorPermission);

// Leave collaboration
router.delete('/documents/:documentId/leave', leaveCollaboration);

// Get document activity
router.get('/documents/:documentId/activity', getDocumentActivity);

export default router;