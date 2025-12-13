// SmartArt Templates - Complete MS Word SmartArt Implementation
// All 9 categories with full layout definitions

export const SMARTART_CATEGORIES = {
    ALL: 'All',
    LIST: 'List',
    PROCESS: 'Process',
    CYCLE: 'Cycle',
    HIERARCHY: 'Hierarchy',
    RELATIONSHIP: 'Relationship',
    MATRIX: 'Matrix',
    PYRAMID: 'Pyramid',
    PICTURE: 'Picture',
    OTHER: 'Other'
};

export const SMARTART_COLORS = {
    COLORFUL: [
        { name: 'Colorful', colors: ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'] },
        { name: 'Colorful - Accent Colors', colors: ['#5B9BD5', '#ED7D31', '#A5A5A5', '#FFC000', '#4472C4'] },
        { name: 'Colorful Range - Accent 1', colors: ['#4472C4', '#5B9BD5', '#70AD47', '#FFC000', '#ED7D31'] },
        { name: 'Colorful Range - Accent 2', colors: ['#ED7D31', '#FFC000', '#70AD47', '#5B9BD5', '#4472C4'] },
    ],
    ACCENT_1: [
        { name: 'Colored Fill - Accent 1', colors: ['#4472C4', '#4472C4', '#4472C4', '#4472C4', '#4472C4'] },
        { name: 'Colored Outline - Accent 1', colors: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'], outline: '#4472C4' },
    ],
    ACCENT_2: [
        { name: 'Colored Fill - Accent 2', colors: ['#ED7D31', '#ED7D31', '#ED7D31', '#ED7D31', '#ED7D31'] },
        { name: 'Colored Outline - Accent 2', colors: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'], outline: '#ED7D31' },
    ],
    ACCENT_3: [
        { name: 'Colored Fill - Accent 3', colors: ['#A5A5A5', '#A5A5A5', '#A5A5A5', '#A5A5A5', '#A5A5A5'] },
    ],
    ACCENT_4: [
        { name: 'Colored Fill - Accent 4', colors: ['#FFC000', '#FFC000', '#FFC000', '#FFC000', '#FFC000'] },
    ],
    ACCENT_5: [
        { name: 'Colored Fill - Accent 5', colors: ['#5B9BD5', '#5B9BD5', '#5B9BD5', '#5B9BD5', '#5B9BD5'] },
    ],
    ACCENT_6: [
        { name: 'Colored Fill - Accent 6', colors: ['#70AD47', '#70AD47', '#70AD47', '#70AD47', '#70AD47'] },
    ],
};

export const SMARTART_STYLES = {
    SIMPLE: ['Simple Fill', 'White Outline', 'Subtle Effect', 'Moderate Effect'],
    POLISHED: ['Polished', 'Inset', 'Cartoon', 'Powder'],
    THREE_D: ['3D', 'Brick Scene', 'Sunset Scene', 'Metallic Scene'],
};

// 1. LIST SMARTART LAYOUTS
export const LIST_LAYOUTS = [
    {
        id: 'basic-block-list',
        name: 'Basic Block List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show non-sequential or grouped blocks of information. Maximizes both horizontal and vertical display space for shapes.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'vertical-blocks',
        thumbnail: 'basic-block-list.svg'
    },
    {
        id: 'vertical-bullet-list',
        name: 'Vertical Bullet List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show a bulleted list in a vertical arrangement.',
        defaultShapes: 4,
        shapeType: 'bullet',
        layout: 'vertical-list',
        thumbnail: 'vertical-bullet-list.svg'
    },
    {
        id: 'horizontal-bullet-list',
        name: 'Horizontal Bullet List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show a bulleted list in a horizontal arrangement.',
        defaultShapes: 4,
        shapeType: 'bullet',
        layout: 'horizontal-list',
        thumbnail: 'horizontal-bullet-list.svg'
    },
    {
        id: 'picture-caption-list',
        name: 'Picture Caption List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show pictures with captions.',
        defaultShapes: 3,
        shapeType: 'picture-caption',
        layout: 'picture-list',
        thumbnail: 'picture-caption-list.svg'
    },
    {
        id: 'vertical-picture-list',
        name: 'Vertical Picture List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show pictures with text descriptions in a vertical arrangement.',
        defaultShapes: 3,
        shapeType: 'picture-text',
        layout: 'vertical-picture',
        thumbnail: 'vertical-picture-list.svg'
    },
    {
        id: 'stacked-list',
        name: 'Stacked List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show groups of information stacked on top of each other.',
        defaultShapes: 3,
        shapeType: 'stacked-rectangle',
        layout: 'stacked',
        thumbnail: 'stacked-list.svg'
    },
    {
        id: 'vertical-box-list',
        name: 'Vertical Box List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show key points arranged vertically in boxes.',
        defaultShapes: 3,
        shapeType: 'box',
        layout: 'vertical-boxes',
        thumbnail: 'vertical-box-list.svg'
    },
    {
        id: 'horizontal-box-list',
        name: 'Horizontal Box List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show key points arranged horizontally in boxes.',
        defaultShapes: 3,
        shapeType: 'box',
        layout: 'horizontal-boxes',
        thumbnail: 'horizontal-box-list.svg'
    },
    {
        id: 'grouped-list',
        name: 'Grouped List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show groups of items under one heading.',
        defaultShapes: 2,
        shapeType: 'grouped',
        layout: 'grouped',
        thumbnail: 'grouped-list.svg'
    },
    {
        id: 'tabbed-list',
        name: 'Tabbed List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show items placed in tabs.',
        defaultShapes: 3,
        shapeType: 'tab',
        layout: 'tabbed',
        thumbnail: 'tabbed-list.svg'
    },
    {
        id: 'table-list',
        name: 'Table List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to show a list that looks like a table with rows and columns.',
        defaultShapes: 4,
        shapeType: 'table-cell',
        layout: 'table',
        thumbnail: 'table-list.svg'
    },
    {
        id: 'segmented-process-list',
        name: 'Segmented Process List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use to break information into segments.',
        defaultShapes: 3,
        shapeType: 'segment',
        layout: 'segmented',
        thumbnail: 'segmented-process-list.svg'
    },
    {
        id: 'circle-accent-list',
        name: 'Circle Accent List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use a circle as an accent for each point.',
        defaultShapes: 3,
        shapeType: 'circle-accent',
        layout: 'circle-list',
        thumbnail: 'circle-accent-list.svg'
    },
    {
        id: 'hexagon-list',
        name: 'Hexagon List',
        category: SMARTART_CATEGORIES.LIST,
        description: 'Use hexagonal shapes for each point.',
        defaultShapes: 3,
        shapeType: 'hexagon',
        layout: 'hexagon-list',
        thumbnail: 'hexagon-list.svg'
    },
];

// 2. PROCESS SMARTART LAYOUTS
export const PROCESS_LAYOUTS = [
    {
        id: 'basic-process',
        name: 'Basic Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show a progression or sequential steps in a task, process, or workflow.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'horizontal-flow',
        hasConnectors: true,
        thumbnail: 'basic-process.svg'
    },
    {
        id: 'chevron-process',
        name: 'Chevron Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show a progression through several steps using chevron shapes.',
        defaultShapes: 3,
        shapeType: 'chevron',
        layout: 'chevron-flow',
        hasConnectors: false,
        thumbnail: 'chevron-process.svg'
    },
    {
        id: 'circular-process',
        name: 'Circular Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show a continuing sequence of stages in a circular flow.',
        defaultShapes: 4,
        shapeType: 'circle',
        layout: 'circular',
        hasConnectors: true,
        thumbnail: 'circular-process.svg'
    },
    {
        id: 'repeated-process',
        name: 'Repeated Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show a looping or repeating process.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'loop',
        hasConnectors: true,
        thumbnail: 'repeated-process.svg'
    },
    {
        id: 'step-up-process',
        name: 'Step Up Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show steps that increase upward like stairs.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'step-up',
        hasConnectors: true,
        thumbnail: 'step-up-process.svg'
    },
    {
        id: 'step-down-process',
        name: 'Step Down Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show steps that go downward.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'step-down',
        hasConnectors: true,
        thumbnail: 'step-down-process.svg'
    },
    {
        id: 'process-arrows',
        name: 'Process Arrows',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show arrows showing linear flow.',
        defaultShapes: 3,
        shapeType: 'arrow',
        layout: 'arrow-flow',
        hasConnectors: false,
        thumbnail: 'process-arrows.svg'
    },
    {
        id: 'vertical-process',
        name: 'Vertical Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show vertically stacked steps.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'vertical-flow',
        hasConnectors: true,
        thumbnail: 'vertical-process.svg'
    },
    {
        id: 'alternating-flow',
        name: 'Alternating Flow',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show steps that alternate left and right.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'alternating',
        hasConnectors: true,
        thumbnail: 'alternating-flow.svg'
    },
    {
        id: 'multistep-process',
        name: 'Multistep Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show multiple sub-steps.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'multi-step',
        hasConnectors: true,
        thumbnail: 'multistep-process.svg'
    },
    {
        id: 'phased-process',
        name: 'Phased Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show a process divided into phases.',
        defaultShapes: 3,
        shapeType: 'phase',
        layout: 'phased',
        hasConnectors: false,
        thumbnail: 'phased-process.svg'
    },
    {
        id: 'process-list',
        name: 'Process List',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show a list of steps.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'process-list',
        hasConnectors: true,
        thumbnail: 'process-list.svg'
    },
    {
        id: 'accent-process',
        name: 'Accent Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use for special highlighting of one step.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'accent-flow',
        hasConnectors: true,
        thumbnail: 'accent-process.svg'
    },
    {
        id: 'bending-process',
        name: 'Bending Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show a curved workflow line.',
        defaultShapes: 3,
        shapeType: 'rectangle',
        layout: 'curved-flow',
        hasConnectors: true,
        thumbnail: 'bending-process.svg'
    },
    {
        id: 'upward-arrow-process',
        name: 'Upward Arrow Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show steps climbing upwards.',
        defaultShapes: 3,
        shapeType: 'arrow',
        layout: 'upward-arrow',
        hasConnectors: false,
        thumbnail: 'upward-arrow-process.svg'
    },
    {
        id: 'circle-process',
        name: 'Circle Process',
        category: SMARTART_CATEGORIES.PROCESS,
        description: 'Use to show circular step relationship.',
        defaultShapes: 4,
        shapeType: 'circle',
        layout: 'circle-flow',
        hasConnectors: true,
        thumbnail: 'circle-process.svg'
    },
];

// 3. CYCLE SMARTART LAYOUTS
export const CYCLE_LAYOUTS = [
    {
        id: 'basic-cycle',
        name: 'Basic Cycle',
        category: SMARTART_CATEGORIES.CYCLE,
        description: 'Use to show a repeating cycle.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'basic-cycle',
        isCyclic: true,
        thumbnail: 'basic-cycle.svg'
    },
    {
        id: 'radial-cycle',
        name: 'Radial Cycle',
        category: SMARTART_CATEGORIES.CYCLE,
        description: 'Use to show center to surrounding steps.',
        defaultShapes: 5,
        shapeType: 'circle',
        layout: 'radial',
        isCyclic: true,
        thumbnail: 'radial-cycle.svg'
    },
    {
        id: 'multidirectional-cycle',
        name: 'Multidirectional Cycle',
        category: SMARTART_CATEGORIES.CYCLE,
        description: 'Use to show multiple directions around a cycle.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'multidirectional',
        isCyclic: true,
        thumbnail: 'multidirectional-cycle.svg'
    },
    {
        id: 'text-cycle',
        name: 'Text Cycle',
        category: SMARTART_CATEGORIES.CYCLE,
        description: 'Use to show text arranged in a circular pattern.',
        defaultShapes: 4,
        shapeType: 'text-box',
        layout: 'text-circular',
        isCyclic: true,
        thumbnail: 'text-cycle.svg'
    },
    {
        id: 'block-cycle',
        name: 'Block Cycle',
        category: SMARTART_CATEGORIES.CYCLE,
        description: 'Use to show blocks forming a circular cycle.',
        defaultShapes: 4,
        shapeType: 'block',
        layout: 'block-circular',
        isCyclic: true,
        thumbnail: 'block-cycle.svg'
    },
    {
        id: 'segmented-cycle',
        name: 'Segmented Cycle',
        category: SMARTART_CATEGORIES.CYCLE,
        description: 'Use to show a cycle divided into color sections.',
        defaultShapes: 4,
        shapeType: 'segment',
        layout: 'segmented-circular',
        isCyclic: true,
        thumbnail: 'segmented-cycle.svg'
    },
    {
        id: 'hexagon-cycle',
        name: 'Hexagon Cycle',
        category: SMARTART_CATEGORIES.CYCLE,
        description: 'Use to show a cycle made of hexagon shapes.',
        defaultShapes: 6,
        shapeType: 'hexagon',
        layout: 'hexagon-circular',
        isCyclic: true,
        thumbnail: 'hexagon-cycle.svg'
    },
];

// 4. HIERARCHY SMARTART LAYOUTS
export const HIERARCHY_LAYOUTS = [
    {
        id: 'organization-chart',
        name: 'Organization Chart',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show hierarchical relationships, such as department managers and employees.',
        defaultShapes: 5,
        shapeType: 'rectangle',
        layout: 'org-chart',
        supportsAssistants: true,
        thumbnail: 'organization-chart.svg'
    },
    {
        id: 'picture-organization-chart',
        name: 'Picture Organization Chart',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show hierarchical relationships with images.',
        defaultShapes: 5,
        shapeType: 'picture-box',
        layout: 'picture-org-chart',
        supportsAssistants: true,
        thumbnail: 'picture-organization-chart.svg'
    },
    {
        id: 'horizontal-organization-chart',
        name: 'Horizontal Organization Chart',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show a horizontal layout of hierarchy.',
        defaultShapes: 5,
        shapeType: 'rectangle',
        layout: 'horizontal-org',
        supportsAssistants: false,
        thumbnail: 'horizontal-organization-chart.svg'
    },
    {
        id: 'table-hierarchy',
        name: 'Table Hierarchy',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show a table style hierarchy.',
        defaultShapes: 4,
        shapeType: 'table-cell',
        layout: 'table-hierarchy',
        supportsAssistants: false,
        thumbnail: 'table-hierarchy.svg'
    },
    {
        id: 'labeled-hierarchy',
        name: 'Labeled Hierarchy',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show labels on each node.',
        defaultShapes: 4,
        shapeType: 'labeled-box',
        layout: 'labeled-hierarchy',
        supportsAssistants: false,
        thumbnail: 'labeled-hierarchy.svg'
    },
    {
        id: 'hierarchy-list',
        name: 'Hierarchy List',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show a list converted into hierarchy.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'hierarchy-list',
        supportsAssistants: false,
        thumbnail: 'hierarchy-list.svg'
    },
    {
        id: 'horizontal-hierarchy',
        name: 'Horizontal Hierarchy',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show linear parent-child structure.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'horizontal-hierarchy',
        supportsAssistants: false,
        thumbnail: 'horizontal-hierarchy.svg'
    },
    {
        id: 'vertical-hierarchy',
        name: 'Vertical Hierarchy',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show vertical parent-child.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'vertical-hierarchy',
        supportsAssistants: false,
        thumbnail: 'vertical-hierarchy.svg'
    },
    {
        id: 'circle-picture-hierarchy',
        name: 'Circle Picture Hierarchy',
        category: SMARTART_CATEGORIES.HIERARCHY,
        description: 'Use to show circular hierarchy with images.',
        defaultShapes: 5,
        shapeType: 'circle-picture',
        layout: 'circle-hierarchy',
        supportsAssistants: false,
        thumbnail: 'circle-picture-hierarchy.svg'
    },
];

// 5. RELATIONSHIP SMARTART LAYOUTS
export const RELATIONSHIP_LAYOUTS = [
    {
        id: 'basic-venn',
        name: 'Basic Venn',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show overlapping relationships.',
        defaultShapes: 3,
        shapeType: 'circle',
        layout: 'venn',
        thumbnail: 'basic-venn.svg'
    },
    {
        id: 'stacked-venn',
        name: 'Stacked Venn',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show Venn with multiple stacked layers.',
        defaultShapes: 4,
        shapeType: 'circle',
        layout: 'stacked-venn',
        thumbnail: 'stacked-venn.svg'
    },
    {
        id: 'radial-venn',
        name: 'Radial Venn',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show central idea with multiple circles.',
        defaultShapes: 5,
        shapeType: 'circle',
        layout: 'radial-venn',
        thumbnail: 'radial-venn.svg'
    },
    {
        id: 'target',
        name: 'Target',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show bullseye layers.',
        defaultShapes: 3,
        shapeType: 'circle',
        layout: 'target',
        thumbnail: 'target.svg'
    },
    {
        id: 'radial-list',
        name: 'Radial List',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show center with surrounding items.',
        defaultShapes: 5,
        shapeType: 'rectangle',
        layout: 'radial-list',
        thumbnail: 'radial-list.svg'
    },
    {
        id: 'cycle-matrix',
        name: 'Cycle Matrix',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show 4-quadrant cycle.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'cycle-matrix',
        thumbnail: 'cycle-matrix.svg'
    },
    {
        id: 'pyramid-list',
        name: 'Pyramid List',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show pyramid with text at levels.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'pyramid-list',
        thumbnail: 'pyramid-list.svg'
    },
    {
        id: 'basic-pyramid',
        name: 'Basic Pyramid',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show simple hierarchical pyramid.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'basic-pyramid',
        thumbnail: 'basic-pyramid.svg'
    },
    {
        id: 'segmented-pyramid',
        name: 'Segmented Pyramid',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use to show levels of pyramid separated.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'segmented-pyramid',
        thumbnail: 'segmented-pyramid.svg'
    },
    {
        id: 'funnel',
        name: 'Funnel',
        category: SMARTART_CATEGORIES.RELATIONSHIP,
        description: 'Use for filtering or narrowing processes.',
        defaultShapes: 4,
        shapeType: 'trapezoid',
        layout: 'funnel',
        thumbnail: 'funnel.svg'
    },
];

// 6. MATRIX SMARTART LAYOUTS
export const MATRIX_LAYOUTS = [
    {
        id: 'basic-matrix',
        name: 'Basic Matrix',
        category: SMARTART_CATEGORIES.MATRIX,
        description: 'Use to show a 2×2 matrix.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: '2x2-matrix',
        thumbnail: 'basic-matrix.svg'
    },
    {
        id: 'grid-matrix',
        name: 'Grid Matrix',
        category: SMARTART_CATEGORIES.MATRIX,
        description: 'Use to show a rectangle grid.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'grid-matrix',
        thumbnail: 'grid-matrix.svg'
    },
    {
        id: 'titled-matrix',
        name: 'Titled Matrix',
        category: SMARTART_CATEGORIES.MATRIX,
        description: 'Use to show a matrix with titles.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'titled-matrix',
        thumbnail: 'titled-matrix.svg'
    },
    {
        id: 'cycle-matrix',
        name: 'Cycle Matrix',
        category: SMARTART_CATEGORIES.MATRIX,
        description: 'Use to show a matrix showing cycles.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'cycle-matrix',
        thumbnail: 'cycle-matrix.svg'
    },
    {
        id: 'list-matrix',
        name: 'List Matrix',
        category: SMARTART_CATEGORIES.MATRIX,
        description: 'Use to show a matrix with list formatting.',
        defaultShapes: 4,
        shapeType: 'rectangle',
        layout: 'list-matrix',
        thumbnail: 'list-matrix.svg'
    },
];

// 7. PYRAMID SMARTART LAYOUTS
export const PYRAMID_LAYOUTS = [
    {
        id: 'basic-pyramid',
        name: 'Basic Pyramid',
        category: SMARTART_CATEGORIES.PYRAMID,
        description: 'Use to show 3–5 layers.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'basic-pyramid',
        thumbnail: 'basic-pyramid.svg'
    },
    {
        id: 'segmented-pyramid',
        name: 'Segmented Pyramid',
        category: SMARTART_CATEGORIES.PYRAMID,
        description: 'Use to show levels separated visually.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'segmented-pyramid',
        thumbnail: 'segmented-pyramid.svg'
    },
    {
        id: 'inverted-pyramid',
        name: 'Inverted Pyramid',
        category: SMARTART_CATEGORIES.PYRAMID,
        description: 'Use to show broad top to narrow bottom.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'inverted-pyramid',
        thumbnail: 'inverted-pyramid.svg'
    },
    {
        id: 'pyramid-list',
        name: 'Pyramid List',
        category: SMARTART_CATEGORIES.PYRAMID,
        description: 'Use to show points arranged in pyramid format.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'pyramid-list',
        thumbnail: 'pyramid-list.svg'
    },
    {
        id: 'horizontal-pyramid',
        name: 'Horizontal Pyramid',
        category: SMARTART_CATEGORIES.PYRAMID,
        description: 'Use to show pyramid laid horizontally.',
        defaultShapes: 3,
        shapeType: 'trapezoid',
        layout: 'horizontal-pyramid',
        thumbnail: 'horizontal-pyramid.svg'
    },
];

// 8. PICTURE SMARTART LAYOUTS
export const PICTURE_LAYOUTS = [
    {
        id: 'picture-accent-list',
        name: 'Picture Accent List',
        category: SMARTART_CATEGORIES.PICTURE,
        description: 'Use to show images with text list.',
        defaultShapes: 3,
        shapeType: 'picture-accent',
        layout: 'picture-list',
        thumbnail: 'picture-accent-list.svg'
    },
    {
        id: 'continuous-picture-list',
        name: 'Continuous Picture List',
        category: SMARTART_CATEGORIES.PICTURE,
        description: 'Use to show a set of pictures with descriptions.',
        defaultShapes: 3,
        shapeType: 'picture-box',
        layout: 'continuous-picture',
        thumbnail: 'continuous-picture-list.svg'
    },
    {
        id: 'picture-strips',
        name: 'Picture Strips',
        category: SMARTART_CATEGORIES.PICTURE,
        description: 'Use to show film-strip like image layout.',
        defaultShapes: 3,
        shapeType: 'picture-strip',
        layout: 'picture-strips',
        thumbnail: 'picture-strips.svg'
    },
    {
        id: 'picture-grid',
        name: 'Picture Grid',
        category: SMARTART_CATEGORIES.PICTURE,
        description: 'Use to show a matrix of image placeholders.',
        defaultShapes: 4,
        shapeType: 'picture-cell',
        layout: 'picture-grid',
        thumbnail: 'picture-grid.svg'
    },
    {
        id: 'picture-hierarchy',
        name: 'Picture Hierarchy',
        category: SMARTART_CATEGORIES.PICTURE,
        description: 'Use to show hierarchy chart with images.',
        defaultShapes: 5,
        shapeType: 'picture-box',
        layout: 'picture-hierarchy',
        thumbnail: 'picture-hierarchy.svg'
    },
];

// 9. OTHER/SPECIAL SMARTART LAYOUTS
export const OTHER_LAYOUTS = [
    {
        id: 'gear-diagram',
        name: 'Gear Diagram',
        category: SMARTART_CATEGORIES.OTHER,
        description: 'Use to show interlocking gears.',
        defaultShapes: 3,
        shapeType: 'gear',
        layout: 'gear',
        thumbnail: 'gear-diagram.svg'
    },
    {
        id: 'arrow-loop',
        name: 'Arrow Loop',
        category: SMARTART_CATEGORIES.OTHER,
        description: 'Use to show looping arrows.',
        defaultShapes: 4,
        shapeType: 'arrow',
        layout: 'arrow-loop',
        thumbnail: 'arrow-loop.svg'
    },
    {
        id: 'circle-arrows',
        name: 'Circle Arrows',
        category: SMARTART_CATEGORIES.OTHER,
        description: 'Use to show circular arrow flow.',
        defaultShapes: 4,
        shapeType: 'arrow',
        layout: 'circle-arrows',
        thumbnail: 'circle-arrows.svg'
    },
    {
        id: 'diverging-arrows',
        name: 'Diverging Arrows',
        category: SMARTART_CATEGORIES.OTHER,
        description: 'Use to show arrows diverging from center.',
        defaultShapes: 3,
        shapeType: 'arrow',
        layout: 'diverging',
        thumbnail: 'diverging-arrows.svg'
    },
    {
        id: 'converging-arrows',
        name: 'Converging Arrows',
        category: SMARTART_CATEGORIES.OTHER,
        description: 'Use to show arrows converging to center.',
        defaultShapes: 3,
        shapeType: 'arrow',
        layout: 'converging',
        thumbnail: 'converging-arrows.svg'
    },
    {
        id: 'vertical-chevron-list',
        name: 'Vertical Chevron List',
        category: SMARTART_CATEGORIES.OTHER,
        description: 'Use to show vertical chevron arrangement.',
        defaultShapes: 3,
        shapeType: 'chevron',
        layout: 'vertical-chevron',
        thumbnail: 'vertical-chevron-list.svg'
    },
    {
        id: 'hexagon-cluster',
        name: 'Hexagon Cluster',
        category: SMARTART_CATEGORIES.OTHER,
        description: 'Use to show clustered hexagons.',
        defaultShapes: 7,
        shapeType: 'hexagon',
        layout: 'hexagon-cluster',
        thumbnail: 'hexagon-cluster.svg'
    },
];

// Combine all layouts
export const ALL_SMARTART_LAYOUTS = [
    ...LIST_LAYOUTS,
    ...PROCESS_LAYOUTS,
    ...CYCLE_LAYOUTS,
    ...HIERARCHY_LAYOUTS,
    ...RELATIONSHIP_LAYOUTS,
    ...MATRIX_LAYOUTS,
    ...PYRAMID_LAYOUTS,
    ...PICTURE_LAYOUTS,
    ...OTHER_LAYOUTS,
];

// Helper function to get layouts by category
export const getLayoutsByCategory = (category) => {
    if (category === SMARTART_CATEGORIES.ALL) {
        return ALL_SMARTART_LAYOUTS;
    }
    return ALL_SMARTART_LAYOUTS.filter(layout => layout.category === category);
};

// Helper function to get layout by ID
export const getLayoutById = (id) => {
    return ALL_SMARTART_LAYOUTS.find(layout => layout.id === id);
};
