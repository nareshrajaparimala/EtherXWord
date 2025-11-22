import Document from '../models/document.model.js';
import CollaborationRequest from '../models/collaboration.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import { sendEmail } from '../utils/email.util.js';
// import { logActivity } from './activity.controller.js';
import crypto from 'crypto';

// Send collaboration request
export const sendCollaborationRequest = async (req, res) => {
  try {
    console.log('Collaboration request received:', req.body);
    console.log('User:', req.user);
    
    const { documentId, email, permission, message, documentTitle } = req.body;
    const senderId = req.user.id;

    if (!email || !permission) {
      return res.status(400).json({ message: 'Email and permission are required' });
    }

    // Find or create document for collaboration
    let document;
    if (documentId && documentId !== 'temp-doc-id') {
      document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      // Check if user is owner
      if (document.owner.toString() !== senderId) {
        return res.status(403).json({ message: 'Only document owner can send collaboration requests' });
      }
    } else {
      // Create new document for collaboration
      document = new Document({
        title: documentTitle || 'Untitled Document',
        content: '',
        owner: senderId
      });
      await document.save();
    }
    console.log('Using document:', document._id);

    // Find recipient by email
    const recipient = await User.findOne({ email: email.toLowerCase() });
    if (!recipient) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    console.log('Recipient found:', recipient.email);

    // Check if already collaborating
    const existingCollab = document.collaborators.find(c => c.user.toString() === recipient._id.toString());
    if (existingCollab) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    // Check for existing pending request
    const existingRequest = await CollaborationRequest.findOne({
      document: document._id,
      recipient: recipient._id,
      status: 'pending'
    });
    if (existingRequest) {
      return res.status(400).json({ message: 'Collaboration request already sent to this user' });
    }

    // Create collaboration request
    const request = new CollaborationRequest({
      document: document._id,
      sender: senderId,
      recipient: recipient._id,
      recipientEmail: email,
      permission,
      message: message || ''
    });
    await request.save();
    console.log('Collaboration request saved:', request._id);

    // Create notification
    const notification = new Notification({
      recipient: recipient._id,
      type: 'collaboration_request',
      title: 'New Collaboration Request',
      message: `${req.user.fullName} invited you to collaborate on "${document.title}"`,
      data: {
        documentId: document._id,
        requestId: request._id,
        senderId
      }
    });
    await notification.save();
    console.log('Notification created');

    // Try to send email (don't fail if email fails)
    try {
      const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Collaboration Request - EtherXWord</title>
        </head>
        <body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: #1a1a1a; border-radius: 16px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3); border: 1px solid #333;">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #ffd700; font-size: 2.5rem; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);">
                  EtherXWord
                </h1>
                <p style="color: #cccccc; font-size: 1.1rem; margin: 10px 0 0 0;">Document Collaboration Platform</p>
              </div>
              
              <!-- Collaboration Icon -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #ffd700, #ffed4e); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 20px;">👥</div>
              </div>
              
              <!-- Content -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h2 style="color: #ffffff; font-size: 1.8rem; margin: 0 0 20px 0;">🤝 Collaboration Request</h2>
                <p style="color: #cccccc; font-size: 1.1rem; line-height: 1.6; margin: 0 0 30px 0;">
                  Hello <strong style="color: #ffd700;">${recipient.fullName}</strong>,<br>
                  <strong style="color: #ffd700;">${req.user.fullName}</strong> has invited you to collaborate!
                </p>
              </div>
              
              <!-- Document Info Box -->
              <div style="background: #0a0a0a; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #ffd700;">
                <h3 style="color: #ffd700; margin: 0 0 15px 0; font-size: 1.2rem;">📄 Document Details</h3>
                <p style="color: #cccccc; margin: 8px 0; font-size: 1rem;"><strong>Title:</strong> "${document.title}"</p>
                <p style="color: #cccccc; margin: 8px 0; font-size: 1rem;"><strong>Permission:</strong> 
                  <span style="background: ${permission === 'edit' ? '#28a745' : '#6c757d'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
                    ${permission === 'edit' ? '✏️ Can Edit' : '👁️ Can View'}
                  </span>
                </p>
                ${message ? `<p style="color: #cccccc; margin: 15px 0 0 0; font-size: 1rem;"><strong>Message:</strong></p><div style="background: #1a1a1a; padding: 15px; border-radius: 8px; margin-top: 10px; font-style: italic; color: #e0e0e0;">"${message}"</div>` : ''}
              </div>
              
              <!-- Action Buttons -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display: inline-block; background: linear-gradient(135deg, #ffd700, #ffed4e); color: #000000; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1.1rem; box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3); margin: 0 10px;">
                  🚀 View Request
                </a>
              </div>
              
              <!-- Instructions -->
              <div style="background: #0a0a0a; border-radius: 8px; padding: 20px; margin: 30px 0; border-left: 4px solid #17a2b8;">
                <p style="color: #cccccc; font-size: 0.9rem; margin: 0; line-height: 1.5;">
                  <strong style="color: #17a2b8;">📋 Next Steps:</strong><br>
                  • Log in to your EtherXWord account<br>
                  • Go to the Collaboration section<br>
                  • Accept or decline this request<br>
                  • Start collaborating on the document!
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #333;">
                <p style="color: #888888; font-size: 0.8rem; margin: 0;">
                  This collaboration request was sent via EtherXWord<br>
                  © 2024 EtherXWord. All rights reserved.
                </p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `;
      
      await sendEmail(
        email,
        '🤝 Collaboration Request - EtherXWord',
        emailHTML
      );
      console.log('Email sent successfully');
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message);
      // Continue without failing the request
    }

    res.json({ message: 'Collaboration request sent successfully' });
  } catch (error) {
    console.error('Send collaboration request error:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      user: req.user
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message
    });
  }
};

// Respond to collaboration request
export const respondToCollaborationRequest = async (req, res) => {
  try {
    const { requestId, action } = req.body; // action: 'accept' or 'reject'
    const userId = req.user.id;

    const request = await CollaborationRequest.findById(requestId)
      .populate('document')
      .populate('sender', 'fullName email');

    if (!request) {
      return res.status(404).json({ message: 'Collaboration request not found' });
    }

    if (request.recipient.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already responded to' });
    }

    request.status = action === 'accept' ? 'accepted' : 'rejected';
    request.respondedAt = new Date();
    await request.save();

    if (action === 'accept') {
      // Add user as collaborator
      await Document.findByIdAndUpdate(request.document._id, {
        $push: {
          collaborators: {
            user: userId,
            permission: request.permission
          }
        }
      });

      // Notify sender of acceptance
      const notification = new Notification({
        recipient: request.sender._id,
        type: 'collaboration_accepted',
        title: 'Collaboration Request Accepted',
        message: `${req.user.fullName} accepted your collaboration request for "${request.document.title}"`,
        data: {
          documentId: request.document._id,
          requestId: request._id
        }
      });
      await notification.save();
    } else {
      // Notify sender of rejection
      const notification = new Notification({
        recipient: request.sender._id,
        type: 'collaboration_rejected',
        title: 'Collaboration Request Rejected',
        message: `${req.user.fullName} declined your collaboration request for "${request.document.title}"`,
        data: {
          documentId: request.document._id,
          requestId: request._id
        }
      });
      await notification.save();
    }

    res.json({ message: `Collaboration request ${action}ed successfully` });
  } catch (error) {
    console.error('Respond to collaboration request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate share link
export const generateShareLink = async (req, res) => {
  try {
    const { documentId, permission } = req.body;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can generate share links' });
    }

    const shareToken = crypto.randomBytes(32).toString('hex');
    const shareLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/shared/${shareToken}`;

    document.shareSettings = {
      isPublic: true,
      shareLink: shareToken,
      linkPermission: permission
    };
    await document.save();
    // await logActivity(documentId, userId, 'shared', `Generated share link with ${permission} permission`);

    res.json({ shareLink });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get collaboration requests
export const getCollaborationRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const requests = await CollaborationRequest.find({
      recipient: userId,
      status: 'pending'
    })
    .populate('document', 'title')
    .populate('sender', 'fullName email')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get collaboration requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's collaborative documents
export const getCollaborativeDocuments = async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await Document.find({
      'collaborators.user': userId
    })
    .populate('owner', 'fullName email')
    .populate('collaborators.user', 'fullName email')
    .sort({ lastModified: -1 });

    res.json(documents);
  } catch (error) {
    console.error('Get collaborative documents error:', error);
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

    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can remove collaborators' });
    }

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

    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can update permissions' });
    }

    const collaborator = document.collaborators.find(
      c => c.user.toString() === collaboratorId
    );
    if (!collaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }

    collaborator.permission = permission;
    await document.save();

    res.json({ message: 'Permission updated successfully' });
  } catch (error) {
    console.error('Update collaborator permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Revoke share link
export const revokeShareLink = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can revoke share links' });
    }

    document.shareSettings = {
      isPublic: false,
      shareLink: null,
      linkPermission: 'view'
    };
    await document.save();

    res.json({ message: 'Share link revoked successfully' });
  } catch (error) {
    console.error('Revoke share link error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get document sharing info
export const getDocumentSharingInfo = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    const document = await Document.findById(documentId)
      .populate('collaborators.user', 'fullName email');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (document.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only document owner can view sharing info' });
    }

    const sharingInfo = {
      collaborators: document.collaborators,
      shareSettings: document.shareSettings,
      shareLink: document.shareSettings.isPublic ? 
        `${process.env.CLIENT_URL}/shared/${document.shareSettings.shareLink}` : null
    };

    res.json(sharingInfo);
  } catch (error) {
    console.error('Get document sharing info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};