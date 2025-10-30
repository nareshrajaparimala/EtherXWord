import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Logo from '../components/Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import { useNotification } from '../context/NotificationContext';
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
  
  const viewerRef = useRef(null);
  const token = searchParams.get('token');

  useEffect(() => {
    loadDocument();
  }, [documentId, documentAddress, token]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url;
      const headers = {};
      
      if (documentAddress) {
        // Load by document address
        url = `${import.meta.env.VITE_API_URL}/api/documents/address/${documentAddress}`;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        } else if (localStorage.getItem('accessToken')) {
          headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
        }
      } else if (token) {
        // Load by share token
        url = `${import.meta.env.VITE_API_URL}/api/documents/shared/${token}`;
      } else if (documentId) {
        // Load by document ID (authenticated)
        url = `${import.meta.env.VITE_API_URL}/api/documents/${documentId}`;
        headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
      } else {
        throw new Error('No document identifier provided');
      }

      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        setDocumentData(data);
        
        // If user has edit permission, offer to switch to editor
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
      
      // Helper function to convert hex to RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };
      
      const pages = documentData.pages || [{ id: 1, content: documentData.content }];
      
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        let yPosition = margin;
        
        // Add header if exists
        if (documentData.formatting?.headerText) {
          const headerParts = documentData.formatting.headerText.split('|');
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          
          if (headerParts[0]) pdf.text(headerParts[0].trim(), margin, yPosition);
          if (headerParts[1]) pdf.text(headerParts[1].trim(), pageWidth / 2, yPosition, { align: 'center' });
          if (headerParts[2]) pdf.text(headerParts[2].trim(), pageWidth - margin, yPosition, { align: 'right' });
          
          yPosition += 10;
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 5;
        }
        
        // Add page border if enabled
        const pageBorder = documentData.formatting?.pageBorder;
        if (pageBorder?.enabled) {
          const borderWidth = parseFloat(pageBorder.width) || 1;
          pdf.setLineWidth(borderWidth * 0.35);
          
          const borderColor = hexToRgb(pageBorder.color);
          pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
          
          if (pageBorder.position === 'all') {
            pdf.rect(margin, margin, contentWidth, pageHeight - (2 * margin));
          }
        }
        
        // Create temporary container for page content
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: ${contentWidth * 3.78}px;
          background: white;
          padding: 0;
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
          
          let contentY = yPosition;
          if (documentData.formatting?.headerText) contentY += 10;
          
          pdf.addImage(imgData, 'PNG', margin, contentY, imgWidth, imgHeight);
        } finally {
          document.body.removeChild(tempContainer);
        }
        
        // Add watermark if enabled
        const watermark = documentData.formatting?.watermark;
        if (watermark?.enabled && watermark.type === 'text') {
          pdf.saveGraphicsState();
          pdf.setGState(new pdf.GState({ opacity: watermark.opacity }));
          pdf.setFontSize(watermark.size * 0.35);
          
          const watermarkColor = hexToRgb(watermark.color);
          pdf.setTextColor(watermarkColor.r, watermarkColor.g, watermarkColor.b);
          
          pdf.text(watermark.text, pageWidth / 2, pageHeight / 2, {
            angle: watermark.rotation,
            align: 'center'
          });
          
          pdf.restoreGraphicsState();
        }
        
        // Add footer and page numbers
        const pageNumbering = documentData.formatting?.pageNumbering;
        if (documentData.formatting?.footerText || pageNumbering?.enabled) {
          const footerY = pageHeight - margin + 5;
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          
          if (documentData.formatting?.footerText) {
            const footerParts = documentData.formatting.footerText.split('|');
            if (footerParts[0]) pdf.text(footerParts[0].trim(), margin, footerY);
            if (footerParts[1]) pdf.text(footerParts[1].trim(), pageWidth / 2, footerY, { align: 'center' });
            if (footerParts[2]) pdf.text(footerParts[2].trim(), pageWidth - margin, footerY, { align: 'right' });
          }
          
          if (pageNumbering?.enabled) {
            let pageNum = pageIndex + 1;
            if (pageNumbering.format === 'i') {
              const romanNumerals = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
              pageNum = romanNumerals[pageIndex] || (pageIndex + 1);
            } else if (pageNumbering.format === 'a') {
              pageNum = String.fromCharCode(97 + pageIndex);
            }
            
            const positions = {
              'bottom-left': [margin, footerY],
              'bottom-center': [pageWidth / 2, footerY, { align: 'center' }],
              'bottom-right': [pageWidth - margin, footerY, { align: 'right' }],
              'top-left': [margin, margin - 5],
              'top-center': [pageWidth / 2, margin - 5, { align: 'center' }],
              'top-right': [pageWidth - margin, margin - 5, { align: 'right' }]
            };
            
            const [x, y, options] = positions[pageNumbering.position] || positions['bottom-right'];
            pdf.text(String(pageNum), x, y, options);
          }
          
          pdf.line(margin, footerY - 3, pageWidth - margin, footerY - 3);
        }
      }
      
      pdf.save(`${documentData.title}.pdf`);
      showNotification('PDF exported successfully!', 'success');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showNotification('Failed to export PDF. Please try again.', 'error');
    }
  };

  const handleZoomChange = (newZoom) => {
    setZoomLevel(newZoom);
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    const pageElement = document.querySelector(`[data-page-id="${pageNumber}"]`);
    if (pageElement) {
      pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  return (
    <div className="viewer-container">
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
            <i className="ri-download-line"></i> Export PDF
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
      <div className="viewer-content" style={{ transform: `scale(${zoomLevel / 100})` }}>
        <div className="pages-container">
          {pages.map((page, index) => (
            <div 
              key={page.id || index}
              className="viewer-page"
              data-page-id={page.id || index + 1}
            >
              {/* Header */}
              {documentData.formatting?.headerText && (
                <div className="page-header">
                  {documentData.formatting.headerText.split('|').map((part, i) => (
                    <span key={i} className={`header-${['left', 'center', 'right'][i]}`}>
                      {part.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Page Border */}
              {documentData.formatting?.pageBorder?.enabled && (
                <div 
                  className="page-border"
                  style={{
                    borderColor: documentData.formatting.pageBorder.color,
                    borderWidth: documentData.formatting.pageBorder.width,
                    borderStyle: documentData.formatting.pageBorder.style
                  }}
                />
              )}
              
              {/* Content */}
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
              
              {/* Watermark */}
              {documentData.formatting?.watermark?.enabled && (
                <div 
                  className="page-watermark"
                  style={{
                    opacity: documentData.formatting.watermark.opacity,
                    fontSize: `${documentData.formatting.watermark.size}px`,
                    color: documentData.formatting.watermark.color,
                    transform: `rotate(${documentData.formatting.watermark.rotation}deg)`
                  }}
                >
                  {documentData.formatting.watermark.type === 'text' 
                    ? documentData.formatting.watermark.text 
                    : null}
                </div>
              )}
              
              {/* Footer */}
              {documentData.formatting?.footerText && (
                <div className="page-footer">
                  {documentData.formatting.footerText.split('|').map((part, i) => (
                    <span key={i} className={`footer-${['left', 'center', 'right'][i]}`}>
                      {part.trim()}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Page Number */}
              {showPageNumbers && (
                <div className="page-number">
                  Page {index + 1} of {pages.length}
                </div>
              )}
            </div>
          ))}
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