
export const SHAPE_CATEGORIES = {
    'Lines': [
        { id: 'line', title: 'Line' },
        { id: 'arrow', title: 'Arrow' },
        { id: 'arrow-double', title: 'Double Arrow' },
        { id: 'connector-elbow', title: 'Connector: Elbow' },
        { id: 'connector-curved', title: 'Connector: Curved' },
        { id: 'curve', title: 'Curve' },
        { id: 'scribble', title: 'Freeform: Scribble' }
    ],
    'Rectangles': [
        { id: 'rect', title: 'Rectangle' },
        { id: 'round-rect', title: 'Rounded Rectangle' },
        { id: 'snip-1', title: 'Snip Single Corner' },
        { id: 'snip-same', title: 'Snip Same Side Corner' },
        { id: 'snip-diag', title: 'Snip Diagonal Corner' },
        { id: 'round-1', title: 'Round Single Corner' },
        { id: 'round-same', title: 'Round Same Side Corner' },
        { id: 'round-diag', title: 'Round Diagonal Corner' }
    ],
    'Basic Shapes': [
        { id: 'textbox', title: 'Text Box' },
        { id: 'oval', title: 'Oval' },
        { id: 'triangle-iso', title: 'Isosceles Triangle' },
        { id: 'triangle-right', title: 'Right Triangle' },
        { id: 'parallelogram', title: 'Parallelogram' },
        { id: 'trapezoid', title: 'Trapezoid' },
        { id: 'diamond', title: 'Diamond' },
        { id: 'pentagon', title: 'Pentagon' },
        { id: 'hexagon', title: 'Hexagon' },
        { id: 'heptagon', title: 'Heptagon' },
        { id: 'octagon', title: 'Octagon' },
        { id: 'decagon', title: 'Decagon' },
        { id: 'dodecagon', title: 'Dodecagon' },
        { id: 'pie', title: 'Pie' },
        { id: 'chord', title: 'Chord' },
        { id: 'teardrop', title: 'Teardrop' },
        { id: 'frame', title: 'Frame' },
        { id: 'half-frame', title: 'Half Frame' },
        { id: 'l-shape', title: 'L-Shape' },
        { id: 'donut', title: 'Donut' },
        { id: 'no-symbol', title: 'No Symbol' },
        { id: 'block-arc', title: 'Block Arc' },
        { id: 'folded-corner', title: 'Folded Corner' },
        { id: 'smiley', title: 'Smiley Face' },
        { id: 'heart', title: 'Heart' },
        { id: 'lightning', title: 'Lightning Bolt' },
        { id: 'sun', title: 'Sun' },
        { id: 'moon', title: 'Moon' },
        { id: 'cloud', title: 'Cloud' },
        { id: 'brace-left', title: 'Left Brace' },
        { id: 'brace-right', title: 'Right Brace' },
        { id: 'bracket-left', title: 'Left Bracket' },
        { id: 'bracket-right', title: 'Right Bracket' },
        { id: 'plaque', title: 'Plaque' },
        { id: 'can', title: 'Can' },
        { id: 'cube', title: 'Cube' }
    ],
    'Block Arrows': [
        { id: 'arrow-right', title: 'Right Arrow' },
        { id: 'arrow-left', title: 'Left Arrow' },
        { id: 'arrow-up', title: 'Up Arrow' },
        { id: 'arrow-down', title: 'Down Arrow' },
        { id: 'arrow-left-right', title: 'Left-Right Arrow' },
        { id: 'arrow-up-down', title: 'Up-Down Arrow' },
        { id: 'arrow-quad', title: 'Quad Arrow' },
        { id: 'arrow-uturn', title: 'U-Turn Arrow' },
        { id: 'arrow-bent', title: 'Bent Arrow' },
        { id: 'arrow-circular', title: 'Circular Arrow' },
        { id: 'arrow-chevron', title: 'Chevron Arrow' },
        { id: 'arrow-notched', title: 'Notched Right Arrow' },
        { id: 'arrow-striped', title: 'Striped Right Arrow' }
    ],
    'Equation Shapes': [
        { id: 'math-plus', title: 'Plus' },
        { id: 'math-minus', title: 'Minus' },
        { id: 'math-multiply', title: 'Multiply' },
        { id: 'math-divide', title: 'Divide' },
        { id: 'math-equal', title: 'Equal' },
        { id: 'math-not-equal', title: 'Not Equal' }
    ],
    'Flowchart': [
        { id: 'flow-process', title: 'Process' },
        { id: 'flow-decision', title: 'Decision' },
        { id: 'flow-io', title: 'Input/Output' },
        { id: 'flow-predefined', title: 'Predefined Process' },
        { id: 'flow-internal', title: 'Internal Storage' },
        { id: 'flow-document', title: 'Document' },
        { id: 'flow-terminator', title: 'Terminator' },
        { id: 'flow-preparation', title: 'Preparation' },
        { id: 'flow-manual-input', title: 'Manual Input' },
        { id: 'flow-manual-op', title: 'Manual Operation' },
        { id: 'flow-connector', title: 'Connector' },
        { id: 'flow-offpage', title: 'Off-Page Connector' },
        { id: 'flow-card', title: 'Card' },
        { id: 'flow-tape', title: 'Punched Tape' },
        { id: 'flow-summing', title: 'Summing Junction' },
        { id: 'flow-or', title: 'Or' },
        { id: 'flow-collate', title: 'Collate' },
        { id: 'flow-sort', title: 'Sort' },
        { id: 'flow-extract', title: 'Extract' },
        { id: 'flow-merge', title: 'Merge' },
        { id: 'flow-stored-data', title: 'Stored Data' },
        { id: 'flow-delay', title: 'Delay' },
        { id: 'flow-display', title: 'Display' }
    ],
    'Stars and Banners': [
        { id: 'star-4', title: '4-Point Star' },
        { id: 'star-5', title: '5-Point Star' },
        { id: 'star-6', title: '6-Point Star' },
        { id: 'star-8', title: '8-Point Star' },
        { id: 'star-10', title: '10-Point Star' },
        { id: 'star-12', title: '12-Point Star' },
        { id: 'star-16', title: '16-Point Star' },
        { id: 'star-24', title: '24-Point Star' },
        { id: 'star-32', title: '32-Point Star' },
        { id: 'explosion-1', title: 'Explosion 1' },
        { id: 'explosion-2', title: 'Explosion 2' },
        { id: 'scroll', title: 'Scroll' },
        { id: 'ribbon-up', title: 'Up Ribbon' },
        { id: 'ribbon-down', title: 'Down Ribbon' }
    ],
    'Callouts': [
        { id: 'callout-rect', title: 'Rectangle Callout' },
        { id: 'callout-round', title: 'Rounded Rectangle Callout' },
        { id: 'callout-oval', title: 'Oval Callout' },
        { id: 'callout-cloud', title: 'Cloud Callout' },
        { id: 'callout-line-1', title: 'Line Callout 1' },
        { id: 'callout-line-2', title: 'Line Callout 2' },
        { id: 'callout-line-3', title: 'Line Callout 3' }
    ]
};

export const getShapeSVG = (type, fill = '#bfdbfe', stroke = '#2563eb', preserveAspect = true) => {
    const sw = '2'; // stroke width
    const aspectRatio = preserveAspect ? 'xMidYMid meet' : 'none';

    // Helper to wrap content in SVG
    const svg = (content) => `<svg width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="${aspectRatio}" xmlns="http://www.w3.org/2000/svg" style="display:block;">${content}</svg>`;
    const attrs = `fill="${fill}" stroke="${stroke}" stroke-width="${sw}"`;

    const markerDefs = `<defs><marker id="m-end" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 L1.5,3 Z" fill="${stroke}"/></marker><marker id="m-start" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto-start-reverse"><path d="M0,0 L6,3 L0,6 L1.5,3 Z" fill="${stroke}"/></marker></defs>`;
    const lineAttrs = `stroke="${stroke}" stroke-width="${sw}" fill="none"`;

    switch (type) {
        // --- Lines ---
        case 'line': return svg(`<line x1="10" y1="90" x2="90" y2="10" ${lineAttrs} />`);
        case 'arrow': return svg(`${markerDefs}<line x1="10" y1="90" x2="85" y2="15" ${lineAttrs} marker-end="url(#m-end)" />`);
        case 'arrow-double': return svg(`${markerDefs}<line x1="15" y1="85" x2="85" y2="15" ${lineAttrs} marker-start="url(#m-start)" marker-end="url(#m-end)" />`);
        case 'connector-elbow': return svg(`<polyline points="10,20 10,80 90,80" ${lineAttrs} />`);
        case 'connector-curved': return svg(`<path d="M10,20 Q10,80 90,80" ${lineAttrs} />`);
        case 'curve': return svg(`<path d="M10,90 Q30,10 90,50" ${lineAttrs} />`);
        case 'scribble': return svg(`<path d="M10,50 Q20,20 40,50 T70,50 T90,20" ${lineAttrs} />`);

        // --- Rectangles ---
        case 'rect': return svg(`<rect x="5" y="25" width="90" height="50" ${attrs} />`);
        case 'round-rect': return svg(`<rect x="5" y="25" width="90" height="50" rx="15" ${attrs} />`);
        case 'snip-1': return svg(`<polygon points="25,25 95,25 95,75 5,75 5,45" ${attrs} />`);
        case 'snip-same': return svg(`<polygon points="25,25 75,25 95,45 95,75 5,75 5,45" ${attrs} />`);
        case 'snip-diag': return svg(`<polygon points="25,25 95,25 95,55 75,75 5,75 5,45" ${attrs} />`);
        case 'round-1': return svg(`<path d="M25,25 L95,25 L95,75 L5,75 L5,45 Q5,25 25,25 Z" ${attrs} />`);
        case 'round-same': return svg(`<path d="M25,25 L75,25 Q95,25 95,45 L95,75 L5,75 L5,45 Q5,25 25,25 Z" ${attrs} />`);
        case 'round-diag': return svg(`<path d="M25,25 L95,25 L95,55 Q95,75 75,75 L5,75 L5,45 Q5,25 25,25 Z" ${attrs} />`);

        // --- Basic Shapes ---
        case 'textbox': return svg(`<rect x="5" y="25" width="90" height="50" ${attrs} /><line x1="15" y1="40" x2="85" y2="40" stroke="${stroke}" stroke-width="${sw}" /><line x1="15" y1="60" x2="60" y2="60" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'oval': return svg(`<ellipse cx="50" cy="50" rx="45" ry="30" ${attrs} />`);
        case 'triangle-iso': return svg(`<polygon points="50,15 90,85 10,85" ${attrs} />`);
        case 'triangle-right': return svg(`<polygon points="10,15 10,85 80,85" ${attrs} />`);
        case 'parallelogram': return svg(`<polygon points="25,20 95,20 75,80 5,80" ${attrs} />`);
        case 'trapezoid': return svg(`<polygon points="25,20 75,20 95,80 5,80" ${attrs} />`);
        case 'diamond': return svg(`<polygon points="50,10 90,50 50,90 10,50" ${attrs} />`);
        case 'pentagon': return svg(`<polygon points="50,10 95,40 80,90 20,90 5,40" ${attrs} />`);
        case 'hexagon': return svg(`<polygon points="25,10 75,10 95,50 75,90 25,90 5,50" ${attrs} />`);
        case 'heptagon': return svg(`<polygon points="50,5 85,25 95,65 70,95 30,95 5,65 15,25" ${attrs} />`);
        case 'octagon': return svg(`<polygon points="30,10 70,10 95,35 95,75 70,100 30,100 5,75 5,35" transform="scale(0.9) translate(5,0)" ${attrs} />`);
        case 'decagon': return svg(`<circle cx="50" cy="50" r="45" ${attrs} />`);
        case 'dodecagon': return svg(`<circle cx="50" cy="50" r="45" ${attrs} />`);
        case 'pie': return svg(`<path d="M50,50 L90,50 A40,40 0 1,1 50,10 Z" ${attrs} />`);
        case 'chord': return svg(`<path d="M10,50 A40,40 0 0,1 90,50 Z" ${attrs} />`);
        case 'teardrop': return svg(`<path d="M50,10 Q90,50 50,90 Q10,50 50,10" ${attrs} />`);
        case 'frame': return svg(`<path d="M10,10 L90,10 L90,90 L10,90 Z M25,25 L25,75 L75,75 L75,25 Z" ${attrs} fill-rule="evenodd"/>`);
        case 'half-frame': return svg(`<path d="M10,10 L90,10 L90,90 L75,90 L75,25 L25,25 L25,90 L10,90 Z" ${attrs} />`);
        case 'l-shape': return svg(`<polygon points="20,10 40,10 40,70 80,70 80,90 20,90" ${attrs} />`);
        case 'donut': return svg(`<circle cx="50" cy="50" r="45" ${attrs} fill="none" stroke-width="15" stroke="${fill === 'transparent' ? '#000' : fill}" /><circle cx="50" cy="50" r="45" fill="none" stroke="${stroke}" stroke-width="2"/><circle cx="50" cy="50" r="30" fill="none" stroke="${stroke}" stroke-width="2"/>`);
        case 'no-symbol': return svg(`<circle cx="50" cy="50" r="40" stroke="red" stroke-width="10" fill="none" /><line x1="22" y1="22" x2="78" y2="78" stroke="red" stroke-width="10" />`);
        case 'block-arc': return svg(`<path d="M10,50 A40,40 0 0,1 90,50 L90,60 A40,40 0 0,1 10,60 Z" ${attrs} />`);
        case 'folded-corner': return svg(`<path d="M10,10 L70,10 L90,30 L90,90 L10,90 Z" ${attrs} /><polygon points="70,10 70,30 90,30" fill="none" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'smiley': return svg(`<circle cx="50" cy="50" r="40" ${attrs} /><circle cx="35" cy="40" r="4" fill="${stroke}" /><circle cx="65" cy="40" r="4" fill="${stroke}" /><path d="M30,60 Q50,80 70,60" fill="none" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'heart': return svg(`<path d="M50,85 C50,85 10,55 10,30 A15,15 0 0,1 40,30 A10,10 0 0,1 50,40 A10,10 0 0,1 60,30 A15,15 0 0,1 90,30 C90,55 50,85 50,85 Z" ${attrs} />`);
        case 'lightning': return svg(`<polygon points="55,5 25,50 45,50 35,95 75,40 50,40" ${attrs} />`);
        case 'sun': return svg(`<circle cx="50" cy="50" r="20" ${attrs} /><path d="M50,15 L50,5 M50,85 L50,95 M15,50 L5,50 M85,50 L95,50" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'moon': return svg(`<path d="M50,10 A35,35 0 1,1 50,80 A25,25 0 1,0 50,10 Z" ${attrs} />`);
        case 'cloud': return svg(`<path d="M25,60 A15,15 0 0,1 25,30 A20,20 0 0,1 60,30 A15,15 0 0,1 80,45 A12,12 0 0,1 80,70 L25,70 Z" ${attrs} />`);
        case 'brace-left': return svg(`<path d="M80,10 Q60,10 60,20 L60,35 Q60,45 50,45 Q60,45 60,55 L60,70 Q60,80 80,80" ${lineAttrs} />`);
        case 'brace-right': return svg(`<path d="M20,10 Q40,10 40,20 L40,35 Q40,45 50,45 Q40,45 40,55 L40,70 Q40,80 20,80" ${lineAttrs} />`);
        case 'bracket-left': return svg(`<path d="M70,10 L50,10 L50,80 L70,80" ${lineAttrs} />`);
        case 'bracket-right': return svg(`<path d="M30,10 L50,10 L50,80 L30,80" ${lineAttrs} />`);
        case 'plaque': return svg(`<path d="M15,25 L85,25 Q95,25 95,35 L95,65 Q95,75 85,75 L15,75 Q5,75 5,65 L5,35 Q5,25 15,25 Z" ${attrs} />`);
        case 'can': return svg(`<ellipse cx="50" cy="20" rx="40" ry="10" ${attrs} /><rect x="10" y="20" width="80" height="60" ${attrs} /><ellipse cx="50" cy="80" rx="40" ry="10" ${attrs} />`);
        case 'cube': return svg(`<polygon points="50,20 90,40 90,80 50,100 10,80 10,40" ${attrs} /><line x1="50" y1="20" x2="50" y2="60" stroke="${stroke}" stroke-width="${sw}" /><line x1="50" y1="60" x2="10" y2="40" stroke="${stroke}" stroke-width="${sw}" /><line x1="50" y1="60" x2="90" y2="40" stroke="${stroke}" stroke-width="${sw}" />`);

        // --- Block Arrows ---
        case 'arrow-right': return svg(`<polygon points="10,35 60,35 60,20 90,50 60,80 60,65 10,65" ${attrs} />`);
        case 'arrow-left': return svg(`<polygon points="90,35 40,35 40,20 10,50 40,80 40,65 90,65" ${attrs} />`);
        case 'arrow-up': return svg(`<polygon points="35,90 35,40 20,40 50,10 80,40 65,40 65,90" ${attrs} />`);
        case 'arrow-down': return svg(`<polygon points="35,10 35,60 20,60 50,90 80,60 65,60 65,10" ${attrs} />`);
        case 'arrow-left-right': return svg(`<polygon points="10,50 30,20 30,35 70,35 70,20 90,50 70,80 70,65 30,65 30,80" ${attrs} />`);
        case 'arrow-up-down': return svg(`<polygon points="50,10 20,30 35,30 35,70 20,70 50,90 80,70 65,70 65,30 80,30" ${attrs} />`);
        case 'arrow-quad': return svg(`<path d="M40,40 L40,10 L60,10 L60,40 L90,40 L90,60 L60,60 L60,90 L40,90 L40,60 L10,60 L10,40 Z" ${attrs} />`);
        case 'arrow-uturn': return svg(`<path d="M20,70 L20,30 Q20,10 50,10 Q80,10 80,30 L80,50 L95,50 L75,80 L55,50 L70,50 L70,30 Q70,20 50,20 Q30,20 30,30 L30,70 Z" ${attrs} />`);
        case 'arrow-bent': return svg(`<polygon points="10,70 10,50 50,50 50,20 80,50 50,80 50,70" ${attrs} />`);
        case 'arrow-circular': return svg(`<path d="M50,20 A30,30 0 1,1 20,50 L10,50 L30,80 L50,50 L40,50 A20,20 0 1,0 50,30 Z" ${attrs} />`);
        case 'arrow-chevron': return svg(`<polygon points="10,20 70,20 90,50 70,80 10,80 30,50" ${attrs} />`);
        case 'arrow-notched': return svg(`<polygon points="10,35 60,35 60,20 90,50 60,80 60,65 10,65 20,50" ${attrs} />`);
        case 'arrow-striped': return svg(`<g><polygon points="10,35 60,35 60,20 90,50 60,80 60,65 10,65" ${attrs} /><rect x="20" y="35" width="5" height="30" fill="rgba(0,0,0,0.1)"/><rect x="30" y="35" width="5" height="30" fill="rgba(0,0,0,0.1)"/></g>`);

        // --- Equation ---
        case 'math-plus': return svg(`<polygon points="40,20 60,20 60,40 80,40 80,60 60,60 60,80 40,80 40,60 20,60 20,40 40,40" ${attrs} />`);
        case 'math-minus': return svg(`<rect x="20" y="40" width="60" height="20" ${attrs} />`);
        case 'math-multiply': return svg(`<polygon points="20,20 35,20 50,40 65,20 80,20 60,50 80,80 65,80 50,60 35,80 20,80 40,50" ${attrs} />`);
        case 'math-divide': return svg(`<rect x="20" y="45" width="60" height="10" ${attrs} /><circle cx="50" cy="25" r="8" fill="${stroke}" /><circle cx="50" cy="75" r="8" fill="${stroke}" />`);
        case 'math-equal': return svg(`<rect x="20" y="30" width="60" height="10" ${attrs} /><rect x="20" y="60" width="60" height="10" ${attrs} />`);
        case 'math-not-equal': return svg(`<g><rect x="20" y="30" width="60" height="10" ${attrs} /><rect x="20" y="60" width="60" height="10" ${attrs} /><line x1="70" y1="20" x2="30" y2="80" stroke="${stroke}" stroke-width="${sw}" /></g>`);

        // --- Flowchart ---
        case 'flow-process': return svg(`<rect x="10" y="30" width="80" height="40" ${attrs} />`);
        case 'flow-decision': return svg(`<polygon points="50,20 90,50 50,80 10,50" ${attrs} />`);
        case 'flow-io': return svg(`<polygon points="20,30 90,30 80,70 10,70" ${attrs} />`);
        case 'flow-predefined': return svg(`<g><rect x="10" y="30" width="80" height="40" ${attrs} /><line x1="20" y1="30" x2="20" y2="70" stroke="${stroke}" stroke-width="${sw}" /><line x1="80" y1="30" x2="80" y2="70" stroke="${stroke}" stroke-width="${sw}" /></g>`);
        case 'flow-terminator': return svg(`<rect x="10" y="30" width="80" height="40" rx="20" ${attrs} />`);
        case 'flow-document': return svg(`<path d="M10,20 L90,20 L90,70 Q70,90 50,70 Q30,50 10,70 Z" ${attrs} />`);
        case 'flow-preparation': return svg(`<polygon points="10,50 20,30 80,30 90,50 80,70 20,70" ${attrs} />`);
        case 'flow-connector': return svg(`<circle cx="50" cy="50" r="20" ${attrs} />`);
        case 'flow-offpage': return svg(`<polygon points="10,20 90,20 90,60 50,90 10,60" ${attrs} />`);
        case 'flow-manual-input': return svg(`<polygon points="10,40 90,40 90,80 10,80 10,40" transform="skewX(-10)" ${attrs} /><path d="M10,40 L90,30" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'flow-manual-op': return svg(`<polygon points="10,20 90,20 80,80 20,80" ${attrs} />`);
        case 'flow-card': return svg(`<polygon points="10,20 90,20 90,80 10,80 10,20" ${attrs} clip-path="inset(0 15px 0 0)" />`);
        case 'flow-tape': return svg(`<path d="M10,30 Q30,10 50,30 Q70,50 90,30 L90,70 Q70,90 50,70 Q30,50 10,70 Z" ${attrs} />`);
        case 'flow-delay': return svg(`<path d="M10,20 L60,20 A30,30 0 0,1 60,80 L10,80 Z" ${attrs} />`);
        case 'flow-display': return svg(`<path d="M10,50 L30,20 L80,20 A10,10 0 0,1 90,30 L90,70 A10,10 0 0,1 80,80 L30,80 Z" ${attrs} />`);
        case 'flow-internal': return svg(`<rect x="10" y="20" width="80" height="60" ${attrs} /><line x1="10" y1="35" x2="90" y2="35" stroke="${stroke}" stroke-width="${sw}" /><line x1="25" y1="20" x2="25" y2="80" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'flow-summing': return svg(`<circle cx="50" cy="50" r="30" ${attrs} /><path d="M28,28 L72,72 M72,28 L28,72" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'flow-or': return svg(`<circle cx="50" cy="50" r="30" ${attrs} /><line x1="20" y1="50" x2="80" y2="50" stroke="${stroke}" stroke-width="${sw}" /><line x1="50" y1="20" x2="50" y2="80" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'flow-collate': return svg(`<polygon points="10,10 90,10 50,50 10,10 10,90 90,90 50,50 90,90" ${attrs} />`);
        case 'flow-sort': return svg(`<polygon points="50,10 90,50 50,90 10,50" ${attrs} /><line x1="10" y1="50" x2="90" y2="50" stroke="${stroke}" stroke-width="${sw}" />`);
        case 'flow-extract': return svg(`<polygon points="50,20 10,80 90,80" ${attrs} />`);
        case 'flow-merge': return svg(`<polygon points="50,80 10,20 90,20" ${attrs} />`);
        case 'flow-stored-data': return svg(`<path d="M20,20 Q50,0 80,20 L80,80 Q50,100 20,80 L20,20 Q50,40 80,20" ${attrs} />`);

        // --- Stars ---
        case 'star-4': return svg(`<polygon points="50,10 60,40 90,50 60,60 50,90 40,60 10,50 40,40" ${attrs} />`);
        case 'star-5': return svg(`<polygon points="50,10 63,38 95,38 70,58 79,89 50,70 21,89 30,58 5,38 37,38" ${attrs} />`);
        case 'star-6': return svg(`<polygon points="50,5 65,35 95,35 70,55 80,85 50,65 20,85 30,55 5,35 35,35" ${attrs} />`);
        case 'star-10': return svg(`<circle cx="50" cy="50" r="45" ${attrs} stroke-dasharray="5,5" />`); // Placeholder style for now
        case 'star-12': return svg(`<path d="M50,5 L58,35 L88,35 L65,55 L75,85 L50,65 L25,85 L35,55 L12,35 L42,35 Z" ${attrs} />`); // Approx
        case 'star-24': return svg(`<circle cx="50" cy="50" r="45" ${attrs} />`);
        case 'star-32': return svg(`<circle cx="50" cy="50" r="45" ${attrs} />`);
        case 'star-8': return svg(`<polygon points="50,10 60,35 85,25 70,45 95,55 70,65 85,85 60,75 50,95 40,75 15,85 30,65 5,55 30,45 15,25 40,35" ${attrs} />`);
        case 'star-16': return svg(`<circle cx="50" cy="50" r="45" ${attrs} />`);
        case 'explosion-1': return svg(`<path d="M50,10 L60,30 L80,20 L70,40 L90,60 L60,65 L50,90 L40,65 L10,60 L30,40 L20,20 L40,30 Z" ${attrs} />`);
        case 'explosion-2': return svg(`<path d="M50,10 L65,25 L85,15 L80,35 L95,50 L80,65 L85,85 L65,75 L50,90 L35,75 L15,85 L20,65 L5,50 L20,35 L15,15 L35,25 Z" ${attrs} />`);
        case 'scroll': return svg(`<path d="M10,20 L80,20 Q95,20 95,35 L95,80 Q95,90 80,90 L10,90 Q20,80 20,55 Q20,30 10,20" ${attrs} />`);
        case 'ribbon-up': return svg(`<polygon points="10,80 10,20 50,10 90,20 90,80 50,70" ${attrs} />`);
        case 'ribbon-down': return svg(`<polygon points="10,20 10,80 50,90 90,80 90,20 50,30" ${attrs} />`);

        // --- Callouts ---
        case 'callout-rect': return svg(`<path d="M10,10 L90,10 L90,60 L60,60 L40,90 L40,60 L10,60 Z" ${attrs} />`);
        case 'callout-round': return svg(`<path d="M20,10 L80,10 Q90,10 90,20 L90,60 L70,60 L50,90 L50,60 L20,60 Q10,60 10,50 L10,20 Q10,10 20,10 Z" ${attrs} />`);
        case 'callout-oval': return svg(`<g><ellipse cx="50" cy="35" rx="45" ry="25" ${attrs} /><polygon points="30,55 20,90 50,58" ${attrs} /></g>`);
        case 'callout-cloud': return svg(`<g><path d="M20,40 A15,15 0 0,1 40,20 A15,15 0 0,1 70,25 A15,15 0 0,1 80,50 A10,10 0 0,1 70,70 L40,70 A15,15 0 0,1 20,40 Z" ${attrs} /><path d="M30,65 L20,90 L45,68" stroke="${stroke}" stroke-width="${sw}" fill="none"/></g>`);
        case 'callout-line-1': return svg(`<g><rect x="40" y="40" width="50" height="30" ${attrs} /><line x1="10" y1="10" x2="40" y2="40" stroke="${stroke}" stroke-width="${sw}" /></g>`);
        case 'callout-line-2': return svg(`<g><rect x="10" y="40" width="50" height="30" ${attrs} /><line x1="90" y1="10" x2="60" y2="40" stroke="${stroke}" stroke-width="${sw}" /></g>`);
        case 'callout-line-3': return svg(`<g><rect x="40" y="10" width="50" height="30" ${attrs} /><line x1="10" y1="90" x2="40" y2="40" stroke="${stroke}" stroke-width="${sw}" /></g>`);

        // Default fallback
        default: return svg(`<rect x="10" y="10" width="80" height="80" fill="#eee" stroke="#aaa" />`);
    }
};
