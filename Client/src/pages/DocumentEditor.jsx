import React, { useState, useRef, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import Logo from '../components/Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import './DocumentEditor.css';
import ShareModal from '../components/ShareModal';
import { useNotification } from '../context/NotificationContext';
import { ThemeContext } from '../context/ThemeContext';
import TemplateDemo from '../components/TemplateDemo';

const DocumentEditor = () => {
  const { showNotification, clearAllNotifications } = useNotification();
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [documentHistory, setDocumentHistory] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showPageBorderControls, setShowPageBorderControls] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [userPermission, setUserPermission] = useState('edit');
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [pageBorder, setPageBorder] = useState({
    enabled: false,
    color: '#FFD700',
    width: '2px',
    style: 'solid',
    padding: '10px',
    borderType: 'simple',
    position: 'all' // 'all', 'top', 'bottom', 'both'
  });
  const [pages, setPages] = useState([{ id: 1, content: '<p>Start writing your document here...</p>' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [headerAlignment, setHeaderAlignment] = useState('top-center');
  const [footerAlignment, setFooterAlignment] = useState('bottom-center');
  const [pageNumbering, setPageNumbering] = useState({ enabled: true, position: 'bottom-right', format: '1' });
  const [showListStyles, setShowListStyles] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isUndoRedo, setIsUndoRedo] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [defaultFont, setDefaultFont] = useState({
    family: 'Georgia',
    size: '12pt',
    lineHeight: '1.5',
    color: '#333333'
  });
  const [showTemplateDemo, setShowTemplateDemo] = useState(false);
  const [showWatermarkControls, setShowWatermarkControls] = useState(false);
  const [watermark, setWatermark] = useState({
    enabled: false,
    type: 'text', // 'text' or 'image'
    text: 'CONFIDENTIAL',
    image: null,
    opacity: 0.3,
    size: 48,
    color: '#cccccc',
    rotation: 45, // degrees
    alignment: 'center' // 'center', 'diagonal', 'straight'
  });
  const [wordCount, setWordCount] = useState(0);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const editorRef = useRef(null);
  const undoTimeoutRef = useRef(null);

  // Load template data if available and apply default font


  React.useEffect(() => {
    const selectedTemplate = localStorage.getItem('selectedTemplate');
    if (selectedTemplate) {
      try {
        const templateData = JSON.parse(selectedTemplate);
        if (editorRef.current) {
          // Use safe loading function to preserve existing features
          safeLoadTemplate(templateData);
        }
        // Clear the template data after loading
        localStorage.removeItem('selectedTemplate');
      } catch (error) {
        console.error('Error parsing template data:', error);
        localStorage.removeItem('selectedTemplate');
        showNotification('Invalid template data, cleared from storage', 'warning');
      }
    } else if (editorRef.current) {
      // Apply default font to new document only if it's truly empty
      setTimeout(() => {
        const currentContent = editorRef.current.innerHTML;
        const isEmpty = !currentContent || currentContent.trim() === '' || 
                       currentContent === '<p>Start writing your document here...</p>' ||
                       currentContent === '<p><br></p>' ||
                       currentContent === '<div><br></div>';
        if (isEmpty) {
          applyDefaultFont();
          saveToUndoStack();
        }
      }, 100);
    }
  }, []);

  // Apply default font when settings change
  React.useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.fontFamily = defaultFont.family;
      editorRef.current.style.fontSize = defaultFont.size;
      editorRef.current.style.lineHeight = defaultFont.lineHeight;
      editorRef.current.style.color = defaultFont.color;
    }
  }, [defaultFont]);
  
  // Update word count on initial load
  React.useEffect(() => {
    if (editorRef.current) {
      const textContent = editorRef.current.innerText || editorRef.current.textContent || '';
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [editorRef.current?.innerHTML]);

  // Keyboard shortcuts for undo/redo and find/replace
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setShowFindReplace(true);
      } else if (e.key === 'Escape' && showFindReplace) {
        closeFindReplace();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undoStack, redoStack, showFindReplace]);
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const autoSaveInterval = useRef(null);
  const isLogoAnimating = useLogoAnimation();

  const saveToUndoStack = () => {
    if (editorRef.current && !isUndoRedo) {
      const content = editorRef.current.innerHTML;
      setUndoStack(prev => {
        const newStack = [...prev, content];
        return newStack.slice(-50); // Keep last 50 states
      });
      setRedoStack([]); // Clear redo stack when new action is performed
    }
  };

  const undo = () => {
    if (undoStack.length > 0 && editorRef.current) {
      setIsUndoRedo(true);
      const currentContent = editorRef.current.innerHTML;
      const previousContent = undoStack[undoStack.length - 1];
      
      setRedoStack(prev => [...prev, currentContent]);
      setUndoStack(prev => prev.slice(0, -1));
      
      editorRef.current.innerHTML = previousContent;
      setTimeout(() => setIsUndoRedo(false), 100);
    }
  };

  const redo = () => {
    if (redoStack.length > 0 && editorRef.current) {
      setIsUndoRedo(true);
      const currentContent = editorRef.current.innerHTML;
      const nextContent = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, currentContent]);
      setRedoStack(prev => prev.slice(0, -1));
      
      editorRef.current.innerHTML = nextContent;
      setTimeout(() => setIsUndoRedo(false), 100);
    }
  };

  const formatText = (command, value = null) => {
    saveToUndoStack();
    
    if (command === 'foreColor' && value) {
      // Modern approach for text color
      const selection = window.getSelection();
      if (selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = value;
        
        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
        } catch (e) {
          console.error('Error applying text color:', e);
        }
      }
    } else {
      // Use execCommand for other formatting
      document.execCommand(command, false, value);
    }
    
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleCut = () => {
    document.execCommand('cut');
    showNotification('Content cut to clipboard', 'success');
  };

  const handleCopy = () => {
    document.execCommand('copy');
    showNotification('Content copied to clipboard', 'success');
  };

  const handlePaste = () => {
    document.execCommand('paste');
    showNotification('Content pasted', 'success');
  };

  const applyWatermark = () => {
    setWatermark({ ...watermark, enabled: true });
    setShowWatermarkControls(false);
    showNotification('Watermark applied successfully', 'success');
  };

  const removeWatermark = () => {
    setWatermark({ ...watermark, enabled: false });
    showNotification('Watermark removed', 'success');
  };

  const handleWatermarkImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWatermark({ ...watermark, image: event.target.result, type: 'image' });
      };
      reader.readAsDataURL(file);
    }
  };

  const highlightMatches = (searchText) => {
    if (!searchText || !editorRef.current) return;
    
    // Remove existing highlights
    clearHighlights();
    
    const content = editorRef.current.innerHTML;
    const regex = new RegExp(`(${searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const matches = content.match(regex);
    
    if (matches) {
      setTotalMatches(matches.length);
      const highlightedContent = content.replace(regex, '<mark class="find-highlight">$1</mark>');
      editorRef.current.innerHTML = highlightedContent;
      
      // Highlight current match
      const highlights = editorRef.current.querySelectorAll('.find-highlight');
      if (highlights.length > 0) {
        highlights[0].classList.add('current-match');
        highlights[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        setCurrentMatch(1);
      }
    } else {
      setTotalMatches(0);
      setCurrentMatch(0);
    }
  };

  const clearHighlights = () => {
    if (!editorRef.current) return;
    const highlights = editorRef.current.querySelectorAll('.find-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  };

  const findNext = () => {
    const highlights = editorRef.current.querySelectorAll('.find-highlight');
    if (highlights.length === 0) return;
    
    highlights.forEach(h => h.classList.remove('current-match'));
    const nextIndex = currentMatch >= highlights.length ? 0 : currentMatch;
    highlights[nextIndex].classList.add('current-match');
    highlights[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setCurrentMatch(nextIndex + 1);
  };

  const findPrevious = () => {
    const highlights = editorRef.current.querySelectorAll('.find-highlight');
    if (highlights.length === 0) return;
    
    highlights.forEach(h => h.classList.remove('current-match'));
    const prevIndex = currentMatch <= 1 ? highlights.length - 1 : currentMatch - 2;
    highlights[prevIndex].classList.add('current-match');
    highlights[prevIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    setCurrentMatch(prevIndex + 1);
  };

  const replaceOne = () => {
    const currentHighlight = editorRef.current.querySelector('.find-highlight.current-match');
    if (currentHighlight) {
      saveToUndoStack();
      currentHighlight.textContent = replaceText;
      currentHighlight.classList.remove('find-highlight', 'current-match');
      
      // Re-highlight remaining matches
      setTimeout(() => {
        highlightMatches(findText);
      }, 100);
    }
  };

  const replaceAll = () => {
    if (!findText || !editorRef.current) return;
    
    saveToUndoStack();
    const content = editorRef.current.textContent;
    const regex = new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newContent = content.replace(regex, replaceText);
    editorRef.current.innerHTML = newContent;
    
    setTotalMatches(0);
    setCurrentMatch(0);
  };

  const closeFindReplace = () => {
    clearHighlights();
    setShowFindReplace(false);
    setFindText('');
    setReplaceText('');
    setCurrentMatch(0);
    setTotalMatches(0);
  };

  const applyDefaultFont = () => {
    if (editorRef.current) {
      saveToUndoStack();
      
      // Set default styles on the editor
      editorRef.current.style.fontFamily = defaultFont.family;
      editorRef.current.style.fontSize = defaultFont.size;
      editorRef.current.style.lineHeight = defaultFont.lineHeight;
      editorRef.current.style.color = defaultFont.color;
      
      // Apply to existing elements only if they don't have custom formatting
      const textElements = editorRef.current.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6');
      textElements.forEach(el => {
        // Only apply if element doesn't have existing custom styles
        if (!el.style.fontFamily || el.style.fontFamily === '') {
          el.style.fontFamily = defaultFont.family;
        }
        if (!el.style.fontSize || el.style.fontSize === '') {
          el.style.fontSize = defaultFont.size;
        }
        if (!el.style.lineHeight || el.style.lineHeight === '') {
          el.style.lineHeight = defaultFont.lineHeight;
        }
        if (!el.style.color || el.style.color === '') {
          el.style.color = defaultFont.color;
        }
      });
      
      // Set default for new content
      document.execCommand('fontName', false, defaultFont.family);
      document.execCommand('fontSize', false, defaultFont.size);
      document.execCommand('foreColor', false, defaultFont.color);
      
      editorRef.current.focus();
    }
  };

  const safeLoadTemplate = (templateData) => {
    if (!editorRef.current || !templateData) return;
    
    // Save current state
    const currentState = {
      content: editorRef.current.innerHTML,
      title: documentTitle,
      collaborators: collaborators,
      history: documentHistory,
      pageBorder: pageBorder,
      pages: pages,
      headerText: headerText,
      footerText: footerText
    };
    
    try {
      // Check if editor has meaningful content
      const hasContent = currentState.content && 
                        currentState.content.trim() !== '' &&
                        currentState.content !== '<p>Start writing your document here...</p>' &&
                        currentState.content !== '<p><br></p>' &&
                        currentState.content !== '<div><br></div>';
      
      if (hasContent) {
        // Merge template with existing content
        const separator = document.createElement('hr');
        separator.style.margin = '20px 0';
        separator.style.border = '1px solid #ddd';
        
        const templateSection = document.createElement('div');
        templateSection.innerHTML = templateData.content;
        templateSection.style.marginTop = '20px';
        
        editorRef.current.appendChild(separator);
        editorRef.current.appendChild(templateSection);
        
        showNotification('Template content added below existing content', 'info');
      } else {
        // Replace empty content with template
        editorRef.current.innerHTML = templateData.content;
        setDocumentTitle(templateData.title);
      }
      
      // Preserve all existing functionality
      setCollaborators(currentState.collaborators);
      setDocumentHistory(currentState.history);
      setPageBorder(currentState.pageBorder);
      setPages(currentState.pages);
      setHeaderText(currentState.headerText);
      setFooterText(currentState.footerText);
      
      // Apply fonts carefully
      setTimeout(() => {
        const newElements = editorRef.current.querySelectorAll('*:not([data-processed])');
        newElements.forEach(el => {
          if (!el.style.fontFamily) el.style.fontFamily = defaultFont.family;
          if (!el.style.fontSize) el.style.fontSize = defaultFont.size;
          if (!el.style.lineHeight) el.style.lineHeight = defaultFont.lineHeight;
          if (!el.style.color) el.style.color = defaultFont.color;
          el.setAttribute('data-processed', 'true');
        });
        saveToUndoStack();
      }, 100);
      
    } catch (error) {
      console.error('Error loading template safely:', error);
      // Restore previous state on error
      editorRef.current.innerHTML = currentState.content;
      setDocumentTitle(currentState.title);
      showNotification('Failed to load template, content restored', 'error');
    }
  };

  const resetToDefaultFont = () => {
    if (editorRef.current) {
      saveToUndoStack();
      const selection = window.getSelection();
      
      if (selection.rangeCount > 0 && !selection.isCollapsed) {
        // Apply to selected text
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontFamily = defaultFont.family;
        span.style.fontSize = defaultFont.size;
        span.style.lineHeight = defaultFont.lineHeight;
        span.style.color = defaultFont.color;
        
        try {
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          
          // Clear selection and place cursor after the span
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.setStartAfter(span);
          newRange.collapse(true);
          selection.addRange(newRange);
        } catch (e) {
          console.error('Error applying font to selection:', e);
        }
      } else {
        // No selection, apply to entire document
        applyDefaultFont();
      }
      
      editorRef.current.focus();
    }
  };

  const insertCustomList = (style, icon = null) => {
    saveToUndoStack();
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const ul = document.createElement('ul');
      
      if (icon) {
        ul.classList.add('custom-list');
        ul.setAttribute('data-icon', icon);
        ul.style.listStyleType = 'none';
        ul.style.paddingLeft = '20px';
      } else {
        ul.style.listStyleType = style;
        ul.style.paddingLeft = '20px';
      }
      
      ul.style.margin = '10px 0';

      const li = document.createElement('li');
      if (icon) {
        li.setAttribute('data-icon', icon);
        li.style.position = 'relative';
        li.style.paddingLeft = '20px';
      }
      li.innerHTML = 'List item';
      ul.appendChild(li);

      range.deleteContents();
      range.insertNode(ul);

      const newRange = document.createRange();
      newRange.selectNodeContents(li);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    setShowListStyles(false);
  };

  const listStyles = [
    { name: 'Bullet', style: 'disc', icon: '•' },
    { name: 'Circle', style: 'circle', icon: '○' },
    { name: 'Square', style: 'square', icon: '■' },
    { name: 'Arrow', style: 'none', icon: '→', custom: true },
    { name: 'Check', style: 'none', icon: '✓', custom: true },
    { name: 'Star', style: 'none', icon: '★', custom: true },
    { name: 'Diamond', style: 'none', icon: '♦', custom: true },
    { name: 'Triangle', style: 'none', icon: '▶', custom: true }
  ];

  const addNewPage = () => {
    const newPage = {
      id: pages.length + 1,
      content: '<p><br></p>',
      pageNumber: pages.length + 1,
      headerText: headerText,
      footerText: footerText
    };
    setPages([...pages, newPage]);
    setCurrentPage(newPage.id);
    
    // Focus on new page
    setTimeout(() => {
      const newPageElement = document.querySelector(`[data-page-id="${newPage.id}"]`);
      if (newPageElement) {
        newPageElement.focus();
      }
    }, 100);
  };

  const handleContentChange = (e, pageId) => {
    const content = e.target.innerHTML;
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId ? { ...page, content } : page
      )
    );
    
    // Update word count
    const textContent = e.target.innerText || e.target.textContent || '';
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Check line count and create new page if needed
    checkAndCreateNewPage(e.target);
    
    // Debounced undo stack save
    if (!isUndoRedo) {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      undoTimeoutRef.current = setTimeout(() => {
        saveToUndoStack();
      }, 1000);
    }
  };

  const checkAndCreateNewPage = (element) => {
    if (!element) return;
    
    // Count ALL lines including empty lines and line breaks
    const textContent = element.innerText || element.textContent || '';
    const htmlContent = element.innerHTML || '';
    
    // Count actual line breaks (including <br> tags and \n)
    const brTags = (htmlContent.match(/<br\s*\/?>/gi) || []).length;
    const newLines = (textContent.match(/\n/g) || []).length;
    const paragraphs = (htmlContent.match(/<p[^>]*>/gi) || []).length;
    const divs = (htmlContent.match(/<div[^>]*>/gi) || []).length;
    
    // Calculate total lines including empty spaces and breaks
    let totalLines = Math.max(
      brTags + newLines + paragraphs + divs,
      textContent.split('\n').length,
      Math.ceil(textContent.length / 80)
    );
    
    // Add extra lines for spacing elements
    const spacingElements = element.querySelectorAll('p, div, h1, h2, h3, br');
    totalLines = Math.max(totalLines, spacingElements.length);
    
    // Update line count display
    const pageElement = element.closest('.editor-page');
    if (pageElement) {
      pageElement.setAttribute('data-page-lines', totalLines);
      element.setAttribute('data-line-count', totalLines);
    }
    
    // Check if we need a new page (35 lines max)
    if (totalLines >= 35 && pages.length === currentPage) {
      
      // Create new page
      const newPage = {
        id: pages.length + 1,
        content: '<p><br></p>',
        pageNumber: pages.length + 1,
        headerText: headerText,
        footerText: footerText
      };
      
      setPages(prev => [...prev, newPage]);
      
      // Move cursor to new page
      setTimeout(() => {
        const newPageElement = document.querySelector(`[data-page-id="${newPage.id}"]`);
        if (newPageElement) {
          newPageElement.focus();
          setCurrentPage(newPage.id);
          
          // Place cursor at beginning of new page
          const range = document.createRange();
          const selection = window.getSelection();
          range.setStart(newPageElement, 0);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }, 100);
    } else if (totalLines >= 30) {
      // Show warning when approaching limit
      element.classList.add('page-break-needed');
    } else {
      element.classList.remove('page-break-needed');
    }
  };



  const updatePageNumbering = (enabled, position, format) => {
    setPageNumbering({ enabled, position, format });
  };

  const importDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.html,.md,.docx,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const fileType = file.type;
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        if (fileType.startsWith('image/')) {
          // Handle image files
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = document.createElement('img');
            img.src = event.target.result;
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.margin = '16px 0';
            img.style.cursor = 'pointer';
            img.style.borderRadius = '4px';
            img.style.transition = 'all 0.2s ease';
            img.alt = fileName;
            
            // Make image clickable for editing
            img.onclick = (e) => {
              e.stopPropagation();
              setSelectedImage(img);
              document.querySelectorAll('.editor-content img').forEach(i => i.classList.remove('selected'));
              img.classList.add('selected');
            };
            
            // Add hover effect
            img.onmouseenter = () => {
              img.style.boxShadow = '0 2px 8px rgba(255, 215, 0, 0.3)';
            };
            img.onmouseleave = () => {
              if (!img.classList.contains('selected')) {
                img.style.boxShadow = 'none';
              }
            };
            
            if (editorRef.current) {
              editorRef.current.appendChild(img);
              saveToUndoStack();
              showNotification('Image imported successfully! Click to edit.', 'success');
            }
          };
          reader.readAsDataURL(file);
        } else if (fileType === 'application/pdf' || fileExtension === 'pdf') {
          // Handle PDF files - create a link and placeholder
          const reader = new FileReader();
          reader.onload = (event) => {
            const pdfDiv = document.createElement('div');
            pdfDiv.style.cssText = 'border: 2px dashed #FFD700; padding: 20px; margin: 16px 0; text-align: center; background: rgba(255, 215, 0, 0.1);';
            pdfDiv.innerHTML = `
              <p><strong>📄 PDF Document: ${fileName}</strong></p>
              <p contenteditable="true">Click here to add notes about this PDF...</p>
              <small>PDF content cannot be directly edited, but you can add notes above.</small>
            `;
            
            if (editorRef.current) {
              editorRef.current.appendChild(pdfDiv);
              saveToUndoStack();
              showNotification('PDF imported as reference!', 'success');
            }
          };
          reader.readAsDataURL(file);
        } else if (fileExtension === 'csv' || fileType === 'text/csv') {
          // Handle CSV files
          const reader = new FileReader();
          reader.onload = (event) => {
            const csvContent = event.target.result;
            const lines = csvContent.split('\n');
            const table = document.createElement('table');
            table.style.cssText = 'border-collapse: collapse; width: 100%; margin: 16px 0; border: 1px solid #ddd;';
            
            lines.forEach((line, index) => {
              if (line.trim()) {
                const row = table.insertRow();
                const cells = line.split(',');
                cells.forEach(cell => {
                  const cellElement = row.insertCell();
                  cellElement.textContent = cell.trim().replace(/"/g, '');
                  cellElement.style.cssText = 'border: 1px solid #ddd; padding: 8px; background: var(--bg-secondary);';
                  cellElement.contentEditable = true;
                });
                if (index === 0) {
                  row.style.fontWeight = 'bold';
                  row.style.background = 'var(--primary-yellow)';
                }
              }
            });
            
            if (editorRef.current) {
              editorRef.current.appendChild(table);
              saveToUndoStack();
              showNotification('CSV imported as editable table!', 'success');
            }
          };
          reader.readAsText(file);
        } else {
          // Handle text-based files
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target.result;
            if (editorRef.current) {
              const div = document.createElement('div');
              div.innerHTML = content;
              div.contentEditable = true;
              div.style.margin = '16px 0';
              editorRef.current.appendChild(div);
              saveToUndoStack();
              showNotification('Document imported successfully!', 'success');
            }
          };
          reader.readAsText(file);
        }
      }
    };
    input.click();
  };

  const saveDocument = async (isAutoSave = false, saveVersion = false) => {
    // Check if user has edit permission
    if (isCollaborative && userPermission !== 'edit') {
      if (!isAutoSave) {
        showNotification('You do not have permission to edit this document', 'error');
      }
      return;
    }
    
    const content = editorRef.current.innerHTML;
    const currentWordCount = content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;
    
    if (isCollaborative && documentData && documentId && documentId.match(/^[0-9a-fA-F]{24}$/)) {
      // Save to server
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({
            title: documentTitle,
            content: content,
            pages: pages,
            formatting: {
              defaultFont: defaultFont,
              pageBorder: pageBorder,
              watermark: watermark,
              pageNumbering: pageNumbering
            },
            saveVersion: saveVersion
          })
        });
        
        if (response.ok) {
          const updatedDoc = await response.json();
          setDocumentData(updatedDoc);
          if (!isAutoSave) {
            showNotification('Document saved successfully!', 'success');
          }
        } else {
          if (!isAutoSave) {
            showNotification('Failed to save document', 'error');
          }
        }
      } catch (error) {
        console.error('Error saving document:', error);
        if (!isAutoSave) {
          showNotification('Failed to save document', 'error');
        }
      }
      return;
    }
    
    // Local storage save
    const timestamp = new Date().toISOString();
    const docData = {
      id: Date.now().toString(),
      title: documentTitle,
      content: content,
      lastModified: timestamp,
      wordCount: currentWordCount,
      pageCount: pages.length,
      collaborators: collaborators,
      pages: pages,
      formatting: {
        defaultFont: defaultFont,
        pageBorder: pageBorder,
        watermark: watermark,
        pageNumbering: pageNumbering
      },
      headerText: headerText,
      footerText: footerText
    };
    
    // Save version to history if requested or significant changes
    if (saveVersion || documentHistory.length === 0) {
      const newHistory = {
        id: Date.now().toString(),
        content: content,
        timestamp: timestamp,
        author: localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')).fullName : 'Anonymous',
        changes: 'Document updated',
        wordCount: currentWordCount
      };
      
      const updatedHistory = [newHistory, ...documentHistory.slice(0, 19)]; // Keep last 20 versions
      setDocumentHistory(updatedHistory);
      localStorage.setItem(`history_${documentTitle}`, JSON.stringify(updatedHistory));
    }
    
    // Save document
    const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = savedDocs.findIndex(doc => doc.title === documentTitle);
    
    if (docIndex >= 0) {
      savedDocs[docIndex] = docData;
    } else {
      savedDocs.push(docData);
    }
    
    localStorage.setItem('documents', JSON.stringify(savedDocs));
    
    // Update recent documents
    const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
    const recentIndex = recentDocs.findIndex(doc => doc.title === documentTitle);
    if (recentIndex >= 0) {
      recentDocs.splice(recentIndex, 1);
    }
    const preview = editorRef.current.innerText.substring(0, 100) + '...';
    recentDocs.unshift({ 
      title: documentTitle, 
      lastModified: timestamp,
      preview: preview,
      wordCount: currentWordCount,
      pageCount: pages.length
    });
    localStorage.setItem('recentDocuments', JSON.stringify(recentDocs.slice(0, 10)));
    
    if (!isAutoSave) {
      showNotification('Document saved successfully!', 'success');
    }
  };
  
  const deleteDocument = () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const deletedDoc = {
        title: documentTitle,
        content: editorRef.current.innerHTML,
        deletedAt: new Date().toISOString(),
        deletedBy: localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')).fullName : 'Anonymous'
      };
      
      // Add to deleted documents
      const deletedDocs = JSON.parse(localStorage.getItem('deletedDocuments') || '[]');
      deletedDocs.unshift(deletedDoc);
      localStorage.setItem('deletedDocuments', JSON.stringify(deletedDocs));
      
      // Remove from active documents
      const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      const filteredDocs = savedDocs.filter(doc => doc.title !== documentTitle);
      localStorage.setItem('documents', JSON.stringify(filteredDocs));
      
      navigate('/');
    }
  };
  
  const generateShareLink = async (permission = 'view') => {
    try {
      if (isCollaborative && documentId) {
        // Generate link for collaborative document
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
          const link = permission === 'edit' 
            ? `${window.location.origin}/editor/address/${data.documentAddress}?token=${data.shareToken}`
            : `${window.location.origin}/viewer/address/${data.documentAddress}?token=${data.shareToken}`;
          setShareLink(link);
          await navigator.clipboard.writeText(link);
          showNotification(`${permission === 'edit' ? 'Edit' : 'View'} link copied to clipboard!`, 'success');
        } else {
          showNotification('Failed to generate share link', 'error');
        }
      } else {
        // Create collaborative document first
        await createCollaborativeDocument();
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      showNotification('Failed to copy link to clipboard', 'error');
    }
  };
  
  const createCollaborativeDocument = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          title: documentTitle,
          content: editorRef.current.innerHTML,
          pages: pages,
          formatting: {
            defaultFont: defaultFont,
            pageBorder: pageBorder,
            watermark: watermark,
            pageNumbering: pageNumbering
          }
        })
      });
      
      if (response.ok) {
        const newDoc = await response.json();
        setDocumentData(newDoc);
        setIsCollaborative(true);
        setUserPermission('edit');
        
        // Update URL to reflect collaborative document
        window.history.replaceState({}, '', `/editor/${newDoc._id}`);
        
        showNotification('Document converted to collaborative mode!', 'success');
        return newDoc;
      } else {
        showNotification('Failed to create collaborative document', 'error');
      }
    } catch (error) {
      console.error('Error creating collaborative document:', error);
      showNotification('Failed to create collaborative document', 'error');
    }
  };
  
  const addCollaborator = async () => {
    const email = window.prompt('Enter collaborator email:');
    const permission = window.confirm('Give edit permission? (Cancel for view-only)') ? 'edit' : 'view';
    
    if (email && email.includes('@')) {
      if (isCollaborative && documentId) {
        // Add to server document
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}/collaborators`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ email, permission })
          });
          
          if (response.ok) {
            const data = await response.json();
            setCollaborators(data.collaborators);
            showNotification(`Collaborator ${email} added with ${permission} permission!`, 'success');
          } else {
            const error = await response.json();
            showNotification(error.message || 'Failed to add collaborator', 'error');
          }
        } catch (error) {
          console.error('Error adding collaborator:', error);
          showNotification('Failed to add collaborator', 'error');
        }
      } else {
        // Local document - convert to collaborative first
        const doc = await createCollaborativeDocument();
        if (doc) {
          // Retry adding collaborator
          setTimeout(() => addCollaborator(), 1000);
        }
      }
    } else if (email) {
      showNotification('Please enter a valid email address', 'error');
    }
  };
  
  const restoreVersion = async (version) => {
    if (window.confirm('Restore this version? Current changes will be lost.')) {
      if (isCollaborative && documentId) {
        // Restore server version
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}/restore-version`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ versionNumber: version.version })
          });
          
          if (response.ok) {
            const data = await response.json();
            editorRef.current.innerHTML = data.document.content;
            setDocumentData(data.document);
            showNotification('Version restored successfully!', 'success');
          } else {
            showNotification('Failed to restore version', 'error');
          }
        } catch (error) {
          console.error('Error restoring version:', error);
          showNotification('Failed to restore version', 'error');
        }
      } else {
        // Local version restore
        editorRef.current.innerHTML = version.content;
        saveDocument(false, true); // Save as new version
        showNotification('Version restored successfully!', 'success');
      }
      setShowVersionHistory(false);
    }
  };
  
  // Auto-save functionality
  const startAutoSave = () => {
    if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
    autoSaveInterval.current = setInterval(() => {
      if (editorRef.current && editorRef.current.innerHTML.trim()) {
        saveDocument(true);
      }
    }, 30000); // Auto-save every 30 seconds
  };
  
  // Load document by address
  const loadDocumentByAddress = async (address) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/address/${address}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const doc = await response.json();
        setDocumentData(doc);
        setDocumentTitle(doc.title);
        setIsCollaborative(true);
        setUserPermission(doc.userPermission);
        setPages(doc.pages || [{ id: 1, content: doc.content, pageNumber: 1 }]);
        
        if (doc.formatting) {
          setDefaultFont(doc.formatting.defaultFont || defaultFont);
          setPageBorder(doc.formatting.pageBorder || pageBorder);
          setWatermark(doc.formatting.watermark || watermark);
          setPageNumbering(doc.formatting.pageNumbering || pageNumbering);
        }
        
        if (editorRef.current) {
          editorRef.current.innerHTML = doc.content || '';
        }
        
        showNotification('Document loaded successfully!', 'success');
        return true;
      } else {
        showNotification('Document not found or access denied', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error loading document by address:', error);
      showNotification('Failed to load document', 'error');
      return false;
    }
  };
  
  // Load document data if collaborative or from localStorage
  React.useEffect(() => {
    const initializeDocument = async () => {
      if (documentId) {
        // Check if it's a valid MongoDB ObjectId (24 hex characters)
        if (documentId.match(/^[0-9a-fA-F]{24}$/)) {
          // Load by MongoDB document ID
          await fetchDocumentData();
        } else if (documentId.startsWith('doc_')) {
          // Load by document address
          await loadDocumentByAddress(documentId);
        } else {
          // Invalid document ID format - redirect to home
          showNotification('Invalid document ID format', 'error');
          navigate('/');
          return;
        }
      } else {
        // Load saved document from localStorage if available
        const savedDocId = localStorage.getItem('currentDocumentId');
        if (savedDocId) {
          const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
          const savedDoc = savedDocs.find(doc => doc.id === savedDocId);
          if (savedDoc && editorRef.current) {
            setDocumentTitle(savedDoc.title);
            editorRef.current.innerHTML = savedDoc.content;
            setCollaborators(savedDoc.collaborators || []);
            setPages(savedDoc.pages || [{ id: 1, content: savedDoc.content, pageNumber: 1 }]);
            
            // Load document-specific settings
            if (savedDoc.formatting) {
              setDefaultFont(savedDoc.formatting.defaultFont || defaultFont);
              setPageBorder(savedDoc.formatting.pageBorder || pageBorder);
              setWatermark(savedDoc.formatting.watermark || watermark);
              setPageNumbering(savedDoc.formatting.pageNumbering || pageNumbering);
            }
            if (savedDoc.headerText) setHeaderText(savedDoc.headerText);
            if (savedDoc.footerText) setFooterText(savedDoc.footerText);
            
            saveToUndoStack();
          }
          localStorage.removeItem('currentDocumentId');
        }
        
        // Load local document history
        const history = JSON.parse(localStorage.getItem(`history_${documentTitle}`) || '[]');
        setDocumentHistory(history);
        startAutoSave();
      }
    };
    
    initializeDocument();
    
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, [documentId]);
  
  // Set content for each page
  React.useEffect(() => {
    pages.forEach((page, index) => {
      const pageElement = document.querySelector(`[data-page-id="${page.id}"]`);
      if (pageElement && !pageElement.contains(document.activeElement)) {
        if (page.content && page.content !== '<p>Start writing your document here...</p>') {
          pageElement.innerHTML = page.content;
        }
      }
    });
  }, [pages]);
  
  const fetchDocumentData = async () => {
    try {
      // Validate document ID format before making request
      if (!documentId || !documentId.match(/^[0-9a-fA-F]{24}$/)) {
        showNotification('Invalid document ID format', 'error');
        navigate('/');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDocumentData(data);
        setDocumentTitle(data.title);
        setIsCollaborative(true);
        setCollaborators(data.collaborators || []);
        
        // Set content and pages
        if (editorRef.current) {
          editorRef.current.innerHTML = data.content || '<p>Start writing...</p>';
        }
        setPages(data.pages || [{ id: 1, content: data.content || '<p>Start writing...</p>', pageNumber: 1 }]);
        
        // Load document formatting
        if (data.formatting) {
          setDefaultFont(data.formatting.defaultFont || defaultFont);
          setPageBorder(data.formatting.pageBorder || pageBorder);
          setWatermark(data.formatting.watermark || watermark);
          setPageNumbering(data.formatting.pageNumbering || pageNumbering);
        }
        
        // Set word count
        const textContent = data.content ? data.content.replace(/<[^>]*>/g, '').trim() : '';
        const words = textContent.split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        
        // Check user permission
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const userId = userProfile._id || localStorage.getItem('userId');
        const isOwner = data.owner._id === userId;
        const collaborator = data.collaborators.find(c => c.user._id === userId);
        
        if (isOwner) {
          setUserPermission('edit');
        } else if (collaborator) {
          setUserPermission(collaborator.permission);
        } else {
          // Redirect to viewer if no access
          navigate(`/viewer/${documentId}`);
          return;
        }
        
        // If view-only, redirect to viewer
        if (!isOwner && collaborator?.permission === 'view') {
          navigate(`/viewer/${documentId}`);
          return;
        }
        
        // Load version history
        await fetchVersionHistory();
        
        // Start auto-save for collaborative documents
        startAutoSave();
        
        showNotification('Document loaded successfully!', 'success');
      } else {
        console.error('Failed to fetch document');
        showNotification('Failed to load document', 'error');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      showNotification('Error loading document', 'error');
      navigate('/');
    }
  };
  
  const fetchVersionHistory = async () => {
    if (!documentId || !isCollaborative) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${documentId}/versions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const versions = await response.json();
        setDocumentHistory(versions);
      }
    } catch (error) {
      console.error('Error fetching version history:', error);
    }
  };

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
      if (!event.target.closest('.profile-dropdown')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleImageDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.border = '1px solid #ddd';
        img.style.borderRadius = '4px';
        img.style.cursor = 'pointer';
        img.onclick = (e) => {
          e.stopPropagation();
          setSelectedImage(img);
          // Add selected class for visual feedback
          document.querySelectorAll('.editor-content img').forEach(i => i.classList.remove('selected'));
          img.classList.add('selected');
        };
        editorRef.current.appendChild(img);
      };
      reader.readAsDataURL(files[0]);
    }
  };
  
  const handleEditorClick = (e) => {
    // If clicked element is not an image, hide image controls
    if (e.target.tagName !== 'IMG') {
      setSelectedImage(null);
      document.querySelectorAll('.editor-content img').forEach(img => img.classList.remove('selected'));
    }
  };

  const resizeImage = (size) => {
    if (selectedImage) {
      selectedImage.style.width = size;
      selectedImage.style.height = 'auto';
    }
  };

  const addImageBorder = (borderStyle) => {
    if (selectedImage) {
      selectedImage.style.border = borderStyle;
    }
  };

  const insertBorder = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const div = document.createElement('div');
      div.style.border = '2px solid #FFD700';
      div.style.padding = '10px';
      div.style.margin = '10px 0';
      div.style.borderRadius = '4px';
      
      try {
        range.surroundContents(div);
      } catch (e) {
        div.appendChild(range.extractContents());
        range.insertNode(div);
      }
    }
  };
  
  const applyPageBorder = () => {
    setPageBorder({ ...pageBorder, enabled: true });
    setShowPageBorderControls(false);
    // Force re-render of editor content
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
        }
      }, 50);
    }
  };
  
  const removePageBorder = () => {
    setPageBorder({ ...pageBorder, enabled: false });
    // Force re-render of editor content
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
        }
      }, 50);
    }
  };

  const exportDocument = async (format) => {
    const content = editorRef.current.innerHTML;
    const textContent = editorRef.current.innerText;
    
    try {
      switch(format) {
        case 'pdf':
          await exportToPDF();
          break;
        case 'docx':
          await exportToDOCX();
          break;
        case 'md':
          const markdown = htmlToMarkdown(content);
          const blob = new Blob([markdown], { type: 'text/markdown' });
          saveAs(blob, `${documentTitle}.md`);
          break;
        default:
          const htmlBlob = new Blob([content], { type: 'text/html' });
          saveAs(htmlBlob, `${documentTitle}.html`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed. Please try again.', 'error');
    }
  };

  const exportToPDF = async () => {
    try {
      showNotification('Generating PDF...', 'info');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      const contentHeight = pageHeight - (2 * margin);
      
      // Helper function to convert hex to RGB
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
      };
      
      // Process each page
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        
        if (pageIndex > 0) {
          pdf.addPage();
        }
        
        let yPosition = margin;
        
        // Add header if exists
        if (headerText) {
          const headerParts = headerText.split('|');
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
        if (pageBorder.enabled) {
          const borderWidth = parseFloat(pageBorder.width) || 1;
          pdf.setLineWidth(borderWidth * 0.35);
          
          const borderColor = hexToRgb(pageBorder.color);
          pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b);
          
          if (pageBorder.position === 'all') {
            pdf.rect(margin, margin, contentWidth, contentHeight);
          } else if (pageBorder.position === 'top') {
            pdf.line(margin, margin, pageWidth - margin, margin);
          } else if (pageBorder.position === 'bottom') {
            pdf.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin);
          } else if (pageBorder.position === 'both') {
            pdf.line(margin, margin, pageWidth - margin, margin);
            pdf.line(margin, pageHeight - margin, pageWidth - margin, pageHeight - margin);
          }
        }
        
        // Create temporary container for this page
        const tempContainer = document.createElement('div');
        tempContainer.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: ${contentWidth * 3.78}px;
          background: white;
          padding: 0;
          font-family: ${defaultFont.family};
          font-size: ${defaultFont.size};
          line-height: ${defaultFont.lineHeight};
          color: ${defaultFont.color};
        `;
        
        // Get page content
        const pageElement = document.querySelector(`[data-page-id="${page.id}"]`);
        if (pageElement) {
          tempContainer.innerHTML = pageElement.innerHTML;
          
          // Preserve all styling including alignment and formatting
          const originalElements = pageElement.querySelectorAll('*');
          const tempElements = tempContainer.querySelectorAll('*');
          
          originalElements.forEach((originalEl, index) => {
            if (tempElements[index]) {
              const computedStyle = window.getComputedStyle(originalEl);
              const tempEl = tempElements[index];
              
              // Copy all visual styles
              tempEl.style.textAlign = computedStyle.textAlign;
              tempEl.style.color = computedStyle.color;
              tempEl.style.backgroundColor = computedStyle.backgroundColor;
              tempEl.style.fontWeight = computedStyle.fontWeight;
              tempEl.style.fontStyle = computedStyle.fontStyle;
              tempEl.style.textDecoration = computedStyle.textDecoration;
              tempEl.style.fontSize = computedStyle.fontSize;
              tempEl.style.fontFamily = computedStyle.fontFamily;
              tempEl.style.lineHeight = computedStyle.lineHeight;
              tempEl.style.margin = computedStyle.margin;
              tempEl.style.padding = computedStyle.padding;
              tempEl.style.display = computedStyle.display;
              tempEl.style.float = computedStyle.float;
              tempEl.style.width = computedStyle.width;
              tempEl.style.height = computedStyle.height;
              
              // Handle list styles
              if (originalEl.tagName === 'UL' || originalEl.tagName === 'OL') {
                tempEl.style.listStyleType = computedStyle.listStyleType;
                tempEl.style.listStylePosition = computedStyle.listStylePosition;
                tempEl.style.paddingLeft = computedStyle.paddingLeft;
                
                // Handle custom list icons
                if (originalEl.classList.contains('custom-list')) {
                  const icon = originalEl.getAttribute('data-icon');
                  tempEl.classList.add('custom-list');
                  tempEl.setAttribute('data-icon', icon);
                  
                  // Apply custom list styles
                  const listItems = tempEl.querySelectorAll('li');
                  listItems.forEach(li => {
                    li.setAttribute('data-icon', icon);
                    li.style.position = 'relative';
                    li.style.paddingLeft = '20px';
                    li.style.listStyleType = 'none';
                  });
                }
              }
            }
          });
          
          // Handle images with proper alignment
          const images = tempContainer.querySelectorAll('img');
          const originalImages = pageElement.querySelectorAll('img');
          
          images.forEach((img, index) => {
            const originalImg = originalImages[index];
            if (originalImg) {
              const computedStyle = window.getComputedStyle(originalImg);
              const parentStyle = window.getComputedStyle(originalImg.parentElement);
              
              // Preserve image dimensions and alignment
              img.style.maxWidth = computedStyle.maxWidth || '100%';
              img.style.width = computedStyle.width || 'auto';
              img.style.height = computedStyle.height || 'auto';
              img.style.display = computedStyle.display || 'block';
              img.style.margin = computedStyle.margin;
              img.style.padding = computedStyle.padding;
              img.style.border = computedStyle.border;
              img.style.borderRadius = computedStyle.borderRadius;
              img.style.float = computedStyle.float;
              
              // Handle text alignment for images
              if (parentStyle.textAlign === 'center') {
                img.style.marginLeft = 'auto';
                img.style.marginRight = 'auto';
                img.style.display = 'block';
              } else if (parentStyle.textAlign === 'right') {
                img.style.marginLeft = 'auto';
                img.style.marginRight = '0';
                img.style.display = 'block';
              } else if (parentStyle.textAlign === 'left') {
                img.style.marginLeft = '0';
                img.style.marginRight = 'auto';
                img.style.display = 'block';
              }
            }
          });
          
          // Handle custom list styling for PDF
          const customLists = tempContainer.querySelectorAll('.custom-list');
          customLists.forEach(list => {
            const icon = list.getAttribute('data-icon');
            const listItems = list.querySelectorAll('li');
            
            listItems.forEach(li => {
              li.style.position = 'relative';
              li.style.paddingLeft = '20px';
              li.style.listStyleType = 'none';
              
              // Add icon as text content
              const iconSpan = document.createElement('span');
              iconSpan.textContent = icon;
              iconSpan.style.position = 'absolute';
              iconSpan.style.left = '0';
              iconSpan.style.top = '0';
              iconSpan.style.color = '#FFD700';
              iconSpan.style.fontWeight = 'bold';
              iconSpan.style.fontSize = '14px';
              
              li.insertBefore(iconSpan, li.firstChild);
            });
          });
          
          document.body.appendChild(tempContainer);
          
          try {
            const canvas = await html2canvas(tempContainer, {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              backgroundColor: '#ffffff',
              width: contentWidth * 3.78,
              logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = contentWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            let contentY = yPosition;
            if (headerText) contentY += 10;
            
            const availableHeight = pageHeight - contentY - (footerText ? 15 : margin);
            
            if (imgHeight <= availableHeight) {
              pdf.addImage(imgData, 'PNG', margin, contentY, imgWidth, imgHeight);
            } else {
              // Split content across pages
              let remainingHeight = imgHeight;
              let sourceY = 0;
              
              while (remainingHeight > 0) {
                const currentPageHeight = Math.min(remainingHeight, availableHeight);
                
                const croppedCanvas = document.createElement('canvas');
                const croppedCtx = croppedCanvas.getContext('2d');
                croppedCanvas.width = canvas.width;
                croppedCanvas.height = (currentPageHeight / imgHeight) * canvas.height;
                
                croppedCtx.drawImage(
                  canvas,
                  0, sourceY * canvas.height / imgHeight,
                  canvas.width, croppedCanvas.height,
                  0, 0,
                  canvas.width, croppedCanvas.height
                );
                
                const croppedImgData = croppedCanvas.toDataURL('image/png');
                pdf.addImage(croppedImgData, 'PNG', margin, contentY, imgWidth, currentPageHeight);
                
                remainingHeight -= currentPageHeight;
                sourceY += currentPageHeight;
                
                if (remainingHeight > 0) {
                  pdf.addPage();
                  contentY = margin + (headerText ? 15 : 0);
                }
              }
            }
          } finally {
            document.body.removeChild(tempContainer);
          }
        }
        
        // Add watermark if enabled
        if (watermark.enabled) {
          pdf.saveGraphicsState();
          pdf.setGState(new pdf.GState({ opacity: watermark.opacity }));
          
          if (watermark.type === 'text') {
            pdf.setFontSize(watermark.size * 0.35);
            const watermarkColor = hexToRgb(watermark.color);
            pdf.setTextColor(watermarkColor.r, watermarkColor.g, watermarkColor.b);
            
            const centerX = pageWidth / 2;
            const centerY = pageHeight / 2;
            
            pdf.text(watermark.text, centerX, centerY, {
              angle: watermark.rotation,
              align: 'center'
            });
          } else if (watermark.type === 'image' && watermark.image) {
            // Add image watermark
            const imgWidth = watermark.size * 0.35;
            const imgHeight = watermark.size * 0.35;
            const centerX = (pageWidth - imgWidth) / 2;
            const centerY = (pageHeight - imgHeight) / 2;
            
            pdf.addImage(watermark.image, 'PNG', centerX, centerY, imgWidth, imgHeight);
            
            // Add text next to image
            pdf.setFontSize((watermark.size * 0.6) * 0.35);
            const watermarkColor = hexToRgb(watermark.color);
            pdf.setTextColor(watermarkColor.r, watermarkColor.g, watermarkColor.b);
            
            pdf.text('Watermark', centerX + imgWidth + 5, centerY + (imgHeight / 2), {
              angle: watermark.rotation,
              align: 'left'
            });
          }
          
          pdf.restoreGraphicsState();
        }
        
        // Add footer if exists
        if (footerText || pageNumbering.enabled) {
          const footerY = pageHeight - margin + 5;
          pdf.setFontSize(10);
          pdf.setTextColor(100, 100, 100);
          
          if (footerText) {
            const footerParts = footerText.split('|');
            if (footerParts[0]) pdf.text(footerParts[0].trim(), margin, footerY);
            if (footerParts[1]) pdf.text(footerParts[1].trim(), pageWidth / 2, footerY, { align: 'center' });
            if (footerParts[2]) pdf.text(footerParts[2].trim(), pageWidth - margin, footerY, { align: 'right' });
          }
          
          if (pageNumbering.enabled) {
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
      
      pdf.save(`${documentTitle}.pdf`);
      showNotification('PDF exported successfully!', 'success');
      
    } catch (error) {
      console.error('PDF export error:', error);
      showNotification('Failed to export PDF. Please try again.', 'error');
    }
  };

  const exportToDOCX = async () => {
    // Force focus out to ensure all content is saved
    editorRef.current.blur();
    
    // Wait a moment for any pending updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const element = editorRef.current;
    
    // Get the current HTML content
    const htmlContent = element.innerHTML;
    
    // Create a temporary div to parse the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const paragraphs = [];
    
    // Get alignment from original editor elements
    const getElementAlignment = (el) => {
      const computedStyle = window.getComputedStyle(el);
      const textAlign = computedStyle.textAlign;
      
      switch(textAlign) {
        case 'center': return 'center';
        case 'right': return 'right';
        case 'justify': return 'both';
        default: return 'left';
      }
    };
    
    // Process all child nodes
    const processElement = (el) => {
      const textContent = el.textContent?.trim();
      if (!textContent) return null;
      
      const computedStyle = window.getComputedStyle(el);
      
      // Check if element has formatting
      const isBold = el.tagName === 'STRONG' || el.tagName === 'B' || 
                     el.style.fontWeight === 'bold' ||
                     computedStyle.fontWeight === 'bold';
      const isItalic = el.tagName === 'EM' || el.tagName === 'I' ||
                       el.style.fontStyle === 'italic' ||
                       computedStyle.fontStyle === 'italic';
      const isUnderline = el.tagName === 'U' ||
                          el.style.textDecoration?.includes('underline') ||
                          computedStyle.textDecoration?.includes('underline');
      
      return new TextRun({
        text: textContent,
        bold: isBold,
        italics: isItalic,
        underline: isUnderline
      });
    };
    
    // Get corresponding elements from original editor for alignment
    const originalElements = element.querySelectorAll('p, div');
    const elements = tempDiv.querySelectorAll('p, div');
    
    if (elements.length === 0) {
      // No block elements, use the entire content as one paragraph
      const allText = tempDiv.textContent?.trim();
      if (allText) {
        paragraphs.push(new Paragraph({
          children: [new TextRun(allText)],
          alignment: 'left'
        }));
      }
    } else {
      // Process each block element
      elements.forEach((el, index) => {
        const textContent = el.textContent?.trim();
        if (textContent) {
          // Get alignment from corresponding original element
          const originalEl = originalElements[index] || element;
          const alignment = getElementAlignment(originalEl);
          
          // Check for nested formatting elements
          const formattedElements = el.querySelectorAll('strong, b, em, i, u');
          
          if (formattedElements.length > 0) {
            // Has formatting - process each formatted element
            const runs = [];
            
            // Simple approach: split by formatted elements
            let remainingText = textContent;
            
            formattedElements.forEach(formEl => {
              const formText = formEl.textContent?.trim();
              if (formText && remainingText.includes(formText)) {
                const beforeText = remainingText.substring(0, remainingText.indexOf(formText));
                if (beforeText.trim()) {
                  runs.push(new TextRun(beforeText.trim()));
                }
                
                const processedRun = processElement(formEl);
                if (processedRun) runs.push(processedRun);
                
                remainingText = remainingText.substring(remainingText.indexOf(formText) + formText.length);
              }
            });
            
            if (remainingText.trim()) {
              runs.push(new TextRun(remainingText.trim()));
            }
            
            if (runs.length > 0) {
              paragraphs.push(new Paragraph({ 
                children: runs,
                alignment: alignment
              }));
            }
          } else {
            // No formatting - simple text
            paragraphs.push(new Paragraph({
              children: [new TextRun(textContent)],
              alignment: alignment
            }));
          }
        }
      });
    }
    
    // Add image references
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      paragraphs.push(new Paragraph({
        children: [new TextRun(`[Image ${index + 1}: ${img.alt || 'Embedded image'}]`)]
      }));
    });
    
    // Create the document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [
          new Paragraph({
            children: [new TextRun('Empty document')]
          })
        ]
      }]
    });
    
    // Generate and save the blob
    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${documentTitle}.docx`);
  };

  // Public method to load templates from external sources
  const loadTemplate = (templateData, options = {}) => {
    const { 
      merge = true, 
      preserveTitle = false, 
      preserveFormatting = true,
      showNotification: notify = true 
    } = options;
    
    if (!templateData || !editorRef.current) {
      if (notify) showNotification('Invalid template data', 'error');
      return false;
    }
    
    try {
      // Save current editor state
      const currentState = {
        content: editorRef.current.innerHTML,
        title: documentTitle,
        selection: window.getSelection().rangeCount > 0 ? window.getSelection().getRangeAt(0) : null
      };
      
      const hasContent = currentState.content && 
                        currentState.content.trim() !== '' &&
                        !currentState.content.includes('Start writing your document here');
      
      if (merge && hasContent) {
        // Merge template with existing content
        const separator = document.createElement('div');
        separator.innerHTML = '<hr style="margin: 20px 0; border: 1px solid #ddd;">';
        
        const templateContainer = document.createElement('div');
        templateContainer.innerHTML = templateData.content;
        templateContainer.style.marginTop = '20px';
        
        // Preserve cursor position if possible
        if (currentState.selection) {
          currentState.selection.insertNode(separator);
          currentState.selection.collapse(false);
          currentState.selection.insertNode(templateContainer);
        } else {
          editorRef.current.appendChild(separator);
          editorRef.current.appendChild(templateContainer);
        }
        
        if (notify) showNotification('Template merged with existing content', 'success');
      } else {
        // Replace content
        editorRef.current.innerHTML = templateData.content;
        if (!preserveTitle && templateData.title) {
          setDocumentTitle(templateData.title);
        }
        if (notify) showNotification('Template loaded successfully', 'success');
      }
      
      // Apply formatting if needed
      if (!preserveFormatting) {
        setTimeout(() => {
          applyDefaultFont();
          saveToUndoStack();
        }, 100);
      } else {
        saveToUndoStack();
      }
      
      return true;
    } catch (error) {
      console.error('Error loading template:', error);
      if (notify) showNotification('Failed to load template', 'error');
      return false;
    }
  };
  
  // Load saved document function
  const loadSavedDocument = (docId) => {
    const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
    const doc = savedDocs.find(d => d.id === docId);
    if (!doc || !editorRef.current) return false;
    
    try {
      // Save current state before loading
      const currentContent = editorRef.current.innerHTML;
      if (currentContent && currentContent.trim() !== '' && 
          currentContent !== '<p>Start writing your document here...</p>') {
        const confirmLoad = window.confirm('Loading this document will replace current content. Continue?');
        if (!confirmLoad) return false;
      }
      
      // Load document data
      setDocumentTitle(doc.title);
      editorRef.current.innerHTML = doc.content;
      setCollaborators(doc.collaborators || []);
      
      // Load document settings
      if (doc.pageBorder) setPageBorder(doc.pageBorder);
      if (doc.headerText) setHeaderText(doc.headerText);
      if (doc.footerText) setFooterText(doc.footerText);
      if (doc.pages) setPages(doc.pages);
      if (doc.defaultFont) setDefaultFont(doc.defaultFont);
      
      // Load document history
      const history = JSON.parse(localStorage.getItem(`history_${doc.title}`) || '[]');
      setDocumentHistory(history);
      
      saveToUndoStack();
      showNotification(`Document "${doc.title}" loaded successfully!`, 'success');
      return true;
    } catch (error) {
      console.error('Error loading document:', error);
      showNotification('Failed to load document', 'error');
      return false;
    }
  };
  
  // Expose methods globally for external use
  React.useEffect(() => {
    window.EtherXWordEditor = {
      loadTemplate,
      loadSavedDocument,
      getCurrentContent: () => editorRef.current?.innerHTML || '',
      setContent: (content) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
          saveToUndoStack();
        }
      }
    };
    
    return () => {
      delete window.EtherXWordEditor;
    };
  }, []);

  const htmlToMarkdown = (html) => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<br[^>]*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n');
  };

  return (
    <div className="editor-container">
      {/* Navbar */}
      <nav className="editor-navbar">
        <div className="navbar-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className="ri-menu-line"></i>
          </button>
          <div className="logo">
            <Logo size={24} className={isLogoAnimating ? 'animate' : ''} />
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
          <button className="nav-btn" onClick={() => saveDocument(false, true)}><i className="ri-save-line"></i> Save</button>
          <button 
            className="nav-btn" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <i className={`ri-${theme === 'dark' ? 'sun' : 'moon'}-line`}></i>
          </button>
          <button 
            className="nav-btn" 
            onClick={() => setShowShareModal(true)}
            disabled={isCollaborative && userPermission !== 'edit'}
          >
            <i class="ri-share-fill"></i> Share
          </button>
          {isCollaborative && (
            <span className="collaboration-indicator">
              <i className="ri-team-line"></i> {collaborators.length + 1}
            </span>
          )}
          <button 
            className="nav-btn" 
            onClick={deleteDocument}
            disabled={isCollaborative && userPermission !== 'edit'}
          >
            <i class="ri-delete-bin-6-line"></i> Delete
          </button>
          <div className="notification-dropdown">
            <button 
              className="nav-icon" 
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="ri-notification-3-line"></i>
            </button>
            {showNotifications && (
              <div className="dropdown-menu">
                <div className="notification-header">
                  <h4>Notifications</h4>
                </div>
                <div className="notification-item">
                  <span className="notification-text">Document auto-saved</span>
                  <span className="notification-time">2 min ago</span>
                </div>
                <div className="notification-item">
                  <span className="notification-text">New collaborator added</span>
                  <span className="notification-time">1 hour ago</span>
                </div>
                <div className="notification-item">
                  <span className="notification-text">Document shared successfully</span>
                  <span className="notification-time">3 hours ago</span>
                </div>
                <div className="notification-footer">
                  <button className="clear-all-btn" onClick={clearAllNotifications}>Clear All</button>
                </div>
              </div>
            )}
          </div>
          <button 
            className="nav-icon mobile-sidebar-toggle"
            onClick={() => setShowRightSidebar(!showRightSidebar)}
          >
            <i className="ri-settings-3-line"></i>
          </button>
          <div className="profile-dropdown">
            <button 
              className="nav-icon" 
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <i className="ri-user-line"></i>
            </button>
            {showProfileDropdown && (
              <div className="dropdown-menu">
                <button onClick={() => navigate('/')}>← Home</button>
                <button onClick={() => navigate('/profile')}>Profile</button>
                <button onClick={() => navigate('/settings')}>Settings</button>
                <button onClick={() => navigate('/signin')}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-group">
          <button 
            onClick={undo} 
            className="toolbar-btn" 
            disabled={undoStack.length === 0}
            title="Undo (Ctrl+Z)"
          >
            <i className="ri-arrow-go-back-line"></i>
          </button>
          <button 
            onClick={redo} 
            className="toolbar-btn" 
            disabled={redoStack.length === 0}
            title="Redo (Ctrl+Y)"
          >
            <i className="ri-arrow-go-forward-line"></i>
          </button>
        </div>
        
        <div className="toolbar-group">
          <button onClick={handleCut} className="toolbar-btn" title="Cut (Ctrl+X)">
            <i className="ri-scissors-cut-line"></i>
          </button>
          <button onClick={handleCopy} className="toolbar-btn" title="Copy (Ctrl+C)">
            <i className="ri-file-copy-line"></i>
          </button>
          <button onClick={handlePaste} className="toolbar-btn" title="Paste (Ctrl+V)">
            <i className="ri-clipboard-line"></i>
          </button>
        </div>
        
        <div className="toolbar-group">
          <button onClick={() => formatText('bold')} className="toolbar-btn">
            <strong>B</strong>
          </button>
          <button onClick={() => formatText('italic')} className="toolbar-btn">
            <em>I</em>
          </button>
          <button onClick={() => formatText('underline')} className="toolbar-btn">
            <u>U</u>
          </button>
          <button onClick={() => formatText('strikeThrough')} className="toolbar-btn">
            <i class="ri-strikethrough"></i>
          </button>
        </div>
        
        <div className="toolbar-group">
          <select onChange={(e) => formatText('fontSize', e.target.value)} className="toolbar-select">
            <option value="3">12px</option>
            <option value="4" defaultValue>14px</option>
            <option value="5">18px</option>
            <option value="6">24px</option>
            <option value="7">36px</option>
          </select>
          <select onChange={(e) => formatText('fontName', e.target.value)} className="toolbar-select">
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Verdana">Verdana</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Palatino">Palatino</option>
            <option value="Garamond">Garamond</option>
            <option value="Bookman">Bookman</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Impact">Impact</option>
            <option value="Lucida Console">Lucida Console</option>
            <option value="Tahoma">Tahoma</option>
          </select>
          <input 
            type="color" 
            onChange={(e) => formatText('foreColor', e.target.value)} 
            className="color-picker"
            title="Text Color"
          />
          <input 
            type="color" 
            onChange={(e) => formatText('backColor', e.target.value)} 
            className="color-picker"
            title="Background Color"
          />
        </div>

        <div className="toolbar-group">
          <button onClick={() => formatText('justifyLeft')} className="toolbar-btn"><i className="ri-align-left"></i></button>
          <button onClick={() => formatText('justifyCenter')} className="toolbar-btn"><i className="ri-align-center"></i></button>
          <button onClick={() => formatText('justifyRight')} className="toolbar-btn"><i className="ri-align-right"></i></button>
          <button onClick={() => formatText('justifyFull')} className="toolbar-btn"><i className="ri-align-justify"></i></button>
        </div>

        <div className="toolbar-group">
          <button onClick={() => formatText('insertUnorderedList')} className="toolbar-btn"><i className="ri-list-unordered"></i></button>
          <button onClick={() => formatText('insertOrderedList')} className="toolbar-btn"><i className="ri-list-ordered-2"></i></button>
          <button 
            onClick={() => setShowListStyles(!showListStyles)} 
            className="toolbar-btn"
          >
            <i className="ri-list-settings-line"></i>
          </button>
          <button onClick={() => setShowPageBorderControls(true)} className="toolbar-btn" title="Page Border"><i className="ri-checkbox-blank-line"></i></button>
          <button onClick={() => setShowWatermarkControls(true)} className="toolbar-btn" title="Watermark"><i className="ri-drop-line"></i></button>
          <button onClick={() => formatText('createLink', prompt('Enter URL:'))} className="toolbar-btn"><i className="ri-link"></i></button>
          <button onClick={() => setShowHeaderFooter(!showHeaderFooter)} className="toolbar-btn"><i className="ri-layout-top-2-line"></i> H/F</button>
        </div>

        <div className="toolbar-group mobile-hidden">
          <button onClick={importDocument} className="toolbar-btn"><i className="ri-file-upload-line"></i> Import</button>
          <button onClick={() => exportDocument('pdf')} className="toolbar-btn"><i className="ri-file-pdf-2-line"></i> PDF</button>
          <button onClick={() => exportDocument('docx')} className="toolbar-btn"><i className="ri-file-edit-fill"></i> DOCX</button>
          <button onClick={addNewPage} className="toolbar-btn"><i className="ri-file-add-line"></i> New Page</button>
        </div>
      </div>

      <div className="editor-layout" style={{marginBottom: '32px'}}>
        {/* Left Sidebar */}
        <aside className={`left-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-section">
            <h3><i className="ri-file-3-fill"></i> Document</h3>
            <button className="sidebar-btn" onClick={() => setShowFindReplace(true)}><i className="ri-find-replace-line"></i> Find & Replace</button>
            <button className="sidebar-btn"><i className="ri-list-unordered"></i> Outline</button>
          </div>
          <div className="sidebar-section">
            <h3><i className="ri-font-size-2"></i> Default Font</h3>
            <div className="font-control-group">
              <label>Font Family:</label>
              <select 
                value={defaultFont.family}
                onChange={(e) => setDefaultFont({...defaultFont, family: e.target.value})}
                className="font-select"
              >
                <option value="Georgia">Georgia</option>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Verdana">Verdana</option>
                <option value="Calibri">Calibri</option>
              </select>
            </div>
            <div className="font-control-group">
              <label>Font Size:</label>
              <select 
                value={defaultFont.size}
                onChange={(e) => setDefaultFont({...defaultFont, size: e.target.value})}
                className="font-select"
              >
                <option value="10pt">10pt</option>
                <option value="11pt">11pt</option>
                <option value="12pt">12pt</option>
                <option value="14pt">14pt</option>
                <option value="16pt">16pt</option>
                <option value="18pt">18pt</option>
              </select>
            </div>
            <div className="font-control-group">
              <label>Line Height:</label>
              <select 
                value={defaultFont.lineHeight}
                onChange={(e) => setDefaultFont({...defaultFont, lineHeight: e.target.value})}
                className="font-select"
              >
                <option value="1.0">Single</option>
                <option value="1.15">1.15</option>
                <option value="1.5">1.5</option>
                <option value="2.0">Double</option>
              </select>
            </div>
            <button className="sidebar-btn" onClick={applyDefaultFont}><i className="ri-font-size"></i> Apply to Document</button>
            <button className="sidebar-btn" onClick={resetToDefaultFont}><i className="ri-refresh-line"></i> Reset Selection</button>
          </div>
          
          <div className="sidebar-section">
            <h3><i className="ri-palette-line"></i> Format</h3>
            <button className="sidebar-btn" onClick={() => formatText('formatBlock', 'h1')}><i className="ri-h-1"></i> Heading 1</button>
            <button className="sidebar-btn" onClick={() => formatText('formatBlock', 'h2')}><i className="ri-h-2"></i> Heading 2</button>
            <button className="sidebar-btn" onClick={() => formatText('formatBlock', 'p')}><i className="ri-paragraph"></i> Paragraph</button>
            <button className="sidebar-btn" onClick={() => formatText('indent')}><i className="ri-indent-increase"></i> Indent</button>
            <button className="sidebar-btn" onClick={() => formatText('outdent')}><i className="ri-indent-decrease"></i> Outdent</button>
            <button className="sidebar-btn" onClick={() => formatText('insertHTML', '<br><br>')}><i className="ri-letter-spacing-2"></i> Line Spacing</button>
          </div>
        </aside>

        {/* Editor */}
        <div className="editor-wrapper">
          <div className="pages-container">
            {pages.map((page, index) => (
              <div 
                key={page.id}
                className={`editor-page a4-page ${currentPage === page.id ? 'active-page' : ''}`}
              >
                {(headerText || pageNumbering.enabled && (pageNumbering.position.startsWith('top'))) && (
                  <div className="page-hf-element top-header" style={{
                    position: 'absolute',
                    top: '5mm',
                    left: '20mm',
                    right: '20mm',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '2mm',
                    zIndex: 10
                  }}>
                    <span>{headerText.split('|')[0] || (pageNumbering.enabled && pageNumbering.position === 'top-left' ? (pageNumbering.format === '1' ? index + 1 : pageNumbering.format === 'i' ? ['i', 'ii', 'iii', 'iv', 'v'][index] || (index + 1) : String.fromCharCode(97 + index)) : '')}</span>
                    <span>{headerText.split('|')[1] || (pageNumbering.enabled && pageNumbering.position === 'top-center' ? (pageNumbering.format === '1' ? index + 1 : pageNumbering.format === 'i' ? ['i', 'ii', 'iii', 'iv', 'v'][index] || (index + 1) : String.fromCharCode(97 + index)) : '')}</span>
                    <span>{headerText.split('|')[2] || (pageNumbering.enabled && pageNumbering.position === 'top-right' ? (pageNumbering.format === '1' ? index + 1 : pageNumbering.format === 'i' ? ['i', 'ii', 'iii', 'iv', 'v'][index] || (index + 1) : String.fromCharCode(97 + index)) : '')}</span>
                  </div>
                )}
                
                <div
                  ref={index === 0 ? editorRef : null}
                  contentEditable
                  className={`editor-content a4-content ${pageBorder.enabled ? 'has-border' : ''}`}
                  suppressContentEditableWarning={true}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={(e) => {
                    handleEditorClick(e);
                    setCurrentPage(page.id);
                  }}
                  onInput={(e) => handleContentChange(e, page.id)}
                  data-page-id={page.id}
                  style={pageBorder.enabled ? {
                    borderTop: (pageBorder.position === 'all' || pageBorder.position === 'top' || pageBorder.position === 'both') && pageBorder.borderType !== 'shadow' ? `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}` : 'none',
                    borderBottom: (pageBorder.position === 'all' || pageBorder.position === 'bottom' || pageBorder.position === 'both') && pageBorder.borderType !== 'shadow' ? `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}` : 'none',
                    borderLeft: pageBorder.position === 'all' && pageBorder.borderType !== 'shadow' ? `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}` : 'none',
                    borderRight: pageBorder.position === 'all' && pageBorder.borderType !== 'shadow' ? `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}` : 'none',
                    marginTop: (headerText || pageNumbering.enabled && pageNumbering.position.startsWith('top')) ? '15mm' : '20mm',
                    marginBottom: (footerText || pageNumbering.enabled && pageNumbering.position.startsWith('bottom')) ? '15mm' : '20mm',
                    marginLeft: '20mm',
                    marginRight: '20mm',
                    width: `calc(100% - 40mm)`,
                    height: `calc(100% - ${(headerText || pageNumbering.enabled && pageNumbering.position.startsWith('top')) ? '35mm' : '40mm'} - ${(footerText || pageNumbering.enabled && pageNumbering.position.startsWith('bottom')) ? '15mm' : '20mm'})`,
                    borderRadius: pageBorder.borderType === 'rounded' ? '8px' : '0',
                    boxShadow: pageBorder.borderType === 'shadow' ? `inset 0 0 0 ${pageBorder.width} ${pageBorder.color}` : 'none',
                    position: 'relative',
                    boxSizing: 'border-box'
                  } : {
                    marginTop: (headerText || pageNumbering.enabled && pageNumbering.position.startsWith('top')) ? '15mm' : '20mm',
                    marginBottom: (footerText || pageNumbering.enabled && pageNumbering.position.startsWith('bottom')) ? '15mm' : '20mm',
                    marginLeft: '20mm',
                    marginRight: '20mm',
                    width: `calc(100% - 40mm)`,
                    height: `calc(100% - ${(headerText || pageNumbering.enabled && pageNumbering.position.startsWith('top')) ? '35mm' : '40mm'} - ${(footerText || pageNumbering.enabled && pageNumbering.position.startsWith('bottom')) ? '15mm' : '20mm'})`,
                    position: 'relative',
                    boxSizing: 'border-box'
                  }}
                >
                  {page.id === 1 && page.content === '<p>Start writing your document here...</p>' ? (
                    'Start writing your document here...'
                  ) : null}
                  
                  {pageBorder.enabled && pageBorder.borderType === 'double' && (
                    <div 
                      className="double-border-inner"
                      style={{
                        position: 'absolute',
                        top: `calc(${pageBorder.padding} + 4px)`,
                        left: `calc(${pageBorder.padding} + 4px)`,
                        right: `calc(${pageBorder.padding} + 4px)`,
                        bottom: `calc(${pageBorder.padding} + 4px)`,
                        border: `1px ${pageBorder.style} ${pageBorder.color}`,
                        borderRadius: pageBorder.borderType === 'rounded' ? '4px' : '0',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                  
                  {watermark.enabled && (
                    <div 
                      className="watermark-overlay"
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${watermark.alignment === 'diagonal' ? watermark.rotation : watermark.alignment === 'straight' ? 0 : watermark.rotation}deg)`,
                        opacity: watermark.opacity,
                        pointerEvents: 'none',
                        zIndex: 1,
                        fontSize: watermark.type === 'text' ? `${watermark.size}px` : 'inherit',
                        color: watermark.color,
                        fontWeight: 'bold',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                    >
                      {watermark.type === 'text' ? (
                        watermark.text
                      ) : watermark.image ? (
                        <>
                          <img 
                            src={watermark.image} 
                            alt="Watermark" 
                            style={{
                              width: `${watermark.size}px`,
                              height: 'auto',
                              maxWidth: '300px',
                              maxHeight: '300px'
                            }}
                          />
                          <span style={{
                            fontSize: `${watermark.size * 0.6}px`,
                            color: watermark.color,
                            fontWeight: 'bold'
                          }}>Watermark</span>
                        </>
                      ) : null}
                    </div> 
                  )}
                </div>
                
                {(footerText || pageNumbering.enabled && (pageNumbering.position.startsWith('bottom'))) && (
                  <div className="page-hf-element bottom-footer" style={{
                    position: 'absolute',
                    bottom: (footerText || pageNumbering.enabled && pageNumbering.position.startsWith('bottom')) ? '15mm' : '20mm',
                    left: '20mm',
                    right: '20mm',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '2mm',
                    zIndex: 10
                  }}>
                    <span>{footerText.split('|')[0] || (pageNumbering.enabled && pageNumbering.position === 'bottom-left' ? (pageNumbering.format === '1' ? index + 1 : pageNumbering.format === 'i' ? ['i', 'ii', 'iii', 'iv', 'v'][index] || (index + 1) : String.fromCharCode(97 + index)) : '')}</span>
                    <span>{footerText.split('|')[1] || (pageNumbering.enabled && pageNumbering.position === 'bottom-center' ? (pageNumbering.format === '1' ? index + 1 : pageNumbering.format === 'i' ? ['i', 'ii', 'iii', 'iv', 'v'][index] || (index + 1) : String.fromCharCode(97 + index)) : '')}</span>
                    <span>{footerText.split('|')[2] || (pageNumbering.enabled && pageNumbering.position === 'bottom-right' ? (pageNumbering.format === '1' ? index + 1 : pageNumbering.format === 'i' ? ['i', 'ii', 'iii', 'iv', 'v'][index] || (index + 1) : String.fromCharCode(97 + index)) : '')}</span>
                  </div>
                )}
                

              </div>
            ))}
          </div>
          
          {selectedImage && (
            <div className="image-controls">
              <h4>Image Controls</h4>
              <div className="control-group">
                <button onClick={() => resizeImage('25%')}>25%</button>
                <button onClick={() => resizeImage('50%')}>50%</button>
                <button onClick={() => resizeImage('75%')}>75%</button>
                <button onClick={() => resizeImage('100%')}>100%</button>
              </div>
              <div className="control-group">
                <button onClick={() => addImageBorder('1px solid #ddd')}>Light Border</button>
                <button onClick={() => addImageBorder('2px solid #FFD700')}>Gold Border</button>
                <button onClick={() => addImageBorder('3px solid #000')}>Bold Border</button>
                <button onClick={() => addImageBorder('none')}>No Border</button>
              </div>
            </div>
          )}
          
          {showListStyles && (
            <div className="list-styles-controls">
              <h4>List Styles</h4>
              <div className="control-group">
                <button onClick={() => insertCustomList('disc')}>
                  <span className="list-icon">•</span> Bullet
                </button>
                <button onClick={() => insertCustomList('circle')}>
                  <span className="list-icon">○</span> Circle
                </button>
                <button onClick={() => insertCustomList('square')}>
                  <span className="list-icon">■</span> Square
                </button>
                <button onClick={() => insertCustomList('none', '→')}>
                  <span className="list-icon">→</span> Arrow
                </button>
              </div>
              <div className="control-group">
                <button onClick={() => insertCustomList('none', '✓')}>
                  <span className="list-icon">✓</span> Check
                </button>
                <button onClick={() => insertCustomList('none', '★')}>
                  <span className="list-icon">★</span> Star
                </button>
                <button onClick={() => insertCustomList('none', '♦')}>
                  <span className="list-icon">♦</span> Diamond
                </button>
                <button onClick={() => insertCustomList('none', '▶')}>
                  <span className="list-icon">▶</span> Triangle
                </button>
              </div>
              <button onClick={() => setShowListStyles(false)} className="close-panel-btn">Close</button>
            </div>
          )}
          
          {/* Watermark Controls */}
          {showWatermarkControls && (
            <div className="watermark-controls">
              <h4>Watermark Settings</h4>
              
              <div className="watermark-control-group">
                <label>Type:</label>
                <div className="watermark-type-buttons">
                  <button 
                    className={watermark.type === 'text' ? 'active' : ''}
                    onClick={() => setWatermark({...watermark, type: 'text'})}
                  >
                    Text
                  </button>
                  <button 
                    className={watermark.type === 'image' ? 'active' : ''}
                    onClick={() => setWatermark({...watermark, type: 'image'})}
                  >
                    Image
                  </button>
                </div>
              </div>
              
              {watermark.type === 'text' && (
                <div className="watermark-control-group">
                  <label>Text:</label>
                  <input 
                    type="text" 
                    value={watermark.text}
                    onChange={(e) => setWatermark({...watermark, text: e.target.value})}
                    className="watermark-input"
                    placeholder="Enter watermark text"
                  />
                </div>
              )}
              
              {watermark.type === 'image' && (
                <div className="watermark-control-group">
                  <label>Upload Image:</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleWatermarkImageUpload}
                    className="watermark-file-input"
                  />
                </div>
              )}
              
              <div className="watermark-control-group">
                <label>Alignment:</label>
                <select 
                  value={watermark.alignment}
                  onChange={(e) => setWatermark({...watermark, alignment: e.target.value})}
                  className="watermark-select"
                >
                  <option value="center">Center</option>
                  <option value="diagonal">Diagonal</option>
                  <option value="straight">Straight</option>
                </select>
              </div>
              
              <div className="watermark-control-group">
                <label>Size: {watermark.size}px</label>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  value={watermark.size}
                  onChange={(e) => setWatermark({...watermark, size: parseInt(e.target.value)})}
                  className="watermark-slider"
                />
              </div>
              
              <div className="watermark-control-group">
                <label>Opacity: {Math.round(watermark.opacity * 100)}%</label>
                <input 
                  type="range" 
                  min="0.1" 
                  max="1" 
                  step="0.1" 
                  value={watermark.opacity}
                  onChange={(e) => setWatermark({...watermark, opacity: parseFloat(e.target.value)})}
                  className="watermark-slider"
                />
              </div>
              
              {watermark.type === 'text' && (
                <div className="watermark-control-group">
                  <label>Color:</label>
                  <input 
                    type="color" 
                    value={watermark.color}
                    onChange={(e) => setWatermark({...watermark, color: e.target.value})}
                    className="watermark-color-picker"
                  />
                </div>
              )}
              
              <div className="watermark-control-group">
                <label>Rotation: {watermark.rotation}°</label>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  value={watermark.rotation}
                  onChange={(e) => setWatermark({...watermark, rotation: parseInt(e.target.value)})}
                  className="watermark-slider"
                />
              </div>
              
              <div className="watermark-actions">
                <button onClick={applyWatermark} className="apply-watermark-btn">Apply Watermark</button>
                <button onClick={removeWatermark} className="remove-watermark-btn">Remove Watermark</button>
                <button onClick={() => setShowWatermarkControls(false)} className="cancel-watermark-btn">Cancel</button>
              </div>
            </div>
          )}
          

          
          {/* Header Footer Controls */}
          {showHeaderFooter && (
            <div className="header-footer-controls">
              <h4>Header & Footer</h4>
              <div className="hf-control-group">
                <label>Header Text:</label>
                <input 
                  type="text" 
                  value={headerText}
                  onChange={(e) => setHeaderText(e.target.value)}
                  placeholder="Enter header text"
                  className="hf-input"
                />
              </div>
              <div className="hf-control-group">
                <label>Footer Text:</label>
                <input 
                  type="text" 
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Enter footer text"
                  className="hf-input"
                />
              </div>
              <div className="hf-control-group">
                <label>Header Layout:</label>
                <div style={{display: 'flex', gap: '8px', flex: 1}}>
                  <input 
                    type="text" 
                    placeholder="Left"
                    value={headerText.split('|')[0] || ''}
                    onChange={(e) => {
                      const parts = headerText.split('|');
                      parts[0] = e.target.value;
                      setHeaderText(parts.join('|'));
                    }}
                    className="hf-input"
                    style={{flex: 1}}
                  />
                  <input 
                    type="text" 
                    placeholder="Center"
                    value={headerText.split('|')[1] || ''}
                    onChange={(e) => {
                      const parts = headerText.split('|');
                      parts[1] = e.target.value;
                      setHeaderText(parts.join('|'));
                    }}
                    className="hf-input"
                    style={{flex: 1}}
                  />
                  <input 
                    type="text" 
                    placeholder="Right"
                    value={headerText.split('|')[2] || ''}
                    onChange={(e) => {
                      const parts = headerText.split('|');
                      parts[2] = e.target.value;
                      setHeaderText(parts.join('|'));
                    }}
                    className="hf-input"
                    style={{flex: 1}}
                  />
                </div>
              </div>
              <div className="hf-control-group">
                <label>Footer Layout:</label>
                <div style={{display: 'flex', gap: '8px', flex: 1}}>
                  <input 
                    type="text" 
                    placeholder="Left"
                    value={footerText.split('|')[0] || ''}
                    onChange={(e) => {
                      const parts = footerText.split('|');
                      parts[0] = e.target.value;
                      setFooterText(parts.join('|'));
                    }}
                    className="hf-input"
                    style={{flex: 1}}
                  />
                  <input 
                    type="text" 
                    placeholder="Center"
                    value={footerText.split('|')[1] || ''}
                    onChange={(e) => {
                      const parts = footerText.split('|');
                      parts[1] = e.target.value;
                      setFooterText(parts.join('|'));
                    }}
                    className="hf-input"
                    style={{flex: 1}}
                  />
                  <input 
                    type="text" 
                    placeholder="Right"
                    value={footerText.split('|')[2] || ''}
                    onChange={(e) => {
                      const parts = footerText.split('|');
                      parts[2] = e.target.value;
                      setFooterText(parts.join('|'));
                    }}
                    className="hf-input"
                    style={{flex: 1}}
                  />
                </div>
              </div>
              <div className="hf-control-group">
                <label>Page Numbers in H/F:</label>
                <select 
                  value={pageNumbering.enabled}
                  onChange={(e) => updatePageNumbering(e.target.value === 'true', pageNumbering.position, pageNumbering.format)}
                  className="hf-select"
                >
                  <option value="true">Show in Header/Footer</option>
                  <option value="false">Hide from Header/Footer</option>
                </select>
              </div>
              <div className="hf-control-group">
                <label>Position:</label>
                <select 
                  value={pageNumbering.position}
                  onChange={(e) => updatePageNumbering(pageNumbering.enabled, e.target.value, pageNumbering.format)}
                  className="hf-select"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>
              <div className="hf-control-group">
                <label>Format:</label>
                <select 
                  value={pageNumbering.format}
                  onChange={(e) => updatePageNumbering(pageNumbering.enabled, pageNumbering.position, e.target.value)}
                  className="hf-select"
                >
                  <option value="1">1, 2, 3</option>
                  <option value="i">i, ii, iii</option>
                  <option value="a">a, b, c</option>
                </select>
              </div>
              <button onClick={() => setShowHeaderFooter(false)} className="close-panel-btn">Close</button>
            </div>
          )}
          
          {/* Page Border Controls */}
          {showPageBorderControls && (
            <div className="page-border-controls">
              <h4>Professional Page Border</h4>
              
              <div className="border-control-group">
                <label>Border Position:</label>
                <select 
                  value={pageBorder.position}
                  onChange={(e) => setPageBorder({...pageBorder, position: e.target.value})}
                  className="border-select"
                >
                  <option value="all">All Sides</option>
                  <option value="top">Top Only</option>
                  <option value="bottom">Bottom Only</option>
                  <option value="both">Top & Bottom</option>
                </select>
              </div>
              
              <div className="border-control-group">
                <label>Border Type:</label>
                <select 
                  value={pageBorder.borderType}
                  onChange={(e) => setPageBorder({...pageBorder, borderType: e.target.value})}
                  className="border-select"
                >
                  <option value="simple">Simple Border</option>
                  <option value="rounded">Rounded Border</option>
                  <option value="shadow">Shadow Border</option>
                  <option value="double">Double Border</option>
                </select>
              </div>
              
              <div className="border-control-group">
                <label>Border Color:</label>
                <div className="color-presets">
                  <button 
                    className={`color-preset ${pageBorder.color === '#FFD700' ? 'active' : ''}`}
                    style={{backgroundColor: '#FFD700'}}
                    onClick={() => setPageBorder({...pageBorder, color: '#FFD700'})}
                  ></button>
                  <button 
                    className={`color-preset ${pageBorder.color === '#000000' ? 'active' : ''}`}
                    style={{backgroundColor: '#000000'}}
                    onClick={() => setPageBorder({...pageBorder, color: '#000000'})}
                  ></button>
                  <button 
                    className={`color-preset ${pageBorder.color === '#0066CC' ? 'active' : ''}`}
                    style={{backgroundColor: '#0066CC'}}
                    onClick={() => setPageBorder({...pageBorder, color: '#0066CC'})}
                  ></button>
                  <button 
                    className={`color-preset ${pageBorder.color === '#CC0000' ? 'active' : ''}`}
                    style={{backgroundColor: '#CC0000'}}
                    onClick={() => setPageBorder({...pageBorder, color: '#CC0000'})}
                  ></button>
                  <input 
                    type="color" 
                    value={pageBorder.color}
                    onChange={(e) => setPageBorder({...pageBorder, color: e.target.value})}
                    className="border-color-picker"
                  />
                </div>
              </div>
              
              <div className="border-control-group">
                <label>Border Width:</label>
                <select 
                  value={pageBorder.width}
                  onChange={(e) => setPageBorder({...pageBorder, width: e.target.value})}
                  className="border-select"
                >
                  <option value="1px">Thin (1px)</option>
                  <option value="2px">Medium (2px)</option>
                  <option value="3px">Thick (3px)</option>
                  <option value="4px">Extra Thick (4px)</option>
                  <option value="6px">Bold (6px)</option>
                </select>
              </div>
              
              <div className="border-control-group">
                <label>Border Style:</label>
                <select 
                  value={pageBorder.style}
                  onChange={(e) => setPageBorder({...pageBorder, style: e.target.value})}
                  className="border-select"
                >
                  <option value="solid">Solid Line</option>
                  <option value="dashed">Dashed Line</option>
                  <option value="dotted">Dotted Line</option>
                  <option value="double">Double Line</option>
                  <option value="groove">Groove Effect</option>
                  <option value="ridge">Ridge Effect</option>
                </select>
              </div>
              
              <div className="border-control-group">
                <label>Inner Padding:</label>
                <select 
                  value={pageBorder.padding}
                  onChange={(e) => setPageBorder({...pageBorder, padding: e.target.value})}
                  className="border-select"
                >
                  <option value="5px">Tight (5px)</option>
                  <option value="10px">Normal (10px)</option>
                  <option value="15px">Comfortable (15px)</option>
                  <option value="20px">Spacious (20px)</option>
                  <option value="25px">Extra Space (25px)</option>
                </select>
              </div>
              
              <div className="border-preview">
                <div 
                  className="preview-box"
                  style={{
                    border: `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}`,
                    borderRadius: pageBorder.borderType === 'rounded' ? '8px' : '0',
                    boxShadow: pageBorder.borderType === 'shadow' ? `inset 0 0 0 ${pageBorder.width} ${pageBorder.color}` : 'none'
                  }}
                >
                  Preview
                </div>
              </div>
              
              <div className="border-actions">
                <button onClick={applyPageBorder} className="apply-border-btn">Apply Border</button>
                <button onClick={removePageBorder} className="remove-border-btn">Remove Border</button>
                <button onClick={() => setShowPageBorderControls(false)} className="cancel-border-btn">Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className={`right-sidebar ${showRightSidebar ? 'mobile-open' : ''}`}>
          <div className="sidebar-section">
            <h3><i className="ri-tools-line"></i> Tools</h3>
            <button className="sidebar-btn"><i className="ri-chat-3-line"></i> Comments</button>
            <button className="sidebar-btn"><i className="ri-lightbulb-line"></i> Suggestions</button>
            <button className="sidebar-btn" onClick={() => setShowVersionHistory(true)}><i className="ri-history-line"></i> Version History</button>
            <button className="sidebar-btn" onClick={() => document.querySelector('input[type="file"]').click()}><i className="ri-image-add-line"></i> Upload Image</button>
            <input type="file" accept="image/*" style={{display: 'none'}} onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const img = document.createElement('img');
                  img.src = event.target.result;
                  img.style.maxWidth = '100%';
                  img.style.height = 'auto';
                  img.style.cursor = 'pointer';
                  img.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedImage(img);
                    document.querySelectorAll('.editor-content img').forEach(i => i.classList.remove('selected'));
                    img.classList.add('selected');
                  };
                  editorRef.current.appendChild(img);
                };
                reader.readAsDataURL(file);
              }
            }} />
          </div>
          <div className="sidebar-section">
            <h3><i className="ri-team-line"></i> Collaboration</h3>
            <button className="sidebar-btn" onClick={addCollaborator}><i className="ri-user-add-line"></i> Add Collaborator</button>
            <button className="sidebar-btn" onClick={generateShareLink}><i className="ri-link"></i> Generate Link</button>
            <div className="collaborators">
              {collaborators.map(collab => (
                <div key={collab.id} className="collaborator-item">
                  <div className="collaborator-avatar">{collab.email.charAt(0).toUpperCase()}</div>
                  <span className="collaborator-email">{collab.email}</span>
                </div>
              ))}
            </div>
            {shareLink && (
              <div className="share-link">
                <small>Share Link:</small>
                <input type="text" value={shareLink} readOnly onClick={(e) => e.target.select()} />
              </div>
            )}
          </div>
          <div className="sidebar-section">
            <h3><i className="ri-file-text-line"></i> Templates</h3>
            <button className="sidebar-btn" onClick={() => setShowTemplateDemo(!showTemplateDemo)}>
              <i className="ri-layout-2-line"></i> {showTemplateDemo ? 'Hide' : 'Show'} Templates
            </button>
          </div>
          <div className="sidebar-section">
            <h3><i className="ri-upload-line"></i> Import/Export</h3>
            <button className="sidebar-btn" onClick={importDocument}><i className="ri-file-upload-line"></i> Import File</button>
            <button className="sidebar-btn" onClick={() => exportDocument('pdf')}><i className="ri-file-pdf-2-line"></i> PDF</button>
            <button className="sidebar-btn" onClick={() => exportDocument('docx')}><i className="ri-file-word-2-line"></i> DOCX</button>
            <button className="sidebar-btn" onClick={addNewPage}><i className="ri-file-add-line"></i> New Page</button>
            <button className="sidebar-btn" onClick={() => exportDocument('md')}><i className="ri-markdown-line"></i> Markdown</button>
            <button className="sidebar-btn" onClick={() => exportDocument('html')}><i className="ri-code-line"></i> HTML</button>
          </div>
        </aside>
      </div>
      
      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="modal-overlay" onClick={() => setShowVersionHistory(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Version History</h3>
              <button className="close-btn" onClick={() => setShowVersionHistory(false)}><i className="ri-close-line"></i></button>
            </div>
            <div className="modal-body">
              {documentHistory.length === 0 ? (
                <p>No version history available</p>
              ) : (
                documentHistory.map(version => (
                  <div key={version.id} className="version-item">
                    <div className="version-info">
                      <strong>{new Date(version.timestamp).toLocaleString()}</strong>
                      <span>by {version.author}</span>
                    </div>
                    <div className="version-actions">
                      <button onClick={() => restoreVersion(version)}>Restore</button>
                      <button onClick={() => {
                        const preview = document.createElement('div');
                        preview.innerHTML = version.content;
                        showNotification(`Preview: ${preview.textContent.substring(0, 100)}...`, 'info');
                      }}>Preview</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Find & Replace Modal */}
      {showFindReplace && (
        <div className="modal-overlay" onClick={closeFindReplace}>
          <div className="find-replace-modal" onClick={(e) => e.stopPropagation()}>
            <div className="find-replace-header">
              <h3>Find & Replace</h3>
              <button className="close-btn" onClick={closeFindReplace}><i className="ri-close-line"></i></button>
            </div>
            <div className="find-replace-body">
              <div className="find-replace-row">
                <input
                  type="text"
                  placeholder="Find..."
                  value={findText}
                  onChange={(e) => {
                    setFindText(e.target.value);
                    if (e.target.value) {
                      highlightMatches(e.target.value);
                    } else {
                      clearHighlights();
                      setTotalMatches(0);
                      setCurrentMatch(0);
                    }
                  }}
                  className="find-input"
                  autoFocus
                />
                <div className="find-controls">
                  <button onClick={findPrevious} disabled={totalMatches === 0}><i className="ri-arrow-up-s-line"></i></button>
                  <button onClick={findNext} disabled={totalMatches === 0}><i className="ri-arrow-down-s-line"></i></button>
                  <span className="match-counter">{totalMatches > 0 ? `${currentMatch}/${totalMatches}` : '0/0'}</span>
                </div>
              </div>
              <div className="find-replace-row">
                <input
                  type="text"
                  placeholder="Replace with..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="replace-input"
                />
                <div className="replace-controls">
                  <button onClick={replaceOne} disabled={totalMatches === 0}>Replace</button>
                  <button onClick={replaceAll} disabled={totalMatches === 0}>Replace All</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentId={documentId || documentData?._id}
        documentTitle={documentTitle}
        documentData={documentData}
        isCollaborative={isCollaborative}
      />
      
      {/* Template Demo */}
      {showTemplateDemo && (
        <TemplateDemo onHide={() => setShowTemplateDemo(false)} />
      )}
      
      {/* Bottom Status Bar */}
      <div className="bottom-status-bar">
        <div className="status-left">
          <span className="word-count">
            <i className="ri-file-text-line"></i> {wordCount} words
          </span>
        </div>
        <div className="status-center">
          <span className="page-info">
            Page {currentPage} of {pages.length}
          </span>
        </div>
        <div className="status-right">
          <span className="zoom-level">
            <i className="ri-zoom-in-line"></i> 100%
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;