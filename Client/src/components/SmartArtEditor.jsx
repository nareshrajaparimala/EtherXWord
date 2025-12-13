// SmartArt Editor Component - Phase 1
import React, { useState, useRef, useEffect } from 'react';
import './SmartArtEditor.css';
import { SMARTART_CATEGORIES, getLayoutsByCategory, SMARTART_COLORS, SMARTART_STYLES } from '../utils/SmartArtTemplates';
import { renderAdvancedThumbnail } from '../utils/SmartArtRendering.jsx';

const SmartArtEditor = ({ isOpen, onClose, onInsert }) => {
    const [selectedCategory, setSelectedCategory] = useState(SMARTART_CATEGORIES.ALL);
    const [selectedLayout, setSelectedLayout] = useState(null);
    const [selectedColorScheme, setSelectedColorScheme] = useState(SMARTART_COLORS.COLORFUL[0]);
    const [selectedStyle, setSelectedStyle] = useState(SMARTART_STYLES.SIMPLE[0]);
    const [textItems, setTextItems] = useState(['Item 1', 'Item 2', 'Item 3']);
    const [showTextPane, setShowTextPane] = useState(false);


    // Phase 2: All layouts enabled (71+ layouts)
    const getFilteredLayouts = () => {
        return getLayoutsByCategory(selectedCategory);
    };


    const handleLayoutSelect = (layout) => {
        setSelectedLayout(layout);
        // Initialize text items based on default shapes
        const items = Array.from({ length: layout.defaultShapes }, (_, i) => `Item ${i + 1}`);
        setTextItems(items);
    };

    const handleInsert = () => {
        if (selectedLayout) {
            onInsert({
                layout: selectedLayout,
                textItems,
                colorScheme: selectedColorScheme,
                style: selectedStyle,
            });
            onClose();
        }
    };

    const handleTextChange = (index, value) => {
        const newItems = [...textItems];
        newItems[index] = value;
        setTextItems(newItems);
    };

    const addTextItem = () => {
        setTextItems([...textItems, `Item ${textItems.length + 1}`]);
    };

    const removeTextItem = (index) => {
        if (textItems.length > 1) {
            setTextItems(textItems.filter((_, i) => i !== index));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="smartart-overlay">
            <div className="smartart-dialog">
                <div className="smartart-header">
                    <h3>Choose a SmartArt Graphic</h3>
                    <button className="smartart-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="smartart-body">
                    {/* Left Panel - Categories */}
                    <div className="smartart-categories">
                        <div className="category-header">
                            <i className="ri-gallery-line"></i>
                            <span>All</span>
                        </div>
                        {Object.values(SMARTART_CATEGORIES).map(category => (
                            <div
                                key={category}
                                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                <i className={`ri-${getCategoryIcon(category)}`}></i>
                                <span>{category}</span>
                            </div>
                        ))}
                    </div>

                    {/* Middle Panel - Layout Grid */}
                    <div className="smartart-layouts">
                        <div className="category-title">{selectedCategory}</div>
                        <div className="layouts-grid">
                            {getFilteredLayouts().map(layout => (
                                <div
                                    key={layout.id}
                                    className={`layout-item ${selectedLayout?.id === layout.id ? 'selected' : ''}`}
                                    onClick={() => handleLayoutSelect(layout)}
                                    title={layout.description}
                                >
                                    <div className="layout-thumbnail">
                                        {renderLayoutThumbnail(layout)}
                                    </div>
                                    <div className="layout-name">{layout.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Preview & Description */}
                    <div className="smartart-preview">
                        {selectedLayout ? (
                            <>
                                <div className="preview-area">
                                    {renderLayoutPreview(selectedLayout, textItems, selectedColorScheme)}
                                </div>
                                <div className="layout-description">
                                    <h4>{selectedLayout.name}</h4>
                                    <p>{selectedLayout.description}</p>
                                </div>

                                {/* Color Schemes */}
                                <div className="color-schemes">
                                    <label>Colors:</label>
                                    <div className="color-options">
                                        {SMARTART_COLORS.COLORFUL.map((scheme, index) => (
                                            <div
                                                key={index}
                                                className={`color-scheme ${selectedColorScheme === scheme ? 'selected' : ''}`}
                                                onClick={() => setSelectedColorScheme(scheme)}
                                            >
                                                {scheme.colors.map((color, i) => (
                                                    <div key={i} className="color-swatch" style={{ background: color }}></div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Text Pane Toggle */}
                                <button className="text-pane-toggle" onClick={() => setShowTextPane(!showTextPane)}>
                                    <i className="ri-text"></i> {showTextPane ? 'Hide' : 'Show'} Text Pane
                                </button>

                                {showTextPane && (
                                    <div className="text-pane">
                                        <div className="text-pane-header">
                                            <span>Type your text here:</span>
                                            <button onClick={addTextItem} title="Add Item">
                                                <i className="ri-add-line"></i>
                                            </button>
                                        </div>
                                        <div className="text-items">
                                            {textItems.map((item, index) => (
                                                <div key={index} className="text-item">
                                                    <span className="bullet">•</span>
                                                    <input
                                                        type="text"
                                                        value={item}
                                                        onChange={(e) => handleTextChange(index, e.target.value)}
                                                    />
                                                    {textItems.length > 1 && (
                                                        <button onClick={() => removeTextItem(index)} title="Remove">
                                                            <i className="ri-close-line"></i>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-selection">
                                <p>Select a layout to see preview</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="smartart-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-ok"
                        onClick={handleInsert}
                        disabled={!selectedLayout}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
    const icons = {
        [SMARTART_CATEGORIES.ALL]: 'gallery-line',
        [SMARTART_CATEGORIES.LIST]: 'list-unordered',
        [SMARTART_CATEGORIES.PROCESS]: 'arrow-right-line',
        [SMARTART_CATEGORIES.CYCLE]: 'refresh-line',
        [SMARTART_CATEGORIES.HIERARCHY]: 'organization-chart',
        [SMARTART_CATEGORIES.RELATIONSHIP]: 'links-line',
        [SMARTART_CATEGORIES.MATRIX]: 'grid-line',
        [SMARTART_CATEGORIES.PYRAMID]: 'triangle-line',
        [SMARTART_CATEGORIES.PICTURE]: 'image-line',
        [SMARTART_CATEGORIES.OTHER]: 'more-line',
    };
    return icons[category] || 'file-line';
};

// Render layout thumbnail (Phase 2: All layouts supported)
const renderLayoutThumbnail = (layout) => {
    const colors = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5'];

    // Try advanced rendering first
    const advancedThumbnail = renderAdvancedThumbnail(layout, colors);
    if (advancedThumbnail) {
        return advancedThumbnail;
    }

    // Fallback to basic rendering for Phase 1 layouts
    switch (layout.layout) {
        case 'vertical-blocks':
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    {[0, 1, 2].map(i => (
                        <rect key={i} x="10" y={10 + i * 30} width="80" height="25" fill={colors[i]} />
                    ))}
                </svg>
            );

        case 'horizontal-flow':
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    {[0, 1, 2].map(i => (
                        <rect key={i} x={10 + i * 30} y="35" width="25" height="30" fill={colors[i]} />
                    ))}
                    <path d="M 35 50 L 40 50" stroke="#666" strokeWidth="2" markerEnd="url(#arrow)" />
                    <path d="M 65 50 L 70 50" stroke="#666" strokeWidth="2" markerEnd="url(#arrow)" />
                </svg>
            );

        case 'basic-cycle':
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    {[0, 1, 2, 3].map(i => {
                        const angle = (i * 90 - 45) * Math.PI / 180;
                        const x = 50 + 30 * Math.cos(angle);
                        const y = 50 + 30 * Math.sin(angle);
                        return <rect key={i} x={x - 10} y={y - 10} width="20" height="20" fill={colors[i]} />;
                    })}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="#666" strokeWidth="2" />
                </svg>
            );

        case 'org-chart':
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    <rect x="35" y="10" width="30" height="15" fill={colors[0]} />
                    <rect x="10" y="40" width="25" height="15" fill={colors[1]} />
                    <rect x="40" y="40" width="25" height="15" fill={colors[2]} />
                    <rect x="70" y="40" width="25" height="15" fill={colors[3]} />
                    <path d="M 50 25 L 50 35 M 50 35 L 22 35 L 22 40 M 50 35 L 52 35 L 52 40 M 50 35 L 82 35 L 82 40" stroke="#666" strokeWidth="1.5" />
                </svg>
            );

        case 'venn':
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    <circle cx="40" cy="50" r="25" fill={colors[0]} opacity="0.6" />
                    <circle cx="60" cy="50" r="25" fill={colors[1]} opacity="0.6" />
                </svg>
            );

        case '2x2-matrix':
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    <rect x="10" y="10" width="38" height="38" fill={colors[0]} />
                    <rect x="52" y="10" width="38" height="38" fill={colors[1]} />
                    <rect x="10" y="52" width="38" height="38" fill={colors[2]} />
                    <rect x="52" y="52" width="38" height="38" fill={colors[3]} />
                </svg>
            );

        case 'basic-pyramid':
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    <polygon points="50,20 20,90 80,90" fill={colors[0]} opacity="0.3" stroke={colors[0]} strokeWidth="2" />
                    <polygon points="35,55 65,55 65,90 35,90" fill={colors[1]} opacity="0.5" />
                    <polygon points="42,72 58,72 58,90 42,90" fill={colors[2]} opacity="0.7" />
                </svg>
            );

        default:
            return (
                <svg viewBox="0 0 100 100" className="thumbnail-svg">
                    <rect x="20" y="20" width="60" height="60" fill={colors[0]} opacity="0.5" />
                </svg>
            );
    }
};

// Render layout preview with actual text
const renderLayoutPreview = (layout, textItems, colorScheme) => {
    const colors = colorScheme.colors;

    return (
        <div className="preview-svg-container">
            <svg viewBox="0 0 400 300" className="preview-svg">
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#666" />
                    </marker>
                </defs>
                {renderLayoutShapes(layout, textItems, colors)}
            </svg>
        </div>
    );
};

// Render actual shapes based on layout type
const renderLayoutShapes = (layout, textItems, colors) => {
    const shapes = [];

    switch (layout.layout) {
        // LIST LAYOUTS
        case 'vertical-blocks':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x="50" y={50 + i * 80} width="300" height="60" fill={colors[i % colors.length]} rx="5" />
                        <text x="200" y={80 + i * 80} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'vertical-list':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <circle cx="80" cy={80 + i * 60} r="10" fill={colors[i % colors.length]} />
                        <text x="110" y={85 + i * 60} fill="#333" fontSize="16" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'horizontal-list':
            const hListSpacing = 350 / textItems.length;
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <circle cx={50 + i * hListSpacing} cy="150" r="10" fill={colors[i % colors.length]} />
                        <text x={50 + i * hListSpacing} y="180" textAnchor="middle" fill="#333" fontSize="14" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'circle-list':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <circle cx="80" cy={60 + i * 70} r="25" fill={colors[i % colors.length]} />
                        <text x="120" y={65 + i * 70} fill="#333" fontSize="16" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'hexagon-list':
            textItems.forEach((text, i) => {
                const y = 60 + i * 70;
                shapes.push(
                    <g key={i}>
                        <polygon points={`60,${y} 75,${y - 20} 105,${y - 20} 120,${y} 105,${y + 20} 75,${y + 20}`} fill={colors[i % colors.length]} />
                        <text x="140" y={y + 5} fill="#333" fontSize="16" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'picture-list':
        case 'vertical-picture':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x="50" y={50 + i * 80} width="60" height="60" fill={colors[i % colors.length]} rx="5" opacity="0.6" />
                        <rect x="120" y={50 + i * 80} width="230" height="60" fill={colors[i % colors.length]} rx="5" />
                        <text x="235" y={85 + i * 80} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'stacked':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x={50 + i * 20} y={50 + i * 60} width="250" height="50" fill={colors[i % colors.length]} rx="5" />
                        <text x={175 + i * 20} y={80 + i * 60} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'grouped':
            shapes.push(
                <g key="head">
                    <rect x="50" y="30" width="300" height="40" fill={colors[0]} rx="5" />
                    <text x="200" y="55" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{textItems[0] || 'Group'}</text>
                </g>
            );
            const grpSpacing = 280 / (textItems.length - 1 || 1);
            for (let i = 1; i < textItems.length; i++) {
                shapes.push(
                    <g key={i}>
                        <rect x={60 + (i - 1) * grpSpacing} y="80" width={Math.min(grpSpacing - 10, 100)} height="100" fill={colors[i % colors.length]} rx="5" opacity="0.8" />
                        <text x={60 + (i - 1) * grpSpacing + Math.min(grpSpacing - 10, 100) / 2} y="130" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{textItems[i]}</text>
                    </g>
                );
            }
            break;

        // PROCESS LAYOUTS
        case 'horizontal-flow':
        case 'process-arrows':
        case 'accent-flow':
            const spacing = 350 / textItems.length;
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x={30 + i * spacing} y="120" width={spacing - 15} height="60" fill={colors[i % colors.length]} rx="5" />
                        <text x={30 + i * spacing + (spacing - 15) / 2} y="155" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                        {i < textItems.length - 1 && (
                            <path d={`M ${30 + (i + 1) * spacing - 15} 150 L ${30 + (i + 1) * spacing} 150`} stroke="#666" strokeWidth="3" markerEnd="url(#arrow)" />
                        )}
                    </g>
                );
            });
            break;

        case 'vertical-flow':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x="125" y={30 + i * 70} width="150" height="50" fill={colors[i % colors.length]} rx="5" />
                        <text x="200" y={60 + i * 70} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                        {i < textItems.length - 1 && (
                            <path d={`M 200 ${80 + i * 70} L 200 ${100 + i * 70}`} stroke="#666" strokeWidth="3" markerEnd="url(#arrow)" />
                        )}
                    </g>
                );
            });
            break;

        case 'chevron-flow':
            const chevSpacing = 350 / textItems.length;
            textItems.forEach((text, i) => {
                const x = 30 + i * chevSpacing;
                const path = `M ${x} 120 L ${x + chevSpacing - 10} 120 L ${x + chevSpacing + 5} 150 L ${x + chevSpacing - 10} 180 L ${x} 180 L ${x + 15} 150 Z`;
                shapes.push(
                    <g key={i}>
                        <path d={path} fill={colors[i % colors.length]} />
                        <text x={x + chevSpacing / 2} y="155" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'arrow-flow':
            const arrSpacing = 350 / textItems.length;
            textItems.forEach((text, i) => {
                const x = 30 + i * arrSpacing;
                const path = `M ${x} 130 L ${x + arrSpacing - 20} 130 L ${x + arrSpacing - 20} 120 L ${x + arrSpacing} 150 L ${x + arrSpacing - 20} 180 L ${x + arrSpacing - 20} 170 L ${x} 170 Z`;
                shapes.push(
                    <g key={i}>
                        <path d={path} fill={colors[i % colors.length]} />
                        <text x={x + arrSpacing / 2 - 10} y="155" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'circular':
        case 'circle-process':
            shapes.push(<path key="circle" d="M 320 150 A 120 120 0 1 1 319 150" fill="none" stroke="#e0e0e0" strokeWidth="40" strokeDasharray="10 5" />);
            textItems.forEach((text, i) => {
                const angle = (i * 360 / textItems.length) * Math.PI / 180;
                const x = 200 + 120 * Math.cos(angle);
                const y = 150 + 120 * Math.sin(angle);
                shapes.push(
                    <g key={i}>
                        <circle cx={x} cy={y} r="35" fill={colors[i % colors.length]} />
                        <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'loop':
        case 'repeated-process':
            const loopSpacing = 280 / textItems.length;
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x={50 + i * loopSpacing} y="120" width={loopSpacing - 10} height="60" fill={colors[i % colors.length]} rx="5" />
                        <text x={50 + i * loopSpacing + (loopSpacing - 10) / 2} y="155" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                        {i < textItems.length - 1 && (
                            <path d={`M ${50 + (i + 1) * loopSpacing - 10} 150 L ${50 + (i + 1) * loopSpacing} 150`} stroke="#666" strokeWidth="3" markerEnd="url(#arrow)" />
                        )}
                    </g>
                );
            });
            shapes.push(<path key="return" d="M 330 150 Q 360 80 200 80 Q 40 80 50 120" fill="none" stroke="#666" strokeWidth="2" markerEnd="url(#arrow)" />);
            break;

        case 'step-up':
        case 'step-up-process':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x={50 + i * 60} y={200 - i * 40} width="50" height="40" fill={colors[i % colors.length]} rx="3" />
                        <text x={75 + i * 60} y={225 - i * 40} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'step-down':
        case 'step-down-process':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x={50 + i * 60} y={50 + i * 40} width="50" height="40" fill={colors[i % colors.length]} rx="3" />
                        <text x={75 + i * 60} y={75 + i * 40} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'upward-arrow':
            shapes.push(<path key="base" d="M 200 280 L 200 50 L 150 50 L 200 10 L 250 50 L 200 50" fill={colors[0]} opacity="0.3" />);
            textItems.forEach((text, i) => {
                const y = 250 - i * 60;
                shapes.push(
                    <g key={i}>
                        <rect x="150" y={y} width="100" height="40" fill={colors[(i + 1) % colors.length]} rx="5" />
                        <text x="200" y={y + 25} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'org-chart':
        case 'picture-org-chart':
        case 'horizontal-org':
            // Top level
            shapes.push(
                <g key="top">
                    <rect x="150" y="30" width="100" height="50" fill={colors[0]} rx="5" />
                    <text x="200" y="60" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{textItems[0] || 'CEO'}</text>
                </g>
            );

            // Second level
            const childCount = Math.min(textItems.length - 1, 3);
            const childSpacing = 300 / (childCount + 1); // Fixed spacing calculation
            for (let i = 0; i < childCount; i++) {
                shapes.push(
                    <g key={`child-${i}`}>
                        <rect x={50 + (i + 1) * childSpacing - 40} y="130" width="80" height="40" fill={colors[(i + 1) % colors.length]} rx="5" />
                        <text x={50 + (i + 1) * childSpacing} y="155" textAnchor="middle" fill="white" fontSize="12">{textItems[i + 1] || `Manager ${i + 1}`}</text>
                        <path d={`M 200 80 L 200 110 L ${50 + (i + 1) * childSpacing} 110 L ${50 + (i + 1) * childSpacing} 130`} stroke="#666" strokeWidth="2" fill="none" />
                    </g>
                );
            }
            break;

        case 'vertical-hierarchy':
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x="125" y={30 + i * 70} width="150" height="50" fill={colors[i % colors.length]} rx="5" />
                        <text x="200" y={60 + i * 70} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                        {i < textItems.length - 1 && (
                            <path d={`M 200 ${80 + i * 70} L 200 ${100 + i * 70}`} stroke="#666" strokeWidth="3" markerEnd="url(#arrow)" />
                        )}
                    </g>
                );
            });
            break;

        // RELATIONSHIP LAYOUTS
        case 'venn':
        case 'basic-venn':
            shapes.push(
                <g key="venn">
                    <circle cx="150" cy="150" r="80" fill={colors[0]} opacity="0.6" />
                    <text x="120" y="150" textAnchor="middle" fill="white" fontWeight="bold">{textItems[0] || 'A'}</text>
                    <circle cx="250" cy="150" r="80" fill={colors[1]} opacity="0.6" />
                    <text x="280" y="150" textAnchor="middle" fill="white" fontWeight="bold">{textItems[1] || 'B'}</text>
                </g>
            );
            break;

        case 'radial-venn':
        case 'radial-list':
            shapes.push(
                <g key="center">
                    <circle cx="200" cy="150" r="40" fill={colors[0]} />
                    <text x="200" y="155" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">Center</text>
                </g>
            );
            const radialCount = Math.min(textItems.length - 1, 6);
            for (let i = 0; i < radialCount; i++) {
                const angle = (i * 360 / radialCount) * Math.PI / 180;
                const x = 200 + 100 * Math.cos(angle);
                const y = 150 + 100 * Math.sin(angle);
                shapes.push(
                    <g key={i}>
                        <circle cx={x} cy={y} r="35" fill={colors[(i + 1) % colors.length]} opacity="0.8" />
                        <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="12">{textItems[i + 1]}</text>
                    </g>
                );
            }
            break;

        case 'cycle-matrix':
        case '2x2-matrix':
        case 'grid-matrix':
            shapes.push(
                <g key="matrix">
                    <rect x="50" y="50" width="140" height="90" fill={colors[0]} rx="5" />
                    <text x="120" y="100" textAnchor="middle" fill="white" fontWeight="bold">{textItems[0]}</text>

                    <rect x="210" y="50" width="140" height="90" fill={colors[1]} rx="5" />
                    <text x="280" y="100" textAnchor="middle" fill="white" fontWeight="bold">{textItems[1]}</text>

                    <rect x="50" y="160" width="140" height="90" fill={colors[2]} rx="5" />
                    <text x="120" y="210" textAnchor="middle" fill="white" fontWeight="bold">{textItems[2]}</text>

                    <rect x="210" y="160" width="140" height="90" fill={colors[3]} rx="5" />
                    <text x="280" y="210" textAnchor="middle" fill="white" fontWeight="bold">{textItems[3]}</text>
                </g>
            );
            break;

        case 'basic-pyramid':
        case 'segmented-pyramid':
            shapes.push(<polygon key="bg" points="200,20 100,280 300,280" fill={colors[0]} opacity="0.2" />);
            textItems.forEach((text, i) => {
                const y = 80 + i * 60;
                const w = 60 + i * 60;
                const x = 200 - w / 2;
                shapes.push(
                    <g key={i}>
                        <rect x={x} y={y} width={w} height="40" fill={colors[i % colors.length]} rx="5" />
                        <text x="200" y={y + 25} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'inverted-pyramid':
            textItems.forEach((text, i) => {
                const y = 50 + i * 60;
                const w = 240 - i * 60;
                const x = 200 - w / 2;
                shapes.push(
                    <g key={i}>
                        <rect x={x} y={y} width={w} height="40" fill={colors[i % colors.length]} rx="5" />
                        <text x="200" y={y + 25} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;

        case 'funnel':
            textItems.forEach((text, i) => {
                const y = 50 + i * 50;
                const w = 250 - i * 40;
                const x = 200 - w / 2;
                shapes.push(
                    <g key={i}>
                        <rect x={x} y={y} width={w} height="40" fill={colors[i % colors.length]} rx="5" />
                        <text x="200" y={y + 25} textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{text}</text>
                    </g>
                );
            });
            break;
            // Default simple layout
            textItems.forEach((text, i) => {
                shapes.push(
                    <g key={i}>
                        <rect x="100" y={50 + i * 60} width="200" height="45" fill={colors[i % colors.length]} rx="5" />
                        <text x="200" y={75 + i * 60} textAnchor="middle" fill="white" fontSize="14">{text}</text>
                    </g>
                );
            });
    }

    return shapes;
};

export default SmartArtEditor;
