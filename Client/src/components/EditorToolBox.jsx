import React, { useState, useEffect } from 'react';
import './EditorToolBox.css';

const categories = ['File','Home','Insert','Layout','References','Review','View','Help','Formatting','Alignment'];

const EditorToolBox = ({ selectedTool: selectedToolProp, onSelectTool, onApply, currentFormat }) => {
  const [selectedTool, setSelectedTool] = useState(selectedToolProp || 'Home');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (selectedToolProp && selectedToolProp !== selectedTool) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setSelectedTool(selectedToolProp);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [selectedToolProp]);

  const choose = (tool) => {
    if (tool !== selectedTool) {
      setIsTransitioning(true);
      setTimeout(() => {
        setSelectedTool(tool);
        setIsTransitioning(false);
      }, 150);
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

      <div className={`etb-content ${isTransitioning ? 'transitioning' : ''}`}>
        {(selectedTool === 'Home' || selectedTool === 'Formatting') && (
          <div className="etb-row">
            <button className="etb-btn" onClick={() => apply('bold')} title="Bold (Ctrl+B)"><strong>B</strong></button>
            <button className="etb-btn" onClick={() => apply('italic')} title="Italic (Ctrl+I)"><em>I</em></button>
            <button className="etb-btn" onClick={() => apply('underline')} title="Underline (Ctrl+U)"><u>U</u></button>
            <label className="etb-label">Font</label>
            <select className="etb-select" value={currentFormat?.fontFamily || 'Georgia'} onChange={(e) => apply('fontName', e.target.value)} title="Change font family">
              <option>Georgia</option>
              <option>Arial</option>
              <option>Times New Roman</option>
              <option>Calibri</option>
            </select>
            <label className="etb-label">Size</label>
            <select className="etb-select" value={currentFormat?.fontSize || '12pt'} onChange={(e) => apply('fontSize', e.target.value)} title="Change font size">
              <option>8pt</option>
              <option>10pt</option>
              <option>12pt</option>
              <option>14pt</option>
              <option>16pt</option>
            </select>
          </div>
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

        {(selectedTool === 'File' || selectedTool === 'View' || selectedTool === 'Help' || selectedTool === 'Layout' || selectedTool === 'References' || selectedTool === 'Review') && (
          <div className="etb-row">
            <span style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.6 }}>Options for {selectedTool} (coming soon)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorToolBox;
