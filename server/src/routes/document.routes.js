import express from 'express';
import {
  createDocument,
  getUserDocuments,
  getFavoriteDocuments,
  getTrashDocuments,
  getDocument,
  updateDocument,
  toggleFavorite,
  moveToTrash,
  restoreFromTrash,
  permanentlyDelete,
  setStartDocument,
  getSharedDocument,
  updateSharedDocument,
  generateShareLink,
  getDocumentByAddress,
  addCollaborator,
  removeCollaborator,
  getVersionHistory,
  restoreVersion,
  exportDocumentPDF,
  searchDocuments
} from '../controllers/document.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, createDocument);
router.get('/', authenticateToken, getUserDocuments);
router.get('/search', authenticateToken, searchDocuments);
router.get('/favorites', authenticateToken, getFavoriteDocuments);
router.get('/trash', authenticateToken, getTrashDocuments);
router.get('/:documentId', authenticateToken, getDocument);
router.put('/:documentId', authenticateToken, updateDocument);
router.patch('/:documentId/favorite', authenticateToken, toggleFavorite);
router.patch('/:documentId/trash', authenticateToken, moveToTrash);
router.patch('/:documentId/restore', authenticateToken, restoreFromTrash);
router.delete('/:documentId/permanent', authenticateToken, permanentlyDelete);
router.patch('/:documentId/start', authenticateToken, setStartDocument);
router.post('/:documentId/share', authenticateToken, generateShareLink);

// Collaboration routes
router.post('/:documentId/collaborators', authenticateToken, addCollaborator);
router.delete('/:documentId/collaborators/:collaboratorId', authenticateToken, removeCollaborator);

// Version control routes
router.get('/:documentId/versions', authenticateToken, getVersionHistory);
router.post('/:documentId/restore-version', authenticateToken, restoreVersion);

// Export routes
router.get('/:documentId/export/pdf', authenticateToken, exportDocumentPDF);

// Document access by address (with optional auth)
router.get('/address/:documentAddress', (req, res, next) => {
  // Optional authentication - if token exists, authenticate, otherwise continue
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return authenticateToken(req, res, next);
  }
  next();
}, getDocumentByAddress);

// Public shared document routes
router.get('/shared/:shareToken', getSharedDocument);
router.put('/shared/:shareToken', updateSharedDocument);

export default router;