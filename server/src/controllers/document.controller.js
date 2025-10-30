import Document from '../models/document.model.js';
import User from '../models/user.model.js';
import crypto from 'crypto';
// import { logActivity } from './activity.controller.js';

// Create document
export const createDocument = async (req, res) => {
  try {
    const { title, content, formatting, pages } = req.body;
    const userId = req.user.id;

    const document = new Document({
      title: title || 'Untitled Document',
      content: content || '',
      owner: userId,
      pages: pages || [{ id: 1, content: content || '', pageNumber: 1, headerText: '', footerText: '' }],
      formatting: formatting || {
        defaultFont: { family: 'Georgia', size: '12pt', lineHeight: '1.5', color: '#333333' },
        pageBorder: { enabled: false, color: '#FFD700', width: '2px', style: 'solid', position: 'all' },
        watermark: { enabled: false, type: 'text', text: 'CONFIDENTIAL', opacity: 0.3, size: 48, color: '#cccccc', rotation: 45 },
        pageNumbering: { enabled: true, position: 'bottom-right', format: '1' }
      },
      pageCount: pages ? pages.length : 1,
      wordCount: content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0
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

    // Validate ObjectId format
    if (!documentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }

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

    // Validate ObjectId format
    if (!documentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }

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

    // Validate ObjectId format
    if (!documentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }

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
    const { title, content, pages, formatting, saveVersion = false } = req.body;
    const userId = req.user.id;

    // Validate ObjectId format
    if (!documentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid document ID format' });
    }

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

    // Save version if requested or major changes
    if (saveVersion || (content && content !== document.content)) {
      const versionEntry = {
        version: document.version,
        content: document.content,
        timestamp: new Date(),
        author: userId,
        changes: title !== document.title ? 'Title and content updated' : 'Content updated'
      };
      
      document.versionHistory.push(versionEntry);
      // Keep only last 20 versions
      if (document.versionHistory.length > 20) {
        document.versionHistory = document.versionHistory.slice(-20);
      }
      document.version += 1;
    }

    // Update document fields
    if (title) document.title = title;
    if (content !== undefined) {
      document.content = content;
      document.wordCount = content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;
    }
    if (pages) {
      document.pages = pages;
      document.pageCount = pages.length;
    }
    if (formatting) {
      document.formatting = { ...document.formatting, ...formatting };
    }
    
    document.lastModified = new Date();

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

// Generate share link
export const generateShareLink = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { permission = 'view' } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner
    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can generate share links' });
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex');

    // Update document with share settings
    document.shareSettings = {
      isPublic: true,
      shareLink: shareToken,
      linkPermission: permission,
      createdAt: new Date()
    };

    await document.save();

    res.json({
      shareToken,
      permission,
      documentAddress: document.documentAddress,
      message: 'Share link generated successfully'
    });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get document by address
export const getDocumentByAddress = async (req, res) => {
  try {
    const { documentAddress } = req.params;
    const userId = req.user?.id;

    const document = await Document.findOne({ documentAddress })
      .populate('owner', 'fullName email')
      .populate('collaborators.user', 'fullName email')
      .populate('versionHistory.author', 'fullName email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access permissions
    const isOwner = userId && document.owner._id.toString() === userId;
    const isCollaborator = userId && document.collaborators.some(c => c.user._id.toString() === userId);
    const isPublic = document.shareSettings.isPublic;

    if (!isOwner && !isCollaborator && !isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Determine user permission
    let userPermission = 'view';
    if (isOwner) {
      userPermission = 'edit';
    } else if (isCollaborator) {
      const collaborator = document.collaborators.find(c => c.user._id.toString() === userId);
      userPermission = collaborator.permission;
    } else if (isPublic) {
      userPermission = document.shareSettings.linkPermission;
    }

    res.json({
      ...document.toObject(),
      userPermission
    });
  } catch (error) {
    console.error('Get document by address error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add collaborator to document
export const addCollaborator = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { email, permission = 'view' } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner
    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can add collaborators' });
    }

    // Find user by email
    const collaboratorUser = await User.findOne({ email });
    if (!collaboratorUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already a collaborator
    const existingCollaborator = document.collaborators.find(
      c => c.user.toString() === collaboratorUser._id.toString()
    );

    if (existingCollaborator) {
      // Update permission
      existingCollaborator.permission = permission;
    } else {
      // Add new collaborator
      document.collaborators.push({
        user: collaboratorUser._id,
        permission,
        addedAt: new Date()
      });
    }

    await document.save();
    await document.populate('collaborators.user', 'fullName email');

    res.json({
      message: 'Collaborator added successfully',
      collaborators: document.collaborators
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove collaborator
export const removeCollaborator = async (req, res) => {
  try {
    const { documentId, collaboratorId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner
    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can remove collaborators' });
    }

    // Remove collaborator
    document.collaborators = document.collaborators.filter(
      c => c.user.toString() !== collaboratorId
    );

    await document.save();

    res.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get document version history
export const getVersionHistory = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId)
      .populate('versionHistory.author', 'fullName email')
      .select('versionHistory owner collaborators');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access
    const isOwner = document.owner.toString() === userId;
    const isCollaborator = document.collaborators.some(c => c.user.toString() === userId);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(document.versionHistory.reverse()); // Latest first
  } catch (error) {
    console.error('Get version history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restore document version
export const restoreVersion = async (req, res) => {
  try {
    const { documentId } = req.params;
    const { versionNumber } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check permissions (only owner or edit collaborators)
    const isOwner = document.owner.toString() === userId;
    const collaborator = document.collaborators.find(c => c.user.toString() === userId);
    const canEdit = isOwner || (collaborator && collaborator.permission === 'edit');

    if (!canEdit) {
      return res.status(403).json({ message: 'No edit permission' });
    }

    // Find version
    const version = document.versionHistory.find(v => v.version === versionNumber);
    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Save current state as new version before restoring
    const currentVersion = {
      version: document.version,
      content: document.content,
      timestamp: new Date(),
      author: userId,
      changes: `Restored from version ${versionNumber}`
    };
    
    document.versionHistory.push(currentVersion);
    document.version += 1;

    // Restore content
    document.content = version.content;
    document.lastModified = new Date();
    document.wordCount = version.content ? version.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;

    await document.save();

    res.json({
      message: `Document restored to version ${versionNumber}`,
      document
    });
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search documents
export const searchDocuments = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user.id;

    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const searchQuery = {
      owner: userId,
      isDeleted: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    };

    const documents = await Document.find(searchQuery)
      .populate('collaborators.user', 'fullName email')
      .sort({ lastModified: -1 })
      .limit(20);

    res.json(documents);
  } catch (error) {
    console.error('Search documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export document as PDF with proper formatting
export const exportDocumentPDF = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check access
    const isOwner = document.owner.toString() === userId;
    const isCollaborator = document.collaborators.some(c => c.user.toString() === userId);
    const isPublic = document.shareSettings.isPublic;

    if (!isOwner && !isCollaborator && !isPublic) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Return document data for client-side PDF generation
    res.json({
      title: document.title,
      content: document.content,
      pages: document.pages,
      formatting: document.formatting,
      wordCount: document.wordCount,
      pageCount: document.pageCount
    });
  } catch (error) {
    console.error('Export document PDF error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};