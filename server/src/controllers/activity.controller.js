import Activity from '../models/activity.model.js';
import Document from '../models/document.model.js';

// Log activity
export const logActivity = async (documentId, userId, action, details, metadata = {}) => {
  try {
    const activity = new Activity({
      document: documentId,
      user: userId,
      action,
      details,
      metadata
    });
    await activity.save();
    return activity;
  } catch (error) {
    console.error('Log activity error:', error);
  }
};

// Get document activities
export const getDocumentActivities = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    // Check if user has access to document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const isOwner = document.owner.toString() === userId;
    const isCollaborator = document.collaborators.some(c => c.user.toString() === userId);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const activities = await Activity.find({ document: documentId })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    console.error('Get document activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user activities
export const getUserActivities = async (req, res) => {
  try {
    const userId = req.user.id;

    const activities = await Activity.find({ user: userId })
      .populate('document', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(activities);
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};