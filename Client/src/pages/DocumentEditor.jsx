import React, { useState, useRef } from 'react';
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
    borderType: 'simple'
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
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
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
      content: '<p><br></p>'
    };
    setPages([...pages, newPage]);
    setCurrentPage(newPage.id);
  };

  const handleContentChange = (e, pageId) => {
    const content = e.target.innerHTML;
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId ? { ...page, content } : page
      )
    );
    
    // Check line count and create new page if needed
    checkAndCreateNewPage(e.target);
    
    // Debounced undo stack save
    if (!isUndoRedo) {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      undoTimeoutRef.current = setTimeout(() => {
        saveToUndoStack();
      }, 1000); // Save to undo stack after 1 second of inactivity
    }
  };

  const checkAndCreateNewPage = (element) => {
    const textContent = element.innerText || element.textContent || '';
    const lines = textContent.split('\n').length;
    
    if (lines >= 38 && pages.length === currentPage) {
      // Create new page
      const newPage = {
        id: pages.length + 1,
        content: '<p><br></p>'
      };
      setPages(prev => [...prev, newPage]);
      
      // Move cursor to new page after a short delay
      setTimeout(() => {
        const newPageElement = document.querySelector(`[data-page-id="${newPage.id}"]`);
        if (newPageElement) {
          newPageElement.focus();
          setCurrentPage(newPage.id);
        }
      }, 100);
    }
  };



  const updatePageNumbering = (enabled, position, format) => {
    setPageNumbering({ enabled, position, format });
  };

  const importDocument = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.html,.md,.docx';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          if (editorRef.current) {
            editorRef.current.innerHTML = content;
            setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
            saveToUndoStack();
            showNotification('Document imported successfully!', 'success');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const saveDocument = async (isAutoSave = false) => {
    // Check if user has edit permission
    if (isCollaborative && userPermission !== 'edit') {
      if (!isAutoSave) {
        showNotification('You do not have permission to edit this document', 'error');
      }
      return;
    }
    
    if (isCollaborative && documentData) {
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
            content: editorRef.current.innerHTML
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
    const content = editorRef.current.innerHTML;
    const timestamp = new Date().toISOString();
    const docData = {
      id: Date.now().toString(),
      title: documentTitle,
      content: content,
      lastModified: timestamp,
      wordCount: editorRef.current.innerText.trim().split(/\s+/).length,
      collaborators: collaborators
    };
    
    // Save version to history
    const newHistory = {
      id: Date.now().toString(),
      content: content,
      timestamp: timestamp,
      author: localStorage.getItem('userProfile') ? JSON.parse(localStorage.getItem('userProfile')).fullName : 'Anonymous',
      changes: 'Document updated'
    };
    
    const updatedHistory = [newHistory, ...documentHistory.slice(0, 9)]; // Keep last 10 versions
    setDocumentHistory(updatedHistory);
    localStorage.setItem(`history_${documentTitle}`, JSON.stringify(updatedHistory));
    
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
      wordCount: editorRef.current.innerText.trim().split(/\s+/).length
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
  
  const generateShareLink = () => {
    const link = `${window.location.origin}/editor/shared/${btoa(documentTitle)}`;
    setShareLink(link);
    navigator.clipboard.writeText(link);
    showNotification('Share link copied to clipboard!', 'success');
  };
  
  const addCollaborator = () => {
    const email = window.prompt('Enter collaborator email:');
    if (email && email.includes('@')) {
      const newCollaborator = {
        id: Date.now().toString(),
        email: email,
        role: 'editor',
        addedAt: new Date().toISOString()
      };
      setCollaborators([...collaborators, newCollaborator]);
      showNotification(`Collaborator ${email} added successfully!`, 'success');
    } else if (email) {
      showNotification('Please enter a valid email address', 'error');
    }
  };
  
  const restoreVersion = (version) => {
    if (window.confirm('Restore this version? Current changes will be lost.')) {
      editorRef.current.innerHTML = version.content;
      saveDocument();
      setShowVersionHistory(false);
      showNotification('Version restored successfully!', 'success');
    }
  };
  
  // Auto-save functionality
  const startAutoSave = () => {
    if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
    autoSaveInterval.current = setInterval(() => {
      saveDocument(true);
    }, 30000); // Auto-save every 30 seconds
  };
  
  // Load document data if collaborative
  React.useEffect(() => {
    if (documentId) {
      fetchDocumentData();
    } else {
      // Load local document history
      const history = JSON.parse(localStorage.getItem(`history_${documentTitle}`) || '[]');
      setDocumentHistory(history);
      startAutoSave();
    }
    
    return () => {
      if (autoSaveInterval.current) clearInterval(autoSaveInterval.current);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, [documentId, documentTitle]);
  
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
        
        // Set content
        if (editorRef.current) {
          editorRef.current.innerHTML = data.content || '<p>Start writing...</p>';
        }
        
        // Check user permission
        const userId = JSON.parse(localStorage.getItem('userProfile') || '{}')._id;
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
      } else {
        console.error('Failed to fetch document');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      navigate('/');
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
    // Force focus out to ensure all content is saved
    editorRef.current.blur();
    
    // Wait a moment for any pending updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const element = editorRef.current;
    
    // Create a temporary container with better styling for PDF
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: 800px;
      background: white;
      padding: 40px;
      font-family: Georgia, serif;
      font-size: 16px;
      line-height: 1.6;
      color: black;
    `;
    
    // Clone the editor content
    tempContainer.innerHTML = element.innerHTML;
    
    // Preserve text alignment and colors from original elements
    const originalElements = element.querySelectorAll('*');
    const tempElements = tempContainer.querySelectorAll('*');
    
    originalElements.forEach((originalEl, index) => {
      if (tempElements[index]) {
        const computedStyle = window.getComputedStyle(originalEl);
        const tempEl = tempElements[index];
        
        // Copy alignment
        if (computedStyle.textAlign && computedStyle.textAlign !== 'start') {
          tempEl.style.textAlign = computedStyle.textAlign;
        }
        
        // Copy colors
        if (computedStyle.color && computedStyle.color !== 'rgb(0, 0, 0)') {
          tempEl.style.color = computedStyle.color;
        }
        
        if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          tempEl.style.backgroundColor = computedStyle.backgroundColor;
        }
      }
    });
    
    // Ensure images are properly sized and aligned
    const images = tempContainer.querySelectorAll('img');
    images.forEach(img => {
      const parentStyle = window.getComputedStyle(img.parentElement);
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = 'block';
      img.style.margin = '10px 0';
      if (parentStyle.textAlign) {
        img.style.marginLeft = parentStyle.textAlign === 'center' ? 'auto' : '0';
        img.style.marginRight = parentStyle.textAlign === 'center' ? 'auto' : '0';
      }
    });
    
    document.body.appendChild(tempContainer);
    
    try {
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${documentTitle}.pdf`);
    } finally {
      document.body.removeChild(tempContainer);
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
  
  // Expose loadTemplate method globally for external use
  React.useEffect(() => {
    window.EtherXWordEditor = {
      loadTemplate,
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
          <button className="nav-btn" onClick={() => saveDocument()}><i class="ri-save-line"></i> Save</button>
          <button 
            className="nav-btn" 
            onClick={() => setShowShareModal(true)}
            disabled={isCollaborative && userPermission !== 'edit'}
          >
            <i class="ri-share-fill"></i> Share
          </button>
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
            <s>S</s>
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

      <div className="editor-layout">
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
                {headerText && (
                  <div className={`page-hf-element ${headerAlignment}`}>{headerText}</div>
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
                    border: pageBorder.borderType === 'shadow' ? 'none' : `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}`,
                    margin: pageBorder.padding,
                    width: `calc(100% - ${parseInt(pageBorder.padding) * 2}px - ${parseInt(pageBorder.width) * 2}px)`,
                    height: `calc(100% - ${parseInt(pageBorder.padding) * 2}px - ${parseInt(pageBorder.width) * 2}px)`,
                    borderRadius: pageBorder.borderType === 'rounded' ? '8px' : '0',
                    boxShadow: pageBorder.borderType === 'shadow' ? `inset 0 0 0 ${pageBorder.width} ${pageBorder.color}` : 'none',
                    position: 'relative',
                    boxSizing: 'border-box'
                  } : {}}
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
                </div>
                
                {footerText && (
                  <div className={`page-hf-element ${footerAlignment}`}>{footerText}</div>
                )}
                
                {pageNumbering.enabled && (
                  <div className={`page-number ${pageNumbering.position}`}>
                    {pageNumbering.format === '1' ? index + 1 : 
                     pageNumbering.format === 'i' ? ['i', 'ii', 'iii', 'iv', 'v'][index] || (index + 1) :
                     pageNumbering.format === 'a' ? String.fromCharCode(97 + index) : index + 1}
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
                <label>Header Position:</label>
                <select 
                  value={headerAlignment}
                  onChange={(e) => setHeaderAlignment(e.target.value)}
                  className="hf-select"
                >
                  <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                </select>
              </div>
              <div className="hf-control-group">
                <label>Footer Position:</label>
                <select 
                  value={footerAlignment}
                  onChange={(e) => setFooterAlignment(e.target.value)}
                  className="hf-select"
                >
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                  <option value="bottom-right">Bottom Right</option>
                </select>
              </div>
              <div className="hf-control-group">
                <label>Page Numbers:</label>
                <select 
                  value={pageNumbering.enabled}
                  onChange={(e) => updatePageNumbering(e.target.value === 'true', pageNumbering.position, pageNumbering.format)}
                  className="hf-select"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
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
        documentId={documentId || 'temp-doc-id'}
        documentTitle={documentTitle}
      />
      
      {/* Template Demo */}
      {showTemplateDemo && (
        <TemplateDemo onHide={() => setShowTemplateDemo(false)} />
      )}
    </div>
  );
};

export default DocumentEditor;