import React from 'react';

// Common helper to get colors
const getColors = (providedColors) => {
    return providedColors || ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];
};

// Main function to render chart thumbnail/preview
export const renderChartThumbnail = (chart, colors) => {
    const c = getColors(colors);
    const type = chart.defaults.type;
    const subtype = chart.id;

    // SVG ViewBox is standard 100x100 for thumbnails typically, but we might want flexibility
    // Using a 100x100 coord system for simplicity in SVGs

    switch (type) {
        // 1. COLUMN CHARTS
        case 'bar':
        case 'bar3d':
            if (chart.defaults.orientation === 'horizontal') {
                // BAR CHART
                if (chart.defaults.stacked === 'percent') {
                    // 100% Stacked Bar
                    return (
                        <svg viewBox="0 0 100 100" className="chart-thumbnail">
                            <rect x="10" y="10" width="30" height="15" fill={c[0]} />
                            <rect x="40" y="10" width="30" height="15" fill={c[1]} />
                            <rect x="70" y="10" width="20" height="15" fill={c[2]} />

                            <rect x="10" y="40" width="20" height="15" fill={c[0]} />
                            <rect x="30" y="40" width="50" height="15" fill={c[1]} />
                            <rect x="80" y="40" width="10" height="15" fill={c[2]} />

                            <rect x="10" y="70" width="40" height="15" fill={c[0]} />
                            <rect x="50" y="70" width="20" height="15" fill={c[1]} />
                            <rect x="70" y="70" width="20" height="15" fill={c[2]} />

                            <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                            <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                        </svg>
                    );
                } else if (chart.defaults.stacked) {
                    // Stacked Bar
                    return (
                        <svg viewBox="0 0 100 100" className="chart-thumbnail">
                            <rect x="10" y="10" width="30" height="15" fill={c[0]} />
                            <rect x="40" y="10" width="20" height="15" fill={c[1]} />

                            <rect x="10" y="40" width="50" height="15" fill={c[0]} />
                            <rect x="60" y="40" width="15" height="15" fill={c[1]} />

                            <rect x="10" y="70" width="20" height="15" fill={c[0]} />
                            <rect x="30" y="70" width="30" height="15" fill={c[1]} />

                            <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                            <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                        </svg>
                    );
                } else {
                    // Clustered Bar
                    return (
                        <svg viewBox="0 0 100 100" className="chart-thumbnail">
                            <rect x="10" y="10" width="50" height="10" fill={c[0]} />
                            <rect x="10" y="22" width="30" height="10" fill={c[1]} />

                            <rect x="10" y="40" width="70" height="10" fill={c[0]} />
                            <rect x="10" y="52" width="40" height="10" fill={c[1]} />

                            <rect x="10" y="70" width="20" height="10" fill={c[0]} />
                            <rect x="10" y="82" width="60" height="10" fill={c[1]} />

                            <line x1="10" y1="5" x2="10" y2="95" stroke="#666" strokeWidth="1" />
                            <line x1="10" y1="95" x2="95" y2="95" stroke="#666" strokeWidth="1" />
                        </svg>
                    );
                }
            } else {
                // COLUMN CHART (Vertical)
                if (chart.defaults.stacked === 'percent') {
                    // 100% Stacked Column
                    return (
                        <svg viewBox="0 0 100 100" className="chart-thumbnail">
                            <rect x="15" y="60" width="15" height="30" fill={c[0]} />
                            <rect x="15" y="30" width="15" height="30" fill={c[1]} />
                            <rect x="15" y="10" width="15" height="20" fill={c[2]} />

                            <rect x="42" y="50" width="15" height="40" fill={c[0]} />
                            <rect x="42" y="20" width="15" height="30" fill={c[1]} />
                            <rect x="42" y="10" width="15" height="10" fill={c[2]} />

                            <rect x="69" y="40" width="15" height="50" fill={c[0]} />
                            <rect x="69" y="25" width="15" height="15" fill={c[1]} />
                            <rect x="69" y="10" width="15" height="15" fill={c[2]} />

                            <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                            <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                        </svg>
                    );
                } else if (chart.defaults.stacked) {
                    // Stacked Column
                    return (
                        <svg viewBox="0 0 100 100" className="chart-thumbnail">
                            <rect x="15" y="60" width="15" height="30" fill={c[0]} />
                            <rect x="15" y="40" width="15" height="20" fill={c[1]} />

                            <rect x="42" y="50" width="15" height="40" fill={c[0]} />
                            <rect x="42" y="35" width="15" height="15" fill={c[1]} />

                            <rect x="69" y="70" width="15" height="20" fill={c[0]} />
                            <rect x="69" y="40" width="15" height="30" fill={c[1]} />

                            <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                            <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                        </svg>
                    );
                } else {
                    // Clustered Column
                    return (
                        <svg viewBox="0 0 100 100" className="chart-thumbnail">
                            <rect x="15" y="40" width="10" height="50" fill={c[0]} />
                            <rect x="27" y="60" width="10" height="30" fill={c[1]} />

                            <rect x="45" y="20" width="10" height="70" fill={c[0]} />
                            <rect x="57" y="50" width="10" height="40" fill={c[1]} />

                            <rect x="75" y="55" width="10" height="35" fill={c[0]} />
                            <rect x="87" y="30" width="10" height="60" fill={c[1]} />

                            <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                            <line x1="10" y1="90" x2="95" y2="90" stroke="#666" strokeWidth="1" />
                        </svg>
                    );
                }
            }

        // 2. LINE CHARTS
        case 'line':
        case 'line3d':
            const markers = chart.defaults.markers;
            const stacked = chart.defaults.stacked;

            // Generate path strings
            let p1, p2, p3;
            if (stacked === 'percent') {
                // 100% logic: lines fill up to top roughly
                // Simulating for thumbnail
                // Not implementing full path logic for thumbnail, just hardcoded lookalike
                return (
                    <svg viewBox="0 0 100 100" className="chart-thumbnail">
                        <polyline points="10,80 35,60 60,70 85,50" fill="none" stroke={c[0]} strokeWidth="2" />
                        <polyline points="10,60 35,30 60,50 85,20" fill="none" stroke={c[1]} strokeWidth="2" />
                        <polyline points="10,40 35,10 60,20 85,10" fill="none" stroke={c[2]} strokeWidth="2" />

                        {markers && (
                            <g>
                                <circle cx="10" cy="80" r="2" fill={c[0]} /> <circle cx="35" cy="60" r="2" fill={c[0]} />
                                <circle cx="10" cy="60" r="2" fill={c[1]} /> <circle cx="35" cy="30" r="2" fill={c[1]} />
                                {/* ... more markers */}
                            </g>
                        )}
                        <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                        <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                    </svg>
                );
            } else {
                return (
                    <svg viewBox="0 0 100 100" className="chart-thumbnail">
                        <polyline points="10,80 35,40 60,60 85,30" fill="none" stroke={c[0]} strokeWidth="2" />
                        <polyline points="10,70 35,60 60,80 85,50" fill="none" stroke={c[1]} strokeWidth="2" />

                        {markers && (
                            <g>
                                <circle cx="10" cy="80" r="2" fill={c[0]} /> <circle cx="35" cy="40" r="2" fill={c[0]} />
                                <circle cx="60" cy="60" r="2" fill={c[0]} /> <circle cx="85" cy="30" r="2" fill={c[0]} />

                                <circle cx="10" cy="70" r="2" fill={c[1]} /> <circle cx="35" cy="60" r="2" fill={c[1]} />
                            </g>
                        )}
                        <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                        <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                    </svg>
                );
            }

        // 3. PIE CHARTS
        case 'pie':
        case 'pie3d':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    {/* Simple Pie Simulation with paths */}
                    <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill={c[0]} />
                    <path d="M50,50 L90,50 A40,40 0 0,1 50,90 Z" fill={c[1]} />
                    <path d="M50,50 L50,90 A40,40 0 0,1 10,50 Z" fill={c[2]} />
                    <path d="M50,50 L10,50 A40,40 0 0,1 50,10 Z" fill={c[3]} />
                </svg>
            );
        case 'doughnut':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <path d="M50,50 L50,10 A40,40 0 0,1 90,50 Z" fill={c[0]} />
                    <path d="M50,50 L90,50 A40,40 0 0,1 50,90 Z" fill={c[1]} />
                    <path d="M50,50 L50,90 A40,40 0 0,1 10,50 Z" fill={c[2]} />
                    <path d="M50,50 L10,50 A40,40 0 0,1 50,10 Z" fill={c[3]} />
                    {/* Center hole */}
                    <circle cx="50" cy="50" r="20" fill="white" />
                </svg>
            );
        case 'pieOfPie':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <circle cx="40" cy="50" r="30" fill="#ddd" />
                    <path d="M40,50 L40,20 A30,30 0 0,1 70,50 Z" fill={c[0]} />
                    <path d="M40,50 L70,50 A30,30 0 0,1 40,80 Z" fill={c[1]} />
                    {/* Smaller pie */}
                    <line x1="70" y1="50" x2="75" y2="40" stroke="#666" />
                    <line x1="70" y1="50" x2="75" y2="60" stroke="#666" />
                    <circle cx="85" cy="50" r="15" fill="#eee" />
                    <path d="M85,50 L85,35 A15,15 0 0,1 100,50 Z" fill={c[2]} />
                </svg>
            );
        case 'barOfPie':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <circle cx="40" cy="50" r="30" fill="#ddd" />
                    <path d="M40,50 L40,20 A30,30 0 0,1 70,50 Z" fill={c[0]} />

                    <line x1="70" y1="35" x2="80" y2="20" stroke="#666" />
                    <line x1="70" y1="65" x2="80" y2="80" stroke="#666" />

                    <rect x="80" y="20" width="15" height="20" fill={c[1]} />
                    <rect x="80" y="40" width="15" height="20" fill={c[2]} />
                    <rect x="80" y="60" width="15" height="20" fill={c[3]} />
                </svg>
            );

        // 4. AREA CHARTS
        case 'area':
        case 'area3d':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <polygon points="10,90 10,60 35,40 60,50 85,20 85,90" fill={c[0]} opacity="0.7" />
                    <polygon points="10,90 10,80 35,70 60,60 85,50 85,90" fill={c[1]} opacity="0.7" />
                    <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                </svg>
            );

        // 5. XY SCATTER
        case 'scatter':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <circle cx="20" cy="80" r="2" fill={c[0]} />
                    <circle cx="30" cy="60" r="2" fill={c[0]} />
                    <circle cx="50" cy="50" r="2" fill={c[0]} />
                    <circle cx="70" cy="30" r="2" fill={c[0]} />
                    <circle cx="80" cy="20" r="2" fill={c[0]} />

                    <circle cx="25" cy="70" r="2" fill={c[1]} />
                    <circle cx="45" cy="65" r="2" fill={c[1]} />
                    <circle cx="65" cy="40" r="2" fill={c[1]} />

                    <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                </svg>
            );

        // 6. BUBBLE
        case 'bubble':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <circle cx="30" cy="70" r="5" fill={c[0]} opacity="0.6" stroke={c[0]} />
                    <circle cx="50" cy="50" r="10" fill={c[1]} opacity="0.6" stroke={c[1]} />
                    <circle cx="80" cy="30" r="8" fill={c[2]} opacity="0.6" stroke={c[2]} />

                    <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                </svg>
            );

        // 7. STOCK
        case 'stock':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    {/* High Low Close bars */}
                    <line x1="20" y1="20" x2="20" y2="70" stroke="#333" strokeWidth="1" />
                    <line x1="15" y1="20" x2="25" y2="20" stroke="#333" strokeWidth="1" /> {/* High */}
                    <line x1="15" y1="70" x2="25" y2="70" stroke="#333" strokeWidth="1" /> {/* Low */}
                    <rect x="18" y="30" width="4" height="30" fill={c[0]} />

                    <line x1="50" y1="30" x2="50" y2="80" stroke="#333" strokeWidth="1" />
                    <line x1="45" y1="30" x2="55" y2="30" stroke="#333" strokeWidth="1" />
                    <line x1="45" y1="80" x2="55" y2="80" stroke="#333" strokeWidth="1" />
                    <rect x="48" y="40" width="4" height="30" fill={c[1]} />

                    <line x1="80" y1="10" x2="80" y2="60" stroke="#333" strokeWidth="1" />
                    <line x1="75" y1="10" x2="85" y2="10" stroke="#333" strokeWidth="1" />
                    <line x1="75" y1="60" x2="85" y2="60" stroke="#333" strokeWidth="1" />
                    <rect x="78" y="20" width="4" height="30" fill={c[0]} />

                    <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                </svg>
            );

        // 8. SURFACE
        case 'surface':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <path d="M10,80 L40,70 L70,80 L90,60" fill="none" stroke={c[0]} />
                    <path d="M10,60 L40,50 L70,60 L90,40" fill="none" stroke={c[1]} />
                    <path d="M10,40 L40,30 L70,40 L90,20" fill="none" stroke={c[2]} />

                    {/* Connectors for simple wireframe look */}
                    <line x1="10" y1="80" x2="10" y2="40" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="40" y1="70" x2="40" y2="30" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="70" y1="80" x2="70" y2="40" stroke="#ccc" strokeWidth="0.5" />
                    <line x1="90" y1="60" x2="90" y2="20" stroke="#ccc" strokeWidth="0.5" />
                </svg>
            );

        // 9. RADAR
        case 'radar':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="#ccc" />
                    <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="#ccc" />

                    <polygon points="50,15 80,50 50,85 20,50" fill={chart.defaults.filled ? c[0] : 'none'} stroke={c[0]} opacity={chart.defaults.filled ? 0.5 : 1} />
                </svg>
            );

        // 10. COMBO
        case 'combo':
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    {/* Column + Line */}
                    <rect x="15" y="40" width="10" height="50" fill={c[0]} />
                    <rect x="45" y="30" width="10" height="60" fill={c[0]} />
                    <rect x="75" y="50" width="10" height="40" fill={c[0]} />

                    <polyline points="20,70 50,30 80,60" fill="none" stroke={c[1]} strokeWidth="2" />
                    {/* Markers */}
                    <circle cx="20" cy="70" r="2" fill={c[1]} />
                    <circle cx="50" cy="30" r="2" fill={c[1]} />
                    <circle cx="80" cy="60" r="2" fill={c[1]} />

                    <line x1="10" y1="10" x2="10" y2="90" stroke="#666" strokeWidth="1" />
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#666" strokeWidth="1" />
                </svg>
            );

        default:
            return (
                <svg viewBox="0 0 100 100" className="chart-thumbnail">
                    <text x="50" y="50" textAnchor="middle" fontSize="10">Chart</text>
                </svg>
            );
    }
};
