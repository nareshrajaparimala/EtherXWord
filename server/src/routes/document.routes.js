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
  generateShareLink
} from '../controllers/document.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected routes
router.post('/', authenticateToken, createDocument);
router.get('/', authenticateToken, getUserDocuments);
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

// Public shared document routes
router.get('/shared/:shareToken', getSharedDocument);
router.put('/shared/:shareToken', updateSharedDocument);

export default router;