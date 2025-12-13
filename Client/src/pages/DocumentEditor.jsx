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
import { getShapeSVG } from '../utils/ShapeTemplates';
import { imageResizer } from '../utils/imageResizer';
import { saveNoteToIPFS } from '../utils/ipfs';
import EditorToolBox from '../components/EditorToolBox';
import textBoxEngine from '../utils/textBoxEngine';

// Initial style definitions moved to component state
const initialStyleDefinitions = {
  paragraph: { fontSize: '11pt', fontWeight: 'normal', fontStyle: 'normal', textDecoration: 'none', color: '#000000', marginBottom: '8pt', lineHeight: '1.15', textAlign: 'left' },
  body: { fontSize: '11pt', fontWeight: 'normal', marginBottom: '0pt', lineHeight: '1', color: '#000000' },
  heading1: { fontSize: '16pt', fontWeight: '300', color: '#2f5496', marginBottom: '6pt', marginTop: '12pt', lineHeight: '1.2' },
  heading2: { fontSize: '13pt', fontWeight: 'bold', color: '#2f5496', marginBottom: '4pt', marginTop: '10pt', lineHeight: '1.2', borderBottom: '1px solid #2f5496' },
  heading3: { fontSize: '12pt', fontWeight: 'bold', color: '#2f5496', marginBottom: '4pt', marginTop: '10pt' },
  heading4: { fontSize: '11pt', fontWeight: 'bold', fontStyle: 'italic', color: '#2f5496', marginBottom: '4pt', marginTop: '10pt' },
  title: { fontSize: '28pt', fontWeight: '300', color: '#000000', textAlign: 'center', marginBottom: '12pt' },
  subtitle: { fontSize: '12pt', fontStyle: 'italic', color: '#5a5a5a', textAlign: 'center', marginBottom: '12pt' },
  subtleEmphasis: { fontStyle: 'italic', color: '#5a5a5a' },
  emphasis: { fontStyle: 'italic' },
  intenseEmphasis: { fontStyle: 'italic', color: '#2f5496' },
  strong: { fontWeight: 'bold' },
  quote: { fontStyle: 'italic', color: '#5a5a5a', borderLeft: '4px solid #ccc', paddingLeft: '16px', margin: '16px 0', display: 'block' },
  intenseQuote: { fontStyle: 'italic', color: '#2f5496', textAlign: 'center', borderTop: '1px solid #2f5496', borderBottom: '1px solid #2f5496', padding: '16px', margin: '16px 0', display: 'block' },
  subtleReference: { fontVariant: 'small-caps', color: '#5a5a5a' },
  intenseReference: { fontVariant: 'small-caps', fontWeight: 'bold', color: '#2f5496' },
  bookTitle: { fontWeight: 'bold', fontStyle: 'italic' },
  listParagraph: { marginLeft: '36pt' }
};

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
  const [headerFooterSettings, setHeaderFooterSettings] = useState(null);
  const [definedStyles, setDefinedStyles] = useState(initialStyleDefinitions);

  // Editor state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showToolbar, setShowToolbar] = useState(true);
  const [bookmarks, setBookmarks] = useState([]); // Bookmarks state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTool, setSelectedTool] = useState('Home');
  const [showShareModal, setShowShareModal] = useState(false);

  const [showFormattingMarks, setShowFormattingMarks] = useState(false);
  const [isDrawTableMode, setIsDrawTableMode] = useState(false);
  const drawStateRef = useRef({ isDrawing: false, startX: 0, startY: 0, ghost: null });

  // --- Shape Drawing Logic ---
  const [activeShapeTool, setActiveShapeTool] = useState(null);
  const shapeGhostRef = useRef(null);
  const shapeStartRef = useRef(null);

  const handleShapeMouseDown = (e) => {
    if (!activeShapeTool) return;
    e.preventDefault(); // Prevent text selection
    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoomLevel / 100;
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    shapeStartRef.current = { x, y };

    if (shapeGhostRef.current) {
      shapeGhostRef.current.style.display = 'block';
      shapeGhostRef.current.style.left = `${x}px`;
      shapeGhostRef.current.style.top = `${y}px`;
      shapeGhostRef.current.style.width = '0px';
      shapeGhostRef.current.style.height = '0px';
    }
  };

  const handleShapeMouseMove = (e) => {
    if (!activeShapeTool || !shapeStartRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scale = zoomLevel / 100;
    const currentX = (e.clientX - rect.left) / scale;
    const currentY = (e.clientY - rect.top) / scale;
    const startX = shapeStartRef.current.x;
    const startY = shapeStartRef.current.y;

    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    if (shapeGhostRef.current) {
      shapeGhostRef.current.style.left = `${left}px`;
      shapeGhostRef.current.style.top = `${top}px`;
      shapeGhostRef.current.style.width = `${width}px`;
      shapeGhostRef.current.style.height = `${height}px`;
    }
  };

  const handleShapeMouseUp = (e) => {
    if (!activeShapeTool || !shapeStartRef.current) return;

    const ghost = shapeGhostRef.current;
    const width = parseFloat(ghost.style.width);
    const height = parseFloat(ghost.style.height);

    if (width > 5 && height > 5) {
      try {
        // getShapeSVG is imported from utils/ShapeTemplates
        const svgContent = getShapeSVG(activeShapeTool, undefined, undefined, false);
        const base64 = btoa(unescape(encodeURIComponent(svgContent)));
        const dataUri = `data:image/svg+xml;base64,${base64}`;
        const imgHtml = `<img src="${dataUri}" style="width: ${width}px; height: ${height}px; vertical-align: middle;" />`;

        if (document.caretRangeFromPoint) {
          const range = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (range) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
        }

        focusActiveEditor();
        document.execCommand('insertHTML', false, imgHtml);
      } catch (err) {
        console.error('Shape insertion failed:', err);
      }
    }

    // Cleanup
    setActiveShapeTool(null);
    shapeStartRef.current = null;
    if (shapeGhostRef.current) shapeGhostRef.current.style.display = 'none';
  };

  // Formatting state
  const [currentFormat, setCurrentFormat] = useState({
    fontFamily: 'Georgia',
    fontSize: '12pt',
    bold: false,
    italic: false,
    underline: false,
    textAlign: 'left'
  });

  // Paragraph formatting state (MS Word PPr equivalent)
  const [paragraphFormats, setParagraphFormats] = useState(new Map());

  // Helper function to get selected paragraphs
  const getSelectedParagraphs = useCallback((range) => {
    if (!range) return [];

    const container = range.commonAncestorContainer;
    const startNode = range.startContainer;
    const endNode = range.endContainer;

    // Get all block-level elements in selection
    const blocks = [];
    const blockTags = ['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'];

    const findBlocks = (node) => {
      if (node.nodeType === 1 && blockTags.includes(node.tagName)) {
        blocks.push(node);
      } else if (node.childNodes) {
        Array.from(node.childNodes).forEach(findBlocks);
      }
    };

    if (container.nodeType === 1 && blockTags.includes(container.tagName)) {
      blocks.push(container);
    } else {
      findBlocks(container);
    }

    // If no blocks found, find parent block
    if (blocks.length === 0) {
      let node = startNode;
      while (node && node !== document.body) {
        if (node.nodeType === 1 && blockTags.includes(node.tagName)) {
          blocks.push(node);
          break;
        }
        node = node.parentNode;
      }
    }

    return blocks;
  }, []);

  // Refs
  const editorContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const paginationRef = useRef(null);
  const formatPainterStyleRef = useRef(null);
  const formatPainterMultiRef = useRef(false);

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

        // Check for template data and load it
        const templateData = localStorage.getItem('selectedTemplate');
        if (templateData) {
          try {
            const template = JSON.parse(templateData);
            setDocumentTitle(template.title);
            paginationRef.current.setContent(template.content);
            localStorage.removeItem('selectedTemplate'); // Clear after use
            showNotification('Template loaded successfully!', 'success');
          } catch (error) {
            console.error('Error loading template:', error);
            showNotification('Failed to load template', 'error');
          }
        }

        // Add drag and drop functionality to editor
        const handleDragOver = (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'copy';
        };

        const handleDrop = (e) => {
          e.preventDefault();
          const files = e.dataTransfer.files;
          if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
              const pageIndex = paginationRef.current.currentPageIndex || 0;
              const currentPage = paginationRef.current.pages[pageIndex];
              if (currentPage && currentPage.content) {
                imageResizer.insertImage(file, currentPage.content)
                  .then(() => {
                    showNotification('Image inserted successfully!', 'success');
                    setTimeout(() => {
                      if (paginationRef.current) {
                        paginationRef.current.updateStats();
                      }
                    }, 100);
                  })
                  .catch(error => {
                    showNotification('Failed to insert image: ' + error.message, 'error');
                  });
              }
            } else {
              showNotification('Please drop an image file', 'error');
            }
          }
        };

        editorContainerRef.current.addEventListener('dragover', handleDragOver);
        editorContainerRef.current.addEventListener('drop', handleDrop);

        // Add keyboard shortcuts for image operations
        const handleKeyDown = (e) => {
          if (imageResizer.activeImage) {
            switch (e.key) {
              case 'Delete':
              case 'Backspace':
                e.preventDefault();
                imageResizer.deleteImage(imageResizer.activeImage);
                break;
              case 'ArrowLeft':
                if (e.ctrlKey) {
                  e.preventDefault();
                  imageResizer.alignImage(imageResizer.activeImage, 'left');
                }
                break;
              case 'ArrowRight':
                if (e.ctrlKey) {
                  e.preventDefault();
                  imageResizer.alignImage(imageResizer.activeImage, 'right');
                }
                break;
              case 'ArrowUp':
                if (e.ctrlKey) {
                  e.preventDefault();
                  imageResizer.alignImage(imageResizer.activeImage, 'center');
                }
                break;
            }
          }
        };

        document.addEventListener('keydown', handleKeyDown);

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
          document.removeEventListener('keydown', handleKeyDown);
          editorContainerRef.current?.removeEventListener('dragover', handleDragOver);
          editorContainerRef.current?.removeEventListener('drop', handleDrop);
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

  // Draw Table Handlers
  const handleDrawMouseDown = (e) => {
    if (!isDrawTableMode) return;
    // Don't interfere if clicking inside a tool or popup
    if (e.target.closest('.editor-toolbox')) return;

    e.preventDefault();
    const ghost = document.createElement('div');
    ghost.className = 'etb-ghost-table-box';
    ghost.style.position = 'fixed';
    ghost.style.border = '1px dashed #000';
    ghost.style.background = 'rgba(0,0,0,0.05)';
    ghost.style.zIndex = '9999';
    ghost.style.pointerEvents = 'none';
    ghost.style.left = e.clientX + 'px';
    ghost.style.top = e.clientY + 'px';
    document.body.appendChild(ghost);
    drawStateRef.current = { isDrawing: true, startX: e.clientX, startY: e.clientY, ghost };
  };

  const handleDrawMouseMove = (e) => {
    if (!isDrawTableMode || !drawStateRef.current.isDrawing) return;
    const { startX, startY, ghost } = drawStateRef.current;

    const currentX = e.clientX;
    const currentY = e.clientY;

    // Calculate bounds
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const left = Math.min(currentX, startX);
    const top = Math.min(currentY, startY);

    ghost.style.width = `${width}px`;
    ghost.style.height = `${height}px`;
    ghost.style.left = `${left}px`;
    ghost.style.top = `${top}px`;
  };

  const handleDrawMouseUp = (e) => {
    if (!isDrawTableMode || !drawStateRef.current.isDrawing) return;
    const { startX, startY, ghost } = drawStateRef.current;

    // Correct for Zoom Level & Round to Integers
    const scale = zoomLevel / 100;
    const width = Math.round(Math.abs(e.clientX - startX) / scale);
    const height = Math.round(Math.abs(e.clientY - startY) / scale);

    // Cleanup ghost
    if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
    drawStateRef.current = { isDrawing: false, startX: 0, startY: 0, ghost: null };

    if (width > 10 && height > 10) {
      // Create Table DOM Element directly to bypass execCommand style stripping
      const table = document.createElement('table');
      // Use cssText for aggressive styling
      table.style.cssText = `display: inline-table !important; width: ${width}px !important; min-width: ${width}px !important; border-collapse: collapse; border: 1px solid #000; table-layout: fixed !important; vertical-align: top; margin: 0 5px 5px 0;`;

      const tr = document.createElement('tr');
      const td = document.createElement('td');
      // Force TD size as well
      td.style.cssText = `width: ${width}px !important; height: ${height}px !important; min-width: ${width}px; min-height: ${height}px; border: 1px solid #000; padding: 0; box-sizing: border-box;`;
      td.innerHTML = '&nbsp;';

      tr.appendChild(td);
      table.appendChild(tr);

      try {
        focusActiveEditor();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents(); // Clear selection
          range.insertNode(table);

          // Move cursor AFTER the inserted table to allow drawing the next one
          range.setStartAfter(table);
          range.setEndAfter(table);
          selection.removeAllRanges();
          selection.addRange(range);

          // Trigger stats update
          updateDocumentStats();
        }
      } catch (err) {
        console.error('Insert Table Failed', err);
      }
    }
  };

  useEffect(() => {
    if (isDrawTableMode) {
      document.body.style.cursor = 'crosshair'; // Placeholder for Pencil
      document.addEventListener('mousemove', handleDrawMouseMove);
      document.addEventListener('mouseup', handleDrawMouseUp);
    } else {
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleDrawMouseMove);
      document.removeEventListener('mouseup', handleDrawMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleDrawMouseMove);
      document.removeEventListener('mouseup', handleDrawMouseUp);
    };
  }, [isDrawTableMode]);

  const getNextFontSize = (direction) => {
    // Supported font sizes for shortcuts (must match or extend toolbox options)
    const sizes = ['8pt', '9pt', '10pt', '11pt', '12pt', '14pt', '16pt', '18pt', '20pt', '22pt', '24pt', '26pt', '28pt', '32pt', '36pt', '40pt', '44pt', '48pt', '54pt', '60pt', '66pt', '72pt'];

    // Get actual computed font size from selection
    let current = '12pt';
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentElement;

      // First, check for inline style.fontSize (most direct)
      while (node && node.nodeType === 1) {
        if (node.style && node.style.fontSize) {
          current = node.style.fontSize;
          // If it's already in pt format, use it directly
          if (current.includes('pt')) {
            break;
          }
          // If it's in px, convert to pt (1px = 0.75pt at 96 DPI)
          if (current.includes('px')) {
            const pxValue = parseFloat(current);
            const ptValue = Math.round(pxValue * 0.75);
            current = `${ptValue}pt`;
            break;
          }
        }
        node = node.parentElement;
      }

      // If no inline style found, check computed style
      if (current === '12pt') {
        node = range.commonAncestorContainer;
        if (node.nodeType === 3) node = node.parentElement;
        while (node && node.nodeType === 1) {
          const computed = window.getComputedStyle(node);
          const fontSize = computed.fontSize;
          if (fontSize && fontSize !== 'inherit' && fontSize !== '16px') {
            // Convert px to pt (1px = 0.75pt at 96 DPI)
            const pxValue = parseFloat(fontSize);
            const ptValue = Math.round(pxValue * 0.75);
            current = `${ptValue}pt`;
            break;
          }
          node = node.parentElement;
        }
      }
    }

    // Fallback to currentFormat or default
    if (current === '12pt' || !current) {
      current = currentFormat?.fontSize || '12pt';
    }

    // Normalize numeric HTML font sizes (1-7) to approximate pt values
    if (/^[1-7]$/.test(current)) {
      const num = parseInt(current, 10);
      const map = {
        1: '8pt',
        2: '10pt',
        3: '12pt',
        4: '14pt',
        5: '18pt',
        6: '24pt',
        7: '32pt'
      };
      current = map[num] || '12pt';
    }

    if (!/pt$/i.test(current)) {
      current = `${parseInt(current, 10) || 12}pt`;
    }

    const idx = sizes.indexOf(current);
    if (idx === -1) {
      // If unknown size, snap to closest
      const currentNum = parseInt(current, 10) || 12;
      let closest = sizes[0];
      let diff = Math.abs(parseInt(closest, 10) - currentNum);
      for (const s of sizes) {
        const d = Math.abs(parseInt(s, 10) - currentNum);
        if (d < diff) {
          diff = d;
          closest = s;
        }
      }
      current = closest;
    }

    const index = sizes.indexOf(current);
    if (direction === 'up') {
      return sizes[Math.min(index + 1, sizes.length - 1)];
    } else {
      return sizes[Math.max(index - 1, 0)];
    }
  };

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
  // ========== PARAGRAPH FORMATTING FUNCTIONS (MS Word PPr) ==========

  // Apply bullets with proper indentation and hanging indent
  const applyBullets = useCallback((style = 'disc') => {
    focusActiveEditor();

    // Check if we are already in an unordered list
    // If we just call insertUnorderedList while in a list, it toggles it OFF
    if (!document.queryCommandState('insertUnorderedList')) {
      document.execCommand('insertUnorderedList', false, null);
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const node = selection.anchorNode;
      // Find the closest UL
      let listNode = node.nodeType === 1 ? node.closest('ul') : (node.parentElement ? node.parentElement.closest('ul') : null);

      // If not found, try to find it in the selection range
      if (!listNode) {
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        if (container.nodeType === 1) {
          listNode = container.querySelector('ul') || container.closest('ul');
        } else if (container.parentElement) {
          listNode = container.parentElement.closest('ul');
        }
      }

      if (listNode) {
        // Map style names to values
        // Modern browsers support string values for list-style-type
        let cssValue = style;

        if (style === 'diamond' || style === '❖') cssValue = '"❖"';
        else if (style === 'arrow' || style === '➢') cssValue = '"➢"';
        else if (style === 'check' || style === '✓') cssValue = '"✓"';
        else if (style === 'disc' || style === 'circle' || style === 'square') cssValue = style;

        listNode.style.listStyleType = cssValue;
        console.log('Applied bullet style:', cssValue);
      }
    }
    updateFormatState();
  }, []);

  // Apply numbering with auto-increment
  const applyNumbering = useCallback((format = 'decimal', styleName = null) => {
    try {
      focusActiveEditor();
      const selection = window.getSelection();

      // Check if we are already in a list to avoid toggling it off
      let listNode = null;
      if (selection && selection.rangeCount > 0) {
        const node = selection.anchorNode;
        const element = node.nodeType === 1 ? node : node.parentElement;
        if (element) {
          listNode = element.closest('ul') || element.closest('ol');
        }
      }

      // If not in a list, OR if in an Unordered List (need to switch to Ordered for multilevel)
      if (!listNode || listNode.tagName.toLowerCase() === 'ul') {
        document.execCommand('insertOrderedList');
      }

      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          // Fix: Ensure we are looking at an element, not a text node
          const anchorNode = selection.anchorNode;
          const element = anchorNode.nodeType === 1 ? anchorNode : anchorNode.parentElement;

          let listElement = element ? element.closest('ol') : null;

          if (listElement) {
            console.log('Found list element:', listElement);
            // If it's a custom style (like parentheses), we might need to hide default markers
            // and use CSS counters.
            if (styleName && (styleName.includes('Paren') || styleName === 'numberingStyleParen')) {
              listElement.style.listStyleType = 'none';
              listElement.style.paddingLeft = '0px'; // Hanging indent (number in margin)
            } else {
              listElement.style.listStyleType = format;
              listElement.style.paddingLeft = '25px'; // Standard indentation for others
            }

            listElement.style.marginLeft = '0px'; // No margin

            if (styleName) {
              console.log('Setting data-numbering-style to:', styleName);
              listElement.setAttribute('data-numbering-style', styleName);
            } else {
              console.log('Removing data-numbering-style');
              listElement.removeAttribute('data-numbering-style');
            }
          } else {
            console.warn('No list element found to apply numbering style');
          }
        }
        updateFormatState();
      }, 10);
    } catch (error) {
      console.error('Error applying numbering:', error);
    }
  }, []);

  // Apply multilevel list style
  const applyMultilevelList = useCallback((styleName) => {
    try {
      focusActiveEditor();
      const selection = window.getSelection();

      // Check if we are already in a list
      let listNode = null;
      if (selection && selection.rangeCount > 0) {
        const node = selection.anchorNode;
        const element = node.nodeType === 1 ? node : node.parentElement;
        if (element) {
          listNode = element.closest('ul') || element.closest('ol');
        }
      }

      // If not in a list, or in UL, switch to OL
      if (!listNode || listNode.tagName.toLowerCase() === 'ul') {
        document.execCommand('insertOrderedList');
      }

      setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.anchorNode) {
          const anchorNode = selection.anchorNode;
          const element = anchorNode.nodeType === 1 ? anchorNode : anchorNode.parentElement;

          // Find the root OL to apply the style to the entire list structure
          let listElement = element ? element.closest('ol') : null;

          if (listElement) {
            // Traverse up to find the root OL
            while (listElement.parentElement && listElement.parentElement.closest('ol')) {
              listElement = listElement.parentElement.closest('ol');
            }

            console.log('Applying multilevel style to root list:', styleName);

            // --- Theme State ---on the root list
            listElement.setAttribute('data-multilevel-style', styleName);

            // Remove single-level numbering style if present to avoid conflicts
            listElement.removeAttribute('data-numbering-style');

            // Reset basic styles
            listElement.style.listStyleType = 'none'; // We will handle everything with counters
            // We rely on CSS for padding and margin to handle different styles correctly
            listElement.style.paddingLeft = '';
            listElement.style.marginLeft = '';
          }
        }
        updateFormatState();
      }, 10);
    } catch (error) {
      console.error('Error applying multilevel list:', error);
    }
  }, []);

  // Apply indentation (in inches, converted from twips)
  const applyIndentation = useCallback((type, value) => {
    focusActiveEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraphs = getSelectedParagraphs(range);

    paragraphs.forEach(p => {
      switch (type) {
        case 'left':
          p.style.marginLeft = `${value}in`;
          break;
        case 'right':
          p.style.marginRight = `${value}in`;
          break;
        case 'firstLine':
          p.style.textIndent = `${value}in`;
          break;
        case 'hanging':
          p.style.textIndent = `-${value}in`;
          p.style.paddingLeft = `${value}in`;
          break;
      }
    });

    updateFormatState();
  }, [getSelectedParagraphs]);

  // Apply spacing (before/after in points, line spacing as multiplier)
  const applySpacing = useCallback((type, value) => {
    focusActiveEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraphs = getSelectedParagraphs(range);

    paragraphs.forEach(p => {
      switch (type) {
        case 'before':
          p.style.marginTop = `${value}pt`;
          break;
        case 'after':
          p.style.marginBottom = `${value}pt`;
          break;
        case 'line':
          p.style.lineHeight = value;
          break;
      }
    });

    updateFormatState();
  }, [getSelectedParagraphs]);

  // Apply shading (background color)
  const applyParagraphShading = useCallback((color) => {
    focusActiveEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraphs = getSelectedParagraphs(range);

    paragraphs.forEach(p => {
      p.style.backgroundColor = color === 'transparent' ? '' : color;
    });

    updateFormatState();
  }, [getSelectedParagraphs]);



  // ========== END PARAGRAPH FORMATTING FUNCTIONS ==========

  // Increase indent (adds 0.5 inch)
  const increaseIndent = useCallback(() => {
    focusActiveEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraphs = getSelectedParagraphs(range);

    paragraphs.forEach(p => {
      // Check if in a list
      const listItem = p.closest('li');
      if (listItem) {
        // Increase list level
        const currentList = listItem.parentElement;
        const currentIndent = parseFloat(currentList.style.marginLeft || '0.5in');
        currentList.style.marginLeft = `${currentIndent + 0.5}in`;
      } else {
        // Increase paragraph indent
        const currentIndent = parseFloat(p.style.marginLeft || '0');
        p.style.marginLeft = `${currentIndent + 0.5}in`;
      }
    });

    updateFormatState();
  }, [getSelectedParagraphs]);

  // Decrease indent (removes 0.5 inch)
  const decreaseIndent = useCallback(() => {
    focusActiveEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraphs = getSelectedParagraphs(range);

    paragraphs.forEach(p => {
      const listItem = p.closest('li');
      if (listItem) {
        const currentList = listItem.parentElement;
        const currentIndent = parseFloat(currentList.style.marginLeft || '0.5in');
        const newIndent = Math.max(0, currentIndent - 0.5);
        currentList.style.marginLeft = newIndent > 0 ? `${newIndent}in` : '0.5in';
      } else {
        const currentIndent = parseFloat(p.style.marginLeft || '0');
        const newIndent = Math.max(0, currentIndent - 0.5);
        p.style.marginLeft = newIndent > 0 ? `${newIndent}in` : '';
      }
    });

    updateFormatState();
  }, [getSelectedParagraphs]);

  // Multilevel list definitions (MS Word standard)
  const multilevelListDefinitions = {
    standard: [
      { level: 0, format: 'decimal', prefix: '', suffix: '.' },
      { level: 1, format: 'lower-alpha', prefix: '', suffix: ')' },
      { level: 2, format: 'lower-roman', prefix: '', suffix: '.' },
      { level: 3, format: 'decimal', prefix: '', suffix: ')' },
      { level: 4, format: 'lower-alpha', prefix: '', suffix: ')' },
      { level: 5, format: 'lower-roman', prefix: '', suffix: ')' },
      { level: 6, format: 'decimal', prefix: '', suffix: '.' },
      { level: 7, format: 'lower-alpha', prefix: '', suffix: '.' },
      { level: 8, format: 'lower-roman', prefix: '', suffix: '.' }
    ]
  };


  // ========== END ADVANCED PARAGRAPH FUNCTIONS ==========

  // Toggle formatting marks (Show/Hide ¶)
  const toggleFormattingMarks = useCallback(() => {
    setShowFormattingMarks(prev => !prev);
  }, []);

  // Sort paragraphs (A-Z)
  const sortParagraphs = useCallback((direction = 'asc') => {
    focusActiveEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraphs = getSelectedParagraphs(range);

    if (paragraphs.length < 2) {
      showNotification('Please select multiple paragraphs to sort', 'info');
      return;
    }

    // Get parent container (assuming all paragraphs are siblings for now)
    const parent = paragraphs[0].parentNode;

    // Sort logic
    const sorted = [...paragraphs].sort((a, b) => {
      const textA = a.textContent.trim().toLowerCase();
      const textB = b.textContent.trim().toLowerCase();
      if (direction === 'asc') return textA.localeCompare(textB);
      return textB.localeCompare(textA);
    });

    // Reorder in DOM
    const fragment = document.createDocumentFragment();
    sorted.forEach(p => fragment.appendChild(p));

    // Insert back (this is a simplification; robust sorting might need more complex logic for mixed content)
    // We insert before the first paragraph's original position or append if it was last
    // But since we have the list, we can just append them in order to a fragment and replace

    // Strategy: Find the insertion point (first paragraph in the selection)
    const insertionPoint = paragraphs[0];
    const nextSibling = paragraphs[paragraphs.length - 1].nextSibling;

    sorted.forEach(p => parent.insertBefore(p, nextSibling));

    // Restore selection
    const newRange = document.createRange();
    newRange.setStartBefore(sorted[0]);
    newRange.setEndAfter(sorted[sorted.length - 1]);
    selection.removeAllRanges();
    selection.addRange(newRange);

    showNotification(`Sorted ${paragraphs.length} paragraphs`, 'success');
  }, [getSelectedParagraphs, showNotification]);

  // Apply detailed paragraph settings from dialog
  const applyParagraphSettings = useCallback((settings) => {
    focusActiveEditor();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const paragraphs = getSelectedParagraphs(range);

    paragraphs.forEach(p => {
      // Alignment
      if (settings.alignment) p.style.textAlign = settings.alignment;

      // Indentation
      if (settings.indentLeft !== undefined) p.style.marginLeft = `${settings.indentLeft}in`;
      if (settings.indentRight !== undefined) p.style.marginRight = `${settings.indentRight}in`;

      // Special Indent
      if (settings.specialIndentType === 'firstLine') {
        p.style.textIndent = `${settings.specialIndentSize}in`;
      } else if (settings.specialIndentType === 'hanging') {
        p.style.textIndent = `-${settings.specialIndentSize}in`;
        // Ensure left margin accommodates the hanging indent if not manually set larger
        const currentMargin = parseFloat(p.style.marginLeft || '0');
        if (currentMargin < settings.specialIndentSize) {
          p.style.marginLeft = `${settings.specialIndentSize}in`;
        }
      } else {
        p.style.textIndent = '0';
      }

      // Spacing
      if (settings.spacingBefore !== undefined) p.style.marginTop = `${settings.spacingBefore}pt`;
      if (settings.spacingAfter !== undefined) p.style.marginBottom = `${settings.spacingAfter}pt`;

      // Line Spacing
      if (settings.lineSpacing) {
        if (settings.lineSpacing === 'atLeast') {
          p.style.lineHeight = settings.lineSpacingAt ? `${settings.lineSpacingAt}pt` : '1.2'; // approx
        } else if (settings.lineSpacing === 'exactly') {
          p.style.lineHeight = settings.lineSpacingAt ? `${settings.lineSpacingAt}pt` : '12pt';
        } else if (settings.lineSpacing === 'multiple') {
          p.style.lineHeight = settings.lineSpacingAt || '1.2';
        } else {
          p.style.lineHeight = settings.lineSpacing;
        }
      }

      // Pagination (CSS equivalents where possible)
      if (settings.pageBreakBefore) {
        p.style.breakBefore = 'page';
      } else {
        p.style.breakBefore = 'auto';
      }
    });

    updateFormatState();
    showNotification('Paragraph settings applied', 'success');
  }, [getSelectedParagraphs, showNotification]);



  const focusActiveEditor = () => {
    try {
      if (!editorContainerRef.current) return null;
      // MSWordPagination creates multiple pages; find the active contenteditable region
      const active = editorContainerRef.current.querySelector('[contenteditable="true"]');
      if (active) {
        active.focus();
      }
      return active;
    } catch (err) {
      console.error('Error focusing active editor:', err);
      return null;
    }
  };

  const formatText = (command, value = null) => {
    focusActiveEditor();

    if (command === 'insertVideo') {
      let embedUrl = value;
      // Convert YouTube Watch URL to Embed URL
      if (value.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(new URL(value).search);
        const videoId = urlParams.get('v');
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (value.includes('youtu.be/')) {
        const videoId = value.split('youtu.be/')[1];
        if (videoId) embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (value.includes('vimeo.com')) {
        const videoId = value.split('vimeo.com/')[1];
        if (videoId) embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }

      if (embedUrl) {
        const iframeHtml = `<div class="video-wrapper" contenteditable="false" style="text-align: center; margin: 10px 0;"><iframe width="560" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border: 1px solid #ccc;"></iframe></div><p><br/></p>`;
        document.execCommand('insertHTML', false, iframeHtml);
      }
      return;
    }

    document.execCommand(command, false, value);
    updateFormatState();
  };

  const updateFormatState = () => {
    // Get font size from selection
    let currentFontSize = '12pt';
    const selection = window.getSelection();
    let paragraphComputedStyle = null;

    if (selection && selection.rangeCount > 0) {
      let node = selection.anchorNode;
      if (node && node.nodeType === 3) node = node.parentElement;

      if (node && node.nodeType === 1) {
        const computed = window.getComputedStyle(node);
        if (computed.fontSize) {
          const pxValue = parseFloat(computed.fontSize);
          // Convert to pt. Standard is 1pt = 1.333px, or 1px = 0.75pt
          const ptValue = Math.round(pxValue * 0.75);
          currentFontSize = `${ptValue}pt`;
        }

        // Find closest block element
        const blockTags = ['P', 'DIV', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'];
        let block = node;
        while (block && block.nodeType === 1 && !blockTags.includes(block.tagName)) {
          block = block.parentElement;
        }
        if (block && block.nodeType === 1) {
          paragraphComputedStyle = window.getComputedStyle(block);
        }
      }
    }

    const format = {
      fontFamily: document.queryCommandValue('fontName') || 'Georgia',
      fontSize: currentFontSize,
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
      textAlign: document.queryCommandValue('justifyLeft') ? 'left' :
        document.queryCommandValue('justifyCenter') ? 'center' :
          document.queryCommandValue('justifyRight') ? 'right' : 'left',
      spaceBefore: false,
      spaceAfter: false,
      // Border properties
      borderBottom: false,
      borderTop: false,
      borderLeft: false,
      borderRight: false,
      borderAll: false,
      borderOutside: false,
      borderInside: false,
    };

    if (paragraphComputedStyle) {
      format.spaceBefore = parseFloat(paragraphComputedStyle.marginTop) > 0;
      format.spaceAfter = parseFloat(paragraphComputedStyle.marginBottom) > 0;

      format.borderBottom = paragraphComputedStyle.borderBottomStyle !== 'none' && parseFloat(paragraphComputedStyle.borderBottomWidth) > 0;
      format.borderTop = paragraphComputedStyle.borderTopStyle !== 'none' && parseFloat(paragraphComputedStyle.borderTopWidth) > 0;
      format.borderLeft = paragraphComputedStyle.borderLeftStyle !== 'none' && parseFloat(paragraphComputedStyle.borderLeftWidth) > 0;
      format.borderRight = paragraphComputedStyle.borderRightStyle !== 'none' && parseFloat(paragraphComputedStyle.borderRightWidth) > 0;

      if (format.borderBottom && format.borderTop && format.borderLeft && format.borderRight) {
        format.borderAll = true;
        format.borderOutside = true;
      }
    }

    setCurrentFormat(format);
  };

  const applyColor = (value, isGradient = false) => {
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const contents = range.extractContents();

      // Helper to clean existing color/background styles
      const cleanNode = (node) => {
        if (node.nodeType === 1) {
          node.style.color = '';
          node.style.backgroundImage = '';
          node.style.webkitBackgroundClip = '';
          node.style.webkitTextFillColor = '';
          node.style.backgroundClip = '';

          // Recursively clean children
          const children = node.querySelectorAll('*');
          children.forEach(child => {
            child.style.color = '';
            child.style.backgroundImage = '';
            child.style.webkitBackgroundClip = '';
            child.style.webkitTextFillColor = '';
            child.style.backgroundClip = '';
          });
        }
      };

      Array.from(contents.children).forEach(cleanNode);

      const span = document.createElement('span');
      if (isGradient) {
        span.style.backgroundImage = value;
        span.style.webkitBackgroundClip = 'text';
        span.style.backgroundClip = 'text';
        span.style.webkitTextFillColor = 'transparent';
        span.style.color = 'transparent';
        span.style.display = 'inline-block';
      } else {
        span.style.color = value;
      }

      span.appendChild(contents);
      range.insertNode(span);

      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    } else {
      // No selection - apply to next typed text
      focusActiveEditor(); // Only focus when there's no selection
      const span = document.createElement('span');
      if (isGradient) {
        span.style.backgroundImage = value;
        span.style.webkitBackgroundClip = 'text';
        span.style.backgroundClip = 'text';
        span.style.webkitTextFillColor = 'transparent';
        span.style.color = 'transparent';
        span.style.display = 'inline-block';
      } else {
        span.style.color = value;
      }
      span.innerHTML = '&#8203;'; // Zero-width space

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.insertNode(span);
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    updateFormatState();
  };

  const applyHighlight = (value) => {
    // Try to get the current selection
    let selection = window.getSelection();
    let range = null;

    // If there's a valid selection with content
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      range = selection.getRangeAt(0);
    } else {
      // No valid selection, do nothing
      console.warn('No text selected for highlight');
      return;
    }

    try {
      // Extract the selected content
      const contents = range.extractContents();

      // Clean all existing background colors from element nodes
      const cleanNode = (node) => {
        if (node.nodeType === 1) { // Element node
          node.style.backgroundColor = '';
          node.style.background = '';
          // Clean all descendants
          const descendants = node.querySelectorAll('*');
          descendants.forEach(child => {
            child.style.backgroundColor = '';
            child.style.background = '';
          });
        }
      };

      // Process all child nodes (both elements and text nodes)
      Array.from(contents.childNodes).forEach(node => {
        if (node.nodeType === 1) cleanNode(node);
      });

      // Create a new span with the highlight color
      const span = document.createElement('span');
      span.style.backgroundColor = value;
      span.appendChild(contents);

      // Insert the span at the range position
      range.insertNode(span);

      // Update the selection to highlight the newly created span
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);

      console.log('Highlight applied:', value, 'to span:', span);
    } catch (error) {
      console.error('Error applying highlight:', error);
    }

    updateFormatState();
  };

  const applyFontSize = (size) => {
    focusActiveEditor();
    const selection = window.getSelection();

    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const contents = range.extractContents();

      // Helper to remove font-size from an element and its descendants
      const cleanNode = (node) => {
        if (node.nodeType === 1) { // Element node
          if (node.style && node.style.fontSize) {
            node.style.fontSize = '';
            if (node.getAttribute('style') === '') {
              node.removeAttribute('style');
            }
          }
          // Recursively clean children
          const children = node.querySelectorAll('*');
          children.forEach(child => {
            if (child.style && child.style.fontSize) {
              child.style.fontSize = '';
              if (child.getAttribute('style') === '') {
                child.removeAttribute('style');
              }
            }
          });
        }
      };

      // Clean top-level nodes in the fragment
      Array.from(contents.children).forEach(cleanNode);

      const span = document.createElement('span');
      span.style.fontSize = size;
      span.appendChild(contents);
      range.insertNode(span);

      // Update selection
      selection.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(span);
      selection.addRange(newRange);
    } else {
      // No selection, apply to next typed text
      // Use a dummy size (7 = largest standard HTML size) to create a marker
      document.execCommand('fontSize', false, '7');
      const activeEditor = focusActiveEditor();
      if (activeEditor) {
        setTimeout(() => {
          // Find the font tag/span we just created
          const fonts = activeEditor.querySelectorAll('font[size="7"], span[style*="font-size: xx-large"]');
          fonts.forEach(f => {
            const newSpan = document.createElement('span');
            newSpan.style.fontSize = size;
            // Move any content (usually empty or zero-width space)
            while (f.firstChild) newSpan.appendChild(f.firstChild);

            // If empty, add zero-width space to keep cursor inside
            if (!newSpan.hasChildNodes()) {
              newSpan.innerHTML = '&#8203;';
            }

            f.parentNode.replaceChild(newSpan, f);

            // Place cursor inside newSpan
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(newSpan);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          });
        }, 0);
      }
    }
    updateFormatState();
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

  // Insert blank page
  const insertBlankPage = () => {
    if (paginationRef.current && paginationRef.current.insertBlankPage) {
      paginationRef.current.insertBlankPage();
      showNotification('Blank Page inserted', 'success');
    }
  };

  // Cover Page Logic
  const insertCoverPage = (template) => {
    if (!paginationRef.current) return;

    // Remove existing cover page first to avoid duplicates
    removeCoverPage(true); // true = silent mode

    const content = paginationRef.current.getAllContent();
    const coverHTML = template.html;

    // Prepend new cover page with a page break
    const newContent = coverHTML + '<div style="page-break-after: always; break-after: page;"></div>' + content;

    paginationRef.current.setContent(newContent);
    // Try to update placeholders with existing meta data if available (mock logic for now)
    // In a real app, we'd parse the new content and inject documentTitle, etc.
    showNotification('Cover Page inserted', 'success');
    setCurrentPage(1);
    // Reset view to top
    window.scrollTo(0, 0);
  };

  // Track selection for robust interactions
  const savedRangeRef = useRef(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let container = range.commonAncestorContainer;
        while (container && container !== document.body) {
          if (container.classList && container.classList.contains('page-content')) {
            savedRangeRef.current = range.cloneRange();
            break;
          }
          container = container.parentNode;
        }
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const generateTableHTML = (rows, cols, isPreview = false) => {
    let style = "width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #000;";
    if (isPreview) style += " opacity: 0.7; border: 1px dashed #999; background: rgba(0,0,0,0.05); pointer-events: none;";

    let html = `<table class="${isPreview ? 'table-preview-ghost' : ''}" style="${style}"><tbody>`;
    for (let i = 0; i < rows; i++) {
      html += `<tr>`;
      for (let j = 0; j < cols; j++) {
        html += `<td style="border: 1px solid #000; padding: 5px; min-width: 50px; height: 20px;">&nbsp;</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;
    return html;
  };

  // Table Logic
  const insertTable = (config) => {
    if (!paginationRef.current) return;
    const { rows, cols } = config;
    if (!rows || !cols) return;

    previewTable(null); // Clear preview

    const tableHTML = generateTableHTML(rows, cols, false);

    let range = null;
    const selection = window.getSelection();

    // Check if current selection is valid
    if (selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).commonAncestorContainer;
      let isEditor = false;
      while (node && node !== document.body) {
        if (node.classList?.contains('page-content')) { isEditor = true; break; }
        node = node.parentNode;
      }
      if (isEditor) range = selection.getRangeAt(0);
    }

    // Fallback to saved selection
    if (!range && savedRangeRef.current) {
      range = savedRangeRef.current;
    }

    if (range) {
      // To support Undo (Ctrl+Z), we must use document.execCommand
      // First, restore the selection
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      // Use execCommand to insert HTML - this manages the undo stack automatically
      document.execCommand('insertHTML', false, tableHTML);

      // Update saved range to new position
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    } else {
      showNotification('Click inside document to insert', 'warning');
    }
  };

  const previewTable = (config) => {
    const existing = document.querySelectorAll('.table-preview-ghost');
    existing.forEach(el => el.remove());

    if (!config) return;

    const { rows, cols } = config;
    const tableHTML = generateTableHTML(rows, cols, true);

    let range = null;
    const selection = window.getSelection();

    // Check if current selection is valid (not in toolbar)
    if (selection.rangeCount > 0) {
      let node = selection.getRangeAt(0).commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentNode;

      // Explicitly ignore toolbar/popup selections
      if (!node.closest('.etb-toolbar') && !node.closest('.insert-popup') && !node.closest('.table-selector-popup')) {
        range = selection.getRangeAt(0);
      }
    }

    if (!range && savedRangeRef.current) {
      range = savedRangeRef.current;
    }

    if (range) {
      const fragment = range.createContextualFragment(tableHTML);
      const pRange = range.cloneRange();
      pRange.collapse(false);
      pRange.insertNode(fragment);
    }
  };

  const removeCoverPage = (silent = false) => {
    if (!paginationRef.current) return;
    let content = paginationRef.current.getAllContent();

    // Parse content to find existing cover page wrapper
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');

    // Find div with class 'cover-page' (all templates have this class)
    const coverPage = doc.querySelector('div[class*="cover-page"]');

    if (coverPage) {
      coverPage.remove();
      // Also look for the page break we added
      // This is a rough heuristic, removing the first page break if it's at the start might be needed
      // For now, removing the cover page element is the key step.

      paginationRef.current.setContent(doc.body.innerHTML);
      if (!silent) showNotification('Cover Page removed', 'success');
    } else {
      if (!silent) showNotification('No cover page found', 'info');
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

  // Save to IPFS function
  const handleSaveToIPFS = async () => {
    if (!paginationRef.current) {
      showNotification('Editor not ready for saving', 'error');
      return;
    }

    try {
      showNotification('Saving document to IPFS...', 'info');

      const content = paginationRef.current.getAllContent();
      const documentData = {
        title: documentTitle,
        content: content,
        createdAt: new Date().toISOString(),
        wordCount: documentStats.words,
        characterCount: documentStats.characters,
        pageCount: documentStats.pages
      };

      const cid = await saveNoteToIPFS(JSON.stringify(documentData));

      // Save to local storage for tracking
      const existingDocs = JSON.parse(localStorage.getItem('ipfsDocuments') || '[]');
      const newDoc = {
        title: documentTitle,
        cid: cid,
        savedAt: new Date().toISOString(),
        wordCount: documentStats.words,
        preview: content.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
      };

      existingDocs.unshift(newDoc);
      localStorage.setItem('ipfsDocuments', JSON.stringify(existingDocs));

      showNotification(`Document saved to IPFS! CID: ${cid}`, 'success');
    } catch (error) {
      console.error('IPFS save error:', error);
      showNotification('Failed to save to IPFS: ' + error.message, 'error');
    }
  };

  const drawTable = () => {
    showNotification('Draw Table Mode: Click to insert a 1x1 table', 'info');
    document.body.style.cursor = 'crosshair';

    // One-time click handler to simulate drawing start
    const handler = (e) => {
      // Avoid inserting if clicking on toolbar
      if (e.target.closest('.etb-toolbar')) return;

      insertTable({ rows: 1, cols: 1 });
      document.body.style.cursor = 'default';
      document.removeEventListener('click', handler);
      e.preventDefault();
      e.stopPropagation();
    };
    // Delay to avoid immediate trigger from menu click
    setTimeout(() => document.addEventListener('click', handler), 100);
  };

  const convertTextToTable = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      showNotification('Please select text to convert', 'warning');
      return;
    }

    const text = selection.toString();
    const rows = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (rows.length === 0) return;

    // Heuristic: Tab or Comma separated?
    const firstLine = rows[0];
    const tabCount = (firstLine.match(/\t/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;
    const separator = tabCount >= commaCount ? '\t' : ',';

    let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 10px 0; border: 1px solid #000;"><tbody>';
    rows.forEach(row => {
      tableHTML += '<tr>';
      const cells = row.split(separator);
      cells.forEach(cell => {
        tableHTML += `<td style="border: 1px solid #000; padding: 5px; min-width: 50px;">${cell.trim() || '&nbsp;'}</td>`;
      });
      tableHTML += '</tr>';
    });
    tableHTML += '</tbody></table>';

    const range = selection.getRangeAt(0);
    range.deleteContents();
    const fragment = range.createContextualFragment(tableHTML);
    range.insertNode(fragment);

    showNotification('Text converted to Table', 'success');
  };

  // Expose image control functions to console
  useEffect(() => {
    window.imageControls = {
      delete: () => {
        if (imageResizer.activeImage) {
          imageResizer.deleteImage(imageResizer.activeImage);
          console.log('Image deleted');
        } else {
          console.log('No image selected');
        }
      },
      alignLeft: () => {
        if (imageResizer.activeImage) {
          imageResizer.alignImage(imageResizer.activeImage, 'left');
          console.log('Image aligned left');
        } else {
          console.log('No image selected');
        }
      },
      alignRight: () => {
        if (imageResizer.activeImage) {
          imageResizer.alignImage(imageResizer.activeImage, 'right');
          console.log('Image aligned right');
        } else {
          console.log('No image selected');
        }
      },
      alignCenter: () => {
        if (imageResizer.activeImage) {
          imageResizer.alignImage(imageResizer.activeImage, 'center');
          console.log('Image aligned center');
        } else {
          console.log('No image selected');
        }
      },
      help: () => {
        console.log(`
Image Controls:
- imageControls.delete() - Delete selected image
- imageControls.alignLeft() - Align image left
- imageControls.alignRight() - Align image right
- imageControls.alignCenter() - Align image center
- imageControls.help() - Show this help

Keyboard Shortcuts:
- Delete/Backspace - Delete selected image
- Ctrl+Left Arrow - Align left
- Ctrl+Right Arrow - Align right
- Ctrl+Up Arrow - Align center`);
      }
    };

    console.log('Image controls available! Type imageControls.help() for commands');

    return () => {
      delete window.imageControls;
    };
  }, []);

  const applyStyle = useCallback((styleType) => {
    focusActiveEditor();
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const style = definedStyles[styleType];

    if (!style) {
      showNotification(`Style '${styleType}' not found`, 'error');
      return;
    }

    // Determine if it's a block style (heading, paragraph, quote) or inline
    const isBlock = ['heading1', 'heading2', 'heading3', 'heading4', 'title', 'subtitle', 'paragraph', 'body', 'quote', 'intenseQuote', 'listParagraph'].includes(styleType);

    if (isBlock) {
      // Apply block formatting
      let tag = 'p';
      if (styleType.startsWith('heading')) tag = 'h' + styleType.slice(-1);
      if (styleType === 'title') tag = 'h1';
      if (styleType === 'subtitle') tag = 'h2';
      if (styleType.includes('quote')) tag = 'blockquote';

      document.execCommand('formatBlock', false, tag);

      // Get the element to apply styles to
      const range = selection.getRangeAt(0);
      let node = range.commonAncestorContainer;
      if (node.nodeType === 3) node = node.parentElement;

      // Climb up to find the block element we just formatted
      const blockTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DIV', 'PRE'];
      while (node && !blockTags.includes(node.tagName) && !node.classList.contains('page-content')) {
        node = node.parentElement;
      }

      if (node) {
        // Clear existing inline styles that might conflict
        node.removeAttribute('style');

        // Apply new styles
        Object.entries(style).forEach(([key, value]) => {
          node.style[key] = value;
        });
      }
    } else {
      // Inline style application (strong, emphasis, etc.)
      const span = document.createElement('span');
      Object.entries(style).forEach(([key, value]) => {
        span.style[key] = value;
      });

      const range = selection.getRangeAt(0);
      try {
        range.surroundContents(span);
      } catch (e) {
        // Fallback for complex selections
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
      }
    }

    updateFormatState();
    showNotification(`Applied style: ${styleType}`, 'success');
  }, [showNotification, definedStyles, focusActiveEditor, updateFormatState]);

  // Format Painter: apply stored styles on next selection click
  useEffect(() => {
    const handleMouseUp = () => {
      if (!formatPainterStyleRef.current) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      try {
        const span = document.createElement('span');
        const style = formatPainterStyleRef.current;
        Object.assign(span.style, style);
        range.surroundContents(span);
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      } catch (e) {
        console.warn('Format painter apply failed:', e);
      }
      if (!formatPainterMultiRef.current) {
        formatPainterStyleRef.current = null;
      }
    };

    const container = editorContainerRef.current;
    if (container) {
      container.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      if (container) {
        container.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, []);

  // Deselect text boxes when clicking on the document content
  useEffect(() => {
    const handleDocumentClick = (e) => {
      // Import the singleton instance dynamically to ensure we get the same one
      import('../utils/textBoxEngine').then(module => {
        const textBoxEngine = module.default;
        // Check if click is outside any text box
        if (!e.target.closest('.etherx-textbox')) {
          textBoxEngine.deselectAll();
        }
      });
    };

    const container = document.querySelector('.editor-container');
    if (container) {
      container.addEventListener('mousedown', handleDocumentClick);
    }

    return () => {
      if (container) {
        container.removeEventListener('mousedown', handleDocumentClick);
      }
    };
  }, []);


  return (
    <div className={`editor-container ${isFullscreen ? 'fullscreen' : ''} ${showFormattingMarks ? 'show-formatting-marks' : ''}`}>
      {/* Navbar */}
      <nav className="editor-navbar">
        <div className="navbar-left">
          <button className="nav-btn" onClick={() => navigate('/')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', transition: 'opacity 0.3s ease' }} onMouseEnter={(e) => e.target.style.opacity = '0.7'} onMouseLeave={(e) => e.target.style.opacity = '1'}>
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
          <button
            onClick={handleSaveToIPFS}
            className="nav-btn save-btn-unique"
            title="Save to IPFS"
            style={{
              background: 'var(--accent-color, #ffcf40)',
              color: '#000',
              fontWeight: '600',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              marginRight: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            <i className="ri-save-line" style={{ marginRight: '4px' }}></i>
            Save
          </button>
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
            availableStyles={definedStyles}
            onApply={(cmd, value) => {
              console.log('DocumentEditor onApply received:', cmd, value);
              console.log('Command type:', typeof cmd, 'Command value:', JSON.stringify(cmd));
              console.log('📍 CHECKPOINT 1: Starting command processing');

              // HANDLE SELECT ALL FIRST - before any other logic
              if (cmd === 'selectAll') {
                console.log('🎯 SELECT ALL HANDLER TRIGGERED AT TOP');
                // Custom selectAll - only select content within the editable document area
                const pageContent = document.querySelector('.page-content');
                if (pageContent) {
                  const selection = window.getSelection();
                  const range = document.createRange();
                  range.selectNodeContents(pageContent);
                  selection.removeAllRanges();
                  selection.addRange(range);
                  console.log('✅ Selected all content in page-content');
                } else {
                  console.warn('⚠️ No page-content found');
                }
                return; // Exit early, don't process further
              }

              // HANDLE INSERT EQUATION - Add early in chain
              if (cmd === 'insertEquation') {
                console.log('✅ insertEquation handler reached! value:', value);
                const activePage = document.querySelector('.page-content[contenteditable="true"]:focus') ||
                  document.querySelector('.page-content[contenteditable="true"]');

                if (activePage) {
                  const div = document.createElement('div');
                  div.className = 'math-zone';
                  div.style.cssText = 'display: block; text-align: center; margin: 12px 0; font-family: "Cambria Math", "Latin Modern Math", serif; font-size: 18px; padding: 5px; cursor: default; color: #000;';
                  div.contentEditable = "false";

                  if (value) {
                    div.textContent = value;
                  } else {
                    div.textContent = 'Type equation here.';
                    div.style.color = '#999';
                  }

                  // Insert at selection
                  const selection = window.getSelection();
                  if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    if (activePage.contains(range.commonAncestorContainer)) {
                      range.deleteContents();
                      range.insertNode(div);

                      const p = document.createElement('p');
                      p.innerHTML = '<br>';
                      range.setStartAfter(div);
                      range.insertNode(p);

                      range.setStart(p, 0);
                      selection.removeAllRanges();
                      selection.addRange(range);
                    } else {
                      activePage.appendChild(div);
                    }
                  } else {
                    activePage.appendChild(div);
                  }
                  console.log('✅ Equation inserted successfully!');
                  showNotification('Equation inserted', 'success');
                }
                return; // Exit early
              }

              const mappingToFormat = ['bold', 'italic', 'underline', 'fontName', 'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'];

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
              } else if (cmd === 'showHelp') {
                window.open('https://docs.etherxword.com', '_blank');
              } else if (cmd === 'contactSupport') {
                window.open('mailto:support@etherxword.com?subject=EtherXWord Support Request', '_blank');
              } else if (cmd === 'sendFeedback') {
                window.open('mailto:feedback@etherxword.com?subject=EtherXWord Feedback', '_blank');
              } else if (cmd === 'keyboardShortcuts') {
                alert('Keyboard Shortcuts:\n\nCtrl+B - Bold\nCtrl+I - Italic\nCtrl+U - Underline\nCtrl+Z - Undo\nCtrl+Y - Redo\nCtrl+C - Copy\nCtrl+V - Paste\nCtrl+X - Cut\nCtrl+A - Select All\nCtrl+F - Find\nCtrl+S - Save\nCtrl+P - Print');
              } else if (cmd === 'whatsNew') {
                alert('What\'s New in EtherXWord:\n\n• Enhanced text alignment tools\n• Improved image insertion and editing\n• Better header/footer configuration\n• New drawing tools\n• Enhanced collaboration features\n• Performance improvements');
              } else if (cmd === 'insertCoverPage') {
                insertCoverPage(value);
              } else if (cmd === 'removeCoverPage') {
                removeCoverPage();
              } else if (cmd === 'insertPageBreak') {
                insertPageBreak();
              } else if (cmd === 'insertBlankPage') {
                insertBlankPage();
              } else if (cmd === 'insertTable') {
                insertTable(value);
              } else if (cmd === 'previewTable') {
                previewTable(value);
              } else if (cmd === 'drawTable') {
                drawTable();
              } else if (cmd === 'convertTextToTable') {
                convertTextToTable();
              } else if (cmd === 'insertImage') {
                // ... handled below or if needed
              } else if (cmd === 'showFormattingMarks') {
                toggleFormattingMarks();
              } else if (cmd === 'sortParagraphs') {
                sortParagraphs(value);
              } else if (cmd === 'paragraphSettings') {
                applyParagraphSettings(value);
              } else if (cmd === 'paragraphSettings') {
                applyParagraphSettings(value);
              } else if (cmd === 'addSpaceBefore') {
                focusActiveEditor();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  let node = selection.anchorNode;
                  if (node && node.nodeType === 3) node = node.parentElement;
                  while (node && node.nodeType === 1 && window.getComputedStyle(node).display === 'inline') {
                    node = node.parentElement;
                  }
                  if (node && node.nodeType === 1) {
                    node.style.marginTop = '12pt';
                    updateFormatState();
                  }
                }
              } else if (cmd === 'removeSpaceBefore') {
                focusActiveEditor();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  let node = selection.anchorNode;
                  if (node && node.nodeType === 3) node = node.parentElement;
                  while (node && node.nodeType === 1 && window.getComputedStyle(node).display === 'inline') {
                    node = node.parentElement;
                  }
                  if (node && node.nodeType === 1) {
                    node.style.marginTop = '0';
                    updateFormatState();
                  }
                }
              } else if (cmd === 'addSpaceAfter') {
                focusActiveEditor();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  let node = selection.anchorNode;
                  if (node && node.nodeType === 3) node = node.parentElement;
                  while (node && node.nodeType === 1 && window.getComputedStyle(node).display === 'inline') {
                    node = node.parentElement;
                  }
                  if (node && node.nodeType === 1) {
                    node.style.marginBottom = '12pt';
                    updateFormatState();
                  }
                }
              } else if (cmd === 'removeSpaceAfter') {
                focusActiveEditor();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  let node = selection.anchorNode;
                  if (node && node.nodeType === 3) node = node.parentElement;
                  while (node && node.nodeType === 1 && window.getComputedStyle(node).display === 'inline') {
                    node = node.parentElement;
                  }
                  if (node && node.nodeType === 1) {
                    node.style.marginBottom = '0';
                    updateFormatState();
                  }
                }
              } else if (cmd === 'insertImageFile') {
                if (value && paginationRef.current && paginationRef.current.pages.length > 0) {
                  // Get the current page or default to first page
                  const pageIndex = paginationRef.current.currentPageIndex || 0;
                  const currentPage = paginationRef.current.pages[pageIndex];

                  if (currentPage && currentPage.content) {
                    imageResizer.insertImage(value, currentPage.content)
                      .then(() => {
                        showNotification('Image inserted successfully! Click to select and use controls.', 'success');
                        setTimeout(() => {
                          if (paginationRef.current) {
                            paginationRef.current.updateStats();
                          }
                        }, 100);
                      })
                      .catch(error => {
                        console.error('Image insertion error:', error);
                        showNotification('Failed to insert image: ' + error.message, 'error');
                      });
                  } else {
                    showNotification('Editor not ready. Please try again.', 'error');
                  }
                } else {
                  showNotification('Editor not initialized. Please try again.', 'error');
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
                    // Ensure URL has protocol
                    let url = value.url;
                    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
                      url = 'https://' + url;
                    }
                    const linkHTML = `<a href="${url}" target="_blank" rel="noopener noreferrer">${value.text || value.url}</a>`;
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
              } else if (cmd === 'insertShape_DISABLED') {
                const svgContent = getShapeSVG(value);
                if (svgContent) {
                  // Convert SVG to Data URI for better compatibility with contenteditable resizing
                  const encoded = btoa(unescape(encodeURIComponent(svgContent)));
                  const dataUri = `data:image/svg+xml;base64,${encoded}`;
                  document.execCommand('insertImage', false, dataUri);
                  showNotification('Shape inserted', 'success');

                  // Try to select the inserted image to show resize handles immediately
                  setTimeout(() => {
                    const images = document.querySelectorAll('.page-content img');
                    if (images.length > 0) {
                      // Activate the last inserted image
                      const lastImage = images[images.length - 1];
                      if (window.imageControls && window.imageControls.select) {
                        window.imageControls.select(lastImage);
                      } else {
                        // Fallback if imageControls not exposed or different API
                        lastImage.click();
                      }
                    }
                  }, 100);
                }
              } else if (cmd === 'insertImage') {
                const url = window.prompt('Image URL');
                if (url) document.execCommand('insertImage', false, url);
              } else if (cmd === 'refresh') {
                if (confirm('Refresh document? Any unsaved changes will be lost.')) {
                  window.location.reload();
                }
              } else if (cmd === 'cut') {
                focusActiveEditor();
                document.execCommand('cut');
              } else if (cmd === 'copy') {
                focusActiveEditor();
                document.execCommand('copy');
              } else if (cmd === 'pasteDefault') {
                // Default paste – let the browser decide, closest to Word's normal paste
                focusActiveEditor();
                try {
                  document.execCommand('paste');
                } catch (e) {
                  if (navigator.clipboard && navigator.clipboard.readText) {
                    navigator.clipboard.readText().then(text => {
                      document.execCommand('insertText', false, text);
                    }).catch(err => console.warn('Clipboard read failed:', err));
                  }
                }
              } else if (cmd === 'pasteKeepFormatting') {
                // Try to keep as much original formatting as the browser exposes (HTML)
                focusActiveEditor();
                const insertHtml = (html) => {
                  try {
                    document.execCommand('insertHTML', false, html);
                  } catch (e) {
                    // Fallback: strip tags and insert text
                    const tmp = document.createElement('div');
                    tmp.innerHTML = html;
                    const text = tmp.textContent || tmp.innerText || '';
                    document.execCommand('insertText', false, text);
                  }
                };

                if (navigator.clipboard && navigator.clipboard.read) {
                  navigator.clipboard.read().then(items => {
                    for (const item of items) {
                      if (item.types.includes('text/html')) {
                        return item.getType('text/html').then(blob => blob.text()).then(insertHtml);
                      }
                    }
                    // No HTML available, fall back to plain text
                    if (navigator.clipboard.readText) {
                      return navigator.clipboard.readText().then(text => {
                        document.execCommand('insertText', false, text);
                      });
                    }
                  }).catch(err => {
                    console.warn('Clipboard read() failed, falling back to text:', err);
                    if (navigator.clipboard && navigator.clipboard.readText) {
                      navigator.clipboard.readText().then(text => {
                        document.execCommand('insertText', false, text);
                      });
                    }
                  });
                } else if (navigator.clipboard && navigator.clipboard.readText) {
                  navigator.clipboard.readText().then(text => {
                    document.execCommand('insertText', false, text);
                  });
                }
              } else if (cmd === 'pasteMergeFormatting' || cmd === 'pasteTextOnly') {
                // Plain-text paste – merges into destination formatting like Word's Keep Text Only
                focusActiveEditor();
                if (navigator.clipboard && navigator.clipboard.readText) {
                  navigator.clipboard.readText().then(text => {
                    document.execCommand('insertText', false, text);
                  }).catch(err => console.warn('Clipboard read failed:', err));
                }
              } else if (cmd === 'pasteSpecial') {
                // Limited Paste Special: always paste as plain text and inform the user
                focusActiveEditor();
                if (navigator.clipboard && navigator.clipboard.readText) {
                  navigator.clipboard.readText().then(text => {
                    document.execCommand('insertText', false, text);
                    showNotification('Pasted as plain text (web editors cannot fully replicate Word\'s Paste Special).', 'info');
                  }).catch(err => console.warn('Clipboard read failed:', err));
                }
              } else if (cmd === 'formatPainter') {
                // value: 'single' or 'multi'
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                  const node = selection.anchorNode.nodeType === 3
                    ? selection.anchorNode.parentElement
                    : selection.anchorNode;
                  if (node && node.nodeType === 1) {
                    const cs = window.getComputedStyle(node);
                    formatPainterStyleRef.current = {
                      fontWeight: cs.fontWeight,
                      fontStyle: cs.fontStyle,
                      textDecoration: cs.textDecoration,
                      fontSize: cs.fontSize,
                      color: cs.color,
                      backgroundColor: cs.backgroundColor
                    };
                    formatPainterMultiRef.current = value === 'multi';
                    showNotification(value === 'multi'
                      ? 'Format Painter (multi-use) active. Select text to apply formatting repeatedly.'
                      : 'Format Painter active. Select text to apply formatting.', 'info');
                  }
                }
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
                console.log('=== UNDO COMMAND ===');
                // Focus the active page-content first
                const activeEditor = document.querySelector('.page-content:focus') || document.querySelector('.page-content');
                console.log('Active editor:', activeEditor);
                if (activeEditor) {
                  activeEditor.focus();
                  console.log('Editor focused, executing undo...');
                  try {
                    const result = document.execCommand('undo');
                    console.log('Undo result:', result);
                  } catch (e) {
                    console.error('Undo failed:', e);
                  }
                } else {
                  console.error('No active editor found for undo');
                }
              } else if (cmd === 'redo') {
                console.log('=== REDO COMMAND ===');
                // Focus the active page-content first
                const activeEditor = document.querySelector('.page-content:focus') || document.querySelector('.page-content');
                console.log('Active editor:', activeEditor);
                if (activeEditor) {
                  activeEditor.focus();
                  console.log('Editor focused, executing redo...');
                  try {
                    const result = document.execCommand('redo');
                    console.log('Redo result:', result);
                  } catch (e) {
                    console.error('Redo failed:', e);
                  }
                } else {
                  console.error('No active editor found for redo');
                }
              } else if (cmd === 'indent') {
                increaseIndent();
              } else if (cmd === 'outdent') {
                decreaseIndent();
              } else if (cmd === 'bulletStyleDisc') {
                applyBullets('disc');
              } else if (cmd === 'bulletStyleCircle') {
                applyBullets('circle');
              } else if (cmd === 'bulletStyleSquare') {
                applyBullets('square');
              } else if (cmd === 'bulletStyleDiamond') {
                applyBullets('❖');
              } else if (cmd === 'bulletStyleArrow') {
                applyBullets('➢');
              } else if (cmd === 'bulletStyleCheck') {
                applyBullets('✓');
              } else if (cmd.startsWith('numberingStyle')) {
                // Map numbering styles to CSS list-style-type
                let format = 'decimal';
                if (cmd === 'numberingStyle123') format = 'decimal';
                else if (cmd === 'numberingStyleParen') format = 'decimal'; // Will be handled by CSS counters
                else if (cmd === 'numberingStyleRoman') format = 'upper-roman';
                else if (cmd === 'numberingStyleAlphaUpper') format = 'upper-alpha';
                else if (cmd === 'numberingStyleAlphaLower') format = 'lower-alpha';
                else if (cmd === 'numberingStyleAlphaParen') format = 'lower-alpha'; // Will be handled by CSS counters
                else if (cmd === 'numberingStyleRomanLower') format = 'lower-roman';

                applyNumbering(format, cmd);
              } else if (cmd.startsWith('multilevelStyle')) {
                applyMultilevelList(cmd);
              } else if (cmd === 'backColor') {
                // This block seems to be incomplete or malformed in the instruction.
                // Assuming it should be a new command handler.
                // For now, I'll leave it as an empty block to maintain syntactical correctness
                // based on the provided partial instruction.
                // If the intention was to replace 'createNestedBullet', please clarify.
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
              } else if (cmd === 'headerFooter') {
                if (value && paginationRef.current) {
                  try {
                    paginationRef.current.setHeaderFooter(value);
                    showNotification('Header and footer applied successfully!', 'success');
                  } catch (error) {
                    console.error('Header/Footer error:', error);
                    showNotification('Failed to apply header/footer: ' + error.message, 'error');
                  }
                }
              } else if (cmd === 'insertPageNumber') {
                if (value && paginationRef.current) {
                  try {
                    // Map the page number settings to header/footer config
                    const { template, format, position, style } = value;

                    // Determine if it's header or footer based on category
                    const isHeader = template?.id?.startsWith('top-');
                    const isFooter = template?.id?.startsWith('bottom-');
                    const isMargin = template?.id?.startsWith('margin-');
                    const isCurrent = template?.id?.startsWith('current-');

                    if (isHeader || isFooter) {
                      // Determine the template style and create appropriate format
                      const templateId = template?.id || '';
                      let pageNumberFormat = '{n}'; // Default format

                      // Apply template-specific formatting
                      if (templateId.includes('brackets')) {
                        pageNumberFormat = '[{n}]';
                      } else if (templateId.includes('accent')) {
                        pageNumberFormat = '▌{n}▐';
                      } else if (templateId.includes('banded')) {
                        pageNumberFormat = '━━ {n} ━━';
                      } else if (templateId.includes('circle')) {
                        pageNumberFormat = '⊙ {n} ⊙';
                      } else if (templateId.includes('bold')) {
                        pageNumberFormat = '{n}'; // Will be styled with CSS
                      } else if (templateId.includes('line')) {
                        if (position === 'left') pageNumberFormat = '{n} ─';
                        else if (position === 'right') pageNumberFormat = '─ {n}';
                        else pageNumberFormat = '─ {n} ─';
                      } else if (templateId.includes('modern')) {
                        pageNumberFormat = '• {n} •';
                      } else if (templateId.includes('stack')) {
                        pageNumberFormat = '⎯⎯⎯ {n} ⎯⎯⎯';
                      } else if (templateId.includes('tiles')) {
                        pageNumberFormat = '▪ {n} ▪';
                      } else if (templateId.includes('large')) {
                        pageNumberFormat = '{n}'; // Will use larger font
                      } else if (templateId.includes('xofy')) {
                        pageNumberFormat = 'Page {n} of {total}';
                      }

                      // Insert into header or footer
                      const config = {
                        headerText: '',
                        headerAlignment: isHeader ? (position || 'center') : 'left',
                        footerText: '',
                        footerAlignment: isFooter ? (position || 'center') : 'left',
                        borderType: 'none',
                        borderColor: '#000000',
                        borderWidth: '1px',
                        pageNumbers: {
                          enabled: true,
                          type: format || 'arabic',
                          position: isHeader ? `header-${position || 'center'}` : `footer-${position || 'center'}`,
                          format: pageNumberFormat,
                          templateStyle: templateId
                        }
                      };
                      paginationRef.current.setHeaderFooter(config);
                      showNotification('Page number inserted successfully!', 'success');
                    } else if (isMargin) {
                      // For margins, we'd need special handling - for now show info
                      showNotification('Page margin numbers will be implemented in next update', 'info');
                    } else if (isCurrent) {
                      // Insert at current cursor position
                      const pageNumText = template?.format?.replace('{PAGE}', '1').replace('{NUMPAGES}', '10') || '1';
                      document.execCommand('insertText', false, pageNumText);
                      showNotification('Page number inserted at cursor position', 'success');
                    }
                  } catch (error) {
                    console.error('Page number insertion error:', error);
                    showNotification('Failed to insert page number: ' + error.message, 'error');
                  }
                }
              } else if (cmd === 'formatPageNumbers') {
                if (value && paginationRef.current) {
                  try {
                    // Update page number format in existing header/footer
                    // Get current header/footer config and update with new format
                    const currentConfig = paginationRef.current.headerFooterConfig;

                    if (!currentConfig || !currentConfig.pageNumbers || !currentConfig.pageNumbers.enabled) {
                      showNotification('Please insert page numbers first before formatting', 'warning');
                      return;
                    }


                    // Determine new position based on value.position or keep current
                    const currentPosition = currentConfig.pageNumbers.position || 'footer-center';
                    const isHeader = currentPosition.startsWith('header');
                    const newAlignment = value.position || currentPosition.split('-')[1] || 'center';
                    const newPosition = isHeader ? `header-${newAlignment}` : `footer-${newAlignment}`;

                    const updatedConfig = {
                      headerText: currentConfig.headerText || '',
                      headerAlignment: isHeader ? newAlignment : (currentConfig.headerAlignment || 'left'),
                      footerText: currentConfig.footerText || '',
                      footerAlignment: !isHeader ? newAlignment : (currentConfig.footerAlignment || 'left'),
                      borderType: currentConfig.borderType || 'none',
                      borderColor: currentConfig.borderColor || '#000000',
                      borderWidth: currentConfig.borderWidth || '1px',
                      pageNumbers: {
                        enabled: true,
                        type: value.format || 'arabic',
                        position: newPosition,
                        format: currentConfig.pageNumbers.format || '{n}',
                        templateStyle: currentConfig.pageNumbers.templateStyle || ''
                      }
                    };

                    paginationRef.current.setHeaderFooter(updatedConfig);
                    showNotification('Page number format updated successfully!', 'success');
                  } catch (error) {
                    console.error('Format page numbers error:', error);
                    showNotification('Failed to format page numbers: ' + error.message, 'error');
                  }
                }
              } else if (cmd === 'removePageNumbers') {
                if (paginationRef.current) {
                  try {
                    // Remove page numbers by clearing header/footer
                    const config = {
                      headerText: '',
                      headerAlignment: 'left',
                      footerText: '',
                      pageNumbers: { enabled: false }
                    };
                    paginationRef.current.setHeaderFooter(config);
                    showNotification('Page numbers removed successfully!', 'success');
                  } catch (error) {
                    console.error('Remove page numbers error:', error);
                    showNotification('Failed to remove page numbers: ' + error.message, 'error');
                  }
                }
              } else if (cmd === 'insertTextBox') {
                if (value && value.template) {
                  try {
                    // Import TextBoxEngine dynamically
                    import('../utils/textBoxEngine').then(module => {
                      const textBoxEngine = module.default;

                      // Get the editor container using ref
                      const editorContainer = editorContainerRef.current;
                      if (!editorContainer) {
                        showNotification('Editor container not found', 'error');
                        return;
                      }

                      // Create text box at center of viewport
                      const viewportCenter = {
                        x: window.innerWidth / 2 - 100,
                        y: window.scrollY + 200
                      };

                      const textBox = textBoxEngine.createTextBoxElement(value.template, viewportCenter);
                      editorContainer.appendChild(textBox);
                      textBoxEngine.selectTextBox(textBox);

                      showNotification(`${value.template.name} inserted successfully!`, 'success');
                    });
                  } catch (error) {
                    console.error('Insert text box error:', error);
                    showNotification('Failed to insert text box: ' + error.message, 'error');
                  }
                }
              } else if (cmd === 'drawTextBox') {
                try {
                  import('../utils/textBoxEngine').then(module => {
                    const textBoxEngine = module.default;

                    const editorContainer = editorContainerRef.current;
                    if (!editorContainer) {
                      showNotification('Editor container not found', 'error');
                      return;
                    }

                    textBoxEngine.enableDrawingMode(editorContainer);
                    showNotification('Click and drag to draw a text box', 'info');
                  });
                } catch (error) {
                  console.error('Draw text box error:', error);
                  showNotification('Failed to enable drawing mode: ' + error.message, 'error');
                }
              } else if (cmd === 'saveTextBoxToGallery') {
                try {
                  import('../utils/textBoxEngine').then(module => {
                    const textBoxEngine = module.default;

                    if (!textBoxEngine.activeTextBox) {
                      showNotification('Please select a text box first', 'warning');
                      return;
                    }

                    // Extract template from selected text box
                    const customTemplate = {
                      id: `custom-${Date.now()}`,
                      name: 'Custom Text Box',
                      category: 'simple',
                      type: 'box',
                      style: {
                        border: {
                          width: textBoxEngine.activeTextBox.style.borderWidth || '1pt',
                          color: textBoxEngine.activeTextBox.style.borderColor || '#000000',
                          style: textBoxEngine.activeTextBox.style.borderStyle || 'solid'
                        },
                        fill: textBoxEngine.activeTextBox.style.background || 'none',
                        shadow: textBoxEngine.activeTextBox.style.boxShadow || 'none',
                        width: textBoxEngine.activeTextBox.style.width,
                        height: textBoxEngine.activeTextBox.style.height,
                        minHeight: textBoxEngine.activeTextBox.style.minHeight || '100px',
                        padding: textBoxEngine.activeTextBox.style.padding || '10px',
                        borderRadius: textBoxEngine.activeTextBox.style.borderRadius || '0px'
                      },
                      text: {
                        font: textBoxEngine.activeTextBox.style.fontFamily || 'Calibri',
                        size: textBoxEngine.activeTextBox.style.fontSize || '11pt',
                        alignment: textBoxEngine.activeTextBox.style.textAlign || 'left',
                        color: textBoxEngine.activeTextBox.style.color || '#000000',
                        lineHeight: textBoxEngine.activeTextBox.style.lineHeight || '1.5'
                      },
                      position: {
                        wrapping: 'square',
                        zIndex: 1000
                      }
                    };

                    // Save to localStorage
                    const customBoxes = JSON.parse(localStorage.getItem('customTextBoxes') || '[]');
                    customBoxes.push(customTemplate);
                    localStorage.setItem('customTextBoxes', JSON.stringify(customBoxes));

                    showNotification('Text box saved to gallery!', 'success');
                  });
                } catch (error) {
                  console.error('Save text box error:', error);
                  showNotification('Failed to save text box: ' + error.message, 'error');
                }
              } else if (cmd === 'previewTable') {
                previewTable(value);
              } else if (cmd === 'drawTable') {
                drawTable();
              } else if (cmd === 'convertTextToTable') {
                convertTextToTable();
              } else if (cmd === 'insertImage') {
                const styleName = value;
                if (!styleName) return;

                focusActiveEditor();
                const selection = window.getSelection();
              } else if (cmd === 'applyTextStyle') {
                applyStyle(value);
              } else if (cmd === 'createStyle') {
                const styleName = value;
                if (!styleName) return;

                focusActiveEditor();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const node = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentElement : selection.anchorNode;
                  const computed = window.getComputedStyle(node);

                  const newStyle = {
                    fontFamily: computed.fontFamily,
                    fontSize: computed.fontSize,
                    fontWeight: computed.fontWeight,
                    fontStyle: computed.fontStyle,
                    textDecoration: computed.textDecoration,
                    color: computed.color,
                    backgroundColor: computed.backgroundColor !== 'rgba(0, 0, 0, 0)' ? computed.backgroundColor : undefined,
                    textAlign: computed.textAlign,
                    marginBottom: computed.marginBottom,
                    marginTop: computed.marginTop,
                    lineHeight: computed.lineHeight
                  };

                  Object.keys(newStyle).forEach(key => newStyle[key] === undefined && delete newStyle[key]);

                  setDefinedStyles(prev => ({
                    ...prev,
                    [styleName]: newStyle
                  }));

                  showNotification(`Style '${styleName}' created`, 'success');
                }
              } else if (cmd === 'removeFormat') {
                focusActiveEditor();
                document.execCommand('removeFormat');

                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const root = range.commonAncestorContainer.nodeType === 1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
                  if (root) {
                    const blocks = [];
                    if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI', 'BLOCKQUOTE'].includes(root.tagName)) {
                      blocks.push(root);
                    } else {
                      let p = root.closest('p, h1, h2, h3, h4, h5, h6, div, li, blockquote');
                      if (p) blocks.push(p);
                    }

                    blocks.forEach(block => {
                      block.removeAttribute('style');
                      block.className = '';
                      if (block.tagName.match(/^H[1-6]$/)) {
                        document.execCommand('formatBlock', false, 'p');
                      }
                    });
                  }
                }
                updateFormatState();
                showNotification('Formatting cleared', 'success');
              } else if (cmd === 'increaseFontSize') {
                const nextSize = getNextFontSize('up');
                applyFontSize(nextSize);
              } else if (cmd === 'decreaseFontSize') {
                const nextSize = getNextFontSize('down');
                applyFontSize(nextSize);
              } else if (cmd === 'fontSize') {
                applyFontSize(value);
              } else if (cmd === 'changeCase') {
                // Change case for current selection
                if (!value) return;
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
                const text = selection.toString();
                let transformed = text;
                const toSentenceCase = (str) => {
                  const lower = str.toLowerCase();
                  return lower.replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase());
                };
                const toCapitalize = (str) =>
                  str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
                if (value === 'lower') transformed = text.toLowerCase();
                else if (value === 'upper') transformed = text.toUpperCase();
                else if (value === 'sentence') transformed = toSentenceCase(text);
                else if (value === 'capitalize') transformed = toCapitalize(text);
                else if (value === 'toggle') {
                  transformed = Array.from(text)
                    .map(ch =>
                      ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase()
                    ).join('');
                }
                document.execCommand('insertText', false, transformed);
              } else if (cmd === 'lineHeight') {
                // Basic line-spacing control for selected block(s)
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const root = range.commonAncestorContainer.nodeType === 1
                  ? range.commonAncestorContainer
                  : range.commonAncestorContainer.parentElement;
                if (!root) return;
                const blocks = root.querySelectorAll('p, li, div');
                const lh = parseFloat(value) || 1.15;
                blocks.forEach(node => {
                  node.style.lineHeight = lh;
                });
              } else if (cmd === 'addSpaceBefore') {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const root = range.commonAncestorContainer.nodeType === 1
                  ? range.commonAncestorContainer
                  : range.commonAncestorContainer.parentElement;
                if (!root) return;
                const blocks = root.querySelectorAll('p, li, div');
                blocks.forEach(node => {
                  const current = parseFloat(window.getComputedStyle(node).marginTop) || 0;
                  node.style.marginTop = `${current + 4}px`;
                });
              } else if (cmd === 'removeSpaceAfter') {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const root = range.commonAncestorContainer.nodeType === 1
                  ? range.commonAncestorContainer
                  : range.commonAncestorContainer.parentElement;
                if (!root) return;
                const blocks = root.querySelectorAll('p, li, div');
                blocks.forEach(node => {
                  node.style.marginBottom = '0px';
                });
              } else if (cmd === 'paragraphShading') {
                console.log('=== SHADING COMMAND === Color:', value);

                // Get the currently focused page-content
                let pageContent = document.querySelector('.page-content:focus');

                // If no focused page-content, try to find one with selection
                if (!pageContent) {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    pageContent = range.commonAncestorContainer.closest?.('.page-content');
                    if (!pageContent && range.commonAncestorContainer.parentElement) {
                      pageContent = range.commonAncestorContainer.parentElement.closest('.page-content');
                    }
                  }
                }

                // If still no page-content, use the first one
                if (!pageContent) {
                  pageContent = document.querySelector('.page-content');
                  console.log('Using first page-content');
                }

                if (!pageContent) {
                  console.log('ERROR: No page-content found');
                  return;
                }

                console.log('Found page-content');

                // Get selection
                const selection = window.getSelection();
                let targetParagraph = null;

                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  let node = range.commonAncestorContainer;

                  // If it's a text node, get the parent element
                  if (node.nodeType === 3) {
                    node = node.parentElement;
                  }

                  // Find the closest PARAGRAPH element (not DIV!)
                  const paragraphTags = ['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'];
                  while (node && node !== pageContent) {
                    if (paragraphTags.includes(node.tagName)) {
                      targetParagraph = node;
                      break;
                    }
                    node = node.parentElement;
                  }
                }

                // If no paragraph found, check if page has any paragraphs
                if (!targetParagraph) {
                  // Try to find any existing paragraph in the page
                  const existingP = pageContent.querySelector('p');
                  if (existingP) {
                    // Use the existing paragraph
                    targetParagraph = existingP;
                    console.log('Using existing paragraph');
                  } else {
                    // Only create new paragraph if page is completely empty
                    console.log('Page is empty, creating new P element');
                    const p = document.createElement('p');
                    p.innerHTML = '&nbsp;'; // Just a space, user can type
                    p.style.minHeight = '1.5em';
                    p.style.margin = '0';
                    p.style.padding = '4px 8px';

                    // Append to page-content
                    pageContent.appendChild(p);
                    targetParagraph = p;

                    // Place cursor in the new paragraph
                    setTimeout(() => {
                      const newRange = document.createRange();
                      newRange.setStart(p, 0);
                      newRange.collapse(true);
                      selection.removeAllRanges();
                      selection.addRange(newRange);
                      pageContent.focus();
                    }, 10);
                  }
                }

                // Apply the color - ONLY to P elements, never to DIV
                if (targetParagraph && targetParagraph.tagName !== 'DIV') {
                  console.log('Applying color to paragraph:', targetParagraph.tagName);
                  if (value === 'transparent' || value === 'none') {
                    targetParagraph.style.backgroundColor = 'transparent';
                  } else {
                    targetParagraph.style.backgroundColor = value;
                  }
                  console.log('✓ Color applied:', targetParagraph.style.backgroundColor);
                  console.log('✓ Element:', targetParagraph);
                } else {
                  console.log('ERROR: Invalid target (DIV or null)');
                }

              } else if (cmd === 'changeTheme') {
                // Apply theme settings from Change Styles dialog
                console.log('Applying theme:', value);

                const { styleSet, colors, fonts, spacing, styleSetDefinition, colorTheme, isPreview } = value;

                // Debug logging
                console.log('=== CHANGE THEME DEBUG ===');
                console.log('styleSet:', styleSet);
                console.log('colors:', colors);
                console.log('fonts:', fonts);
                console.log('spacing:', spacing);
                console.log('styleSetDefinition:', styleSetDefinition);
                console.log('colorTheme:', colorTheme);
                console.log('isPreview:', isPreview);

                // Check pages exist
                const pageCheck = document.querySelectorAll('.page-content');
                console.log('Pages found:', pageCheck.length);

                // DIAGNOSTIC: Check what's actually in the document
                if (pageCheck.length > 0) {
                  pageCheck.forEach((page, idx) => {
                    console.log(`Page ${idx} HTML:`, page.innerHTML.substring(0, 200));
                    console.log(`Page ${idx} text content:`, page.textContent.substring(0, 100));
                    console.log(`Page ${idx} children:`, page.children.length);

                    // Check for any text nodes
                    const allElements = page.querySelectorAll('*');
                    console.log(`Page ${idx} total elements:`, allElements.length);
                  });
                }

                // Apply fonts to document
                if (fonts) {
                  console.log('>>> Applying fonts:', fonts);
                  const fontThemes = {
                    'Office': { heading: 'Calibri Light', body: 'Calibri' },
                    'Office 2': { heading: 'Calibri', body: 'Cambria' },
                    'Office Classic': { heading: 'Arial', body: 'Times New Roman' },
                    'Office Classic 2': { heading: 'Arial', body: 'Arial' },
                    'Adjacency': { heading: 'Cambria', body: 'Calibri' },
                    'Angles': { heading: 'Franklin Gothic Medium', body: 'Franklin Gothic Book' },
                    'Apex': { heading: 'Lucida Sans', body: 'Book Antiqua' },
                    'Apothecary': { heading: 'Book Antiqua', body: 'Century Gothic' },
                    'Aspect': { heading: 'Verdana', body: 'Verdana' },
                    'Austin': { heading: 'Century Gothic', body: 'Century Gothic' }
                  };

                  const theme = fontThemes[fonts];
                  if (theme) {
                    console.log('Font theme found:', theme);
                    // Apply to all pages
                    const pages = document.querySelectorAll('.page-content');
                    console.log(`Applying fonts to ${pages.length} pages`);
                    pages.forEach(page => {
                      // Apply body font to paragraphs
                      const paragraphs = page.querySelectorAll('p, li, div');
                      console.log(`  Found ${paragraphs.length} body elements`);
                      paragraphs.forEach(p => {
                        if (!p.closest('h1, h2, h3, h4, h5, h6')) {
                          p.style.fontFamily = theme.body;
                        }
                      });

                      // Apply heading font to headings
                      const headings = page.querySelectorAll('h1, h2, h3, h4, h5, h6');
                      console.log(`  Found ${headings.length} headings`);
                      headings.forEach(h => {
                        h.style.fontFamily = theme.heading;
                      });
                    });
                  } else {
                    console.warn('Font theme not found:', fonts);
                  }
                }

                // Apply paragraph spacing
                if (spacing) {
                  const spacingOptions = {
                    '0': { value: '0', lineHeight: '1' },
                    '4pt': { value: '4pt', lineHeight: '1' },
                    '6pt': { value: '6pt', lineHeight: '1.15' },
                    '10pt': { value: '10pt', lineHeight: '1.15' },
                    '8pt': { value: '8pt', lineHeight: '1.5' },
                    '2': { value: '8pt', lineHeight: '2' }
                  };

                  const spacingConfig = spacingOptions[spacing];
                  if (spacingConfig) {
                    const pages = document.querySelectorAll('.page-content');
                    pages.forEach(page => {
                      const paragraphs = page.querySelectorAll('p');
                      paragraphs.forEach(p => {
                        p.style.marginBottom = spacingConfig.value;
                        p.style.lineHeight = spacingConfig.lineHeight;
                      });
                    });
                  }
                }

                // Apply Style Set (heading and body styles)
                if (styleSetDefinition) {
                  console.log('>>> Applying style set:', styleSetDefinition);
                  const pages = document.querySelectorAll('.page-content');
                  console.log(`Applying style set to ${pages.length} pages`);
                  pages.forEach(page => {
                    // Apply to H1 headings
                    const h1s = page.querySelectorAll('h1');
                    console.log(`  Found ${h1s.length} H1 elements`);
                    h1s.forEach(h => {
                      if (styleSetDefinition.heading1) {
                        Object.entries(styleSetDefinition.heading1).forEach(([key, val]) => {
                          h.style[key] = val;
                        });
                      }
                    });

                    // Apply to H2 headings
                    const h2s = page.querySelectorAll('h2');
                    console.log(`  Found ${h2s.length} H2 elements`);
                    h2s.forEach(h => {
                      if (styleSetDefinition.heading2) {
                        Object.entries(styleSetDefinition.heading2).forEach(([key, val]) => {
                          h.style[key] = val;
                        });
                      }
                    });

                    // Apply to body text
                    const paragraphs = page.querySelectorAll('p');
                    console.log(`  Found ${paragraphs.length} paragraphs`);
                    paragraphs.forEach(p => {
                      if (styleSetDefinition.body) {
                        Object.entries(styleSetDefinition.body).forEach(([key, val]) => {
                          p.style[key] = val;
                        });
                      }
                    });
                  });
                }

                // Apply Color Theme
                if (colorTheme && colorTheme.colors) {
                  console.log('>>> Applying color theme:', colorTheme);
                  const pages = document.querySelectorAll('.page-content');
                  const primaryColor = colorTheme.colors[0];
                  const accentColor = colorTheme.colors[4];
                  console.log(`Applying colors to ${pages.length} pages (primary: ${primaryColor}, accent: ${accentColor})`);

                  pages.forEach(page => {
                    // Apply primary color to headings
                    const headings = page.querySelectorAll('h1, h2, h3, h4, h5, h6');
                    console.log(`  Found ${headings.length} headings for color`);
                    headings.forEach(h => {
                      h.style.color = primaryColor;
                    });

                    // Apply accent color to links
                    const links = page.querySelectorAll('a');
                    console.log(`  Found ${links.length} links for color`);
                    links.forEach(link => {
                      link.style.color = accentColor;
                    });

                    // FALLBACK: If no headings found, apply color to ALL text in the page
                    if (headings.length === 0) {
                      console.log('  No headings found - applying color to page content directly');
                      page.style.color = primaryColor;

                      // Also try to apply to any text elements
                      const allTextElements = page.querySelectorAll('p, div, span, li');
                      console.log(`  Applying to ${allTextElements.length} text elements as fallback`);
                      allTextElements.forEach(el => {
                        el.style.color = primaryColor;
                      });
                    }
                  });
                }

                // Show ONE notification only when actually applying (not preview)
                // Debounce to prevent duplicate notifications
                if (!isPreview) {
                  const now = Date.now();
                  const lastTime = window.lastChangeThemeNotification || 0;

                  if (now - lastTime > 1000) { // Only show if more than 1 second has passed
                    let message = 'Theme applied';
                    if (styleSet) message = `Applied theme: ${styleSet}`;
                    else if (colors) message = `Applied color theme: ${colors}`;
                    else if (fonts) message = `Applied font theme: ${fonts}`;
                    showNotification(message, 'success');
                    window.lastChangeThemeNotification = now;
                  }
                }


              } else if (cmd === 'paragraphBorders') {
                console.log('=== BORDERS COMMAND === Type:', value);

                // Get the currently focused page-content
                let pageContent = document.querySelector('.page-content:focus');

                if (!pageContent) {
                  const selection = window.getSelection();
                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    pageContent = range.commonAncestorContainer.closest?.('.page-content');
                    if (!pageContent && range.commonAncestorContainer.parentElement) {
                      pageContent = range.commonAncestorContainer.parentElement.closest('.page-content');
                    }
                  }
                }

                if (!pageContent) {
                  pageContent = document.querySelector('.page-content');
                }

                if (!pageContent) {
                  console.log('ERROR: No page-content found');
                  return;
                }

                // Get selection
                const selection = window.getSelection();
                const borderStyle = window.currentBorderStyle || '1px solid #000';
                console.log('DocumentEditor borderStyle:', borderStyle);

                // Check if there's actual text selected
                const hasTextSelection = selection && selection.rangeCount > 0 && !selection.isCollapsed;

                if (hasTextSelection) {
                  // Apply border to selected text
                  console.log('Applying border to selected text');
                  const range = selection.getRangeAt(0);

                  // Check if selection is already wrapped in a span with borders
                  let existingSpan = null;
                  let node = range.commonAncestorContainer;
                  if (node.nodeType === 3) node = node.parentElement;

                  // Traverse up to find if we are inside a bordered span
                  while (node && node.nodeType === 1) {
                    if (node.classList.contains('page-content')) break;

                    if (node.tagName === 'SPAN' && (node.style.border || node.style.borderTop || node.style.borderBottom || node.style.borderLeft || node.style.borderRight)) {
                      existingSpan = node;
                      break;
                    }
                    node = node.parentElement;
                  }

                  if (existingSpan) {
                    // Toggle logic using ComputedStyle for accuracy
                    const computedStyle = window.getComputedStyle(existingSpan);
                    const s = existingSpan.style;
                    let remove = false;

                    if (value === 'bottom' && parseFloat(computedStyle.borderBottomWidth) > 0) remove = true;
                    else if (value === 'top' && parseFloat(computedStyle.borderTopWidth) > 0) remove = true;
                    else if (value === 'left' && parseFloat(computedStyle.borderLeftWidth) > 0) remove = true;
                    else if (value === 'right' && parseFloat(computedStyle.borderRightWidth) > 0) remove = true;
                    else if ((value === 'all' || value === 'outside') && parseFloat(computedStyle.borderWidth) > 0) remove = true;
                    else if (value === 'none') remove = true;

                    if (remove) {
                      if (value === 'bottom') s.borderBottom = 'none';
                      else if (value === 'top') s.borderTop = 'none';
                      else if (value === 'left') s.borderLeft = 'none';
                      else if (value === 'right') s.borderRight = 'none';
                      else if (value === 'all' || value === 'outside' || value === 'none') {
                        s.border = 'none'; s.borderTop = 'none'; s.borderBottom = 'none'; s.borderLeft = 'none'; s.borderRight = 'none';
                      }
                      console.log('✓ Toggled OFF border');

                      // Unwrap if no borders left
                      if ((!s.borderTop || s.borderTop === 'none') &&
                        (!s.borderBottom || s.borderBottom === 'none') &&
                        (!s.borderLeft || s.borderLeft === 'none') &&
                        (!s.borderRight || s.borderRight === 'none') &&
                        (!s.border || s.border === 'none')) {

                        const parent = existingSpan.parentNode;
                        while (existingSpan.firstChild) parent.insertBefore(existingSpan.firstChild, existingSpan);
                        parent.removeChild(existingSpan);
                      }
                    } else {
                      if (value === 'bottom') s.borderBottom = borderStyle;
                      else if (value === 'top') s.borderTop = borderStyle;
                      else if (value === 'left') s.borderLeft = borderStyle;
                      else if (value === 'right') s.borderRight = borderStyle;
                      else if (value === 'all' || value === 'outside') s.border = borderStyle;
                      console.log('✓ Toggled ON border');
                    }
                  } else {
                    // Create new span
                    if (value !== 'none') {
                      const span = document.createElement('span');
                      span.style.display = 'inline-block';
                      span.style.padding = '2px 4px';

                      if (value === 'bottom') span.style.borderBottom = borderStyle;
                      else if (value === 'top') span.style.borderTop = borderStyle;
                      else if (value === 'left') span.style.borderLeft = borderStyle;
                      else if (value === 'right') span.style.borderRight = borderStyle;
                      else if (value === 'all' || value === 'outside') span.style.border = borderStyle;

                      try {
                        range.surroundContents(span);
                        console.log('✓ Applied new border');
                      } catch (e) {
                        const fragment = range.extractContents();
                        span.appendChild(fragment);
                        range.insertNode(span);
                      }
                    }
                  }

                } else {
                  // Paragraph selection logic
                  console.log('No text selected, applying to paragraphs');
                  const paragraphs = [];

                  if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    let node = range.commonAncestorContainer;

                    if (node.nodeType === 3) {
                      node = node.parentElement;
                    }

                    // Find all selected paragraphs
                    const paragraphTags = ['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE'];

                    // If we're in a single paragraph
                    while (node && node !== pageContent) {
                      if (paragraphTags.includes(node.tagName)) {
                        paragraphs.push(node);
                        break;
                      }
                      node = node.parentElement;
                    }

                    // If selection spans multiple paragraphs
                    if (paragraphs.length === 0) {
                      const allPs = pageContent.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote');
                      allPs.forEach(p => {
                        if (selection.containsNode(p, true)) {
                          paragraphs.push(p);
                        }
                      });
                    }
                  }

                  // If no paragraphs found, find or create one
                  if (paragraphs.length === 0) {
                    const existingP = pageContent.querySelector('p');
                    if (existingP) {
                      paragraphs.push(existingP);
                    } else {
                      const p = document.createElement('p');
                      p.innerHTML = '&nbsp;';
                      pageContent.appendChild(p);
                      paragraphs.push(p);
                    }
                  }

                  console.log('Found paragraphs:', paragraphs.length);

                  // Border style is already defined above from window.currentBorderStyle

                  // Apply borders based on type
                  if (value === 'none') {
                    // Remove all borders
                    paragraphs.forEach(p => {
                      p.style.border = 'none';
                      p.style.borderTop = 'none';
                      p.style.borderBottom = 'none';
                      p.style.borderLeft = 'none';
                      p.style.borderRight = 'none';
                    });
                    console.log('✓ Removed all borders');

                  } else if (value === 'bottom') {
                    paragraphs.forEach(p => {
                      const cs = window.getComputedStyle(p);
                      const hasBorder = parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none';
                      const currentBorder = p.style.borderBottom;
                      if (hasBorder && currentBorder === borderStyle) {
                        p.style.borderBottom = 'none';
                      } else {
                        p.style.borderBottom = borderStyle;
                        p.style.paddingBottom = '2px';
                      }
                    });
                    console.log('✓ Toggled bottom border');

                  } else if (value === 'top') {
                    paragraphs.forEach(p => {
                      const cs = window.getComputedStyle(p);
                      const hasBorder = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';
                      const currentBorder = p.style.borderTop;

                      // Only toggle off if the exact same border style is being applied
                      if (hasBorder && currentBorder === borderStyle) {
                        p.style.borderTop = 'none';
                      } else {
                        // Apply new border style (replace existing or add new)
                        console.log('BEFORE setting border - borderStyle:', borderStyle);
                        p.style.borderTop = borderStyle;
                        console.log('AFTER setting border - p.style.borderTop:', p.style.borderTop);
                        console.log('COMPUTED border:', window.getComputedStyle(p).border);
                        p.style.paddingTop = '2px';
                      }
                    });
                    console.log('✓ Toggled top border');

                  } else if (value === 'left') {
                    paragraphs.forEach(p => {
                      const cs = window.getComputedStyle(p);
                      const hasBorder = parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none';
                      const currentBorder = p.style.borderLeft;
                      if (hasBorder && currentBorder === borderStyle) {
                        p.style.borderLeft = 'none';
                      } else {
                        p.style.borderLeft = borderStyle;
                        p.style.paddingLeft = '8px';
                      }
                    });
                    console.log('✓ Toggled left border');

                  } else if (value === 'right') {
                    paragraphs.forEach(p => {
                      const cs = window.getComputedStyle(p);
                      const hasBorder = parseFloat(cs.borderRightWidth) > 0 && cs.borderRightStyle !== 'none';
                      const currentBorder = p.style.borderRight;
                      if (hasBorder && currentBorder === borderStyle) {
                        p.style.borderRight = 'none';
                      } else {
                        p.style.borderRight = borderStyle;
                        p.style.paddingRight = '8px';
                      }
                    });
                    console.log('✓ Toggled right border');

                  } else if (value === 'all') {
                    // Toggle all borders
                    paragraphs.forEach(p => {
                      const cs = window.getComputedStyle(p);
                      const hasAll = (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') &&
                        (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none') &&
                        (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== 'none') &&
                        (parseFloat(cs.borderRightWidth) > 0 && cs.borderRightStyle !== 'none');

                      if (hasAll) {
                        p.style.border = 'none';
                        p.style.borderTop = 'none'; p.style.borderBottom = 'none'; p.style.borderLeft = 'none'; p.style.borderRight = 'none';
                      } else {
                        p.style.border = borderStyle;
                        p.style.padding = '4px 8px';
                        p.style.marginBottom = '4px';
                      }
                    });
                    console.log('✓ Toggled all borders');

                  } else if (value === 'outside') {
                    const firstP = paragraphs[0];
                    const cs = window.getComputedStyle(firstP);
                    const hasBorder = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none';

                    if (hasBorder) {
                      paragraphs.forEach(p => {
                        p.style.border = 'none';
                        p.style.borderTop = 'none'; p.style.borderBottom = 'none'; p.style.borderLeft = 'none'; p.style.borderRight = 'none';
                      });
                    } else {
                      if (paragraphs.length === 1) {
                        firstP.style.border = borderStyle;
                        firstP.style.padding = '4px 8px';
                      } else {
                        paragraphs.forEach((p, index) => {
                          p.style.borderLeft = borderStyle;
                          p.style.borderRight = borderStyle;
                          p.style.paddingLeft = '8px';
                          p.style.paddingRight = '8px';

                          if (index === 0) {
                            p.style.borderTop = borderStyle;
                            p.style.paddingTop = '4px';
                          } else {
                            p.style.borderTop = 'none';
                          }

                          if (index === paragraphs.length - 1) {
                            p.style.borderBottom = borderStyle;
                            p.style.paddingBottom = '4px';
                          } else {
                            p.style.borderBottom = 'none';
                          }
                        });
                      }
                    }
                    console.log('✓ Toggled outside border');

                  } else if (value === 'inside') {
                    if (paragraphs.length > 1) {
                      const firstP = paragraphs[0];
                      const cs = window.getComputedStyle(firstP);
                      const hasInside = parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none';

                      paragraphs.forEach((p, index) => {
                        if (index < paragraphs.length - 1) {
                          if (hasInside) {
                            p.style.borderBottom = 'none';
                          } else {
                            p.style.borderBottom = borderStyle;
                            p.style.paddingBottom = '4px';
                            p.style.marginBottom = '4px';
                          }
                        }
                      });
                      console.log('✓ Toggled inside borders');
                    } else {
                      console.log('Inside borders require multiple paragraphs');
                    }
                  }
                }
              } else if (cmd === 'sortParagraphs') {
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const root = range.commonAncestorContainer.nodeType === 1
                  ? range.commonAncestorContainer
                  : range.commonAncestorContainer.parentElement;
                if (!root) return;
                const paragraphs = Array.from(root.querySelectorAll('p'));
                if (paragraphs.length === 0) return;
                const parent = paragraphs[0].parentNode;
                const sorted = [...paragraphs].sort((a, b) => {
                  const ta = (a.textContent || '').trim().toLowerCase();
                  const tb = (b.textContent || '').trim().toLowerCase();
                  if (value === 'desc') return tb.localeCompare(ta);
                  return ta.localeCompare(tb);
                });
                sorted.forEach(p => parent.appendChild(p));
              } else if (cmd === 'textEffect') {
                // Apply simple text effects using inline styles on a span wrapper
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');

                const applyPreset = (preset) => {
                  switch (preset) {
                    case 'preset-blue':
                      span.style.color = '#1f4e79';
                      break;
                    case 'preset-red':
                      span.style.color = '#c0504d';
                      break;
                    case 'preset-green':
                      span.style.color = '#9bbb59';
                      break;
                    case 'preset-purple':
                      span.style.color = '#8064a2';
                      break;
                    case 'preset-orange':
                      span.style.color = '#f79646';
                      break;
                    case 'preset-black':
                      span.style.color = '#000000';
                      break;
                    case 'preset-blueGlow':
                      span.style.color = '#1f4e79';
                      span.style.textShadow = '0 0 4px rgba(31,78,121,0.9)';
                      break;
                    case 'preset-whiteOutline':
                      span.style.color = '#ffffff';
                      span.style.textShadow = '-1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000';
                      break;
                    case 'preset-orangeGlow':
                      span.style.color = '#f79646';
                      span.style.textShadow = '0 0 4px rgba(247,150,70,0.8)';
                      break;
                    case 'preset-greenGlow':
                      span.style.color = '#9bbb59';
                      span.style.textShadow = '0 0 4px rgba(155,187,89,0.8)';
                      break;
                    case 'preset-purpleGlow':
                      span.style.color = '#8064a2';
                      span.style.textShadow = '0 0 4px rgba(128,100,162,0.8)';
                      break;
                    case 'preset-blackGlow':
                      span.style.color = '#000000';
                      span.style.textShadow = '0 0 4px rgba(0,0,0,0.8)';
                      break;
                    default:
                      break;
                  }
                };

                if (value === 'shadow' || value === 'shadow-slight') {
                  span.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
                } else if (value === 'shadow-outer') {
                  span.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
                } else if (value === 'outline' || value === 'outline-thin') {
                  span.style.textShadow =
                    '-0.5px 0 #000, 0 0.5px #000, 0.5px 0 #000, 0 -0.5px #000';
                } else if (value === 'outline-thick') {
                  span.style.textShadow =
                    '-1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000';
                } else if (value === 'glow' || value === 'glow-small') {
                  span.style.textShadow = '0 0 4px rgba(255,215,0,0.9)';
                } else if (value === 'glow-strong') {
                  span.style.textShadow = '0 0 8px rgba(255,215,0,1)';
                } else if (typeof value === 'string' && value.startsWith('preset-')) {
                  applyPreset(value);
                }

                if (value === 'clear') {
                  // Remove any direct textShadow / color from selected nodes
                  const contents = range.cloneContents();
                  const walker = document.createTreeWalker(contents, NodeFilter.SHOW_ELEMENT);
                  while (walker.nextNode()) {
                    if (walker.currentNode.style) {
                      walker.currentNode.style.textShadow = '';
                      walker.currentNode.style.color = '';
                    }
                  }
                  range.deleteContents();
                  range.insertNode(contents);
                } else {
                  try {
                    span.appendChild(range.extractContents());
                    range.insertNode(span);
                  } catch (e) {
                    console.warn('textEffect apply failed', e);
                  }
                }
              } else if (cmd === 'showFormattingMarks') {
                if (editorContainerRef.current) {
                  editorContainerRef.current.classList.toggle('show-formatting-marks');
                }
              } else if (cmd === 'margins') {
                // Apply margin changes to all pages
                if (paginationRef.current && paginationRef.current.pages) {
                  paginationRef.current.pages.forEach(page => {
                    if (page.content) {
                      page.content.style.padding = '1in';
                    }
                  });
                  showNotification('Margins applied', 'success');
                } else {
                  showNotification('Editor not ready', 'error');
                }
              } else if (cmd === 'orientation') {
                // Toggle between portrait and landscape
                if (paginationRef.current && paginationRef.current.pages) {
                  const currentOrientation = paginationRef.current.orientation || 'portrait';
                  const newOrientation = currentOrientation === 'portrait' ? 'landscape' : 'portrait';
                  paginationRef.current.pages.forEach(page => {
                    if (page.element) {
                      page.element.style.width = newOrientation === 'portrait' ? '8.5in' : '11in';
                      page.element.style.height = newOrientation === 'portrait' ? '11in' : '8.5in';
                    }
                  });
                  paginationRef.current.orientation = newOrientation;
                  showNotification(`Orientation changed to ${newOrientation}`, 'success');
                } else {
                  showNotification('Editor not ready', 'error');
                }
              } else if (cmd === 'size') {
                // Page size options (Letter, A4, Legal, etc.)
                showNotification('Page size options - feature coming soon!', 'info');
              } else if (cmd === 'break') {
                // Insert page break
                insertPageBreak();
                showNotification('Page break inserted', 'success');
              } else if (cmd === 'lineNumber') {
                // Toggle line numbers on/off
                if (editorContainerRef.current) {
                  editorContainerRef.current.classList.toggle('show-line-numbers');
                  const isShowing = editorContainerRef.current.classList.contains('show-line-numbers');
                  showNotification(`Line numbers ${isShowing ? 'enabled' : 'disabled'}`, 'success');
                }
              } else if (cmd === 'leftIndentOptions') {
                applyIndentation('left', value || 0.5);
              } else if (cmd === 'rightIndentOptions') {
                applyIndentation('right', value || 0.5);
              } else if (cmd === 'spacingBefore') {
                // Apply spacing before paragraphs
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const root = range.commonAncestorContainer.nodeType === 1
                  ? range.commonAncestorContainer
                  : range.commonAncestorContainer.parentElement;
                if (root) {
                  const blocks = root.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6');
                  blocks.forEach(node => {
                    node.style.marginTop = `${value}pt`;
                  });
                  showNotification(`Spacing before set to ${value}pt`, 'success');
                }
              } else if (cmd === 'spacingAfter') {
                // Apply spacing after paragraphs
                const selection = window.getSelection();
                if (!selection || selection.rangeCount === 0) return;
                const range = selection.getRangeAt(0);
                const root = range.commonAncestorContainer.nodeType === 1
                  ? range.commonAncestorContainer
                  : range.commonAncestorContainer.parentElement;
                if (root) {
                  const blocks = root.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6');
                  blocks.forEach(node => {
                    node.style.marginBottom = `${value}pt`;
                  });
                  showNotification(`Spacing after set to ${value}pt`, 'success');
                }
              } else if (cmd === 'pageBorder') {
                // Apply border to all pages
                if (paginationRef.current && paginationRef.current.pages) {
                  paginationRef.current.pages.forEach(page => {
                    if (page.element) {
                      const borderStyle = `2px ${value} #000`;
                      page.element.style.border = borderStyle;
                    }
                  });
                  showNotification(`Page border applied: ${value}`, 'success');
                } else {
                  showNotification('Editor not ready', 'error');
                }
              } else if (cmd === 'pageBackgroundColor') {
                // Apply background color to all pages
                if (paginationRef.current && paginationRef.current.pages) {
                  paginationRef.current.pages.forEach(page => {
                    if (page.element) {
                      page.element.style.backgroundColor = value;
                    }
                  });
                  showNotification('Page color applied', 'success');
                } else {
                  showNotification('Editor not ready', 'error');
                }
              } else if (mappingToFormat.includes(cmd)) {
                formatText(cmd, value);
              } else if (cmd === 'foreColor') {
                applyColor(value, false);
              } else if (cmd === 'textGradient') {
                applyColor(value, true);
              } else if (cmd.startsWith('bulletStyle')) {
                focusActiveEditor();
                document.execCommand('insertUnorderedList', false, null);
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const node = selection.anchorNode;
                  const listNode = node.nodeType === 1 ? node.closest('ul') : node.parentElement.closest('ul');
                  if (listNode) {
                    const style = cmd.replace('bulletStyle', '').toLowerCase();
                    listNode.style.listStyleType = style;
                  }
                }
              } else if (cmd.startsWith('numberingStyle')) {
                focusActiveEditor();
                document.execCommand('insertOrderedList', false, null);
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const node = selection.anchorNode;
                  const listNode = node.nodeType === 1 ? node.closest('ol') : node.parentElement.closest('ol');
                  if (listNode) {
                    const styleMap = {
                      '123': 'decimal',
                      'Paren': 'decimal', // CSS doesn't fully support '1)' without pseudo-elements, fallback to decimal
                      'Roman': 'upper-roman',
                      'AlphaUpper': 'upper-alpha',
                      'AlphaLower': 'lower-alpha',
                      'AlphaParen': 'lower-alpha' // Fallback
                    };
                    const styleKey = cmd.replace('numberingStyle', '');
                    listNode.style.listStyleType = styleMap[styleKey] || 'decimal';
                  }
                }
              } else if (cmd.startsWith('multilevelStyle')) {
                // Basic implementation for multilevel - just insert a list for now
                // True multilevel requires complex DOM manipulation or CSS counters
                focusActiveEditor();
                document.execCommand('insertOrderedList', false, null);
              } else if (cmd === 'backColor') {
                applyHighlight(value);
              } else if (cmd === 'paragraphShading') {
                applyParagraphShading(value || 'rgba(255,215,0,0.12)');
              } else if (cmd === 'applyTextStyle') {
                applyStyle(value);
              } else if (cmd === 'selectAll') {
                console.log('🎯 REACHED selectAll HANDLER - cmd is:', cmd);
                console.log('>>> CUSTOM SELECT ALL HANDLER TRIGGERED <<<');
                // Custom selectAll - only select content within the editable document area
                // First try to find contenteditable element
                let targetElement = document.querySelector('[contenteditable="true"]');
                console.log('Found contenteditable:', targetElement);

                // If not found, try to find the page-content
                if (!targetElement) {
                  targetElement = document.querySelector('.page-content');
                  console.log('Found page-content:', targetElement);
                }

                // If still not found, try the editor container
                if (!targetElement && editorContainerRef.current) {
                  targetElement = editorContainerRef.current.querySelector('.page-content, [contenteditable="true"]');
                  console.log('Found in editor container:', targetElement);
                }

                if (targetElement) {
                  console.log('Selecting content in:', targetElement);
                  const selection = window.getSelection();
                  const range = document.createRange();
                  range.selectNodeContents(targetElement);
                  selection.removeAllRanges();
                  selection.addRange(range);
                  console.log('✓ Selected all content in editable area');
                } else {
                  console.warn('⚠ No editable content found for selectAll');
                  // Fallback to default behavior but only within editor
                  focusActiveEditor();
                  document.execCommand('selectAll', false, null);
                }
              } else if (cmd === 'insertCoverPage') {
                const coverPageHtml = `<div class="cover-page" style="page-break-after: always; text-align: center; padding: 2in 1in; min-height: 800px; display: flex; flex-direction: column; justify-content: center;">
                  <h1 style="font-size: 48pt; margin-bottom: 24pt; color: #2f5496;">${documentTitle || 'Document Title'}</h1>
                  <h2 style="font-size: 24pt; color: #555; margin-bottom: 48pt;">Subtitle</h2>
                  <div style="margin-top: auto;">
                    <p style="font-size: 14pt;"><strong>Author:</strong> User</p>
                    <p style="font-size: 14pt;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  </div>
                </div>`;
                document.execCommand('insertHTML', false, coverPageHtml);
                showNotification('Cover Page inserted', 'success');
              } else if (cmd === 'insertBlankPage') {
                document.execCommand('insertHTML', false, '<div style="page-break-after: always;">&nbsp;</div>');
                showNotification('Blank Page inserted', 'success');
              } else if (cmd === 'insertTable') {
                const { rows, cols } = value || { rows: 2, cols: 2 };
                let tableHtml = '<table style="border-collapse: collapse; width: 100%; border: 1px solid #000; margin: 10px 0;"><tbody>';
                for (let i = 0; i < rows; i++) {
                  tableHtml += '<tr>';
                  for (let j = 0; j < cols; j++) {
                    tableHtml += '<td style="border: 1px solid #000; padding: 8px; min-width: 50px;">&nbsp;</td>';
                  }
                  tableHtml += '</tr>';
                }
                tableHtml += '</tbody></table><p>&nbsp;</p>';
                document.execCommand('insertHTML', false, tableHtml);
                showNotification('Table inserted', 'success');
              } else if (cmd === 'insertImage') {
                if (value && value instanceof File) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    document.execCommand('insertImage', false, e.target.result);
                  };
                  reader.readAsDataURL(value);
                }
              } else if (cmd === 'insertShape') {
                setActiveShapeTool(value);
                showNotification(`Draw a ${value} on the canvas`, 'info');
                // Cursor will change via CSS based on activeShapeTool
              } else if (cmd === 'insertIcon') {
                document.execCommand('insertHTML', false, `<span style="font-size: 24pt; margin: 0 5px;">${value || '★'}</span>`);
              } else if (cmd === 'insertLink') {
                const { url, text } = value;
                document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" style="color:#0563c1; text-decoration:underline;">${text || url}</a>`);
              } else if (cmd === 'insertBookmark') {
                const name = value; // bookmark name
                // Insert a hidden anchor
                document.execCommand('insertHTML', false, `<a name="${name}" title="Bookmark: ${name}"></a>`);
                setBookmarks(prev => [...new Set([...prev, name])]); // Add to list, no duplicates
                showNotification(`Bookmark '${name}' added`, 'success');
              } else if (cmd === 'goToBookmark') {
                const name = value; // bookmark name
                const editor = document.querySelector('.multi-page-editor'); // Scope to editor
                if (editor) {
                  const anchor = editor.querySelector(`a[name="${name}"]`);
                  if (anchor) {
                    anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // derived selection
                    const range = document.createRange();
                    range.selectNode(anchor);
                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);
                  } else {
                    showNotification(`Bookmark '${name}' not found`, 'warning');
                  }
                }
              } else if (cmd === 'insertSymbol') {
                document.execCommand('insertText', false, value);
              } else if (cmd === 'insertEquation') {
                document.execCommand('insertHTML', false, '<span class="equation" style="font-style: italic; background: #f0f0f0; padding: 2px 5px; border: 1px dotted #ccc;">Equation...</span>');
                showNotification('Equation placeholder inserted', 'info');
              } else if (cmd === 'insertVideo') {
                // Try to embed youtube
                let embedUrl = value;
                if (value.includes('youtube.com') || value.includes('youtu.be')) {
                  const videoId = value.split('v=')[1]?.split('&')[0] || value.split('/').pop();
                  embedUrl = `https://www.youtube.com/embed/${videoId}`;
                }
                const iframe = `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="max-width: 100%;"></iframe>`;
                document.execCommand('insertHTML', false, iframe);
              } else if (cmd === 'insertDrawing') {
                // value is dataURL
                document.execCommand('insertImage', false, value);
              } else if (cmd === 'insertTextBox') {
                document.execCommand('insertHTML', false, '<div style="display: inline-block; border: 1px solid #000; padding: 10px; min-width: 150px; background: #fff;">Text Box</div>');
              } else if (cmd === 'insertWordArt') {
                // Determine active page
                const activePage = document.querySelector('.page-content[contenteditable="true"]:focus') ||
                  document.querySelector('.page-content[contenteditable="true"]');

                if (activePage) {
                  // Insert WordArt via Engine
                  const wordArtBox = textBoxEngine.insertWordArt(value);
                  // Append to the Page Wrapper (editor-page) to allow placement in margins
                  const pageWrapper = activePage.parentElement;
                  if (pageWrapper && pageWrapper.classList.contains('editor-page')) {
                    pageWrapper.appendChild(wordArtBox);
                  } else {
                    activePage.appendChild(wordArtBox);
                  }

                  textBoxEngine.selectTextBox(wordArtBox);
                  showNotification('WordArt inserted', 'success');
                } else {
                  showNotification('Please click on a page first', 'warning');
                }
              } else if (cmd === 'insertQuickPart') {
                document.execCommand('insertHTML', false, '<span style="background: #e0e0e0; padding: 2px;">[Quick Part]</span>');
              } else if (cmd === 'toggleDropCap') {
                showNotification('Drop Cap applied (Simulated)', 'info');
              } else if (cmd === 'dropCap') {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  let paragraph = range.commonAncestorContainer;
                  // Traverse up to find paragraph block
                  while (paragraph && paragraph.nodeName !== 'P' && paragraph.nodeName !== 'DIV' && !paragraph.classList?.contains('page-content')) {
                    paragraph = paragraph.parentNode;
                  }

                  if (paragraph && paragraph.classList?.contains('page-content')) {
                    // If we hit page-content directly, we might not be in a paragraph, maybe find first child?
                    // Use anchor node parent for better precision
                    paragraph = selection.anchorNode.nodeType === 3 ? selection.anchorNode.parentNode : selection.anchorNode;
                    if (paragraph.nodeName !== 'P' && paragraph.nodeName !== 'DIV') {
                      // Create a paragraph if bare text?
                      // For now, abort if not in block
                      return;
                    }
                  }

                  if (paragraph && (paragraph.nodeName === 'P' || paragraph.nodeName === 'DIV')) {
                    // Parse settings
                    let type = 'none';
                    let lines = 3;
                    let distance = 0;
                    let font = 'Times New Roman';

                    if (typeof value === 'object') {
                      type = value.type || 'none';
                      lines = value.lines || 3;
                      distance = value.distance || 0;
                      font = value.font || 'Times New Roman';
                    } else {
                      type = value;
                    }

                    // Remove existing drop cap
                    const existing = paragraph.querySelector('.drop-cap');
                    if (existing) {
                      const capText = existing.innerText;
                      existing.replaceWith(capText);
                      paragraph.normalize();
                    }

                    if (type === 'none') {
                      return;
                    }

                    // Apply new Drop Cap
                    let walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT, null, false);
                    let firstTextNode = walker.nextNode();

                    if (firstTextNode && firstTextNode.textContent.trim().length > 0) {
                      const fullText = firstTextNode.textContent;
                      const firstChar = fullText.trim().charAt(0);
                      const firstCharIndex = fullText.indexOf(firstChar);

                      if (firstCharIndex > -1) {
                        const splitText = firstTextNode.splitText(firstCharIndex + 1);
                        const charNode = firstTextNode;

                        const span = document.createElement('span');
                        span.className = 'drop-cap';
                        span.innerText = firstChar;

                        // Calculate size based on lines
                        // Standard line-height is often ~1.2.
                        // For 3 lines, we want height approx 3.6em.
                        // Font-size needs to be large enough.
                        const fontSizeEm = lines * 0.9;

                        span.style.cssText = `
                             float: left;
                             font-size: ${fontSizeEm}in; /* Use inches or fixed unit relative/absolute? No, EM is better but tricky. Let's try simpler EM */
                             font-size: ${lines * 3}rem; /* REM might be safer? No, relative to parent font. */
                             font-size: ${lines * 100 + 40}%; /* Percentage is relative to current font */
                             line-height: 0.8;
                             padding-top: 0;
                             padding-right: 0.1em;
                             margin-right: ${distance}in;
                             margin-top: 0.05em; /* Nudge down for cap-height alignment */
                             font-family: "${font}", "Times New Roman", serif;
                             color: inherit;
                           `;

                        // Override for precise calculated sizing
                        span.style.fontSize = `${lines * 1.3}em`;
                        span.style.fontWeight = 'bold'; // User requested BOLD

                        // Debug log
                        console.log('Applied Drop Cap:', span);

                        if (type === 'margin') {
                          // In Margin: Absolute positioning to pull it out
                          paragraph.style.position = 'relative'; // Ensure paragraph is anchor
                          span.style.position = 'absolute';
                          span.style.left = `-${0.6 + distance}in`; // 0.6in approx width + distance
                          span.style.top = '0';
                          span.style.textAlign = 'right';
                          span.style.width = '0.5in'; // Fixed container for the letter
                          span.style.float = 'none'; // Ensure no float
                          span.style.margin = '0';
                        } else {
                          // Dropped: Float
                          span.style.float = 'left';
                          span.style.marginRight = `${distance}in`;
                        }

                        charNode.textContent = fullText.substring(0, firstCharIndex);
                        paragraph.insertBefore(span, splitText);
                      }
                    }
                  }
                }


                console.log('📍 REACHED LINE 3992, checking cmd:', cmd);
              } else if (cmd === 'insertEquation') {
                console.log('insertEquation command received, value:', value);
                const activePage = document.querySelector('.page-content[contenteditable="true"]:focus') ||
                  document.querySelector('.page-content[contenteditable="true"]');

                console.log('Active page:', activePage);

                if (activePage) {
                  const div = document.createElement('div');
                  div.className = 'math-zone';
                  // Use flex to center, but standard block flow is better for Word-like behavior where it takes up a line
                  div.style.cssText = 'display: block; text-align: center; margin: 12px 0; font-family: "Cambria Math", "Latin Modern Math", serif; font-size: 18px; padding: 5px; cursor: default;';
                  div.contentEditable = "false"; // Math zone itself isn't directly editable yet (complex input)

                  if (value) {
                    div.textContent = value;
                  } else {
                    // Empty placeholder
                    div.textContent = 'Type equation here.';
                    div.style.color = '#999';
                  }

                  console.log('Created equation div:', div.textContent);

                  // Insert at selection if possible
                  const selection = window.getSelection();
                  if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    // Check if range is inside activePage
                    if (activePage.contains(range.commonAncestorContainer)) {
                      range.deleteContents();
                      range.insertNode(div);

                      // Insert a paragraph break after if needed
                      const p = document.createElement('p');
                      p.innerHTML = '<br>';
                      range.setStartAfter(div);
                      range.setEndAfter(div);
                      range.insertNode(p);

                      range.setStart(p, 0);
                      range.setEnd(p, 0);
                      selection.removeAllRanges();
                      selection.addRange(range);
                      console.log('Equation inserted at selection');
                    } else {
                      activePage.appendChild(div);
                      console.log('Equation appended to page');
                    }
                  } else {
                    activePage.appendChild(div);
                    console.log('Equation appended to page (no selection)');
                  }
                }
              } else if (cmd === 'insertSignature') {
                // value is {type: 'text'|'image', content }
                const { type, content } = value;

                const activePage = document.querySelector('.page-content[contenteditable="true"]:focus') ||
                  document.querySelector('.page-content[contenteditable="true"]');

                if (activePage) {
                  const container = document.createElement('div');
                  container.className = 'signature-line-container';
                  container.style.cssText = `
          position: absolute;
          bottom: 1in;
          left: 1in;
          width: 2.5in;
          z-index: 10;
          font-family: Arial, sans-serif;
          `;
                  container.contentEditable = "false";

                  // The Line
                  const line = document.createElement('div');
                  line.style.borderTop = '1px solid #000';
                  line.style.width = '100%';
                  line.style.marginBottom = '5px';
                  line.style.position = 'relative';

                  // The X
                  const xMark = document.createElement('span');
                  xMark.innerText = 'X';
                  xMark.style.position = 'absolute';
                  xMark.style.top = '-15px';
                  xMark.style.left = '0';
                  xMark.style.fontSize = '12px';
                  line.appendChild(xMark);

                  // Append Line First
                  container.appendChild(line);

                  // Render Content based on Type
                  if (type === 'image' && content) {
                    const img = document.createElement('img');
                    img.src = content;
                    img.style.display = 'block';
                    img.style.marginTop = '5px';
                    img.style.height = '40px';
                    img.style.pointerEvents = 'none';
                    img.style.marginLeft = '10px';
                    container.appendChild(img);
                  } else if (type === 'text') {
                    console.log('Inserting Text Signature:', content);
                    const textDiv = document.createElement('div');
                    textDiv.textContent = content || 'Signed'; // Fallback text
                    textDiv.style.fontFamily = '"Brush Script MT", "Lucida Handwriting", cursive, serif'; // Better font stack
                    textDiv.style.fontSize = '24px';
                    textDiv.style.marginTop = '10px';
                    textDiv.style.marginLeft = '10px';
                    textDiv.style.color = '#000000'; // Force black color
                    textDiv.style.whiteSpace = 'nowrap'; // Prevent wrapping
                    container.appendChild(textDiv);
                  }


                  // Make it draggable? For now, static bottom-left as requested.

                  // Append to page wrapper for absolute positioning relative to page
                  const pageWrapper = activePage.parentElement;
                  if (pageWrapper && pageWrapper.classList.contains('editor-page')) {
                    pageWrapper.appendChild(container); // Append to wrapper so it sits over content
                  } else {
                    activePage.appendChild(container); // Fallback
                  }

                  showNotification('Signature Line added', 'success');
                } else {
                  showNotification('Please click on a page first', 'warning');
                }
              } else if (cmd === 'insertQuickPart') {
                document.execCommand('insertHTML', false, '<span style="background: #e0e0e0; padding: 2px;">[Quick Part]</span>');
              } else if (cmd === 'toggleDropCap') {
                showNotification('Drop Cap applied (Simulated)', 'info');
              } else if (cmd === 'insertSignatureLine') {
                document.execCommand('insertHTML', false, '<div style="border-top: 1px solid #000; width: 200px; margin-top: 50px; padding-top: 5px;">Signature</div>');
              } else if (cmd === 'insertFile') {
                // Just read as text
                if (value && value instanceof File) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    // sanitize? assume text
                    const text = e.target.result;
                    document.execCommand('insertText', false, text);
                  };
                  reader.readAsText(value);
                }
              } else if (cmd === 'headerFooter') {
                // Logic to update header/footer state is complex, for now we set global state
                if (value) {
                  setHeaderFooterSettings(value);
                  // Force update of pagination
                  if (paginationRef.current) {
                    // We need a way to pass this to pagination engine
                    // For now just re-render
                    showNotification('Header/Footer settings updated', 'success');
                  }
                }
                // Handled in UI? NO, this is apply.
                // This cmd doesn't make sense for apply.
              } else if (cmd === 'drawTable') {
                setIsDrawTableMode(!isDrawTableMode);
                showNotification(isDrawTableMode ? 'Draw Table exited' : 'Draw Table Mode: Drag to create table', 'info');
              } else {

                console.log('⚠️ FALLING TO DEFAULT HANDLER for command:', cmd);
                try {
                  focusActiveEditor();
                  document.execCommand(cmd, false, value);
                } catch (e) {
                  console.warn('execCommand failed', cmd, value, e);
                }
              }
              setTimeout(updateFormatState, 60);
              setTimeout(updateDocumentStats, 160);
            }
            }
            currentFormat={currentFormat}
            bookmarks={bookmarks}
          />
        </div>
      )}

      {/* Editor Content */}
      <div className="editor-layout">
        <div className="editor-wrapper">
          <div
            className="pages-container"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              cursor: activeShapeTool ? 'crosshair' : (isDrawTableMode ? 'crosshair' : 'default')
            }}
            onMouseDown={activeShapeTool ? handleShapeMouseDown : handleDrawMouseDown}
            onMouseMove={activeShapeTool ? handleShapeMouseMove : null}
            onMouseUp={activeShapeTool ? handleShapeMouseUp : null}
          >
            <div ref={editorContainerRef} className="multi-page-editor">
              {/* Pages will be dynamically created here by MSWordPagination */}
            </div>

            <div ref={shapeGhostRef} style={{
              position: 'absolute',
              border: '1px dashed #2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              display: 'none',
              pointerEvents: 'none',
              zIndex: 1000
            }} />
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
      {
        showShareModal && (
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
        )
      }
    </div >
  );
};

export default DocumentEditor;