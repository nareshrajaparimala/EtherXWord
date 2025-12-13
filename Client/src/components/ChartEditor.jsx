// Chart Editor Component
import React, { useState } from 'react';
import './ChartEditor.css'; // Optimized chart styles
import { CHART_CATEGORIES, CHART_TEMPLATES } from '../utils/ChartTemplates';
import { renderChartThumbnail } from './ChartRendering';

const ChartEditor = ({ isOpen, onClose, onInsert }) => {
    // Default to Column category as it's the first one
    const [selectedCategory, setSelectedCategory] = useState(CHART_CATEGORIES.COLUMN);
    const [selectedChart, setSelectedChart] = useState(null);

    // Derived state
    const filteredCharts = CHART_TEMPLATES.filter(c => c.category === selectedCategory);

    // Auto-select first chart in category if none selected or if switching categories
    // (Effect logic simplified directly into render or handler)

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setSelectedChart(null); // Reset selection
    };

    const handleChartSelect = (chart) => {
        setSelectedChart(chart);
    };

    const handleInsert = () => {
        if (selectedChart) {
            onInsert({
                chart: selectedChart,
                // In real implementation, we'd might initialize default data here
                data: null
            });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="smartart-overlay">
            <div className="smartart-dialog">
                <div className="smartart-header">
                    <h3>Insert Chart</h3>
                    <button className="smartart-close-btn" onClick={onClose}>×</button>
                </div>

                <div className="smartart-body">
                    {/* Left Panel - Categories */}
                    <div className="smartart-categories">
                        <div className="category-header">
                            {/* <i className="ri-bar-chart-line"></i> */}
                            <span>Recent</span> {/* Mimicking Word's "Recent" or just skipping "All" for charts usually */}
                        </div>
                        {Object.values(CHART_CATEGORIES).map(category => (
                            <div
                                key={category}
                                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => handleCategorySelect(category)}
                            >
                                <i className={`ri-${getCategoryIcon(category)}`}></i>
                                <span>{category}</span>
                            </div>
                        ))}
                    </div>

                    {/* Middle Panel - Layout Grid */}
                    <div className="smartart-layouts" style={{ flex: 2 }}>
                        {/* <div className="category-title">{selectedCategory}</div> */}
                        <div className="layouts-grid">
                            {filteredCharts.map(chart => (
                                <div
                                    key={chart.id}
                                    className={`layout-item ${selectedChart?.id === chart.id ? 'selected' : ''}`}
                                    onClick={() => handleChartSelect(chart)}
                                    title={chart.description}
                                >
                                    <div className="layout-thumbnail">
                                        {renderChartThumbnail(chart, null)}
                                    </div>
                                    <div className="layout-name">{chart.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel - Preview & Description */}
                    <div className="smartart-preview">
                        {selectedChart ? (
                            <div className="preview-content">
                                <div className="preview-area">
                                    {/* Large Preview */}
                                    <div className="preview-svg-container">
                                        {renderChartThumbnail(selectedChart, null)}
                                    </div>
                                </div>
                                <div className="layout-description">
                                    <h4>{selectedChart.name}</h4>
                                    <p>{selectedChart.description}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="no-selection">
                                <p>Select a chart type to preview</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="smartart-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-ok"
                        onClick={handleInsert}
                        disabled={!selectedChart}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper for icons based on category
const getCategoryIcon = (category) => {
    switch (category) {
        case CHART_CATEGORIES.COLUMN: return 'bar-chart-line'; // Vertical bars
        case CHART_CATEGORIES.BAR: return 'bar-chart-horizontal-line';
        case CHART_CATEGORIES.LINE: return 'line-chart-line';
        case CHART_CATEGORIES.PIE: return 'pie-chart-line';
        case CHART_CATEGORIES.AREA: return 'artboard-line'; // Area icon approximation
        case CHART_CATEGORIES.SCATTER: return 'bubble-chart-line'; // Scatter often looks like bubbles/dots
        case CHART_CATEGORIES.BUBBLE: return 'checkbox-blank-circle-line';
        case CHART_CATEGORIES.STOCK: return 'stock-line';
        case CHART_CATEGORIES.SURFACE: return 'map-2-line';
        case CHART_CATEGORIES.RADAR: return 'radar-line';
        case CHART_CATEGORIES.COMBO: return 'stack-line';
        default: return 'bar-chart-line';
    }
};

export default ChartEditor;
