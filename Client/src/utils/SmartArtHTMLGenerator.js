// SmartArt HTML Generation Utility - Complete Implementation
// Generates HTML for ALL 71+ SmartArt layouts

export const generateSmartArtHTML = (layout, textItems, colors) => {
    const c = colors;
    const layoutType = layout.layout;
    let html = `<div class="smartart-container" data-layout="${layout.id}" style="margin: 20px 0; padding: 20px; text-align: center;">`;

    // LIST LAYOUTS
    if (layout.category === 'List') {
        switch (layoutType) {
            case 'vertical-blocks':
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 10px auto; border-radius: 5px; max-width: 400px; font-weight: bold;">${text}</div>`;
                });
                break;

            case 'vertical-list':
                textItems.forEach((text, i) => {
                    html += `<div style="display: flex; align-items: center; gap: 8px; margin: 8px auto; max-width: 400px;">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: ${c[i % c.length]};"></span>
                        <span style="color: #333; font-weight: 500;">${text}</span>
                    </div>`;
                });
                break;

            case 'horizontal-list':
                html += '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background: ${c[i % c.length]};"></span>
                        <span style="color: #333; font-weight: 500;">${text}</span>
                    </div>`;
                });
                html += '</div>';
                break;

            case 'picture-list':
            case 'vertical-picture':
                textItems.forEach((text, i) => {
                    html += `<div style="display: flex; align-items: center; gap: 20px; margin: 15px auto; max-width: 500px;">
                        <div style="width: 100px; height: 100px; background: ${c[i % c.length]}; border-radius: 8px; flex-shrink: 0; opacity: 0.5;"></div>
                        <div>
                            <div style="color: #333; font-weight: bold; font-size: 16px; margin-bottom: 5px;">${text}</div>
                            <div style="color: #666; font-size: 12px;">Description text</div>
                        </div>
                    </div>`;
                });
                break;

            case 'stacked':
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 30px; margin: ${i * 5}px auto ${i * 5}px ${i * 10}px; border-radius: 5px; max-width: 350px; font-weight: bold;">${text}</div>`;
                });
                break;

            case 'vertical-boxes':
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 20px; margin: 10px auto; border-radius: 8px; max-width: 200px; font-weight: bold; text-align: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${text}</div>`;
                });
                break;

            case 'horizontal-boxes':
                html += '<div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 20px; border-radius: 8px; min-width: 120px; font-weight: bold; text-align: center; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'grouped':
                html += `<div style="background: ${c[0]}; color: white; padding: 15px; margin: 10px auto; border-radius: 5px; max-width: 500px; font-weight: bold;">${textItems[0] || 'Group Title'}</div>`;
                html += '<div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap; margin-top: 15px;">';
                for (let i = 1; i < textItems.length; i++) {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px 20px; border-radius: 5px; font-weight: bold;">${textItems[i]}</div>`;
                }
                html += '</div>';
                break;

            case 'tabbed':
                html += '<div style="display: flex; gap: 5px; justify-content: center; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="position: relative; background: ${c[i % c.length]}; color: white; padding: 15px 20px; border-radius: 5px 5px 0 0; font-weight: bold; min-width: 100px; text-align: center;">
                        <div style="position: absolute; top: -10px; left: 10px; right: 10px; height: 10px; background: ${c[i % c.length]}; border-radius: 5px 5px 0 0;"></div>
                        ${text}
                    </div>`;
                });
                html += '</div>';
                break;

            case 'table':
                const cols = Math.ceil(Math.sqrt(textItems.length));
                html += `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 10px; max-width: 500px; margin: 0 auto;">`;
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 20px; border-radius: 5px; text-align: center; font-weight: bold; border: 2px solid white;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'segmented':
                html += '<div style="display: flex; justify-content: center; align-items: center; gap: 5px; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 25px; clip-path: polygon(0 0, 90% 0, 100% 50%, 90% 100%, 0 100%, 10% 50%); font-weight: bold; min-width: 120px; text-align: center;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'circle-list':
                textItems.forEach((text, i) => {
                    html += `<div style="display: flex; align-items: center; gap: 15px; margin: 15px auto; max-width: 500px;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; background: ${c[i % c.length]}; flex-shrink: 0;"></div>
                        <div style="color: #333; font-weight: bold; flex: 1;">${text}</div>
                    </div>`;
                });
                break;

            case 'hexagon-list':
                textItems.forEach((text, i) => {
                    html += `<div style="display: flex; align-items: center; gap: 15px; margin: 15px auto; max-width: 500px;">
                        <div style="width: 50px; height: 50px; background: ${c[i % c.length]}; clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%); flex-shrink: 0;"></div>
                        <div style="color: #333; font-weight: bold; flex: 1;">${text}</div>
                    </div>`;
                });
                break;

            default:
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px 20px; margin: 8px auto; border-radius: 5px; max-width: 300px;">${text}</div>`;
                });
        }
    }

    // PROCESS LAYOUTS
    else if (layout.category === 'Process') {
        switch (layoutType) {
            case 'horizontal-flow':
                html += '<div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 20px; border-radius: 5px; font-weight: bold;">${text}</div>`;
                    if (i < textItems.length - 1) {
                        html += '<div style="font-size: 24px; color: #666;">→</div>';
                    }
                });
                html += '</div>';
                break;

            case 'vertical-flow':
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 10px auto; border-radius: 5px; max-width: 250px; font-weight: bold;">${text}</div>`;
                    if (i < textItems.length - 1) {
                        html += '<div style="font-size: 24px; color: #666; text-align: center;">↓</div>';
                    }
                });
                break;

            case 'chevron-flow':
                html += '<div style="display: flex; justify-content: center; align-items: center; gap: 5px; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 25px; clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%, 15% 50%); font-weight: bold;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'step-up':
            case 'step-down':
                const isUp = layoutType === 'step-up';
                html += '<div style="display: flex; align-items: flex-end; justify-content: center; gap: 10px;">';
                textItems.forEach((text, i) => {
                    const height = isUp ? (i + 1) * 50 : (textItems.length - i) * 50;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; border-radius: 5px; height: ${height}px; display: flex; align-items: center; justify-content: center; min-width: 80px; font-weight: bold;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'alternating':
                textItems.forEach((text, i) => {
                    const align = i % 2 === 0 ? 'flex-start' : 'flex-end';
                    html += `<div style="display: flex; justify-content: ${align}; margin: 10px 0;">
                        <div style="background: ${c[i % c.length]}; color: white; padding: 15px 25px; border-radius: 5px; max-width: 300px; font-weight: bold;">${text}</div>
                    </div>`;
                });
                break;

            case 'circular':
                html += '<div style="position: relative; width: 400px; height: 400px; margin: 0 auto;">';
                textItems.forEach((text, i) => {
                    const angle = (i * 360 / textItems.length) * Math.PI / 180;
                    const x = 200 + 120 * Math.cos(angle);
                    const y = 200 + 120 * Math.sin(angle);
                    html += `<div style="position: absolute; left: ${x - 50}px; top: ${y - 25}px; background: ${c[i % c.length]}; color: white; padding: 10px 15px; border-radius: 5px; width: 100px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                html += '<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font-size: 80px; color: #ccc; opacity: 0.3;">↻</div>';
                html += '</div>';
                break;

            case 'loop':
                html += '<div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap; position: relative;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 20px; border-radius: 5px; font-weight: bold;">${text}</div>`;
                    if (i < textItems.length - 1) {
                        html += '<div style="font-size: 24px; color: #666;">→</div>';
                    }
                });
                html += '<div style="position: absolute; top: -30px; right: 20px; font-size: 30px; color: #666;">↰</div>';
                html += '</div>';
                break;

            case 'arrow-flow':
                html += '<div style="display: flex; justify-content: center; align-items: center; gap: 5px; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 25px; clip-path: polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%); font-weight: bold; min-width: 120px; text-align: center;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'upward-arrow':
                html += '<div style="position: relative; width: 300px; height: 400px; margin: 0 auto;">';
                html += '<div style="position: absolute; left: 50%; bottom: 0; transform: translateX(-50%); width: 0; height: 0; border-left: 100px solid transparent; border-right: 100px solid transparent; border-bottom: 350px solid ' + c[0] + '; opacity: 0.3;"></div>';
                textItems.forEach((text, i) => {
                    const y = 300 - i * 80;
                    html += `<div style="position: absolute; left: 50%; top: ${y}px; transform: translateX(-50%); background: ${c[(i + 1) % c.length]}; color: white; padding: 12px 20px; border-radius: 5px; font-weight: bold; z-index: 10;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'multi-step':
            case 'process-list':
            case 'accent-flow':
            case 'curved-flow':
            case 'circle-flow':
            case 'phased':
                // Similar to horizontal flow with variations
                html += '<div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 20px; border-radius: 5px; font-weight: bold;">${text}</div>`;
                    if (i < textItems.length - 1) {
                        html += '<div style="font-size: 20px; color: #666;">→</div>';
                    }
                });
                html += '</div>';
                break;

            default:
                html += '<div style="display: flex; justify-content: center; align-items: center; gap: 10px; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 20px; border-radius: 5px; font-weight: bold;">${text}</div>`;
                    if (i < textItems.length - 1) {
                        html += '<div style="font-size: 20px; color: #666;">→</div>';
                    }
                });
                html += '</div>';
        }
    }

    // CYCLE LAYOUTS
    else if (layout.category === 'Cycle') {
        switch (layoutType) {
            case 'basic-cycle':
            case 'radial':
            case 'multidirectional':
            case 'text-circular':
            case 'block-circular':
                html += '<div style="position: relative; width: 400px; height: 400px; margin: 0 auto;">';
                textItems.forEach((text, i) => {
                    const angle = (i * 360 / textItems.length) * Math.PI / 180;
                    const x = 200 + 120 * Math.cos(angle);
                    const y = 200 + 120 * Math.sin(angle);
                    html += `<div style="position: absolute; left: ${x - 50}px; top: ${y - 25}px; background: ${c[i % c.length]}; color: white; padding: 10px 15px; border-radius: 5px; width: 100px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                html += '<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; border: 3px dashed #ccc; border-radius: 50%;"></div>';
                html += '</div>';
                break;

            case 'segmented-circular':
                html += '<div style="position: relative; width: 300px; height: 300px; margin: 0 auto; border-radius: 50%; overflow: hidden; display: flex; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="flex: 1; min-width: 50%; background: ${c[i % c.length]}; color: white; display: flex; align-items: center; justify-content: center; padding: 20px; font-weight: bold; opacity: 0.8;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'hexagon-circular':
                html += '<div style="position: relative; width: 400px; height: 400px; margin: 0 auto;">';
                textItems.forEach((text, i) => {
                    const angle = (i * 360 / textItems.length) * Math.PI / 180;
                    const x = 200 + 120 * Math.cos(angle);
                    const y = 200 + 120 * Math.sin(angle);
                    html += `<div style="position: absolute; left: ${x - 40}px; top: ${y - 40}px; width: 80px; height: 80px; background: ${c[i % c.length]}; color: white; clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; text-align: center; padding: 10px;">${text}</div>`;
                });
                html += '</div>';
                break;

            default:
                html += '<div style="position: relative; width: 400px; height: 400px; margin: 0 auto;">';
                textItems.forEach((text, i) => {
                    const angle = (i * 360 / textItems.length) * Math.PI / 180;
                    const x = 200 + 120 * Math.cos(angle);
                    const y = 200 + 120 * Math.sin(angle);
                    html += `<div style="position: absolute; left: ${x - 50}px; top: ${y - 25}px; background: ${c[i % c.length]}; color: white; padding: 10px 15px; border-radius: 5px; width: 100px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                html += '</div>';
        }
    }

    // HIERARCHY LAYOUTS
    else if (layout.category === 'Hierarchy') {
        switch (layoutType) {
            case 'org-chart':
            case 'picture-org-chart':
            case 'horizontal-org':
                html += `<div style="background: ${c[0]}; color: white; padding: 15px; margin: 10px auto; border-radius: 5px; max-width: 200px; font-weight: bold;">${textItems[0] || 'Top Level'}</div>`;
                html += '<div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px; flex-wrap: wrap;">';
                for (let i = 1; i < Math.min(textItems.length, 4); i++) {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px 15px; border-radius: 5px; font-weight: bold;">${textItems[i]}</div>`;
                }
                html += '</div>';
                break;

            case 'vertical-hierarchy':
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 25px; margin: 10px auto; border-radius: 5px; max-width: 250px; font-weight: bold;">${text}</div>`;
                    if (i < textItems.length - 1) {
                        html += '<div style="font-size: 20px; color: #666; text-align: center;">↓</div>';
                    }
                });
                break;

            case 'horizontal-hierarchy':
                html += '<div style="display: flex; gap: 15px; justify-content: center; align-items: center; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 25px; border-radius: 5px; font-weight: bold;">${text}</div>`;
                    if (i < textItems.length - 1) {
                        html += '<div style="font-size: 20px; color: #666;">→</div>';
                    }
                });
                html += '</div>';
                break;

            case 'table-hierarchy':
                html += `<div style="background: ${c[0]}; color: white; padding: 15px; margin: 10px auto; border-radius: 5px; max-width: 500px; font-weight: bold; text-align: center;">${textItems[0] || 'Header'}</div>`;
                html += '<div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px; flex-wrap: wrap;">';
                for (let i = 1; i < textItems.length; i++) {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 30px 15px; border-radius: 5px; min-width: 100px; font-weight: bold; text-align: center; opacity: 0.8;">${textItems[i]}</div>`;
                }
                html += '</div>';
                break;

            case 'labeled-hierarchy':
            case 'hierarchy-list':
                textItems.forEach((text, i) => {
                    const indent = i * 20;
                    const width = 400 - indent;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px 20px; margin: 8px auto 8px ${indent}px; border-radius: 5px; max-width: ${width}px; font-weight: bold; opacity: ${1 - i * 0.15};">${text}</div>`;
                });
                break;

            case 'circle-hierarchy':
                html += `<div style="width: 80px; height: 80px; border-radius: 50%; background: ${c[0]}; color: white; margin: 10px auto; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${textItems[0] || 'Top'}</div>`;
                html += '<div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px; flex-wrap: wrap;">';
                for (let i = 1; i < textItems.length; i++) {
                    html += `<div style="width: 60px; height: 60px; border-radius: 50%; background: ${c[i % c.length]}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; text-align: center; padding: 5px;">${textItems[i]}</div>`;
                }
                html += '</div>';
                break;

            default:
                textItems.forEach((text, i) => {
                    const indent = i * 20;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px 20px; margin: 8px auto 8px ${indent}px; border-radius: 5px; max-width: ${400 - indent}px; font-weight: bold;">${text}</div>`;
                });
        }
    }

    // RELATIONSHIP LAYOUTS
    else if (layout.category === 'Relationship') {
        switch (layoutType) {
            case 'venn':
            case 'basic-venn':
                html += '<div style="position: relative; width: 300px; height: 200px; margin: 0 auto;">';
                html += `<div style="position: absolute; left: 50px; top: 50px; width: 120px; height: 120px; border-radius: 50%; background: ${c[0]}; opacity: 0.6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${textItems[0] || 'A'}</div>`;
                html += `<div style="position: absolute; left: 130px; top: 50px; width: 120px; height: 120px; border-radius: 50%; background: ${c[1]}; opacity: 0.6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${textItems[1] || 'B'}</div>`;
                html += '</div>';
                break;

            case 'stacked-venn':
                html += '<div style="position: relative; width: 300px; height: 250px; margin: 0 auto;">';
                html += `<div style="position: absolute; left: 90px; top: 20px; width: 120px; height: 120px; border-radius: 50%; background: ${c[0]}; opacity: 0.5; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${textItems[0] || 'A'}</div>`;
                html += `<div style="position: absolute; left: 40px; top: 90px; width: 120px; height: 120px; border-radius: 50%; background: ${c[1]}; opacity: 0.5; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${textItems[1] || 'B'}</div>`;
                html += `<div style="position: absolute; left: 140px; top: 90px; width: 120px; height: 120px; border-radius: 50%; background: ${c[2]}; opacity: 0.5; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${textItems[2] || 'C'}</div>`;
                html += '</div>';
                break;

            case 'radial-venn':
                html += '<div style="position: relative; width: 400px; height: 400px; margin: 0 auto;">';
                html += `<div style="position: absolute; left: 175px; top: 175px; width: 50px; height: 50px; border-radius: 50%; background: ${c[0]}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; z-index: 10;">Center</div>`;
                textItems.slice(1).forEach((text, i) => {
                    const angle = (i * 360 / (textItems.length - 1)) * Math.PI / 180;
                    const x = 200 + 100 * Math.cos(angle);
                    const y = 200 + 100 * Math.sin(angle);
                    html += `<div style="position: absolute; left: ${x - 40}px; top: ${y - 40}px; width: 80px; height: 80px; border-radius: 50%; background: ${c[(i + 1) % c.length]}; opacity: 0.6; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; text-align: center; padding: 5px;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'target':
                textItems.forEach((text, i) => {
                    const size = 300 - i * 80;
                    html += `<div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: ${c[i % c.length]}; opacity: 0.6; margin: ${i * 40}px auto 0; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${text}</div>`;
                });
                break;

            case 'radial-list':
                html += '<div style="position: relative; width: 400px; height: 400px; margin: 0 auto;">';
                html += `<div style="position: absolute; left: 175px; top: 175px; width: 50px; height: 50px; border-radius: 50%; background: ${c[0]}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">Center</div>`;
                textItems.slice(1).forEach((text, i) => {
                    const angle = (i * 360 / (textItems.length - 1)) * Math.PI / 180;
                    const x = 200 + 120 * Math.cos(angle);
                    const y = 200 + 120 * Math.sin(angle);
                    html += `<div style="position: absolute; left: ${x - 40}px; top: ${y - 20}px; background: ${c[(i + 1) % c.length]}; color: white; padding: 10px; border-radius: 5px; width: 80px; text-align: center; font-weight: bold; font-size: 12px;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'cycle-matrix':
                html += '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 400px; margin: 0 auto;">';
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 40px 20px; border-radius: 5px; text-align: center; font-weight: bold; opacity: 0.7;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'pyramid-list':
                textItems.forEach((text, i) => {
                    const width = 400 - i * 80;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 5px auto; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                break;

            case 'basic-pyramid':
            case 'segmented-pyramid':
                textItems.forEach((text, i) => {
                    const width = 400 - i * 80;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 5px auto; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                break;

            case 'funnel':
                textItems.forEach((text, i) => {
                    const width = 400 - i * 60;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px; margin: 5px auto; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                break;

            default:
                textItems.forEach((text, i) => {
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px 20px; margin: 8px auto; border-radius: 5px; max-width: 300px;">${text}</div>`;
                });
        }
    }

    // MATRIX LAYOUTS
    else if (layout.category === 'Matrix') {
        const gridSize = Math.ceil(Math.sqrt(textItems.length));
        html += `<div style="display: grid; grid-template-columns: repeat(${gridSize}, 1fr); gap: 10px; max-width: 500px; margin: 0 auto;">`;
        textItems.forEach((text, i) => {
            html += `<div style="background: ${c[i % c.length]}; color: white; padding: 30px 20px; border-radius: 5px; text-align: center; font-weight: bold;">${text}</div>`;
        });
        html += '</div>';
    }

    // PYRAMID LAYOUTS
    else if (layout.category === 'Pyramid') {
        switch (layoutType) {
            case 'basic-pyramid':
            case 'segmented-pyramid':
                textItems.forEach((text, i) => {
                    const width = 400 - i * 80;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 5px auto; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                break;

            case 'inverted-pyramid':
                textItems.forEach((text, i) => {
                    const width = 200 + i * 80;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 5px auto; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                break;

            case 'horizontal-pyramid':
                html += '<div style="display: flex; align-items: center; justify-content: center; gap: 10px;">';
                textItems.forEach((text, i) => {
                    const width = 80 + i * 40;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                html += '</div>';
                break;

            case 'pyramid-list':
                textItems.forEach((text, i) => {
                    const width = 400 - i * 60;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 5px auto; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
                break;

            default:
                textItems.forEach((text, i) => {
                    const width = 400 - i * 60;
                    html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px; margin: 5px auto; border-radius: 5px; width: ${width}px; text-align: center; font-weight: bold;">${text}</div>`;
                });
        }
    }

    // PICTURE LAYOUTS
    else if (layout.category === 'Picture') {
        switch (layoutType) {
            case 'picture-list':
            case 'continuous-picture':
                html += '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="text-align: center;">
                        <div style="width: 120px; height: 120px; background: ${c[i % c.length]}; border-radius: 8px; margin-bottom: 10px; opacity: 0.5;"></div>
                        <div style="color: #333; font-weight: bold;">${text}</div>
                    </div>`;
                });
                html += '</div>';
                break;

            case 'picture-strips':
                textItems.forEach((text, i) => {
                    html += `<div style="display: flex; align-items: center; gap: 15px; margin: 10px auto; max-width: 600px;">
                        <div style="width: 150px; height: 80px; background: ${c[i % c.length]}; border-radius: 5px; opacity: 0.5; flex-shrink: 0;"></div>
                        <div style="color: #333; font-weight: bold; flex: 1;">${text}</div>
                    </div>`;
                });
                break;

            case 'picture-grid':
                const gridCols = Math.ceil(Math.sqrt(textItems.length));
                html += `<div style="display: grid; grid-template-columns: repeat(${gridCols}, 1fr); gap: 15px; max-width: 500px; margin: 0 auto;">`;
                textItems.forEach((text, i) => {
                    html += `<div style="text-align: center;">
                        <div style="width: 100%; aspect-ratio: 1; background: ${c[i % c.length]}; border-radius: 8px; margin-bottom: 8px; opacity: 0.5;"></div>
                        <div style="color: #333; font-weight: bold; font-size: 12px;">${text}</div>
                    </div>`;
                });
                html += '</div>';
                break;

            case 'picture-hierarchy':
                html += `<div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 150px; height: 100px; background: ${c[0]}; border-radius: 8px; margin: 0 auto 10px; opacity: 0.5;"></div>
                    <div style="color: #333; font-weight: bold;">${textItems[0] || 'Top'}</div>
                </div>`;
                html += '<div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">';
                for (let i = 1; i < textItems.length; i++) {
                    html += `<div style="text-align: center;">
                        <div style="width: 100px; height: 80px; background: ${c[i % c.length]}; border-radius: 8px; margin-bottom: 8px; opacity: 0.5;"></div>
                        <div style="color: #333; font-weight: bold; font-size: 12px;">${textItems[i]}</div>
                    </div>`;
                }
                html += '</div>';
                break;

            default:
                html += '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
                textItems.forEach((text, i) => {
                    html += `<div style="text-align: center;">
                        <div style="width: 120px; height: 120px; background: ${c[i % c.length]}; border-radius: 8px; margin-bottom: 10px; opacity: 0.5;"></div>
                        <div style="color: #333; font-weight: bold;">${text}</div>
                    </div>`;
                });
                html += '</div>';
        }
    }

    // OTHER/SPECIAL LAYOUTS
    else if (layout.category === 'Other') {
        html += '<div style="display: flex; justify-content: center; align-items: center; gap: 15px; flex-wrap: wrap;">';
        textItems.forEach((text, i) => {
            html += `<div style="background: ${c[i % c.length]}; color: white; padding: 15px 25px; border-radius: 5px; font-weight: bold;">${text}</div>`;
        });
        html += '</div>';
    }

    // DEFAULT FALLBACK
    else {
        textItems.forEach((text, i) => {
            html += `<div style="background: ${c[i % c.length]}; color: white; padding: 12px 20px; margin: 8px auto; border-radius: 5px; max-width: 300px;">${text}</div>`;
        });
    }

    html += '</div>';
    return html;
};
