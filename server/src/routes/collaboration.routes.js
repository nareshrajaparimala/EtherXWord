import express from 'express';
import {
  sendCollaborationRequest,
  respondToCollaborationRequest,
  generateShareLink,
  getCollaborationRequests,
  getCollaborativeDocuments,
  removeCollaborator,
  updateCollaboratorPermission,
  revokeShareLink,
  getDocumentSharingInfo
} from '../controllers/collaboration.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/request', authenticateToken, sendCollaborationRequest);
router.post('/respond', authenticateToken, respondToCollaborationRequest);
router.post('/share-link', authenticateToken, generateShareLink);
router.get('/requests', authenticateToken, getCollaborationRequests);
router.get('/documents', authenticateToken, getCollaborativeDocuments);
router.delete('/:documentId/collaborators/:collaboratorId', authenticateToken, removeCollaborator);
router.patch('/:documentId/collaborators/:collaboratorId', authenticateToken, updateCollaboratorPermission);
router.delete('/:documentId/share-link', authenticateToken, revokeShareLink);
router.get('/:documentId/sharing-info', authenticateToken, getDocumentSharingInfo);

export default router;