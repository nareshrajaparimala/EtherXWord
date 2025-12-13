
export const CHART_CATEGORIES = {
    COLUMN: 'Column',
    LINE: 'Line',
    PIE: 'Pie',
    BAR: 'Bar',
    AREA: 'Area',
    SCATTER: 'X Y (Scatter)',
    STOCK: 'Stock',
    SURFACE: 'Surface',
    DOUGHNUT: 'Doughnut', // Often grouped with Pie in UI but sometimes separate. User listed Doughnut under Pie category in text, but in the screenshot it's separate? Wait, user text says "4. PIE CHARTS ... Subtypes: Doughnut". Screenshot shows Doughnut as separate category icon on left? No, screenshot shows "Doughnut" as a separate item in the list on the left? Let me check the screenshot uploaded_image_1765381653102.png if possible.
    // Actually, looking at standard Word, Doughnut is usually under Pie. BUT the user text says "5. Doughnut" under Pie.
    // HOWEVER, the user text also has "7. BUBBLE CHARTS" as a main category.
    // Let's stick to the User's text list of 11 categories:
    // 1. Column, 2. Bar, 3. Line, 4. Pie, 5. Area, 6. XY (Scatter), 7. Bubble, 8. Stock, 9. Surface, 10. Radar, 11. Combo.
    // Wait, the screenshot shows "Doughnut" and "Bubble" in the left sidebar. 
    // I will define categories based on the user's text list for structure, but might separate them if needed for UI matching.
    // User text list:
    // 1. Column
    // 2. Bar
    // 3. Line
    // 4. Pie (includes Doughnut)
    // 5. Area
    // 6. XY Scatter
    // 7. Bubble (User listed as 7)
    // 8. Stock
    // 9. Surface
    // 10. Radar
    // 11. Combo

    // Actually, looking at the screenshot provided by user:
    // Categories visible: Column, Line, Pie, Bar, Area, X Y (Scatter), Stock, Surface, Doughnut, Bubble, Radar.
    // So distinct categories in the UI sidebar: 
    // Column, Line, Pie, Bar, Area, X Y (Scatter), Stock, Surface, Doughnut, Bubble, Radar.
    // That's 11 categories. Combo is separate usually or at bottom.
    // I will use these 11 + Combo.

    BUBBLE: 'Bubble',
    DOUGHNUT: 'Doughnut', // Making it a top level for sidebar matching if needed, or sub if user wants. User text said "PIE ... Subtypes: Doughnut". But screenshot shows "Doughnut" in list. I'll follow screenshot for Sidebar Categories if possible, but user text says "COMPLETE CHART TYPES ... 11 main categories".
    // Let's look at user text again.
    // 1. Column
    // 2. Bar
    // 3. Line
    // 4. Pie
    // 5. Area
    // 6. XY
    // 7. Bubble
    // 8. Stock
    // 9. Surface
    // 10. Radar
    // 11. Combo
    // That is 11. Doughnut is listed as subtype of Pie in user text.
    // I made a mistake reading the screenshot? The screenshot shows "Doughnut" and "Bubble" and "Radar".
    // Let's follow the User's Text Structure because that's the "FULL, in-depth explanation".

    RADAR: 'Radar',
    COMBO: 'Combo'
};

export const CHART_TEMPLATES = [
    // 1. COLUMN CHARTS
    {
        id: 'clustered-column',
        name: 'Clustered Column',
        category: 'Column',
        description: 'Compare values across categories using vertical rectangles.',
        icon: 'clustered-column', // Will be used for thumbnail generation
        defaults: { type: 'bar', orientation: 'vertical', grouped: true }
    },
    {
        id: 'stacked-column',
        name: 'Stacked Column',
        category: 'Column',
        description: 'Compare the parts of a whole across categories.',
        icon: 'stacked-column',
        defaults: { type: 'bar', orientation: 'vertical', stacked: true }
    },
    {
        id: '100-stacked-column',
        name: '100% Stacked Column',
        category: 'Column',
        description: 'Compare the percentage that each value contributes to a total.',
        icon: '100-stacked-column',
        defaults: { type: 'bar', orientation: 'vertical', stacked: 'percent' }
    },
    {
        id: '3d-clustered-column',
        name: '3-D Clustered Column',
        category: 'Column',
        description: 'Compare values across categories using 3D vertical rectangles.',
        icon: '3d-clustered-column',
        defaults: { type: 'bar3d', orientation: 'vertical', grouped: true }
    },
    {
        id: '3d-stacked-column',
        name: '3-D Stacked Column',
        category: 'Column',
        description: 'Compare parts of a whole using 3D vertical rectangles.',
        icon: '3d-stacked-column',
        defaults: { type: 'bar3d', orientation: 'vertical', stacked: true }
    },
    {
        id: '3d-100-stacked-column',
        name: '3-D 100% Stacked Column',
        category: 'Column',
        description: 'Compare percentages using 3D vertical rectangles.',
        icon: '3d-100-stacked-column',
        defaults: { type: 'bar3d', orientation: 'vertical', stacked: 'percent' }
    },
    {
        id: '3d-column',
        name: '3-D Column',
        category: 'Column',
        description: 'Compare values using 3D perspective columns.',
        icon: '3d-column',
        defaults: { type: 'bar3d', orientation: 'vertical', perspective: true }
    },

    // 2. BAR CHARTS
    {
        id: 'clustered-bar',
        name: 'Clustered Bar',
        category: 'Bar',
        description: 'Compare values across categories using horizontal bars.',
        icon: 'clustered-bar',
        defaults: { type: 'bar', orientation: 'horizontal', grouped: true }
    },
    {
        id: 'stacked-bar',
        name: 'Stacked Bar',
        category: 'Bar',
        description: 'Compare parts of a whole across categories using horizontal bars.',
        icon: 'stacked-bar',
        defaults: { type: 'bar', orientation: 'horizontal', stacked: true }
    },
    {
        id: '100-stacked-bar',
        name: '100% Stacked Bar',
        category: 'Bar',
        description: 'Compare percentages using horizontal bars.',
        icon: '100-stacked-bar',
        defaults: { type: 'bar', orientation: 'horizontal', stacked: 'percent' }
    },
    {
        id: '3d-clustered-bar',
        name: '3-D Clustered Bar',
        category: 'Bar',
        description: 'Compare values using 3D horizontal bars.',
        icon: '3d-clustered-bar',
        defaults: { type: 'bar3d', orientation: 'horizontal', grouped: true }
    },
    {
        id: '3d-stacked-bar',
        name: '3-D Stacked Bar',
        category: 'Bar',
        description: 'Compare parts of a whole using 3D horizontal bars.',
        icon: '3d-stacked-bar',
        defaults: { type: 'bar3d', orientation: 'horizontal', stacked: true }
    },
    {
        id: '3d-100-stacked-bar',
        name: '3-D 100% Stacked Bar',
        category: 'Bar',
        description: 'Compare percentages using 3D horizontal bars.',
        icon: '3d-100-stacked-bar',
        defaults: { type: 'bar3d', orientation: 'horizontal', stacked: 'percent' }
    },

    // 3. LINE CHARTS
    {
        id: 'line',
        name: 'Line',
        category: 'Line',
        description: 'Show trends over time (years, months, and days) or categories.',
        icon: 'line',
        defaults: { type: 'line', markers: false }
    },
    {
        id: 'line-markers',
        name: 'Line with Markers',
        category: 'Line',
        description: 'Show trends over time with markers at each data value.',
        icon: 'line-markers',
        defaults: { type: 'line', markers: true }
    },
    {
        id: 'stacked-line',
        name: 'Stacked Line',
        category: 'Line',
        description: 'Show how parts exhibit the trend of the whole over time.',
        icon: 'stacked-line',
        defaults: { type: 'line', stacked: true, markers: false }
    },
    {
        id: 'stacked-line-markers',
        name: 'Stacked Line with Markers', // Added common variation
        category: 'Line',
        description: 'Stacked line with markers.',
        icon: 'stacked-line-markers',
        defaults: { type: 'line', stacked: true, markers: true }
    },
    {
        id: '100-stacked-line',
        name: '100% Stacked Line',
        category: 'Line',
        description: 'Show the percentage contribution to a trend over time.',
        icon: '100-stacked-line',
        defaults: { type: 'line', stacked: 'percent', markers: false }
    },
    {
        id: '100-stacked-line-markers',
        name: '100% Stacked Line with Markers',
        category: 'Line',
        description: '100% Stacked line with markers.',
        icon: '100-stacked-line-markers',
        defaults: { type: 'line', stacked: 'percent', markers: true }
    },
    {
        id: '3d-line',
        name: '3-D Line',
        category: 'Line',
        description: 'Show trends over time using a 3D ribbon.',
        icon: '3d-line',
        defaults: { type: 'line3d' }
    },

    // 4. PIE CHARTS
    {
        id: 'pie',
        name: 'Pie',
        category: 'Pie',
        description: 'Show how proportions of data contribute to the whole.',
        icon: 'pie',
        defaults: { type: 'pie' }
    },
    {
        id: '3d-pie',
        name: '3-D Pie',
        category: 'Pie',
        description: 'Show proportions using a 3D pie.',
        icon: '3d-pie',
        defaults: { type: 'pie3d' }
    },
    {
        id: 'pie-of-pie',
        name: 'Pie of Pie',
        category: 'Pie',
        description: 'Extract values from the main pie and combine them into a second pie.',
        icon: 'pie-of-pie',
        defaults: { type: 'pieOfPie' }
    },
    {
        id: 'bar-of-pie',
        name: 'Bar of Pie',
        category: 'Pie',
        description: 'Extract values from the main pie and combine them into a stacked bar.',
        icon: 'bar-of-pie',
        defaults: { type: 'barOfPie' }
    },
    {
        id: 'doughnut',
        name: 'Doughnut',
        category: 'Doughnut',
        description: 'Show how proportions of data contribute to the whole (allows multiple series).',
        icon: 'doughnut',
        defaults: { type: 'doughnut' }
    },

    // 5. AREA CHARTS
    {
        id: 'area',
        name: 'Area',
        category: 'Area',
        description: 'Plot the change over time and draw attention to the total value across a trend.',
        icon: 'area',
        defaults: { type: 'area', stacked: false }
    },
    {
        id: 'stacked-area',
        name: 'Stacked Area',
        category: 'Area',
        description: 'Show the relationship of parts to a whole over time.',
        icon: 'stacked-area',
        defaults: { type: 'area', stacked: true }
    },
    {
        id: '100-stacked-area',
        name: '100% Stacked Area',
        category: 'Area',
        description: 'Show the percentage contribution to a trend over time.',
        icon: '100-stacked-area',
        defaults: { type: 'area', stacked: 'percent' }
    },
    {
        id: '3d-area',
        name: '3-D Area',
        category: 'Area',
        description: 'Show the trend of values over time using a 3D effect.',
        icon: '3d-area',
        defaults: { type: 'area3d', stacked: false }
    },
    {
        id: '3d-stacked-area',
        name: '3-D Stacked Area',
        category: 'Area',
        description: 'Show appropriate trend of parts to a whole in 3D.',
        icon: '3d-stacked-area',
        defaults: { type: 'area3d', stacked: true }
    },
    {
        id: '3d-100-stacked-area',
        name: '3-D 100% Stacked Area',
        category: 'Area',
        description: 'Show percentage contribution in 3D.',
        icon: '3d-100-stacked-area',
        defaults: { type: 'area3d', stacked: 'percent' }
    },

    // 6. XY (SCATTER) CHARTS
    {
        id: 'scatter',
        name: 'Scatter',
        category: 'X Y (Scatter)',
        description: 'Compare pairs of values.',
        icon: 'scatter',
        defaults: { type: 'scatter', lines: false, markers: true }
    },
    {
        id: 'scatter-smooth',
        name: 'Scatter with Smooth Lines',
        category: 'X Y (Scatter)',
        description: 'Compare pairs of values with a smooth connecting line.',
        icon: 'scatter-smooth',
        defaults: { type: 'scatter', lines: 'smooth', markers: false }
    },
    {
        id: 'scatter-smooth-markers',
        name: 'Scatter with Smooth Lines and Markers',
        category: 'X Y (Scatter)',
        description: 'Compare pairs of values with smooth lines and markers.',
        icon: 'scatter-smooth-markers',
        defaults: { type: 'scatter', lines: 'smooth', markers: true }
    },
    {
        id: 'scatter-straight',
        name: 'Scatter with Straight Lines',
        category: 'X Y (Scatter)',
        description: 'Compare pairs of values with straight connecting lines.',
        icon: 'scatter-straight',
        defaults: { type: 'scatter', lines: 'straight', markers: false }
    },
    {
        id: 'scatter-straight-markers',
        name: 'Scatter with Straight Lines and Markers',
        category: 'X Y (Scatter)',
        description: 'Compare pairs of values with straight lines and markers.',
        icon: 'scatter-straight-markers',
        defaults: { type: 'scatter', lines: 'straight', markers: true }
    },

    // 7. BUBBLE CHARTS
    {
        id: 'bubble',
        name: 'Bubble',
        category: 'Bubble',
        description: 'Compare sets of three values (X, Y, and Size).',
        icon: 'bubble',
        defaults: { type: 'bubble', effect: 'flat' }
    },
    {
        id: '3d-bubble',
        name: '3-D Bubble',
        category: 'Bubble',
        description: 'Compare sets of three values using 3D bubbles.',
        icon: '3d-bubble',
        defaults: { type: 'bubble', effect: '3d' }
    },

    // 8. STOCK CHARTS
    {
        id: 'high-low-close',
        name: 'High-Low-Close',
        category: 'Stock',
        description: 'Requires three series of values in this order: High, Low, Close.',
        icon: 'high-low-close',
        defaults: { type: 'stock', subtype: 'hlc' }
    },
    {
        id: 'open-high-low-close',
        name: 'Open-High-Low-Close',
        category: 'Stock',
        description: 'Requires four series of values in this order: Open, High, Low, Close.',
        icon: 'open-high-low-close',
        defaults: { type: 'stock', subtype: 'ohlc' }
    },
    {
        id: 'volume-high-low-close',
        name: 'Volume-High-Low-Close',
        category: 'Stock',
        description: 'Requires four series: Volume, High, Low, Close.',
        icon: 'volume-high-low-close',
        defaults: { type: 'stock', subtype: 'vhlc' }
    },
    {
        id: 'volume-open-high-low-close',
        name: 'Volume-Open-High-Low-Close',
        category: 'Stock',
        description: 'Requires five series: Volume, Open, High, Low, Close.',
        icon: 'volume-open-high-low-close',
        defaults: { type: 'stock', subtype: 'vohlc' }
    },

    // 9. SURFACE CHARTS
    {
        id: '3d-surface',
        name: '3-D Surface',
        category: 'Surface',
        description: 'Shows trends in values across two dimensions in a continuous curve.',
        icon: '3d-surface',
        defaults: { type: 'surface', view: '3d', wireframe: false }
    },
    {
        id: 'wireframe-3d-surface',
        name: 'Wireframe 3-D Surface',
        category: 'Surface',
        description: 'Shows trends in values across two dimensions as a transparent 3D wireframe.',
        icon: 'wireframe-3d-surface',
        defaults: { type: 'surface', view: '3d', wireframe: true }
    },
    {
        id: 'contour',
        name: 'Contour',
        category: 'Surface',
        description: 'Top-down view of the 3D surface chart (like a topographic map).',
        icon: 'contour',
        defaults: { type: 'surface', view: 'top', wireframe: false }
    },
    {
        id: 'wireframe-contour',
        name: 'Wireframe Contour',
        category: 'Surface',
        description: 'Top-down view of the wireframe 3D surface chart.',
        icon: 'wireframe-contour',
        defaults: { type: 'surface', view: 'top', wireframe: true }
    },

    // 10. RADAR CHARTS
    {
        id: 'radar',
        name: 'Radar',
        category: 'Radar',
        description: 'Display changes in values relative to a center point.',
        icon: 'radar',
        defaults: { type: 'radar', filled: false, markers: false }
    },
    {
        id: 'radar-markers',
        name: 'Radar with Markers',
        category: 'Radar',
        description: 'Radar chart with data point markers.',
        icon: 'radar-markers',
        defaults: { type: 'radar', filled: false, markers: true }
    },
    {
        id: 'filled-radar',
        name: 'Filled Radar',
        category: 'Radar',
        description: 'Radar chart where the area covered by the data series is filled.',
        icon: 'filled-radar',
        defaults: { type: 'radar', filled: true, markers: false }
    },

    // 11. COMBO CHARTS
    {
        id: 'clustered-column-line',
        name: 'Clustered Column - Line',
        category: 'Combo',
        description: 'Highlight different types of information. Combine a column chart with a line chart.',
        icon: 'clustered-column-line',
        defaults: { type: 'combo', series1: 'column', series2: 'line' }
    },
    {
        id: 'clustered-column-line-secondary',
        name: 'Clustered Column - Line on Secondary Axis',
        category: 'Combo',
        description: 'Combine a column chart with a line chart, using a secondary axis for the line.',
        icon: 'clustered-column-line-secondary',
        defaults: { type: 'combo', series1: 'column', series2: 'line', secondary: true }
    },
    {
        id: 'stacked-area-column',
        name: 'Stacked Area - Clustered Column',
        category: 'Combo',
        description: 'Combine a stacked area chart with a clustered column chart.',
        icon: 'stacked-area-column',
        defaults: { type: 'combo', series1: 'area-stacked', series2: 'column' }
    },
    {
        id: 'custom-combo',
        name: 'Custom Combination',
        category: 'Combo',
        description: 'Select the chart type and axis for each data series.',
        icon: 'custom-combo',
        defaults: { type: 'combo', custom: true }
    }
];
