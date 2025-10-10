import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DocumentViewer.css';

const DocumentViewer = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocument();
  }, [documentId]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else {
        setError('Document not found or access denied');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="viewer-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="viewer-container">
        <div className="error-state">
          <i className="ri-error-warning-line"></i>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="viewer-container">
      {/* Viewer Header */}
      <div className="viewer-header">
        <div className="header-left">
          <button onClick={() => navigate('/')} className="back-btn">
            <i className="ri-arrow-left-line"></i>
            Back
          </button>
          <div className="document-info">
            <h1 className="document-title">{document.title}</h1>
            <span className="view-only-badge">
              <i className="ri-eye-line"></i>
              View Only
            </span>
          </div>
        </div>
        <div className="header-right">
          <span className="owner-info">
            by {document.owner.fullName}
          </span>
          <span className="last-modified">
            Last modified: {new Date(document.lastModified).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Document Content */}
      <div className="viewer-content">
        <div className="document-paper">
          <div 
            className="document-display"
            dangerouslySetInnerHTML={{ __html: document.content || '<p>This document is empty.</p>' }}
          />
        </div>
      </div>

      {/* Document Stats */}
      <div className="viewer-footer">
        <div className="document-stats">
          <span>Words: {document.wordCount || 0}</span>
          <span>•</span>
          <span>Characters: {document.content?.replace(/<[^>]*>/g, '').length || 0}</span>
          <span>•</span>
          <span>Last updated: {new Date(document.lastModified).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;