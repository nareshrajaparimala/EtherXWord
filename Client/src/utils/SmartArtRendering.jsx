// SmartArt Layout Rendering Utilities - Phase 2
// Comprehensive rendering for all 71+ SmartArt layouts

export const renderAdvancedThumbnail = (layout, colors) => {
    const c = colors || ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5'];
    const layoutType = layout.layout;

    // LIST LAYOUTS
    if (layout.category === 'List') {
        switch (layoutType) {
            case 'vertical-blocks':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x="10" y={10 + i * 30} width="80" height="25" fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'vertical-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => (
                            <g key={i}>
                                <circle cx="15" cy={15 + i * 22} r="3" fill={c[i % c.length]} />
                                <rect x="22" y={10 + i * 22} width="70" height="10" fill={c[i % c.length]} opacity="0.3" />
                            </g>
                        ))}
                    </svg>
                );

            case 'horizontal-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <circle cx={20 + i * 30} cy="45" r="3" fill={c[i % c.length]} />
                                <rect x={10 + i * 30} y="50" width="18" height="35" fill={c[i % c.length]} opacity="0.3" />
                            </g>
                        ))}
                    </svg>
                );

            case 'picture-list':
            case 'vertical-picture':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <rect x="10" y={10 + i * 30} width="25" height="25" fill={c[i % c.length]} opacity="0.5" />
                                <rect x="40" y={15 + i * 30} width="50" height="5" fill={c[i % c.length]} />
                                <rect x="40" y={22 + i * 30} width="40" height="3" fill={c[i % c.length]} opacity="0.5" />
                            </g>
                        ))}
                    </svg>
                );

            case 'stacked':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={10 + i * 5} y={20 + i * 25} width="70" height="20" fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'vertical-boxes':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x="25" y={10 + i * 30} width="25" height="25" fill={c[i % c.length]} stroke="#fff" strokeWidth="2" />
                        ))}
                    </svg>
                );

            case 'horizontal-boxes':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={10 + i * 30} y="30" width="25" height="25" fill={c[i % c.length]} stroke="#fff" strokeWidth="2" />
                        ))}
                    </svg>
                );

            case 'grouped':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="10" y="10" width="80" height="15" fill={c[0]} />
                        <rect x="15" y="30" width="35" height="12" fill={c[1]} opacity="0.7" />
                        <rect x="52" y="30" width="35" height="12" fill={c[2]} opacity="0.7" />
                        <rect x="15" y="45" width="35" height="12" fill={c[3]} opacity="0.7" />
                    </svg>
                );

            case 'tabbed':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <path d={`M ${10 + i * 30} 20 L ${10 + i * 30} 10 L ${35 + i * 30} 10 L ${35 + i * 30} 20 Z`} fill={c[i % c.length]} />
                                <rect x={10 + i * 30} y="20" width="25" height="60" fill={c[i % c.length]} opacity="0.3" />
                            </g>
                        ))}
                    </svg>
                );

            case 'table':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1].map(row => [0, 1].map(col => (
                            <rect key={`${row}-${col}`} x={20 + col * 30} y={30 + row * 25} width="28" height="23"
                                fill={c[(row * 2 + col) % c.length]} stroke="#fff" strokeWidth="2" />
                        )))}
                    </svg>
                );

            case 'segmented':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <path key={i} d={`M ${10 + i * 28} 40 L ${35 + i * 28} 40 L ${38 + i * 28} 50 L ${35 + i * 28} 60 L ${10 + i * 28} 60 L ${13 + i * 28} 50 Z`}
                                fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'circle-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <circle cx="25" cy={25 + i * 25} r="10" fill={c[i % c.length]} />
                                <rect x="40" y={20 + i * 25} width="50" height="10" fill={c[i % c.length]} opacity="0.3" />
                            </g>
                        ))}
                    </svg>
                );

            case 'hexagon-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <polygon key={i} points={`${15 + i * 28},35 ${20 + i * 28},30 ${30 + i * 28},30 ${35 + i * 28},35 ${30 + i * 28},40 ${20 + i * 28},40`}
                                fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            default:
                // Default list thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x="10" y={15 + i * 25} width="80" height="20" fill={c[i % c.length]} opacity="0.6" />
                        ))}
                    </svg>
                );
        }
    }

    // PROCESS LAYOUTS
    if (layout.category === 'Process') {
        switch (layoutType) {
            case 'horizontal-flow':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={10 + i * 30} y="35" width="25" height="30" fill={c[i % c.length]} />
                        ))}
                        <path d="M 35 50 L 40 50" stroke="#666" strokeWidth="2" />
                        <path d="M 65 50 L 70 50" stroke="#666" strokeWidth="2" />
                    </svg>
                );

            case 'chevron-flow':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <path key={i} d={`M ${5 + i * 30} 35 L ${30 + i * 30} 35 L ${35 + i * 30} 50 L ${30 + i * 30} 65 L ${5 + i * 30} 65 L ${10 + i * 30} 50 Z`}
                                fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'circular':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="50" cy="50" r="35" fill="none" stroke={c[0]} strokeWidth="8" strokeDasharray="55 10" />
                        <path d="M 85 50 L 90 45 L 90 55 Z" fill={c[0]} />
                    </svg>
                );

            case 'loop':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={20 + i * 25} y="40" width="20" height="20" fill={c[i % c.length]} />
                        ))}
                        <path d="M 75 50 Q 85 20 50 20 Q 15 20 25 50" fill="none" stroke={c[0]} strokeWidth="2" />
                    </svg>
                );

            case 'step-up':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => (
                            <rect key={i} x={15 + i * 20} y={70 - i * 18} width="18" height="15" fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'step-down':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => (
                            <rect key={i} x={15 + i * 20} y={15 + i * 18} width="18" height="15" fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'arrow-flow':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <path key={i} d={`M ${10 + i * 30} 45 L ${30 + i * 30} 45 L ${30 + i * 30} 40 L ${35 + i * 30} 50 L ${30 + i * 30} 60 L ${30 + i * 30} 55 L ${10 + i * 30} 55 Z`}
                                fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'vertical-flow':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <rect x="35" y={10 + i * 30} width="30" height="25" fill={c[i % c.length]} />
                                {i < 2 && <path d={`M 50 ${35 + i * 30} L 50 ${40 + i * 30}`} stroke="#666" strokeWidth="2" />}
                            </g>
                        ))}
                    </svg>
                );

            case 'alternating':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => (
                            <rect key={i} x={i % 2 === 0 ? 10 : 55} y={15 + i * 20} width="35" height="15" fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'upward-arrow':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <path d="M 30 80 L 30 30 L 20 30 L 50 10 L 80 30 L 70 30 L 70 80 Z" fill={c[0]} />
                        {[0, 1, 2].map(i => (
                            <rect key={i} x="35" y={60 - i * 20} width="30" height="15" fill={c[(i + 1) % c.length]} />
                        ))}
                    </svg>
                );

            default:
                // Default process thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <rect x={15 + i * 28} y="40" width="25" height="20" fill={c[i % c.length]} />
                                {i < 2 && <path d={`M ${40 + i * 28} 50 L ${43 + i * 28} 50`} stroke="#666" strokeWidth="2" />}
                            </g>
                        ))}
                    </svg>
                );
        }
    }

    // CYCLE LAYOUTS
    if (layout.category === 'Cycle') {
        switch (layoutType) {
            case 'basic-cycle':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => {
                            const angle = (i * 90 - 45) * Math.PI / 180;
                            const x = 50 + 30 * Math.cos(angle);
                            const y = 50 + 30 * Math.sin(angle);
                            return <rect key={i} x={x - 10} y={y - 10} width="20" height="20" fill={c[i % c.length]} />;
                        })}
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#666" strokeWidth="2" />
                    </svg>
                );

            case 'radial':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="50" cy="50" r="12" fill={c[0]} />
                        {[0, 1, 2, 3].map(i => {
                            const angle = (i * 90) * Math.PI / 180;
                            const x = 50 + 28 * Math.cos(angle);
                            const y = 50 + 28 * Math.sin(angle);
                            return <circle key={i} cx={x} cy={y} r="10" fill={c[(i + 1) % c.length]} />;
                        })}
                    </svg>
                );

            case 'multidirectional':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => {
                            const angle = (i * 90 - 45) * Math.PI / 180;
                            const x = 50 + 30 * Math.cos(angle);
                            const y = 50 + 30 * Math.sin(angle);
                            return (
                                <g key={i}>
                                    <rect x={x - 8} y={y - 8} width="16" height="16" fill={c[i % c.length]} />
                                    <path d={`M ${x} ${y} L 50 50`} stroke={c[i % c.length]} strokeWidth="2" />
                                </g>
                            );
                        })}
                    </svg>
                );

            case 'text-circular':
            case 'block-circular':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => {
                            const angle = (i * 90) * Math.PI / 180;
                            const x = 50 + 30 * Math.cos(angle);
                            const y = 50 + 30 * Math.sin(angle);
                            return <rect key={i} x={x - 10} y={y - 10} width="20" height="20" fill={c[i % c.length]} rx="3" />;
                        })}
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#999" strokeWidth="1" strokeDasharray="3 3" />
                    </svg>
                );

            case 'segmented-circular':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => {
                            const startAngle = i * 90;
                            const endAngle = (i + 1) * 90;
                            const start = polarToCartesian(50, 50, 35, endAngle);
                            const end = polarToCartesian(50, 50, 35, startAngle);
                            const largeArc = endAngle - startAngle <= 180 ? "0" : "1";
                            const d = `M 50 50 L ${start.x} ${start.y} A 35 35 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
                            return <path key={i} d={d} fill={c[i % c.length]} />;
                        })}
                    </svg>
                );

            case 'hexagon-circular':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3, 4, 5].map(i => {
                            const angle = (i * 60) * Math.PI / 180;
                            const x = 50 + 30 * Math.cos(angle);
                            const y = 50 + 30 * Math.sin(angle);
                            return (
                                <polygon key={i}
                                    points={`${x},${y - 8} ${x + 7},${y - 4} ${x + 7},${y + 4} ${x},${y + 8} ${x - 7},${y + 4} ${x - 7},${y - 4}`}
                                    fill={c[i % c.length]} />
                            );
                        })}
                    </svg>
                );

            default:
                // Default cycle thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => {
                            const angle = (i * 90) * Math.PI / 180;
                            const x = 50 + 30 * Math.cos(angle);
                            const y = 50 + 30 * Math.sin(angle);
                            return <circle key={i} cx={x} cy={y} r="8" fill={c[i % c.length]} />;
                        })}
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#999" strokeWidth="1" strokeDasharray="2 2" />
                    </svg>
                );
        }
    }

    // HIERARCHY LAYOUTS
    if (layout.category === 'Hierarchy') {
        switch (layoutType) {
            case 'org-chart':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="35" y="10" width="30" height="15" fill={c[0]} />
                        <rect x="10" y="40" width="25" height="15" fill={c[1]} />
                        <rect x="40" y="40" width="25" height="15" fill={c[2]} />
                        <rect x="70" y="40" width="25" height="15" fill={c[3]} />
                        <path d="M 50 25 L 50 35 M 50 35 L 22 35 L 22 40 M 50 35 L 52 35 L 52 40 M 50 35 L 82 35 L 82 40" stroke="#666" strokeWidth="1.5" />
                    </svg>
                );

            case 'picture-org-chart':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="50" cy="20" r="10" fill={c[0]} />
                        {[0, 1, 2].map(i => (
                            <circle key={i} cx={20 + i * 30} cy="60" r="8" fill={c[(i + 1) % c.length]} />
                        ))}
                        <path d="M 50 30 L 50 45 M 50 45 L 20 45 L 20 52 M 50 45 L 50 52 M 50 45 L 80 45 L 80 52" stroke="#666" strokeWidth="1.5" />
                    </svg>
                );

            case 'horizontal-org':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="10" y="40" width="20" height="20" fill={c[0]} />
                        {[0, 1, 2].map(i => (
                            <rect key={i} x="50" y={15 + i * 25} width="20" height="18" fill={c[(i + 1) % c.length]} />
                        ))}
                        <path d="M 30 50 L 45 50 M 45 50 L 45 24 L 50 24 M 45 50 L 45 49 L 50 49 M 45 50 L 45 74 L 50 74" stroke="#666" strokeWidth="1.5" />
                    </svg>
                );

            case 'table-hierarchy':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="20" y="10" width="60" height="15" fill={c[0]} />
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={22 + i * 19} y="30" width="18" height="60" fill={c[(i + 1) % c.length]} opacity="0.7" />
                        ))}
                    </svg>
                );

            case 'labeled-hierarchy':
            case 'hierarchy-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="10" y="15" width="80" height="12" fill={c[0]} />
                        <rect x="15" y="32" width="70" height="10" fill={c[1]} opacity="0.8" />
                        <rect x="20" y="47" width="60" height="10" fill={c[2]} opacity="0.6" />
                        <rect x="25" y="62" width="50" height="10" fill={c[3]} opacity="0.4" />
                    </svg>
                );

            case 'horizontal-hierarchy':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => (
                            <rect key={i} x={10 + i * 22} y="40" width="18" height="20" fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'vertical-hierarchy':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2, 3].map(i => (
                            <rect key={i} x="40" y={10 + i * 22} width="20" height="18" fill={c[i % c.length]} />
                        ))}
                    </svg>
                );

            case 'circle-hierarchy':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="50" cy="25" r="12" fill={c[0]} />
                        {[0, 1].map(i => (
                            <circle key={i} cx={30 + i * 40} cy="60" r="10" fill={c[(i + 1) % c.length]} />
                        ))}
                        <path d="M 50 37 L 50 50 M 50 50 L 30 50 L 30 50 M 50 50 L 70 50" stroke="#666" strokeWidth="1.5" />
                    </svg>
                );

            default:
                // Default hierarchy thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="35" y="10" width="30" height="15" fill={c[0]} />
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={15 + i * 25} y="40" width="20" height="15" fill={c[(i + 1) % c.length]} />
                        ))}
                        <path d="M 50 25 L 50 35 M 50 35 L 25 35 L 25 40 M 50 35 L 50 40 M 50 35 L 75 35 L 75 40" stroke="#666" strokeWidth="1.5" />
                    </svg>
                );
        }
    }

    // RELATIONSHIP LAYOUTS
    if (layout.category === 'Relationship') {
        switch (layoutType) {
            case 'venn':
            case 'basic-venn':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="40" cy="50" r="25" fill={c[0]} opacity="0.6" />
                        <circle cx="60" cy="50" r="25" fill={c[1]} opacity="0.6" />
                    </svg>
                );

            case 'stacked-venn':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="50" cy="35" r="20" fill={c[0]} opacity="0.5" />
                        <circle cx="40" cy="55" r="20" fill={c[1]} opacity="0.5" />
                        <circle cx="60" cy="55" r="20" fill={c[2]} opacity="0.5" />
                    </svg>
                );

            case 'radial-venn':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="50" cy="50" r="15" fill={c[0]} />
                        {[0, 1, 2, 3].map(i => {
                            const angle = (i * 90) * Math.PI / 180;
                            const x = 50 + 25 * Math.cos(angle);
                            const y = 50 + 25 * Math.sin(angle);
                            return <circle key={i} cx={x} cy={y} r="12" fill={c[(i + 1) % c.length]} opacity="0.6" />;
                        })}
                    </svg>
                );

            case 'target':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <circle key={i} cx="50" cy="50" r={40 - i * 13} fill={c[i % c.length]} opacity="0.6" />
                        ))}
                    </svg>
                );

            case 'radial-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="50" cy="50" r="12" fill={c[0]} />
                        {[0, 1, 2, 3].map(i => {
                            const angle = (i * 90) * Math.PI / 180;
                            const x = 50 + 30 * Math.cos(angle);
                            const y = 50 + 30 * Math.sin(angle);
                            return (
                                <g key={i}>
                                    <rect x={x - 10} y={y - 8} width="20" height="16" fill={c[(i + 1) % c.length]} />
                                    <line x1="50" y1="50" x2={x} y2={y} stroke="#999" strokeWidth="1" />
                                </g>
                            );
                        })}
                    </svg>
                );

            case 'cycle-matrix':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="10" y="10" width="38" height="38" fill={c[0]} opacity="0.5" />
                        <rect x="52" y="10" width="38" height="38" fill={c[1]} opacity="0.5" />
                        <rect x="10" y="52" width="38" height="38" fill={c[2]} opacity="0.5" />
                        <rect x="52" y="52" width="38" height="38" fill={c[3]} opacity="0.5" />
                        <path d="M 90 29 Q 100 50 90 71" fill="none" stroke={c[0]} strokeWidth="2" />
                    </svg>
                );

            case 'pyramid-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => {
                            const width = 80 - i * 25;
                            const x = 10 + i * 12.5;
                            return <rect key={i} x={x} y={20 + i * 25} width={width} height="20" fill={c[i % c.length]} />;
                        })}
                    </svg>
                );

            case 'basic-pyramid':
            case 'segmented-pyramid':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <polygon points="50,20 20,90 80,90" fill={c[0]} opacity="0.3" stroke={c[0]} strokeWidth="2" />
                        <polygon points="35,55 65,55 65,90 35,90" fill={c[1]} opacity="0.5" />
                        <polygon points="42,72 58,72 58,90 42,90" fill={c[2]} opacity="0.7" />
                    </svg>
                );

            case 'funnel':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <path d="M 20 20 L 80 20 L 65 50 L 50 80 L 35 50 Z" fill={c[0]} opacity="0.3" stroke={c[0]} strokeWidth="2" />
                        {[0, 1, 2].map(i => {
                            const y = 25 + i * 18;
                            const width = 60 - i * 15;
                            const x = 20 + i * 7.5;
                            return <rect key={i} x={x} y={y} width={width} height="12" fill={c[i % c.length]} />;
                        })}
                    </svg>
                );

            default:
                // Default relationship thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <circle cx="35" cy="50" r="20" fill={c[0]} opacity="0.5" />
                        <circle cx="65" cy="50" r="20" fill={c[1]} opacity="0.5" />
                    </svg>
                );
        }
    }

    // MATRIX LAYOUTS
    if (layout.category === 'Matrix') {
        switch (layoutType) {
            case '2x2-matrix':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="10" y="10" width="38" height="38" fill={c[0]} />
                        <rect x="52" y="10" width="38" height="38" fill={c[1]} />
                        <rect x="10" y="52" width="38" height="38" fill={c[2]} />
                        <rect x="52" y="52" width="38" height="38" fill={c[3]} />
                    </svg>
                );

            case 'grid-matrix':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(row => [0, 1, 2].map(col => (
                            <rect key={`${row}-${col}`} x={15 + col * 25} y={15 + row * 25} width="23" height="23"
                                fill={c[(row * 3 + col) % c.length]} stroke="#fff" strokeWidth="2" />
                        )))}
                    </svg>
                );

            case 'titled-matrix':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="10" y="10" width="80" height="12" fill={c[0]} />
                        {[0, 1].map(row => [0, 1].map(col => (
                            <rect key={`${row}-${col}`} x={15 + col * 35} y={27 + row * 30} width="33" height="28"
                                fill={c[(row * 2 + col + 1) % c.length]} stroke="#fff" strokeWidth="2" />
                        )))}
                    </svg>
                );

            case 'list-matrix':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1].map(row => (
                            <g key={row}>
                                <rect x="10" y={20 + row * 35} width="15" height="30" fill={c[row * 2]} />
                                <rect x="28" y={20 + row * 35} width="60" height="30" fill={c[row * 2 + 1]} opacity="0.5" />
                            </g>
                        ))}
                    </svg>
                );

            default:
                // Default matrix thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1].map(row => [0, 1].map(col => (
                            <rect key={`${row}-${col}`} x={20 + col * 30} y={30 + row * 30} width="28" height="28"
                                fill={c[(row * 2 + col) % c.length]} stroke="#fff" strokeWidth="2" />
                        )))}
                    </svg>
                );
        }
    }

    // PYRAMID LAYOUTS
    if (layout.category === 'Pyramid') {
        switch (layoutType) {
            case 'basic-pyramid':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <polygon points="50,20 20,90 80,90" fill={c[0]} opacity="0.3" stroke={c[0]} strokeWidth="2" />
                        <polygon points="35,55 65,55 65,90 35,90" fill={c[1]} opacity="0.5" />
                        <polygon points="42,72 58,72 58,90 42,90" fill={c[2]} opacity="0.7" />
                    </svg>
                );

            case 'segmented-pyramid':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => {
                            const topWidth = 20 + i * 20;
                            const bottomWidth = 40 + i * 20;
                            const y = 20 + i * 23;
                            return (
                                <polygon key={i}
                                    points={`${50 - topWidth / 2},${y} ${50 + topWidth / 2},${y} ${50 + bottomWidth / 2},${y + 20} ${50 - bottomWidth / 2},${y + 20}`}
                                    fill={c[i % c.length]} stroke="#fff" strokeWidth="2" />
                            );
                        })}
                    </svg>
                );

            case 'inverted-pyramid':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <polygon points="20,20 80,20 65,45 35,45" fill={c[0]} opacity="0.3" stroke={c[0]} strokeWidth="2" />
                        <polygon points="35,45 65,45 58,65 42,65" fill={c[1]} opacity="0.5" stroke={c[1]} strokeWidth="2" />
                        <polygon points="42,65 58,65 53,80 47,80" fill={c[2]} opacity="0.7" stroke={c[2]} strokeWidth="2" />
                    </svg>
                );

            case 'horizontal-pyramid':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <polygon points="20,50 45,20 45,80" fill={c[0]} opacity="0.3" stroke={c[0]} strokeWidth="2" />
                        <polygon points="45,35 65,30 65,70 45,65" fill={c[1]} opacity="0.5" stroke={c[1]} strokeWidth="2" />
                        <polygon points="65,42 80,40 80,60 65,58" fill={c[2]} opacity="0.7" stroke={c[2]} strokeWidth="2" />
                    </svg>
                );

            case 'pyramid-list':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => {
                            const width = 80 - i * 25;
                            const x = 10 + i * 12.5;
                            return <rect key={i} x={x} y={20 + i * 25} width={width} height="20" fill={c[i % c.length]} />;
                        })}
                    </svg>
                );

            default:
                // Default pyramid thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <polygon points="50,15 15,85 85,85" fill={c[0]} opacity="0.4" stroke={c[0]} strokeWidth="2" />
                        <polygon points="35,55 65,55 65,85 35,85" fill={c[1]} opacity="0.6" />
                    </svg>
                );
        }
    }

    // PICTURE LAYOUTS
    if (layout.category === 'Picture') {
        switch (layoutType) {
            case 'picture-list':
            case 'continuous-picture':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <g key={i}>
                                <rect x={10 + i * 30} y="30" width="28" height="28" fill={c[i % c.length]} opacity="0.5" />
                                <rect x={12 + i * 30} y="60" width="24" height="3" fill={c[i % c.length]} />
                            </g>
                        ))}
                    </svg>
                );

            case 'picture-strips':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x="10" y={15 + i * 25} width="80" height="20" fill={c[i % c.length]} opacity="0.5" />
                        ))}
                    </svg>
                );

            case 'picture-grid':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1].map(row => [0, 1].map(col => (
                            <rect key={`${row}-${col}`} x={15 + col * 35} y={15 + row * 35} width="33" height="33"
                                fill={c[(row * 2 + col) % c.length]} opacity="0.5" stroke="#fff" strokeWidth="2" />
                        )))}
                    </svg>
                );

            case 'picture-hierarchy':
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        <rect x="35" y="10" width="30" height="20" fill={c[0]} opacity="0.5" />
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={10 + i * 30} y="45" width="25" height="20" fill={c[(i + 1) % c.length]} opacity="0.5" />
                        ))}
                        <path d="M 50 30 L 50 40 M 50 40 L 22 40 L 22 45 M 50 40 L 52 40 L 52 45 M 50 40 L 82 40 L 82 45" stroke="#666" strokeWidth="1.5" />
                    </svg>
                );

            default:
                // Default picture thumbnail
                return (
                    <svg viewBox="0 0 100 100" className="thumbnail-svg">
                        {[0, 1, 2].map(i => (
                            <rect key={i} x={15 + i * 28} y="30" width="25" height="25" fill={c[i % c.length]} opacity="0.5" />
                        ))}
                    </svg>
                );
        }
    }

    // OTHER/SPECIAL LAYOUTS
    if (layout.category === 'Other') {
        return (
            <svg viewBox="0 0 100 100" className="thumbnail-svg">
                {[0, 1, 2].map(i => (
                    <circle key={i} cx={25 + i * 25} cy="50" r="12" fill={c[i % c.length]} />
                ))}
            </svg>
        );
    }

    // FINAL FALLBACK - should never reach here, but just in case
    return (
        <svg viewBox="0 0 100 100" className="thumbnail-svg">
            <rect x="20" y="20" width="60" height="60" fill={c[0]} opacity="0.5" rx="5" />
            <text x="50" y="55" textAnchor="middle" fontSize="10" fill="#666">{layout.name.substring(0, 8)}</text>
        </svg>
    );
};

// Helper function for polar to cartesian conversion
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};
