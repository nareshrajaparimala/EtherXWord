import Document from '../models/document.model.js';
import User from '../models/user.model.js';

// Get documents shared with the user
export const getCollaborativeDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const documents = await Document.find({
      'collaborators.user': userId,
      isDeleted: false
    })
      .populate('owner', 'fullName email')
      .populate('collaborators.user', 'fullName email')
      .sort({ lastModified: -1 });

    // Add user permission info
    const enrichedDocuments = documents.map(doc => {
      const collaborator = doc.collaborators.find(c => c.user._id.toString() === userId);
      return {
        ...doc.toObject(),
        userPermission: collaborator?.permission || 'view',
        addedAt: collaborator?.addedAt
      };
    });

    res.json(enrichedDocuments);
  } catch (error) {
    console.error('Get collaborative documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get collaboration requests (documents where user is invited but hasn't responded)
export const getCollaborationRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // For now, return empty array as we don't have a separate requests system
    // In a full implementation, you'd have a separate CollaborationRequest model
    res.json([]);
  } catch (error) {
    console.error('Get collaboration requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Send collaboration invitation
export const sendCollaborationInvite = async (req, res) => {
  try {
    const { documentId, email, permission = 'view', message } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner
    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can send invitations' });
    }

    // Find user by email
    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Check if already a collaborator
    const existingCollaborator = document.collaborators.find(
      c => c.user.toString() === invitedUser._id.toString()
    );

    if (existingCollaborator) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Add collaborator directly (in a full system, you'd send an email invitation)
    document.collaborators.push({
      user: invitedUser._id,
      permission,
      addedAt: new Date()
    });

    await document.save();
    await document.populate('collaborators.user', 'fullName email');

    res.json({
      message: 'Collaboration invitation sent successfully',
      collaborator: {
        user: invitedUser,
        permission,
        addedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Send collaboration invite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update collaborator permission
export const updateCollaboratorPermission = async (req, res) => {
  try {
    const { documentId, collaboratorId } = req.params;
    const { permission } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Check if user is owner
    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can update permissions' });
    }

    // Find and update collaborator
    const collaborator = document.collaborators.find(
      c => c.user.toString() === collaboratorId
    );

    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }

    collaborator.permission = permission;
    await document.save();

    res.json({
      message: 'Collaborator permission updated successfully',
      permission
    });
  } catch (error) {
    console.error('Update collaborator permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Leave collaboration
export const leaveCollaboration = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Remove user from collaborators
    document.collaborators = document.collaborators.filter(
      c => c.user.toString() !== userId
    );

    await document.save();

    res.json({ message: 'Successfully left collaboration' });
  } catch (error) {
    console.error('Leave collaboration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get document activity/history
export const getDocumentActivity = async (req, res) => {
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

    // Return recent activity (last 50 entries)
    const recentActivity = document.versionHistory
      .slice(-50)
      .reverse()
      .map(entry => ({
        version: entry.version,
        author: entry.author,
        timestamp: entry.timestamp,
        changes: entry.changes,
        type: 'version_save'
      }));

    res.json(recentActivity);
  } catch (error) {
    console.error('Get document activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};