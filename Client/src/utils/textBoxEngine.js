// Text Box Engine - Core functionality for text box manipulation
// Handles creation, dragging, resizing, and formatting of text boxes

export class TextBoxEngine {
    constructor() {
        this.activeTextBox = null;
        this.isDrawing = false;
        this.drawStartX = 0;
        this.drawStartY = 0;
        this.textBoxCounter = 0;
    }

    // Create a text box element from a template
    createTextBoxElement(template, position = { x: 100, y: 100 }) {
        const textBox = document.createElement('div');
        textBox.className = 'etherx-textbox';
        textBox.setAttribute('data-template-id', template.id);
        textBox.setAttribute('data-textbox-id', `textbox-${++this.textBoxCounter}`);
        textBox.setAttribute('contenteditable', 'false');

        // Apply styles
        this.applyTemplateStyles(textBox, template);

        // Set position
        textBox.style.position = 'absolute';
        textBox.style.left = `${position.x}px`;
        textBox.style.top = `${position.y}px`;
        textBox.style.zIndex = template.position.zIndex || 1000;

        // Create content area
        const content = document.createElement('div');
        content.className = 'textbox-content';
        content.contentEditable = 'true';
        content.innerHTML = 'Type your text here';
        content.style.outline = 'none';
        content.style.width = '100%';
        content.style.height = '100%';

        textBox.appendChild(content);

        // Add resize handles
        this.addResizeHandles(textBox);

        // Make draggable and resizable
        this.makeTextBoxDraggable(textBox);
        this.makeTextBoxResizable(textBox);

        // Add selection handler
        textBox.addEventListener('click', (e) => {
            if (e.target === textBox || e.target.classList.contains('resize-handle')) {
                this.selectTextBox(textBox);
                e.stopPropagation();
            }
        });

        // Add global keyboard listener for Delete key (only once)
        if (!this.keyboardListenerAdded) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Delete' && this.activeTextBox) {
                    // Check if we are currently editing text inside the box
                    const isEditingText = document.activeElement &&
                        document.activeElement.classList.contains('textbox-content') &&
                        this.activeTextBox.contains(document.activeElement);

                    // Only delete if NOT editing text (i.e. strictly object selection)
                    if (!isEditingText) {
                        this.activeTextBox.remove();
                        this.activeTextBox = null;
                        e.preventDefault();
                    }
                }
            });
            this.keyboardListenerAdded = true;
        }

        return textBox;
    }

    // Apply template styles to text box
    applyTemplateStyles(textBox, template) {
        const { style, text } = template;

        // Box styles
        if (style.border && style.border.width !== '0px') {
            textBox.style.border = `${style.border.width} ${style.border.style} ${style.border.color}`;
        }
        if (style.borderLeft) {
            textBox.style.borderLeft = style.borderLeft;
        }
        if (style.borderTop) {
            textBox.style.borderTop = style.borderTop;
        }
        if (style.fill && style.fill !== 'none') {
            textBox.style.background = style.fill;
        }
        if (style.shadow && style.shadow !== 'none') {
            textBox.style.boxShadow = style.shadow;
        }
        if (style.borderRadius) {
            textBox.style.borderRadius = style.borderRadius;
        }

        textBox.style.width = style.width;
        textBox.style.minHeight = style.minHeight;
        textBox.style.padding = style.padding;

        // Text styles
        textBox.style.fontFamily = text.font;
        textBox.style.fontSize = text.size;
        textBox.style.color = text.color;
        textBox.style.textAlign = text.alignment;
        textBox.style.lineHeight = text.lineHeight;
        if (text.fontStyle) {
            textBox.style.fontStyle = text.fontStyle;
        }
        if (text.fontWeight) {
            textBox.style.fontWeight = text.fontWeight;
        }
    }

    // Add resize handles to text box
    addResizeHandles(textBox) {
        const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
        const handleContainer = document.createElement('div');
        handleContainer.className = 'resize-handles';
        handleContainer.style.display = 'none';

        handles.forEach(position => {
            const handle = document.createElement('div');
            handle.className = `resize-handle resize-${position}`;
            handle.setAttribute('data-position', position);
            handle.style.position = 'absolute';
            handle.style.width = '8px';
            handle.style.height = '8px';
            handle.style.background = 'var(--etb-accent, #FFD700)';
            handle.style.border = '1px solid #000';
            handle.style.cursor = `${position}-resize`;
            handle.style.zIndex = '10001';

            // Position handles
            if (position.includes('n')) handle.style.top = '-4px';
            if (position.includes('s')) handle.style.bottom = '-4px';
            if (position.includes('w')) handle.style.left = '-4px';
            if (position.includes('e')) handle.style.right = '-4px';
            if (position === 'n' || position === 's') handle.style.left = 'calc(50% - 4px)';
            if (position === 'w' || position === 'e') handle.style.top = 'calc(50% - 4px)';

            handleContainer.appendChild(handle);
        });

        textBox.appendChild(handleContainer);
    }

    // Make text box draggable
    makeTextBoxDraggable(textBox) {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        const onMouseDown = (e) => {
            if (e.target.classList.contains('resize-handle') ||
                e.target.classList.contains('textbox-content')) {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = parseInt(textBox.style.left) || 0;
            initialTop = parseInt(textBox.style.top) || 0;

            textBox.style.cursor = 'move';
            e.preventDefault();
        };

        const onMouseMove = (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            textBox.style.left = `${initialLeft + deltaX}px`;
            textBox.style.top = `${initialTop + deltaY}px`;
        };

        const onMouseUp = () => {
            isDragging = false;
            textBox.style.cursor = 'default';
        };

        textBox.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // Make text box resizable
    makeTextBoxResizable(textBox) {
        const handles = textBox.querySelectorAll('.resize-handle');

        handles.forEach(handle => {
            let isResizing = false;
            let startX, startY, startWidth, startHeight, startLeft, startTop;
            const position = handle.getAttribute('data-position');

            const onMouseDown = (e) => {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = parseInt(textBox.offsetWidth);
                startHeight = parseInt(textBox.offsetHeight);
                startLeft = parseInt(textBox.style.left) || 0;
                startTop = parseInt(textBox.style.top) || 0;
                e.stopPropagation();
                e.preventDefault();
            };

            const onMouseMove = (e) => {
                if (!isResizing) return;

                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;

                if (position.includes('e')) {
                    textBox.style.width = `${startWidth + deltaX}px`;
                }
                if (position.includes('w')) {
                    textBox.style.width = `${startWidth - deltaX}px`;
                    textBox.style.left = `${startLeft + deltaX}px`;
                }
                if (position.includes('s')) {
                    textBox.style.height = `${startHeight + deltaY}px`;
                }
                if (position.includes('n')) {
                    textBox.style.height = `${startHeight - deltaY}px`;
                    textBox.style.top = `${startTop + deltaY}px`;
                }
            };

            const onMouseUp = () => {
                isResizing = false;
            };

            handle.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    // Select a text box
    selectTextBox(textBox) {
        // Deselect all text boxes
        document.querySelectorAll('.etherx-textbox').forEach(box => {
            box.style.outline = 'none';
            const handles = box.querySelector('.resize-handles');
            if (handles) handles.style.display = 'none';
        });

        // Select this text box
        textBox.style.outline = '2px solid var(--etb-accent, #FFD700)';
        const handles = textBox.querySelector('.resize-handles');
        if (handles) handles.style.display = 'block';

        this.activeTextBox = textBox;
    }

    // Deselect all text boxes
    deselectAll() {
        document.querySelectorAll('.etherx-textbox').forEach(box => {
            box.style.outline = 'none';
            const handles = box.querySelector('.resize-handles');
            if (handles) handles.style.display = 'none';
        });
        this.activeTextBox = null;
    }

    // Enable drawing mode
    enableDrawingMode(container) {
        this.isDrawing = false;
        container.style.cursor = 'crosshair';

        const onMouseDown = (e) => {
            this.isDrawing = true;
            this.drawStartX = e.clientX;
            this.drawStartY = e.clientY;
        };

        const onMouseMove = (e) => {
            if (!this.isDrawing) return;
            // Could show a preview rectangle here
        };

        const onMouseUp = (e) => {
            if (!this.isDrawing) return;

            const width = Math.abs(e.clientX - this.drawStartX);
            const height = Math.abs(e.clientY - this.drawStartY);
            const left = Math.min(e.clientX, this.drawStartX);
            const top = Math.min(e.clientY, this.drawStartY);

            if (width > 20 && height > 20) {
                // Create a simple text box at this position
                const simpleTemplate = {
                    id: 'drawn-text-box',
                    name: 'Drawn Text Box',
                    category: 'simple',
                    type: 'box',
                    style: {
                        border: { width: '1px', color: '#000000', style: 'solid' },
                        fill: 'white',
                        shadow: 'none',
                        width: `${width}px`,
                        height: `${height}px`,
                        minHeight: `${height}px`,
                        padding: '10px',
                        borderRadius: '0px'
                    },
                    text: {
                        font: 'Calibri',
                        size: '11pt',
                        alignment: 'left',
                        color: '#000000',
                        lineHeight: '1.5'
                    },
                    position: {
                        wrapping: 'square',
                        zIndex: 1000
                    }
                };

                const textBox = this.createTextBoxElement(simpleTemplate, { x: left, y: top });
                container.appendChild(textBox);
                this.selectTextBox(textBox);
            }

            container.style.cursor = 'default';
            this.isDrawing = false;

            // Cleanup listeners
            container.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        container.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // Insert WordArt Object
    insertWordArt(wordArtStyle, position = { x: 200, y: 200 }) {
        const textBox = document.createElement('div');
        textBox.className = 'etherx-textbox etherx-wordart';
        textBox.setAttribute('data-wordart-id', wordArtStyle.id);
        textBox.setAttribute('contenteditable', 'false');

        // Initial WordArt Dimensions
        textBox.style.width = '300px';
        textBox.style.height = '100px';
        textBox.style.position = 'absolute';
        textBox.style.left = `${position.x}px`;
        textBox.style.top = `${position.y}px`;
        textBox.style.zIndex = 1000;

        // No border/background for the container box by default in WordArt
        textBox.style.background = 'transparent';
        textBox.style.border = '1px dashed transparent'; // Invisible border until selected

        // Create Content Area with WordArt Styles applied
        const content = document.createElement('div');
        content.className = 'textbox-content wordart-content';
        content.contentEditable = 'true';
        content.innerHTML = 'Your Text Here';
        content.style.width = '100%';
        content.style.height = '100%';
        content.style.outline = 'none';
        content.style.display = 'flex';
        content.style.alignItems = 'center';
        content.style.justifyContent = 'center';
        content.style.fontSize = '36px'; // Default large size
        content.style.lineHeight = '1.2';
        content.style.textAlign = 'center';
        content.style.whiteSpace = 'nowrap';
        content.style.overflow = 'visible';

        // Apply the specific WordArt CSS styles
        Object.assign(content.style, wordArtStyle.style);

        textBox.appendChild(content);

        // Add resize handles
        this.addResizeHandles(textBox);

        // Enable interactions
        this.makeTextBoxDraggable(textBox);
        this.makeTextBoxResizable(textBox);

        // Add selection handler
        textBox.addEventListener('click', (e) => {
            if (e.target === textBox || e.target.classList.contains('resize-handle') || e.target.closest('.wordart-content')) {
                this.selectTextBox(textBox);
                e.stopPropagation();
            }
        });

        // Hover effect for container border
        textBox.addEventListener('mouseenter', () => {
            if (this.activeTextBox !== textBox) textBox.style.border = '1px dashed #ccc';
        });
        textBox.addEventListener('mouseleave', () => {
            if (this.activeTextBox !== textBox) textBox.style.border = '1px dashed transparent';
        });

        return textBox;
    }
}

export default new TextBoxEngine();
