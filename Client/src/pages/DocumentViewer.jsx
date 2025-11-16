import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
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
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [pages, setPages] = useState([{ id: 1, content: '', header: '', footer: '' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Times New Roman');
  const [textAlign, setTextAlign] = useState('left');
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [showRuler, setShowRuler] = useState(true);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  
  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const pageRefs = useRef([]);
  const token = searchParams.get('token');

  const MAX_LINES_PER_PAGE = 45;
  const PAGE_HEIGHT = 297; // A4 height in mm
  const PAGE_WIDTH = 210; // A4 width in mm

  useEffect(() => {
    loadDocument();
  }, [documentId, documentAddress, token]);

  useEffect(() => {
    if (content) {
      updateStats();
      handleAutoPageBreak();
      autoSave();
    }
  }, [content]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url;
      const headers = {};
      
      // Determine the correct endpoint and identifier
      const identifier = documentAddress || documentId;
      
      if (token) {
        // Shared document with token
        url = `${import.meta.env.VITE_API_URL}/api/documents/shared/${token}`;
      } else if (identifier) {
        // Document by ID or address
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
          // MongoDB ObjectId
          url = `${import.meta.env.VITE_API_URL}/api/documents/${identifier}`;
        } else {
          // Document address
          url = `${import.meta.env.VITE_API_URL}/api/documents/address/${identifier}`;
        }
        
        // Add auth header if available
        if (localStorage.getItem('accessToken')) {
          headers['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`;
        }
      } else {
        throw new Error('No document identifier provided');
      }

      console.log('Loading document from:', url);
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Document loaded:', data);
        
        setDocumentData(data);
        setContent(data.content || '');
        setPages(data.pages || [{ id: 1, content: data.content || '', header: '', footer: '' }]);
        setIsEditing(data.userPermission === 'edit' || data.permission === 'edit');
        setHeaderText(data.formatting?.headerText || '');
        setFooterText(data.formatting?.footerText || '');
        setFontSize(parseInt(data.formatting?.defaultFont?.size?.replace('pt', '')) || 12);
        setFontFamily(data.formatting?.defaultFont?.family || 'Times New Roman');
        
        // Add to recent documents
        const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
        const docData = {
          title: data.title,
          lastModified: new Date().toISOString(),
          preview: data.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No preview available',
          wordCount: data.wordCount || 0,
          id: data._id,
          documentAddress: data.documentAddress
        };
        
        const filtered = recentDocs.filter(d => d.id !== data._id && d.documentAddress !== data.documentAddress);
        filtered.unshift(docData);
        localStorage.setItem('recentDocuments', JSON.stringify(filtered.slice(0, 10)));
        
      } else if (response.status === 404) {
        setError('Document not found or you do not have permission to view it.');
      } else if (response.status === 403) {
        setError('Access denied. You do not have permission to view this document.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to load document. Please try again.');
      }
    } catch (error) {
      console.error('Error loading document:', error);
      setError('Failed to load document. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStats = useCallback(() => {
    const allText = pages.map(page => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = page.content;
      return tempDiv.innerText || '';
    }).join(' ');
    
    const words = allText.trim().split(/\s+/).filter(word => word.length > 0);
    const lines = allText.split('\n').length;
    
    setWordCount(words.length);
    setCharCount(allText.length);
    setLineCount(lines);
  }, [pages]);

  const handleAutoPageBreak = useCallback(() => {
    if (!isEditing) return;
    
    const updatedPages = [...pages];
    let needsNewPage = false;
    
    updatedPages.forEach((page, index) => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = page.content;
      const textLines = (tempDiv.innerText || '').split('\n');
      
      if (textLines.length > MAX_LINES_PER_PAGE) {
        const overflowLines = textLines.slice(MAX_LINES_PER_PAGE);
        const remainingContent = overflowLines.join('\n');
        
        // Truncate current page
        updatedPages[index].content = textLines.slice(0, MAX_LINES_PER_PAGE).join('\n');
        
        // Create new page or add to next page
        if (index + 1 < updatedPages.length) {
          updatedPages[index + 1].content = remainingContent + '\n' + updatedPages[index + 1].content;
        } else {
          updatedPages.push({
            id: updatedPages.length + 1,
            content: remainingContent,
            header: headerText,
            footer: footerText
          });
          needsNewPage = true;
        }
      }
    });
    
    if (needsNewPage || updatedPages.length !== pages.length) {
      setPages(updatedPages);
    }
  }, [pages, isEditing, headerText, footerText]);

  const autoSave = useCallback(() => {
    if (!isEditing || !documentData) return;
    
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      await saveDocument();
    }, 2000);
  }, [pages, isEditing, documentData]);

  const saveDocument = async () => {
    if (!documentData || !isEditing) return;
    
    setIsSaving(true);
    try {
      const allContent = pages.map(page => page.content).join('\n\n');
      const url = token ? 
        `${import.meta.env.VITE_API_URL}/api/documents/shared/${token}` :
        `${import.meta.env.VITE_API_URL}/api/documents/${documentData._id}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          content: allContent,
          pages,
          formatting: {
            ...documentData.formatting,
            headerText,
            footerText,
            defaultFont: { family: fontFamily, size: `${fontSize}pt`, lineHeight: '1.5' }
          }
        })
      });
      
      if (response.ok) {
        setLastSaved(new Date());
        showNotification('Document saved successfully', 'success');
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      showNotification('Failed to save document', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageContentChange = (pageIndex, newContent) => {
    if (!isEditing) return;
    
    const updatedPages = [...pages];
    updatedPages[pageIndex].content = newContent;
    setPages(updatedPages);
    
    const allContent = updatedPages.map(page => page.content).join('\n\n');
    setContent(allContent);
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      await importDocx(file);
    } else {
      showNotification('Please select a DOCX file', 'error');
    }
  };

  const importDocx = async (file) => {
    try {
      showNotification('Importing DOCX file...', 'info');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/import-docx`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        const importedContent = data.html;
        
        // Split content into pages based on line count
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = importedContent;
        const textLines = (tempDiv.innerText || '').split('\n');
        
        const newPages = [];
        for (let i = 0; i < textLines.length; i += MAX_LINES_PER_PAGE) {
          const pageLines = textLines.slice(i, i + MAX_LINES_PER_PAGE);
          newPages.push({
            id: newPages.length + 1,
            content: pageLines.join('\n'),
            header: headerText,
            footer: footerText
          });
        }
        
        setPages(newPages.length > 0 ? newPages : [{ id: 1, content: importedContent, header: '', footer: '' }]);
        setContent(importedContent);
        showNotification('DOCX imported successfully', 'success');
      } else {
        throw new Error('Import failed');
      }
    } catch (error) {
      console.error('Error importing DOCX:', error);
      showNotification('Failed to import DOCX file', 'error');
    }
  };

  const exportToPDF = async () => {
    if (!documentData) return;
    
    try {
      showNotification('Generating PDF...', 'info');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        
        const pageElement = pageRefs.current[i];
        if (pageElement) {
          const canvas = await html2canvas(pageElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = PAGE_WIDTH - 20; // margins
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        }
      }
      
      pdf.save(`${documentData.title || 'document'}.pdf`);
      showNotification('PDF exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showNotification('Failed to export PDF', 'error');
    }
  };

  const exportToDocx = async () => {
    try {
      showNotification('Generating DOCX...', 'info');
      
      const children = [];
      
      // Add header if exists
      if (headerText) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: headerText, bold: true })],
            heading: HeadingLevel.HEADING_1
          })
        );
      }
      
      // Add content from all pages
      pages.forEach((page, index) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = page.content;
        const textContent = tempDiv.innerText || '';
        
        if (textContent.trim()) {
          const lines = textContent.split('\n').filter(line => line.trim());
          lines.forEach(line => {
            children.push(
              new Paragraph({
                children: [new TextRun({ text: line })]
              })
            );
          });
        }
        
        // Add page break except for last page
        if (index < pages.length - 1) {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: '', break: 1 })],
              pageBreakBefore: true
            })
          );
        }
      });
      
      // Add footer if exists
      if (footerText) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: footerText, italics: true })]
          })
        );
      }
      
      const doc = new Document({
        sections: [{
          properties: {},
          children
        }]
      });
      
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${documentData?.title || 'document'}.docx`);
      
      showNotification('DOCX exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      showNotification('Failed to export DOCX', 'error');
    }
  };

  const formatText = (command, value = null) => {
    if (!isEditing) return;
    document.execCommand(command, false, value);
    
    // Update current page content
    const activeElement = document.activeElement;
    const pageIndex = pageRefs.current.findIndex(ref => ref && ref.contains(activeElement));
    if (pageIndex !== -1) {
      const pageContent = pageRefs.current[pageIndex].querySelector('.page-content');
      if (pageContent) {
        handlePageContentChange(pageIndex, pageContent.innerHTML);
      }
    }
  };

  const insertPageBreak = () => {
    if (!isEditing) return;
    
    const newPage = {
      id: pages.length + 1,
      content: '',
      header: headerText,
      footer: footerText
    };
    
    setPages([...pages, newPage]);
    setCurrentPage(pages.length + 1);
  };

  const addNewPage = () => {
    const newPage = {
      id: pages.length + 1,
      content: '',
      header: headerText,
      footer: footerText
    };
    setPages([...pages, newPage]);
  };

  const generateShareLink = async () => {
    if (!documentData || !isEditing) return;
    
    try {
      const permission = window.confirm('Allow editing? Click OK for edit access, Cancel for view-only') ? 'edit' : 'view';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentData._id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ permission })
      });
      
      if (response.ok) {
        const data = await response.json();
        const shareUrl = `${window.location.origin}/viewer/${data.documentAddress || documentData.documentAddress}?token=${data.shareToken}`;
        
        // Copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        showNotification(`Share link copied to clipboard! Permission: ${permission}`, 'success');
        
        // Show share dialog
        const shareDialog = window.confirm(
          `Share link generated with ${permission} permission:\n\n${shareUrl}\n\nLink has been copied to clipboard. Click OK to open in new tab.`
        );
        
        if (shareDialog) {
          window.open(shareUrl, '_blank');
        }
      } else {
        throw new Error('Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      showNotification('Failed to generate share link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="document-viewer loading">
        <Logo animate={isLogoAnimating} />
        <p>Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-viewer error">
        <Logo animate={isLogoAnimating} />
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <header className="viewer-header">
        <div className="header-left">
          <Logo animate={isLogoAnimating} />
          <div className="document-info">
            <h1>{documentData?.title || 'Untitled Document'}</h1>
            <div className="document-meta">
              <span>Address: {documentData?.documentAddress || documentData?._id}</span>
              <span>Role: {documentData?.userPermission || documentData?.permission || 'viewer'}</span>
              <span>Created: {new Date(documentData?.createdAt).toLocaleDateString()}</span>
              <span>Words: {documentData?.wordCount || 0}</span>
              {documentData?.isFavorite && <span className="favorite">★ Favorite</span>}
              {documentData?.collaborators?.length > 0 && (
                <span>👥 {documentData.collaborators.length} collaborators</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          {isEditing && (
            <>
              <input
                type="file"
                accept=".docx"
                onChange={handleFileImport}
                style={{ display: 'none' }}
                id="docx-import"
              />
              <button onClick={() => document.getElementById('docx-import').click()}>
                Import DOCX
              </button>
              <button onClick={generateShareLink}>
                Share Document
              </button>
            </>
          )}
          <button onClick={exportToPDF}>Export PDF</button>
          <button onClick={exportToDocx}>Export DOCX</button>
          <div className="zoom-controls">
            <button onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}>-</button>
            <span>{zoomLevel}%</span>
            <button onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))}>+</button>
          </div>
        </div>
      </header>

      {isEditing && (
        <>
          <div className="toolbar">
            <div className="toolbar-group">
              <button onClick={() => formatText('bold')} title="Bold"><strong>B</strong></button>
              <button onClick={() => formatText('italic')} title="Italic"><em>I</em></button>
              <button onClick={() => formatText('underline')} title="Underline"><u>U</u></button>
            </div>
            <div className="toolbar-group">
              <button onClick={() => formatText('justifyLeft')} title="Align Left">⬅</button>
              <button onClick={() => formatText('justifyCenter')} title="Center">↔</button>
              <button onClick={() => formatText('justifyRight')} title="Align Right">➡</button>
              <button onClick={() => formatText('justifyFull')} title="Justify">⬌</button>
            </div>
            <div className="toolbar-group">
              <select value={fontSize} onChange={(e) => {
                setFontSize(parseInt(e.target.value));
                formatText('fontSize', Math.ceil(parseInt(e.target.value) / 3));
              }}>
                <option value="8">8pt</option>
                <option value="10">10pt</option>
                <option value="12">12pt</option>
                <option value="14">14pt</option>
                <option value="16">16pt</option>
                <option value="18">18pt</option>
                <option value="24">24pt</option>
                <option value="36">36pt</option>
              </select>
              <select value={fontFamily} onChange={(e) => {
                setFontFamily(e.target.value);
                formatText('fontName', e.target.value);
              }}>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Arial">Arial</option>
                <option value="Calibri">Calibri</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>
            <div className="toolbar-group">
              <button onClick={insertPageBreak} title="Insert Page Break">📄</button>
              <button onClick={() => formatText('undo')} title="Undo">↶</button>
              <button onClick={() => formatText('redo')} title="Redo">↷</button>
            </div>
            <div className="toolbar-group">
              <button onClick={() => setShowRuler(!showRuler)} title="Toggle Ruler">📏</button>
              <button onClick={() => setShowPageNumbers(!showPageNumbers)} title="Toggle Page Numbers">🔢</button>
            </div>
          </div>

          <div className="header-footer-controls">
            <div className="control-group">
              <label>Header:</label>
              <input
                type="text"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="Enter header text"
              />
            </div>
            <div className="control-group">
              <label>Footer:</label>
              <input
                type="text"
                value={footerText}
                onChange={(e) => setFooterText(e.target.value)}
                placeholder="Enter footer text"
              />
            </div>
          </div>
        </>
      )}

      {showRuler && (
        <div className="ruler">
          <div className="ruler-marks">
            {Array.from({ length: 21 }, (_, i) => (
              <div key={i} className="ruler-mark" style={{ left: `${i * 10}mm` }}>
                {i}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="document-container" style={{ zoom: `${zoomLevel}%` }}>
        <div className="document-pages">
          {pages.map((page, index) => (
            <div
              key={page.id}
              ref={el => pageRefs.current[index] = el}
              className="document-page"
              style={{
                fontFamily,
                fontSize: `${fontSize}pt`,
                textAlign
              }}
            >
              {headerText && (
                <div className="page-header">
                  <div className="header-content">{headerText}</div>
                </div>
              )}
              
              <div
                className="page-content"
                contentEditable={isEditing}
                onInput={(e) => handlePageContentChange(index, e.target.innerHTML)}
                dangerouslySetInnerHTML={{ __html: page.content }}
                style={{
                  minHeight: `${PAGE_HEIGHT - 80}mm`,
                  maxHeight: `${PAGE_HEIGHT - 80}mm`,
                  overflow: 'hidden'
                }}
              />
              
              {(footerText || showPageNumbers) && (
                <div className="page-footer">
                  <div className="footer-left">{footerText}</div>
                  {showPageNumbers && (
                    <div className="footer-right">Page {index + 1} of {pages.length}</div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isEditing && (
            <button className="add-page-btn" onClick={addNewPage}>
              + Add New Page
            </button>
          )}
        </div>
      </div>

      <footer className="viewer-footer">
        <div className="footer-left">
          <span>Pages: {pages.length}</span>
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
          <span>Lines: {lineCount}</span>
        </div>
        <div className="footer-right">
          {isEditing && (
            <>
              {isSaving && <span className="saving">Saving...</span>}
              {lastSaved && (
                <span className="last-saved">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  );
};

export default DocumentViewer;