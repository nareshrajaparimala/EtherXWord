import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveAs } from 'file-saver';
import Logo from '../components/Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import './DocumentEditor.css';
import { useNotification } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import { importDocxOOXML, exportDocxOOXML } from '../utils/ooxmlUtils';
import { MSWordPagination } from '../utils/paginationEngine';

const DocumentEditor = () => {
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const isLogoAnimating = useLogoAnimation();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Document state
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isEditing, setIsEditing] = useState(false);
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    paragraphs: 0,
    pages: 1
  });
  
  // Editor state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Formatting state
  const [currentFormat, setCurrentFormat] = useState({
    fontFamily: 'Georgia',
    fontSize: '12pt',
    bold: false,
    italic: false,
    underline: false,
    textAlign: 'left'
  });
  
  // Refs
  const editorContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const paginationRef = useRef(null);
  
  // Initialize MS Word pagination system
  useEffect(() => {
    if (editorContainerRef.current && !paginationRef.current) {
      try {
        // Direct callback for stats updates
        const handleStatsUpdate = (stats) => {
          console.log('Received stats update:', stats); // Debug log
          const { words, characters, paragraphs, pages, currentPage } = stats;
          setDocumentStats({ words, characters, paragraphs, pages });
          setCurrentPage(currentPage);
        };
        
        paginationRef.current = new MSWordPagination(editorContainerRef.current, handleStatsUpdate);
        
        // Listen for export events
        const handleExportDocx = (event) => {
          handleExportDocx();
        };
        
        const handleExportPdf = (event) => {
          // TODO: Implement PDF export
          showNotification('PDF export coming soon!', 'info');
        };
        
        document.addEventListener('exportDocx', handleExportDocx);
        document.addEventListener('exportPdf', handleExportPdf);
        
        // Initial stats update
        setTimeout(() => {
          if (paginationRef.current) {
            paginationRef.current.updateStats();
          }
        }, 100);
        
        return () => {
          document.removeEventListener('exportDocx', handleExportDocx);
          document.removeEventListener('exportPdf', handleExportPdf);
          if (paginationRef.current && paginationRef.current.observer) {
            paginationRef.current.observer.disconnect();
          }
        };
      } catch (error) {
        console.error('Failed to initialize pagination:', error);
        showNotification('Editor initialization failed', 'error');
      }
    }
  }, []);
  
  // Update document statistics
  const updateDocumentStats = useCallback(() => {
    try {
      if (!paginationRef.current) return;
      
      const allContent = paginationRef.current.getAllContent();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = allContent;
      const text = tempDiv.textContent || '';
      
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const characters = text.length;
      const paragraphs = (allContent.match(/<p[^>]*>/g) || []).length;
      
      setDocumentStats(prev => ({
        ...prev,
        words,
        characters,
        paragraphs
      }));
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }, []);
  
  // Format text functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    updateFormatState();
  };
  
  const updateFormatState = () => {
    setCurrentFormat({
      fontFamily: document.queryCommandValue('fontName') || 'Georgia',
      fontSize: document.queryCommandValue('fontSize') || '12pt',
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      textAlign: document.queryCommandValue('justifyLeft') ? 'left' : 
                document.queryCommandValue('justifyCenter') ? 'center' :
                document.queryCommandValue('justifyRight') ? 'right' : 'left'
    });
  };
  
  // DOCX Import with pagination
  const handleImportDocx = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.docx')) {
      showNotification('Please select a valid DOCX file', 'error');
      return;
    }
    
    try {
      showNotification('Importing DOCX file...', 'info');
      
      const fileBuffer = await file.arrayBuffer();
      const result = await importDocxOOXML(fileBuffer);
      
      if (result.success) {
        if (paginationRef.current && paginationRef.current.setContent) {
          paginationRef.current.setContent(result.html);
        }
        
        setDocumentTitle(file.name.replace('.docx', ''));
        showNotification('DOCX file imported successfully!', 'success');
        
        setTimeout(updateDocumentStats, 200);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Failed to import DOCX file: ' + error.message, 'error');
    }
    
    event.target.value = '';
  };
  
  // DOCX Export with multi-page content
  const handleExportDocx = async () => {
    try {
      showNotification('Exporting to DOCX...', 'info');
      
      const fullContent = (paginationRef.current && paginationRef.current.getAllContent) ? 
        paginationRef.current.getAllContent() : 
        '<p>No content</p>';
      
      const buffer = await exportDocxOOXML(fullContent, documentTitle);
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      saveAs(blob, `${documentTitle}.docx`);
      showNotification('DOCX exported successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export DOCX: ' + error.message, 'error');
    }
  };
  
  // Insert page break
  const insertPageBreak = () => {
    if (paginationRef.current && paginationRef.current.insertPageBreak) {
      paginationRef.current.insertPageBreak();
    }
  };
  
  // Navigation between pages
  const goToPage = (pageNumber) => {
    if (paginationRef.current && paginationRef.current.goToPage) {
      paginationRef.current.goToPage(pageNumber);
      setCurrentPage(pageNumber);
    }
  };
  
  // Zoom functions
  const handleZoomIn = () => setZoomLevel(prev => Math.min(200, prev + 10));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(50, prev - 10));
  const resetZoom = () => setZoomLevel(100);
  
  return (
    <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Navbar */}
      <nav className="editor-navbar">
        <div className="navbar-left">
          <button className="nav-btn" onClick={() => navigate('/')}>
            <i className="ri-arrow-left-line"></i> Back
          </button>
          <div className="logo">
            <Logo size={20} className={isLogoAnimating ? 'animate' : ''} />
            <span>EtherXWord</span>
          </div>
        </div>
        
        <div className="navbar-center">
          {isEditing ? (
            <input
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyPress={(e) => e.key === 'Enter' && setIsEditing(false)}
              className="title-input"
              autoFocus
            />
          ) : (
            <h1 className="document-title" onClick={() => setIsEditing(true)}>
              {documentTitle}
            </h1>
          )}
        </div>
        
        <div className="navbar-right">
          <button onClick={toggleTheme} className="nav-btn">
            <i className={`ri-${theme === 'dark' ? 'sun' : 'moon'}-line`}></i>
          </button>
          <button onClick={() => setIsFullscreen(!isFullscreen)} className="nav-btn">
            <i className={`ri-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}-line`}></i>
          </button>
        </div>
      </nav>
      
      {/* Toolbar */}
      {showToolbar && (
        <div className="toolbar">
          {/* File Operations */}
          <div className="toolbar-group">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportDocx}
              accept=".docx"
              style={{ display: 'none' }}
            />
            <button 
              className="toolbar-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="ri-file-upload-line"></i> Import
            </button>
            <button className="toolbar-btn" onClick={handleExportDocx}>
              <i className="ri-file-download-line"></i> Export
            </button>
          </div>
          
          {/* Formatting */}
          <div className="toolbar-group">
            <select 
              className="toolbar-select"
              value={currentFormat.fontFamily}
              onChange={(e) => formatText('fontName', e.target.value)}
            >
              <option value="Georgia">Georgia</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Calibri">Calibri</option>
            </select>
            
            <select 
              className="toolbar-select"
              value={currentFormat.fontSize}
              onChange={(e) => formatText('fontSize', e.target.value)}
            >
              <option value="8pt">8pt</option>
              <option value="10pt">10pt</option>
              <option value="12pt">12pt</option>
              <option value="14pt">14pt</option>
              <option value="16pt">16pt</option>
              <option value="18pt">18pt</option>
              <option value="24pt">24pt</option>
            </select>
            
            <button 
              className={`toolbar-btn ${currentFormat.bold ? 'active' : ''}`}
              onClick={() => formatText('bold')}
            >
              <strong>B</strong>
            </button>
            <button 
              className={`toolbar-btn ${currentFormat.italic ? 'active' : ''}`}
              onClick={() => formatText('italic')}
            >
              <em>I</em>
            </button>
            <button 
              className={`toolbar-btn ${currentFormat.underline ? 'active' : ''}`}
              onClick={() => formatText('underline')}
            >
              <u>U</u>
            </button>
          </div>
          
          {/* Page Controls */}
          <div className="toolbar-group">
            <button className="toolbar-btn" onClick={insertPageBreak}>
              <i className="ri-insert-row-bottom"></i> Page Break
            </button>
            <button className="toolbar-btn" onClick={() => paginationRef.current?.exportToDocx()}>
              <i className="ri-file-word-line"></i> DOCX
            </button>
            <button className="toolbar-btn" onClick={() => paginationRef.current?.exportToPdf()}>
              <i className="ri-file-pdf-line"></i> PDF
            </button>
            <span className="page-indicator">
              Page {currentPage} of {documentStats.pages}
            </span>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <div className="editor-layout">
        <div className="editor-wrapper">
          <div 
            className="pages-container"
            style={{ transform: `scale(${zoomLevel / 100})` }}
          >
            <div ref={editorContainerRef} className="multi-page-editor">
              {/* Pages will be dynamically created here by MSWordPagination */}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bottom-status-bar">
        <div className="status-left">
          <span>{documentStats.words} words</span>
          <span>{documentStats.characters} characters</span>
          <span>{documentStats.paragraphs} paragraphs</span>
        </div>
        
        <div className="status-center">
          <span>Page {currentPage} of {documentStats.pages}</span>
        </div>
        
        <div className="status-right">
          <div className="zoom-controls">
            <button onClick={handleZoomOut} disabled={zoomLevel <= 50}>
              <i className="ri-subtract-line"></i>
            </button>
            <span>{zoomLevel}%</span>
            <button onClick={handleZoomIn} disabled={zoomLevel >= 200}>
              <i className="ri-add-line"></i>
            </button>
            <button onClick={resetZoom} disabled={zoomLevel === 100}>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;