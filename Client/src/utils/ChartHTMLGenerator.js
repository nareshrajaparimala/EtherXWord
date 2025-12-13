
import { ChartDataParser } from './ChartDataParser';

// Utility to generate HTML for Charts dynamically based on data
export const generateChartHTML = (chart, providedData = null) => {
    // 1. Get Data (provided or default)
    const data = providedData || ChartDataParser.getDefaultData();
    const { categories, series } = data;

    const type = chart.defaults.type;
    const is3D = type.includes('3d');
    const width = 600;
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    let svgContent = '';

    // Helpers
    const getMaxValue = () => {
        let max = 0;
        series.forEach(s => {
            s.data.forEach(v => max = Math.max(max, v));
        });
        return max * 1.1; // Add 10% padding
    };

    // For stacked charts, we need max of sums
    const getMaxStackedValue = () => {
        let max = 0;
        for (let i = 0; i < categories.length; i++) {
            let sum = 0;
            series.forEach(s => sum += s.data[i] || 0);
            max = Math.max(max, sum);
        }
        return max * 1.1;
    };

    const maxVal = (chart.defaults.stacked && chart.defaults.stacked !== 'percent') ? getMaxStackedValue() : getMaxValue();

    // Scale functions
    const scaleY = (val) => chartHeight - ((val / maxVal) * chartHeight);
    const scaleX = (index) => (index / categories.length) * chartWidth;
    const colWidth = (chartWidth / categories.length) * 0.6; // 60% bar width

    // Axis Generators
    const renderAxes = () => {
        let axes = '';
        // Y Axis
        axes += `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#666" stroke-width="2" />`;
        // X Axis
        axes += `<line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#666" stroke-width="2" />`;

        // Y Ticks (approx 5 ticks)
        for (let i = 0; i <= 5; i++) {
            const val = (maxVal / 5) * i;
            const y = scaleY(val) + margin.top;
            if (!isNaN(y)) {
                axes += `<line x1="${margin.left - 5}" y1="${y}" x2="${margin.left}" y2="${y}" stroke="#666" />`;
                axes += `<text x="${margin.left - 10}" y="${y + 5}" text-anchor="end" font-size="12" fill="#666">${Math.round(val)}</text>`;
            }
        }

        // X Labels
        categories.forEach((cat, i) => {
            const x = margin.left + scaleX(i) + (colWidth / 2) + ((chartWidth / categories.length - colWidth) / 2);
            axes += `<text x="${x}" y="${height - margin.bottom + 20}" text-anchor="middle" font-size="12" fill="#666">${cat}</text>`;
        });

        // Grid lines
        for (let i = 1; i <= 5; i++) {
            const val = (maxVal / 5) * i;
            const y = scaleY(val) + margin.top;
            axes += `<line x1="${margin.left}" y1="${y}" x2="${width - margin.right}" y2="${y}" stroke="#eee" stroke-dasharray="4" />`;
        }

        return axes;
    };

    // --- Render Logic per Type ---

    if (type === 'bar' || type === 'bar3d') {
        const isHorizontal = chart.defaults.orientation === 'horizontal';

        if (isHorizontal) {
            // Horizontal Bar Logic Scale Swap
            const scaleXHorz = (val) => ((val / maxVal) * chartWidth);
            const barH = (chartHeight / categories.length) * 0.6;

            // Y Axis Line (Vertical now category axis)
            svgContent += `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${height - margin.bottom}" stroke="#666" stroke-width="2" />`;
            // X Axis Line (Horizontal now value axis)
            svgContent += `<line x1="${margin.left}" y1="${height - margin.bottom}" x2="${width - margin.right}" y2="${height - margin.bottom}" stroke="#666" stroke-width="2" />`;

            categories.forEach((cat, i) => {
                const ySlot = margin.top + (i * (chartHeight / categories.length));
                const y = ySlot + ((chartHeight / categories.length - barH) / 2);

                // Label
                svgContent += `<text x="${margin.left - 10}" y="${y + barH / 2 + 4}" text-anchor="end" font-size="12" fill="#666">${cat}</text>`;

                let xOffset = margin.left;

                series.forEach((s, sIdx) => {
                    const val = s.data[i] || 0;
                    const barW = scaleXHorz(val);

                    if (chart.defaults.stacked) {
                        svgContent += `<rect x="${xOffset}" y="${y}" width="${barW}" height="${barH}" fill="${s.color}" />`;
                        xOffset += barW;
                    } else {
                        // Clustered
                        const groupH = barH / series.length;
                        const subY = y + (sIdx * groupH);
                        svgContent += `<rect x="${margin.left}" y="${subY}" width="${barW}" height="${groupH}" fill="${s.color}" />`;
                    }
                });
            });

        } else {
            // Vertical Column (Standard)
            svgContent += renderAxes();

            categories.forEach((cat, i) => {
                const xSlot = margin.left + scaleX(i);
                // Center the grouping in the slot
                const slotWidth = chartWidth / categories.length;

                let yOffset = height - margin.bottom;

                series.forEach((s, sIdx) => {
                    const val = s.data[i] || 0;
                    const barH = (val / maxVal) * chartHeight;

                    if (chart.defaults.stacked) {
                        const y = yOffset - barH;
                        svgContent += `<rect x="${xSlot + (slotWidth - colWidth) / 2}" y="${y}" width="${colWidth}" height="${barH}" fill="${s.color}" />`;
                        yOffset -= barH;
                    } else {
                        // Clustered
                        const groupW = colWidth / series.length;
                        const subX = xSlot + (slotWidth - colWidth) / 2 + (sIdx * groupW);
                        const y = scaleY(val) + margin.top;
                        svgContent += `<rect x="${subX}" y="${y}" width="${groupW}" height="${barH}" fill="${s.color}" />`;
                    }
                });
            });
        }
    } else if (type === 'line' || type === 'line3d') {
        svgContent += renderAxes();

        series.forEach((s, sIdx) => {
            const points = s.data.map((val, i) => {
                const x = margin.left + scaleX(i) + ((chartWidth / categories.length) / 2); // center on tick
                const y = scaleY(val) + margin.top;
                return `${x},${y}`;
            }).join(' ');

            svgContent += `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="3" />`;

            // Markers
            if (chart.defaults.markers) {
                s.data.forEach((val, i) => {
                    const x = margin.left + scaleX(i) + ((chartWidth / categories.length) / 2);
                    const y = scaleY(val) + margin.top;
                    svgContent += `<circle cx="${x}" cy="${y}" r="4" fill="${s.color}" stroke="white" stroke-width="2" />`;
                });
            }
        });

    } else if (['pie', 'pie3d', 'doughnut', 'pieOfPie', 'barOfPie'].includes(type)) {
        // Pie Logic
        const cx = width / 2;
        const cy = height / 2;
        const r = Math.min(chartWidth, chartHeight) / 2.5;

        // Use first series for Pie usually
        const pieSeries = series[0];
        const total = pieSeries.data.reduce((sum, v) => sum + v, 0);

        let startAngle = 0;

        const isDoughnut = type === 'doughnut';

        if (type === 'pieOfPie' || type === 'barOfPie') {
            // Split logic: take last 2 items for second plot
            // Main pie gets (N-2) items + sum of last 2
            const mainData = pieSeries.data.slice(0, pieSeries.data.length - 2);
            const subData = pieSeries.data.slice(pieSeries.data.length - 2);
            const subTotal = subData.reduce((a, b) => a + b, 0);
            mainData.push(subTotal); // The "Other" slice

            // --- Render Main Pie (Left) ---
            const cx1 = width * 0.35;
            const r1 = r * 0.9;
            let angle1 = 0;

            mainData.forEach((val, idx) => {
                const sliceAngle = (val / total) * 2 * Math.PI;
                const x1 = cx1 + r1 * Math.sin(angle1);
                const y1 = cy + r1 * -Math.cos(angle1);
                const x2 = cx1 + r1 * Math.sin(angle1 + sliceAngle);
                const y2 = cy + r1 * -Math.cos(angle1 + sliceAngle);

                const largeArc = sliceAngle > Math.PI ? 1 : 0;

                const path = `M${cx1},${cy} L${x1},${y1} A${r1},${r1} 0 ${largeArc},1 ${x2},${y2} Z`;

                let color = idx < mainData.length - 1 ? pieSeries.color : '#ccc'; // Inherit or gray for "Other"
                // Use category colors effectively
                const catCols = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];
                color = catCols[idx % catCols.length];
                if (idx === mainData.length - 1) color = '#ddd'; // The "Compound" slice

                svgContent += `<path d="${path}" fill="${color}" stroke="white" stroke-width="1" />`;
                angle1 += sliceAngle;
            });

            // --- Render Sub Plot (Right: Pie or Bar) ---
            if (type === 'pieOfPie') {
                const cx2 = width * 0.75;
                const r2 = r1 * 0.6;
                let angle2 = 0;
                subData.forEach((val, idx) => {
                    const sliceAngle = (val / subTotal) * 2 * Math.PI;
                    const x1 = cx2 + r2 * Math.sin(angle2);
                    const y1 = cy + r2 * -Math.cos(angle2);
                    const x2 = cx2 + r2 * Math.sin(angle2 + sliceAngle);
                    const y2 = cy + r2 * -Math.cos(angle2 + sliceAngle);
                    const largeArc = sliceAngle > Math.PI ? 1 : 0;
                    const path = `M${cx2},${cy} L${x1},${y1} A${r2},${r2} 0 ${largeArc},1 ${x2},${y2} Z`;

                    // Connectors lines from Main 'Other' slice to Sub Pie
                    // Simplified: just draw lines from center bound? No, too complex for purely manual SVG without library.
                    // Just render the chart.

                    const catCols = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];
                    // Continue colors
                    let color = catCols[(mainData.length - 1 + idx) % catCols.length];

                    svgContent += `<path d="${path}" fill="${color}" stroke="white" stroke-width="1" />`;
                    angle2 += sliceAngle;
                });
                // Connectors lines (Cosmetic)
                svgContent += `<line x1="${cx1 + r1}" y1="${cy - 10}" x2="${cx2 - r2}" y2="${cy - r2}" stroke="#999" stroke-width="1" />`;
                svgContent += `<line x1="${cx1 + r1}" y1="${cy + 10}" x2="${cx2 - r2}" y2="${cy + r2}" stroke="#999" stroke-width="1" />`;

            } else {
                // Bar of Pie
                const bx = width * 0.7;
                const by = cy - r1 + 20;
                const bw = r1 * 0.6;
                const bh = r1 * 1.5;

                let currentY = by;

                subData.forEach((val, idx) => {
                    const h = (val / subTotal) * bh;
                    const catCols = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];
                    let color = catCols[(mainData.length - 1 + idx) % catCols.length];

                    svgContent += `<rect x="${bx}" y="${currentY}" width="${bw}" height="${h}" fill="${color}" stroke="white" />`;
                    currentY += h;
                });
                // Connectors
                svgContent += `<line x1="${cx1 + r1}" y1="${cy - 10}" x2="${bx}" y2="${by}" stroke="#999" stroke-width="1" />`;
                svgContent += `<line x1="${cx1 + r1}" y1="${cy + 10}" x2="${bx}" y2="${by + bh}" stroke="#999" stroke-width="1" />`;
            }

        } else {
            // Standard Pie / Doughnut
            pieSeries.data.forEach((val, idx) => {
                const sliceAngle = (val / total) * 2 * Math.PI;

                // Calculate path
                // Start point
                const x1 = cx + r * Math.sin(startAngle);
                const y1 = cy + r * -Math.cos(startAngle);
                // End point
                const x2 = cx + r * Math.sin(startAngle + sliceAngle);
                const y2 = cy + r * -Math.cos(startAngle + sliceAngle);

                const largeArc = sliceAngle > Math.PI ? 1 : 0;

                // Move to center, Line to start, Arc to end, Close
                const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`;

                // Colors (Use inherited or cycle)
                const catCols = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#264478', '#9E480E'];
                const color = pieSeries.color ? pieSeries.color : catCols[idx % catCols.length];

                svgContent += `<path d="${path}" fill="${color}" stroke="white" stroke-width="1" />`;

                startAngle += sliceAngle;
            });

            if (isDoughnut) {
                svgContent += `<circle cx="${cx}" cy="${cy}" r="${r * 0.5}" fill="white" />`;
            }
        }
    } else {
        // Fallback for others (Area, Scatter, etc - Keeping static placeholder for now as requested focused on Bar/Pie/Column/Line dynamic first)
        // Or implement simplified dynamic logic if possible?
        // Let's at least render a text saying "Dynamic [Type] Not Implemented Yet" but showing defaults.
        // Actually, user said "charts must work according to data".

        // Let's implement Area simplistically (like Line but closed)
        if (type === 'area' || type === 'area3d') {
            svgContent += renderAxes();
            series.forEach((s, sIdx) => {
                let points = `${margin.left},${height - margin.bottom} `; // Start bottom-left
                points += s.data.map((val, i) => {
                    const x = margin.left + scaleX(i) + ((chartWidth / categories.length) / 2);
                    const y = scaleY(val) + margin.top;
                    return `${x},${y}`;
                }).join(' ');
                points += ` ${width - margin.right},${height - margin.bottom}`; // Close to bottom-right

                svgContent += `<polygon points="${points}" fill="${s.color}" opacity="0.6" stroke="${s.color}" stroke-width="2" />`;
            });
        }
    }

    // Legend
    if (series.length > 1 || type.includes('pie')) {
        let legendX = margin.left;
        const legendY = height - 20;

        if (type.includes('pie') || type.includes('doughnut') || type.includes('ofPie')) {
            // Pie legend is Categories
            categories.forEach((cat, i) => {
                const catCols = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47'];
                const color = catCols[i % catCols.length];
                svgContent += `<rect x="${legendX}" y="${legendY}" width="10" height="10" fill="${color}" />`;
                svgContent += `<text x="${legendX + 15}" y="${legendY + 9}" font-size="10" fill="#333">${cat}</text>`;
                legendX += 80; // approximate width
            });
        } else {
            // Standard legend is Series
            series.forEach(s => {
                svgContent += `<rect x="${legendX}" y="${legendY}" width="10" height="10" fill="${s.color}" />`;
                svgContent += `<text x="${legendX + 15}" y="${legendY + 9}" font-size="10" fill="#333">${s.name}</text>`;
                legendX += 80;
            });
        }
    }

    return `<div class="chart-container" data-chart-id="${chart.id}" contenteditable="false" style="display: inline-block; margin: 10px; text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: white; border: 1px solid #ddd;">
            ${svgContent}
        </svg>
        <div style="font-size: 0.9em; margin-top: 5px; color: #555;">${chart.name}</div>
    </div>`;
};
