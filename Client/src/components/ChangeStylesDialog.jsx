import React, { useState, useEffect } from 'react';
import './ChangeStylesDialog.css';

const ChangeStylesDialog = ({ isOpen, onClose, onApply, onPreview, currentSettings }) => {
    const [activeTab, setActiveTab] = useState(null);
    const [selectedStyleSet, setSelectedStyleSet] = useState(currentSettings?.styleSet || 'Default');
    const [selectedColors, setSelectedColors] = useState(currentSettings?.colors || 'Office');
    const [selectedFonts, setSelectedFonts] = useState(currentSettings?.fonts || 'Office');
    const [selectedSpacing, setSelectedSpacing] = useState(currentSettings?.spacing || '6pt');
    const [hoveredOption, setHoveredOption] = useState(null);
    const [isApplying, setIsApplying] = useState(false);

    // Style Sets with actual style definitions
    const styleSets = {
        'Default (Black and White)': {
            heading1: { fontSize: '16pt', fontWeight: 'bold', color: '#000000' },
            heading2: { fontSize: '13pt', fontWeight: 'bold', color: '#000000' },
            body: { fontSize: '11pt', color: '#000000' }
        },
        'Distinctive': {
            heading1: { fontSize: '16pt', fontWeight: 'bold', color: '#17365D' },
            heading2: { fontSize: '13pt', fontWeight: 'bold', color: '#17365D' },
            body: { fontSize: '11pt', color: '#000000' }
        },
        'Elegant': {
            heading1: { fontSize: '16pt', fontWeight: '300', color: '#1F4E78', fontStyle: 'italic' },
            heading2: { fontSize: '13pt', fontWeight: '300', color: '#1F4E78', fontStyle: 'italic' },
            body: { fontSize: '11pt', color: '#000000' }
        },
        'Fancy': {
            heading1: { fontSize: '16pt', fontWeight: 'bold', color: '#C00000' },
            heading2: { fontSize: '13pt', fontWeight: 'bold', color: '#C00000' },
            body: { fontSize: '11pt', color: '#000000' }
        },
        'Formal': {
            heading1: { fontSize: '16pt', fontWeight: 'bold', color: '#000000', borderBottom: '2px solid #000' },
            heading2: { fontSize: '13pt', fontWeight: 'bold', color: '#000000' },
            body: { fontSize: '11pt', color: '#000000' }
        },
        'Modern': {
            heading1: { fontSize: '16pt', fontWeight: '300', color: '#2E74B5' },
            heading2: { fontSize: '13pt', fontWeight: '300', color: '#2E74B5' },
            body: { fontSize: '11pt', color: '#000000' }
        },
        'Simple': {
            heading1: { fontSize: '16pt', fontWeight: 'bold', color: '#365F91' },
            heading2: { fontSize: '13pt', fontWeight: 'bold', color: '#365F91' },
            body: { fontSize: '11pt', color: '#000000' }
        },
        'Traditional': {
            heading1: { fontSize: '16pt', fontWeight: 'bold', color: '#000000' },
            heading2: { fontSize: '13pt', fontWeight: 'bold', color: '#000000', fontStyle: 'italic' },
            body: { fontSize: '11pt', color: '#000000' }
        }
    };

    // Color Themes
    const colorThemes = [
        { name: 'Office', colors: ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'] },
        { name: 'Grayscale', colors: ['#000000', '#7F7F7F', '#ABABAB', '#C9C9C9', '#DDDDDD', '#EEEEEE'] },
        { name: 'Apex', colors: ['#CEB966', '#9CB084', '#6BB1C9', '#6585CF', '#7E6BC9', '#A379BB'] },
        { name: 'Aspect', colors: ['#F07F09', '#9F2936', '#1B587C', '#4E8542', '#604878', '#C19859'] },
        { name: 'Civic', colors: ['#D16349', '#CCAF0A', '#8CADAE', '#8C7B70', '#8FB08C', '#D19049'] },
        { name: 'Concourse', colors: ['#2DA2BF', '#DA1F28', '#EB641B', '#39639D', '#474B78', '#7D3F8D'] },
        { name: 'Equity', colors: ['#D34817', '#9B2D1F', '#A28E6A', '#956251', '#918770', '#855D5D'] },
        { name: 'Flow', colors: ['#0F6FC6', '#009DD9', '#0BD0D9', '#10CF9B', '#7CCA62', '#A5C249'] }
    ];

    // Font Themes
    const fontThemes = [
        { name: 'Office', heading: 'Calibri Light', body: 'Calibri' },
        { name: 'Office 2', heading: 'Calibri', body: 'Cambria' },
        { name: 'Office Classic', heading: 'Arial', body: 'Times New Roman' },
        { name: 'Office Classic 2', heading: 'Arial', body: 'Arial' },
        { name: 'Adjacency', heading: 'Cambria', body: 'Calibri' },
        { name: 'Angles', heading: 'Franklin Gothic Medium', body: 'Franklin Gothic Book' },
        { name: 'Apex', heading: 'Lucida Sans', body: 'Book Antiqua' },
        { name: 'Apothecary', heading: 'Book Antiqua', body: 'Century Gothic' },
        { name: 'Aspect', heading: 'Verdana', body: 'Verdana' },
        { name: 'Austin', heading: 'Century Gothic', body: 'Century Gothic' }
    ];

    // Paragraph Spacing
    const spacingOptions = [
        { name: 'No Paragraph Space', value: '0', lineHeight: '1' },
        { name: 'Compact', value: '4pt', lineHeight: '1' },
        { name: 'Tight', value: '6pt', lineHeight: '1.15' },
        { name: 'Open', value: '10pt', lineHeight: '1.15' },
        { name: 'Relaxed', value: '8pt', lineHeight: '1.5' },
        { name: 'Double', value: '8pt', lineHeight: '2' }
    ];

    // Handle preview on hover
    // Preview handlers removed - were causing infinite loop
    const handleHover = (type, value) => {
        setHoveredOption({ type, value });
    };

    const handleHoverLeave = () => {
        setHoveredOption(null);
    };

    const handleApply = (type, value) => {
        const settings = {
            styleSet: type === 'styleSet' ? value : selectedStyleSet,
            colors: type === 'colors' ? value : selectedColors,
            fonts: type === 'fonts' ? value : selectedFonts,
            spacing: type === 'spacing' ? value : selectedSpacing,
            styleSetDefinition: type === 'styleSet' ? styleSets[value] : styleSets[selectedStyleSet],
            colorTheme: type === 'colors' ? colorThemes.find(t => t.name === value) : colorThemes.find(t => t.name === selectedColors),
            isPreview: false // CRITICAL: Mark as actual application
        };

        onApply(settings);
        setActiveTab(null);
        onClose(); // Auto-close dialog after applying
    };

    const handleSetAsDefault = () => {
        const settings = {
            styleSet: selectedStyleSet,
            colors: selectedColors,
            fonts: selectedFonts,
            spacing: selectedSpacing
        };

        localStorage.setItem('etherxword_default_theme', JSON.stringify(settings));
        alert('Current settings saved as default for new documents');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="change-styles-overlay" onClick={onClose}>
            <div className="change-styles-popup" onClick={(e) => e.stopPropagation()}>
                <div className="change-styles-header">
                    <h3>Change Styles</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="change-styles-menu">
                    {/* Style Set */}
                    <div className="menu-item" onMouseEnter={() => setActiveTab('styleSet')}>
                        <i className="ri-palette-line"></i>
                        <span>Style Set</span>
                        <i className="ri-arrow-right-s-line"></i>
                    </div>

                    {/* Colors */}
                    <div className="menu-item" onMouseEnter={() => setActiveTab('colors')}>
                        <i className="ri-contrast-2-line"></i>
                        <span>Colors</span>
                        <i className="ri-arrow-right-s-line"></i>
                    </div>

                    {/* Fonts */}
                    <div className="menu-item" onMouseEnter={() => setActiveTab('fonts')}>
                        <i className="ri-font-size-2"></i>
                        <span>Fonts</span>
                        <i className="ri-arrow-right-s-line"></i>
                    </div>

                    {/* Paragraph Spacing */}
                    <div className="menu-item" onMouseEnter={() => setActiveTab('spacing')}>
                        <i className="ri-text-spacing"></i>
                        <span>Paragraph Spacing</span>
                        <i className="ri-arrow-right-s-line"></i>
                    </div>

                    <div className="menu-separator"></div>

                    {/* Set as Default */}
                    <div className="menu-item" onClick={handleSetAsDefault}>
                        <i className="ri-save-line"></i>
                        <span>Set as Default</span>
                    </div>
                </div>

                {/* Sub-menus */}
                {activeTab === 'styleSet' && (
                    <div className="submenu-panel">
                        <div className="submenu-header">Style Set</div>
                        <div className="submenu-content">
                            {Object.keys(styleSets).map((set) => (
                                <div
                                    key={set}
                                    className={`submenu-option ${selectedStyleSet === set ? 'selected' : ''}`}
                                    onMouseEnter={() => handleHover('styleSet', set)}
                                    onMouseLeave={handleHoverLeave}
                                    onClick={() => {
                                        setSelectedStyleSet(set);
                                        handleApply('styleSet', set);
                                    }}
                                >
                                    {set}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'colors' && (
                    <div className="submenu-panel">
                        <div className="submenu-header">Colors</div>
                        <div className="submenu-content">
                            {colorThemes.map((theme) => (
                                <div
                                    key={theme.name}
                                    className={`submenu-option color-option ${selectedColors === theme.name ? 'selected' : ''}`}
                                    onMouseEnter={() => handleHover('colors', theme.name)}
                                    onMouseLeave={handleHoverLeave}
                                    onClick={() => {
                                        setSelectedColors(theme.name);
                                        handleApply('colors', theme.name);
                                    }}
                                >
                                    <div className="color-swatches">
                                        {theme.colors.map((color, idx) => (
                                            <div key={idx} className="color-swatch" style={{ backgroundColor: color }}></div>
                                        ))}
                                    </div>
                                    <span>{theme.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'fonts' && (
                    <div className="submenu-panel">
                        <div className="submenu-header">Fonts</div>
                        <div className="submenu-content">
                            {fontThemes.map((theme) => (
                                <div
                                    key={theme.name}
                                    className={`submenu-option font-option ${selectedFonts === theme.name ? 'selected' : ''}`}
                                    onMouseEnter={() => handleHover('fonts', theme.name)}
                                    onMouseLeave={handleHoverLeave}
                                    onClick={() => {
                                        setSelectedFonts(theme.name);
                                        handleApply('fonts', theme.name);
                                    }}
                                >
                                    <div className="font-preview">
                                        <div className="font-heading" style={{ fontFamily: theme.heading }}>
                                            {theme.heading}
                                        </div>
                                        <div className="font-body" style={{ fontFamily: theme.body }}>
                                            {theme.body}
                                        </div>
                                    </div>
                                    <span>{theme.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'spacing' && (
                    <div className="submenu-panel">
                        <div className="submenu-header">Paragraph Spacing</div>
                        <div className="submenu-content">
                            {spacingOptions.map((option) => (
                                <div
                                    key={option.name}
                                    className={`submenu-option spacing-option ${selectedSpacing === option.value ? 'selected' : ''}`}
                                    onMouseEnter={() => handleHover('spacing', option.value)}
                                    onMouseLeave={handleHoverLeave}
                                    onClick={() => {
                                        setSelectedSpacing(option.value);
                                        handleApply('spacing', option.value);
                                    }}
                                >
                                    <div className="spacing-preview">
                                        <svg width="36" height="36" viewBox="0 0 36 36">
                                            <line x1="2" y1="6" x2="34" y2="6" stroke="currentColor" strokeWidth="2" />
                                            <line x1="2" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="2" />
                                            <line x1="2" y1="30" x2="34" y2="30" stroke="currentColor" strokeWidth="2" />
                                            {/* Visual spacing indicator */}
                                            {option.value !== '0' && (
                                                <>
                                                    <line x1="18" y1="8" x2="18" y2={8 + parseInt(option.value) * 0.8} stroke="#4472C4" strokeWidth="1" strokeDasharray="2,2" />
                                                    <line x1="18" y1="20" x2="18" y2={20 + parseInt(option.value) * 0.8} stroke="#4472C4" strokeWidth="1" strokeDasharray="2,2" />
                                                </>
                                            )}
                                        </svg>
                                    </div>
                                    <span>{option.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChangeStylesDialog;
