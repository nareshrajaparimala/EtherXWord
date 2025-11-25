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
import { exportDocument, exportToPDF, exportToDOCX } from '../utils/exportUtils';
import EditorToolBox from '../components/EditorToolBox';

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
  const [selectedTool, setSelectedTool] = useState('Home');
  const [showShareModal, setShowShareModal] = useState(false);
  
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
          handleExportPdf();
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
  
  // Export with format selection
  const handleExport = async () => {
    if (!paginationRef.current) {
      showNotification('Editor not ready for export', 'error');
      return;
    }
    
    try {
      await exportDocument(paginationRef.current, documentTitle, showNotification);
    } catch (error) {
      console.error('Export error:', error);
    }
  };
  
  // DOCX Export with multi-page content
  const handleExportDocx = async () => {
    if (!paginationRef.current) {
      showNotification('Editor not ready for export', 'error');
      return;
    }
    
    try {
      // Debug: log current content
      const content = paginationRef.current.getAllContent();
      console.log('Current content for DOCX export:', content);
      
      await exportToDOCX(paginationRef.current, documentTitle);
      showNotification('DOCX exported successfully!', 'success');
    } catch (error) {
      console.error('DOCX export error:', error);
      showNotification('Failed to export DOCX: ' + error.message, 'error');
    }
  };
  
  // PDF Export with multi-page content
  const handleExportPdf = async () => {
    if (!paginationRef.current) {
      showNotification('Editor not ready for export', 'error');
      return;
    }
    
    try {
      // Debug: log current pages
      console.log('Current pages for PDF export:', paginationRef.current.pages.length);
      
      await exportToPDF(paginationRef.current, documentTitle);
      showNotification('PDF exported successfully!', 'success');
    } catch (error) {
      console.error('PDF export error:', error);
      showNotification('Failed to export PDF: ' + error.message, 'error');
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
          <button className="nav-btn" onClick={() => navigate('/')} style={{border: 'none', background: 'transparent', cursor: 'pointer', transition: 'opacity 0.3s ease'}} onMouseEnter={(e) => e.target.style.opacity = '0.7'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
            <i className="ri-arrow-left-line"></i>
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
            <h1 className="document-title">
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
      
      {/* Toolbar with embedded toolbox */}
      {showToolbar && (
        <div className="toolbar">
          <EditorToolBox
            selectedTool={selectedTool}
            onSelectTool={setSelectedTool}
            onApply={(cmd, value) => {
              const mappingToFormat = ['bold','italic','underline','fontName','fontSize','justifyLeft','justifyCenter','justifyRight','justifyFull'];
              
              // File panel actions
              if (cmd === 'fileNew') {
                if (confirm('Create new document? Unsaved changes will be lost.')) {
                  setDocumentTitle('Untitled Document');
                  if (paginationRef.current) paginationRef.current.setContent('<p></p>');
                  showNotification('New document created', 'success');
                }
              } else if (cmd === 'fileOpen') {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.docx';
                input.onchange = handleImportDocx;
                input.click();
              } else if (cmd === 'fileShare') {
                setShowShareModal(true);
              } else if (cmd === 'fileCopy') {
                const newTitle = documentTitle + ' (Copy)';
                setDocumentTitle(newTitle);
                showNotification('Document copied', 'success');
              } else if (cmd === 'fileExport') {
                handleExport();
              } else if (cmd === 'fileExportPdf') {
                handleExportPdf();
              } else if (cmd === 'fileExportDocx') {
                handleExportDocx();
              } else if (cmd === 'filePrint') {
                window.print();
              } else if (cmd === 'fileRename') {
                setIsEditing(true);
              } else if (cmd === 'fileDelete') {
                if (confirm('Are you sure you want to delete this document?')) {
                  showNotification('Document deleted', 'success');
                  navigate('/');
                }
              } else if (cmd === 'fileSave') {
                // Save current document
                showNotification('Document saved', 'success');
              } else if (cmd === 'fileSaveAs') {
                // Save as new document
                const newTitle = prompt('Enter new document name:', documentTitle);
                if (newTitle) {
                  setDocumentTitle(newTitle);
                  showNotification('Document saved as ' + newTitle, 'success');
                }
              } else if (cmd === 'fileClose') {
                if (confirm('Close document? Any unsaved changes will be lost.')) {
                  navigate('/');
                }
              } else if (cmd === 'insertPageBreak') {
                insertPageBreak();
              } else if (cmd === 'insertTable') {
                if (value && value.rows && value.cols) {
                  let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
                  for (let i = 0; i < value.rows; i++) {
                    tableHTML += '<tr>';
                    for (let j = 0; j < value.cols; j++) {
                      tableHTML += '<td style="padding: 8px; border: 1px solid #ccc;">&nbsp;</td>';
                    }
                    tableHTML += '</tr>';
                  }
                  tableHTML += '</table>';
                  document.execCommand('insertHTML', false, tableHTML);
                }
              } else if (cmd === 'insertImageData') {
                if (value) {
                  document.execCommand('insertImage', false, value);
                  showNotification('Image inserted successfully!', 'success');
                }
              } else if (cmd === 'insertImageStock') {
                showNotification('Stock images feature coming soon!', 'info');
              } else if (cmd === 'insertLink') {
                if (value && value.url) {
                  // Focus the editor first
                  const editor = editorContainerRef.current?.querySelector('[contenteditable="true"]');
                  if (editor) {
                    editor.focus();
                    const linkHTML = `<a href="${value.url}" target="_blank">${value.text || value.url}</a>`;
                    document.execCommand('insertHTML', false, linkHTML);
                    showNotification('Link inserted successfully!', 'success');
                  }
                }
              } else if (cmd === 'drawingTool') {
                // Drawing tool functionality would be implemented here
                console.log('Drawing tool:', value);
              } else if (cmd === 'insertDrawing') {
                if (value) {
                  document.execCommand('insertImage', false, value);
                  showNotification('Drawing inserted successfully!', 'success');
                }
              } else if (cmd === 'insertParagraph') {
                document.execCommand('insertHTML', false, '<p></p>');
              } else if (cmd === 'insertImage') {
                const url = window.prompt('Image URL');
                if (url) document.execCommand('insertImage', false, url);
              } else if (cmd === 'refresh') {
                if (confirm('Refresh document? Any unsaved changes will be lost.')) {
                  window.location.reload();
                }
              } else if (cmd === 'cut') {
                document.execCommand('cut');
              } else if (cmd === 'copy') {
                document.execCommand('copy');
              } else if (cmd === 'paste') {
                document.execCommand('paste');
              } else if (cmd === 'findNext') {
                if (value) {
                  window.find(value, false, false, true);
                }
              } else if (cmd === 'replaceOne') {
                if (value && value.find && value.replace !== undefined) {
                  const selection = window.getSelection();
                  if (selection.toString() === value.find) {
                    document.execCommand('insertText', false, value.replace);
                  } else {
                    window.find(value.find, false, false, true);
                  }
                }
              } else if (cmd === 'replaceAll') {
                if (value && value.find && value.replace !== undefined) {
                  const content = paginationRef.current ? paginationRef.current.getAllContent() : '';
                  const newContent = content.replace(new RegExp(value.find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value.replace);
                  if (paginationRef.current) {
                    paginationRef.current.setContent(newContent);
                    showNotification(`Replaced all instances of "${value.find}"`, 'success');
                  }
                }
              } else if (cmd === 'selectAll') {
                document.execCommand('selectAll');
              } else if (cmd === 'undo') {
                document.execCommand('undo');
              } else if (cmd === 'redo') {
                document.execCommand('redo');
              } else if (cmd === 'bulletStyleDisc') {
                document.execCommand('insertUnorderedList');
                const selection = window.getSelection();
                if (selection.anchorNode) {
                  const listElement = selection.anchorNode.closest ? selection.anchorNode.closest('ul') : null;
                  if (listElement) listElement.style.listStyleType = 'disc';
                }
              } else if (cmd === 'bulletStyleCircle') {
                document.execCommand('insertUnorderedList');
                const selection = window.getSelection();
                if (selection.anchorNode) {
                  const listElement = selection.anchorNode.closest ? selection.anchorNode.closest('ul') : null;
                  if (listElement) listElement.style.listStyleType = 'circle';
                }
              } else if (cmd === 'bulletStyleSquare') {
                document.execCommand('insertUnorderedList');
                const selection = window.getSelection();
                if (selection.anchorNode) {
                  const listElement = selection.anchorNode.closest ? selection.anchorNode.closest('ul') : null;
                  if (listElement) listElement.style.listStyleType = 'square';
                }
              } else if (cmd === 'createNestedBullet') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const nestedList = document.createElement('ul');
                  nestedList.style.listStyleType = 'circle';
                  nestedList.style.marginLeft = '20px';
                  const listItem = document.createElement('li');
                  listItem.innerHTML = '&nbsp;';
                  nestedList.appendChild(listItem);
                  range.insertNode(nestedList);
                  range.setStart(listItem, 0);
                  range.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(range);
                }
              } else if (cmd === 'applyTextStyle') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0 && value) {
                  const range = selection.getRangeAt(0);
                  let element;
                  
                  switch(value) {
                    case 'heading1':
                      document.execCommand('formatBlock', false, 'h1');
                      break;
                    case 'heading2':
                      document.execCommand('formatBlock', false, 'h2');
                      break;
                    case 'heading3':
                      document.execCommand('formatBlock', false, 'h3');
                      break;
                    case 'heading4':
                      document.execCommand('formatBlock', false, 'h4');
                      break;
                    case 'title':
                      document.execCommand('formatBlock', false, 'h1');
                      const titleEl = selection.anchorNode.closest ? selection.anchorNode.closest('h1') : null;
                      if (titleEl) {
                        titleEl.style.fontSize = '28px';
                        titleEl.style.fontWeight = 'bold';
                        titleEl.style.textAlign = 'center';
                      }
                      break;
                    case 'subtitle':
                      document.execCommand('formatBlock', false, 'h2');
                      const subtitleEl = selection.anchorNode.closest ? selection.anchorNode.closest('h2') : null;
                      if (subtitleEl) {
                        subtitleEl.style.fontSize = '18px';
                        subtitleEl.style.fontStyle = 'italic';
                        subtitleEl.style.textAlign = 'center';
                      }
                      break;
                    case 'body':
                    case 'paragraph':
                      document.execCommand('formatBlock', false, 'p');
                      break;
                    case 'quote':
                      document.execCommand('formatBlock', false, 'blockquote');
                      const quoteEl = selection.anchorNode.closest ? selection.anchorNode.closest('blockquote') : null;
                      if (quoteEl) {
                        quoteEl.style.fontStyle = 'italic';
                        quoteEl.style.borderLeft = '4px solid #ccc';
                        quoteEl.style.paddingLeft = '16px';
                        quoteEl.style.margin = '16px 0';
                      }
                      break;
                    case 'code':
                      document.execCommand('formatBlock', false, 'pre');
                      const codeEl = selection.anchorNode.closest ? selection.anchorNode.closest('pre') : null;
                      if (codeEl) {
                        codeEl.style.fontFamily = 'Courier New, monospace';
                        codeEl.style.backgroundColor = '#f5f5f5';
                        codeEl.style.padding = '8px';
                        codeEl.style.borderRadius = '4px';
                      }
                      break;
                    case 'caption':
                      document.execCommand('formatBlock', false, 'p');
                      const captionEl = selection.anchorNode.closest ? selection.anchorNode.closest('p') : null;
                      if (captionEl) {
                        captionEl.style.fontSize = '12px';
                        captionEl.style.fontStyle = 'italic';
                        captionEl.style.textAlign = 'center';
                        captionEl.style.color = '#666';
                      }
                      break;
                    case 'emphasis':
                      document.execCommand('formatBlock', false, 'p');
                      const emphasisEl = selection.anchorNode.closest ? selection.anchorNode.closest('p') : null;
                      if (emphasisEl) {
                        emphasisEl.style.fontWeight = 'bold';
                        emphasisEl.style.fontSize = '16px';
                      }
                      break;
                  }
                }
              } else if (mappingToFormat.includes(cmd)) {
                formatText(cmd, value);
              } else {
                try { document.execCommand(cmd, false, value); } catch (e) { console.warn('execCommand failed', cmd, value, e); }
              }
              setTimeout(updateFormatState, 60);
              setTimeout(updateDocumentStats, 160);
            }}
            currentFormat={currentFormat}
          />
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
      
      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Share Document</h3>
              <button onClick={() => setShowShareModal(false)}>×</button>
            </div>
            <div className="modal-content">
              <div className="share-option">
                <label>Document Link:</label>
                <div className="link-container">
                  <input type="text" value={window.location.href} readOnly />
                  <button onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showNotification('Link copied to clipboard', 'success');
                  }}>Copy</button>
                </div>
              </div>
              <div className="share-option">
                <label>Share via Email:</label>
                <input type="email" placeholder="Enter email address" />
                <button onClick={() => showNotification('Email sent', 'success')}>Send</button>
              </div>
              <div className="share-option">
                <label>Permission Level:</label>
                <select>
                  <option>Can View</option>
                  <option>Can Edit</option>
                  <option>Can Comment</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentEditor;