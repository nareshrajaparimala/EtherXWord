import React, { useState, useEffect, useRef } from 'react';
import './EditorToolBox.css';

const categories = ['File','Home','Insert','Layout','References','Review','View','Help','Alignment'];

const presetColors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#808080', '#800080', '#008000', '#000080', '#808000', '#FFA500', '#FFC0CB'
];

const EditorToolBox = ({ selectedTool: selectedToolProp, onSelectTool, onApply, currentFormat }) => {
  const [selectedTool, setSelectedTool] = useState(selectedToolProp || 'Home');
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentBgColor, setCurrentBgColor] = useState('#ffff00');
  const [customTextColor, setCustomTextColor] = useState('#000000');
  const [customBgColor, setCustomBgColor] = useState('#ffff00');
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
      enabled: false,
      type: 'numeric',
      position: 'footer-right',
      format: 'Page {n}'
    }
  });
  const canvasRef = useRef(null);
  const textColorRef = useRef(null);
  const bgColorRef = useRef(null);
  const findReplaceRef = useRef(null);
  const tableRef = useRef(null);
  const imageRef = useRef(null);
  const linkRef = useRef(null);
  const headerFooterRef = useRef(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
              <div className="etb-section">
                <button className="etb-btn etb-btn-small" onClick={() => apply('undo')} title="Undo - Reverses the last action (Ctrl+Z)">
                  <i className="ri-arrow-go-back-line"></i>
                </button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('redo')} title="Redo - Restores the last undone action (Ctrl+Y)">
                  <i className="ri-arrow-go-forward-line"></i>
                </button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('refresh')} title="Refresh - Reloads the document content (F5)">
                  <i className="ri-refresh-line"></i>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section">
                <button className="etb-btn etb-btn-small" onClick={() => apply('cut')} title="Cut - Removes selected content to clipboard (Ctrl+X)">
                  <i className="ri-scissors-line"></i>
                </button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('copy')} title="Copy - Copies selected content to clipboard (Ctrl+C)">
                  <i className="ri-file-copy-line"></i>
                </button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('paste')} title="Paste - Inserts clipboard content (Ctrl+V)">
                  <i className="ri-clipboard-line"></i>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section">
                <button className="etb-btn etb-btn-small" onClick={() => apply('bold')} title="Bold - Makes text bold (Ctrl+B)"><strong>B</strong></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('italic')} title="Italic - Makes text italic (Ctrl+I)"><em>I</em></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('underline')} title="Underline - Underlines text (Ctrl+U)"><u>U</u></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('strikeThrough')} title="Strikethrough - Crosses out text"><s>S</s></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('superscript')} title="Superscript - Raises text above baseline">X<sup>2</sup></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('subscript')} title="Subscript - Lowers text below baseline">X<sub>2</sub></button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section etb-font-section">
                <label className="etb-label">Font</label>
                <select className="etb-select etb-select-small" value={currentFormat?.fontFamily || 'Georgia'} onChange={(e) => apply('fontName', e.target.value)} title="Change font family">
                  <option>Georgia</option>
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Calibri</option>
                  <option>Helvetica</option>
                  <option>Verdana</option>
                  <option>Tahoma</option>
                  <option>Trebuchet MS</option>
                  <option>Arial Black</option>
                  <option>Impact</option>
                  <option>Comic Sans MS</option>
                  <option>Courier New</option>
                  <option>Lucida Console</option>
                  <option>Palatino</option>
                  <option>Garamond</option>
                </select>
                <select className="etb-select etb-select-small" value={currentFormat?.fontSize || '12pt'} onChange={(e) => apply('fontSize', e.target.value)} title="Change font size">
                  <option>8pt</option>
                  <option>10pt</option>
                  <option>12pt</option>
                  <option>14pt</option>
                  <option>16pt</option>
                </select>
                <div className="etb-color-container" ref={textColorRef}>
                  <button className="etb-btn etb-btn-small etb-color-btn" onClick={() => setShowTextColorPicker(!showTextColorPicker)} title="Text Color">
                    <span className="color-icon">A</span>
                    <div className="color-bar" style={{backgroundColor: currentTextColor}}></div>
                  </button>
                  {showTextColorPicker && (
                    <div className="color-picker-panel">
                      <div className="color-preset-grid">
                        {presetColors.map(color => (
                          <div
                            key={color}
                            className="color-swatch"
                            style={{backgroundColor: color}}
                            onClick={() => {
                              setCurrentTextColor(color);
                              apply('foreColor', color);
                              setShowTextColorPicker(false);
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
                            value={customTextColor}
                            onChange={(e) => setCustomTextColor(e.target.value)}
                          />
                          <input
                            type="text"
                            value={customTextColor}
                            onChange={(e) => setCustomTextColor(e.target.value)}
                            placeholder="#000000"
                          />
                          <button onClick={() => {
                            setCurrentTextColor(customTextColor);
                            apply('foreColor', customTextColor);
                            setShowTextColorPicker(false);
                          }}>Apply</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="etb-color-container" ref={bgColorRef}>
                  <button className="etb-btn etb-btn-small etb-color-btn" onClick={() => setShowBgColorPicker(!showBgColorPicker)} title="Text Background Color">
                    <i className="ri-mark-pen-line"></i>
                    <div className="color-bar" style={{backgroundColor: currentBgColor}}></div>
                  </button>
                  {showBgColorPicker && (
                    <div className="color-picker-panel">
                      <div className="color-preset-grid">
                        {presetColors.map(color => (
                          <div
                            key={color}
                            className="color-swatch"
                            style={{backgroundColor: color}}
                            onClick={() => {
                              setCurrentBgColor(color);
                              apply('backColor', color);
                              setShowBgColorPicker(false);
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
                            value={customBgColor}
                            onChange={(e) => setCustomBgColor(e.target.value)}
                          />
                          <input
                            type="text"
                            value={customBgColor}
                            onChange={(e) => setCustomBgColor(e.target.value)}
                            placeholder="#ffff00"
                          />
                          <button onClick={() => {
                            setCurrentBgColor(customBgColor);
                            apply('backColor', customBgColor);
                            setShowBgColorPicker(false);
                          }}>Apply</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section etb-styles-section">
                <label className="etb-label">Styles</label>
                <select className="etb-select etb-select-small" onChange={(e) => apply('applyTextStyle', e.target.value)} title="Apply text style">
                  <option value="">Select Style</option>
                  <option value="heading1">Heading 1</option>
                  <option value="heading2">Heading 2</option>
                  <option value="heading3">Heading 3</option>
                  <option value="heading4">Heading 4</option>
                  <option value="title">Title</option>
                  <option value="subtitle">Subtitle</option>
                  <option value="body">Body Text</option>
                  <option value="paragraph">Paragraph</option>
                  <option value="quote">Quote</option>
                  <option value="code">Code</option>
                  <option value="caption">Caption</option>
                  <option value="emphasis">Emphasis</option>
                </select>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section etb-bullet-section">
                <button className="etb-btn etb-btn-small" onClick={() => apply('insertUnorderedList')} title="Bullet List - Creates unordered list with bullet points">
                  <i className="ri-list-unordered"></i>
                </button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('insertOrderedList')} title="Numbered List - Creates ordered list with numbers">
                  <i className="ri-list-ordered"></i>
                </button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('bulletStyleDisc')} title="Disc Bullets - Solid circle bullet style">•</button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('bulletStyleCircle')} title="Circle Bullets - Hollow circle bullet style">○</button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('bulletStyleSquare')} title="Square Bullets - Square bullet style">■</button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('createNestedBullet')} title="Nested Bullet - Creates indented sub-bullet">⤷•</button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('indent')} title="Increase Indent - Moves text further right (Tab)">
                  <i className="ri-indent-increase"></i>
                </button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('outdent')} title="Decrease Indent - Moves text further left (Shift+Tab)">
                  <i className="ri-indent-decrease"></i>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section etb-find-section" ref={findReplaceRef}>
                <button className="etb-btn etb-btn-small" onClick={() => setShowFindReplace(!showFindReplace)} title="Find - Search for text in document (Ctrl+F)">
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
              </div>
            </div>
          </>
        )}

        {selectedTool === 'Alignment' && (
          <div className="etb-row">
            <button className="etb-btn" onClick={() => apply('justifyLeft')} title="Align left">Left</button>
            <button className="etb-btn" onClick={() => apply('justifyCenter')} title="Align center">Center</button>
            <button className="etb-btn" onClick={() => apply('justifyRight')} title="Align right">Right</button>
            <button className="etb-btn" onClick={() => apply('justifyFull')} title="Justify">Justify</button>
          </div>
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
                            className={`table-cell ${
                              row < tableRows && col < tableCols ? 'selected' : ''
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
                    style={{border: '1px solid #ccc', background: 'white', cursor: 'crosshair'}}
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
                <div className="drawing-canvas-container" style={{width: '500px', height: '300px'}} onClick={(e) => e.stopPropagation()}>
                  <div className="drawing-header">
                    <h3>Insert Link</h3>
                    <button onClick={() => setShowLinkPopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="popup-content" style={{padding: '20px'}} onClick={(e) => e.stopPropagation()}>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>URL:</label>
                      <input 
                        type="text" 
                        value={linkUrl} 
                        onChange={(e) => setLinkUrl(e.target.value)} 
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="https://example.com" 
                        style={{width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box'}} 
                        autoFocus
                      />
                    </div>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Text:</label>
                      <input 
                        type="text" 
                        value={linkText} 
                        onChange={(e) => setLinkText(e.target.value)} 
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Link text" 
                        style={{width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box'}} 
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
        )}

        {selectedTool === 'File' && (
          <>
            <div className="etb-row">
              <div className="etb-section">
                <button className="etb-btn" onClick={() => apply('fileNew')} title="New document">
                  <i className="ri-file-add-line"></i> New
                </button>
                <button className="etb-btn" onClick={() => apply('fileOpen')} title="Open document">
                  <i className="ri-folder-open-line"></i> Open
                </button>
                <button className="etb-btn" onClick={() => apply('fileSave')} title="Save document">
                  <i className="ri-save-line"></i> Save
                </button>
                <button className="etb-btn" onClick={() => apply('fileSaveAs')} title="Save as new document">
                  <i className="ri-save-2-line"></i> Save As
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section">
                <button className="etb-btn" onClick={() => apply('fileShare')} title="Share document">
                  <i className="ri-share-line"></i> Share
                </button>
                <button className="etb-btn" onClick={() => apply('fileCopy')} title="Create a copy">
                  <i className="ri-file-copy-line"></i> Copy
                </button>
                <button className="etb-btn" onClick={() => apply('fileRename')} title="Rename document">
                  <i className="ri-edit-line"></i> Rename
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section">
                <button className="etb-btn" onClick={() => apply('fileExport')} title="Export document (choose format)">
                  <i className="ri-download-line"></i> Export
                </button>
                <button className="etb-btn" onClick={() => apply('fileExportPdf')} title="Export as PDF">
                  <i className="ri-file-pdf-line"></i> Export PDF
                </button>
                <button className="etb-btn" onClick={() => apply('fileExportDocx')} title="Export as DOCX">
                  <i className="ri-file-word-line"></i> Export DOCX
                </button>
                <button className="etb-btn" onClick={() => apply('filePrint')} title="Print document">
                  <i className="ri-printer-line"></i> Print
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section">
                <button className="etb-btn" onClick={() => apply('fileDelete')} title="Delete document">
                  <i className="ri-delete-bin-line"></i> Delete
                </button>
                <button className="etb-btn" onClick={() => apply('fileClose')} title="Close document">
                  <i className="ri-close-line"></i> Close
                </button>
              </div>
            </div>
          </>
        )}

        {(selectedTool === 'View' || selectedTool === 'Help' || selectedTool === 'Layout' || selectedTool === 'References' || selectedTool === 'Review') && (
          <div className="etb-row">
            <span style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.6 }}>Options for {selectedTool} (coming soon)</span>
          </div>
        )}
        

      </div>
    </div>
  );
};

export default EditorToolBox;
