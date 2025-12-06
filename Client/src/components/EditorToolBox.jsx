import React, { useState, useEffect, useRef } from 'react';
import './EditorToolBox.css';
import ParagraphDialog from './ParagraphDialog';
import BordersDialog from './BordersDialog';
import ChangeStylesDialog from './ChangeStylesDialog';

const categories = ['File', 'Home', 'Insert', 'Layout', 'References', 'Review', 'View', 'Help'];

const colorPalette = {
  'Standard': ['#000000', '#FFFFFF', '#EEECE1', '#1F497D', '#4F81BD', '#C0504D', '#9BBB59', '#8064A2', '#4BACC6', '#F79646'],
  'Grey': ['#F2F2F2', '#D8D8D8', '#BFBFBF', '#A5A5A5', '#7F7F7F', '#595959', '#3F3F3F', '#262626', '#0C0C0C', '#000000'],
  'Blue': ['#E6F2FF', '#CCE5FF', '#99CCFF', '#66B2FF', '#3399FF', '#007FFF', '#0066CC', '#004C99', '#003366', '#001933'],
  'Red': ['#FFE6E6', '#FFCCCC', '#FF9999', '#FF6666', '#FF3333', '#FF0000', '#CC0000', '#990000', '#660000', '#330000'],
  'Green': ['#E6FFE6', '#CCFFCC', '#99FF99', '#66FF66', '#33FF33', '#00CC00', '#009900', '#006600', '#003300', '#001900'],
  'Purple': ['#F2E6FF', '#E5CCFF', '#CC99FF', '#B266FF', '#9933FF', '#6600CC', '#4C0099', '#330066', '#190033', '#0F001F'],
  'Orange': ['#FFF2E6', '#FFE5CC', '#FFCC99', '#FFB266', '#FF9933', '#FF8000', '#CC6600', '#994C00', '#663300', '#331900'],
  'Yellow': ['#FFFFE6', '#FFFFCC', '#FFFF99', '#FFFF66', '#FFFF33', '#FFFF00', '#CCCC00', '#999900', '#666600', '#333300']
};

const gradientPresets = [
  { name: 'Sunset', value: 'linear-gradient(45deg, #FF512F 0%, #F09819 100%)' },
  { name: 'Ocean', value: 'linear-gradient(45deg, #2193b0 0%, #6dd5ed 100%)' },
  { name: 'Purple Love', value: 'linear-gradient(45deg, #cc2b5e 0%, #753a88 100%)' },
  { name: 'Green Earth', value: 'linear-gradient(45deg, #00b09b 0%, #96c93d 100%)' },
  { name: 'Blue Raspberry', value: 'linear-gradient(45deg, #00B4DB 0%, #0083B0 100%)' },
  { name: 'Gold', value: 'linear-gradient(45deg, #FFD700 0%, #FDB931 100%)' },
  { name: 'Silver', value: 'linear-gradient(45deg, #C0C0C0 0%, #E0E0E0 100%)' },
  { name: 'Rainbow', value: 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' }
];

const presetColors = [
  '#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646',
  '#f2f2f2', '#d8d8d8', '#bfbfbf', '#a5a5a5', '#7f7f7f', '#595959', '#3f3f3f', '#262626', '#0c0c0c'
];

const EditorToolBox = ({ selectedTool: selectedToolProp, onSelectTool, onApply, currentFormat, availableStyles }) => {
  const [selectedTool, setSelectedTool] = useState(selectedToolProp || 'Home');
  const [showPasteOptions, setShowPasteOptions] = useState(false);
  const [pasteMenuPosition, setPasteMenuPosition] = useState({ top: 0, left: 0 });
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentBgColor, setCurrentBgColor] = useState('#ffff00');
  const [customTextColor, setCustomTextColor] = useState('#000000');
  const [customBgColor, setCustomBgColor] = useState('#ffff00');
  const [activeColorTab, setActiveColorTab] = useState('solid'); // 'solid' or 'gradient'
  const [savedRange, setSavedRange] = useState(null); // Save selection for color pickers
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [showTablePopup, setShowTablePopup] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [drawingTool, setDrawingTool] = useState('pen');
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showHeaderFooterPopup, setShowHeaderFooterPopup] = useState(false);
  const [showSymbolsPopup, setShowSymbolsPopup] = useState(false);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showTextEffectsPopup, setShowTextEffectsPopup] = useState(false);
  const [showChangeCasePopup, setShowChangeCasePopup] = useState(false);
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberingDropdown, setShowNumberingDropdown] = useState(false);
  const [showMultilevelDropdown, setShowMultilevelDropdown] = useState(false);
  const [showShadingDropdown, setShowShadingDropdown] = useState(false);
  const [showBordersDropdown, setShowBordersDropdown] = useState(false);
  const [showBordersDialog, setShowBordersDialog] = useState(false);
  const [showLineSpacingDropdown, setShowLineSpacingDropdown] = useState(false);
  const [showParagraphDialog, setShowParagraphDialog] = useState(false);
  const [showStylesDropdown, setShowStylesDropdown] = useState(false);
  const [currentShadingColor, setCurrentShadingColor] = useState('#ffffff');
  const [showChangeStylesDialog, setShowChangeStylesDialog] = useState(false);
  const [showSelectDropdown, setShowSelectDropdown] = useState(false);
  const [showSelectionPane, setShowSelectionPane] = useState(false);

  const stylesList = [
    { name: 'Normal', className: 'normal', type: 'paragraph' },
    { name: 'No Spacing', className: 'normal', type: 'body' },
    { name: 'Heading 1', className: 'heading1', type: 'heading1' },
    { name: 'Heading 2', className: 'heading2', type: 'heading2' },
    { name: 'Heading 3', className: 'heading3', type: 'heading3' },
    { name: 'Heading 4', className: 'heading4', type: 'heading4' },
    { name: 'Title', className: 'title', type: 'title' },
    { name: 'Subtitle', className: 'subtitle', type: 'subtitle' },
    { name: 'Subtle Emphasis', className: 'subtleEmphasis', type: 'subtleEmphasis' },
    { name: 'Emphasis', className: 'emphasis', type: 'emphasis' },
    { name: 'Intense Emphasis', className: 'intenseEmphasis', type: 'intenseEmphasis' },
    { name: 'Strong', className: 'strong', type: 'strong' },
    { name: 'Quote', className: 'quote', type: 'quote' },
    { name: 'Intense Quote', className: 'intenseQuote', type: 'intenseQuote' },
    { name: 'Subtle Reference', className: 'subtleReference', type: 'subtleReference' },
    { name: 'Intense Reference', className: 'intenseReference', type: 'intenseReference' },
    { name: 'Book Title', className: 'bookTitle', type: 'bookTitle' },
    { name: 'List Paragraph', className: 'listParagraph', type: 'listParagraph' },
  ];

  const stylesGalleryRef = useRef(null);

  const scrollGallery = (amount) => {
    if (stylesGalleryRef.current) {
      stylesGalleryRef.current.scrollTop += amount;
    }
  };

  const stylesDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (stylesDropdownRef.current && !stylesDropdownRef.current.contains(event.target)) {
        setShowStylesDropdown(false);
      }
    };

    if (showStylesDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStylesDropdown]);

  const [changeCaseMenuPosition, setChangeCaseMenuPosition] = useState({ top: 0, left: 0 });
  const [margins, setMargins] = useState({
    top: 1,
    bottom: 1,
    left: 1,
    right: 1
  });
  const [orientation, setOrientation] = useState('portrait');
  const [showPageBorderPopup, setShowPageBorderPopup] = useState(false);
  const [showPageColorPopup, setShowPageColorPopup] = useState(false);
  const [customPageColor, setCustomPageColor] = useState('#ffffff');
  const [showKeyboardShortcutsPopup, setShowKeyboardShortcutsPopup] = useState(false);
  const [showTocPopup, setShowTocPopup] = useState(false);
  const [showFootnotePopup, setShowFootnotePopup] = useState(false);
  const [showEndnotePopup, setShowEndnotePopup] = useState(false);
  const [showCitationPopup, setShowCitationPopup] = useState(false);
  const [showBibliographyPopup, setShowBibliographyPopup] = useState(false);
  const [footnoteText, setFootnoteText] = useState('');
  const [endnoteText, setEndnoteText] = useState('');
  const [citationText, setCitationText] = useState('');
  const [citationAuthor, setCitationAuthor] = useState('');
  const [citationYear, setCitationYear] = useState('');
  const [tocSettings, setTocSettings] = useState({
    includeH1: true,
    includeH2: true,
    includeH3: true,
    includeH4: false,
    includeH5: false,
    includeH6: false,
    showPageNumbers: true,
    alignment: 'left'
  });
  const [headerFooterConfig, setHeaderFooterConfig] = useState({
    headerText: '',
    headerAlignment: 'left',
    headerApplyToAll: true,
    footerText: '',
    footerAlignment: 'left',
    footerApplyToAll: true,
    borderType: 'none',
    borderColor: '#000000',
    borderWidth: '1px',
    pageNumbers: {
      enabled: true,
      type: 'numeric',
      position: 'footer-right',
      format: 'Page {n}'
    }
  });
  const canvasRef = useRef(null);
  const pasteRef = useRef(null);
  const pasteToggleRef = useRef(null);
  const textColorRef = useRef(null);
  const bgColorRef = useRef(null);
  const findReplaceRef = useRef(null);
  const tableRef = useRef(null);
  const imageRef = useRef(null);
  const linkRef = useRef(null);
  const headerFooterRef = useRef(null);
  const symbolsRef = useRef(null);
  const emojiRef = useRef(null);
  const textEffectsRef = useRef(null);
  const changeCaseRef = useRef(null);
  const pageBorderRef = useRef(null);
  const pageColorRef = useRef(null);
  const keyboardShortcutsRef = useRef(null);
  const tocRef = useRef(null);
  const footnoteRef = useRef(null);
  const endnoteRef = useRef(null);
  const citationRef = useRef(null);
  const bibliographyRef = useRef(null);
  const bulletRef = useRef(null);
  const numberingRef = useRef(null);
  const multilevelRef = useRef(null);
  const shadingRef = useRef(null);
  const bordersRef = useRef(null);

  useEffect(() => {
    if (selectedToolProp && selectedToolProp !== selectedTool) {
      setSelectedTool(selectedToolProp);
    }
  }, [selectedToolProp]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (textColorRef.current && !textColorRef.current.contains(event.target)) {
        setShowTextColorPicker(false);
      }
      if (bgColorRef.current && !bgColorRef.current.contains(event.target)) {
        setShowBgColorPicker(false);
      }
      // Close paste options when clicking outside both the clipboard group and the fixed menu
      const inPasteMenu = event.target.closest && event.target.closest('.paste-options-menu');
      if (!inPasteMenu && pasteRef.current && !pasteRef.current.contains(event.target)) {
        setShowPasteOptions(false);
      }
      if (findReplaceRef.current && !findReplaceRef.current.contains(event.target)) {
        setShowFindReplace(false);
      }
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setShowTablePopup(false);
      }
      if (imageRef.current && !imageRef.current.contains(event.target)) {
        setShowImagePopup(false);
      }
      // Don't close link popup on outside clicks - it has its own overlay handler
      if (linkRef.current && !linkRef.current.contains(event.target) && !event.target.closest('.drawing-overlay')) {
        setShowLinkPopup(false);
      }
      if (headerFooterRef.current && !headerFooterRef.current.contains(event.target)) {
        setShowHeaderFooterPopup(false);
      }
      if (symbolsRef.current && !symbolsRef.current.contains(event.target)) {
        setShowSymbolsPopup(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPopup(false);
      }
      if (textEffectsRef.current && !textEffectsRef.current.contains(event.target)) {
        setShowTextEffectsPopup(false);
      }
      if (changeCaseRef.current && !changeCaseRef.current.contains(event.target)) {
        setShowChangeCasePopup(false);
      }
      if (pageBorderRef.current && !pageBorderRef.current.contains(event.target)) {
        setShowPageBorderPopup(false);
      }
      if (pageColorRef.current && !pageColorRef.current.contains(event.target)) {
        setShowPageColorPopup(false);
      }
      if (keyboardShortcutsRef.current && !keyboardShortcutsRef.current.contains(event.target)) {
        setShowKeyboardShortcutsPopup(false);
      }
      if (tocRef.current && !tocRef.current.contains(event.target)) {
        setShowTocPopup(false);
      }
      if (footnoteRef.current && !footnoteRef.current.contains(event.target)) {
        setShowFootnotePopup(false);
      }
      if (endnoteRef.current && !endnoteRef.current.contains(event.target)) {
        setShowEndnotePopup(false);
      }
      if (citationRef.current && !citationRef.current.contains(event.target)) {
        setShowCitationPopup(false);
      }
      if (bibliographyRef.current && !bibliographyRef.current.contains(event.target)) {
        setShowBibliographyPopup(false);
      }
      if (bulletRef.current && !bulletRef.current.contains(event.target)) {
        setShowBulletDropdown(false);
      }
      if (numberingRef.current && !numberingRef.current.contains(event.target)) {
        setShowNumberingDropdown(false);
      }
      if (multilevelRef.current && !multilevelRef.current.contains(event.target)) {
        setShowMultilevelDropdown(false);
      }
      if (shadingRef.current && !shadingRef.current.contains(event.target)) {
        setShowShadingDropdown(false);
      }
      if (bordersRef.current && !bordersRef.current.contains(event.target)) {
        setShowBordersDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();

      if (k === 'a') { e.preventDefault(); document.execCommand('selectAll'); }
      else if (k === 'b') { e.preventDefault(); apply('bold'); }
      else if (k === 'i') { e.preventDefault(); apply('italic'); }
      else if (k === 'u') { e.preventDefault(); apply('underline'); }
      else if (k === 'z') { e.preventDefault(); apply('undo'); }
      else if (k === 'y') { e.preventDefault(); apply('redo'); }
      else if (k === 's') { e.preventDefault(); apply('save'); }
      else if (k === 'f') { e.preventDefault(); setShowFindReplace(true); }
      else if (k === 'h') { e.preventDefault(); setShowFindReplace(true); }
      else if (k === 'l') { e.preventDefault(); apply('justifyLeft'); }
      else if (k === 'e') { e.preventDefault(); apply('justifyCenter'); }
      else if (k === 'r') { e.preventDefault(); apply('justifyRight'); }
      else if (k === 'j') { e.preventDefault(); apply('justifyFull'); }
      else if (k === 'p') { e.preventDefault(); apply('filePrint'); }
      else if (k === 'o') { e.preventDefault(); apply('fileOpen'); }
      else if (k === 'n') { e.preventDefault(); apply('fileNew'); }
      else if (k === 'k') { e.preventDefault(); setShowLinkPopup(true); }
      else if (k === 'm') { e.preventDefault(); apply('indent'); }
      else if (k === 't') { e.preventDefault(); apply('indent'); }
      else if (k === 'w') { e.preventDefault(); apply('fileClose'); }
      else if (k === 'q') { e.preventDefault(); apply('removeFormat'); }
      else if (k === ' ') { e.preventDefault(); apply('removeFormat'); }
      else if (k === '1') { e.preventDefault(); apply('lineHeight', '1'); }
      else if (k === '2') { e.preventDefault(); apply('lineHeight', '2'); }
      else if (k === '5') { e.preventDefault(); apply('lineHeight', '1.5'); }
      else if (k === '0') { e.preventDefault(); apply('paragraphSpacing'); }
      else if (k === '[') { e.preventDefault(); apply('decreaseFontSize'); }
      else if (k === ']') { e.preventDefault(); apply('increaseFontSize'); }
      else if ((k === '>' || k === '.') && e.shiftKey) { e.preventDefault(); apply('increaseFontSize'); }
      else if ((k === '<' || k === ',') && e.shiftKey) { e.preventDefault(); apply('decreaseFontSize'); }
      else if (k === '=' && !e.shiftKey) { e.preventDefault(); apply('subscript'); }
      else if ((k === '=' || k === '+') && e.shiftKey) { e.preventDefault(); apply('superscript'); }
      else if (k === '-') { e.preventDefault(); apply('insertHTML', '‑'); }
      else if (k === '/') { e.preventDefault(); apply('showFormattingMarks'); }
      else if (k === '\\') { e.preventDefault(); apply('removeFormat'); }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onApply]);


  const choose = (tool) => {
    if (tool !== selectedTool) {
      setSelectedTool(tool);
      if (onSelectTool) onSelectTool(tool);
    }
  };

  const apply = (cmd, value = null) => {
    console.log('EditorToolBox apply called:', cmd, value);
    if (onApply) {
      onApply(cmd, value);
    } else {
      console.error('onApply function not provided');
    }
  };

  const focusAndApply = (cmd, value = null) => {
    try {
      const activeEditor = document.querySelector('.page-content[contenteditable="true"]');
      if (activeEditor) {
        activeEditor.focus();
      }
    } catch (err) {
      console.error('Error focusing active editor before apply:', err);
    }
    apply(cmd, value);
  };

  const insertSymbolOrEmoji = (content) => {
    try {
      // Focus the active editor page first
      const activeEditor = document.querySelector('.page-content[contenteditable="true"]:focus') ||
        document.querySelector('.page-content[contenteditable="true"]');

      if (activeEditor) {
        activeEditor.focus();

        // Use insertText for better compatibility
        if (document.execCommand) {
          document.execCommand('insertText', false, content);
        } else {
          // Fallback for modern browsers
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(content));
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      } else {
        // Fallback: use the apply function
        apply('insertHTML', content);
      }
    } catch (error) {
      console.error('Error inserting symbol/emoji:', error);
      // Final fallback
      try {
        apply('insertHTML', content);
      } catch (fallbackError) {
        console.error('Fallback insertion failed:', fallbackError);
      }
    }
  };

  const handleHeaderFooterSubmit = () => {
    apply('headerFooter', headerFooterConfig);
    setShowHeaderFooterPopup(false);
  };

  const updateHeaderFooterConfig = (key, value) => {
    setHeaderFooterConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updatePageNumberConfig = (key, value) => {
    setHeaderFooterConfig(prev => ({
      ...prev,
      pageNumbers: {
        ...prev.pageNumbers,
        [key]: value
      }
    }));
  };

  // References functionality
  const generateTableOfContents = (settings) => {
    let tocHTML = `<div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; background: #f9f9f9; text-align: ${settings.alignment};"><h2 style="margin-top: 0;">Table of Contents</h2><div style="text-align: left;">`;

    const levels = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
    let counter = 1;

    levels.forEach((level, levelIndex) => {
      const levelNum = levelIndex + 1;
      if (settings[`includeH${levelNum}`]) {
        const indent = levelIndex * 20;
        const pageNum = settings.showPageNumbers ? '<span style="float: right;">1</span>' : '';
        tocHTML += `<div style="margin-left: ${indent}px; padding: 5px 0; border-bottom: 1px dotted #ccc;">Sample ${level} Heading${pageNum}</div>`;
      }
    });

    tocHTML += '</div></div>';
    return tocHTML;
  };

  return (
    <div className="editor-toolbox">
      <div className="etb-categories">
        {categories.map(cat => (
          <button
            key={cat}
            className={`etb-cat-btn ${selectedTool === cat ? 'active' : ''}`}
            onClick={() => choose(cat)}
            title={`Switch to ${cat}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="etb-content">
        {selectedTool === 'Home' && (
          <>
            <div className="etb-row">
              {/* Clipboard group (includes Undo/Redo like Quick Access) */}
              <div className="etb-group etb-clipboard" ref={pasteRef}>
                <div className="etb-group-content">
                  <div className="etb-clipboard-inner">
                    {/* Left side: Undo/Redo/Refresh stacked vertically */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, justifyContent: 'center' }}>
                      <button className="etb-btn etb-btn-small" onClick={() => { console.log('UNDO CLICKED'); apply('undo'); }} title="Undo - Reverses the last action (Ctrl+Z)" style={{ minWidth: '22px', height: '22px', padding: '3px' }}>
                        <i className="ri-arrow-go-back-fill" style={{ fontSize: '14px' }}></i>
                      </button>
                      <button className="etb-btn etb-btn-small" onClick={() => { console.log('REDO CLICKED'); apply('redo'); }} title="Redo - Restores the last undone action (Ctrl+Y)" style={{ minWidth: '22px', height: '22px', padding: '3px' }}>
                        <i className="ri-arrow-go-forward-fill" style={{ fontSize: '14px' }}></i>
                      </button>
                      <button className="etb-btn etb-btn-small" onClick={() => { console.log('REFRESH CLICKED'); apply('refresh'); }} title="Refresh - Reloads the document content (F5)" style={{ minWidth: '22px', height: '22px', padding: '3px' }}>
                        <i className="ri-refresh-fill" style={{ fontSize: '14px' }}></i>
                      </button>
                    </div>

                    {/* Center: Paste button */}
                    <div className="etb-paste-main">
                      <button
                        className="etb-btn etb-btn-large"
                        onClick={() => focusAndApply('pasteDefault')}
                        title="Paste (Ctrl+V) - Paste content from clipboard"
                      >
                        <i className="ri-clipboard-fill" style={{ fontSize: '24px' }}></i>
                        <span className="btn-label" style={{ fontSize: '12px' }}>Paste</span>
                      </button>
                      <button
                        ref={pasteToggleRef}
                        className="etb-btn etb-btn-small etb-paste-dropdown-toggle"
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          setPasteMenuPosition({
                            top: rect.bottom + 2 + window.scrollY,
                            left: rect.left + window.scrollX
                          });
                          setShowPasteOptions(prev => !prev);
                        }}
                        title="Paste options"
                      >
                        <i className="ri-arrow-down-s-line" style={{ fontSize: '11px' }}></i>
                      </button>
                      {showPasteOptions && (
                        <div
                          className="paste-options-menu"
                          style={{ position: 'fixed', top: pasteMenuPosition.top, left: pasteMenuPosition.left }}
                        >
                          <div className="paste-options-header">Paste Options:</div>

                          <button
                            className="paste-option-item"
                            onClick={() => {
                              focusAndApply('pasteDefault');
                              setShowPasteOptions(false);
                            }}
                          >
                            <span className="option-title">Paste</span>
                            <span className="option-desc">Use default paste behavior</span>
                          </button>

                          <button
                            className="paste-option-item"
                            onClick={() => {
                              focusAndApply('pasteSpecial');
                              setShowPasteOptions(false);
                            }}
                          >
                            <span className="option-title">Paste Special...</span>
                            <span className="option-desc">Open special paste options</span>
                          </button>

                          <div className="paste-options-separator" />

                          <button
                            className="paste-option-item"
                            onClick={() => {
                              focusAndApply('pasteKeepFormatting');
                              setShowPasteOptions(false);
                            }}
                          >
                            <span className="option-title">Keep Source Formatting</span>
                            <span className="option-desc">Preserve original formatting</span>
                          </button>

                          <button
                            className="paste-option-item"
                            onClick={() => {
                              focusAndApply('pasteMergeFormatting');
                              setShowPasteOptions(false);
                            }}
                          >
                            <span className="option-title">Merge Formatting</span>
                            <span className="option-desc">Blend with destination style</span>
                          </button>

                          <button
                            className="paste-option-item"
                            onClick={() => {
                              focusAndApply('pasteTextOnly');
                              setShowPasteOptions(false);
                            }}
                          >
                            <span className="option-title">Keep Text Only</span>
                            <span className="option-desc">Paste unformatted text</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right side: Cut/Copy/Format Painter */}
                    <div className="etb-clipboard-side">
                      <div className="etb-clipboard-item">
                        <button
                          className="etb-btn etb-btn-small"
                          onClick={() => focusAndApply('cut')}
                          title="Cut - Remove selection and copy to clipboard (Ctrl+X)"
                        >
                          <i className="ri-scissors-2-line"></i>
                        </button>
                        <span className="etb-clipboard-label">Cut</span>
                      </div>
                      <div className="etb-clipboard-item">
                        <button
                          className="etb-btn etb-btn-small"
                          onClick={() => focusAndApply('copy')}
                          title="Copy - Copy selection to clipboard (Ctrl+C)"
                        >
                          <i className="ri-file-copy-2-line"></i>
                        </button>
                        <span className="etb-clipboard-label">Copy</span>
                      </div>
                      <div className="etb-clipboard-item">
                        <button
                          className="etb-btn etb-btn-small"
                          onClick={() => focusAndApply('formatPainter', 'single')}
                          onDoubleClick={() => focusAndApply('formatPainter', 'multi')}
                          title="Format Painter - Copy formatting (double-click for multiple uses)"
                        >
                          <i className="ri-paint-brush-line"></i>
                        </button>
                        <span className="etb-clipboard-label">Format Painter</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="etb-group-label">Clipboard</div>
              </div>

              {/* Font group */}
              <div className="etb-group etb-font-section">
                <div className="etb-group-content">
                  <div className="etb-col">
                    <div style={{ display: 'flex', gap: 4 }}>
                      <select
                        className="etb-select etb-select-small font-family-select"
                        value={currentFormat?.fontFamily || 'Georgia'}
                        onChange={(e) => focusAndApply('fontName', e.target.value)}
                        title="Font family"
                      >
                        <option style={{ fontFamily: 'Calibri' }}>Calibri</option>
                        <option style={{ fontFamily: 'Cambria' }}>Cambria</option>
                        <option style={{ fontFamily: 'Georgia' }}>Georgia</option>
                        <option style={{ fontFamily: 'Arial' }}>Arial</option>
                        <option style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
                        <option style={{ fontFamily: 'Helvetica' }}>Helvetica</option>
                        <option style={{ fontFamily: 'Verdana' }}>Verdana</option>
                        <option style={{ fontFamily: 'Tahoma' }}>Tahoma</option>
                        <option style={{ fontFamily: 'Trebuchet MS' }}>Trebuchet MS</option>
                        <option style={{ fontFamily: 'Arial Black' }}>Arial Black</option>
                        <option style={{ fontFamily: 'Impact' }}>Impact</option>
                        <option style={{ fontFamily: 'Comic Sans MS' }}>Comic Sans MS</option>
                        <option style={{ fontFamily: 'Courier New' }}>Courier New</option>
                        <option style={{ fontFamily: 'Lucida Console' }}>Lucida Console</option>
                        <option style={{ fontFamily: 'Palatino' }}>Palatino</option>
                        <option style={{ fontFamily: 'Garamond' }}>Garamond</option>
                        <option style={{ fontFamily: 'Book Antiqua' }}>Book Antiqua</option>
                        <option style={{ fontFamily: 'Century Gothic' }}>Century Gothic</option>
                        <option style={{ fontFamily: 'Consolas' }}>Consolas</option>
                        <option style={{ fontFamily: 'Franklin Gothic Medium' }}>Franklin Gothic Medium</option>
                        <option style={{ fontFamily: 'Goudy Old Style' }}>Goudy Old Style</option>
                        <option style={{ fontFamily: 'Lucida Sans Unicode' }}>Lucida Sans Unicode</option>
                        <option style={{ fontFamily: 'MS Sans Serif' }}>MS Sans Serif</option>
                        <option style={{ fontFamily: 'MS Serif' }}>MS Serif</option>
                        <option style={{ fontFamily: 'Symbol' }}>Symbol</option>
                        <option style={{ fontFamily: 'Wingdings' }}>Wingdings</option>
                        <option style={{ fontFamily: 'Bodoni MT' }}>Bodoni MT</option>
                        <option style={{ fontFamily: 'Bookman Old Style' }}>Bookman Old Style</option>
                        <option style={{ fontFamily: 'Century Schoolbook' }}>Century Schoolbook</option>
                        <option style={{ fontFamily: 'Copperplate Gothic' }}>Copperplate Gothic</option>
                        <option style={{ fontFamily: 'Courier' }}>Courier</option>
                        <option style={{ fontFamily: 'Futura' }}>Futura</option>
                        <option style={{ fontFamily: 'Geneva' }}>Geneva</option>
                        <option style={{ fontFamily: 'Gill Sans' }}>Gill Sans</option>
                        <option style={{ fontFamily: 'Monaco' }}>Monaco</option>
                        <option style={{ fontFamily: 'Optima' }}>Optima</option>
                        <option style={{ fontFamily: 'Perpetua' }}>Perpetua</option>
                        <option style={{ fontFamily: 'Rockwell' }}>Rockwell</option>
                        <option style={{ fontFamily: 'Segoe UI' }}>Segoe UI</option>
                        <option style={{ fontFamily: 'Tahoma' }}>Tahoma</option>
                        <option style={{ fontFamily: 'Ubuntu' }}>Ubuntu</option>
                        <option style={{ fontFamily: 'Roboto' }}>Roboto</option>
                        <option style={{ fontFamily: 'Open Sans' }}>Open Sans</option>
                        <option style={{ fontFamily: 'Lato' }}>Lato</option>
                        <option style={{ fontFamily: 'Montserrat' }}>Montserrat</option>
                        <option style={{ fontFamily: 'Oswald' }}>Oswald</option>
                        <option style={{ fontFamily: 'Raleway' }}>Raleway</option>
                        <option style={{ fontFamily: 'Poppins' }}>Poppins</option>
                        <option style={{ fontFamily: 'Source Sans Pro' }}>Source Sans Pro</option>
                        <option style={{ fontFamily: 'Playfair Display' }}>Playfair Display</option>
                        <option style={{ fontFamily: 'Merriweather' }}>Merriweather</option>
                        <option style={{ fontFamily: 'Lora' }}>Lora</option>
                        <option style={{ fontFamily: 'PT Sans' }}>PT Sans</option>
                        <option style={{ fontFamily: 'PT Serif' }}>PT Serif</option>
                        <option style={{ fontFamily: 'Droid Sans' }}>Droid Sans</option>
                        <option style={{ fontFamily: 'Droid Serif' }}>Droid Serif</option>
                        <option style={{ fontFamily: 'Fira Sans' }}>Fira Sans</option>
                        <option style={{ fontFamily: 'Crimson Text' }}>Crimson Text</option>
                        <option style={{ fontFamily: 'Libre Baskerville' }}>Libre Baskerville</option>
                        <option style={{ fontFamily: 'Arvo' }}>Arvo</option>
                        <option style={{ fontFamily: 'Josefin Sans' }}>Josefin Sans</option>
                        <option style={{ fontFamily: 'Dancing Script' }}>Dancing Script</option>
                        <option style={{ fontFamily: 'Pacifico' }}>Pacifico</option>
                        <option style={{ fontFamily: 'Lobster' }}>Lobster</option>
                        <option style={{ fontFamily: 'Bebas Neue' }}>Bebas Neue</option>
                        <option style={{ fontFamily: 'Anton' }}>Anton</option>
                        <option style={{ fontFamily: 'Oswald' }}>Oswald</option>
                        <option style={{ fontFamily: 'Fjalla One' }}>Fjalla One</option>
                        <option style={{ fontFamily: 'Righteous' }}>Righteous</option>
                        <option style={{ fontFamily: 'Bangers' }}>Bangers</option>
                        <option style={{ fontFamily: 'Creepster' }}>Creepster</option>
                        <option style={{ fontFamily: 'Fredoka One' }}>Fredoka One</option>
                        <option style={{ fontFamily: 'Luckiest Guy' }}>Luckiest Guy</option>
                        <option style={{ fontFamily: 'Permanent Marker' }}>Permanent Marker</option>
                        <option style={{ fontFamily: 'Shadows Into Light' }}>Shadows Into Light</option>
                        <option style={{ fontFamily: 'Satisfy' }}>Satisfy</option>
                        <option style={{ fontFamily: 'Kalam' }}>Kalam</option>
                        <option style={{ fontFamily: 'Caveat' }}>Caveat</option>
                        <option style={{ fontFamily: 'Amatic SC' }}>Amatic SC</option>
                        <option style={{ fontFamily: 'Indie Flower' }}>Indie Flower</option>
                        <option style={{ fontFamily: 'Comfortaa' }}>Comfortaa</option>
                        <option style={{ fontFamily: 'Quicksand' }}>Quicksand</option>
                        <option style={{ fontFamily: 'Nunito' }}>Nunito</option>
                        <option style={{ fontFamily: 'Work Sans' }}>Work Sans</option>
                        <option style={{ fontFamily: 'Cabin' }}>Cabin</option>
                        <option style={{ fontFamily: 'Muli' }}>Muli</option>
                        <option style={{ fontFamily: 'Hind' }}>Hind</option>
                        <option style={{ fontFamily: 'Rajdhani' }}>Rajdhani</option>
                        <option style={{ fontFamily: 'Titillium Web' }}>Titillium Web</option>
                        <option style={{ fontFamily: 'Yanone Kaffeesatz' }}>Yanone Kaffeesatz</option>
                        <option style={{ fontFamily: 'Exo' }}>Exo</option>
                        <option style={{ fontFamily: 'Orbitron' }}>Orbitron</option>
                        <option style={{ fontFamily: 'Abril Fatface' }}>Abril Fatface</option>
                        <option style={{ fontFamily: 'Cinzel' }}>Cinzel</option>
                        <option style={{ fontFamily: 'Cormorant' }}>Cormorant</option>
                        <option style={{ fontFamily: 'EB Garamond' }}>EB Garamond</option>
                        <option style={{ fontFamily: 'Libre Caslon Text' }}>Libre Caslon Text</option>
                        <option style={{ fontFamily: 'Crimson Pro' }}>Crimson Pro</option>
                        <option style={{ fontFamily: 'Lora' }}>Lora</option>
                        <option style={{ fontFamily: 'Playfair Display SC' }}>Playfair Display SC</option>
                        <option style={{ fontFamily: 'Bitter' }}>Bitter</option>
                        <option style={{ fontFamily: 'Vollkorn' }}>Vollkorn</option>
                        <option style={{ fontFamily: 'Cormorant Garamond' }}>Cormorant Garamond</option>
                        <option style={{ fontFamily: 'Old Standard TT' }}>Old Standard TT</option>
                        <option style={{ fontFamily: 'Spectral' }}>Spectral</option>
                        <option style={{ fontFamily: 'Cormorant Infant' }}>Cormorant Infant</option>
                        <option style={{ fontFamily: 'Cormorant Unicase' }}>Cormorant Unicase</option>
                        <option style={{ fontFamily: 'Cormorant SC' }}>Cormorant SC</option>
                        <option style={{ fontFamily: 'Cormorant Upright' }}>Cormorant Upright</option>
                        <option style={{ fontFamily: 'Cormorant' }}>Cormorant</option>
                        <option style={{ fontFamily: 'Cormorant Garamond' }}>Cormorant Garamond</option>
                        <option style={{ fontFamily: 'Cormorant Infant' }}>Cormorant Infant</option>
                        <option style={{ fontFamily: 'Cormorant Unicase' }}>Cormorant Unicase</option>
                        <option style={{ fontFamily: 'Cormorant SC' }}>Cormorant SC</option>
                        <option style={{ fontFamily: 'Cormorant Upright' }}>Cormorant Upright</option>
                      </select>
                      <select
                        className="etb-select etb-select-small font-size-select"
                        value={currentFormat?.fontSize || '12pt'}
                        onChange={(e) => focusAndApply('fontSize', e.target.value)}
                        title="Font size"
                      >
                        <option>8pt</option>
                        <option>9pt</option>
                        <option>10pt</option>
                        <option>11pt</option>
                        <option>12pt</option>
                        <option>14pt</option>
                        <option>16pt</option>
                        <option>18pt</option>
                        <option>20pt</option>
                        <option>22pt</option>
                        <option>24pt</option>
                        <option>26pt</option>
                        <option>28pt</option>
                        <option>32pt</option>
                        <option>36pt</option>
                        <option>40pt</option>
                        <option>44pt</option>
                        <option>48pt</option>
                        <option>54pt</option>
                        <option>60pt</option>
                        <option>66pt</option>
                        <option>72pt</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                      <button className="etb-btn etb-btn-small" onClick={() => focusAndApply('bold')} title="Bold (Ctrl+B)"><strong>B</strong></button>
                      <button className="etb-btn etb-btn-small" onClick={() => focusAndApply('italic')} title="Italic (Ctrl+I)"><em>I</em></button>
                      <button className="etb-btn etb-btn-small" onClick={() => focusAndApply('underline')} title="Underline (Ctrl+U)"><u>U</u></button>
                      <button className="etb-btn etb-btn-small" onClick={() => focusAndApply('strikeThrough')} title="Strikethrough"><s>abc</s></button>
                      <button className="etb-btn etb-btn-small" onClick={() => focusAndApply('subscript')} title="Subscript">x<sub>2</sub></button>
                      <button className="etb-btn etb-btn-small" onClick={() => focusAndApply('superscript')} title="Superscript">x<sup>2</sup></button>
                      <div className="etb-color-container" ref={textEffectsRef}>
                        <button
                          className="etb-btn etb-btn-small"
                          onClick={() => setShowTextEffectsPopup(!showTextEffectsPopup)}
                          title="Text Effects & Typography"
                        >
                          {/* Stylized A icon to better match Word's Text Effects */}
                          <i className="ri-text-shadow"></i>
                        </button>
                        {showTextEffectsPopup && (
                          <div className="insert-popup text-effects-popup">
                            <div className="popup-header">
                              <h4>Text Effects</h4>
                              <button className="close-btn" onClick={() => setShowTextEffectsPopup(false)}>×</button>
                            </div>
                            <div className="popup-content">
                              {/* Preset gallery similar to Word's colored A grid */}
                              <div className="text-effects-grid">
                                {/* Row 1 presets */}
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#1f4e79' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-blue'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#c0504d' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-red'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#9bbb59' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-green'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#8064a2' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-purple'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#f79646' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-orange'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#000000' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-black'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                {/* Row 2 simple outlines/glows */}
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#1f4e79', textShadow: '0 0 4px rgba(31,78,121,0.9)' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-blueGlow'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#ffffff', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-whiteOutline'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#f79646', textShadow: '0 0 4px rgba(247,150,70,0.8)' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-orangeGlow'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#9bbb59', textShadow: '0 0 4px rgba(155,187,89,0.8)' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-greenGlow'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#8064a2', textShadow: '0 0 4px rgba(128,100,162,0.8)' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-purpleGlow'); setShowTextEffectsPopup(false); }}
                                >A</button>
                                <button
                                  className="text-effect-swatch"
                                  style={{ color: '#000000', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                                  onClick={() => { focusAndApply('textEffect', 'preset-blackGlow'); setShowTextEffectsPopup(false); }}
                                >A</button>
                              </div>
                              {/* More detailed Outline / Shadow / Glow options */}
                              <div style={{ marginTop: 8 }}>
                                <strong style={{ fontSize: 12 }}>Outline</strong>
                                <button
                                  className="image-option"
                                  onClick={() => {
                                    focusAndApply('textEffect', 'outline-thin');
                                    setShowTextEffectsPopup(false);
                                  }}
                                >
                                  <i className="ri-contrast-2-line"></i>
                                  <span>Thin Outline</span>
                                </button>
                                <button
                                  className="image-option"
                                  onClick={() => {
                                    focusAndApply('textEffect', 'outline-thick');
                                    setShowTextEffectsPopup(false);
                                  }}
                                >
                                  <i className="ri-contrast-2-fill"></i>
                                  <span>Thick Outline</span>
                                </button>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <strong style={{ fontSize: 12 }}>Shadow</strong>
                                <button
                                  className="image-option"
                                  onClick={() => {
                                    focusAndApply('textEffect', 'shadow-slight');
                                    setShowTextEffectsPopup(false);
                                  }}
                                >
                                  <i className="ri-shadow-line"></i>
                                  <span>Slight Shadow</span>
                                </button>
                                <button
                                  className="image-option"
                                  onClick={() => {
                                    focusAndApply('textEffect', 'shadow-outer');
                                    setShowTextEffectsPopup(false);
                                  }}
                                >
                                  <i className="ri-shadow-fill"></i>
                                  <span>Outer Shadow</span>
                                </button>
                              </div>
                              <div style={{ marginTop: 8 }}>
                                <strong style={{ fontSize: 12 }}>Glow</strong>
                                <button
                                  className="image-option"
                                  onClick={() => {
                                    focusAndApply('textEffect', 'glow-small');
                                    setShowTextEffectsPopup(false);
                                  }}
                                >
                                  <i className="ri-sparkling-2-line"></i>
                                  <span>Small Glow</span>
                                </button>
                                <button
                                  className="image-option"
                                  onClick={() => {
                                    focusAndApply('textEffect', 'glow-strong');
                                    setShowTextEffectsPopup(false);
                                  }}
                                >
                                  <i className="ri-sparkling-2-fill"></i>
                                  <span>Strong Glow</span>
                                </button>
                              </div>
                              <button
                                className="image-option"
                                onClick={() => {
                                  focusAndApply('textEffect', 'clear');
                                  setShowTextEffectsPopup(false);
                                }}
                              >
                                <i className="ri-close-circle-line"></i>
                                <span>Clear Effects</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, marginTop: 4, alignItems: 'center' }}>
                      <div className="etb-color-container" ref={textColorRef}>
                        <button className="etb-btn etb-btn-small etb-color-btn" onClick={() => {
                          // Save current selection before opening picker
                          const sel = window.getSelection();
                          if (sel && sel.rangeCount > 0) {
                            setSavedRange(sel.getRangeAt(0).cloneRange());
                          }
                          setShowTextColorPicker(!showTextColorPicker);
                        }} title="Font Color">
                          <span className="color-icon">A</span>
                          <div className="color-bar" style={{ backgroundColor: currentTextColor }}></div>
                        </button>
                        {showTextColorPicker && (
                          <div className="color-picker-panel extended-panel">
                            <div className="color-picker-tabs">
                              <button
                                className={`tab-btn ${activeColorTab === 'solid' ? 'active' : ''}`}
                                onClick={() => setActiveColorTab('solid')}
                              >Solid</button>
                              <button
                                className={`tab-btn ${activeColorTab === 'gradient' ? 'active' : ''}`}
                                onClick={() => setActiveColorTab('gradient')}
                              >Gradient</button>
                            </div>

                            {activeColorTab === 'solid' ? (
                              <>
                                <div className="color-palette-scroll">
                                  {Object.entries(colorPalette).map(([category, colors]) => (
                                    <div key={category} className="color-row-group">
                                      <div className="color-category-label">{category}</div>
                                      <div className="color-preset-grid compact">
                                        {colors.map(color => (
                                          <div
                                            key={color}
                                            className="color-swatch small"
                                            style={{ backgroundColor: color }}
                                            onClick={() => {
                                              // Restore saved selection before applying
                                              if (savedRange) {
                                                const sel = window.getSelection();
                                                sel.removeAllRanges();
                                                sel.addRange(savedRange);
                                              }
                                              setCurrentTextColor(color);
                                              apply('foreColor', color);
                                              setShowTextColorPicker(false);
                                              setSavedRange(null);
                                            }}
                                            title={color}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="custom-color-section">
                                  <label>Custom:</label>
                                  <div className="custom-color-input">
                                    <input
                                      type="color"
                                      value={customTextColor}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setCustomTextColor(val);
                                        setCurrentTextColor(val);
                                        apply('foreColor', val);
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={customTextColor}
                                      onChange={(e) => setCustomTextColor(e.target.value)}
                                      placeholder="#000000"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="gradient-picker-section">
                                <div className="gradient-grid">
                                  {gradientPresets.map(preset => (
                                    <button
                                      key={preset.name}
                                      className="gradient-swatch"
                                      style={{ background: preset.value }}
                                      onClick={() => {
                                        apply('textGradient', preset.value);
                                        setShowTextColorPicker(false);
                                      }}
                                      title={preset.name}
                                    />
                                  ))}
                                </div>
                                <div className="custom-gradient-info">
                                  <small>Select a preset to apply text gradient</small>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="etb-color-container" ref={bgColorRef}>
                        <button className="etb-btn etb-btn-small etb-color-btn" onClick={() => {
                          // Save current selection before opening picker
                          const sel = window.getSelection();
                          if (sel && sel.rangeCount > 0) {
                            setSavedRange(sel.getRangeAt(0).cloneRange());
                          }
                          setShowBgColorPicker(!showBgColorPicker);
                        }} title="Text Highlight Color">
                          <i className="ri-mark-pen-line"></i>
                          <div className="color-bar" style={{ backgroundColor: currentBgColor }}></div>
                        </button>
                        {showBgColorPicker && (
                          <div className="color-picker-panel extended-panel">
                            <div className="color-palette-scroll">
                              {Object.entries(colorPalette).map(([category, colors]) => (
                                <div key={category} className="color-row-group">
                                  <div className="color-category-label">{category}</div>
                                  <div className="color-preset-grid compact">
                                    {colors.map(color => (
                                      <div
                                        key={color}
                                        className="color-swatch small"
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                          // Restore saved selection before applying
                                          if (savedRange) {
                                            const sel = window.getSelection();
                                            sel.removeAllRanges();
                                            sel.addRange(savedRange);
                                          }
                                          setCurrentBgColor(color);
                                          apply('backColor', color);
                                          setShowBgColorPicker(false);
                                          setSavedRange(null);
                                        }}
                                        title={color}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="custom-color-section">
                              <label>Custom:</label>
                              <div className="custom-color-input">
                                <input
                                  type="color"
                                  value={customBgColor}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setCustomBgColor(val);
                                    setCurrentBgColor(val);
                                    apply('backColor', val);
                                  }}
                                />
                                <input
                                  type="text"
                                  value={customBgColor}
                                  onChange={(e) => setCustomBgColor(e.target.value)}
                                  placeholder="#ffff00"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        className="etb-btn etb-btn-small"
                        onClick={() => apply('increaseFontSize')}
                        title="Increase Font Size (Ctrl+])"
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>A</span>
                        <span style={{ position: 'absolute', top: '2px', fontSize: '8px', color: '#3b82f6' }}>▲</span>
                      </button>
                      <button
                        className="etb-btn etb-btn-small"
                        onClick={() => apply('decreaseFontSize')}
                        title="Decrease Font Size (Ctrl+[)"
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>A</span>
                        <span style={{ position: 'absolute', bottom: '2px', fontSize: '8px', color: '#3b82f6' }}>▼</span>
                      </button>
                      <button
                        className="etb-btn etb-btn-small"
                        onClick={() => focusAndApply('removeFormat')}
                        title="Clear All Formatting"
                      >
                        <i className="ri-format-clear"></i>
                      </button>
                      <div className="etb-color-container" ref={changeCaseRef}>
                        <button
                          className="etb-btn etb-btn-small etb-change-case-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setChangeCaseMenuPosition({
                              top: rect.bottom + 2 + window.scrollY,
                              left: rect.left + window.scrollX
                            });
                            setShowChangeCasePopup((v) => !v);
                          }}
                          title="Change Case"
                        >
                          <span className="change-case-icon">Aa</span>
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                        {showChangeCasePopup && (
                          <div
                            className="change-case-popup"
                            style={{ position: 'fixed', top: changeCaseMenuPosition.top, left: changeCaseMenuPosition.left }}
                          >
                            <button onClick={() => { apply('changeCase', 'sentence'); setShowChangeCasePopup(false); }}>
                              Sentence case
                            </button>
                            <button onClick={() => { apply('changeCase', 'lower'); setShowChangeCasePopup(false); }}>
                              lowercase
                            </button>
                            <button onClick={() => { apply('changeCase', 'upper'); setShowChangeCasePopup(false); }}>
                              UPPERCASE
                            </button>
                            <button onClick={() => { apply('changeCase', 'capitalize'); setShowChangeCasePopup(false); }}>
                              Capitalize Each Word
                            </button>
                            <button onClick={() => { apply('changeCase', 'toggle'); setShowChangeCasePopup(false); }}>
                              tOGGLE cASE
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="etb-group-label">Font</div>
              </div>

              {/* Paragraph group */}
              <div className="etb-group etb-bullet-section">
                <div className="etb-group-content">
                  <div className="etb-col">
                    {/* ROW 1: Lists, Indents, Sort, Show/Hide */}
                    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {/* Bullets */}
                      <div className="etb-split-btn-container" ref={bulletRef}>
                        <button className="etb-btn etb-btn-small" onClick={() => apply('insertUnorderedList')} title="Bullets">
                          <i className="ri-list-unordered"></i>
                        </button>
                        <button className="etb-btn etb-btn-small etb-dropdown-trigger" onClick={() => setShowBulletDropdown(!showBulletDropdown)}>
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                        {showBulletDropdown && (
                          <div className="etb-popup-menu list-dropdown">
                            <div className="list-library-section">
                              <div className="list-section-title">Bullet Library</div>
                              <div className="list-options-grid">
                                <button className="list-option-btn" onClick={() => { apply('insertUnorderedList'); setShowBulletDropdown(false); }} title="None">None</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleDisc'); setShowBulletDropdown(false); }} title="Disc">●</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleCircle'); setShowBulletDropdown(false); }} title="Circle">○</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleSquare'); setShowBulletDropdown(false); }} title="Square">■</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleDiamond'); setShowBulletDropdown(false); }} title="Diamond">❖</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleArrow'); setShowBulletDropdown(false); }} title="Arrow">➢</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleCheck'); setShowBulletDropdown(false); }} title="Check">✓</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Numbering */}
                      <div className="etb-split-btn-container" ref={numberingRef}>
                        <button className="etb-btn etb-btn-small" onClick={() => apply('insertOrderedList')} title="Numbering">
                          <i className="ri-list-ordered"></i>
                        </button>
                        <button className="etb-btn etb-btn-small etb-dropdown-trigger" onClick={() => setShowNumberingDropdown(!showNumberingDropdown)}>
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                        {showNumberingDropdown && (
                          <div className="etb-popup-menu list-dropdown">
                            <div className="list-library-section">
                              <div className="list-section-title">Numbering Library</div>
                              <div className="list-options-grid">
                                <button className="list-option-btn" onClick={() => { apply('insertOrderedList'); setShowNumberingDropdown(false); }} title="None">None</button>
                                <button className="list-option-btn" onClick={() => { apply('numberingStyle123'); setShowNumberingDropdown(false); }}>1. 2. 3.</button>
                                <button className="list-option-btn" onClick={() => { apply('numberingStyleParen'); setShowNumberingDropdown(false); }}>1) 2) 3)</button>
                                <button className="list-option-btn" onClick={() => { apply('numberingStyleRoman'); setShowNumberingDropdown(false); }}>I. II. III.</button>
                                <button className="list-option-btn" onClick={() => { apply('numberingStyleAlphaUpper'); setShowNumberingDropdown(false); }}>A. B. C.</button>
                                <button className="list-option-btn" onClick={() => { apply('numberingStyleAlphaLower'); setShowNumberingDropdown(false); }}>a. b. c.</button>
                                <button className="list-option-btn" onClick={() => { apply('numberingStyleAlphaParen'); setShowNumberingDropdown(false); }}>a) b) c)</button>
                                <button className="list-option-btn" onClick={() => { apply('numberingStyleRomanLower'); setShowNumberingDropdown(false); }}>i. ii. iii.</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Multilevel List */}
                      <div className="etb-split-btn-container" ref={multilevelRef}>
                        <button className="etb-btn etb-btn-small" onClick={() => setShowMultilevelDropdown(!showMultilevelDropdown)} title="Multilevel List">
                          <i className="ri-list-check-2"></i>
                          <i className="ri-arrow-down-s-line" style={{ fontSize: '10px', marginLeft: '2px' }}></i>
                        </button>
                        {showMultilevelDropdown && (
                          <div className="etb-popup-menu list-dropdown">
                            <div className="list-library-section">
                              <div className="list-section-title">List Library</div>
                              <div className="list-options-grid">
                                <button className="list-option-btn" onClick={() => { apply('multilevelStyle1'); setShowMultilevelDropdown(false); }}>1. a. i.</button>
                                <button className="list-option-btn" onClick={() => { apply('multilevelStyle2'); setShowMultilevelDropdown(false); }}>1. 1.1 1.1.1</button>
                                <button className="list-option-btn" onClick={() => { apply('multilevelStyle3'); setShowMultilevelDropdown(false); }}>Article I.</button>
                                <button className="list-option-btn" onClick={() => { apply('multilevelStyle4'); setShowMultilevelDropdown(false); }}>1. (a) (i)</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="etb-divider"></div>

                      {/* Indents */}
                      <button className="etb-btn etb-btn-small" onClick={() => apply('outdent')} title="Decrease Indent">
                        <i className="ri-indent-decrease"></i>
                      </button>
                      <button className="etb-btn etb-btn-small" onClick={() => apply('indent')} title="Increase Indent">
                        <i className="ri-indent-increase"></i>
                      </button>

                      <div className="etb-divider"></div>

                      {/* Sort */}
                      <button className="etb-btn etb-btn-small" onClick={() => apply('sortParagraphs', 'asc')} title="Sort A–Z">
                        <i className="ri-sort-asc"></i>
                      </button>

                      {/* Show/Hide */}
                      <button className="etb-btn etb-btn-small" onClick={() => apply('showFormattingMarks')} title="Show/Hide ¶ formatting marks">
                        ¶
                      </button>
                    </div>

                    {/* ROW 2: Alignment, Spacing, Shading, Borders */}
                    <div style={{ display: 'flex', gap: 2, marginTop: 4, alignItems: 'center' }}>
                      {/* Alignment */}
                      <button className="etb-btn etb-btn-small" onClick={() => apply('justifyLeft')} title="Align Left">
                        <i className="ri-align-left"></i>
                      </button>
                      <button className="etb-btn etb-btn-small" onClick={() => apply('justifyCenter')} title="Center">
                        <i className="ri-align-center"></i>
                      </button>
                      <button className="etb-btn etb-btn-small" onClick={() => apply('justifyRight')} title="Align Right">
                        <i className="ri-align-right"></i>
                      </button>
                      <button className="etb-btn etb-btn-small" onClick={() => apply('justifyFull')} title="Justify">
                        <i className="ri-align-justify"></i>
                      </button>

                      <div className="etb-divider"></div>

                      {/* Line Spacing */}
                      <div className="etb-split-btn-container">
                        <button
                          className="etb-btn etb-btn-small etb-dropdown-trigger"
                          onClick={() => setShowLineSpacingDropdown(!showLineSpacingDropdown)}
                          title="Line and Paragraph Spacing"
                          style={{ minWidth: '30px' }}
                        >
                          <i className="ri-line-height"></i>
                          <i className="ri-arrow-down-s-line" style={{ fontSize: '10px', marginLeft: '2px' }}></i>
                        </button>
                        {showLineSpacingDropdown && (
                          <div className="etb-popup-menu list-dropdown" style={{ minWidth: '220px' }}>
                            <div className="list-library-section">
                              <div className="list-options-grid" style={{ gridTemplateColumns: '1fr', gap: '0' }}>
                                {[1.0, 1.15, 1.5, 2.0, 2.5, 3.0].map(val => (
                                  <button
                                    key={val}
                                    className="list-option-btn"
                                    onClick={() => { apply('lineHeight', val); setShowLineSpacingDropdown(false); }}
                                    style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '6px 12px', height: 'auto' }}
                                  >
                                    {val.toFixed(1)}
                                  </button>
                                ))}
                                <div className="etb-menu-separator" style={{ margin: '4px 0', borderTop: '1px solid #e1e1e1' }}></div>
                                <button className="list-option-btn" onClick={() => { setShowParagraphDialog(true); setShowLineSpacingDropdown(false); }} style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '6px 12px', height: 'auto' }}>
                                  Line Spacing Options...
                                </button>
                                <div className="etb-menu-separator" style={{ margin: '4px 0', borderTop: '1px solid #e1e1e1' }}></div>
                                <button className="list-option-btn" onClick={() => { apply(currentFormat.spaceBefore ? 'removeSpaceBefore' : 'addSpaceBefore'); setShowLineSpacingDropdown(false); }} style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '6px 12px', height: 'auto' }}>
                                  {currentFormat.spaceBefore ? 'Remove Space Before Paragraph' : 'Add Space Before Paragraph'}
                                </button>
                                <button className="list-option-btn" onClick={() => { apply(currentFormat.spaceAfter ? 'removeSpaceAfter' : 'addSpaceAfter'); setShowLineSpacingDropdown(false); }} style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '6px 12px', height: 'auto' }}>
                                  {currentFormat.spaceAfter ? 'Remove Space After Paragraph' : 'Add Space After Paragraph'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Shading */}
                      <div className="etb-split-btn-container" ref={shadingRef}>
                        <button className="etb-btn etb-btn-small" onClick={() => apply('paragraphShading', currentShadingColor)} title="Shading" style={{ position: 'relative', flexDirection: 'column', gap: 0, padding: '2px 4px' }}>
                          <i className="ri-paint-fill"></i>
                          <div style={{ width: '100%', height: '3px', backgroundColor: currentShadingColor !== 'transparent' ? currentShadingColor : '#666', marginTop: '1px' }}></div>
                        </button>
                        <button className="etb-btn etb-btn-small etb-dropdown-trigger" onClick={() => setShowShadingDropdown(!showShadingDropdown)}>
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                        {showShadingDropdown && (
                          <div className="color-picker-panel" style={{ position: 'absolute', top: '100%', left: 0, transform: 'none', marginTop: '4px', width: '260px', maxHeight: '400px', overflowY: 'auto' }}>
                            <div className="color-section-label">Theme Colors</div>
                            <div style={{ marginBottom: '12px' }}>
                              {/* Theme Colors Base Row */}
                              <div className="color-preset-grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', marginBottom: '2px' }}>
                                {['#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646'].map(color => (
                                  <div key={color} className="color-swatch-wrapper">
                                    <div className="color-swatch small" style={{ backgroundColor: color }} onClick={() => { console.log('🎨 COLOR CLICKED:', color); setCurrentShadingColor(color); apply('paragraphShading', color); setShowShadingDropdown(false); }} title={color} />
                                  </div>
                                ))}
                              </div>

                              {/* Tints and Shades - 5 rows */}
                              {[
                                ['#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#daeef3', '#fde9d9'],
                                ['#d9d9d9', '#595959', '#c4bd97', '#8db3e2', '#b7dde8', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fbd5b5'],
                                ['#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#92cddc', '#fac08f'],
                                ['#a6a6a6', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#31859b', '#e36c09'],
                                ['#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#205867', '#974806']
                              ].map((row, rowIndex) => (
                                <div key={rowIndex} className="color-preset-grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', marginBottom: '2px' }}>
                                  {row.map(color => (
                                    <div key={color} className="color-swatch-wrapper">
                                      <div className="color-swatch small" style={{ backgroundColor: color }} onClick={() => { setCurrentShadingColor(color); apply('paragraphShading', color); setShowShadingDropdown(false); }} title={color} />
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>

                            <div className="color-section-label">Standard Colors</div>
                            <div className="color-preset-grid" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gap: '2px', marginBottom: '8px' }}>
                              {['#c00000', '#ff0000', '#ffc000', '#ffff00', '#92d050', '#00b050', '#00b0f0', '#0070c0', '#002060', '#7030a0'].map(color => (
                                <div key={color} className="color-swatch-wrapper">
                                  <div className="color-swatch small" style={{ backgroundColor: color }} onClick={() => { setCurrentShadingColor(color); apply('paragraphShading', color); setShowShadingDropdown(false); }} title={color} />
                                </div>
                              ))}
                            </div>

                            <div className="etb-menu-separator" style={{ margin: '8px 0', borderTop: '1px solid var(--etb-border, #e1e1e1)' }}></div>

                            <button className="list-option-btn" onClick={() => { setCurrentShadingColor('transparent'); apply('paragraphShading', 'transparent'); setShowShadingDropdown(false); }} style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '6px 8px', height: 'auto', width: '100%' }}>
                              <div style={{ width: '16px', height: '16px', border: '1px solid #ccc', marginRight: '8px', background: 'transparent' }}></div>
                              No Color
                            </button>
                            <button className="list-option-btn" onClick={() => setShowShadingDropdown(false)} style={{ justifyContent: 'flex-start', fontSize: '13px', padding: '6px 8px', height: 'auto', width: '100%' }}>
                              More Colors...
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Borders */}
                      <div className="etb-split-btn-container" ref={bordersRef}>
                        <button className="etb-btn etb-btn-small" onClick={() => setShowBordersDialog(true)} title="Borders">
                          <i className="ri-table-line" style={{ fontSize: '16px' }}></i>
                        </button>
                        <button className="etb-btn etb-btn-small etb-dropdown-trigger" onClick={() => setShowBordersDropdown(!showBordersDropdown)}>
                          <i className="ri-arrow-down-s-line"></i>
                        </button>
                        {showBordersDropdown && (
                          <div className="etb-popup-menu list-dropdown" style={{ minWidth: '200px' }}>
                            <div className="list-library-section">
                              <div className="list-options-grid" style={{ gridTemplateColumns: '1fr', gap: '0' }}>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'bottom'); setShowBordersDropdown(false); }} title="Bottom Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>▁</span> Bottom Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'top'); setShowBordersDropdown(false); }} title="Top Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>▔</span> Top Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'left'); setShowBordersDropdown(false); }} title="Left Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>▏</span> Left Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'right'); setShowBordersDropdown(false); }} title="Right Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>▕</span> Right Border
                                </button>
                                <div className="etb-menu-separator" style={{ margin: '4px 0', borderTop: '1px solid #e1e1e1' }}></div>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'none'); setShowBordersDropdown(false); }} title="No Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-close-line"></i> No Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'all'); setShowBordersDropdown(false); }} title="All Borders" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>▢</span> All Borders
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'outside'); setShowBordersDropdown(false); }} title="Outside Borders" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>□</span> Outside Borders
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'inside'); setShowBordersDropdown(false); }} title="Inside Borders" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <span style={{ fontSize: '14px', fontFamily: 'monospace' }}>╬</span> Inside Borders
                                </button>
                                <div className="etb-menu-separator" style={{ margin: '4px 0', borderTop: '1px solid #e1e1e1' }}></div>
                                <button className="list-option-btn" onClick={() => { apply('insertHorizontalLine'); setShowBordersDropdown(false); }} title="Horizontal Line" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-separator"></i> Horizontal Line
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('drawTable'); setShowBordersDropdown(false); }} title="Draw Table" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-pencil-ruler-2-line"></i> Draw Table
                                </button>
                                <button className="list-option-btn" onClick={() => { setShowBordersDropdown(false); }} title="View Gridlines" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-grid-line"></i> View Gridlines
                                </button>
                                <div className="etb-menu-separator" style={{ margin: '4px 0', borderTop: '1px solid #e1e1e1' }}></div>
                                <button className="list-option-btn" onClick={() => { setShowBordersDropdown(false); setShowBordersDialog(true); }} title="Borders and Shading" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-settings-4-line"></i> Borders and Shading...
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="etb-group-label">
                  Paragraph
                  <button
                    className="etb-dialog-launcher"
                    onClick={() => setShowParagraphDialog(true)}
                    title="Paragraph Settings"
                  >
                    <i className="ri-arrow-right-down-line"></i>
                  </button>
                </div>
              </div>

              {showParagraphDialog && (
                <ParagraphDialog
                  isOpen={showParagraphDialog}
                  onClose={() => setShowParagraphDialog(false)}
                  onApply={(settings) => apply('paragraphSettings', settings)}
                />
              )}

              {showBordersDialog && (
                <BordersDialog
                  onClose={() => setShowBordersDialog(false)}
                  onApply={(settings) => {
                    // Apply border settings
                    const { borders, shading } = settings;

                    // Apply borders if any are set
                    if (borders.top || borders.bottom || borders.left || borders.right) {
                      const borderValue = `${borders.cssWidth || borders.width + 'pt'} ${borders.cssStyle || 'solid'} ${borders.color}`; console.log('Border value:', borderValue, 'cssStyle:', borders.cssStyle);

                      // Store border styling in a global variable for the editor to use
                      window.currentBorderStyle = borderValue;

                      if (borders.top) apply('paragraphBorders', 'top');
                      if (borders.bottom) apply('paragraphBorders', 'bottom');
                      if (borders.left) apply('paragraphBorders', 'left');
                      if (borders.right) apply('paragraphBorders', 'right');
                    } else if (borders.setting === 'none') {
                      apply('paragraphBorders', 'none');
                    }

                    // Apply shading
                    if (shading.fill && shading.fill !== 'transparent') {
                      apply('paragraphShading', shading.fill);
                    }
                  }}
                />
              )}


              {/* Styles group */}
              <div className="etb-group etb-styles-section">
                <div className="etb-group-content" style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
                    <div className="etb-styles-gallery" ref={stylesGalleryRef}>
                      {(() => {
                        // Merge default styles with custom styles
                        const allStyles = [...stylesList];
                        if (availableStyles) {
                          Object.keys(availableStyles).forEach(key => {
                            if (!allStyles.find(s => s.type === key)) {
                              allStyles.push({ name: key, className: 'custom-style', type: key });
                            }
                          });
                        }

                        return allStyles.map((style, index) => {
                          const styleDef = availableStyles && availableStyles[style.type];

                          // Build preview style object, filtering out undefined values
                          // IMPORTANT: Exclude 'color' to let CSS handle text color for proper dark/light mode support
                          const previewStyle = {};
                          if (styleDef) {
                            // Do NOT apply color - let CSS handle it for theme support
                            if (styleDef.backgroundColor) previewStyle.backgroundColor = styleDef.backgroundColor;
                            if (styleDef.fontWeight) previewStyle.fontWeight = styleDef.fontWeight;
                            if (styleDef.fontStyle) previewStyle.fontStyle = styleDef.fontStyle;
                            if (styleDef.textDecoration) previewStyle.textDecoration = styleDef.textDecoration;
                            if (styleDef.fontFamily) previewStyle.fontFamily = styleDef.fontFamily;
                            // Scale down large font sizes for preview
                            if (styleDef.fontSize) {
                              const sizeNum = parseFloat(styleDef.fontSize);
                              previewStyle.fontSize = sizeNum > 14 ? '14pt' : styleDef.fontSize;
                            }
                          }

                          return (
                            <div key={index} className="style-item" onClick={() => apply('applyTextStyle', style.type)}>
                              <div className={`style-preview ${style.className}`} style={previewStyle}>{style.name}</div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                    <div className="etb-gallery-controls">
                      <button className="etb-gallery-btn" title="Previous Row" onClick={() => scrollGallery(-60)}>
                        <i className="ri-arrow-up-s-line"></i>
                      </button>
                      <button className="etb-gallery-btn" title="Next Row" onClick={() => scrollGallery(60)}>
                        <i className="ri-arrow-down-s-line"></i>
                      </button>
                      <button
                        className="etb-gallery-btn"
                        title="More"
                        onClick={() => setShowStylesDropdown(!showStylesDropdown)}
                      >
                        <i className="ri-arrow-down-double-line"></i>
                      </button>
                    </div>
                    {showStylesDropdown && (
                      <div className="etb-styles-dropdown-panel" ref={stylesDropdownRef}>
                        <div className="styles-grid-container">
                          {stylesList.map((style, index) => (
                            <div key={index} className="style-item dropdown-item" onClick={() => { apply('applyTextStyle', style.type); setShowStylesDropdown(false); }}>
                              <div className={`style-preview ${style.className}`}>{style.name}</div>
                            </div>
                          ))}
                        </div>
                        <div className="etb-menu-separator"></div>
                        <div className="styles-dropdown-actions">
                          <button className="list-option-btn" onClick={() => {
                            const name = prompt('Name of new style:');
                            if (name) apply('createStyle', name);
                            setShowStylesDropdown(false);
                          }}>Create a Style</button>
                          <button className="list-option-btn" onClick={() => { apply('removeFormat'); setShowStylesDropdown(false); }}>Clear Formatting</button>
                          <button className="list-option-btn" onClick={() => {
                            const styleName = prompt('Enter style name to apply:');
                            if (styleName) apply('applyTextStyle', styleName);
                            setShowStylesDropdown(false);
                          }}>Apply Styles...</button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Change Styles Button (Word-like) */}
                  <div className="etb-change-styles-btn">
                    <button className="etb-btn etb-btn-vertical" title="Change Styles" onClick={() => setShowChangeStylesDialog(true)}>
                      <i className="ri-palette-line" style={{ color: 'var(--etb-accent)' }}></i>
                      <span className="btn-label">Change<br />Styles</span>
                    </button>
                  </div>
                </div>
                <div className="etb-group-label">Styles</div>
              </div>

              {/* Editing group */}
              <div className="etb-group etb-find-section" ref={findReplaceRef}>
                <div className="etb-group-content">
                  <div className="etb-col" style={{ gap: 1 }}>
                    <button className="etb-btn etb-btn-small" onClick={() => setShowFindReplace(!showFindReplace)} title="Find (Ctrl+F)">
                      <i className="ri-search-line"></i>
                    </button>
                    {showFindReplace && (
                      <div className="find-replace-popup">
                        <div className="find-replace-header">
                          <h4>Find & Replace</h4>
                          <button onClick={() => setShowFindReplace(false)} className="close-btn">×</button>
                        </div>
                        <div className="find-replace-content">
                          <div className="input-group">
                            <label>Find:</label>
                            <input
                              type="text"
                              value={findText}
                              onChange={(e) => setFindText(e.target.value)}
                              placeholder="Enter text to find"
                            />
                            <button onClick={() => apply('findNext', findText)} disabled={!findText}>Find Next</button>
                          </div>
                          <div className="input-group">
                            <label>Replace:</label>
                            <input
                              type="text"
                              value={replaceText}
                              onChange={(e) => setReplaceText(e.target.value)}
                              placeholder="Enter replacement text"
                            />
                            <button onClick={() => apply('replaceOne', { find: findText, replace: replaceText })} disabled={!findText}>Replace</button>
                            <button onClick={() => apply('replaceAll', { find: findText, replace: replaceText })} disabled={!findText}>Replace All</button>
                          </div>
                        </div>
                      </div>
                    )}


                    {/* Select Dropdown */}
                    <div className="etb-dropdown-container" ref={findReplaceRef}>
                      <button
                        className="etb-btn etb-btn-small"
                        onClick={() => setShowSelectDropdown(!showSelectDropdown)}
                        title="Select"
                      >
                        <i className="ri-checkbox-multiple-line"></i>
                      </button>

                      {showSelectDropdown && (
                        <div className="etb-dropdown-menu etb-dropdown-menu-right" style={{ minWidth: '280px' }}>
                          <div
                            className="etb-dropdown-item"
                            onClick={() => {
                              apply('selectAll');
                              setShowSelectDropdown(false);
                            }}
                          >
                            <i className="ri-checkbox-multiple-line"></i>
                            <span>Select All</span>
                          </div>
                          <div
                            className="etb-dropdown-item"
                            onClick={() => {
                              apply('selectObjects');
                              setShowSelectDropdown(false);
                            }}
                          >
                            <i className="ri-shapes-line"></i>
                            <span>Select Objects</span>
                          </div>
                          <div
                            className="etb-dropdown-item"
                            onClick={() => {
                              apply('selectSimilarFormatting');
                              setShowSelectDropdown(false);
                            }}
                          >
                            <i className="ri-text"></i>
                            <span>Select All Text With Similar Formatting</span>
                          </div>
                          <div className="etb-dropdown-divider"></div>
                          <div
                            className="etb-dropdown-item"
                            onClick={() => {
                              setShowSelectionPane(true);
                              setShowSelectDropdown(false);
                            }}
                          >
                            <i className="ri-layout-right-line"></i>
                            <span>Selection Pane...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="etb-group-label">Editing</div>
              </div>
            </div>
          </>
        )}
        {selectedTool === 'Insert' && (
          <>
            <div className="etb-row">
              <div className="etb-section">
                <button className="etb-btn etb-btn-vertical" onClick={() => apply('insertPageBreak')} title="Page Break - Inserts a page break">
                  <i className="ri-file-paper-line"></i>
                  <span className="btn-label">Page Break</span>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={tableRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowTablePopup(!showTablePopup)} title="Table - Insert a table">
                  <i className="ri-table-line"></i>
                  <span className="btn-label">Table</span>
                </button>
                {showTablePopup && (
                  <div className="table-selector-popup">
                    <div className="table-grid">
                      {Array.from({ length: 10 }, (_, row) => (
                        Array.from({ length: 8 }, (_, col) => (
                          <div
                            key={`${row}-${col}`}
                            className={`table-cell ${row < tableRows && col < tableCols ? 'selected' : ''
                              }`}
                            onMouseEnter={() => {
                              setTableRows(row + 1);
                              setTableCols(col + 1);
                            }}
                            onClick={() => {
                              apply('insertTable', { rows: row + 1, cols: col + 1 });
                              setShowTablePopup(false);
                              setTableRows(3);
                              setTableCols(3);
                            }}
                          />
                        ))
                      )).flat()}
                    </div>
                    <div className="table-info">
                      {tableRows} x {tableCols} Table
                    </div>
                    <div className="table-actions">
                      <button onClick={() => {
                        const customRows = parseInt(prompt('Enter number of rows (1-50):', tableRows));
                        const customCols = parseInt(prompt('Enter number of columns (1-20):', tableCols));
                        if (customRows > 0 && customRows <= 50 && customCols > 0 && customCols <= 20) {
                          apply('insertTable', { rows: customRows, cols: customCols });
                          setShowTablePopup(false);
                        }
                      }}>Custom Size...</button>
                    </div>
                  </div>
                )}
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={imageRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      apply('insertImageFile', file);
                    }
                  };
                  input.click();
                }} title="Image - Insert image">
                  <i className="ri-image-line"></i>
                  <span className="btn-label">Image</span>
                </button>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowDrawing(true)} title="Drawing - Open drawing tool">
                  <i className="ri-brush-line"></i>
                  <span className="btn-label">Drawing</span>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={linkRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowLinkPopup(!showLinkPopup)} title="Link - Insert hyperlink">
                  <i className="ri-link"></i>
                  <span className="btn-label">Link</span>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={headerFooterRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowHeaderFooterPopup(!showHeaderFooterPopup)} title="Header & Footer - Configure page headers and footers">
                  <i className="ri-layout-top-2-line"></i>
                  <span className="btn-label">Header/Footer</span>
                </button>
                <button className="etb-btn etb-btn-vertical" onClick={() => {
                  const quickPageConfig = {
                    ...headerFooterConfig,
                    pageNumbers: {
                      enabled: true,
                      type: 'numeric',
                      position: 'footer-right',
                      format: 'Page {n}'
                    }
                  };
                  apply('headerFooter', quickPageConfig);
                }} title="Page Numbers - Quickly add page numbers to footer">
                  <i className="ri-hashtag"></i>
                  <span className="btn-label">Page Numbers</span>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={symbolsRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowSymbolsPopup(!showSymbolsPopup)} title="Insert Symbol">
                  <i className="ri-omega"></i>
                  <span className="btn-label">Symbols</span>
                </button>
                <button className="etb-btn etb-btn-vertical" onClick={() => apply('showNotification', 'Equations feature coming soon!')} title="Insert Equation">
                  <i className="ri-functions"></i>
                  <span className="btn-label">Equations</span>
                </button>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowEmojiPopup(!showEmojiPopup)} title="Insert Emoji">
                  <i className="ri-emotion-happy-line"></i>
                  <span className="btn-label">Emoji</span>
                </button>

                {showLinkPopup && (
                  <div className="insert-popup">
                    <div className="popup-header">
                      <h4>Insert Link</h4>
                      <button onClick={() => setShowLinkPopup(false)} className="close-btn">×</button>
                    </div>
                    <div className="popup-content">
                      <div className="input-group">
                        <label>URL:</label>
                        <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" />
                      </div>
                      <div className="input-group">
                        <label>Text:</label>
                        <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Link text" />
                      </div>
                      <div className="popup-actions">
                        <button onClick={() => { apply('insertLink', { url: linkUrl, text: linkText }); setShowLinkPopup(false); setLinkUrl(''); setLinkText(''); }} disabled={!linkUrl}>Insert</button>
                        <button onClick={() => { setShowLinkPopup(false); setLinkUrl(''); setLinkText(''); }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {showDrawing && (
              <div className="drawing-overlay">
                <div className="drawing-canvas-container">
                  <div className="drawing-header">
                    <h3>Drawing Tool</h3>
                    <button onClick={() => setShowDrawing(false)} className="close-btn">×</button>
                  </div>
                  <div className="drawing-tools">
                    <button
                      className={drawingTool === 'pen' ? 'active' : ''}
                      onClick={() => setDrawingTool('pen')}
                      title="Pen"
                    >
                      <i className="ri-pencil-line"></i>
                    </button>
                    <button
                      className={drawingTool === 'brush' ? 'active' : ''}
                      onClick={() => setDrawingTool('brush')}
                      title="Brush"
                    >
                      <i className="ri-brush-line"></i>
                    </button>
                    <button
                      className={drawingTool === 'eraser' ? 'active' : ''}
                      onClick={() => setDrawingTool('eraser')}
                      title="Eraser"
                    >
                      <i className="ri-eraser-line"></i>
                    </button>
                    <button
                      className={drawingTool === 'line' ? 'active' : ''}
                      onClick={() => setDrawingTool('line')}
                      title="Line"
                    >
                      <i className="ri-subtract-line"></i>
                    </button>
                    <button
                      className={drawingTool === 'rectangle' ? 'active' : ''}
                      onClick={() => setDrawingTool('rectangle')}
                      title="Rectangle"
                    >
                      <i className="ri-rectangle-line"></i>
                    </button>
                    <button
                      className={drawingTool === 'circle' ? 'active' : ''}
                      onClick={() => setDrawingTool('circle')}
                      title="Circle"
                    >
                      <i className="ri-circle-line"></i>
                    </button>
                    <input
                      type="color"
                      value={drawingColor}
                      onChange={(e) => setDrawingColor(e.target.value)}
                      title="Color"
                    />
                    <input
                      type="range"
                      min="1"
                      max="20"
                      value={brushSize}
                      onChange={(e) => setBrushSize(e.target.value)}
                      title="Brush Size"
                    />
                    <span className="brush-size-label">{brushSize}px</span>
                  </div>
                  <canvas
                    ref={canvasRef}
                    width="600"
                    height="400"
                    style={{ border: '1px solid #ccc', background: 'white', cursor: 'crosshair' }}
                    onMouseDown={(e) => {
                      setIsDrawing(true);
                      const canvas = canvasRef.current;
                      const rect = canvas.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const ctx = canvas.getContext('2d');

                      if (drawingTool === 'pen' || drawingTool === 'brush') {
                        ctx.beginPath();
                        ctx.moveTo(x, y);
                      }
                    }}
                    onMouseMove={(e) => {
                      if (!isDrawing) return;
                      const canvas = canvasRef.current;
                      const rect = canvas.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const ctx = canvas.getContext('2d');

                      ctx.lineWidth = brushSize;
                      ctx.lineCap = 'round';

                      if (drawingTool === 'pen') {
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.strokeStyle = drawingColor;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                      } else if (drawingTool === 'brush') {
                        ctx.globalCompositeOperation = 'source-over';
                        ctx.strokeStyle = drawingColor;
                        ctx.lineWidth = brushSize * 2;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                      } else if (drawingTool === 'eraser') {
                        ctx.globalCompositeOperation = 'destination-out';
                        ctx.lineWidth = brushSize * 3;
                        ctx.lineTo(x, y);
                        ctx.stroke();
                      }
                    }}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                  ></canvas>
                  <div className="drawing-actions">
                    <button onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const dataURL = canvas.toDataURL();
                        apply('insertDrawing', dataURL);
                        setShowDrawing(false);
                      }
                    }}>Insert Drawing</button>
                    <button onClick={() => {
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const ctx = canvas.getContext('2d');
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                      }
                    }}>Clear</button>
                    <button onClick={() => setShowDrawing(false)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {showSymbolsPopup && (
              <div className="drawing-overlay" onClick={() => setShowSymbolsPopup(false)}>
                <div className="header-footer-container" onClick={(e) => e.stopPropagation()}>
                  <div className="popup-header">
                    <h3>Insert Symbol</h3>
                    <button onClick={() => setShowSymbolsPopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="header-footer-content">
                    <div className="symbols-backstage-grid">
                      {[
                        '•', '€', '£', '¥', '©', '®', '™', '±', '≠', '≤', '≥', '÷', '×', '∞', 'μ', 'α', 'β', 'π', 'Ω', 'Σ', '°', 'Δ', '☺', '♥', '₹', '¿', '¡', '—', '…',
                        'À', 'Á', 'Â', 'Ã', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ù', 'Ú', 'Û', 'Ü', 'ß',
                        'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ù', 'ú', 'û', 'ü', 'ÿ', 'Ğ', 'ğ', 'İ', 'ı', 'Œ', 'œ', 'Ş', 'ş', 'Ÿ'
                      ].map((symbol, index) => (
                        <button
                          key={index}
                          className="symbol-backstage-btn"
                          onClick={() => {
                            insertSymbolOrEmoji(symbol);
                            setShowSymbolsPopup(false);
                          }}
                          title={`Insert ${symbol}`}
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showEmojiPopup && (
              <div className="drawing-overlay" onClick={() => setShowEmojiPopup(false)}>
                <div className="header-footer-container" onClick={(e) => e.stopPropagation()}>
                  <div className="popup-header">
                    <h3>Insert Emoji</h3>
                    <button onClick={() => setShowEmojiPopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="header-footer-content">
                    <div className="symbols-backstage-grid">
                      {[
                        '😀', '😁', '😂', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '😙', '😚',
                        '🙂', '🙃', '😉', '😊', '😇', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜',
                        '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '😏', '😒', '😞', '😔', '😖', '😥', '😰', '😨', '😧', '😩',
                        '😢', '😭', '😱', '😨', '😰', '😥', '😓', '😣', '😩', '😫', '😵', '😲', '🤐', '🥴', '🤢', '🤮',
                        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
                        '❤️', '💛', '💚', '💙', '💜', '🦤', '🖤', '🤍', '💔', '❣️', '💕', '💖', '💗', '💓', '💞', '💘',
                        '🎉', '🎊', '🎈', '🎇', '🎆', '🎅', '🎄', '🎁', '🎀', '🎍', '🎎', '🎏', '🎐', '🎑', '🎒', '🎓'
                      ].map((emoji, index) => (
                        <button
                          key={index}
                          className="symbol-backstage-btn"
                          onClick={() => {
                            insertSymbolOrEmoji(emoji);
                            setShowEmojiPopup(false);
                          }}
                          title={`Insert ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showHeaderFooterPopup && (
              <div className="drawing-overlay" onClick={() => setShowHeaderFooterPopup(false)}>
                <div className="header-footer-container" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                  <div className="popup-header">
                    <h3>Header & Footer Configuration</h3>
                    <button onClick={() => setShowHeaderFooterPopup(false)} className="close-btn">×</button>
                  </div>

                  <div className="header-footer-content">
                    {/* Header Section */}
                    <div className="config-section">
                      <h4><i className="ri-layout-top-line"></i> Header Settings</h4>
                      <div className="config-row">
                        <div className="config-group">
                          <label>Header Text:</label>
                          <input
                            type="text"
                            value={headerFooterConfig.headerText}
                            onChange={(e) => updateHeaderFooterConfig('headerText', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            placeholder="Enter header text"
                          />
                        </div>
                        <div className="config-group">
                          <label>Alignment:</label>
                          <select
                            value={headerFooterConfig.headerAlignment}
                            onChange={(e) => updateHeaderFooterConfig('headerAlignment', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        <div className="config-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={headerFooterConfig.headerApplyToAll}
                              onChange={(e) => updateHeaderFooterConfig('headerApplyToAll', e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            Apply to all pages
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Footer Section */}
                    <div className="config-section">
                      <h4><i className="ri-layout-bottom-line"></i> Footer Settings</h4>
                      <div className="config-row">
                        <div className="config-group">
                          <label>Footer Text:</label>
                          <input
                            type="text"
                            value={headerFooterConfig.footerText}
                            onChange={(e) => updateHeaderFooterConfig('footerText', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            placeholder="Enter footer text"
                          />
                        </div>
                        <div className="config-group">
                          <label>Alignment:</label>
                          <select
                            value={headerFooterConfig.footerAlignment}
                            onChange={(e) => updateHeaderFooterConfig('footerAlignment', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        <div className="config-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={headerFooterConfig.footerApplyToAll}
                              onChange={(e) => updateHeaderFooterConfig('footerApplyToAll', e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            Apply to all pages
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Border Settings */}
                    <div className="config-section">
                      <h4><i className="ri-border-line"></i> Border Settings</h4>
                      <div className="config-row">
                        <div className="config-group">
                          <label>Border Type:</label>
                          <select
                            value={headerFooterConfig.borderType}
                            onChange={(e) => updateHeaderFooterConfig('borderType', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <option value="none">No Border</option>
                            <option value="top">Top Only</option>
                            <option value="bottom">Bottom Only</option>
                            <option value="top-bottom">Top & Bottom</option>
                            <option value="all">All Sides</option>
                          </select>
                        </div>
                        <div className="config-group">
                          <label>Border Color:</label>
                          <div className="color-input-group">
                            <input
                              type="color"
                              value={headerFooterConfig.borderColor}
                              onChange={(e) => updateHeaderFooterConfig('borderColor', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            <input
                              type="text"
                              value={headerFooterConfig.borderColor}
                              onChange={(e) => updateHeaderFooterConfig('borderColor', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                        <div className="config-group">
                          <label>Border Width:</label>
                          <select
                            value={headerFooterConfig.borderWidth}
                            onChange={(e) => updateHeaderFooterConfig('borderWidth', e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            <option value="0.5px">Thin (0.5px)</option>
                            <option value="1px">Normal (1px)</option>
                            <option value="2px">Thick (2px)</option>
                            <option value="3px">Extra Thick (3px)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Page Numbers */}
                    <div className="config-section">
                      <h4><i className="ri-hashtag"></i> Page Numbers</h4>
                      <div className="config-row">
                        <div className="config-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={headerFooterConfig.pageNumbers.enabled}
                              onChange={(e) => updatePageNumberConfig('enabled', e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              onMouseDown={(e) => e.stopPropagation()}
                            />
                            Enable Page Numbers
                          </label>
                        </div>
                        {headerFooterConfig.pageNumbers.enabled && (
                          <>
                            <div className="config-group">
                              <label>Number Type:</label>
                              <select
                                value={headerFooterConfig.pageNumbers.type}
                                onChange={(e) => updatePageNumberConfig('type', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <option value="numeric">1, 2, 3...</option>
                                <option value="roman-lower">i, ii, iii...</option>
                                <option value="roman-upper">I, II, III...</option>
                                <option value="alpha-lower">a, b, c...</option>
                                <option value="alpha-upper">A, B, C...</option>
                              </select>
                            </div>
                            <div className="config-group">
                              <label>Position:</label>
                              <select
                                value={headerFooterConfig.pageNumbers.position}
                                onChange={(e) => updatePageNumberConfig('position', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <option value="header-left">Header Left</option>
                                <option value="header-center">Header Center</option>
                                <option value="header-right">Header Right</option>
                                <option value="footer-left">Footer Left</option>
                                <option value="footer-center">Footer Center</option>
                                <option value="footer-right">Footer Right</option>
                              </select>
                            </div>
                            <div className="config-group">
                              <label>Format:</label>
                              <input
                                type="text"
                                value={headerFooterConfig.pageNumbers.format}
                                onChange={(e) => updatePageNumberConfig('format', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                placeholder="Page {n} of {total}"
                              />
                              <small>Use {'{n}'} for page number, {'{total}'} for total pages</small>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="config-section">
                      <h4><i className="ri-eye-line"></i> Preview</h4>
                      <div className="preview-container">
                        <div className="preview-page" style={{
                          border: headerFooterConfig.borderType !== 'none' ? `${headerFooterConfig.borderWidth} solid ${headerFooterConfig.borderColor}` : 'none',
                          borderTop: ['top', 'top-bottom', 'all'].includes(headerFooterConfig.borderType) ? `${headerFooterConfig.borderWidth} solid ${headerFooterConfig.borderColor}` : 'none',
                          borderBottom: ['bottom', 'top-bottom', 'all'].includes(headerFooterConfig.borderType) ? `${headerFooterConfig.borderWidth} solid ${headerFooterConfig.borderColor}` : 'none',
                          borderLeft: headerFooterConfig.borderType === 'all' ? `${headerFooterConfig.borderWidth} solid ${headerFooterConfig.borderColor}` : 'none',
                          borderRight: headerFooterConfig.borderType === 'all' ? `${headerFooterConfig.borderWidth} solid ${headerFooterConfig.borderColor}` : 'none'
                        }}>
                          {(headerFooterConfig.headerText || headerFooterConfig.pageNumbers.enabled && headerFooterConfig.pageNumbers.position.startsWith('header')) && (
                            <div className="preview-header" style={{ textAlign: headerFooterConfig.headerAlignment }}>
                              {headerFooterConfig.headerText}
                              {headerFooterConfig.pageNumbers.enabled && headerFooterConfig.pageNumbers.position.startsWith('header') && (
                                <span className={`page-number ${headerFooterConfig.pageNumbers.position.split('-')[1]}`}>
                                  {headerFooterConfig.pageNumbers.format.replace('{n}', '1').replace('{total}', '5')}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="preview-content">
                            <div className="preview-text-line"></div>
                            <div className="preview-text-line"></div>
                            <div className="preview-text-line short"></div>
                          </div>
                          {(headerFooterConfig.footerText || headerFooterConfig.pageNumbers.enabled && headerFooterConfig.pageNumbers.position.startsWith('footer')) && (
                            <div className="preview-footer" style={{ textAlign: headerFooterConfig.footerAlignment }}>
                              {headerFooterConfig.footerText}
                              {headerFooterConfig.pageNumbers.enabled && headerFooterConfig.pageNumbers.position.startsWith('footer') && (
                                <span className={`page-number ${headerFooterConfig.pageNumbers.position.split('-')[1]}`}>
                                  {headerFooterConfig.pageNumbers.format.replace('{n}', '1').replace('{total}', '5')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="popup-actions">
                    <button onClick={handleHeaderFooterSubmit} className="apply-btn">
                      <i className="ri-check-line"></i> Apply Header & Footer
                    </button>
                    <button onClick={() => setShowHeaderFooterPopup(false)} className="cancel-btn">
                      <i className="ri-close-line"></i> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showLinkPopup && (
              <div className="drawing-overlay" onClick={() => setShowLinkPopup(false)}>
                <div className="drawing-canvas-container" style={{ width: '500px', height: '300px' }} onClick={(e) => e.stopPropagation()}>
                  <div className="drawing-header">
                    <h3>Insert Link</h3>
                    <button onClick={() => setShowLinkPopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="popup-content" style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>URL:</label>
                      <input
                        type="text"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="https://example.com"
                        style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }}
                        autoFocus
                      />
                    </div>
                    <div className="input-group" style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Text:</label>
                      <input
                        type="text"
                        value={linkText}
                        onChange={(e) => setLinkText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Link text"
                        style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                  <div className="drawing-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { apply('insertLink', { url: linkUrl, text: linkText }); setShowLinkPopup(false); setLinkUrl(''); setLinkText(''); }} disabled={!linkUrl}>Insert</button>
                    <button onClick={() => { setShowLinkPopup(false); setLinkUrl(''); setLinkText(''); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )
        }

        {
          selectedTool === 'File' && (
            <>
              <div className="etb-row">
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileNew')} title="New document">
                    <i className="ri-file-add-line"></i>
                    <span className="btn-label">New</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileOpen')} title="Open document">
                    <i className="ri-folder-open-line"></i>
                    <span className="btn-label">Open</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileSave')} title="Save document">
                    <i className="ri-save-line"></i>
                    <span className="btn-label">Save</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileSaveAs')} title="Save as new document">
                    <i className="ri-save-2-line"></i>
                    <span className="btn-label">Save As</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileShare')} title="Share document">
                    <i className="ri-share-line"></i>
                    <span className="btn-label">Share</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileCopy')} title="Create a copy">
                    <i className="ri-file-copy-line"></i>
                    <span className="btn-label">Copy</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileRename')} title="Rename document">
                    <i className="ri-edit-line"></i>
                    <span className="btn-label">Rename</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileExport')} title="Export document (choose format)">
                    <i className="ri-download-line"></i>
                    <span className="btn-label">Export</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileExportPdf')} title="Export as PDF">
                    <i className="ri-file-pdf-line"></i>
                    <span className="btn-label">Export PDF</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileExportDocx')} title="Export as DOCX">
                    <i className="ri-file-word-line"></i>
                    <span className="btn-label">Export DOCX</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('filePrint')} title="Print document">
                    <i className="ri-printer-line"></i>
                    <span className="btn-label">Print</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileDelete')} title="Delete document">
                    <i className="ri-delete-bin-line"></i>
                    <span className="btn-label">Delete</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('fileClose')} title="Close document">
                    <i className="ri-close-line"></i>
                    <span className="btn-label">Close</span>
                  </button>
                </div>
              </div>
            </>
          )
        }

        {
          selectedTool === 'Layout' && (
            <>
              <div className="etb-row">
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('margins')} title="Margins">
                    <i className="ri-layout-line"></i>
                    <span className="btn-label">Margins</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('orientation')} title="Orientation">
                    <i className="ri-smartphone-line"></i>
                    <span className="btn-label">Orientation</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('size')} title="Size">
                    <i className="ri-aspect-ratio-line"></i>
                    <span className="btn-label">Size</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('break')} title="Break">
                    <i className="ri-split-cells-horizontal"></i>
                    <span className="btn-label">Break</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('lineNumber')} title="Line Number">
                    <i className="ri-list-ordered"></i>
                    <span className="btn-label">Line Number</span>
                  </button>
                </div>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-row">
                <div className="etb-section">
                  <label className="etb-label">Indentation</label>
                  <div className="indent-controls">
                    <div className="indent-group" style={{ marginRight: '15px' }}>
                      <span className="indent-text" style={{ width: '40px', display: 'inline-block', color: '#999', fontSize: '11px' }}>Left</span>
                      <select className="etb-select etb-select-small" style={{ width: '60px' }} onChange={(e) => apply('leftIndentOptions', e.target.value)}>
                        <option value="0">0"</option>
                        <option value="0.5">0.5"</option>
                        <option value="1">1"</option>
                      </select>
                    </div>
                    <div className="indent-group">
                      <span className="indent-text" style={{ width: '40px', display: 'inline-block', color: '#999', fontSize: '11px' }}>Right</span>
                      <select className="etb-select etb-select-small" style={{ width: '60px' }} onChange={(e) => apply('rightIndentOptions', e.target.value)}>
                        <option value="0">0"</option>
                        <option value="0.5">0.5"</option>
                        <option value="1">1"</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-row">
                <div className="etb-section">
                  <label className="etb-label">Spacing</label>
                  <div className="spacing-controls">
                    <div className="spacing-group" style={{ marginRight: '15px' }}>
                      <span className="spacing-text" style={{ width: '40px', display: 'inline-block', color: '#999', fontSize: '11px' }}>Before</span>
                      <select className="etb-select etb-select-small" style={{ width: '60px' }} onChange={(e) => apply('spacingBefore', e.target.value)}>
                        <option value="0">0pt</option>
                        <option value="6">6pt</option>
                        <option value="12">12pt</option>
                      </select>
                    </div>
                    <div className="spacing-group">
                      <span className="spacing-text" style={{ width: '40px', display: 'inline-block', color: '#999', fontSize: '11px' }}>After</span>
                      <select className="etb-select etb-select-small" style={{ width: '60px' }} onChange={(e) => apply('spacingAfter', e.target.value)}>
                        <option value="0">0pt</option>
                        <option value="6">6pt</option>
                        <option value="12">12pt</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-row">
                <div className="etb-section">
                  <div className="etb-color-container" ref={pageBorderRef}>
                    <button className="etb-btn etb-btn-vertical" onClick={() => setShowPageBorderPopup(!showPageBorderPopup)} title="Page Border">
                      <i className="ri-layout-4-line"></i>
                      <span className="btn-label">Page Border</span>
                    </button>
                    {showPageBorderPopup && (
                      <div className="color-picker-panel">
                        <div className="border-styles-grid">
                          <div className="border-style" onClick={() => { apply('pageBorder', 'solid'); setShowPageBorderPopup(false); }} title="Solid Border">
                            <div style={{ border: '2px solid #000', width: '40px', height: '25px' }}></div>
                            <span>Solid</span>
                          </div>
                          <div className="border-style" onClick={() => { apply('pageBorder', 'dashed'); setShowPageBorderPopup(false); }} title="Dashed Border">
                            <div style={{ border: '2px dashed #000', width: '40px', height: '25px' }}></div>
                            <span>Dashed</span>
                          </div>
                          <div className="border-style" onClick={() => { apply('pageBorder', 'dotted'); setShowPageBorderPopup(false); }} title="Dotted Border">
                            <div style={{ border: '2px dotted #000', width: '40px', height: '25px' }}></div>
                            <span>Dotted</span>
                          </div>
                          <div className="border-style" onClick={() => { apply('pageBorder', 'double'); setShowPageBorderPopup(false); }} title="Double Border">
                            <div style={{ border: '3px double #000', width: '40px', height: '25px' }}></div>
                            <span>Double</span>
                          </div>
                          <div className="border-style" onClick={() => { apply('pageBorder', 'groove'); setShowPageBorderPopup(false); }} title="Groove Border">
                            <div style={{ border: '3px groove #000', width: '40px', height: '25px' }}></div>
                            <span>Groove</span>
                          </div>
                          <div className="border-style" onClick={() => { apply('pageBorder', 'ridge'); setShowPageBorderPopup(false); }} title="Ridge Border">
                            <div style={{ border: '3px ridge #000', width: '40px', height: '25px' }}></div>
                            <span>Ridge</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="etb-color-container" ref={pageColorRef}>
                    <button className="etb-btn etb-btn-vertical" onClick={() => setShowPageColorPopup(!showPageColorPopup)} title="Page Color">
                      <i className="ri-palette-line"></i>
                      <span className="btn-label">Page Color</span>
                    </button>
                    {showPageColorPopup && (
                      <div className="color-picker-panel">
                        <div className="color-preset-grid">
                          {presetColors.map(color => (
                            <div
                              key={color}
                              className="color-swatch"
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                apply('pageBackgroundColor', color);
                                setShowPageColorPopup(false);
                              }}
                              title={color}
                            />
                          ))}
                        </div>
                        <div className="custom-color-section">
                          <label>Custom Color:</label>
                          <div className="custom-color-input">
                            <input
                              type="color"
                              value={customPageColor}
                              onChange={(e) => setCustomPageColor(e.target.value)}
                            />
                            <input
                              type="text"
                              value={customPageColor}
                              onChange={(e) => setCustomPageColor(e.target.value)}
                              placeholder="#ffffff"
                            />
                            <button onClick={() => {
                              apply('pageBackgroundColor', customPageColor);
                              setShowPageColorPopup(false);
                            }}>Apply</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {showPageBorderPopup && (
                    <div className="page-border-popup">
                      <div className="border-styles-grid">
                        <div className="border-style" onClick={() => { apply('pageBorder', 'solid'); setShowPageBorderPopup(false); }} title="Solid Border">
                          <div style={{ border: '2px solid #000', width: '30px', height: '20px' }}></div>
                        </div>
                        <div className="border-style" onClick={() => { apply('pageBorder', 'dashed'); setShowPageBorderPopup(false); }} title="Dashed Border">
                          <div style={{ border: '2px dashed #000', width: '30px', height: '20px' }}></div>
                        </div>
                        <div className="border-style" onClick={() => { apply('pageBorder', 'dotted'); setShowPageBorderPopup(false); }} title="Dotted Border">
                          <div style={{ border: '2px dotted #000', width: '30px', height: '20px' }}></div>
                        </div>
                        <div className="border-style" onClick={() => { apply('pageBorder', 'double'); setShowPageBorderPopup(false); }} title="Double Border">
                          <div style={{ border: '3px double #000', width: '30px', height: '20px' }}></div>
                        </div>
                        <div className="border-style" onClick={() => { apply('pageBorder', 'groove'); setShowPageBorderPopup(false); }} title="Groove Border">
                          <div style={{ border: '3px groove #000', width: '30px', height: '20px' }}></div>
                        </div>
                        <div className="border-style" onClick={() => { apply('pageBorder', 'ridge'); setShowPageBorderPopup(false); }} title="Ridge Border">
                          <div style={{ border: '3px ridge #000', width: '30px', height: '20px' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )
        }

        {
          selectedTool === 'Help' && (
            <>
              <div className="etb-row">
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('showHelp')} title="Help - Get help and documentation">
                    <i className="ri-question-line"></i>
                    <span className="btn-label">Help</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('contactSupport')} title="Contact Support - Get technical assistance">
                    <i className="ri-customer-service-line"></i>
                    <span className="btn-label">Contact Support</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('sendFeedback')} title="Feedback - Send us your feedback">
                    <i className="ri-feedback-line"></i>
                    <span className="btn-label">Feedback</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section" ref={keyboardShortcutsRef}>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowKeyboardShortcutsPopup(!showKeyboardShortcutsPopup)} title="Keyboard Shortcuts - View all keyboard shortcuts">
                    <i className="ri-keyboard-line"></i>
                    <span className="btn-label">Keyboard Shortcuts</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('whatsNew')} title="What's New - See latest features and updates">
                    <i className="ri-notification-badge-line"></i>
                    <span className="btn-label">What's New</span>
                  </button>
                </div>
              </div>
            </>
          )
        }

        {
          showKeyboardShortcutsPopup && (
            <div className="drawing-overlay" onClick={() => setShowKeyboardShortcutsPopup(false)}>
              <div className="header-footer-container" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h3>Keyboard Shortcuts</h3>
                  <button onClick={() => setShowKeyboardShortcutsPopup(false)} className="close-btn">×</button>
                </div>
                <div className="header-footer-content">
                  <div className="shortcuts-grid">
                    <div className="shortcut-category">
                      <h4>Text Formatting</h4>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+B</span>
                        <span className="shortcut-desc">Bold</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+I</span>
                        <span className="shortcut-desc">Italic</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+U</span>
                        <span className="shortcut-desc">Underline</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+Shift+S</span>
                        <span className="shortcut-desc">Strikethrough</span>
                      </div>
                    </div>
                    <div className="shortcut-category">
                      <h4>Editing</h4>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+Z</span>
                        <span className="shortcut-desc">Undo</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+Y</span>
                        <span className="shortcut-desc">Redo</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+C</span>
                        <span className="shortcut-desc">Copy</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+V</span>
                        <span className="shortcut-desc">Paste</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+X</span>
                        <span className="shortcut-desc">Cut</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+A</span>
                        <span className="shortcut-desc">Select All</span>
                      </div>
                    </div>
                    <div className="shortcut-category">
                      <h4>Navigation</h4>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+F</span>
                        <span className="shortcut-desc">Find</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+H</span>
                        <span className="shortcut-desc">Find & Replace</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+G</span>
                        <span className="shortcut-desc">Go to Page</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Home</span>
                        <span className="shortcut-desc">Go to Beginning of Line</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">End</span>
                        <span className="shortcut-desc">Go to End of Line</span>
                      </div>
                    </div>
                    <div className="shortcut-category">
                      <h4>File Operations</h4>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+N</span>
                        <span className="shortcut-desc">New Document</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+O</span>
                        <span className="shortcut-desc">Open Document</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+S</span>
                        <span className="shortcut-desc">Save</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+Shift+S</span>
                        <span className="shortcut-desc">Save As</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+P</span>
                        <span className="shortcut-desc">Print</span>
                      </div>
                    </div>
                    <div className="shortcut-category">
                      <h4>Alignment</h4>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+L</span>
                        <span className="shortcut-desc">Align Left</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+E</span>
                        <span className="shortcut-desc">Align Center</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+R</span>
                        <span className="shortcut-desc">Align Right</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+J</span>
                        <span className="shortcut-desc">Justify</span>
                      </div>
                    </div>
                    <div className="shortcut-category">
                      <h4>Lists & Indentation</h4>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+Shift+L</span>
                        <span className="shortcut-desc">Bullet List</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Ctrl+Shift+N</span>
                        <span className="shortcut-desc">Numbered List</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Tab</span>
                        <span className="shortcut-desc">Increase Indent</span>
                      </div>
                      <div className="shortcut-item">
                        <span className="shortcut-key">Shift+Tab</span>
                        <span className="shortcut-desc">Decrease Indent</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {
          selectedTool === 'References' && (
            <>
              <div className="etb-row">
                <div className="etb-section" ref={tocRef}>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowTocPopup(!showTocPopup)} title="Insert Table of Contents - Automatically generates a table of contents based on headings">
                    <i className="ri-list-check-2"></i>
                    <span className="btn-label">Table of Contents</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section" ref={footnoteRef}>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowFootnotePopup(!showFootnotePopup)} title="Insert Footnote - Add a footnote reference">
                    <i className="ri-superscript"></i>
                    <span className="btn-label">Footnote</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowEndnotePopup(!showEndnotePopup)} title="Insert Endnote - Add an endnote reference" ref={endnoteRef}>
                    <i className="ri-subscript"></i>
                    <span className="btn-label">Endnote</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section" ref={citationRef}>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowCitationPopup(!showCitationPopup)} title="Insert Citation - Add a citation reference">
                    <i className="ri-double-quotes-l"></i>
                    <span className="btn-label">Citation</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => {
                    let bibHTML = '<div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; background: #f9f9f9;"><h2>Bibliography</h2>';
                    if (window.citations && window.citations.length > 0) {
                      window.citations.forEach((citation) => {
                        const entry = citation.year ? `${citation.author} (${citation.year}). ${citation.text}` : `${citation.author}. ${citation.text}`;
                        bibHTML += `<div style="margin-bottom: 10px; padding-left: 20px; text-indent: -20px;">${entry}</div>`;
                      });
                    } else {
                      bibHTML += '<p>No citations found.</p>';
                    }
                    bibHTML += '</div>';
                    apply('insertHTML', bibHTML);
                  }} title="Insert Bibliography - Add a bibliography section" ref={bibliographyRef}>
                    <i className="ri-book-line"></i>
                    <span className="btn-label">Bibliography</span>
                  </button>
                </div>
                <div className="etb-divider"></div>
                <div className="etb-section">
                  <button className="etb-btn etb-btn-vertical" onClick={() => {
                    let endnotesHTML = '<div style="margin: 20px 0; padding: 20px; border: 1px solid #ddd; background: #f9f9f9;"><h2>Endnotes</h2>';
                    if (window.endnotes && window.endnotes.length > 0) {
                      window.endnotes.forEach((endnote) => {
                        endnotesHTML += `<div style="margin-bottom: 10px;"><sup>(${endnote.id})</sup> ${endnote.text}</div>`;
                      });
                    } else {
                      endnotesHTML += '<p>No endnotes found.</p>';
                    }
                    endnotesHTML += '</div>';
                    apply('insertHTML', endnotesHTML);
                  }} title="Insert Endnotes Section - Add all endnotes at document end">
                    <i className="ri-file-list-line"></i>
                    <span className="btn-label">Endnotes Section</span>
                  </button>
                </div>
              </div>
            </>
          )
        }

        {
          (selectedTool === 'View' || selectedTool === 'Review') && (
            <div className="etb-row">
              <span style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.6 }}>Options for {selectedTool} (coming soon)</span>
            </div>
          )
        }

        {/* Table of Contents Popup */}
        {
          showTocPopup && (
            <div className="drawing-overlay" onClick={() => setShowTocPopup(false)}>
              <div className="header-footer-container" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h3>Insert Table of Contents</h3>
                  <button onClick={() => setShowTocPopup(false)} className="close-btn">×</button>
                </div>
                <div className="header-footer-content">
                  <div className="config-section">
                    <h4>Include Heading Levels</h4>
                    <div className="config-row">
                      <label><input type="checkbox" checked={tocSettings.includeH1} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, includeH1: e.target.checked }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /> Heading 1</label>
                      <label><input type="checkbox" checked={tocSettings.includeH2} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, includeH2: e.target.checked }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /> Heading 2</label>
                      <label><input type="checkbox" checked={tocSettings.includeH3} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, includeH3: e.target.checked }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /> Heading 3</label>
                    </div>
                    <div className="config-row">
                      <label><input type="checkbox" checked={tocSettings.includeH4} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, includeH4: e.target.checked }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /> Heading 4</label>
                      <label><input type="checkbox" checked={tocSettings.includeH5} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, includeH5: e.target.checked }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /> Heading 5</label>
                      <label><input type="checkbox" checked={tocSettings.includeH6} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, includeH6: e.target.checked }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /> Heading 6</label>
                    </div>
                  </div>
                  <div className="config-section">
                    <h4>Options</h4>
                    <div className="config-row">
                      <label><input type="checkbox" checked={tocSettings.showPageNumbers} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, showPageNumbers: e.target.checked }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} /> Show page numbers</label>
                      <label>Alignment:
                        <select value={tocSettings.alignment} onChange={(e) => { e.stopPropagation(); setTocSettings({ ...tocSettings, alignment: e.target.value }); }} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="popup-actions">
                  <button onClick={() => {
                    const tocHTML = generateTableOfContents(tocSettings);
                    apply('insertHTML', tocHTML);
                    setShowTocPopup(false);
                  }}>Insert TOC</button>
                  <button onClick={() => setShowTocPopup(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )
        }

        {/* Footnote Popup */}
        {
          showFootnotePopup && (
            <div className="drawing-overlay" onClick={() => setShowFootnotePopup(false)}>
              <div className="header-footer-container" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h3>Insert Footnote</h3>
                  <button onClick={() => setShowFootnotePopup(false)} className="close-btn">×</button>
                </div>
                <div className="header-footer-content" style={{ padding: '20px' }}>
                  <div className="input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ marginBottom: '8px' }}>Footnote text:</label>
                    <textarea
                      value={footnoteText}
                      onChange={(e) => { e.stopPropagation(); setFootnoteText(e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      placeholder="Enter footnote text"
                      rows="3"
                      style={{
                        width: '100%',
                        resize: 'vertical',
                        padding: '8px',
                        border: '1px solid var(--etb-border, var(--etb-border-light))',
                        borderRadius: '4px',
                        background: 'var(--etb-bg, var(--etb-bg-light))',
                        color: 'var(--etb-text, var(--etb-text-light))',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div className="popup-actions">
                  <button onClick={() => {
                    const footnoteId = Math.floor(Math.random() * 1000);
                    apply('insertHTML', `<sup style="color: blue;">[${footnoteId}]</sup>`);
                    apply('insertHTML', `<div style="margin-top: 20px; padding: 10px; border-top: 1px solid #ccc; font-size: 12px;"><sup>[${footnoteId}]</sup> ${footnoteText}</div>`);
                    setShowFootnotePopup(false);
                    setFootnoteText('');
                  }} disabled={!footnoteText}>Insert</button>
                  <button onClick={() => { setShowFootnotePopup(false); setFootnoteText(''); }}>Cancel</button>
                </div>
              </div>
            </div>
          )
        }

        {/* Endnote Popup */}
        {
          showEndnotePopup && (
            <div className="drawing-overlay" onClick={() => setShowEndnotePopup(false)}>
              <div className="header-footer-container" style={{ width: '400px' }} onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h3>Insert Endnote</h3>
                  <button onClick={() => setShowEndnotePopup(false)} className="close-btn">×</button>
                </div>
                <div className="header-footer-content" style={{ padding: '20px' }}>
                  <div className="input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ marginBottom: '8px' }}>Endnote text:</label>
                    <textarea
                      value={endnoteText}
                      onChange={(e) => { e.stopPropagation(); setEndnoteText(e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      placeholder="Enter endnote text"
                      rows="3"
                      style={{
                        width: '100%',
                        resize: 'vertical',
                        padding: '8px',
                        border: '1px solid var(--etb-border, var(--etb-border-light))',
                        borderRadius: '4px',
                        background: 'var(--etb-bg, var(--etb-bg-light))',
                        color: 'var(--etb-text, var(--etb-text-light))',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div className="popup-actions">
                  <button onClick={() => {
                    const endnoteId = Math.floor(Math.random() * 1000);
                    apply('insertHTML', `<sup style="color: blue;">(${endnoteId})</sup>`);
                    if (!window.endnotes) window.endnotes = [];
                    window.endnotes.push({ id: endnoteId, text: endnoteText });
                    setShowEndnotePopup(false);
                    setEndnoteText('');
                  }} disabled={!endnoteText}>Insert</button>
                  <button onClick={() => { setShowEndnotePopup(false); setEndnoteText(''); }}>Cancel</button>
                </div>
              </div>
            </div>
          )
        }

        {/* Citation Popup */}
        {
          showCitationPopup && (
            <div className="drawing-overlay" onClick={() => setShowCitationPopup(false)}>
              <div className="header-footer-container" style={{ width: '500px' }} onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                  <h3>Insert Citation</h3>
                  <button onClick={() => setShowCitationPopup(false)} className="close-btn">×</button>
                </div>
                <div className="header-footer-content" style={{ padding: '20px' }}>
                  <div className="input-group" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <label style={{ marginBottom: '8px' }}>Author:</label>
                    <input
                      type="text"
                      value={citationAuthor}
                      onChange={(e) => { e.stopPropagation(); setCitationAuthor(e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      placeholder="Author name"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--etb-border, var(--etb-border-light))',
                        borderRadius: '4px',
                        background: 'var(--etb-bg, var(--etb-bg-light))',
                        color: 'var(--etb-text, var(--etb-text-light))',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div className="input-group" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <label style={{ marginBottom: '8px' }}>Year:</label>
                    <input
                      type="text"
                      value={citationYear}
                      onChange={(e) => { e.stopPropagation(); setCitationYear(e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      placeholder="Publication year"
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--etb-border, var(--etb-border-light))',
                        borderRadius: '4px',
                        background: 'var(--etb-bg, var(--etb-bg-light))',
                        color: 'var(--etb-text, var(--etb-text-light))',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div className="input-group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <label style={{ marginBottom: '8px' }}>Citation text:</label>
                    <textarea
                      value={citationText}
                      onChange={(e) => { e.stopPropagation(); setCitationText(e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      placeholder="Enter citation details"
                      rows="3"
                      style={{
                        width: '100%',
                        resize: 'vertical',
                        padding: '8px',
                        border: '1px solid var(--etb-border, var(--etb-border-light))',
                        borderRadius: '4px',
                        background: 'var(--etb-bg, var(--etb-bg-light))',
                        color: 'var(--etb-text, var(--etb-text-light))',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                </div>
                <div className="popup-actions">
                  <button onClick={() => {
                    const citationText = citationYear ? `(${citationAuthor}, ${citationYear})` : `(${citationAuthor})`;
                    apply('insertHTML', `<span style="color: #0066cc;">${citationText}</span>`);
                    if (!window.citations) window.citations = [];
                    window.citations.push({ author: citationAuthor, year: citationYear, text: citationText });
                    setShowCitationPopup(false);
                    setCitationAuthor('');
                    setCitationYear('');
                    setCitationText('');
                  }} disabled={!citationAuthor || !citationText}>Insert</button>
                  <button onClick={() => { setShowCitationPopup(false); setCitationAuthor(''); setCitationYear(''); setCitationText(''); }}>Cancel</button>
                </div>
              </div>
            </div>
          )
        }


      </div >

      {/* Change Styles Dialog */}
      {
        showChangeStylesDialog && (
          <ChangeStylesDialog
            isOpen={showChangeStylesDialog}
            onClose={() => setShowChangeStylesDialog(false)}
            onApply={(settings) => {
              // Apply theme settings
              console.log('EditorToolBox onApply called with:', settings);
              onApply('changeTheme', settings);
              setShowChangeStylesDialog(false);
            }}
            onPreview={(settings) => {
              // Live preview - apply temporarily
              onApply('changeTheme', settings);
            }}
            currentSettings={{
              styleSet: 'Default',
              colors: 'Office',
              fonts: 'Office',
              spacing: '6pt'
            }}
          />
        )
      }

      {/* Selection Pane */}
      {
        showSelectionPane && (
          <div className="selection-pane-overlay" onClick={() => setShowSelectionPane(false)}>
            <div className="selection-pane-container" onClick={(e) => e.stopPropagation()}>
              <div className="selection-pane-header">
                <h3>Selection Pane</h3>
                <button onClick={() => setShowSelectionPane(false)} className="close-btn">×</button>
              </div>
              <div className="selection-pane-content">
                <div className="selection-pane-toolbar">
                  <button onClick={() => {
                    apply('selectAll');
                    setShowSelectionPane(false);
                  }}>
                    <i className="ri-checkbox-multiple-line"></i> Select All
                  </button>
                </div>
                <div className="selection-pane-list">
                  <div className="selection-pane-info">
                    All objects in the document will appear here.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default EditorToolBox;
