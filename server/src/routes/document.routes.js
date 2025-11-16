import express from 'express';
import multer from 'multer';
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
  searchDocuments,
  importDocx
} from '../controllers/document.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only DOCX files are allowed'), false);
    }
  }
});

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

// Import/Export routes
router.post('/import-docx', authenticateToken, upload.single('file'), importDocx);
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

// Quick document access by any identifier (ID or address)
router.get('/quick/:identifier', (req, res, next) => {
  // Optional authentication
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    return authenticateToken(req, res, next);
  }
  next();
}, async (req, res) => {
  // Redirect to appropriate endpoint based on identifier format
  const { identifier } = req.params;
  
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    // MongoDB ObjectId - redirect to document by ID
    req.params.documentId = identifier;
    return getDocument(req, res);
  } else {
    // Document address - redirect to document by address
    req.params.documentAddress = identifier;
    return getDocumentByAddress(req, res);
  }
});

// Public shared document routes
router.get('/shared/:shareToken', getSharedDocument);
router.put('/shared/:shareToken', updateSharedDocument);

export default router;