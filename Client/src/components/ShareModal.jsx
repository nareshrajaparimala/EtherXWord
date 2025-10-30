import React, { useState, useEffect } from 'react';
import { useNotification } from '../context/NotificationContext';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, documentId, documentTitle, documentData, isCollaborative }) => {
  const { showNotification } = useNotification();
  const [shareLinks, setShareLinks] = useState({
    view: '',
    edit: ''
  });
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorPermission, setNewCollaboratorPermission] = useState('view');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isAddingCollaborator, setIsAddingCollaborator] = useState(false);
  const [activeTab, setActiveTab] = useState('share');

  useEffect(() => {
    if (isOpen && documentData) {
      setCollaborators(documentData.collaborators || []);
      if (documentData.shareSettings?.shareLink) {
        const baseUrl = `${window.location.origin}`;
        const viewLink = `${baseUrl}/viewer/address/${documentData.documentAddress}?token=${documentData.shareSettings.shareLink}`;
        const editLink = `${baseUrl}/editor/address/${documentData.documentAddress}?token=${documentData.shareSettings.shareLink}`;
        
        setShareLinks({
          view: viewLink,
          edit: documentData.shareSettings.linkPermission === 'edit' ? editLink : ''
        });
      }
    }
  }, [isOpen, documentData]);

  const generateShareLink = async (permission) => {
    setIsGeneratingLink(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permission })
      });

      if (response.ok) {
        const data = await response.json();
        const baseUrl = `${window.location.origin}`;
        const link = permission === 'edit' 
          ? `${baseUrl}/editor/address/${data.documentAddress}?token=${data.shareToken}`
          : `${baseUrl}/viewer/address/${data.documentAddress}?token=${data.shareToken}`;
        
        setShareLinks(prev => ({
          ...prev,
          [permission]: link
        }));
        
        showNotification(`${permission === 'edit' ? 'Edit' : 'View'} link generated successfully!`, 'success');
      } else {
        showNotification('Failed to generate share link', 'error');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      showNotification('Failed to generate share link', 'error');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification(`${type} link copied to clipboard!`, 'success');
    } catch (error) {
      showNotification('Failed to copy to clipboard', 'error');
    }
  };

  const addCollaborator = async () => {
    if (!newCollaboratorEmail || !newCollaboratorEmail.includes('@')) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    setIsAddingCollaborator(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          email: newCollaboratorEmail, 
          permission: newCollaboratorPermission 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators);
        setNewCollaboratorEmail('');
        showNotification(`Collaborator added with ${newCollaboratorPermission} permission!`, 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || 'Failed to add collaborator', 'error');
      }
    } catch (error) {
      console.error('Error adding collaborator:', error);
      showNotification('Failed to add collaborator', 'error');
    } finally {
      setIsAddingCollaborator(false);
    }
  };

  const removeCollaborator = async (collaboratorId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}/collaborators/${collaboratorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        setCollaborators(prev => prev.filter(c => c.user._id !== collaboratorId));
        showNotification('Collaborator removed successfully', 'success');
      } else {
        showNotification('Failed to remove collaborator', 'error');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      showNotification('Failed to remove collaborator', 'error');
    }
  };

  const updateCollaboratorPermission = async (collaboratorId, newPermission) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}/collaborators`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          email: collaborators.find(c => c.user._id === collaboratorId)?.user.email,
          permission: newPermission 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators);
        showNotification('Permission updated successfully', 'success');
      } else {
        showNotification('Failed to update permission', 'error');
      }
    } catch (error) {
      console.error('Error updating permission:', error);
      showNotification('Failed to update permission', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share "{documentTitle}"</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            <i className="ri-share-line"></i> Share Links
          </button>
          <button 
            className={`tab-btn ${activeTab === 'collaborators' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborators')}
          >
            <i className="ri-team-line"></i> Collaborators ({collaborators.length})
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'share' && (
            <div className="share-tab">
              <div className="share-section">
                <h3><i className="ri-eye-line"></i> View-Only Access</h3>
                <p>Anyone with this link can view the document but cannot edit it.</p>
                <div className="link-container">
                  <input 
                    type="text" 
                    value={shareLinks.view} 
                    readOnly 
                    placeholder="Generate a view-only link"
                    className="link-input"
                  />
                  <div className="link-actions">
                    {shareLinks.view ? (
                      <button 
                        onClick={() => copyToClipboard(shareLinks.view, 'View')}
                        className="copy-btn"
                      >
                        <i className="ri-file-copy-line"></i> Copy
                      </button>
                    ) : (
                      <button 
                        onClick={() => generateShareLink('view')}
                        disabled={isGeneratingLink}
                        className="generate-btn"
                      >
                        {isGeneratingLink ? (
                          <><i className="ri-loader-4-line spinning"></i> Generating...</>
                        ) : (
                          <><i className="ri-link"></i> Generate</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="share-section">
                <h3><i className="ri-edit-line"></i> Edit Access</h3>
                <p>Anyone with this link can view and edit the document.</p>
                <div className="link-container">
                  <input 
                    type="text" 
                    value={shareLinks.edit} 
                    readOnly 
                    placeholder="Generate an edit link"
                    className="link-input"
                  />
                  <div className="link-actions">
                    {shareLinks.edit ? (
                      <button 
                        onClick={() => copyToClipboard(shareLinks.edit, 'Edit')}
                        className="copy-btn"
                      >
                        <i className="ri-file-copy-line"></i> Copy
                      </button>
                    ) : (
                      <button 
                        onClick={() => generateShareLink('edit')}
                        disabled={isGeneratingLink}
                        className="generate-btn"
                      >
                        {isGeneratingLink ? (
                          <><i className="ri-loader-4-line spinning"></i> Generating...</>
                        ) : (
                          <><i className="ri-link"></i> Generate</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="share-info">
                <div className="info-item">
                  <i className="ri-information-line"></i>
                  <span>Links are valid until you revoke access or delete the document.</span>
                </div>
                <div className="info-item">
                  <i className="ri-shield-check-line"></i>
                  <span>Only people with the link can access your document.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'collaborators' && (
            <div className="collaborators-tab">
              <div className="add-collaborator-section">
                <h3><i className="ri-user-add-line"></i> Add Collaborator</h3>
                <div className="add-collaborator-form">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={newCollaboratorEmail}
                    onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                    className="email-input"
                  />
                  <select
                    value={newCollaboratorPermission}
                    onChange={(e) => setNewCollaboratorPermission(e.target.value)}
                    className="permission-select"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                  </select>
                  <button
                    onClick={addCollaborator}
                    disabled={isAddingCollaborator || !newCollaboratorEmail}
                    className="add-btn"
                  >
                    {isAddingCollaborator ? (
                      <><i className="ri-loader-4-line spinning"></i> Adding...</>
                    ) : (
                      <><i className="ri-add-line"></i> Add</>
                    )}
                  </button>
                </div>
              </div>

              <div className="collaborators-list">
                <h3><i className="ri-team-line"></i> Current Collaborators</h3>
                {collaborators.length === 0 ? (
                  <div className="empty-state">
                    <i className="ri-team-line"></i>
                    <p>No collaborators yet</p>
                    <span>Add people to collaborate on this document</span>
                  </div>
                ) : (
                  <div className="collaborator-items">
                    {collaborators.map((collaborator) => (
                      <div key={collaborator.user._id} className="collaborator-item">
                        <div className="collaborator-info">
                          <div className="collaborator-avatar">
                            {collaborator.user.fullName?.charAt(0).toUpperCase() || 
                             collaborator.user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="collaborator-details">
                            <span className="collaborator-name">
                              {collaborator.user.fullName || collaborator.user.email}
                            </span>
                            <span className="collaborator-email">{collaborator.user.email}</span>
                            <span className="collaborator-added">
                              Added {new Date(collaborator.addedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="collaborator-actions">
                          <select
                            value={collaborator.permission}
                            onChange={(e) => updateCollaboratorPermission(collaborator.user._id, e.target.value)}
                            className="permission-select small"
                          >
                            <option value="view">View Only</option>
                            <option value="edit">Can Edit</option>
                          </select>
                          <button
                            onClick={() => removeCollaborator(collaborator.user._id)}
                            className="remove-btn"
                            title="Remove collaborator"
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="document-info">
            <i className="ri-file-text-line"></i>
            <span>Document ID: {documentData?.documentAddress || 'Local Document'}</span>
          </div>
          <button onClick={onClose} className="close-modal-btn">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;