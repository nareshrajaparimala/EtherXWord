import React, { useState, useEffect } from 'react';
import './ParagraphDialog.css';

const ParagraphDialog = ({ isOpen, onClose, onApply, initialSettings }) => {
    const [activeTab, setActiveTab] = useState('indents');
    const [settings, setSettings] = useState({
        alignment: 'left',
        outlineLevel: 'body',
        indentLeft: 0,
        indentRight: 0,
        specialIndentType: 'none',
        specialIndentSize: 0.5,
        mirrorIndents: false,
        spacingBefore: 0,
        spacingAfter: 0,
        lineSpacing: '1.0',
        lineSpacingAt: 1.15,
        dontAddSpace: false,
        ...initialSettings
    });

    useEffect(() => {
        if (isOpen && initialSettings) {
            setSettings(prev => ({ ...prev, ...initialSettings }));
        }
    }, [isOpen]);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleApply = () => {
        onApply(settings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="paragraph-dialog-overlay">
            <div className="paragraph-dialog">
                <div className="dialog-header">
                    <h3>Paragraph</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="dialog-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'indents' ? 'active' : ''}`}
                        onClick={() => setActiveTab('indents')}
                    >
                        Indents and Spacing
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'breaks' ? 'active' : ''}`}
                        onClick={() => setActiveTab('breaks')}
                    >
                        Line and Page Breaks
                    </button>
                </div>

                <div className="dialog-content">
                    {activeTab === 'indents' && (
                        <div className="tab-panel">
                            {/* General Section */}
                            <fieldset className="dialog-group">
                                <legend>General</legend>
                                <div className="cols-2">
                                    <div className="col">
                                        <div className="form-row">
                                            <label>Alignment:</label>
                                            <select
                                                value={settings.alignment}
                                                onChange={(e) => handleChange('alignment', e.target.value)}
                                            >
                                                <option value="left">Left</option>
                                                <option value="center">Centered</option>
                                                <option value="right">Right</option>
                                                <option value="justify">Justified</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="form-row">
                                            <label>Outline level:</label>
                                            <select
                                                value={settings.outlineLevel}
                                                onChange={(e) => handleChange('outlineLevel', e.target.value)}
                                            >
                                                <option value="body">Body Text</option>
                                                <option value="1">Level 1</option>
                                                <option value="2">Level 2</option>
                                                <option value="3">Level 3</option>
                                                <option value="4">Level 4</option>
                                                <option value="5">Level 5</option>
                                                <option value="6">Level 6</option>
                                                <option value="7">Level 7</option>
                                                <option value="8">Level 8</option>
                                                <option value="9">Level 9</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </fieldset>

                            {/* Indentation Section */}
                            <fieldset className="dialog-group">
                                <legend>Indentation</legend>
                                <div className="cols-2">
                                    <div className="col">
                                        <div className="form-row">
                                            <label>Left:</label>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={settings.indentLeft}
                                                    onChange={(e) => handleChange('indentLeft', parseFloat(e.target.value))}
                                                />
                                                <span>"</span>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <label>Right:</label>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={settings.indentRight}
                                                    onChange={(e) => handleChange('indentRight', parseFloat(e.target.value))}
                                                />
                                                <span>"</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="form-row">
                                            <label>Special:</label>
                                            <select
                                                value={settings.specialIndentType}
                                                onChange={(e) => handleChange('specialIndentType', e.target.value)}
                                            >
                                                <option value="none">(none)</option>
                                                <option value="firstLine">First line</option>
                                                <option value="hanging">Hanging</option>
                                            </select>
                                        </div>
                                        <div className="form-row">
                                            <label>By:</label>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    value={settings.specialIndentSize}
                                                    disabled={settings.specialIndentType === 'none'}
                                                    onChange={(e) => handleChange('specialIndentSize', parseFloat(e.target.value))}
                                                />
                                                <span>"</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="checkbox-row" style={{ marginLeft: '80px', marginTop: '4px' }}>
                                    <input
                                        type="checkbox"
                                        id="mirrorIndents"
                                        checked={settings.mirrorIndents}
                                        onChange={(e) => handleChange('mirrorIndents', e.target.checked)}
                                    />
                                    <label htmlFor="mirrorIndents">Mirror indents</label>
                                </div>
                            </fieldset>

                            {/* Spacing Section */}
                            <fieldset className="dialog-group">
                                <legend>Spacing</legend>
                                <div className="cols-2">
                                    <div className="col">
                                        <div className="form-row">
                                            <label>Before:</label>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    value={settings.spacingBefore}
                                                    onChange={(e) => handleChange('spacingBefore', parseInt(e.target.value))}
                                                />
                                                <span>pt</span>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <label>After:</label>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    value={settings.spacingAfter}
                                                    onChange={(e) => handleChange('spacingAfter', parseInt(e.target.value))}
                                                />
                                                <span>pt</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="form-row">
                                            <label>Line spacing:</label>
                                            <select
                                                value={settings.lineSpacing}
                                                onChange={(e) => handleChange('lineSpacing', e.target.value)}
                                            >
                                                <option value="1.0">Single</option>
                                                <option value="1.5">1.5 lines</option>
                                                <option value="2.0">Double</option>
                                                <option value="atLeast">At least</option>
                                                <option value="exactly">Exactly</option>
                                                <option value="multiple">Multiple</option>
                                            </select>
                                        </div>
                                        <div className="form-row">
                                            <label>At:</label>
                                            <div className="input-with-unit">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={settings.lineSpacingAt}
                                                    onChange={(e) => handleChange('lineSpacingAt', parseFloat(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="checkbox-row" style={{ marginTop: '4px' }}>
                                    <input
                                        type="checkbox"
                                        id="dontAddSpace"
                                        checked={settings.dontAddSpace}
                                        onChange={(e) => handleChange('dontAddSpace', e.target.checked)}
                                    />
                                    <label htmlFor="dontAddSpace">Don't add space between paragraphs of the same style</label>
                                </div>
                            </fieldset>

                            {/* Preview Section */}
                            <fieldset className="dialog-group">
                                <legend>Preview</legend>
                                <div className="preview-box" style={{
                                    textAlign: settings.alignment === 'justify' ? 'justify' : settings.alignment,
                                    paddingLeft: `${settings.indentLeft * 20}px`,
                                    paddingRight: `${settings.indentRight * 20}px`,
                                    paddingTop: `${settings.spacingBefore}px`,
                                    paddingBottom: `${settings.spacingAfter}px`,
                                }}>
                                    <p style={{
                                        textIndent: settings.specialIndentType === 'firstLine' ? `${settings.specialIndentSize * 20}px` :
                                            settings.specialIndentType === 'hanging' ? `-${settings.specialIndentSize * 20}px` : '0',
                                        marginLeft: settings.specialIndentType === 'hanging' ? `${settings.specialIndentSize * 20}px` : '0',
                                        lineHeight: settings.lineSpacing === 'multiple' ? settings.lineSpacingAt : settings.lineSpacing
                                    }}>
                                        Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text
                                        Sample Text Sample Text Sample Text Sample Text Sample Text Sample Text
                                    </p>
                                </div>
                            </fieldset>
                        </div>
                    )}

                    {activeTab === 'breaks' && (
                        <div className="tab-panel">
                            <fieldset className="dialog-group">
                                <legend>Pagination</legend>
                                <div className="checkbox-row">
                                    <input type="checkbox" id="widowOrphan" defaultChecked />
                                    <label htmlFor="widowOrphan">Widow/Orphan control</label>
                                </div>
                                <div className="checkbox-row">
                                    <input type="checkbox" id="keepWithNext" />
                                    <label htmlFor="keepWithNext">Keep with next</label>
                                </div>
                                <div className="checkbox-row">
                                    <input type="checkbox" id="keepLines" />
                                    <label htmlFor="keepLines">Keep lines together</label>
                                </div>
                                <div className="checkbox-row">
                                    <input type="checkbox" id="pageBreakBefore" />
                                    <label htmlFor="pageBreakBefore">Page break before</label>
                                </div>
                            </fieldset>
                        </div>
                    )}
                </div>

                <div className="dialog-footer">
                    <button className="btn-secondary" onClick={() => alert('Tabs dialog coming soon')}>Tabs...</button>
                    <div className="footer-actions">
                        <button className="btn-secondary" onClick={() => {
                            if (initialSettings) setSettings(initialSettings);
                        }}>Set As Default</button>
                        <button className="btn-primary" onClick={handleApply}>OK</button>
                        <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParagraphDialog;
