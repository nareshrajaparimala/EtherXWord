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
  const [tableStyle, setTableStyle] = useState('basic');
  const [tableBorderWidth, setTableBorderWidth] = useState(1);
  const [tableBorderColor, setTableBorderColor] = useState('#000000');
  const [tableHeaderBg, setTableHeaderBg] = useState('#f0f0f0');
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
  const [showPageNumberPopup, setShowPageNumberPopup] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [footerText, setFooterText] = useState('');
  const [pageNumberPosition, setPageNumberPosition] = useState('bottom-center');
  const [showSymbolsPopup, setShowSymbolsPopup] = useState(false);
  const canvasRef = useRef(null);
  const textColorRef = useRef(null);
  const bgColorRef = useRef(null);
  const findReplaceRef = useRef(null);
  const tableRef = useRef(null);
  const imageRef = useRef(null);
  const linkRef = useRef(null);
  const headerFooterRef = useRef(null);
  const pageNumberRef = useRef(null);
  const symbolsRef = useRef(null);

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
      if (pageNumberRef.current && !pageNumberRef.current.contains(event.target)) {
        setShowPageNumberPopup(false);
      }
      if (symbolsRef.current && !symbolsRef.current.contains(event.target)) {
        setShowSymbolsPopup(false);
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
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowTablePopup(true)} title="Table - Insert a table">
                  <i className="ri-table-line"></i>
                  <span className="btn-label">Table</span>
                </button>
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
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowLinkPopup(true)} title="Link - Insert hyperlink">
                  <i className="ri-link"></i>
                  <span className="btn-label">Link</span>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={headerFooterRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowHeaderFooterPopup(true)} title="Header & Footer - Insert header and footer">
                  <i className="ri-layout-top-2-line"></i>
                  <span className="btn-label">Header & Footer</span>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={pageNumberRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowPageNumberPopup(true)} title="Page Numbers - Insert page numbers">
                  <i className="ri-hashtag"></i>
                  <span className="btn-label">Page Numbers</span>
                </button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section" ref={symbolsRef}>
                <button className="etb-btn etb-btn-vertical" onClick={() => setShowSymbolsPopup(true)} title="Symbols - Insert symbols and special characters">
                  <i className="ri-omega"></i>
                  <span className="btn-label">Symbols</span>
                </button>
                <button className="etb-btn etb-btn-vertical" onClick={() => apply('insertEquation')} title="Equations - Insert mathematical equations">
                  <i className="ri-functions"></i>
                  <span className="btn-label">Equations</span>
                </button>
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
                  <div className="drawing-actions">
                    <button onClick={() => { apply('insertLink', { url: linkUrl, text: linkText }); setShowLinkPopup(false); setLinkUrl(''); setLinkText(''); }} disabled={!linkUrl}>Insert</button>
                    <button onClick={() => { setShowLinkPopup(false); setLinkUrl(''); setLinkText(''); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {showHeaderFooterPopup && (
              <div className="drawing-overlay" onClick={() => setShowHeaderFooterPopup(false)}>
                <div className="drawing-canvas-container" style={{width: '600px', height: '400px'}} onClick={(e) => e.stopPropagation()}>
                  <div className="drawing-header">
                    <h3>Header & Footer</h3>
                    <button onClick={() => setShowHeaderFooterPopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="popup-content" style={{padding: '20px'}}>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Header Text:</label>
                      <input 
                        type="text" 
                        value={headerText} 
                        onChange={(e) => setHeaderText(e.target.value)} 
                        placeholder="Enter header text" 
                        style={{width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box'}} 
                      />
                    </div>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Footer Text:</label>
                      <input 
                        type="text" 
                        value={footerText} 
                        onChange={(e) => setFooterText(e.target.value)} 
                        placeholder="Enter footer text" 
                        style={{width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none', boxSizing: 'border-box'}} 
                      />
                    </div>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Quick Options:</label>
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        <button onClick={() => { setHeaderText('Document Title'); apply('insertHeaderFooter', { header: 'Document Title', footer: footerText }); }} style={{padding: '5px 10px', fontSize: '12px'}}>Document Title</button>
                        <button onClick={() => { const date = new Date().toLocaleDateString(); setHeaderText(date); apply('insertHeaderFooter', { header: date, footer: footerText }); }} style={{padding: '5px 10px', fontSize: '12px'}}>Current Date</button>
                        <button onClick={() => { setFooterText('Page [Page] of [Pages]'); apply('insertHeaderFooter', { header: headerText, footer: 'Page [Page] of [Pages]' }); }} style={{padding: '5px 10px', fontSize: '12px'}}>Page Numbers</button>
                        <button onClick={() => { const copyright = '© ' + new Date().getFullYear() + ' Company Name'; setFooterText(copyright); apply('insertHeaderFooter', { header: headerText, footer: copyright }); }} style={{padding: '5px 10px', fontSize: '12px'}}>Copyright</button>
                      </div>
                    </div>
                  </div>
                  <div className="drawing-actions">
                    <button onClick={() => { 
                      apply('insertHeaderFooter', { header: headerText, footer: footerText }); 
                      setShowHeaderFooterPopup(false); 
                      setHeaderText(''); 
                      setFooterText(''); 
                    }}>Insert</button>
                    <button onClick={() => { setShowHeaderFooterPopup(false); setHeaderText(''); setFooterText(''); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {showTablePopup && (
              <div className="drawing-overlay" onClick={() => setShowTablePopup(false)}>
                <div className="drawing-canvas-container" style={{width: '600px', height: '500px'}} onClick={(e) => e.stopPropagation()}>
                  <div className="drawing-header">
                    <h3>Insert Table</h3>
                    <button onClick={() => setShowTablePopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="popup-content" style={{padding: '20px'}}>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Table Size:</label>
                      <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px'}}>
                        <div>
                          <label style={{fontSize: '12px', marginRight: '5px'}}>Rows:</label>
                          <input type="number" min="1" max="50" value={tableRows} onChange={(e) => setTableRows(parseInt(e.target.value) || 1)} style={{width: '60px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px'}} />
                        </div>
                        <div>
                          <label style={{fontSize: '12px', marginRight: '5px'}}>Columns:</label>
                          <input type="number" min="1" max="20" value={tableCols} onChange={(e) => setTableCols(parseInt(e.target.value) || 1)} style={{width: '60px', padding: '5px', border: '1px solid #ccc', borderRadius: '4px'}} />
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px'}}>
                        <button onClick={() => { setTableRows(2); setTableCols(2); }} style={{padding: '5px 10px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>2×2</button>
                        <button onClick={() => { setTableRows(3); setTableCols(3); }} style={{padding: '5px 10px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>3×3</button>
                        <button onClick={() => { setTableRows(4); setTableCols(4); }} style={{padding: '5px 10px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>4×4</button>
                        <button onClick={() => { setTableRows(5); setTableCols(3); }} style={{padding: '5px 10px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>5×3</button>
                      </div>
                    </div>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Table Style:</label>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                        <button onClick={() => setTableStyle('basic')} style={{padding: '10px', border: tableStyle === 'basic' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: tableStyle === 'basic' ? '#e6f3ff' : 'white', color: '#000'}}>Basic</button>
                        <button onClick={() => setTableStyle('striped')} style={{padding: '10px', border: tableStyle === 'striped' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: tableStyle === 'striped' ? '#e6f3ff' : 'white', color: '#000'}}>Striped</button>
                        <button onClick={() => setTableStyle('bordered')} style={{padding: '10px', border: tableStyle === 'bordered' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: tableStyle === 'bordered' ? '#e6f3ff' : 'white', color: '#000'}}>Bordered</button>
                      </div>
                    </div>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Border Options:</label>
                      <div style={{display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px'}}>
                        <div>
                          <label style={{fontSize: '12px', marginRight: '5px'}}>Width:</label>
                          <select value={tableBorderWidth} onChange={(e) => setTableBorderWidth(parseInt(e.target.value))} style={{padding: '5px', border: '1px solid #ccc', borderRadius: '4px'}}>
                            <option value={0}>None</option>
                            <option value={1}>1px</option>
                            <option value={2}>2px</option>
                            <option value={3}>3px</option>
                          </select>
                        </div>
                        <div>
                          <label style={{fontSize: '12px', marginRight: '5px'}}>Color:</label>
                          <input type="color" value={tableBorderColor} onChange={(e) => setTableBorderColor(e.target.value)} style={{width: '40px', height: '30px', border: '1px solid #ccc', borderRadius: '4px'}} />
                        </div>
                      </div>
                    </div>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Header Background:</label>
                      <input type="color" value={tableHeaderBg} onChange={(e) => setTableHeaderBg(e.target.value)} style={{width: '60px', height: '30px', border: '1px solid #ccc', borderRadius: '4px'}} />
                    </div>
                  </div>
                  <div className="drawing-actions">
                    <button onClick={() => { 
                      apply('insertTable', { 
                        rows: tableRows, 
                        cols: tableCols, 
                        style: tableStyle, 
                        borderWidth: tableBorderWidth, 
                        borderColor: tableBorderColor, 
                        headerBg: tableHeaderBg 
                      }); 
                      setShowTablePopup(false); 
                    }}>Insert Table</button>
                    <button onClick={() => { setShowTablePopup(false); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}

            {showSymbolsPopup && (
              <div className="drawing-overlay" onClick={() => setShowSymbolsPopup(false)}>
                <div className="drawing-canvas-container" style={{width: '600px', height: '500px'}} onClick={(e) => e.stopPropagation()}>
                  <div className="drawing-header">
                    <h3>Insert Symbols</h3>
                    <button onClick={() => setShowSymbolsPopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="popup-content" style={{padding: '20px'}}>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#000'}}>Click a symbol to insert:</label>
                      <div style={{display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '8px', maxHeight: '350px', overflowY: 'auto', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#f9f9f9'}}>
                        {['•', '€', '£', '¥', '©', '®', '™', '±', '≠', '≤', '≥', '÷', '×', '∞', 'μ', 'α', 'β', 'π', 'Ω', 'Σ', '°', 'Δ', '☺', '♥', '₹', '¿', '¡', '—', '…', 'À', 'Á', 'Â', 'Ã', 'Ç', 'È', 'É', 'Ê', 'Ë', 'Ì', 'Í', 'Î', 'Ï', 'Ñ', 'Ò', 'Ó', 'Ô', 'Õ', 'Ö', 'Ù', 'Ú', 'Û', 'Ü', 'ß', 'à', 'á', 'â', 'ã', 'ä', 'å', 'æ', 'ç', 'è', 'é', 'ê', 'ë', 'ì', 'í', 'î', 'ï', 'ñ', 'ò', 'ó', 'ô', 'õ', 'ö', 'ù', 'ú', 'û', 'ü', 'ÿ', 'Ğ', 'ğ', 'İ', 'ı', 'Œ', 'œ', 'Ş', 'ş', 'Ÿ'].map((symbol, index) => (
                          <button 
                            key={index}
                            onClick={() => { apply('insertSymbol', symbol); setShowSymbolsPopup(false); }}
                            style={{
                              padding: '10px', 
                              fontSize: '18px', 
                              border: '1px solid #ccc', 
                              borderRadius: '4px', 
                              background: 'white', 
                              color: '#000',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              minHeight: '40px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#e6f3ff';
                              e.target.style.borderColor = '#007acc';
                              e.target.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'white';
                              e.target.style.borderColor = '#ccc';
                              e.target.style.transform = 'scale(1)';
                            }}
                            title={`Insert ${symbol}`}
                          >
                            {symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="drawing-actions">
                    <button onClick={() => { setShowSymbolsPopup(false); }}>Close</button>
                  </div>
                </div>
              </div>
            )}

            {showPageNumberPopup && (
              <div className="drawing-overlay" onClick={() => setShowPageNumberPopup(false)}>
                <div className="drawing-canvas-container" style={{width: '500px', height: '450px'}} onClick={(e) => e.stopPropagation()}>
                  <div className="drawing-header">
                    <h3>Page Numbers</h3>
                    <button onClick={() => setShowPageNumberPopup(false)} className="close-btn">×</button>
                  </div>
                  <div className="popup-content" style={{padding: '20px'}}>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Position:</label>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '15px'}}>
                        <button 
                          onClick={() => setPageNumberPosition('top-left')} 
                          style={{padding: '10px', border: pageNumberPosition === 'top-left' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: pageNumberPosition === 'top-left' ? '#e6f3ff' : 'white', color: '#000'}}
                        >
                          Top Left
                        </button>
                        <button 
                          onClick={() => setPageNumberPosition('top-center')} 
                          style={{padding: '10px', border: pageNumberPosition === 'top-center' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: pageNumberPosition === 'top-center' ? '#e6f3ff' : 'white', color: '#000'}}
                        >
                          Top Center
                        </button>
                        <button 
                          onClick={() => setPageNumberPosition('top-right')} 
                          style={{padding: '10px', border: pageNumberPosition === 'top-right' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: pageNumberPosition === 'top-right' ? '#e6f3ff' : 'white', color: '#000'}}
                        >
                          Top Right
                        </button>
                        <button 
                          onClick={() => setPageNumberPosition('bottom-left')} 
                          style={{padding: '10px', border: pageNumberPosition === 'bottom-left' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: pageNumberPosition === 'bottom-left' ? '#e6f3ff' : 'white', color: '#000'}}
                        >
                          Bottom Left
                        </button>
                        <button 
                          onClick={() => setPageNumberPosition('bottom-center')} 
                          style={{padding: '10px', border: pageNumberPosition === 'bottom-center' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: pageNumberPosition === 'bottom-center' ? '#e6f3ff' : 'white', color: '#000'}}
                        >
                          Bottom Center
                        </button>
                        <button 
                          onClick={() => setPageNumberPosition('bottom-right')} 
                          style={{padding: '10px', border: pageNumberPosition === 'bottom-right' ? '2px solid #007acc' : '1px solid #ccc', borderRadius: '4px', background: pageNumberPosition === 'bottom-right' ? '#e6f3ff' : 'white', color: '#000'}}
                        >
                          Bottom Right
                        </button>
                      </div>
                    </div>
                    <div className="input-group" style={{marginBottom: '20px'}}>
                      <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Format Options:</label>
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        <button onClick={() => { apply('insertPageNumbers', { position: pageNumberPosition, format: 'number' }); setShowPageNumberPopup(false); }} style={{padding: '8px 12px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>1, 2, 3...</button>
                        <button onClick={() => { apply('insertPageNumbers', { position: pageNumberPosition, format: 'roman' }); setShowPageNumberPopup(false); }} style={{padding: '8px 12px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>i, ii, iii...</button>
                        <button onClick={() => { apply('insertPageNumbers', { position: pageNumberPosition, format: 'alpha' }); setShowPageNumberPopup(false); }} style={{padding: '8px 12px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>a, b, c...</button>
                        <button onClick={() => { apply('insertPageNumbers', { position: pageNumberPosition, format: 'pageOf' }); setShowPageNumberPopup(false); }} style={{padding: '8px 12px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px'}}>Page 1 of 5</button>
                      </div>
                    </div>
                  </div>
                  <div className="drawing-actions">
                    <button onClick={() => { 
                      apply('insertPageNumbers', { position: pageNumberPosition, format: 'number' }); 
                      setShowPageNumberPopup(false); 
                    }}>Insert Numbers</button>
                    <button onClick={() => { setShowPageNumberPopup(false); }}>Cancel</button>
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
