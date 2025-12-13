import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import Logo from '../components/Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import { useNotification } from '../context/NotificationContext';
import { exportDocxOOXML } from '../utils/ooxmlUtils';
import './DocumentViewer.css';

const DocumentViewer = () => {
  const { showNotification } = useNotification();
  const { documentId, documentAddress } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLogoAnimating = useLogoAnimation();
  
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const [fitScale, setFitScale] = useState(1);
  
  const viewerRef = useRef(null);
  const contentRef = useRef(null);
  const token = searchParams.get('token');

  // Constants for A4 dimensions
  const MM_TO_PX = 3.7795275591;
  const basePageWidth = 210 * MM_TO_PX;
  const basePageHeight = 297 * MM_TO_PX;

  useEffect(() => {
    loadDocument();
  }, [documentId, documentAddress, token]);

  useEffect(() => {
    const updateFitScale = () => {
      if (!contentRef.current) return;

      const NAVBAR_HEIGHT = 70;
      const horizontalPadding = 40;
      const verticalPadding = 80;

      const availableWidth = Math.max(100, contentRef.current.clientWidth - horizontalPadding);
      const availableHeight = Math.max(100, window.innerHeight - NAVBAR_HEIGHT - verticalPadding);

      const widthScale = availableWidth / basePageWidth;
      const heightScale = availableHeight / basePageHeight;
      const nextFitScale = Math.min(widthScale, heightScale);

      if (Number.isFinite(nextFitScale) && nextFitScale > 0) {
        setFitScale(nextFitScale);
      }
    };

    updateFitScale();
    window.addEventListener('resize', updateFitScale);
    return () => window.removeEventListener('resize', updateFitScale);
  }, []);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url;
      const headers = {};
      
      if (documentAddress) {
        url = `${import.meta.env.VITE_API_URL}/api/documents/address/${documentAddress}`;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else if (localStorage.getItem('accessToken')) {
          headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
        }
      } else if (token) {
        url = `${import.meta.env.VITE_API_URL}/api/documents/shared/${token}`;
      } else if (documentId) {
        url = `${import.meta.env.VITE_API_URL}/api/documents/${documentId}`;
        headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
      } else {
        throw new Error('No document identifier provided');
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setDocumentData(data);
        
        if (data.userPermission === 'edit' || data.permission === 'edit') {
          const switchToEditor = window.confirm(
            'You have edit permission for this document. Would you like to open it in the editor instead?'
          );
          if (switchToEditor) {
            if (documentAddress) {
              navigate(`/editor/address/${documentAddress}${token ? `?token=${token}` : ''}`);
            } else {
              navigate(`/editor/${documentId}`);
            }
            return;
          }
        }
      } else if (response.status === 404) {
        setError('Document not found or you don\'t have permission to view it.');
      } else if (response.status === 403) {
        setError('Access denied. You don\'t have permission to view this document.');
      } else {
        setError('Failed to load document. Please try again.');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    if (!documentData) return;
    
    try {
      showNotification('Generating PDF...', 'info');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      const pages = documentData.pages || [{ id: 1, content: documentData.content }];
      
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        // Create temporary container for page content
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: ${contentWidth * 3.78}px;
          background: white;
          padding: 20px;
          font-family: ${documentData.formatting?.defaultFont?.family || 'Georgia'};
          font-size: ${documentData.formatting?.defaultFont?.size || '12pt'};
          line-height: ${documentData.formatting?.defaultFont?.lineHeight || '1.5'};
          color: ${documentData.formatting?.defaultFont?.color || '#333'};
        `;
        
        tempContainer.innerHTML = page.content || '';
        document.body.appendChild(tempContainer);
        
        try {
          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
        } finally {
          document.body.removeChild(tempContainer);
        }
        
        // Add page number
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${pageIndex + 1} of ${pages.length}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }
      
      pdf.save(`${documentData.title}.pdf`);
      showNotification('PDF exported successfully!', 'success');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showNotification('Failed to export PDF. Please try again.', 'error');
    }
  };

  const exportToDocx = async () => {
    if (!documentData) return;
    
    try {
      showNotification('Exporting to DOCX...', 'info');
      
      const pages = documentData.pages || [{ id: 1, content: documentData.content }];
      const fullContent = pages.map(page => page.content || '').join('');
      
      const buffer = await exportDocxOOXML(fullContent, documentData.title);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      saveAs(blob, `${documentData.title}.docx`);
      showNotification('DOCX exported successfully!', 'success');
    } catch (error) {
      console.error('DOCX export error:', error);
      showNotification('Failed to export DOCX: ' + error.message, 'error');
    }
  };

  const handleZoomChange = (newZoom) => {
    setZoomLevel(Math.max(50, Math.min(200, newZoom)));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    const pageElement = document.querySelector(`[data-page-id="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Zoom with mouse wheel
  useEffect(() => {
    const container = viewerRef.current;
    if (!container) return;
    
    const handleWheelZoom = (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
        handleZoomChange(zoomLevel + (event.deltaY > 0 ? -10 : 10));
      }
    };
    
    container.addEventListener('wheel', handleWheelZoom, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelZoom);
  }, [zoomLevel]);

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
          <h2>Unable to Load Document</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/')} className="home-btn">
              <i className="ri-home-line"></i> Go Home
            </button>
            <button onClick={loadDocument} className="retry-btn">
              <i className="ri-refresh-line"></i> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pages = documentData.pages || [{ id: 1, content: documentData.content }];
  const scale = fitScale * (zoomLevel / 100);
  const scaledPageWidth = basePageWidth * scale;
  const scaledPageHeight = basePageHeight * scale;
  const verticalGap = 30 * scale;

  return (
    <div className="viewer-container" ref={viewerRef}>
      {/* Viewer Navbar */}
      <nav className="viewer-navbar">
        <div className="navbar-left">
          <button className="nav-btn" onClick={() => navigate('/')}>
            <i className="ri-arrow-left-line"></i> Back
          </button>
          <div className="logo">
            <Logo size={24} className={isLogoAnimating ? 'animate' : ''} />
            <span>EtherXWord Viewer</span>
          </div>
        </div>
        
        <div className="navbar-center">
          <h1 className="document-title">{documentData.title}</h1>
          <div className="document-meta">
            <span><i className="ri-file-text-line"></i> {documentData.wordCount || 0} words</span>
            <span><i className="ri-file-copy-line"></i> {pages.length} pages</span>
            <span><i className="ri-time-line"></i> {new Date(documentData.lastModified).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="zoom-controls">
            <button 
              onClick={() => handleZoomChange(Math.max(50, zoomLevel - 10))}
              className="zoom-btn"
              disabled={zoomLevel <= 50}
            >
              <i className="ri-subtract-line"></i>
            </button>
            <span className="zoom-level">{zoomLevel}%</span>
            <button 
              onClick={() => handleZoomChange(Math.min(200, zoomLevel + 10))}
              className="zoom-btn"
              disabled={zoomLevel >= 200}
            >
              <i className="ri-add-line"></i>
            </button>
          </div>
          
          <button onClick={exportToPDF} className="export-btn">
            <i className="ri-file-pdf-line"></i> PDF
          </button>
          
          <button onClick={exportToDocx} className="export-btn">
            <i className="ri-file-word-line"></i> DOCX
          </button>
          
          {localStorage.getItem('accessToken') && (
            <button 
              onClick={() => {
                if (documentAddress) {
                  navigate(`/editor/address/${documentAddress}${token ? `?token=${token}` : ''}`);
                } else {
                  navigate(`/editor/${documentId}`);
                }
              }}
              className="edit-btn"
            >
              <i className="ri-edit-line"></i> Edit
            </button>
          )}
        </div>
      </nav>

      {/* Document Content */}
      <div className="viewer-content" ref={contentRef}>
        <div className="pages-viewport">
          <div className="pages-container">
            {pages.map((page, index) => (
              <div
                key={page.id || index}
                className="page-scale-wrapper"
                style={{
                  width: `${scaledPageWidth}px`,
                  height: `${scaledPageHeight}px`,
                  marginBottom: index === pages.length - 1 ? 0 : `${verticalGap}px`
                }}
              >
                <div 
                  className="viewer-page"
                  data-page-id={page.id || index + 1}
                  style={{
                    width: `${basePageWidth}px`,
                    height: `${basePageHeight}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center'
                  }}
                >
                  {/* Page Content */}
                  <div 
                    className="page-content"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                    style={{
                      fontFamily: documentData.formatting?.defaultFont?.family || 'Georgia',
                      fontSize: documentData.formatting?.defaultFont?.size || '12pt',
                      lineHeight: documentData.formatting?.defaultFont?.lineHeight || '1.5',
                      color: documentData.formatting?.defaultFont?.color || '#333'
                    }}
                  />
                  
                  {/* Page Number */}
                  {showPageNumbers && (
                    <div className="page-number">
                      Page {index + 1} of {pages.length}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Page Navigation */}
      {pages.length > 1 && (
        <div className="page-navigation">
          <button 
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="nav-page-btn"
          >
            <i className="ri-arrow-up-line"></i>
          </button>
          
          <div className="page-selector">
            <select 
              value={currentPage} 
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="page-select"
            >
              {pages.map((_, index) => (
                <option key={index} value={index + 1}>
                  Page {index + 1}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={() => goToPage(Math.min(pages.length, currentPage + 1))}
            disabled={currentPage >= pages.length}
            className="nav-page-btn"
          >
            <i className="ri-arrow-down-line"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;