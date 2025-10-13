import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';
import './DocumentEditor.css';
import ShareModal from '../components/ShareModal';
import { useNotification } from '../context/NotificationContext';

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
    margin: '20px'
  });
  const [pages, setPages] = useState([{ id: 1, content: '<p>Start writing your document here...</p>' }]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showHeaderFooter, setShowHeaderFooter] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [headerAlignment, setHeaderAlignment] = useState('top-center');
  const [footerAlignment, setFooterAlignment] = useState('bottom-center');
  const [pageNumbering, setPageNumbering] = useState({ enabled: true, position: 'bottom-right', format: '1' });

  const editorRef = useRef(null);
  const navigate = useNavigate();
  const { id: documentId } = useParams();
  const autoSaveInterval = useRef(null);

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

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
  };



  const updatePageNumbering = (enabled, position, format) => {
    setPageNumbering({ enabled, position, format });
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
    recentDocs.unshift({ title: documentTitle, lastModified: timestamp });
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
  
  const togglePageBorder = () => {
    setShowPageBorderControls(!showPageBorderControls);
  };
  
  const applyPageBorder = () => {
    setPageBorder({ ...pageBorder, enabled: true });
    setShowPageBorderControls(false);
  };
  
  const removePageBorder = () => {
    setPageBorder({ ...pageBorder, enabled: false });
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
          <div className="logo">EtherXWord</div>
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
          <button onClick={togglePageBorder} className="toolbar-btn"><i className="ri-checkbox-blank-line"></i></button>
          <button onClick={() => formatText('createLink', prompt('Enter URL:'))} className="toolbar-btn"><i className="ri-link"></i></button>
          <button onClick={() => setShowHeaderFooter(!showHeaderFooter)} className="toolbar-btn"><i className="ri-layout-top-2-line"></i> H/F</button>
        </div>

        <div className="toolbar-group mobile-hidden">
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
            <button className="sidebar-btn"><i className="ri-bar-chart-line"></i> Word Count</button>
            <button className="sidebar-btn"><i className="ri-find-replace-line"></i> Find & Replace</button>
            <button className="sidebar-btn"><i className="ri-list-unordered"></i> Outline</button>
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
                style={pageBorder.enabled ? {
                  border: `${pageBorder.width} ${pageBorder.style} ${pageBorder.color}`,
                  margin: pageBorder.margin
                } : {}}
              >
                {headerText && (
                  <div className={`page-hf-element ${headerAlignment}`}>{headerText}</div>
                )}
                
                <div
                  ref={index === 0 ? editorRef : null}
                  contentEditable
                  className="editor-content a4-content"
                  suppressContentEditableWarning={true}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={(e) => {
                    handleEditorClick(e);
                    setCurrentPage(page.id);
                  }}
                  onInput={(e) => handleContentChange(e, page.id)}
                  data-page-id={page.id}
                >
                  {page.id === 1 && page.content === '<p>Start writing your document here...</p>' ? (
                    'Start writing your document here...'
                  ) : null}
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
              <h4>Page Border Settings</h4>
              <div className="border-control-group">
                <label>Border Color:</label>
                <input 
                  type="color" 
                  value={pageBorder.color}
                  onChange={(e) => setPageBorder({...pageBorder, color: e.target.value})}
                  className="border-color-picker"
                />
              </div>
              <div className="border-control-group">
                <label>Border Width:</label>
                <select 
                  value={pageBorder.width}
                  onChange={(e) => setPageBorder({...pageBorder, width: e.target.value})}
                  className="border-select"
                >
                  <option value="1px">1px</option>
                  <option value="2px">2px</option>
                  <option value="3px">3px</option>
                  <option value="4px">4px</option>
                  <option value="5px">5px</option>
                </select>
              </div>
              <div className="border-control-group">
                <label>Border Style:</label>
                <select 
                  value={pageBorder.style}
                  onChange={(e) => setPageBorder({...pageBorder, style: e.target.value})}
                  className="border-select"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
              <div className="border-control-group">
                <label>Margin:</label>
                <select 
                  value={pageBorder.margin}
                  onChange={(e) => setPageBorder({...pageBorder, margin: e.target.value})}
                  className="border-select"
                >
                  <option value="10px">10px</option>
                  <option value="15px">15px</option>
                  <option value="20px">20px</option>
                  <option value="25px">25px</option>
                  <option value="30px">30px</option>
                </select>
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
            <button className="sidebar-btn"><i className="ri-bar-chart-line"></i> Word Count: {editorRef.current ? editorRef.current.innerText.trim().split(/\s+/).length : 0}</button>
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
            <h3><i className="ri-upload-line"></i> Export</h3>
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
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        documentId={documentId || 'temp-doc-id'}
        documentTitle={documentTitle}
      />
    </div>
  );
};

export default DocumentEditor;