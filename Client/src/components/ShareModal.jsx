import React, { useState } from 'react';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, documentId, documentTitle }) => {
  const [activeTab, setActiveTab] = useState('collaborate');
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('edit');
  const [message, setMessage] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);

  const sendCollaborationRequest = async () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }
    
    console.log('Sending collaboration request:', {
      documentId,
      documentTitle,
      email: email.trim(),
      permission,
      message: message.trim()
    });
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert('Please log in to send collaboration requests');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/collaboration/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          documentId,
          documentTitle,
          email: email.trim(),
          permission,
          message: message.trim()
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        alert('Collaboration request sent successfully!');
        setEmail('');
        setMessage('');
        onClose();
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.message || `Failed to send collaboration request (${response.status})`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error: Failed to send collaboration request');
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/collaboration/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          documentId,
          permission
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShareLink(data.shareLink);
        navigator.clipboard.writeText(data.shareLink);
        alert('Share link copied to clipboard!');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      alert('Failed to generate share link');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Share "{documentTitle}"</h3>
          <button className="close-btn" onClick={onClose}>
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="share-tabs">
          <button 
            className={`tab-btn ${activeTab === 'collaborate' ? 'active' : ''}`}
            onClick={() => setActiveTab('collaborate')}
          >
            <i className="ri-user-add-line"></i>
            Collaborate
          </button>
          <button 
            className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            <i className="ri-link"></i>
            Share Link
          </button>
        </div>

        <div className="modal-content">
          {activeTab === 'collaborate' && (
            <div className="collaborate-section">
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter collaborator's email"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Permission</label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="form-select"
                >
                  <option value="view">Can View</option>
                  <option value="edit">Can Edit</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <button
                onClick={sendCollaborationRequest}
                disabled={loading || !email.trim()}
                className="btn btn-primary"
              >
                {loading ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="link-section">
              <div className="form-group">
                <label>Link Permission</label>
                <select
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                  className="form-select"
                >
                  <option value="view">Anyone with link can view</option>
                  <option value="edit">Anyone with link can edit</option>
                </select>
              </div>

              <button
                onClick={generateShareLink}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Generating...' : 'Generate Share Link'}
              </button>

              {shareLink && (
                <div className="share-link-result">
                  <label>Share Link</label>
                  <div className="link-container">
                    <input
                      type="text"
                      value={shareLink}
                      readOnly
                      className="form-input"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareLink);
                        alert('Link copied!');
                      }}
                      className="copy-btn"
                    >
                      <i className="ri-file-copy-line"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;