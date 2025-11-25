import React, { useState, useEffect, useRef } from 'react';
import './EditorToolBox.css';

const categories = ['File','Home','Insert','Layout','References','Review','View','Help','Formatting','Alignment'];

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
  const textColorRef = useRef(null);
  const bgColorRef = useRef(null);

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
    if (onApply) onApply(cmd, value);
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
        {(selectedTool === 'Home' || selectedTool === 'Formatting') && (
          <>
            <div className="etb-row">
              <div className="etb-section">
                <button className="etb-btn etb-btn-small" onClick={() => apply('bold')} title="Bold (Ctrl+B)"><strong>B</strong></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('italic')} title="Italic (Ctrl+I)"><em>I</em></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('underline')} title="Underline (Ctrl+U)"><u>U</u></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('strikeThrough')} title="Strikethrough"><s>S</s></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('superscript')} title="Superscript">X<sup>2</sup></button>
                <button className="etb-btn etb-btn-small" onClick={() => apply('subscript')} title="Subscript">X<sub>2</sub></button>
              </div>
              <div className="etb-divider"></div>
              <div className="etb-section etb-font-section">
                <label className="etb-label">Font</label>
                <select className="etb-select etb-select-small etb-select-hover" value={currentFormat?.fontFamily || 'Georgia'} onChange={(e) => apply('fontName', e.target.value)} title="Change font family">
                  <option>Georgia</option>
                  <option>Arial</option>
                  <option>Times New Roman</option>
                  <option>Calibri</option>
                </select>
                <select className="etb-select etb-select-small etb-select-hover" value={currentFormat?.fontSize || '12pt'} onChange={(e) => apply('fontSize', e.target.value)} title="Change font size">
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
          <div className="etb-row">
            <button className="etb-btn" onClick={() => apply('insertParagraph')} title="Insert paragraph">Paragraph</button>
            <button className="etb-btn" onClick={() => apply('insertPageBreak')} title="Insert page break">Page Break</button>
            <button className="etb-btn" onClick={() => apply('insertImage')} title="Insert image">Image</button>
          </div>
        )}

        {selectedTool === 'File' && (
          <div className="etb-row">
            <button className="etb-btn" onClick={() => apply('fileNew')} title="New document">
              <i className="ri-file-add-line"></i> New
            </button>
            <button className="etb-btn" onClick={() => apply('fileOpen')} title="Open document">
              <i className="ri-folder-open-line"></i> Open
            </button>
            <button className="etb-btn" onClick={() => apply('fileShare')} title="Share document">
              <i className="ri-share-line"></i> Share
            </button>
            <button className="etb-btn" onClick={() => apply('fileCopy')} title="Create a copy">
              <i className="ri-file-copy-line"></i> Copy
            </button>
            <button className="etb-btn" onClick={() => apply('fileExport')} title="Export document">
              <i className="ri-download-line"></i> Export
            </button>
            <button className="etb-btn" onClick={() => apply('filePrint')} title="Print document">
              <i className="ri-printer-line"></i> Print
            </button>
            <button className="etb-btn" onClick={() => apply('fileRename')} title="Rename document">
              <i className="ri-edit-line"></i> Rename
            </button>
            <button className="etb-btn" onClick={() => apply('fileDelete')} title="Delete document">
              <i className="ri-delete-bin-line"></i> Delete
            </button>
          </div>
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
