import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './EditorToolBox.css';
import ParagraphDialog from './ParagraphDialog';
import BordersDialog from './BordersDialog';
import ChangeStylesDialog from './ChangeStylesDialog';
import SmartArtEditor from './SmartArtEditor';
import ChartEditor from './ChartEditor';
import { COVER_PAGE_TEMPLATES } from '../utils/CoverPageTemplates';
import { SHAPE_CATEGORIES, getShapeSVG } from '../utils/ShapeTemplates';
import { generateSmartArtHTML } from '../utils/SmartArtHTMLGenerator';

import { generateChartHTML } from '../utils/ChartHTMLGenerator';
import { ChartDataParser } from '../utils/ChartDataParser';
import { pageNumberTemplates, getTemplatesByCategory, formatPageNumber } from '../utils/pageNumberTemplates';
import { textBoxTemplates, textBoxCategories, getTemplateById } from '../utils/textBoxTemplates';
import { getTemplatesByCategory as getTextBoxTemplatesByCategory } from '../utils/textBoxTemplates';
import { wordArtStyles } from '../utils/wordArtStyles';
import { equationTemplates } from '../utils/equationTemplates';

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

const EditorToolBox = ({ selectedTool: selectedToolProp, onSelectTool, onApply, currentFormat, availableStyles, bookmarks }) => {
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
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [dialogRows, setDialogRows] = useState(2);
  const [showQuickPartsMenu, setShowQuickPartsMenu] = useState(false);
  const [showAutoTextSubMenu, setShowAutoTextSubMenu] = useState(false);
  const [showDocPropertySubMenu, setShowDocPropertySubMenu] = useState(false);

  // Quick Parts Data
  const [autoTextEntries, setAutoTextEntries] = useState([
    { name: 'Admin', content: 'Admin' },
    { name: 'Author', content: 'Author Name' },
    { name: 'Signature', content: 'Sincerely,\n\n[Name]\n[Title]' },
    { name: 'Confidential', content: 'CONFIDENTIAL - INTERNAL USE ONLY' }
  ]);

  const docProperties = [
    'Abstract', 'Author', 'Category', 'Comments', 'Company',
    'Company Address', 'Company E-mail', 'Company Fax', 'Company Phone',
    'Keywords', 'Manager', 'Publish Date', 'Status', 'Subject', 'Title'
  ];

  const [dateStyles, setDateStyles] = useState(['MM/DD/YYYY', 'DD/MM/YYYY', 'Month DD, YYYY']);
  const [dialogCols, setDialogCols] = useState(5);
  const [autoFitBehavior, setAutoFitBehavior] = useState('fixed'); // fixed, contents, window
  const [fixedColValue, setFixedColValue] = useState('Auto');

  // Refs
  const quickPartsRef = useRef(null);
  const textBoxRef = useRef(null);

  const incrementFixedCol = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (autoFitBehavior !== 'fixed') return;
    if (fixedColValue === 'Auto') {
      setFixedColValue('0.1"');
    } else {
      let val = parseFloat(fixedColValue) || 0;
      setFixedColValue((val + 0.1).toFixed(1) + '"');
    }
  };

  const decrementFixedCol = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (autoFitBehavior !== 'fixed') return;
    if (fixedColValue === 'Auto') return;
    let val = parseFloat(fixedColValue) || 0;
    if (val <= 0.1) {
      setFixedColValue('Auto');
    } else {
      setFixedColValue((val - 0.1).toFixed(1) + '"');
    }
  };

  const [rememberDimensions, setRememberDimensions] = useState(false);
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
  const [showFooterPopup, setShowFooterPopup] = useState(false);
  const [showPageNumberPopup, setShowPageNumberPopup] = useState(false);
  const [showPageNumberFormatDialog, setShowPageNumberFormatDialog] = useState(false);
  const [showSymbolsPopup, setShowSymbolsPopup] = useState(false);
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [showDropCapMenu, setShowDropCapMenu] = useState(false);
  const [showDropCapOptions, setShowDropCapOptions] = useState(false);
  const [dropCapSettings, setDropCapSettings] = useState({ lines: 3, distance: 0, font: 'Times New Roman' });
  const [showTextEffectsPopup, setShowTextEffectsPopup] = useState(false);
  const [showChangeCasePopup, setShowChangeCasePopup] = useState(false);
  const [showBulletDropdown, setShowBulletDropdown] = useState(false);
  const [showNumberingDropdown, setShowNumberingDropdown] = useState(false);
  const [showMultilevelDropdown, setShowMultilevelDropdown] = useState(false);
  const [showEquationDropdown, setShowEquationDropdown] = useState(false);
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

  // Insert Tab States
  const [showCoverPagePopup, setShowCoverPagePopup] = useState(false);
  const [showShapesPopup, setShowShapesPopup] = useState(false);
  const [recentShapes, setRecentShapes] = useState([]);
  const [showIconsPopup, setShowIconsPopup] = useState(false);
  const [recentIcons, setRecentIcons] = useState([]);
  const [showSmartArtPopup, setShowSmartArtPopup] = useState(false);
  const [showChartPopup, setShowChartPopup] = useState(false);
  const [showOnlineVideoPopup, setShowOnlineVideoPopup] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showBookmarkPopup, setShowBookmarkPopup] = useState(false);
  const [bookmarkName, setBookmarkName] = useState('');
  const [showCrossReferencePopup, setShowCrossReferencePopup] = useState(false);
  const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
  const [showFooterDropdown, setShowFooterDropdown] = useState(false);
  const [showPageNumberDropdown, setShowPageNumberDropdown] = useState(false);
  const [showTextBoxPopup, setShowTextBoxPopup] = useState(false);
  const [textBoxCategory, setTextBoxCategory] = useState('all');
  const [selectedTextBoxTemplate, setSelectedTextBoxTemplate] = useState(null);
  const [isDrawingTextBox, setIsDrawingTextBox] = useState(false);
  const [showDatePopup, setShowDatePopup] = useState(false);
  // Signature Line State
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signatureTitle, setSignatureTitle] = useState('');
  const signatureCanvasRef = useRef(null);
  const [isDrawingSignature, setIsDrawingSignature] = useState(false);
  const [signatureTab, setSignatureTab] = useState('type');

  const [showObjectPopup, setShowObjectPopup] = useState(false);
  const [chartDataSource, setChartDataSource] = useState(null);
  const [showScreenshotPopup, setShowScreenshotPopup] = useState(false);
  const [recentScreenshots, setRecentScreenshots] = useState([]);
  const [crossReferenceTarget, setCrossReferenceTarget] = useState(null);
  const [crossRefInsertHyperlink, setCrossRefInsertHyperlink] = useState(true);
  const [crossRefIncludeAboveBelow, setCrossRefIncludeAboveBelow] = useState(false);
  const [crossRefSeparateNumbers, setCrossRefSeparateNumbers] = useState(false);
  const [headerSettings, setHeaderSettings] = useState({
    text: '',
    alignment: 'left',
    borderType: 'none',
    borderColor: '#000000',
    borderWidth: '1px',
    applyToAll: true
  });

  const headerPresets = [
    { name: 'Blank', type: 'blank', align: 'left', text: '[Type text]', border: 'none', color: '#000000' },
    { name: '3 Columns', type: '3col', align: 'center', text: '[Type text]   [Type text]   [Type text]', border: 'none', color: '#000000' },
    { name: 'Austin', type: 'austin', align: 'left', text: 'Austin Header', border: 'bottom', color: '#4a90e2', width: '2px' },
    { name: 'Banded', type: 'banded', align: 'center', text: 'Banded Header', border: 'top-bottom', color: '#d0021b', width: '4px' }
  ];

  const [footerSettings, setFooterSettings] = useState({
    text: '',
    alignment: 'center',
    borderType: 'none',
    borderColor: '#000000',
    borderWidth: '1px',
    applyToAll: true
  });

  const footerPresets = [
    { name: 'Blank', type: 'blank', align: 'center', text: '[Type text]', border: 'none', color: '#000000' },
    { name: '3 Columns', type: '3col', align: 'center', text: '[Type text]   [Type text]   [Type text]', border: 'none', color: '#000000' },
    { name: 'Austin', type: 'austin', align: 'center', text: 'Austin Footer', border: 'top', color: '#4a90e2', width: '2px' },
    { name: 'Banded', type: 'banded', align: 'center', text: 'Banded Footer', border: 'top-bottom', color: '#d0021b', width: '4px' }
  ];

  const [activeHeaderTab, setActiveHeaderTab] = useState('settings'); // settings, design

  // Page Number State
  const [pageNumberCategory, setPageNumberCategory] = useState('topOfPage'); // topOfPage, bottomOfPage, pageMargins, currentPosition
  const [pageNumberSettings, setPageNumberSettings] = useState({
    format: 'arabic', // arabic, roman-upper, roman-lower, alpha-upper, alpha-lower
    includeChapterNumber: false,
    chapterHeadingLevel: 1,
    startAt: 1,
    continueFromPrevious: true,
    position: 'footer-center',
    style: 'plain-number-2', // template ID
    showPageXofY: false
  });

  // Load recent screenshots
  useEffect(() => {
    try {
      const saved = localStorage.getItem('etb_recent_screenshots');
      if (saved) setRecentScreenshots(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load recent screenshots', e);
    }
  }, []);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  // Load recent shapes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('etb_recent_shapes');
      if (saved) setRecentShapes(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load recent shapes', e);
    }
  }, []);

  // Load recent icons from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('etb_recent_icons');
      if (saved) setRecentIcons(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load recent icons', e);
    }
  }, []);

  // Handle shape click with recent shapes tracking
  const handleShapeClick = (shapeId) => {
    onApply('insertShape', shapeId);
    setShowShapesPopup(false);

    // Add to recent shapes
    setRecentShapes(prev => {
      const newRecent = [shapeId, ...prev.filter(id => id !== shapeId)].slice(0, 18);
      try {
        localStorage.setItem('etb_recent_shapes', JSON.stringify(newRecent));
      } catch (e) {
        console.warn('Failed to save recent shapes', e);
      }
      return newRecent;
    });
  };

  // Handle icon click with recent icons tracking
  const handleIconClick = (iconName, iconStyle = 'line') => {
    // Insert icon as HTML span with icon class
    const iconHtml = `<span class="ri-${iconName}-${iconStyle}" style="font-size: 1.2em; vertical-align: middle; margin: 0 2px;"></span>&nbsp;`;
    try {
      document.execCommand('insertHTML', false, iconHtml);
    } catch (e) {
      console.warn('Failed to insert icon', e);
    }
    setShowIconsPopup(false);

    // Add to recent icons
    const iconKey = `${iconName}-${iconStyle}`;
    setRecentIcons(prev => {
      const newRecent = [iconKey, ...prev.filter(id => id !== iconKey)].slice(0, 18);
      try {
        localStorage.setItem('etb_recent_icons', JSON.stringify(newRecent));
      } catch (e) {
        console.warn('Failed to save recent icons', e);
      }
      return newRecent;
    });
  };
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

  // Insert Tab Refs
  const coverPageRef = useRef(null);
  const shapesRef = useRef(null);
  const iconsRef = useRef(null);
  const smartArtRef = useRef(null);
  const chartRef = useRef(null);
  const onlineVideoRef = useRef(null);
  const bookmarkRef = useRef(null);
  const crossReferenceRef = useRef(null);
  const headerRef = useRef(null);
  const footerRef = useRef(null);
  const pageNumberRef = useRef(null);

  const dateRef = useRef(null);
  const objectRef = useRef(null);

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

      // Insert Tab Outside Clicks
      if (coverPageRef.current && !coverPageRef.current.contains(event.target)) setShowCoverPagePopup(false);
      if (shapesRef.current && !shapesRef.current.contains(event.target)) setShowShapesPopup(false);
      if (iconsRef.current && !iconsRef.current.contains(event.target)) setShowIconsPopup(false);
      if (smartArtRef.current && !smartArtRef.current.contains(event.target)) setShowSmartArtPopup(false);
      if (smartArtRef.current && !smartArtRef.current.contains(event.target)) setShowSmartArtPopup(false);
      if (chartRef.current && !chartRef.current.contains(event.target)) setShowChartPopup(false);
      // Screenshot popup is handled via wrapper ref or specific close button usually
      // if (screenshotRef.current && !screenshotRef.current.contains(event.target)) setShowScreenshotPopup(false);
      if (onlineVideoRef.current && !onlineVideoRef.current.contains(event.target)) setShowOnlineVideoPopup(false);
      if (bookmarkRef.current && !bookmarkRef.current.contains(event.target)) setShowBookmarkPopup(false);
      if (crossReferenceRef.current && !crossReferenceRef.current.contains(event.target)) setShowCrossReferencePopup(false);
      if (headerRef.current && !headerRef.current.contains(event.target)) setShowHeaderDropdown(false);
      if (footerRef.current && !footerRef.current.contains(event.target)) setShowFooterDropdown(false);
      if (pageNumberRef.current && !pageNumberRef.current.contains(event.target)) setShowPageNumberDropdown(false);
      // Text Box: Don't close if clicking inside the popup dialog
      if (textBoxRef.current && !textBoxRef.current.contains(event.target)) {
        const popupDialog = document.querySelector('.popup-dialog');
        if (!popupDialog || !popupDialog.contains(event.target)) {
          setShowTextBoxPopup(false);
        }
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) setShowDatePopup(false);
      if (objectRef.current && !objectRef.current.contains(event.target)) setShowObjectPopup(false);
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
      else if (k === '-') { e.preventDefault(); apply('insertHTML', 'Ã¢â‚¬â€˜'); }
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

  // SmartArt functionality
  const handleSmartArtInsert = (smartArtData) => {
    const { layout, textItems, colorScheme, style } = smartArtData;
    const colors = colorScheme.colors;

    // Generate HTML using utility
    const smartArtHTML = generateSmartArtHTML(layout, textItems, colors);

    // Insert into document
    apply('insertHTML', smartArtHTML);
  };

  // Screenshot Functionality
  const handleScreenshotCapture = async () => {
    try {
      // 1. Request Screen Sharing (User selects window)
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'never' },
        audio: false
      });

      // 2. Create hidden video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      // 3. Create canvas to draw the frame
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 4. Get Data URL
      const dataUrl = canvas.toDataURL('image/png');

      // 5. Stop all tracks to "stop sharing" immediately
      stream.getTracks().forEach(track => track.stop());

      // 6. Save to Recent Screenshots & LocalStorage
      setRecentScreenshots(prev => {
        const newRecent = [dataUrl, ...prev].slice(0, 10); // Keep last 10
        try {
          localStorage.setItem('etb_recent_screenshots', JSON.stringify(newRecent));
        } catch (e) {
          console.warn('Failed to save screenshot history', e);
        }
        return newRecent;
      });

      // 7. Insert Image into Document
      const imgTag = `<img src="${dataUrl}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" alt="Screenshot" />`;
      apply('insertHTML', imgTag);

      // Close popup if open
      setShowScreenshotPopup(false);

    } catch (err) {
      console.error("Screenshot capture failed or cancelled:", err);
    }
  };

  // Chart functionality
  const handleChartInsert = (chartData) => {
    const { chart } = chartData;
    // Generate HTML using captured data or default
    const chartHTML = generateChartHTML(chart, chartDataSource);
    // Insert
    apply('insertHTML', chartHTML);
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
                              <button className="close-btn" onClick={() => setShowTextEffectsPopup(false)}>Ãƒâ€”</button>
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
                        <span style={{ position: 'absolute', top: '2px', fontSize: '8px', color: '#3b82f6' }}>&#9650;</span>
                      </button>
                      <button
                        className="etb-btn etb-btn-small"
                        onClick={() => apply('decreaseFontSize')}
                        title="Decrease Font Size (Ctrl+[)"
                        style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: 1 }}>A</span>
                        <span style={{ position: 'absolute', bottom: '2px', fontSize: '8px', color: '#3b82f6' }}>&#9660;</span>
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
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleDisc'); setShowBulletDropdown(false); }} title="Disc">&#9679;</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleCircle'); setShowBulletDropdown(false); }} title="Circle">&#9675;</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleSquare'); setShowBulletDropdown(false); }} title="Square">&#9632;</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleDiamond'); setShowBulletDropdown(false); }} title="Diamond">&#10070;</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleArrow'); setShowBulletDropdown(false); }} title="Arrow">&#10146;</button>
                                <button className="list-option-btn" onClick={() => { apply('bulletStyleCheck'); setShowBulletDropdown(false); }} title="Check">&#10003;</button>
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
                      <button className="etb-btn etb-btn-small" onClick={() => apply('sortParagraphs', 'asc')} title="Sort A&ndash;Z">
                        <i className="ri-sort-asc"></i>
                      </button>

                      {/* Show/Hide */}
                      <button className="etb-btn etb-btn-small" onClick={() => apply('showFormattingMarks')} title="Show/Hide &para; formatting marks">
                        &para;
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
                                  <i className="ri-border-bottom-line" style={{ fontSize: '16px' }}></i> Bottom Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'top'); setShowBordersDropdown(false); }} title="Top Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-border-top-line" style={{ fontSize: '16px' }}></i> Top Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'left'); setShowBordersDropdown(false); }} title="Left Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-border-left-line" style={{ fontSize: '16px' }}></i> Left Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'right'); setShowBordersDropdown(false); }} title="Right Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-border-right-line" style={{ fontSize: '16px' }}></i> Right Border
                                </button>
                                <div className="etb-menu-separator" style={{ margin: '4px 0', borderTop: '1px solid #e1e1e1' }}></div>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'none'); setShowBordersDropdown(false); }} title="No Border" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-close-line"></i> No Border
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'all'); setShowBordersDropdown(false); }} title="All Borders" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-grid-line" style={{ fontSize: '16px' }}></i> All Borders
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'outside'); setShowBordersDropdown(false); }} title="Outside Borders" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-checkbox-blank-line" style={{ fontSize: '16px' }}></i> Outside Borders
                                </button>
                                <button className="list-option-btn" onClick={() => { apply('paragraphBorders', 'inside'); setShowBordersDropdown(false); }} title="Inside Borders" style={{ justifyContent: 'flex-start', fontSize: '13px', gap: '8px', height: '32px' }}>
                                  <i className="ri-layout-grid-line" style={{ fontSize: '16px' }}></i> Inside Borders
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
                          <button onClick={() => setShowFindReplace(false)} className="close-btn">Ãƒâ€”</button>
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
              {/* Pages Group */}
              <div className="etb-group etb-pages-group" ref={coverPageRef}>
                <div className="etb-group-content">
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowCoverPagePopup(!showCoverPagePopup)} title="Cover Page">
                    <i className="ri-layout-top-line"></i>
                    <span className="btn-label">Cover<br />Page</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('insertBlankPage')} title="Blank Page">
                    <i className="ri-file-add-line"></i>
                    <span className="btn-label">Blank<br />Page</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => apply('insertPageBreak')} title="Page Break">
                    <i className="ri-file-paper-line"></i>
                    <span className="btn-label">Page<br />Break</span>
                  </button>
                  {showCoverPagePopup && (
                    <div className="insert-popup cover-page-gallery-popup">
                      <div className="popup-header"><h4>Built-In</h4></div>
                      <div className="cover-page-grid">
                        {COVER_PAGE_TEMPLATES.map((template) => (
                          <div
                            key={template.name}
                            className="cover-page-item"
                            onClick={() => { apply('insertCoverPage', template); setShowCoverPagePopup(false); }}
                            title={template.description}
                          >
                            <div className={`cp-thumbnail cp-thumb-${template.name.toLowerCase()}`} style={{ backgroundColor: template.thumbnailColor }}>
                              <div className="cp-thumb-title">Title</div>
                            </div>
                            <div className="cp-label">{template.name}</div>
                          </div>
                        ))}
                      </div>
                      <div className="popup-footer-actions">
                        <div className="menu-item text-danger" onClick={() => { apply('removeCoverPage'); setShowCoverPagePopup(false); }}>
                          <i className="ri-close-circle-line"></i> Remove Current Cover Page
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="etb-group-label">Pages</div>
              </div>

              {/* Tables Group */}
              <div className="etb-group etb-tables-group" ref={tableRef}>
                <div className="etb-group-content">
                  <button className="etb-btn etb-btn-vertical" onMouseDown={(e) => e.preventDefault()} onClick={() => setShowTablePopup(!showTablePopup)} title="Table">
                    <i className="ri-table-line"></i>
                    <span className="btn-label">Table</span>
                  </button>
                  {/* Quick Tables Button - simplified for now */}

                  {showTablePopup && (
                    <div className="table-selector-popup" onMouseDown={(e) => e.preventDefault()}>
                      {/* Prevent focus loss from editor */}
                      <div className="popup-header">
                        <h4>{tableRows > 0 ? `${tableRows}x${tableCols} Table` : 'Insert Table'}</h4>
                      </div>
                      <div
                        className="table-grid"
                        onMouseLeave={() => {
                          setTableRows(0);
                          setTableCols(0);
                          apply('previewTable', null); // Clear preview
                        }}
                      >
                        {Array.from({ length: 10 }, (_, row) => (
                          Array.from({ length: 8 }, (_, col) => (
                            <div
                              key={`${row}-${col}`}
                              className={`table-cell ${row < tableRows && col < tableCols ? 'selected' : ''}`}
                              onMouseEnter={() => {
                                setTableRows(row + 1);
                                setTableCols(col + 1);
                                apply('previewTable', { rows: row + 1, cols: col + 1 });
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Stop propagation
                                apply('insertTable', { rows: row + 1, cols: col + 1 });
                                setShowTablePopup(false);
                                setTableRows(0); // Reset
                                setTableCols(0);
                                apply('previewTable', null); // Clear preview after insert
                              }}
                            />
                          ))
                        ))}
                      </div>
                      <div className="table-dropdown-menu">
                        <div className="menu-item" onClick={(e) => {
                          e.preventDefault();
                          setShowTableDialog(true);
                          setShowTablePopup(false);
                        }}>
                          <i className="ri-table-line"></i> Insert Table...
                        </div>
                        <div className="menu-item" onClick={() => { apply('drawTable'); setShowTablePopup(false); }}>
                          <i className="ri-pencil-ruler-2-line"></i> Draw Table
                        </div>
                        <div className="menu-item" onClick={() => { apply('convertTextToTable'); setShowTablePopup(false); }}>
                          <i className="ri-text-spacing"></i> Convert Text to Table...
                        </div>

                      </div>
                    </div>
                  )}



                </div>
                <div className="etb-group-label">Tables</div>
              </div>

              {/* Illustrations Group */}
              <div className="etb-group etb-illustrations-group" ref={shapesRef}>
                <div className="etb-group-content">
                  <button className="etb-btn etb-btn-vertical" onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) apply('insertImageFile', file);
                    };
                    input.click();
                  }} title="Pictures">
                    <i className="ri-image-line"></i>
                    <span className="btn-label">Pictures</span>
                  </button>

                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowShapesPopup(!showShapesPopup)} title="Shapes">
                    <i className="ri-shapes-line"></i>
                    <span className="btn-label">Shapes</span>
                  </button>
                  {showShapesPopup && (
                    <div className="insert-popup shapes-popup" style={{ width: '600px', left: '50px', top: '-50px' }}>
                      <div className="popup-header">
                        <h4>Shapes</h4>
                        <button onClick={() => setShowShapesPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
                      </div>
                      <div className="popup-content" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        <div className="shapes-gallery-container">
                          {recentShapes.length > 0 && (
                            <div className="shape-category">
                              <div className="category-title">Recently Used</div>
                              <div className="shape-grid">
                                {recentShapes.map(id => {
                                  let shape = null;
                                  Object.values(SHAPE_CATEGORIES).some(list => {
                                    shape = list.find(s => s.id === id);
                                    return !!shape;
                                  });
                                  if (!shape) return null;
                                  return (
                                    <button
                                      key={shape.id}
                                      onClick={() => handleShapeClick(shape.id)}
                                      className="etb-btn"
                                      title={shape.title}
                                      style={{ height: '28px', width: '28px' }}
                                    >
                                      <div
                                        dangerouslySetInnerHTML={{ __html: getShapeSVG(shape.id, 'transparent', 'currentColor') }}
                                        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {Object.entries(SHAPE_CATEGORIES).map(([category, shapes]) => (
                            <div className="shape-category" key={category}>
                              <div className="category-title">{category}</div>
                              <div className="shape-grid">
                                {shapes.map(shape => (
                                  <button
                                    key={shape.id}
                                    onClick={() => handleShapeClick(shape.id)}
                                    className="etb-btn"
                                    title={shape.title}
                                    style={{ height: '28px', width: '28px' }}
                                  >
                                    <div
                                      dangerouslySetInnerHTML={{ __html: getShapeSVG(shape.id, 'transparent', 'currentColor') }}
                                      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div style={{ padding: '4px 0', marginTop: '2px' }}>
                            <button onClick={() => { setShowDrawing(true); setShowShapesPopup(false); }} className="etb-btn" title="New Drawing Canvas" style={{ width: '100%', borderRadius: '4px', textAlign: 'center', padding: '4px' }}>New Drawing Canvas...</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowIconsPopup(!showIconsPopup)} title="Icons">
                    <i className="ri-emotion-line"></i>
                    <span className="btn-label">Icons</span>
                  </button>
                  {showIconsPopup && (
                    <div className="insert-popup icons-popup" style={{ width: '600px', left: '100px', top: '-50px' }}>
                      <div className="popup-header">
                        <h4>Icons</h4>
                        <button onClick={() => setShowIconsPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
                      </div>
                      <div className="popup-content" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {recentIcons.length > 0 && (
                          <div style={{ marginBottom: '16px' }}>
                            <div className="category-title">Recently Used</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 40px)', gap: '6px' }}>
                              {recentIcons.map(iconKey => {
                                const parts = iconKey.split('-');
                                const style = parts.pop();
                                const name = parts.join('-');
                                return (
                                  <button key={iconKey} onClick={() => handleIconClick(name, style)} className="etb-btn" style={{ width: '40px', height: '40px' }} title={name}>
                                    <i className={`ri-${name}-${style}`} style={{ fontSize: '22px' }}></i>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className="category-title">Interface</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 40px)', gap: '6px', marginBottom: '16px' }}>
                          {['home', 'user', 'settings', 'search', 'star', 'heart', 'bookmark', 'flag', 'menu', 'more', 'add', 'close', 'check', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'refresh', 'filter', 'sort', 'list', 'grid', 'dashboard', 'apps', 'eye'].map(icon => (
                            <button key={icon} onClick={() => handleIconClick(icon, 'line')} className="etb-btn" style={{ width: '40px', height: '40px' }} title={icon}>
                              <i className={`ri-${icon}-line`} style={{ fontSize: '22px' }}></i>
                            </button>
                          ))}
                        </div>
                        <div className="category-title">Communication</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 40px)', gap: '6px', marginBottom: '16px' }}>
                          {['mail', 'message', 'chat', 'phone', 'send', 'share', 'link', 'notification', 'bell', 'alarm', 'question', 'information', 'feedback', 'customer-service', 'at', 'hashtag', 'discuss', 'chat-quote', 'chat-check'].map(icon => (
                            <button key={icon} onClick={() => handleIconClick(icon, 'line')} className="etb-btn" style={{ width: '40px', height: '40px' }} title={icon}>
                              <i className={`ri-${icon}-line`} style={{ fontSize: '22px' }}></i>
                            </button>
                          ))}
                        </div>
                        <div className="category-title">Media & Files</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 40px)', gap: '6px', marginBottom: '16px' }}>
                          {['folder', 'file', 'file-text', 'file-pdf', 'image', 'video', 'music', 'camera', 'mic', 'volume', 'play', 'pause', 'stop', 'skip-forward', 'skip-back', 'download', 'upload', 'save', 'printer', 'scan', 'file-copy', 'file-add', 'attachment', 'gallery', 'movie', 'film'].map(icon => (
                            <button key={icon} onClick={() => handleIconClick(icon, 'line')} className="etb-btn" style={{ width: '40px', height: '40px' }} title={icon}>
                              <i className={`ri-${icon}-line`} style={{ fontSize: '22px' }}></i>
                            </button>
                          ))}
                        </div>
                        <div className="category-title">Business & Finance</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 40px)', gap: '6px', marginBottom: '16px' }}>
                          {['briefcase', 'bank', 'money-dollar', 'wallet', 'shopping-cart', 'shopping-bag', 'store', 'bar-chart', 'pie-chart', 'line-chart', 'stock', 'funds', 'exchange', 'secure-payment', 'price-tag', 'coupon', 'gift', 'medal', 'trophy'].map(icon => (
                            <button key={icon} onClick={() => handleIconClick(icon, 'line')} className="etb-btn" style={{ width: '40px', height: '40px' }} title={icon}>
                              <i className={`ri-${icon}-line`} style={{ fontSize: '22px' }}></i>
                            </button>
                          ))}
                        </div>
                        <div className="category-title">Location & Travel</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 40px)', gap: '6px', marginBottom: '16px' }}>
                          {['map', 'map-pin', 'navigation', 'compass', 'globe', 'earth', 'roadmap', 'route', 'flight', 'ship', 'car', 'bus', 'train', 'bike', 'walk', 'parking', 'gas-station', 'hotel', 'building', 'home-office'].map(icon => (
                            <button key={icon} onClick={() => handleIconClick(icon, 'line')} className="etb-btn" style={{ width: '40px', height: '40px' }} title={icon}>
                              <i className={`ri-${icon}-line`} style={{ fontSize: '22px' }}></i>
                            </button>
                          ))}
                        </div>
                        <div className="category-title">Technology</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 40px)', gap: '6px' }}>
                          {['computer', 'smartphone', 'tablet', 'device', 'cpu', 'hard-drive', 'database', 'server', 'cloud', 'wifi', 'bluetooth', 'signal', 'battery', 'plug', 'flashlight', 'qr-code', 'barcode', 'fingerprint', 'key', 'lock', 'unlock', 'shield', 'bug', 'code', 'terminal', 'window'].map(icon => (
                            <button key={icon} onClick={() => handleIconClick(icon, 'line')} className="etb-btn" style={{ width: '40px', height: '40px' }} title={icon}>
                              <i className={`ri-${icon}-line`} style={{ fontSize: '22px' }}></i>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowSmartArtPopup(!showSmartArtPopup)} title="SmartArt">
                    <i className="ri-organization-chart"></i>
                    <span className="btn-label">SmartArt</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => {
                    const data = ChartDataParser.parseSelection();
                    setChartDataSource(data);
                    setShowChartPopup(true);
                  }} title="Chart">
                    <i className="ri-bar-chart-grouped-line"></i>
                    <span className="btn-label">Chart</span>
                  </button>
                  {/* Screenshot Popup */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button className="etb-btn etb-btn-vertical" onClick={() => setShowScreenshotPopup(!showScreenshotPopup)} title="Screenshot">
                      <i className="ri-camera-lens-line"></i>
                      <span className="btn-label">Screenshot</span>
                    </button>
                    {showScreenshotPopup && (
                      <div className="insert-popup screenshot-popup" style={{ width: '320px', left: '-100px', top: '70px', padding: '10px' }}>
                        <div className="popup-header">
                          <h4 style={{ margin: 0 }}>Available Windows</h4>
                          <button onClick={() => setShowScreenshotPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
                        </div>
                        <div className="popup-content" style={{ padding: 0 }}>

                          {/* Available Windows (Recent Screenshots Section) */}
                          <div style={{ padding: '10px' }}>
                            <div className="category-title" style={{ marginBottom: '8px', color: 'var(--etb-text, #fff)', fontWeight: '600', fontSize: '11px' }}>Captured Windows</div>

                            <div className="screenshot-grid" style={{
                              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px',
                              maxHeight: '200px', overflowY: 'auto', minHeight: '40px'
                            }}>
                              {recentScreenshots.length > 0 ? (
                                recentScreenshots.map((url, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      const imgTag = `<img src="${url}" style="max-width: 100%; height: auto; border: 1px solid #ccc;" alt="Screenshot" />`;
                                      apply('insertHTML', imgTag);
                                      setShowScreenshotPopup(false);
                                    }}
                                    className="screenshot-item"
                                    style={{
                                      border: '1px solid var(--etb-border, #ddd)',
                                      borderRadius: '2px', cursor: 'pointer', overflow: 'hidden', height: '60px',
                                      background: 'var(--etb-bg)', position: 'relative',
                                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                    title="Insert this screenshot"
                                  >
                                    <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  </div>
                                ))
                              ) : (
                                <div style={{ gridColumn: '1 / -1', padding: '15px', textAlign: 'center', opacity: 0.6, fontSize: '11px', color: 'var(--etb-text)', border: '1px dashed var(--etb-border, #ccc)' }}>
                                  No captured windows available
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer: Screen Clipping Button */}
                          <div style={{ borderTop: '1px solid var(--etb-border, #ddd)', padding: '4px 0' }}>
                            <button
                              className="etb-btn"
                              style={{
                                width: '100%', padding: '10px 14px', justifyContent: 'flex-start',
                                border: 'none', borderRadius: 0, background: 'transparent',
                                color: 'var(--etb-text)', fontSize: '13px', display: 'flex', alignItems: 'center'
                              }}
                              onClick={handleScreenshotCapture}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--etb-hover)';
                                e.currentTarget.style.color = 'var(--etb-accent)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--etb-text)';
                              }}
                            >
                              <i className="ri-crop-line" style={{ fontSize: '16px', marginRight: '8px' }}></i> Screen Clipping
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="etb-group-label">Illustrations</div>
              </div>


              {/* Media Group */}
              <div className="etb-group etb-media-group" ref={onlineVideoRef}>
                <div className="etb-group-content">
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowOnlineVideoPopup(!showOnlineVideoPopup)} title="Online Video">
                    <i className="ri-video-line"></i>
                    <span className="btn-label">Online<br />Video</span>
                  </button>
                  {showOnlineVideoPopup && (
                    <div className="insert-popup" style={{ width: '300px' }}>
                      <div className="popup-header"><h4>Online Video</h4><button onClick={() => setShowOnlineVideoPopup(false)} className="close-btn"><i className="ri-close-line"></i></button></div>
                      <div className="popup-content">
                        <div className="input-group">
                          <label>URL:</label>
                          <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="YouTube or Vimeo URL" style={{ width: '100%' }} />
                        </div>
                        <div className="popup-actions">
                          <button onClick={() => { apply('insertVideo', videoUrl); setShowOnlineVideoPopup(false); }}>Insert</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="etb-group-label">Media</div>
              </div>

              {/* Links Group */}
              <div className="etb-group etb-links-group" ref={linkRef}>
                <div className="etb-group-content">
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowLinkPopup(!showLinkPopup)} title="Link">
                    <i className="ri-link"></i>
                    <span className="btn-label">Link</span>
                  </button>
                  {showLinkPopup && (
                    <div className="insert-popup link-popup" style={{ width: '400px' }}>
                      <div className="popup-header"><h4>Insert Hyperlink</h4><button onClick={() => setShowLinkPopup(false)} className="close-btn"><i className="ri-close-line"></i></button></div>
                      <div className="popup-content">
                        <div className="input-group">
                          <label>Text to display:</label>
                          <input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Text to display" />
                        </div>
                        <div className="input-group">
                          <label>Address:</label>
                          <input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="http://example.com" />
                        </div>
                        <div className="popup-actions" style={{ justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                          <button className="dialog-btn" onClick={() => setShowLinkPopup(false)}>Cancel</button>
                          <button className="dialog-btn primary" onClick={() => {
                            apply('insertLink', { url: linkUrl, text: linkText });
                            setShowLinkPopup(false);
                            setLinkUrl(''); setLinkText('');
                          }}>OK</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowBookmarkPopup(!showBookmarkPopup)} title="Bookmark">
                    <i className="ri-bookmark-line"></i>
                    <span className="btn-label">Bookmark</span>
                  </button>
                  {showBookmarkPopup && (
                    <div className="insert-popup bookmark-popup" style={{ width: '320px', right: 0 }}>
                      <div className="popup-header"><h4>Bookmark</h4><button onClick={() => setShowBookmarkPopup(false)} className="close-btn"><i className="ri-close-line"></i></button></div>
                      <div className="popup-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="input-group">
                          <label>Bookmark name:</label>
                          <input type="text" value={bookmarkName} onChange={(e) => setBookmarkName(e.target.value)} placeholder="Bookmark name" />
                        </div>
                        <div className="bookmark-list" style={{
                          height: '200px',
                          border: '1px solid var(--etb-border)',
                          background: 'var(--etb-bg)',
                          overflowY: 'auto',
                          padding: '4px'
                        }}>
                          {bookmarks && bookmarks.length > 0 ? (
                            bookmarks.map((bm, idx) => (
                              <div key={idx} className="list-item" onClick={() => setBookmarkName(bm)} style={{ padding: '4px', cursor: 'pointer', fontSize: '13px' }}>{bm}</div>
                            ))
                          ) : (
                            <div style={{ padding: '4px', fontStyle: 'italic', color: 'gray' }}>No bookmarks</div>
                          )}
                        </div>
                        <div className="popup-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                          <button className="dialog-btn primary" onClick={() => { apply('insertBookmark', bookmarkName); setBookmarkName(''); }} style={{ flex: 1 }}>Add</button>
                          <button className="dialog-btn" onClick={() => apply('deleteBookmark', bookmarkName)} style={{ flex: 1 }}>Delete</button>
                          <button className="dialog-btn" onClick={() => { apply('goToBookmark', bookmarkName); setShowBookmarkPopup(false); }} style={{ flex: 1 }}>Go To</button>
                        </div>
                      </div>
                    </div>
                  )}
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowCrossReferencePopup(!showCrossReferencePopup)} title="Cross-reference">
                    <i className="ri-links-line"></i>
                    <span className="btn-label">Cross-ref</span>
                  </button>
                  {showCrossReferencePopup && (
                    <div className="insert-popup" style={{ width: '420px', maxHeight: '500px' }}>
                      <div className="popup-header"><h4>Cross-reference</h4><button onClick={() => setShowCrossReferencePopup(false)} className="close-btn"><i className="ri-close-line"></i></button></div>
                      <div className="popup-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {/* Row 1: Dropdowns */}
                        <div style={{ display: 'flex', gap: '15px' }}>
                          <div className="input-group" style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '2px', fontSize: '13px' }}>Reference type:</label>
                            <select style={{
                              width: '100%',
                              padding: '2px',
                              background: 'var(--etb-bg)',
                              color: 'var(--etb-text)',
                              border: '1px solid var(--etb-border)'
                            }}>
                              <option>Bookmark</option>
                              <option>Heading</option>
                              <option>Numbered item</option>
                            </select>
                          </div>
                          <div className="input-group" style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '2px', fontSize: '13px' }}>Insert reference to:</label>
                            <select style={{
                              width: '100%',
                              padding: '2px',
                              background: 'var(--etb-bg)',
                              color: 'var(--etb-text)',
                              border: '1px solid var(--etb-border)'
                            }}>
                              <option>Page number</option>
                              <option>Paragraph number</option>
                              <option>Bookmark text</option>
                            </select>
                          </div>
                        </div>

                        {/* Row 2: Checkboxes */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input
                              type="checkbox"
                              checked={crossRefInsertHyperlink}
                              onChange={(e) => setCrossRefInsertHyperlink(e.target.checked)}
                              style={{ accentColor: 'var(--etb-accent)' }}
                            />
                            Insert as hyperlink
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input
                              type="checkbox"
                              checked={crossRefIncludeAboveBelow}
                              onChange={(e) => setCrossRefIncludeAboveBelow(e.target.checked)}
                              style={{ accentColor: 'var(--etb-accent)' }}
                            />
                            Include above/below
                          </label>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                            <input
                              type="checkbox"
                              checked={crossRefSeparateNumbers}
                              onChange={(e) => setCrossRefSeparateNumbers(e.target.checked)}
                              style={{ accentColor: 'var(--etb-accent)' }}
                            />
                            Separate numbers with
                          </label>
                        </div>

                        {/* Row 3: List Box Header */}
                        <div className="input-group">
                          <label style={{ display: 'block', marginBottom: '2px', fontSize: '13px' }}>For which bookmark:</label>
                          <div className="list-box" style={{
                            height: '130px',
                            border: '1px solid var(--etb-border)',
                            overflowY: 'auto',
                            background: 'var(--etb-bg)',
                            color: 'var(--etb-text)',
                            padding: '2px'
                          }}>
                            {bookmarks && bookmarks.length > 0 ? (
                              bookmarks.map((bm, idx) => (
                                <div key={idx} className="list-item" onClick={() => setCrossReferenceTarget(bm)}
                                  style={{
                                    padding: '2px 6px',
                                    cursor: 'pointer',
                                    background: crossReferenceTarget === bm ? 'var(--etb-accent)' : 'transparent',
                                    color: crossReferenceTarget === bm ? '#000' : 'inherit',
                                    fontSize: '12px'
                                  }}>
                                  {bm}
                                </div>
                              ))
                            ) : (
                              <div style={{ padding: '8px', fontStyle: 'italic', color: 'gray', textAlign: 'center', fontSize: '13px' }}>No bookmarks available</div>
                            )}
                          </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="popup-actions" style={{ justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                          <button className="dialog-btn primary" style={{ minWidth: '80px' }} onClick={() => {
                            if (crossReferenceTarget) {
                              if (crossRefInsertHyperlink) {
                                apply('insertLink', { url: `#${crossReferenceTarget}`, text: crossReferenceTarget });
                              } else {
                                apply('insertHTML', crossReferenceTarget);
                              }
                              setShowCrossReferencePopup(false);
                            }
                          }}>Insert</button>
                          <button className="dialog-btn" style={{ minWidth: '80px' }} onClick={() => setShowCrossReferencePopup(false)}>Cancel</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="etb-group-label">Links</div>
              </div>

              {/* Header & Footer Group */}
              <div className="etb-group etb-header-footer-group" ref={headerRef}>
                <div className="etb-group-content">
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowHeaderFooterPopup(!showHeaderFooterPopup)} title="Header">
                    <i className="ri-layout-top-line"></i>
                    <span className="btn-label">Header</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowFooterPopup(!showFooterPopup)} title="Footer">
                    <i className="ri-layout-bottom-line"></i>
                    <span className="btn-label">Footer</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowPageNumberPopup(!showPageNumberPopup)} title="Page Number">
                    <i className="ri-hashtag"></i>
                    <span className="btn-label">Page<br />Number</span>
                  </button>

                  {showHeaderFooterPopup && (
                    <>
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={() => setShowHeaderFooterPopup(false)}></div>
                      <div className="insert-popup header-footer-popup" style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '700px',
                        height: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid var(--etb-border)',
                        backgroundColor: '#1a1a1a' // Ensuring dark background
                      }}>
                        <div className="popup-header"><h4>Header Configuration</h4><button onClick={() => setShowHeaderFooterPopup(false)} className="close-btn"><i className="ri-close-line"></i></button></div>
                        <div className="popup-content" style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>

                          {/* LEFT PANEL: SETTINGS */}
                          <div className="settings-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px' }}>

                            {/* Header Styles Section */}
                            <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--etb-accent)', fontWeight: 'bold' }}>
                                <i className="ri-layout-masonry-line"></i> Header Styles
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {headerPresets.map(preset => (
                                  <div
                                    key={preset.name}
                                    onClick={() => setHeaderSettings({
                                      ...headerSettings,
                                      text: preset.text,
                                      alignment: preset.align,
                                      borderType: preset.border,
                                      borderColor: preset.color || '#000000',
                                      borderWidth: preset.width || '1px'
                                    })}
                                    style={{
                                      border: '1px solid var(--etb-border)',
                                      borderRadius: '4px',
                                      padding: '8px',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      background: 'var(--etb-bg)',
                                      fontSize: '11px'
                                    }}
                                    className="header-style-preset"
                                  >
                                    <div style={{
                                      height: '30px',
                                      border: '1px solid #ddd',
                                      marginBottom: '5px',
                                      background: '#fff',
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}>
                                      {/* Visual preview of style */}
                                      {preset.type === 'blank' && <span style={{ position: 'absolute', top: 2, left: 2, fontSize: '8px', color: '#999' }}>[Text]</span>}
                                      {preset.type === '3col' && <span style={{ position: 'absolute', top: 2, width: '100%', textAlign: 'center', fontSize: '8px', color: '#999' }}>[Text]  [Text]</span>}
                                      {preset.type === 'austin' && <div style={{ position: 'absolute', bottom: 0, width: '100%', height: '2px', background: preset.color }}></div>}
                                      {preset.type === 'banded' && <div style={{ position: 'absolute', top: 0, width: '100%', height: '4px', background: preset.color }}></div>}
                                    </div>
                                    {preset.name}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Header Settings Section */}
                            <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--etb-accent)', fontWeight: 'bold' }}>
                                <i className="ri-layout-top-line"></i> Header Settings
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Header Text:</label>
                                  <input
                                    type="text"
                                    value={headerSettings.text}
                                    onChange={(e) => setHeaderSettings({ ...headerSettings, text: e.target.value })}
                                    placeholder="Enter header text"
                                    style={{ width: '100%', padding: '8px', background: 'var(--etb-bg)', border: '1px solid var(--etb-border)', color: 'var(--etb-text)' }}
                                  />
                                </div>
                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Alignment:</label>
                                  <select
                                    value={headerSettings.alignment}
                                    onChange={(e) => setHeaderSettings({ ...headerSettings, alignment: e.target.value })}
                                    style={{ width: '100%', padding: '8px', background: 'var(--etb-bg)', border: '1px solid var(--etb-border)', color: 'var(--etb-text)' }}
                                  >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                  </select>
                                </div>
                              </div>
                              <div style={{ marginTop: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={headerSettings.applyToAll}
                                    onChange={(e) => setHeaderSettings({ ...headerSettings, applyToAll: e.target.checked })}
                                    style={{ accentColor: 'var(--etb-accent)' }}
                                  />
                                  Apply to all pages
                                </label>
                              </div>
                            </div>

                            {/* Border Settings Section */}
                            <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '15px', flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--etb-accent)', fontWeight: 'bold' }}>
                                <i className="ri-border-all-line"></i> Border Settings
                              </div>

                              <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Border Style (Visual):</label>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '10px',
                                  maxHeight: '150px',
                                  overflowY: 'auto'
                                }}>
                                  {[
                                    { type: 'none', label: 'None', style: 'none' },
                                    { type: 'solid', label: 'Solid', style: 'solid' },
                                    { type: 'dashed', label: 'Dashed', style: 'dashed' },
                                    { type: 'dotted', label: 'Dotted', style: 'dotted' },
                                    { type: 'double', label: 'Double', style: 'double' },
                                    { type: 'groove', label: 'Groove', style: 'groove' },
                                    { type: 'ridge', label: 'Ridge', style: 'ridge' },
                                    { type: 'inset', label: 'Inset', style: 'inset' },
                                    { type: 'outset', label: 'Outset', style: 'outset' }
                                  ].map((border) => (
                                    <div
                                      key={border.type}
                                      onClick={() => setHeaderSettings({ ...headerSettings, borderType: border.type })}
                                      style={{
                                        border: `1px solid ${headerSettings.borderType === border.type ? 'var(--etb-accent)' : 'var(--etb-border)'}`,
                                        background: headerSettings.borderType === border.type ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      <div style={{ flex: 1, height: '0', borderBottom: `3px ${border.style} ${headerSettings.borderColor}` }}></div>
                                      <span style={{ fontSize: '12px' }}>{border.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Border Color:</label>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px', border: '1px solid var(--etb-border)', background: 'var(--etb-bg)' }}>
                                    <input
                                      type="color"
                                      value={headerSettings.borderColor}
                                      onChange={(e) => setHeaderSettings({ ...headerSettings, borderColor: e.target.value })}
                                      style={{ height: '30px', width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
                                    />
                                  </div>
                                </div>

                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Border Width:</label>
                                  <select
                                    value={headerSettings.borderWidth}
                                    onChange={(e) => setHeaderSettings({ ...headerSettings, borderWidth: e.target.value })}
                                    style={{ width: '100%', padding: '8px', background: 'var(--etb-bg)', border: '1px solid var(--etb-border)', color: 'var(--etb-text)' }}
                                  >
                                    <option value="1px">1px</option>
                                    <option value="2px">2px</option>
                                    <option value="3px">3px</option>
                                    <option value="4px">4px</option>
                                    <option value="6px">6px</option>
                                    <option value="8px">8px</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* RIGHT PANEL: PREVIEW */}
                          <div className="preview-panel" style={{ flex: 1, border: '1px solid var(--etb-border)', borderRadius: '4px', background: '#333', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ padding: '10px', borderBottom: '1px solid var(--etb-border)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <i className="ri-eye-line"></i> Live Preview
                            </div>
                            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', background: '#222' }}>
                              {/* Paper Preview */}
                              <div style={{
                                width: '260px',
                                height: '280px',
                                background: 'white',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                position: 'relative',
                                padding: '20px',
                                overflow: 'hidden'
                              }}>
                                {/* Header Area */}
                                <div style={{
                                  position: 'absolute',
                                  top: '20px',
                                  left: '25px',
                                  right: '25px',
                                  height: '50px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: headerSettings.alignment === 'center' ? 'center' : (headerSettings.alignment === 'right' ? 'flex-end' : 'flex-start'),
                                  borderBottom: headerSettings.borderType !== 'none' ? `${headerSettings.borderWidth} ${headerSettings.borderType} ${headerSettings.borderColor}` : '1px dashed #eee',
                                  color: '#000',
                                  fontSize: '12px',
                                  fontFamily: 'Arial, sans-serif',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {headerSettings.text || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Header Text</span>}
                                </div>

                                {/* Body Placeholder */}
                                <div style={{ marginTop: '60px', display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.5 }}>
                                  <div style={{ height: '8px', background: '#ddd', width: '100%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '92%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '98%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '85%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '60%', borderRadius: '2px' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                        <div className="popup-actions" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--etb-border)' }}>
                          <button className="dialog-btn primary" onClick={() => {
                            // Map headerSettings to the structure expected by paginationEngine
                            const config = {
                              headerText: headerSettings.text,
                              headerAlignment: headerSettings.alignment,
                              footerText: '',
                              footerAlignment: 'left',
                              borderType: headerSettings.borderType,
                              borderColor: headerSettings.borderColor,
                              borderWidth: headerSettings.borderWidth,
                              pageNumbers: {
                                enabled: false,
                                type: 'numeric',
                                position: 'footer-right',
                                format: '{n}'
                              }
                            };
                            apply('headerFooter', config);
                            setShowHeaderFooterPopup(false);
                          }}>
                            <i className="ri-check-line"></i> Apply Header
                          </button>
                          <button className="dialog-btn" onClick={() => setShowHeaderFooterPopup(false)}>
                            <i className="ri-close-line"></i> Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* FOOTER POPUP */}
                  {showFooterPopup && (
                    <>
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={() => setShowFooterPopup(false)}></div>
                      <div className="insert-popup header-footer-popup" style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '700px',
                        height: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid var(--etb-border)',
                        backgroundColor: '#1a1a1a'
                      }}>
                        <div className="popup-header"><h4>Footer Configuration</h4><button onClick={() => setShowFooterPopup(false)} className="close-btn"><i className="ri-close-line"></i></button></div>
                        <div className="popup-content" style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>

                          {/* LEFT PANEL: SETTINGS */}
                          <div className="settings-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', paddingRight: '10px' }}>

                            {/* Footer Styles Section */}
                            <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--etb-accent)', fontWeight: 'bold' }}>
                                <i className="ri-layout-masonry-line"></i> Footer Styles
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {footerPresets.map(preset => (
                                  <div
                                    key={preset.name}
                                    onClick={() => setFooterSettings({
                                      ...footerSettings,
                                      text: preset.text,
                                      alignment: preset.align,
                                      borderType: preset.border,
                                      borderColor: preset.color || '#000000',
                                      borderWidth: preset.width || '1px'
                                    })}
                                    style={{
                                      border: '1px solid var(--etb-border)',
                                      borderRadius: '4px',
                                      padding: '8px',
                                      cursor: 'pointer',
                                      textAlign: 'center',
                                      background: 'var(--etb-bg)',
                                      fontSize: '11px'
                                    }}
                                    className="footer-style-preset"
                                  >
                                    <div style={{
                                      height: '30px',
                                      border: '1px solid #ddd',
                                      marginBottom: '5px',
                                      background: '#fff',
                                      position: 'relative',
                                      overflow: 'hidden'
                                    }}>
                                      {/* Visual preview of style */}
                                      {preset.type === 'blank' && <span style={{ position: 'absolute', bottom: 2, left: 2, fontSize: '8px', color: '#999' }}>[Text]</span>}
                                      {preset.type === '3col' && <span style={{ position: 'absolute', bottom: 2, width: '100%', textAlign: 'center', fontSize: '8px', color: '#999' }}>[Text]  [Text]</span>}
                                      {preset.type === 'austin' && <div style={{ position: 'absolute', top: 0, width: '100%', height: '2px', background: preset.color }}></div>}
                                      {preset.type === 'banded' && <div style={{ position: 'absolute', top: 0, width: '100%', height: '4px', background: preset.color }}></div>}
                                    </div>
                                    {preset.name}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Footer Settings Section */}
                            <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--etb-accent)', fontWeight: 'bold' }}>
                                <i className="ri-layout-bottom-line"></i> Footer Text
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Footer Text:</label>
                                  <input
                                    type="text"
                                    value={footerSettings.text}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, text: e.target.value })}
                                    placeholder="Enter footer text"
                                    style={{ width: '100%', padding: '8px', background: 'var(--etb-bg)', border: '1px solid var(--etb-border)', color: 'var(--etb-text)' }}
                                  />
                                </div>
                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Alignment:</label>
                                  <select
                                    value={footerSettings.alignment}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, alignment: e.target.value })}
                                    style={{ width: '100%', padding: '8px', background: 'var(--etb-bg)', border: '1px solid var(--etb-border)', color: 'var(--etb-text)' }}
                                  >
                                    <option value="left">Left</option>
                                    <option value="center">Center</option>
                                    <option value="right">Right</option>
                                  </select>
                                </div>
                              </div>

                              <div style={{ marginTop: '15px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                  <input
                                    type="checkbox"
                                    checked={footerSettings.applyToAll}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, applyToAll: e.target.checked })}
                                  />
                                  <span>Apply to all pages</span>
                                </label>
                              </div>
                            </div>

                            {/* Border Settings */}
                            <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '15px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', color: 'var(--etb-accent)', fontWeight: 'bold' }}>
                                <i className="ri-border-line"></i> Border Settings
                              </div>

                              <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Border Style (Visual):</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                  {[
                                    { name: 'None', value: 'none', preview: 'none' },
                                    { name: 'Solid', value: 'solid', preview: 'solid' },
                                    { name: 'Dashed', value: 'dashed', preview: 'dashed' },
                                    { name: 'Dotted', value: 'dotted', preview: 'dotted' },
                                    { name: 'Double', value: 'double', preview: 'double' },
                                    { name: 'Groove', value: 'groove', preview: 'groove' },
                                    { name: 'Ridge', value: 'ridge', preview: 'ridge' },
                                    { name: 'Inset', value: 'inset', preview: 'inset' },
                                    { name: 'Outset', value: 'outset', preview: 'outset' }
                                  ].map(style => (
                                    <button
                                      key={style.value}
                                      onClick={() => setFooterSettings({ ...footerSettings, borderType: style.value })}
                                      style={{
                                        padding: '8px 4px',
                                        background: footerSettings.borderType === style.value ? 'var(--etb-accent)' : 'var(--etb-bg)',
                                        border: '1px solid var(--etb-border)',
                                        color: footerSettings.borderType === style.value ? '#000' : 'var(--etb-text)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <div style={{
                                        width: '100%',
                                        height: '3px',
                                        borderTop: style.value === 'none' ? 'none' : `3px ${style.preview} ${footerSettings.borderColor}`,
                                        background: style.value === 'none' ? '#666' : 'transparent'
                                      }}></div>
                                      <span>{style.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Border Color:</label>
                                  <input
                                    type="color"
                                    value={footerSettings.borderColor}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, borderColor: e.target.value })}
                                    style={{ width: '100%', height: '40px', cursor: 'pointer' }}
                                  />
                                </div>
                                <div className="input-group">
                                  <label style={{ display: 'block', marginBottom: '5px' }}>Border Width:</label>
                                  <select
                                    value={footerSettings.borderWidth}
                                    onChange={(e) => setFooterSettings({ ...footerSettings, borderWidth: e.target.value })}
                                    style={{ width: '100%', padding: '8px', background: 'var(--etb-bg)', border: '1px solid var(--etb-border)', color: 'var(--etb-text)' }}
                                  >
                                    <option value="1px">1px</option>
                                    <option value="2px">2px</option>
                                    <option value="3px">3px</option>
                                    <option value="4px">4px</option>
                                    <option value="5px">5px</option>
                                    <option value="6px">6px</option>
                                    <option value="7px">7px</option>
                                    <option value="8px">8px</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                          </div>

                          {/* RIGHT PANEL: LIVE PREVIEW */}
                          <div className="preview-panel" style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--etb-accent)' }}>
                              <i className="ri-eye-line"></i> Live Preview
                            </div>
                            <div style={{
                              flex: 1,
                              background: '#f5f5f5',
                              borderRadius: '4px',
                              padding: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{
                                width: '100%',
                                height: '280px',
                                background: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                position: 'relative',
                                padding: '20px',
                                overflow: 'hidden'
                              }}>
                                {/* Body Placeholder */}
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.5 }}>
                                  <div style={{ height: '8px', background: '#ddd', width: '100%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '92%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '98%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '85%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '8px', background: '#ddd', width: '60%', borderRadius: '2px' }}></div>
                                </div>

                                {/* Footer Area */}
                                <div style={{
                                  position: 'absolute',
                                  bottom: '20px',
                                  left: '25px',
                                  right: '25px',
                                  height: '50px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: footerSettings.alignment === 'center' ? 'center' : (footerSettings.alignment === 'right' ? 'flex-end' : 'flex-start'),
                                  borderTop: footerSettings.borderType !== 'none' ? `${footerSettings.borderWidth} ${footerSettings.borderType} ${footerSettings.borderColor}` : '1px dashed #eee',
                                  color: '#000',
                                  fontSize: '12px',
                                  fontFamily: 'Arial, sans-serif',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {footerSettings.text || <span style={{ color: '#ccc', fontStyle: 'italic' }}>Footer Text</span>}
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                        <div className="popup-actions" style={{ justifyContent: 'flex-end', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--etb-border)' }}>
                          <button className="dialog-btn primary" onClick={() => {
                            // Map footerSettings to the structure expected by paginationEngine
                            const config = {
                              headerText: '',
                              headerAlignment: 'left',
                              footerText: footerSettings.text,
                              footerAlignment: footerSettings.alignment,
                              borderType: footerSettings.borderType,
                              borderColor: footerSettings.borderColor,
                              borderWidth: footerSettings.borderWidth,
                              pageNumbers: {
                                enabled: false,
                                type: 'numeric',
                                position: 'footer-right',
                                format: '{n}'
                              }
                            };
                            apply('headerFooter', config);
                            setShowFooterPopup(false);
                          }}>
                            <i className="ri-check-line"></i> Apply Footer
                          </button>
                          <button className="dialog-btn" onClick={() => setShowFooterPopup(false)}>
                            <i className="ri-close-line"></i> Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* PAGE NUMBER POPUP */}
                  {showPageNumberPopup && (
                    <>
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999 }} onClick={() => setShowPageNumberPopup(false)}></div>
                      <div className="insert-popup header-footer-popup" style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '700px',
                        height: '500px',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10000,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid var(--etb-border)',
                        backgroundColor: '#1a1a1a'
                      }}>
                        <div className="popup-header"><h4>Page Numbers</h4><button onClick={() => setShowPageNumberPopup(false)} className="close-btn"><i className="ri-close-line"></i></button></div>

                        <div className="popup-content" style={{ display: 'flex', gap: '20px', flex: 1, overflow: 'hidden' }}>

                          {/* LEFT PANEL: CATEGORIES & TEMPLATES */}
                          <div className="settings-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '10px' }}>

                            {/* Category Tabs */}
                            <div style={{ display: 'flex', gap: '5px', borderBottom: '2px solid var(--etb-border)', paddingBottom: '10px' }}>
                              {[
                                { id: 'topOfPage', label: 'Top of Page', icon: 'ri-layout-top-line' },
                                { id: 'bottomOfPage', label: 'Bottom of Page', icon: 'ri-layout-bottom-line' },
                                { id: 'pageMargins', label: 'Page Margins', icon: 'ri-layout-left-line' },
                                { id: 'currentPosition', label: 'Current Position', icon: 'ri-cursor-line' }
                              ].map(cat => (
                                <button
                                  key={cat.id}
                                  onClick={() => setPageNumberCategory(cat.id)}
                                  style={{
                                    flex: 1,
                                    padding: '8px 4px',
                                    background: pageNumberCategory === cat.id ? 'var(--etb-accent)' : 'var(--etb-bg)',
                                    border: '1px solid var(--etb-border)',
                                    color: pageNumberCategory === cat.id ? '#000' : 'var(--etb-text)',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '10px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontWeight: pageNumberCategory === cat.id ? 'bold' : 'normal'
                                  }}
                                >
                                  <i className={cat.icon} style={{ fontSize: '16px' }}></i>
                                  <span>{cat.label}</span>
                                </button>
                              ))}
                            </div>

                            {/* Template Grid */}
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {getTemplatesByCategory(pageNumberCategory).map(template => (
                                  <div
                                    key={template.id}
                                    onClick={() => setPageNumberSettings({ ...pageNumberSettings, style: template.id, position: template.position || pageNumberSettings.position })}
                                    style={{
                                      border: `2px solid ${pageNumberSettings.style === template.id ? 'var(--etb-accent)' : 'var(--etb-border)'}`,
                                      borderRadius: '4px',
                                      padding: '10px',
                                      cursor: 'pointer',
                                      background: pageNumberSettings.style === template.id ? 'rgba(255, 215, 0, 0.1)' : 'var(--etb-bg)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      gap: '8px',
                                      minHeight: '80px',
                                      transition: 'all 0.2s'
                                    }}
                                    className="page-number-template"
                                  >
                                    {/* Template Preview */}
                                    <div style={{
                                      width: '100%',
                                      height: '40px',
                                      border: '1px solid #ddd',
                                      background: '#fff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: template.position === 'center' ? 'center' : (template.position === 'right' ? 'flex-end' : 'flex-start'),
                                      padding: '0 8px',
                                      fontSize: '11px',
                                      color: '#000',
                                      fontFamily: 'Arial, sans-serif',
                                      whiteSpace: 'pre-line',
                                      textAlign: template.position || 'left'
                                    }}>
                                      {template.preview}
                                    </div>
                                    {/* Template Name */}
                                    <span style={{ fontSize: '11px', textAlign: 'center', fontWeight: pageNumberSettings.style === template.id ? 'bold' : 'normal' }}>
                                      {template.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* RIGHT PANEL: LIVE PREVIEW */}
                          <div className="preview-panel" style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ marginBottom: '10px', fontWeight: 'bold', color: 'var(--etb-accent)' }}>
                              <i className="ri-eye-line"></i> Live Preview
                            </div>
                            <div style={{
                              flex: 1,
                              background: '#f5f5f5',
                              borderRadius: '4px',
                              padding: '15px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <div style={{
                                width: '100%',
                                height: '280px',
                                background: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                position: 'relative',
                                padding: '20px',
                                overflow: 'hidden'
                              }}>
                                {/* Header Area (if top of page) */}
                                {pageNumberCategory === 'topOfPage' && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '20px',
                                    right: '20px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: pageNumberSettings.position === 'center' || pageNumberSettings.position === 'footer-center' ? 'center' : (pageNumberSettings.position === 'right' || pageNumberSettings.position === 'footer-right' ? 'flex-end' : 'flex-start'),
                                    borderBottom: '1px solid #eee',
                                    color: '#000',
                                    fontSize: '11px',
                                    fontFamily: 'Arial, sans-serif'
                                  }}>
                                    {formatPageNumber(1, pageNumberSettings.format)}
                                  </div>
                                )}

                                {/* Body Placeholder */}
                                <div style={{ marginTop: pageNumberCategory === 'topOfPage' ? '50px' : '10px', display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.5 }}>
                                  <div style={{ height: '6px', background: '#ddd', width: '100%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '6px', background: '#ddd', width: '92%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '6px', background: '#ddd', width: '98%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '6px', background: '#ddd', width: '85%', borderRadius: '2px' }}></div>
                                  <div style={{ height: '6px', background: '#ddd', width: '95%', borderRadius: '2px' }}></div>
                                </div>

                                {/* Footer Area (if bottom of page) */}
                                {pageNumberCategory === 'bottomOfPage' && (
                                  <div style={{
                                    position: 'absolute',
                                    bottom: '15px',
                                    left: '20px',
                                    right: '20px',
                                    height: '30px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: pageNumberSettings.position === 'center' || pageNumberSettings.position === 'footer-center' ? 'center' : (pageNumberSettings.position === 'right' || pageNumberSettings.position === 'footer-right' ? 'flex-end' : 'flex-start'),
                                    borderTop: '1px solid #eee',
                                    color: '#000',
                                    fontSize: '11px',
                                    fontFamily: 'Arial, sans-serif'
                                  }}>
                                    {formatPageNumber(1, pageNumberSettings.format)}
                                  </div>
                                )}

                                {/* Page Margins (if margins) */}
                                {pageNumberCategory === 'pageMargins' && (
                                  <>
                                    {pageNumberSettings.position === 'left' && (
                                      <div style={{
                                        position: 'absolute',
                                        left: '5px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        writingMode: 'vertical-rl',
                                        fontSize: '11px',
                                        color: '#000'
                                      }}>
                                        {formatPageNumber(1, pageNumberSettings.format)}
                                      </div>
                                    )}
                                    {pageNumberSettings.position === 'right' && (
                                      <div style={{
                                        position: 'absolute',
                                        right: '5px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        writingMode: 'vertical-rl',
                                        fontSize: '11px',
                                        color: '#000'
                                      }}>
                                        {formatPageNumber(1, pageNumberSettings.format)}
                                      </div>
                                    )}
                                  </>
                                )}

                                {/* Current Position indicator */}
                                {pageNumberCategory === 'currentPosition' && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    fontSize: '12px',
                                    color: '#000',
                                    padding: '4px 8px',
                                    background: '#fffacd',
                                    border: '1px dashed #999',
                                    borderRadius: '2px'
                                  }}>
                                    {formatPageNumber(1, pageNumberSettings.format)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* Bottom Actions */}
                        <div className="popup-actions" style={{ justifyContent: 'space-between', gap: '10px', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid var(--etb-border)' }}>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="dialog-btn" onClick={() => setShowPageNumberFormatDialog(true)}>
                              <i className="ri-settings-3-line"></i> Format Page Numbers...
                            </button>
                            <button className="dialog-btn" onClick={() => { apply('removePageNumbers'); setShowPageNumberPopup(false); }}>
                              <i className="ri-delete-bin-line"></i> Remove Page Numbers
                            </button>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button className="dialog-btn primary" onClick={() => {
                              const selectedTemplate = getTemplatesByCategory(pageNumberCategory).find(t => t.id === pageNumberSettings.style);
                              apply('insertPageNumber', { ...pageNumberSettings, template: selectedTemplate });
                              setShowPageNumberPopup(false);
                            }}>
                              <i className="ri-check-line"></i> Insert
                            </button>
                            <button className="dialog-btn" onClick={() => setShowPageNumberPopup(false)}>
                              <i className="ri-close-line"></i> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* FORMAT PAGE NUMBERS DIALOG */}
                  {showPageNumberFormatDialog && (
                    <>
                      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 10001 }} onClick={() => setShowPageNumberFormatDialog(false)}></div>
                      <div className="insert-popup header-footer-popup" style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '380px',
                        height: 'auto',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 10002,
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid var(--etb-border)',
                        backgroundColor: '#1a1a1a',
                        padding: '12px'
                      }}>
                        <div className="popup-header" style={{ marginBottom: '10px' }}>
                          <h4 style={{ fontSize: '15px', margin: 0 }}>Format Page Numbers</h4>
                          <button onClick={() => setShowPageNumberFormatDialog(false)} className="close-btn"><i className="ri-close-line"></i></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto' }}>

                          {/* Number Format */}
                          <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px', color: 'var(--etb-accent)', fontWeight: 'bold', fontSize: '12px' }}>
                              <i className="ri-hashtag" style={{ fontSize: '13px' }}></i> Number Format
                            </div>
                            <select
                              value={pageNumberSettings.format}
                              onChange={(e) => setPageNumberSettings({ ...pageNumberSettings, format: e.target.value })}
                              style={{
                                width: '100%',
                                padding: '10px',
                                background: 'var(--etb-bg)',
                                border: '1px solid var(--etb-border)',
                                color: 'var(--etb-text)',
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                            >
                              <option value="arabic">1, 2, 3, ... (Arabic)</option>
                              <option value="roman-upper">I, II, III, ... (Roman Upper)</option>
                              <option value="roman-lower">i, ii, iii, ... (Roman Lower)</option>
                              <option value="alpha-upper">A, B, C, ... (Alphabetic Upper)</option>
                              <option value="alpha-lower">a, b, c, ... (Alphabetic Lower)</option>
                            </select>
                          </div>

                          {/* Position */}
                          <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px', color: 'var(--etb-accent)', fontWeight: 'bold', fontSize: '12px' }}>
                              <i className="ri-align-center" style={{ fontSize: '13px' }}></i> Position
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {['left', 'center', 'right'].map(pos => (
                                <label key={pos} style={{
                                  flex: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  padding: '5px',
                                  border: `1px solid ${pageNumberSettings.position === pos ? 'var(--etb-accent)' : 'var(--etb-border)'}`,
                                  borderRadius: '4px',
                                  background: pageNumberSettings.position === pos ? 'rgba(255, 215, 0, 0.1)' : 'transparent'
                                }}>
                                  <input
                                    type="radio"
                                    name="position"
                                    checked={pageNumberSettings.position === pos}
                                    onChange={() => setPageNumberSettings({ ...pageNumberSettings, position: pos })}
                                    style={{ margin: 0 }}
                                  />
                                  <span style={{ textTransform: 'capitalize' }}>{pos}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Include Chapter Number */}
                          <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px', color: 'var(--etb-accent)', fontWeight: 'bold', fontSize: '12px' }}>
                              <i className="ri-book-line" style={{ fontSize: '13px' }}></i> Chapter Number
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', marginBottom: '5px', fontSize: '12px' }}>
                              <input
                                type="checkbox"
                                checked={pageNumberSettings.includeChapterNumber}
                                onChange={(e) => setPageNumberSettings({ ...pageNumberSettings, includeChapterNumber: e.target.checked })}
                              />
                              <span>Include chapter number</span>
                            </label>
                            {pageNumberSettings.includeChapterNumber && (
                              <div style={{ marginLeft: '18px' }}>
                                <label style={{ display: 'block', marginBottom: '3px', fontSize: '10px' }}>Chapter starts with style:</label>
                                <select
                                  value={pageNumberSettings.chapterHeadingLevel}
                                  onChange={(e) => setPageNumberSettings({ ...pageNumberSettings, chapterHeadingLevel: parseInt(e.target.value) })}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    background: 'var(--etb-bg)',
                                    border: '1px solid var(--etb-border)',
                                    color: 'var(--etb-text)',
                                    borderRadius: '4px'
                                  }}
                                >
                                  <option value="1">Heading 1</option>
                                  <option value="2">Heading 2</option>
                                  <option value="3">Heading 3</option>
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Page Numbering */}
                          <div className="settings-section" style={{ border: '1px solid var(--etb-border)', borderRadius: '4px', padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '5px', color: 'var(--etb-accent)', fontWeight: 'bold', fontSize: '12px' }}>
                              <i className="ri-file-list-line" style={{ fontSize: '13px' }}></i> Page Numbering
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '12px' }}>
                                <input
                                  type="radio"
                                  name="pageNumbering"
                                  checked={pageNumberSettings.continueFromPrevious}
                                  onChange={() => setPageNumberSettings({ ...pageNumberSettings, continueFromPrevious: true })}
                                />
                                <span>Continue from previous section</span>
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                                <input
                                  type="radio"
                                  name="pageNumbering"
                                  checked={!pageNumberSettings.continueFromPrevious}
                                  onChange={() => setPageNumberSettings({ ...pageNumberSettings, continueFromPrevious: false })}
                                />
                                <span>Start at:</span>
                                <input
                                  type="number"
                                  min="1"
                                  value={pageNumberSettings.startAt}
                                  onChange={(e) => setPageNumberSettings({ ...pageNumberSettings, startAt: parseInt(e.target.value) || 1 })}
                                  disabled={pageNumberSettings.continueFromPrevious}
                                  style={{
                                    width: '50px',
                                    padding: '3px',
                                    background: pageNumberSettings.continueFromPrevious ? '#333' : 'var(--etb-bg)',
                                    border: '1px solid var(--etb-border)',
                                    color: pageNumberSettings.continueFromPrevious ? '#666' : 'var(--etb-text)',
                                    borderRadius: '4px'
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                        </div>

                        {/* Actions */}
                        <div className="popup-actions" style={{ justifyContent: 'flex-end', gap: '6px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--etb-border)' }}>
                          <button className="dialog-btn primary" onClick={() => {
                            apply('formatPageNumbers', pageNumberSettings);
                            setShowPageNumberFormatDialog(false);
                          }} style={{ padding: '5px 10px', fontSize: '12px' }}>
                            <i className="ri-check-line"></i> OK
                          </button>
                          <button className="dialog-btn" onClick={() => setShowPageNumberFormatDialog(false)} style={{ padding: '5px 10px', fontSize: '12px' }}>
                            <i className="ri-close-line"></i> Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}


                  {showPageNumberDropdown && (
                    <div className="insert-popup" style={{ width: '200px' }}>
                      <div className="menu-item" onClick={() => { apply('headerFooter', { ...headerSettings, pageNumberPosition: 'header-right' }); setShowPageNumberDropdown(false); }}>Top of Page</div>
                      <div className="menu-item" onClick={() => { apply('headerFooter', { ...headerSettings, pageNumberPosition: 'footer-right' }); setShowPageNumberDropdown(false); }}>Bottom of Page</div>
                    </div>
                  )}
                </div>
                <div className="etb-group-label">Header & Footer</div>
              </div>


              {/* Text Group */}
              <div className="etb-group etb-text-group" ref={textBoxRef}>
                <div className="etb-group-content">
                  <button className="etb-btn etb-btn-vertical" onClick={(e) => { e.stopPropagation(); setShowTextBoxPopup(true); }} title="Text Box">
                    <i className="ri-article-line"></i>
                    <span className="btn-label">Text<br />Box</span>
                  </button>
                  <div ref={quickPartsRef} style={{ position: 'relative' }}>
                    <button className="etb-btn etb-btn-vertical" onClick={() => setShowQuickPartsMenu(!showQuickPartsMenu)} title="Quick Parts">
                      <i className="ri-file-text-line"></i>
                      <span className="btn-label">Quick<br />Parts</span>
                    </button>
                    {showQuickPartsMenu && (
                      <div className="insert-popup" style={{ width: '260px', overflow: 'visible', maxHeight: 'none', padding: '4px 0', zIndex: 3000 }}>

                        {/* AutoText Submenu Trigger */}
                        <div className="menu-item has-submenu"
                          onMouseEnter={() => { setShowAutoTextSubMenu(true); setShowDocPropertySubMenu(false); }}
                          onClick={(e) => { e.stopPropagation(); setShowAutoTextSubMenu(!showAutoTextSubMenu); setShowDocPropertySubMenu(false); }}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><i className="ri-text-snippet" style={{ marginRight: '8px', color: '#FFD700' }}></i>AutoText</span>
                          <i className="ri-arrow-right-s-line"></i>

                          {/* AutoText Nested Menu */}
                          {showAutoTextSubMenu && (
                            <div className="submenu-popup" style={{
                              position: 'absolute',
                              left: '100%',
                              top: '-4px',
                              width: '220px',
                              background: 'var(--etb-popup-bg, #1a1a1a)',
                              border: '1px solid var(--etb-border, #333)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                              zIndex: 3005,
                              display: 'block'
                            }}>
                              <div className="popup-header" style={{ padding: '8px', borderBottom: '1px solid var(--etb-border, #333)', color: '#999', fontSize: '11px', textTransform: 'uppercase' }}>General</div>
                              {autoTextEntries.map((entry, idx) => (
                                <div key={idx} className="menu-item" onClick={(e) => { e.stopPropagation(); apply('insertText', entry.content); setShowQuickPartsMenu(false); }}>
                                  <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{entry.name}</div>
                                  <div style={{ fontSize: '10px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{entry.content}</div>
                                </div>
                              ))}
                              <div className="etb-divider-horiz"></div>
                              <div className="menu-item" onClick={(e) => { e.stopPropagation(); alert('Save Selection to AutoText Gallery (Coming Soon)'); setShowQuickPartsMenu(false); }}>
                                <i className="ri-save-3-line" style={{ marginRight: '8px', color: '#FFD700' }}></i>Save Selection to AutoText Gallery
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Document Property Submenu Trigger */}
                        <div className="menu-item has-submenu"
                          onMouseEnter={() => { setShowDocPropertySubMenu(true); setShowAutoTextSubMenu(false); }}
                          onClick={(e) => { e.stopPropagation(); setShowDocPropertySubMenu(!showDocPropertySubMenu); setShowAutoTextSubMenu(false); }}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span><i className="ri-file-info-line" style={{ marginRight: '8px', color: '#FFD700' }}></i>Document Property</span>
                          <i className="ri-arrow-right-s-line"></i>

                          {/* Doc Property Nested Menu */}
                          {showDocPropertySubMenu && (
                            <div className="submenu-popup" style={{
                              position: 'absolute',
                              left: '100%',
                              top: '40px',
                              width: '220px',
                              background: 'var(--etb-popup-bg, #1a1a1a)',
                              border: '1px solid var(--etb-border, #333)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                              zIndex: 1001,
                              maxHeight: '300px',
                              overflowY: 'auto'
                            }}>
                              {docProperties.map((prop, idx) => (
                                <div key={idx} className="menu-item" onClick={() => { apply('insertText', `[${prop}]`); setShowQuickPartsMenu(false); }}>
                                  {prop}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>


                      </div>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button className="etb-btn etb-btn-vertical" onClick={(e) => { e.stopPropagation(); setShowTextEffectsPopup(!showTextEffectsPopup); }} title="WordArt">
                      <i className="ri-font-color"></i>
                      <span className="btn-label">WordArt</span>
                    </button>
                    {showTextEffectsPopup && (
                      <div className="insert-popup wordart-gallery-popup" style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        width: '340px', // Slightly wider
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        <div className="wordart-header" style={{
                          fontSize: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '1px',
                          color: 'var(--etb-accent)',
                          fontWeight: '600',
                          borderBottom: '1px solid var(--etb-border)',
                          paddingBottom: '8px',
                          marginBottom: '4px'
                        }}>
                          WordArt Styles
                        </div>
                        <div className="wordart-grid" style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(5, 1fr)',
                          gap: '8px'
                        }}>
                          {wordArtStyles.map((style) => (
                            <div
                              key={style.id}
                              className={`wordart-item ${style.className || ''}`}
                              title={style.name}
                              onClick={() => { apply('insertWordArt', style); setShowTextEffectsPopup(false); }}
                              style={{
                                width: '100%',
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                cursor: 'pointer',
                                border: '1px solid transparent',
                                ...style.style // Apply the actual styles for preview
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#FFD700'}
                              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                            >
                              A
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button className="etb-btn etb-btn-vertical" onClick={(e) => {
                      e.stopPropagation();
                      // Save Selection
                      const sel = window.getSelection();
                      if (sel.rangeCount > 0) {
                        setSavedRange(sel.getRangeAt(0));
                      }
                      setShowDropCapMenu(!showDropCapMenu);
                    }} title="Add a Drop Cap"
                      onMouseDown={(e) => { e.preventDefault(); }}>
                      <i className="ri-font-size"></i>
                      <span className="btn-label">Drop<br />Cap</span>
                      <i className="ri-arrow-down-s-line" style={{ fontSize: '10px', marginLeft: '2px' }}></i>
                    </button>
                    {showDropCapMenu && (
                      <div className="insert-popup dropcap-menu" style={{
                        position: 'absolute',
                        top: '100%',
                        left: '0',
                        width: '200px',
                        padding: '4px 0',
                        display: 'flex',
                        flexDirection: 'column',
                        zIndex: 3500
                      }}>
                        <div className="menu-item" onClick={() => {
                          if (savedRange) {
                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(savedRange);
                          }
                          apply('dropCap', 'none');
                          setShowDropCapMenu(false);
                        }}>
                          <i className="ri-align-justify"></i> None
                        </div>
                        <div className="menu-item" onClick={() => {
                          if (savedRange) {
                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(savedRange);
                          }
                          apply('dropCap', 'dropped');
                          setShowDropCapMenu(false);
                        }}>
                          <i className="ri-font-size-2"></i> Dropped
                        </div>
                        <div className="menu-item" onClick={() => {
                          if (savedRange) {
                            const sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(savedRange);
                          }
                          apply('dropCap', 'margin');
                          setShowDropCapMenu(false);
                        }}>
                          <i className="ri-article-line"></i> In margin
                        </div>
                        <div className="etb-divider-horiz"></div>
                        <div className="menu-item" onClick={() => { setShowDropCapOptions(true); setShowDropCapMenu(false); }}>
                          <i className="ri-settings-3-line"></i> Drop Cap Options...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="etb-col-stacked">
                    <button className="etb-btn etb-btn-small-row" onClick={(e) => { e.stopPropagation(); setShowSignatureDialog(true); }} title="Signature Line">
                      <i className="ri-edit-line"></i> Signature Line
                    </button>
                    <button className="etb-btn etb-btn-small-row" onClick={() => setShowDatePopup(!showDatePopup)} title="Date & Time">
                      <i className="ri-calendar-line"></i> Date & Time
                    </button>
                    <button className="etb-btn etb-btn-small-row" onClick={() => setShowObjectPopup(!showObjectPopup)} title="Object">
                      <i className="ri-file-settings-line"></i> Object
                    </button>
                  </div>

                  {showDatePopup && (
                    <div className="insert-popup" style={{ width: '250px' }}>
                      <div className="popup-header"><h4>Date & Time</h4><button onClick={() => setShowDatePopup(false)} className="close-btn">×</button></div>
                      <div className="popup-content">
                        {[(new Date()).toLocaleDateString(), (new Date()).toDateString(), (new Date()).toLocaleString()].map(d => (
                          <div key={d} className="menu-item" onClick={() => { insertSymbolOrEmoji(d); setShowDatePopup(false); }}>{d}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  {showObjectPopup && (
                    <div className="insert-popup" style={{ width: '200px' }}>
                      <div className="menu-item" onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.onchange = (e) => apply('insertFile', e.target.files[0]);
                        input.click();
                        setShowObjectPopup(false);
                      }}>Text from File...</div>
                    </div>
                  )}
                </div>
                <div className="etb-group-label">Text</div>
              </div>

              {/* Symbols Group */}
              <div className="etb-group etb-symbols-group" ref={symbolsRef}>
                <div className="etb-group-content">
                  <div className="etb-col-stacked" style={{ position: 'relative' }}>
                    <button
                      className="etb-btn etb-btn-vertical"
                      onClick={() => setShowEquationDropdown(!showEquationDropdown)}
                      title="Equation"
                      style={{ height: 'auto', paddingBottom: '0' }}
                    >
                      <i className="ri-functions" style={{ fontSize: '24px', marginBottom: '2px', color: '#106ebe' }}></i>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span className="btn-label">Equation</span>
                        <i className="ri-arrow-down-s-line" style={{ fontSize: '10px', marginLeft: '2px' }}></i>
                      </div>
                    </button>
                    {showEquationDropdown && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          right: '0',
                          width: '420px',
                          maxHeight: '400px',
                          background: '#1a1a1a',
                          border: '2px solid #ffd700',
                          borderRadius: '8px',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8)',
                          zIndex: 10000,
                          marginTop: '4px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{
                          padding: '12px 16px',
                          background: '#2a2a2a',
                          borderBottom: '2px solid #ffd700',
                          color: '#ffd700',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase'
                        }}>
                          ✨ Built-In Equations
                        </div>
                        <div style={{ padding: '8px', maxHeight: '300px', overflowY: 'auto', flex: '1' }}>
                          {equationTemplates.map((eq, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                console.log('Inserting equation:', eq.name, eq.mathml);
                                apply('insertEquation', eq.mathml);
                                setShowEquationDropdown(false);
                              }}
                              style={{
                                padding: '12px',
                                margin: '4px 0',
                                background: '#252525',
                                border: '1px solid transparent',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#333';
                                e.currentTarget.style.borderColor = '#ffd700';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#252525';
                                e.currentTarget.style.borderColor = 'transparent';
                              }}
                            >
                              <div style={{
                                fontSize: '10px',
                                color: '#ffd700',
                                marginBottom: '8px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}>
                                {eq.name}
                              </div>
                              <div
                                style={{
                                  background: '#fff',
                                  padding: '10px',
                                  borderRadius: '4px',
                                  textAlign: 'center',
                                  minHeight: '45px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '16px',
                                  fontFamily: 'Cambria Math, Latin Modern Math, serif',
                                  color: '#000',
                                  whiteSpace: 'pre-wrap'
                                }}
                              >
                                {eq.mathml}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          onClick={() => {
                            apply('insertEquation', '');
                            setShowEquationDropdown(false);
                          }}
                          style={{
                            padding: '12px 16px',
                            background: '#2a2a2a',
                            borderTop: '2px solid #ffd700',
                            color: '#ffd700',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ffd700';
                            e.currentTarget.style.color = '#000';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#2a2a2a';
                            e.currentTarget.style.color = '#ffd700';
                          }}
                        >
                          <i className="ri-add-circle-line" style={{ marginRight: '6px', fontSize: '16px' }}></i>
                          Insert New Equation
                        </div>
                      </div>
                    )}
                  </div>

                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowSymbolsPopup(!showSymbolsPopup)} title="Symbol">
                    <i className="ri-omega"></i>
                    <span className="btn-label">Symbol</span>
                  </button>
                  <button className="etb-btn etb-btn-vertical" onClick={() => setShowEmojiPopup(!showEmojiPopup)} title="Emoji">
                    <i className="ri-emotion-happy-line"></i>
                    <span className="btn-label">Emoji</span>
                  </button>
                </div>
                <div className="etb-group-label">Symbols</div>
              </div>


            </div>
            {showDrawing && (
              <div className="drawing-overlay">
                <div className="drawing-canvas-container">
                  <div className="drawing-header">
                    <h3>Drawing Tool</h3>
                    <button onClick={() => setShowDrawing(false)} className="close-btn"><i className="ri-close-line"></i></button>
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
                    <button onClick={() => setShowSymbolsPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
                  </div>
                  <div className="header-footer-content">
                    <div className="symbols-backstage-grid">
                      {[
                        '•', '€', '£', '¥', '©', '®', '™', '±', '≠', '≤', '≥', '÷', '×', '∞', 'µ', 'α', 'β', 'π', 'Ω', 'Σ', '°', 'Δ', '☺', '♥', '₹', '¿', '¡', '—', '…',
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
                    <button onClick={() => setShowEmojiPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
                  </div>
                  <div className="header-footer-content">
                    <div className="symbols-backstage-grid">
                      {[
                        '😀', '😃', '😂', '🤣', '😁', '😆', '🏆', '😉', '😊', '😋', '😎', '😍', '😘', '😗', '™', '😙',
                        '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '™', '😙', '😋', '😛', '😍', '😜',
                        '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😍', '😒', '😞', '😔', '😟', '😢', '😭', '😦', '😧', '😨',
                        '😩', '🤯', '😱', '😦', '😧', '😢', '😯', '😰', '😨', '😱', '😵', '😲', '🤝', '🤛', '🤜', '✊',
                        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
                        '❤️', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💇', '💓', '💗', '💖', '💘', '💝', '💟', '❣️',
                        '🎉', '🎊', '🎈', '🎁', '🎀', '🎄', '🎅', '🎃', '🎆', '🎇', '🧨', '✨', '🎈', '🎉', '🎊', '🎑'
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

            {/* Header/Footer duplicate popup removed to use the main tool logic */}


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
                  <button onClick={() => setShowKeyboardShortcutsPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
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
                  <button onClick={() => setShowTocPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
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
                  <button onClick={() => setShowFootnotePopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
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
                  <button onClick={() => setShowEndnotePopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
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
                  <button onClick={() => setShowCitationPopup(false)} className="close-btn"><i className="ri-close-line"></i></button>
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
                <button onClick={() => setShowSelectionPane(false)} className="close-btn"><i className="ri-close-line"></i></button>
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
      {/* Insert Table Dialog (Centered, No Overlay Color) */}
      {
        showTableDialog && (
          <div className="etb-modeless-overlay" onClick={() => setShowTableDialog(false)}>
            <div className="etb-dialog insert-table-dialog" onClick={(e) => e.stopPropagation()} style={{ position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
              <div className="dialog-header">
                <span>Insert Table</span>
                <button
                  className="dialog-close-btn"
                  onClick={() => setShowTableDialog(false)}
                ><i className="ri-close-line"></i></button>
              </div>
              <div className="dialog-body">
                <div className="dialog-section">
                  <div className="dialog-section-title">Table size</div>
                  <div className="dialog-row">
                    <label>Number of <u>c</u>olumns:</label>
                    <input
                      type="number"
                      value={dialogCols}
                      onChange={(e) => setDialogCols(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1" max="63"
                    />
                  </div>
                  <div className="dialog-row">
                    <label>Number of <u>r</u>ows:</label>
                    <input
                      type="number"
                      value={dialogRows}
                      onChange={(e) => setDialogRows(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1" max="32767"
                    />
                  </div>
                </div>

                <div className="dialog-section">
                  <div className="dialog-section-title">AutoFit behavior</div>
                  <div className="radio-group">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="autofit"
                        checked={autoFitBehavior === 'fixed'}
                        onChange={() => setAutoFitBehavior('fixed')}
                      />
                      <span>Fixed column <u>w</u>idth:</span>
                      <select disabled={autoFitBehavior !== 'fixed'} className="width-select">
                        <option>Auto</option>
                      </select>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="autofit"
                        checked={autoFitBehavior === 'contents'}
                        onChange={() => setAutoFitBehavior('contents')}
                      />
                      <span>AutoFit to <u>c</u>ontents</span>
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="autofit"
                        checked={autoFitBehavior === 'window'}
                        onChange={() => setAutoFitBehavior('window')}
                      />
                      <span>AutoFit to w<u>i</u>ndow</span>
                    </label>
                  </div>
                </div>

                <div className="dialog-footer-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={rememberDimensions}
                      onChange={(e) => setRememberDimensions(e.target.checked)}
                    />
                    Remember dimensions for new tables
                  </label>
                </div>

                <div className="dialog-actions">
                  <button
                    className="dialog-btn primary"
                    onClick={() => {
                      apply('insertTable', { rows: dialogRows, cols: dialogCols, autoFit: autoFitBehavior });
                      setShowTableDialog(false);
                    }}
                  >
                    OK
                  </button>
                  <button
                    className="dialog-btn"
                    onClick={() => setShowTableDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
      {/* Insert Table Dialog (Centered, Modeless) */}
      {
        showTableDialog && (
          <div
            className="etb-modeless-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowTableDialog(false);
            }}
          >
            <div
              className="etb-dialog insert-table-dialog"
              style={{ position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
            >
              <div className="dialog-header">
                <span>Insert Table</span>
                <button
                  className="dialog-close-btn"
                  onClick={() => setShowTableDialog(false)}
                ><i className="ri-close-line"></i></button>
              </div>
              <div className="dialog-body">
                <div className="dialog-section">
                  <div className="dialog-section-title">Table size</div>
                  <div className="dialog-row">
                    <label>Number of <u>c</u>olumns:</label>
                    <input
                      type="number"
                      value={dialogCols}
                      onChange={(e) => setDialogCols(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1" max="63"
                    />
                  </div>
                  <div className="dialog-row">
                    <label>Number of <u>r</u>ows:</label>
                    <input
                      type="number"
                      value={dialogRows}
                      onChange={(e) => setDialogRows(Math.max(1, parseInt(e.target.value) || 1))}
                      min="1" max="32767"
                    />
                  </div>
                </div>

                <div className="dialog-section">
                  <div className="dialog-section-title">AutoFit behavior</div>
                  <div className="radio-group">
                    <div className="radio-option" onClick={() => setAutoFitBehavior('fixed')} style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        style={{ pointerEvents: 'none' }}
                        checked={autoFitBehavior === 'fixed'}
                        readOnly
                      />
                      <span>Fixed column <u>w</u>idth:</span>
                      <div
                        className="etb-spinner"
                        style={{
                          opacity: autoFitBehavior === 'fixed' ? 1 : 0.5,
                          cursor: autoFitBehavior === 'fixed' ? 'text' : 'default'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={fixedColValue}
                          onChange={(e) => setFixedColValue(e.target.value)}
                          disabled={autoFitBehavior !== 'fixed'}
                        />
                        <div className="etb-spinner-btns">
                          <button
                            type="button"
                            onClick={incrementFixedCol}
                            disabled={autoFitBehavior !== 'fixed'}
                          >&#9650;</button>
                          <button
                            type="button"
                            onClick={decrementFixedCol}
                            disabled={autoFitBehavior !== 'fixed'}
                          >&#9660;</button>
                        </div>
                      </div>
                    </div>
                    <div className="radio-option" onClick={() => setAutoFitBehavior('contents')} style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        style={{ pointerEvents: 'none' }}
                        checked={autoFitBehavior === 'contents'}
                        readOnly
                      />
                      <span>AutoFit to <u>c</u>ontents</span>
                    </div>
                    <div className="radio-option" onClick={() => setAutoFitBehavior('window')} style={{ cursor: 'pointer' }}>
                      <input
                        type="radio"
                        style={{ pointerEvents: 'none' }}
                        checked={autoFitBehavior === 'window'}
                        readOnly
                      />
                      <span>AutoFit to w<u>i</u>ndow</span>
                    </div>
                  </div>
                </div>

                <div className="dialog-footer-option">
                  <label>
                    <input
                      type="checkbox"
                      checked={rememberDimensions}
                      onChange={(e) => setRememberDimensions(e.target.checked)}
                    />
                    Remember dimensions for new tables
                  </label>
                </div>

                <div className="dialog-actions">
                  <button
                    className="dialog-btn primary"
                    onClick={() => {
                      apply('insertTable', { rows: dialogRows, cols: dialogCols, autoFit: autoFitBehavior });
                      setShowTableDialog(false);
                    }}
                  >
                    OK
                  </button>
                  <button
                    className="dialog-btn"
                    onClick={() => setShowTableDialog(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* SmartArt Editor */}
      <SmartArtEditor
        isOpen={showSmartArtPopup}
        onClose={() => setShowSmartArtPopup(false)}
        onInsert={handleSmartArtInsert}
      />

      <ChartEditor
        isOpen={showChartPopup}
        onClose={() => setShowChartPopup(false)}
        onInsert={handleChartInsert}
      />

      {/* Text Box Popup */}
      {
        showTextBoxPopup && (
          <div className="popup-overlay" style={{ pointerEvents: 'none' }}>
            <div className="popup-dialog" style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '850px',
              height: '550px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10002,
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.3), 0 10px 30px rgba(0,0,0,0.5)',
              border: '2px solid #FFD700',
              backgroundColor: '#1a1a1a',
              pointerEvents: 'auto',
              borderRadius: '8px'
            }}>
              <div className="popup-header" style={{ marginBottom: '12px', padding: '15px 20px', borderBottom: '1px solid rgba(255, 215, 0, 0.2)' }}>
                <h4 style={{ color: '#FFD700', fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Text Box Gallery</h4>
                <button onClick={() => setShowTextBoxPopup(false)} className="close-btn" style={{ color: '#FFD700', fontSize: '20px' }}><i className="ri-close-line"></i></button>
              </div>

              <div style={{ display: 'flex', flex: 1, gap: '20px', overflow: 'hidden', padding: '0 20px 20px 20px' }} onClick={(e) => e.stopPropagation()}>
                {/* Left Panel - Templates */}
                <div style={{ flex: '0 0 480px', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                  {/* Category Tabs */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', paddingBottom: '10px', borderBottom: '2px solid rgba(255, 215, 0, 0.3)' }} onClick={(e) => e.stopPropagation()}>
                    {textBoxCategories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTextBoxCategory(cat.id);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: textBoxCategory === cat.id ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : '#2a2a2a',
                          color: textBoxCategory === cat.id ? '#000' : '#FFD700',
                          border: `2px solid ${textBoxCategory === cat.id ? '#FFD700' : '#444'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: textBoxCategory === cat.id ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.3s ease',
                          boxShadow: textBoxCategory === cat.id ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (textBoxCategory !== cat.id) {
                            e.currentTarget.style.borderColor = '#FFD700';
                            e.currentTarget.style.background = '#333';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (textBoxCategory !== cat.id) {
                            e.currentTarget.style.borderColor = '#444';
                            e.currentTarget.style.background = '#2a2a2a';
                          }
                        }}
                      >
                        <i className={cat.icon}></i> {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* Template Grid */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '12px',
                      padding: '8px',
                      backgroundColor: '#0a0a0a',
                      borderRadius: '6px',
                      border: '1px solid #333'
                    }}
                  >
                    {getTextBoxTemplatesByCategory(textBoxCategory).map(template => (
                      <div
                        key={template.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTextBoxTemplate(template);
                        }}
                        style={{
                          border: `2px solid ${selectedTextBoxTemplate?.id === template.id ? '#FFD700' : '#333'}`,
                          borderRadius: '6px',
                          padding: '10px',
                          cursor: 'pointer',
                          background: selectedTextBoxTemplate?.id === template.id ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 165, 0, 0.1) 100%)' : '#1a1a1a',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: selectedTextBoxTemplate?.id === template.id ? '0 0 20px rgba(255, 215, 0, 0.4)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedTextBoxTemplate?.id !== template.id) {
                            e.currentTarget.style.borderColor = '#FFD700';
                            e.currentTarget.style.background = '#222';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedTextBoxTemplate?.id !== template.id) {
                            e.currentTarget.style.borderColor = '#333';
                            e.currentTarget.style.background = '#1a1a1a';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        {/* Template Preview - Enhanced to show actual appearance */}
                        <div style={{
                          width: '100%',
                          height: '120px',
                          background: '#fff',
                          borderRadius: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          padding: '10px'
                        }}>
                          <div style={{
                            border: template.style.border?.width && template.style.border?.width !== '0px' ? `${template.style.border?.width} ${template.style.border?.style} ${template.style.border?.color}` : '1px dashed #ddd',
                            borderLeft: template.style.borderLeft || (template.style.border?.width !== '0px' ? undefined : '1px dashed #ddd'),
                            borderTop: template.style.borderTop || (template.style.border?.width !== '0px' ? undefined : '1px dashed #ddd'),
                            borderRight: template.style.border?.width !== '0px' ? undefined : '1px dashed #ddd',
                            borderBottom: template.style.border?.width !== '0px' ? undefined : '1px dashed #ddd',
                            background: template.style.fill || 'transparent',
                            boxShadow: template.style.shadow !== 'none' ? template.style.shadow : 'none',
                            borderRadius: template.style.borderRadius || '0px',
                            width: '100%',
                            height: 'auto',
                            minHeight: '60%',
                            padding: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: template.text.alignment === 'center' ? 'center' : template.text.alignment === 'right' ? 'flex-end' : 'flex-start',
                            justifyContent: 'center',
                            fontSize: '9px',
                            fontFamily: template.text.font,
                            color: template.text.color,
                            fontStyle: template.text.fontStyle || 'normal',
                            fontWeight: template.text.fontWeight || 'normal',
                            overflow: 'hidden',
                            lineHeight: '1.4'
                          }}>
                            <div style={{ pointerEvents: 'none', userSelect: 'none', zIndex: 1 }}>
                              {template.category === 'quotes' ? '“Quote”' :
                                template.category === 'sidebars' ? 'Sidebar Content' :
                                  template.name}
                            </div>
                            {template.decorative && template.decorative.letter && (
                              <div style={{
                                position: 'absolute',
                                fontSize: '40px',
                                color: template.decorative.letterColor || 'rgba(0,0,0,0.1)',
                                zIndex: 0,
                                top: '5px',
                                left: '10px',
                                fontFamily: 'Times New Roman'
                              }}>
                                {template.decorative.letter}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ color: '#FFD700', fontSize: '11px', textAlign: 'center', fontWeight: 'bold' }}>{template.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Panel - Preview */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '2px solid #FFD700', borderRadius: '8px', padding: '15px', background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)' }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ marginBottom: '12px', color: '#FFD700', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 215, 0, 0.3)', paddingBottom: '8px' }}>
                    <i className="ri-eye-line" style={{ fontSize: '18px' }}></i> Live Preview
                  </div>
                  {selectedTextBoxTemplate ? (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#fff',
                      borderRadius: '6px',
                      padding: '20px',
                      border: '1px solid #ddd',
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      <div style={{
                        ...selectedTextBoxTemplate.style,
                        maxWidth: '90%',
                        maxHeight: '280px',
                        overflow: 'auto',
                        fontSize: '10px',
                        padding: selectedTextBoxTemplate.style.padding,
                        color: selectedTextBoxTemplate.text.color,
                        fontFamily: selectedTextBoxTemplate.text.font,
                        textAlign: selectedTextBoxTemplate.text.alignment,
                        lineHeight: selectedTextBoxTemplate.text.lineHeight
                      }}>
                        This is a preview of the {selectedTextBoxTemplate.name}. Click Insert to add it to your document.
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#888',
                      fontSize: '13px',
                      fontStyle: 'italic'
                    }}>
                      Select a template to preview
                    </div>
                  )}
                  <div style={{ marginTop: '12px', fontSize: '11px', color: '#FFD700', textAlign: 'center', fontStyle: 'italic' }}>
                    {selectedTextBoxTemplate?.preview || 'No template selected'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="popup-actions" style={{ justifyContent: 'space-between', marginTop: '0', paddingTop: '20px', borderTop: '2px solid rgba(255, 215, 0, 0.3)', padding: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="dialog-btn" onClick={(e) => {
                    e.stopPropagation();
                    apply('drawTextBox', {});
                    setShowTextBoxPopup(false);
                  }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2a2a2a', color: '#FFD700', border: '2px solid #FFD700', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FFD700'; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#FFD700'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <i className="ri-pencil-ruler-2-line"></i> Draw Text Box
                  </button>
                  <button className="dialog-btn" onClick={(e) => {
                    e.stopPropagation();
                    apply('saveTextBoxToGallery', {});
                  }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2a2a2a', color: '#FFD700', border: '2px solid #FFD700', padding: '10px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#FFD700'; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.5)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.color = '#FFD700'; e.currentTarget.style.boxShadow = 'none'; }}>
                    <i className="ri-save-line"></i> Save to Gallery
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="dialog-btn primary" onClick={(e) => {
                    e.stopPropagation();
                    if (selectedTextBoxTemplate) {
                      apply('insertTextBox', { template: selectedTextBoxTemplate });
                      setShowTextBoxPopup(false);
                    }
                  }} disabled={!selectedTextBoxTemplate} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: selectedTextBoxTemplate ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' : '#444', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '6px', fontSize: '14px', fontWeight: 'bold', cursor: selectedTextBoxTemplate ? 'pointer' : 'not-allowed', transition: 'all 0.3s ease', boxShadow: selectedTextBoxTemplate ? '0 0 25px rgba(255, 215, 0, 0.6)' : 'none' }}
                    onMouseEnter={(e) => { if (selectedTextBoxTemplate) { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)'; } }}
                    onMouseLeave={(e) => { if (selectedTextBoxTemplate) { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.6)'; } }}>
                    <i className="ri-add-line"></i> Insert
                  </button>
                  <button className="dialog-btn" onClick={(e) => {
                    e.stopPropagation();
                    setShowTextBoxPopup(false);
                  }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#333', color: '#fff', border: '2px solid #666', padding: '10px 20px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#444'; e.currentTarget.style.borderColor = '#888'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#333'; e.currentTarget.style.borderColor = '#666'; }}>
                    <i className="ri-close-line"></i> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showDropCapOptions && (
          <div className="modal-overlay" onClick={() => setShowDropCapOptions(false)}>
            <div className="dialog-box drop-cap-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <h3>Drop Cap</h3>
                <button className="close-btn" onClick={() => setShowDropCapOptions(false)}>×</button>
              </div>
              <div className="dialog-content" style={{ padding: '20px' }}>
                <div className="drop-cap-position-group">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Position</label>
                  <div className="position-options">
                    <div className={`pos-opt ${(!dropCapSettings.type || dropCapSettings.type === 'none') ? 'selected' : ''}`} onClick={() => setDropCapSettings({ ...dropCapSettings, type: 'none' })}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}><i className="ri-align-justify"></i></div>
                      None
                    </div>
                    <div className={`pos-opt ${dropCapSettings.type === 'dropped' ? 'selected' : ''}`} onClick={() => setDropCapSettings({ ...dropCapSettings, type: 'dropped' })}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}><i className="ri-font-size-2"></i></div>
                      Dropped
                    </div>
                    <div className={`pos-opt ${dropCapSettings.type === 'margin' ? 'selected' : ''}`} onClick={() => setDropCapSettings({ ...dropCapSettings, type: 'margin' })}>
                      <div style={{ fontSize: '24px', marginBottom: '4px' }}><i className="ri-article-line"></i></div>
                      In margin
                    </div>
                  </div>
                </div>
                <div className="drop-cap-settings-group">
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>Options</label>
                  <div className="setting-row">
                    <span>Font:</span>
                    <select value={dropCapSettings.font} onChange={(e) => setDropCapSettings({ ...dropCapSettings, font: e.target.value })}>
                      {['Times New Roman', 'Arial', 'Calibri', 'Verdana', 'Georgia', 'Courier New', 'Impact'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div className="setting-row">
                    <span>Lines to drop:</span>
                    <input type="number" min="1" max="10" value={dropCapSettings.lines} onChange={(e) => setDropCapSettings({ ...dropCapSettings, lines: parseInt(e.target.value) || 3 })} />
                  </div>
                  <div className="setting-row">
                    <span>Distance from text:</span>
                    <input type="number" step="0.1" min="0" value={dropCapSettings.distance} onChange={(e) => setDropCapSettings({ ...dropCapSettings, distance: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
              </div>
              <div className="dialog-footer">
                <button className="dialog-btn primary" onClick={() => { apply('dropCap', dropCapSettings); setShowDropCapOptions(false); }}>OK</button>
                <button className="dialog-btn" onClick={() => setShowDropCapOptions(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }


      {
        showSignatureDialog && (
          <div className="modal-overlay" onClick={() => setShowSignatureDialog(false)}>
            <div className="dialog-box signature-dialog" onClick={(e) => e.stopPropagation()}>
              <div className="dialog-header">
                <h3>Signature Line</h3>
                <button className="close-btn" onClick={() => setShowSignatureDialog(false)}>×</button>
              </div>
              <div className="dialog-content" style={{ color: '#fff' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #444', marginBottom: '20px' }}>
                  <div
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '12px',
                      cursor: 'pointer',
                      borderBottom: signatureTab === 'type' ? '3px solid #FFD700' : '3px solid transparent',
                      fontWeight: signatureTab === 'type' ? 'bold' : 'normal',
                      color: signatureTab === 'type' ? '#FFD700' : '#888',
                      transition: 'all 0.2s',
                      fontSize: '15px'
                    }}
                    onClick={() => setSignatureTab('type')}
                  >
                    Type Signature
                  </div>
                  <div
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '12px',
                      cursor: 'pointer',
                      borderBottom: signatureTab === 'draw' ? '3px solid #FFD700' : '3px solid transparent',
                      fontWeight: signatureTab === 'draw' ? 'bold' : 'normal',
                      color: signatureTab === 'draw' ? '#FFD700' : '#888',
                      transition: 'all 0.2s',
                      fontSize: '15px'
                    }}
                    onClick={() => setSignatureTab('draw')}
                  >
                    Draw Signature
                  </div>
                </div>

                {/* Type Mode */}
                {signatureTab === 'type' && (
                  <div style={{ padding: '0 5px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ccc' }}>Enter your name:</label>
                    <input
                      type="text"
                      className="etb-text-input"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="e.g. John Doe"
                      style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        borderRadius: '4px',
                        border: '1px solid #444',
                        background: '#333',
                        color: '#fff',
                        marginBottom: '20px'
                      }}
                    />

                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#ccc' }}>Preview:</label>
                    <div style={{
                      padding: '20px',
                      border: '1px solid #444',
                      background: '#fff',
                      color: '#000',
                      fontFamily: '"Brush Script MT", cursive',
                      fontSize: '32px',
                      textAlign: 'center',
                      borderRadius: '4px',
                      minHeight: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {signatureName || <span style={{ color: '#ccc', fontFamily: 'Arial', fontSize: '16px' }}>Signature Preview</span>}
                    </div>
                  </div>
                )}

                {/* Draw Mode */}
                {signatureTab === 'draw' && (
                  <div style={{ padding: '0 5px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                      <label style={{ fontWeight: 'bold', color: '#ccc' }}>Draw below:</label>
                      <button
                        className="etb-btn-small"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => {
                          const canvas = signatureCanvasRef.current;
                          if (canvas) {
                            const ctx = canvas.getContext('2d');
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                          }
                        }}
                      >
                        Clear Canvas
                      </button>
                    </div>
                    <div style={{ border: '2px solid #555', background: '#fff', cursor: 'crosshair', position: 'relative', borderRadius: '4px', overflow: 'hidden' }}>
                      <canvas
                        ref={signatureCanvasRef}
                        width={400}
                        height={180}
                        style={{ display: 'block', width: '100%' }}
                        onMouseDown={(e) => {
                          const canvas = signatureCanvasRef.current;
                          const ctx = canvas.getContext('2d');
                          const rect = canvas.getBoundingClientRect();
                          setIsDrawingSignature(true);
                          ctx.beginPath();
                          ctx.lineWidth = 2.5;
                          ctx.lineCap = 'round';
                          ctx.lineJoin = 'round';
                          ctx.strokeStyle = '#000';
                          ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                        }}
                        onMouseMove={(e) => {
                          if (!isDrawingSignature) return;
                          const canvas = signatureCanvasRef.current;
                          const ctx = canvas.getContext('2d');
                          const rect = canvas.getBoundingClientRect();
                          ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
                          ctx.stroke();
                        }}
                        onMouseUp={() => setIsDrawingSignature(false)}
                        onMouseLeave={() => setIsDrawingSignature(false)}
                      />
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
                      Use your mouse or trackpad to sign freely.
                    </div>
                  </div>
                )}
              </div>


              <div className="dialog-footer">
                <button className="dialog-btn primary" onClick={() => {
                  let payload = {};
                  if (signatureTab === 'type') {
                    if (!signatureName.trim()) return;
                    payload = { type: 'text', content: signatureName };
                  } else {
                    const canvas = signatureCanvasRef.current;
                    // Handle empty canvas?
                    payload = { type: 'image', content: canvas.toDataURL() };
                  }

                  apply('insertSignature', payload);
                  setShowSignatureDialog(false);
                }}>Insert</button>
                <button className="dialog-btn" onClick={() => setShowSignatureDialog(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default EditorToolBox;
