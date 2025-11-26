import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import './IPFSDocuments.css';

export default function IPFSDocuments() {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme } = useContext(ThemeContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear old localStorage data that might have invalid CIDs
    const saved = JSON.parse(localStorage.getItem("ipfsDocuments") || "[]");
    // Filter out any documents that might have invalid CIDs from memory storage
    const validDocs = saved.filter(doc => doc.cid && doc.cid.length > 20);
    if (validDocs.length !== saved.length) {
      localStorage.setItem('ipfsDocuments', JSON.stringify(validDocs));
      if (saved.length > 0) {
        showNotification('Cleared invalid IPFS documents from previous sessions', 'info');
      }
    }
    setDocs(validDocs);
  }, []);

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.cid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePreviewDocument = async (doc) => {
    setLoading(true);
    setSelectedDoc(doc);
    try {
      const response = await fetch(`http://localhost:4000/ipfs/${doc.cid}`);
      const content = await response.text();
      
      try {
        const parsedContent = JSON.parse(content);
        // Extract and clean the content
        const documentContent = parsedContent.content || content;
        // Remove HTML tags for preview and convert to plain text
        const cleanContent = documentContent.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        setPreviewContent(cleanContent || 'No content available');
      } catch {
        // If not JSON, display as plain text
        const cleanContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
        setPreviewContent(cleanContent || 'No content available');
      }
      
      setShowPreview(true);
    } catch (error) {
      console.error('Error fetching document:', error);
      showNotification('Failed to load document preview', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDocument = async (doc) => {
    try {
      // Check if document exists before opening
      const response = await fetch(`http://localhost:4000/ipfs/${doc.cid}`);
      if (response.ok) {
        window.open(`http://localhost:4000/ipfs/${doc.cid}`, "_blank");
      } else {
        showNotification('Document not found. It may have been from a previous session.', 'error');
      }
    } catch (error) {
      showNotification('Failed to access document. Please check if IPFS server is running.', 'error');
    }
  };

  const handleCopyCID = (cid) => {
    navigator.clipboard.writeText(cid);
    showNotification('CID copied to clipboard!', 'success');
  };

  const handleDeleteDocument = (index) => {
    if (confirm('Are you sure you want to remove this document from your IPFS list?')) {
      const updatedDocs = docs.filter((_, i) => i !== index);
      setDocs(updatedDocs);
      localStorage.setItem('ipfsDocuments', JSON.stringify(updatedDocs));
      showNotification('Document removed from list', 'success');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`ipfs-documents-container ${theme}`}>
      <div className="ipfs-header-section">
        <div className="ipfs-title-area">
          <button 
            className="ipfs-back-btn"
            onClick={() => navigate('/home')}
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <div className="ipfs-title-content">
            <h1 className="ipfs-main-title">
              <i className="ri-cloud-line"></i>
              IPFS Documents
            </h1>
            <p className="ipfs-subtitle">Decentralized document storage on IPFS</p>
          </div>
        </div>
        
        <div className="ipfs-search-area">
          <div className="ipfs-search-box">
            <i className="ri-search-line"></i>
            <input
              type="text"
              placeholder="Search documents or CID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ipfs-search-input"
            />
          </div>
        </div>
      </div>

      <div className="ipfs-content-area">
        {filteredDocs.length === 0 ? (
          <div className="ipfs-empty-state">
            <div className="ipfs-empty-icon">
              <i className="ri-cloud-off-line"></i>
            </div>
            <h3>No IPFS Documents Found</h3>
            <p>
              {searchQuery 
                ? 'No documents match your search criteria.' 
                : 'Start by saving documents to IPFS from the document editor.'}
            </p>
            <button 
              className="ipfs-create-btn"
              onClick={() => navigate('/editor')}
            >
              <i className="ri-add-line"></i>
              Create New Document
            </button>
          </div>
        ) : (
          <div className="ipfs-documents-grid">
            {filteredDocs.map((doc, index) => (
              <div key={index} className="ipfs-document-card">
                <div className="ipfs-card-header">
                  <div className="ipfs-card-icon">
                    <i className="ri-file-text-line"></i>
                  </div>
                  <button 
                    className="ipfs-card-delete"
                    onClick={() => handleDeleteDocument(index)}
                    title="Remove from list"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
                
                <div className="ipfs-card-content">
                  <h3 className="ipfs-card-title">{doc.title}</h3>
                  
                  <div className="ipfs-card-meta">
                    <span className="ipfs-meta-item">
                      <i className="ri-time-line"></i>
                      {formatDate(doc.savedAt)}
                    </span>
                    {doc.wordCount && (
                      <span className="ipfs-meta-item">
                        <i className="ri-file-word-line"></i>
                        {doc.wordCount} words
                      </span>
                    )}
                  </div>
                  
                  <div className="ipfs-card-cid">
                    <span className="ipfs-cid-label">CID:</span>
                    <code className="ipfs-cid-value">{doc.cid.substring(0, 20)}...</code>
                    <button 
                      className="ipfs-copy-btn"
                      onClick={() => handleCopyCID(doc.cid)}
                      title="Copy full CID"
                    >
                      <i className="ri-file-copy-line"></i>
                    </button>
                  </div>
                  
                  {doc.preview && (
                    <p className="ipfs-card-preview">{doc.preview}</p>
                  )}
                </div>
                
                <div className="ipfs-card-actions">
                  <button 
                    className="ipfs-action-btn ipfs-preview-btn"
                    onClick={() => handlePreviewDocument(doc)}
                    disabled={loading}
                  >
                    <i className="ri-eye-line"></i>
                    Preview
                  </button>
                  <button 
                    className="ipfs-action-btn ipfs-open-btn"
                    onClick={() => handleOpenDocument(doc)}
                  >
                    <i className="ri-external-link-line"></i>
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="ipfs-preview-overlay" onClick={() => setShowPreview(false)}>
          <div className="ipfs-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ipfs-preview-header">
              <h3>{selectedDoc?.title}</h3>
              <button 
                className="ipfs-preview-close"
                onClick={() => setShowPreview(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="ipfs-preview-content">
              {loading ? (
                <div className="ipfs-preview-loading">
                  <div className="ipfs-loading-spinner"></div>
                  <p>Loading document...</p>
                </div>
              ) : (
                <div className="ipfs-preview-text">
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {previewContent}
                  </pre>
                </div>
              )}
            </div>
            <div className="ipfs-preview-footer">
              <button 
                className="ipfs-preview-action"
                onClick={() => handleOpenDocument(selectedDoc)}
              >
                <i className="ri-external-link-line"></i>
                Open Full Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
