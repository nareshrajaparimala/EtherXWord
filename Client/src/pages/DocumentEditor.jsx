import React, { useState, useRef, useContext, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { saveAs } from 'file-saver';
import Logo from '../components/Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import './DocumentEditor.css';
import { useNotification } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import { importDocxOOXML, exportDocxOOXML } from '../utils/ooxmlUtils';

const DocumentEditor = () => {
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const isLogoAnimating = useLogoAnimation();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  // Document state
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isEditing, setIsEditing] = useState(false);
  const [documentContent, setDocumentContent] = useState('<p dir="ltr">Start writing your document here...</p>');
  const [documentStats, setDocumentStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    pages: 1
  });
  
  // Editor state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Formatting state
  const [currentFormat, setCurrentFormat] = useState({
    fontFamily: 'Georgia',
    fontSize: '12pt',
    bold: false,
    italic: false,
    underline: false,
    textAlign: 'left',
    textColor: '#000000',
    backgroundColor: 'transparent'
  });
  
  // Page setup
  const [pageSetup, setPageSetup] = useState({
    orientation: 'portrait',
    margins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    },
    size: 'A4'
  });
  
  // Refs
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const autoSaveInterval = useRef(null);
  const isApplyingContentRef = useRef(false);
  const isEditorChangeRef = useRef(false);
  
  // Auto-save functionality
  useEffect(() => {
    if (documentId && documentContent) {
      autoSaveInterval.current = setInterval(() => {
        saveDocument(false);
      }, 30000); // Auto-save every 30 seconds
    }
    
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [documentId, documentContent]);
  
  // Update document stats
  useEffect(() => {
    updateDocumentStats();
  }, [documentContent]);

  // When documentContent is changed programmatically (e.g., import or load), apply it to the editor
  useEffect(() => {
    if (!editorRef.current) return;
    // If change was triggered by the editor itself, don't re-apply
    if (isApplyingContentRef.current) return;
    if (isEditorChangeRef.current) {
      // reset the flag and skip applying programmatic changes
      isEditorChangeRef.current = false;
      return;
    }

    isApplyingContentRef.current = true;
    editorRef.current.innerHTML = documentContent;
    // Small timeout to allow event loop to settle before allowing user input again
    setTimeout(() => {
      isApplyingContentRef.current = false;
    }, 0);
  }, [documentContent]);
  
  const updateDocumentStats = useCallback(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = documentContent;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;
    const paragraphs = (documentContent.match(/<p[^>]*>/g) || []).length;
    
    // Estimate pages based on content length (rough calculation)
    const wordsPerPage = 250;
    const estimatedPages = Math.max(1, Math.ceil(words / wordsPerPage));
    
    setDocumentStats({
      words,
      characters,
      charactersNoSpaces,
      paragraphs,
      pages: estimatedPages
    });
  }, [documentContent]);
  
  // Format text functions
  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    updateFormatState();
    if (editorRef.current) {
      editorRef.current.focus();
    }
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
                document.queryCommandValue('justifyRight') ? 'right' : 'left',
      textColor: document.queryCommandValue('foreColor') || '#000000',
      backgroundColor: document.queryCommandValue('backColor') || 'transparent'
    });
  };

  // Ensure all block elements are explicitly LTR so typing appears left-to-right
  const normalizeContentLTR = (html) => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html || '', 'text/html');

      const blockSelectors = 'p, div, h1, h2, h3, h4, h5, h6, li, td, th, blockquote';
      const blocks = doc.body.querySelectorAll(blockSelectors);

      if (blocks.length === 0) {
        // If there are no blocks, wrap text nodes in a paragraph with dir=ltr
        const text = doc.body.textContent || '';
        doc.body.innerHTML = '';
        const p = doc.createElement('p');
        p.setAttribute('dir', 'ltr');
        p.style.direction = 'ltr';
        p.style.unicodeBidi = 'isolate-override';
        p.textContent = text;
        doc.body.appendChild(p);
      } else {
        blocks.forEach((el) => {
          el.setAttribute('dir', 'ltr');
          el.style.direction = 'ltr';
          el.style.unicodeBidi = 'isolate-override';
        });
      }

      return doc.body.innerHTML;
    } catch (e) {
      console.warn('normalizeContentLTR failed', e);
      return html;
    }
  };
  
  // DOCX Import
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
        applyContentToEditor(result.html);
        setDocumentTitle(file.name.replace('.docx', ''));
        showNotification('DOCX file imported successfully!', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Import error:', error);
      showNotification('Failed to import DOCX file: ' + error.message, 'error');
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  // Enrich HTML with text-align styles from editor's computed styles
  const enrichAlignmentStyles = (html) => {
    if (!editorRef.current) return html;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const pElements = doc.querySelectorAll('p');
      
      // For each paragraph, check the actual editor DOM for its computed alignment
      // and inject it into the style attribute
      const editorParas = editorRef.current.querySelectorAll('p');
      pElements.forEach((p, idx) => {
        if (idx < editorParas.length) {
          const editorP = editorParas[idx];
          const computedStyle = window.getComputedStyle(editorP);
          const textAlign = computedStyle.textAlign || 'left';
          if (textAlign && textAlign !== 'left') {
            const existing = p.getAttribute('style') || '';
            const alignStyle = `text-align: ${textAlign}`;
            // Add align style if not already present
            if (!existing.includes('text-align')) {
              p.setAttribute('style', existing ? `${existing}; ${alignStyle}` : alignStyle);
            }
          }
        }
      });
      
      return doc.body.innerHTML;
    } catch (e) {
      console.warn('enrichAlignmentStyles failed', e);
      return html;
    }
  };
  
  // DOCX Export
  const handleExportDocx = async () => {
    try {
      showNotification('Exporting to DOCX...', 'info');
      
      // Enrich HTML with alignment styles before export
      const enrichedHtml = enrichAlignmentStyles(documentContent);
      const buffer = await exportDocxOOXML(enrichedHtml, documentTitle);
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
  
  // Save document
  const saveDocument = async (showMessage = true) => {
    try {
      const documentData = {
        title: documentTitle,
        content: documentContent,
        stats: documentStats,
        formatting: {
          pageSetup,
          defaultFont: {
            family: currentFormat.fontFamily,
            size: currentFormat.fontSize
          }
        },
        lastModified: new Date().toISOString()
      };
      
      // Here you would typically save to your backend
      // For now, we'll just save to localStorage as a demo
      if (documentId) {
        localStorage.setItem(`document_${documentId}`, JSON.stringify(documentData));
      }
      
      if (showMessage) {
        showNotification('Document saved successfully!', 'success');
      }
    } catch (error) {
      console.error('Save error:', error);
      if (showMessage) {
        showNotification('Failed to save document', 'error');
      }
    }
  };
  
  // Handle content change
  const handleContentChange = () => {
    if (!editorRef.current) return;
    if (isApplyingContentRef.current) return;

    const newContent = editorRef.current.innerHTML;
    // Normalize but do not re-apply innerHTML immediately (avoid caret jumps)
    const normalized = normalizeContentLTR(newContent);
    isEditorChangeRef.current = true;
    setDocumentContent(normalized);
  };

  // Apply HTML into editor safely (for imports/loads)
  const applyContentToEditor = (html) => {
    if (!editorRef.current) return;
    const normalized = normalizeContentLTR(html);
    isApplyingContentRef.current = true;
    editorRef.current.innerHTML = normalized;
    setDocumentContent(normalized);
    setTimeout(() => {
      isApplyingContentRef.current = false;
    }, 0);
  };

  // Insert table
  const insertTable = (rows = 3, cols = 3) => {
    let tableHTML = '<table class="etherx-table" style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #ddd;">';
    
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 60px;" contenteditable="true">&nbsp;</td>';
      }
      tableHTML += '</tr>';
    }
    
    tableHTML += '</table>';
    
    document.execCommand('insertHTML', false, tableHTML);
    handleContentChange();
  };
  
  // Insert image
  const insertImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showNotification('Please select a valid image file', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = `<img src="${e.target.result}" style="max-width: 100%; height: auto; margin: 10px 0;" alt="Inserted image" />`;
      document.execCommand('insertHTML', false, img);
      handleContentChange();
    };
    reader.readAsDataURL(file);
    
    event.target.value = '';
  };

  // Paste handler: sanitize and enforce LTR
  const handlePaste = (e) => {
    e.preventDefault();
    const clipboard = e.clipboardData || window.clipboardData;
    let html = clipboard.getData('text/html');
    const text = clipboard.getData('text/plain');

    if (!html && text) {
      // Insert plain text wrapped in a paragraph
      const safe = `<p dir="ltr">${escapeHtml(text)}</p>`;
      document.execCommand('insertHTML', false, safe);
    } else if (html) {
      // Normalize pasted HTML and insert
      const normalized = normalizeContentLTR(html);
      document.execCommand('insertHTML', false, normalized);
    }

    // After paste, update our state
    setTimeout(() => {
      handleContentChange();
    }, 0);
  };

  const escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(200, prev + 10));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(50, prev - 10));
  };
  
  const resetZoom = () => {
    setZoomLevel(100);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    setShowToolbar(!isFullscreen);
  };
  
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
            <h1 
              className="document-title"
              onClick={() => setIsEditing(true)}
            >
              {documentTitle}
            </h1>
          )}
        </div>
        
        <div className="navbar-right">
          <button onClick={toggleTheme} className="nav-btn" title="Toggle theme">
            <i className={`ri-${theme === 'dark' ? 'sun' : 'moon'}-line`}></i>
          </button>
          <button onClick={toggleFullscreen} className="nav-btn" title="Toggle fullscreen">
            <i className={`ri-${isFullscreen ? 'fullscreen-exit' : 'fullscreen'}-line`}></i>
          </button>
          <button onClick={() => saveDocument()} className="nav-btn save-btn">
            <i className="ri-save-line"></i> Save
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
              title="Import DOCX"
            >
              <i className="ri-file-upload-line"></i> Import
            </button>
            <button 
              className="toolbar-btn"
              onClick={handleExportDocx}
              title="Export DOCX"
            >
              <i className="ri-file-download-line"></i> Export
            </button>
          </div>
          
          {/* Font Formatting */}
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
              <option value="Helvetica">Helvetica</option>
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
          </div>
          
          {/* Text Formatting */}
          <div className="toolbar-group">
            <button 
              className={`toolbar-btn ${currentFormat.bold ? 'active' : ''}`}
              onClick={() => formatText('bold')}
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button 
              className={`toolbar-btn ${currentFormat.italic ? 'active' : ''}`}
              onClick={() => formatText('italic')}
              title="Italic"
            >
              <em>I</em>
            </button>
            <button 
              className={`toolbar-btn ${currentFormat.underline ? 'active' : ''}`}
              onClick={() => formatText('underline')}
              title="Underline"
            >
              <u>U</u>
            </button>
          </div>
          
          {/* Alignment */}
          <div className="toolbar-group">
            <button 
              className="toolbar-btn"
              onClick={() => formatText('justifyLeft')}
              title="Align Left"
            >
              <i className="ri-align-left"></i>
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => formatText('justifyCenter')}
              title="Align Center"
            >
              <i className="ri-align-center"></i>
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => formatText('justifyRight')}
              title="Align Right"
            >
              <i className="ri-align-right"></i>
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => formatText('justifyFull')}
              title="Justify"
            >
              <i className="ri-align-justify"></i>
            </button>
          </div>
          
          {/* Lists */}
          <div className="toolbar-group">
            <button 
              className="toolbar-btn"
              onClick={() => formatText('insertUnorderedList')}
              title="Bullet List"
            >
              <i className="ri-list-unordered"></i>
            </button>
            <button 
              className="toolbar-btn"
              onClick={() => formatText('insertOrderedList')}
              title="Numbered List"
            >
              <i className="ri-list-ordered"></i>
            </button>
          </div>
          
          {/* Insert */}
          <div className="toolbar-group">
            <button 
              className="toolbar-btn"
              onClick={() => insertTable()}
              title="Insert Table"
            >
              <i className="ri-table-line"></i> Table
            </button>
            <input
              type="file"
              onChange={insertImage}
              accept="image/*"
              style={{ display: 'none' }}
              id="image-input"
            />
            <button 
              className="toolbar-btn"
              onClick={() => document.getElementById('image-input')?.click()}
              title="Insert Image"
            >
              <i className="ri-image-line"></i> Image
            </button>
          </div>
          
          {/* Colors */}
          <div className="toolbar-group">
            <div className="color-picker">
              <input
                type="color"
                value={currentFormat.textColor}
                onChange={(e) => formatText('foreColor', e.target.value)}
                className="color-picker-input"
                title="Text Color"
              />
              <span className="color-picker-label">A</span>
            </div>
            <div className="color-picker">
              <input
                type="color"
                value={currentFormat.backgroundColor}
                onChange={(e) => formatText('backColor', e.target.value)}
                className="color-picker-input"
                title="Background Color"
              />
              <span className="color-picker-label">■</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Editor Content */}
      <div className="editor-layout">
        <div className="editor-wrapper">
          <div className="pages-container">
            <div 
              className="page-scale-wrapper"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <div className="editor-page a4-page">
                <div 
                  ref={editorRef}
                  className="editor-content a4-content"
                  contentEditable
                  dir="ltr"
                  onInput={handleContentChange}
                  onPaste={(e) => handlePaste(e)}
                  onMouseUp={updateFormatState}
                  onKeyUp={updateFormatState}
                  style={{
                    fontFamily: currentFormat.fontFamily,
                    fontSize: currentFormat.fontSize,
                    padding: `${pageSetup.margins.top}mm ${pageSetup.margins.right}mm ${pageSetup.margins.bottom}mm ${pageSetup.margins.left}mm`,
                    unicodeBidi: 'isolate-override'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bottom-status-bar">
        <div className="status-left">
          <div className="word-count">
            <i className="ri-file-text-line"></i>
            <span>{documentStats.words} words</span>
          </div>
          <div className="char-count">
            <i className="ri-character-recognition-line"></i>
            <span>{documentStats.characters} chars</span>
          </div>
          <div className="page-info">
            <i className="ri-file-copy-line"></i>
            <span>Page {documentStats.pages}</span>
          </div>
        </div>
        
        <div className="status-center">
          <div className="paragraph-info">
            <i className="ri-paragraph"></i>
            <span>{documentStats.paragraphs} paragraphs</span>
          </div>
        </div>
        
        <div className="status-right">
          <div className="zoom-inline-controls">
            <button 
              className="zoom-inline-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 50}
            >
              <i className="ri-subtract-line"></i>
            </button>
            <span className="zoom-level-display">{zoomLevel}%</span>
            <button 
              className="zoom-inline-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 200}
            >
              <i className="ri-add-line"></i>
            </button>
            <button 
              className="zoom-reset-btn"
              onClick={resetZoom}
              disabled={zoomLevel === 100}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;