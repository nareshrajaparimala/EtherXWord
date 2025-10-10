import Document from '../models/document.model.js';
import User from '../models/user.model.js';
// import { logActivity } from './activity.controller.js';

// Create document
export const createDocument = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const document = new Document({
      title: title || 'Untitled Document',
      content: content || '',
      owner: userId
    });

    await document.save();
    // await logActivity(document._id, userId, 'created', `Created document "${document.title}"`);
    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's documents
export const getUserDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const documents = await Document.find({ owner: userId, isDeleted: false })
      .populate('collaborators.user', 'fullName email')
      .sort({ lastModified: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get user documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get favorite documents
export const getFavoriteDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const documents = await Document.find({ owner: userId, isFavorite: true, isDeleted: false })
      .populate('collaborators.user', 'fullName email')
      .sort({ lastModified: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get favorite documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trash documents
export const getTrashDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const documents = await Document.find({ owner: userId, isDeleted: true })
      .populate('collaborators.user', 'fullName email')
      .sort({ deletedAt: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get trash documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle favorite
export const toggleFavorite = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findOne({ _id: documentId, owner: userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.isFavorite = !document.isFavorite;
    await document.save();

    res.json({ message: `Document ${document.isFavorite ? 'added to' : 'removed from'} favorites` });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Move to trash
export const moveToTrash = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findOne({ _id: documentId, owner: userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.isDeleted = true;
    document.deletedAt = new Date();
    await document.save();

    res.json({ message: 'Document moved to trash' });
  } catch (error) {
    console.error('Move to trash error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restore from trash
export const restoreFromTrash = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findOne({ _id: documentId, owner: userId, isDeleted: true });
    if (!document) {
      return res.status(404).json({ message: 'Document not found in trash' });
    }

    document.isDeleted = false;
    document.deletedAt = null;
    await document.save();

    res.json({ message: 'Document restored from trash' });
  } catch (error) {
    console.error('Restore from trash error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Permanently delete
export const permanentlyDelete = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findOneAndDelete({ _id: documentId, owner: userId, isDeleted: true });
    if (!document) {
      return res.status(404).json({ message: 'Document not found in trash' });
    }

    res.json({ message: 'Document permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Set start document
export const setStartDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    // Remove start document flag from all user documents
    await Document.updateMany({ owner: userId }, { isStartDocument: false });

    // Set new start document
    const document = await Document.findOne({ _id: documentId, owner: userId });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    document.isStartDocument = true;
    await document.save();

    res.json({ message: 'Start document updated' });
  } catch (error) {
    console.error('Set start document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get document by ID
export const getDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId)
      .populate('owner', 'fullName email')
      .populate('collaborators.user', 'fullName email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user has access
    const isOwner = document.owner._id.toString() === userId;
    const isCollaborator = document.collaborators.some(c => c.user._id.toString() === userId);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permissions
    const isOwner = document.owner.toString() === userId;
    const collaborator = document.collaborators.find(c => c.user.toString() === userId);
    const canEdit = isOwner || (collaborator && collaborator.permission === 'edit');

    if (!canEdit) {
      return res.status(403).json({ message: 'No edit permission' });
    }

    document.title = title || document.title;
    document.content = content || document.content;
    document.lastModified = new Date();
    document.wordCount = content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;

    await document.save();
    // await logActivity(documentId, userId, 'edited', `Updated document "${document.title}"`);
    res.json(document);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get shared document by token
export const getSharedDocument = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const document = await Document.findOne({ 'shareSettings.shareLink': shareToken })
      .populate('owner', 'fullName email');

    if (!document || !document.shareSettings.isPublic) {
      return res.status(404).json({ message: 'Shared document not found' });
    }

    res.json({
      ...document.toObject(),
      permission: document.shareSettings.linkPermission
    });
  } catch (error) {
    console.error('Get shared document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update shared document
export const updateSharedDocument = async (req, res) => {
  try {
    const { shareToken } = req.params;
    const { content } = req.body;

    const document = await Document.findOne({ 'shareSettings.shareLink': shareToken });

    if (!document || !document.shareSettings.isPublic) {
      return res.status(404).json({ message: 'Shared document not found' });
    }

    if (document.shareSettings.linkPermission !== 'edit') {
      return res.status(403).json({ message: 'No edit permission for this shared link' });
    }

    document.content = content;
    document.lastModified = new Date();
    document.wordCount = content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;

    await document.save();
    res.json(document);
  } catch (error) {
    console.error('Update shared document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};