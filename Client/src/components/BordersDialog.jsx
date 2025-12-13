import React, { useState } from 'react';
import './BordersDialog.css';

const BordersDialog = ({ onClose, onApply, initialSettings = {} }) => {
    const [activeTab, setActiveTab] = useState('borders');
    const [borderSettings, setBorderSettings] = useState({
        setting: initialSettings.setting || 'none',
        style: initialSettings.style || 'solid',
        color: initialSettings.color || '#000000',
        width: initialSettings.width || '0.5',
        applyTo: initialSettings.applyTo || 'paragraph',
        top: initialSettings.top || false,
        bottom: initialSettings.bottom || false,
        left: initialSettings.left || false,
        right: initialSettings.right || false,
    });

    const [shadingSettings, setShadingSettings] = useState({
        fill: initialSettings.shadingFill || 'transparent',
        pattern: initialSettings.shadingPattern || 'clear',
    });

    // Simple line styles - different thicknesses and patterns matching MS Word
    const borderStyles = [
        { value: 'solid-1px', label: 'Thin line', cssStyle: 'solid', cssWidth: '1px' },
        { value: 'solid-3px', label: 'Medium line', cssStyle: 'solid', cssWidth: '3px' },
        { value: 'solid-5px', label: 'Thick line', cssStyle: 'solid', cssWidth: '5px' },
        { value: 'solid-7px', label: 'Extra thick', cssStyle: 'solid', cssWidth: '7px' },
        { value: 'dotted-6px', label: 'Dotted', cssStyle: 'dotted', cssWidth: '6px' },
        { value: 'dashed-6px', label: 'Dashed', cssStyle: 'dashed', cssWidth: '6px' },
        { value: 'dashed-8px', label: 'Long dash', cssStyle: 'dashed', cssWidth: '8px' },
        { value: 'double-8px', label: 'Double line', cssStyle: 'double', cssWidth: '8px' },
        { value: 'groove-6px', label: '3D groove', cssStyle: 'groove', cssWidth: '6px' },
        { value: 'ridge-6px', label: '3D ridge', cssStyle: 'ridge', cssWidth: '6px' },
    ];

    const borderWidths = ['0.25', '0.5', '0.75', '1', '1.5', '2.25', '3', '4.5', '6'];

    const borderColors = [
        { value: 'auto', label: 'Automatic' },
        { value: '#000000', label: 'Black' },
        { value: '#FFFFFF', label: 'White' },
        { value: '#FF0000', label: 'Red' },
        { value: '#00FF00', label: 'Green' },
        { value: '#0000FF', label: 'Blue' },
        { value: '#FFFF00', label: 'Yellow' },
        { value: '#FF00FF', label: 'Magenta' },
        { value: '#00FFFF', label: 'Cyan' },
        { value: '#808080', label: 'Gray' },
        { value: '#FFD700', label: 'Gold' },
    ];

    const shadingColors = [
        { value: 'transparent', label: 'No Color' },
        { value: '#FFFF00', label: 'Yellow' },
        { value: '#00FFFF', label: 'Cyan' },
        { value: '#FF00FF', label: 'Magenta' },
        { value: '#C0C0C0', label: 'Light Gray' },
        { value: '#D3D3D3', label: 'Light Gray 25%' },
        { value: '#A9A9A9', label: 'Dark Gray' },
        { value: '#FFD700', label: 'Gold' },
    ];

    const handleSettingClick = (setting) => {
        let newSettings = { ...borderSettings, setting };

        switch (setting) {
            case 'none':
                newSettings = { ...newSettings, top: false, bottom: false, left: false, right: false };
                break;
            case 'box':
                newSettings = { ...newSettings, top: true, bottom: true, left: true, right: true };
                break;
            case 'shadow':
                newSettings = { ...newSettings, top: true, bottom: true, left: true, right: true };
                break;
            case '3d':
                newSettings = { ...newSettings, top: true, bottom: true, left: true, right: true };
                break;
            case 'custom':
                break;
            default:
                break;
        }

        setBorderSettings(newSettings);
    };

    const handleBorderToggle = (side) => {
        setBorderSettings({
            ...borderSettings,
            [side]: !borderSettings[side],
            setting: 'custom'
        });
    };

    const handleApply = () => {
        // Get the actual CSS style and width from the selected border style
        const selectedStyle = borderStyles.find(s => s.value === borderSettings.style);
        const cssStyle = selectedStyle ? selectedStyle.cssStyle : 'solid';
        const cssWidth = selectedStyle ? selectedStyle.cssWidth : borderSettings.width + 'pt';

        onApply({
            borders: {
                ...borderSettings,
                cssStyle: cssStyle,  // Add the actual CSS style
                cssWidth: cssWidth   // Add the actual CSS width
            },
            shading: shadingSettings
        });
        onClose();
    };

    const renderPreview = () => {
        const { top, bottom, left, right, style, color, width } = borderSettings;
        // Get the actual CSS style from the selected border style
        const selectedStyle = borderStyles.find(s => s.value === style);
        const cssStyle = selectedStyle ? selectedStyle.cssStyle : 'solid';
        // Use bright gold color and thicker width for preview visibility
        const borderValue = `3pt ${cssStyle} #ffd700`;

        return (
            <div className="bd-preview-container">
                <div className="bd-preview-label">Preview</div>
                <div className="bd-preview-instruction">
                    Click on diagram below or use buttons to apply borders
                </div>
                <div className="bd-preview-diagram">
                    <div
                        className="bd-preview-box"
                        style={{
                            borderTop: top ? borderValue : 'none',
                            borderBottom: bottom ? borderValue : 'none',
                            borderLeft: left ? borderValue : 'none',
                            borderRight: right ? borderValue : 'none',
                            backgroundColor: activeTab === 'shading' ? shadingSettings.fill : 'transparent'
                        }}
                    >
                        <div className="bd-preview-lines">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="bd-preview-line" style={{ background: '#ffd700', height: '2px' }}></div>
                            ))}
                        </div>
                    </div>

                    <button
                        className={`bd-border-btn bd-border-top ${top ? 'active' : ''}`}
                        onClick={() => handleBorderToggle('top')}
                        title="Toggle top border"
                    />
                    <button
                        className={`bd-border-btn bd-border-bottom ${bottom ? 'active' : ''}`}
                        onClick={() => handleBorderToggle('bottom')}
                        title="Toggle bottom border"
                    />
                    <button
                        className={`bd-border-btn bd-border-left ${left ? 'active' : ''}`}
                        onClick={() => handleBorderToggle('left')}
                        title="Toggle left border"
                    />
                    <button
                        className={`bd-border-btn bd-border-right ${right ? 'active' : ''}`}
                        onClick={() => handleBorderToggle('right')}
                        title="Toggle right border"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bd-overlay" onClick={onClose}>
            <div className="bd-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="bd-header">
                    <h3>Borders and Shading</h3>
                    <button className="bd-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="bd-tabs">
                    <button
                        className={`bd-tab ${activeTab === 'borders' ? 'active' : ''}`}
                        onClick={() => setActiveTab('borders')}
                    >
                        Borders
                    </button>
                    <button
                        className={`bd-tab ${activeTab === 'page-border' ? 'active' : ''}`}
                        onClick={() => setActiveTab('page-border')}
                    >
                        Page Border
                    </button>
                    <button
                        className={`bd-tab ${activeTab === 'shading' ? 'active' : ''}`}
                        onClick={() => setActiveTab('shading')}
                    >
                        Shading
                    </button>
                </div>

                <div className="bd-content">
                    {activeTab === 'borders' && (
                        <div className="bd-borders-tab">
                            <div className="bd-left-panel">
                                <div className="bd-section">
                                    <label className="bd-label">Setting:</label>
                                    <div className="bd-settings-grid">
                                        <button
                                            className={`bd-setting-btn ${borderSettings.setting === 'none' ? 'active' : ''}`}
                                            onClick={() => handleSettingClick('none')}
                                            title="None"
                                        >
                                            <div className="bd-setting-icon bd-icon-none"></div>
                                            <span>None</span>
                                        </button>
                                        <button
                                            className={`bd-setting-btn ${borderSettings.setting === 'box' ? 'active' : ''}`}
                                            onClick={() => handleSettingClick('box')}
                                            title="Box"
                                        >
                                            <div className="bd-setting-icon bd-icon-box"></div>
                                            <span>Box</span>
                                        </button>
                                        <button
                                            className={`bd-setting-btn ${borderSettings.setting === 'shadow' ? 'active' : ''}`}
                                            onClick={() => handleSettingClick('shadow')}
                                            title="Shadow"
                                        >
                                            <div className="bd-setting-icon bd-icon-shadow"></div>
                                            <span>Shadow</span>
                                        </button>
                                        <button
                                            className={`bd-setting-btn ${borderSettings.setting === '3d' ? 'active' : ''}`}
                                            onClick={() => handleSettingClick('3d')}
                                            title="3-D"
                                        >
                                            <div className="bd-setting-icon bd-icon-3d"></div>
                                            <span>3-D</span>
                                        </button>
                                        <button
                                            className={`bd-setting-btn ${borderSettings.setting === 'custom' ? 'active' : ''}`}
                                            onClick={() => handleSettingClick('custom')}
                                            title="Custom"
                                        >
                                            <div className="bd-setting-icon bd-icon-custom"></div>
                                            <span>Custom</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="bd-section">
                                    <label className="bd-label">Style:</label>
                                    <div className="bd-style-list">
                                        {borderStyles.map(style => (
                                            <div
                                                key={style.value}
                                                className={`bd-style-item ${borderSettings.style === style.value ? 'active' : ''}`}
                                                onClick={() => setBorderSettings({ ...borderSettings, style: style.value })}
                                            >
                                                <div
                                                    className="bd-style-preview-line"
                                                    style={{
                                                        borderBottom: `${style.cssWidth} ${style.cssStyle} #ffffff`
                                                    }}
                                                ></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bd-section">
                                    <label className="bd-label">Color:</label>
                                    <div className="bd-color-picker">
                                        <input
                                            type="color"
                                            value={borderSettings.color === 'auto' ? '#000000' : borderSettings.color}
                                            onChange={(e) => setBorderSettings({ ...borderSettings, color: e.target.value })}
                                            className="bd-color-input"
                                        />
                                        <select
                                            className="bd-select"
                                            value={borderSettings.color}
                                            onChange={(e) => setBorderSettings({ ...borderSettings, color: e.target.value })}
                                        >
                                            {borderColors.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bd-section">
                                    <label className="bd-label">Width:</label>
                                    <select
                                        className="bd-select"
                                        value={borderSettings.width}
                                        onChange={(e) => setBorderSettings({ ...borderSettings, width: e.target.value })}
                                    >
                                        {borderWidths.map(w => (
                                            <option key={w} value={w}>{w} pt</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="bd-right-panel">
                                {renderPreview()}

                                <div className="bd-apply-to">
                                    <label className="bd-label">Apply to:</label>
                                    <select
                                        className="bd-select"
                                        value={borderSettings.applyTo}
                                        onChange={(e) => setBorderSettings({ ...borderSettings, applyTo: e.target.value })}
                                    >
                                        <option value="paragraph">Paragraph</option>
                                        <option value="text">Text</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'shading' && (
                        <div className="bd-shading-tab">
                            <div className="bd-left-panel">
                                <div className="bd-section">
                                    <label className="bd-label">Fill:</label>
                                    <div className="bd-color-picker">
                                        <input
                                            type="color"
                                            value={shadingSettings.fill === 'transparent' ? '#ffffff' : shadingSettings.fill}
                                            onChange={(e) => setShadingSettings({ ...shadingSettings, fill: e.target.value })}
                                            className="bd-color-input"
                                        />
                                        <select
                                            className="bd-select"
                                            value={shadingSettings.fill}
                                            onChange={(e) => setShadingSettings({ ...shadingSettings, fill: e.target.value })}
                                        >
                                            {shadingColors.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bd-section">
                                    <label className="bd-label">Pattern:</label>
                                    <select
                                        className="bd-select"
                                        value={shadingSettings.pattern}
                                        onChange={(e) => setShadingSettings({ ...shadingSettings, pattern: e.target.value })}
                                    >
                                        <option value="clear">Clear</option>
                                        <option value="solid">Solid (100%)</option>
                                        <option value="5percent">5%</option>
                                        <option value="10percent">10%</option>
                                        <option value="20percent">20%</option>
                                        <option value="25percent">25%</option>
                                        <option value="30percent">30%</option>
                                        <option value="40percent">40%</option>
                                        <option value="50percent">50%</option>
                                        <option value="60percent">60%</option>
                                        <option value="70percent">70%</option>
                                        <option value="75percent">75%</option>
                                        <option value="80percent">80%</option>
                                        <option value="90percent">90%</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bd-right-panel">
                                {renderPreview()}

                                <div className="bd-apply-to">
                                    <label className="bd-label">Apply to:</label>
                                    <select
                                        className="bd-select"
                                        value={borderSettings.applyTo}
                                        onChange={(e) => setBorderSettings({ ...borderSettings, applyTo: e.target.value })}
                                    >
                                        <option value="paragraph">Paragraph</option>
                                        <option value="text">Text</option>
                                        <option value="cell">Cell</option>
                                        <option value="table">Table</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'page-border' && (
                        <div className="bd-page-border-tab">
                            <div className="bd-info-message">
                                <i className="ri-information-line"></i>
                                <p>Page border settings will be available in a future update.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bd-footer">
                    <button className="bd-btn bd-btn-primary" onClick={handleApply}>
                        OK
                    </button>
                    <button className="bd-btn bd-btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BordersDialog;
