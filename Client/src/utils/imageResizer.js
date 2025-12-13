// Image Resizer Utility - Word-like image controls
export class ImageResizer {
  constructor() {
    this.activeImage = null;
    this.resizeContainer = null;
    this.isResizing = false;
    this.startX = 0;
    this.startY = 0;
    this.startWidth = 0;
    this.startHeight = 0;
    this.aspectRatio = 1;
    this.resizeHandle = null;
  }

  // Insert image with full format support
  insertImage(file, editor) {
    return new Promise((resolve, reject) => {
      console.log('Inserting image:', file.name, file.type);
      
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Please select a valid image file'));
        return;
      }

      if (!editor) {
        reject(new Error('Editor not available'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.cssText = `
            max-width: 300px;
            height: auto;
            display: block;
            margin: 10px auto;
            cursor: pointer;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          `;
          
          img.onload = () => {
            try {
              this.aspectRatio = img.naturalWidth / img.naturalHeight;
              this.makeResizable(img);
              
              // Focus the editor first
              editor.focus();
              
              // Insert at cursor position or at the end
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Ensure we're inserting in the editor
                if (editor.contains(range.commonAncestorContainer) || range.commonAncestorContainer === editor) {
                  range.insertNode(img);
                  range.setStartAfter(img);
                  range.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(range);
                } else {
                  editor.appendChild(img);
                }
              } else {
                editor.appendChild(img);
              }
              
              console.log('Image inserted successfully');
              resolve(img);
            } catch (error) {
              console.error('Error during image insertion:', error);
              reject(error);
            }
          };
          
          img.onerror = () => {
            reject(new Error('Failed to load image'));
          };
        } catch (error) {
          console.error('Error creating image element:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Make image resizable with Word-like controls
  makeResizable(img) {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectImage(img);
    });

    // Remove selection when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.image-resize-container') && e.target !== img) {
        this.deselectImage();
      }
    });
  }

  selectImage(img) {
    this.deselectImage(); // Remove any existing selection
    this.activeImage = img;
    this.createResizeContainer(img);
  }

  deselectImage() {
    if (this.resizeContainer) {
      this.resizeContainer.remove();
      this.resizeContainer = null;
      this.activeImage = null;
    }
  }

  createResizeContainer(img) {
    const container = document.createElement('div');
    container.className = 'image-resize-container';
    
    const rect = img.getBoundingClientRect();
    const editorRect = img.closest('.page-content').getBoundingClientRect();
    
    container.style.cssText = `
      position: absolute;
      left: ${rect.left - editorRect.left}px;
      top: ${rect.top - editorRect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      border: 2px solid #007acc;
      pointer-events: none;
      z-index: 1000;
      box-sizing: border-box;
    `;

    // Create resize handles
    this.createResizeHandles(container);
    
    // Create control panel
    this.createControlPanel(container, img);
    
    // Add to editor
    img.closest('.page-content').style.position = 'relative';
    img.closest('.page-content').appendChild(container);
    
    this.resizeContainer = container;
    this.updateContainerPosition();
  }

  createResizeHandles(container) {
    const handles = [
      { pos: 'nw', cursor: 'nw-resize', corner: true },
      { pos: 'n', cursor: 'n-resize', corner: false },
      { pos: 'ne', cursor: 'ne-resize', corner: true },
      { pos: 'e', cursor: 'e-resize', corner: false },
      { pos: 'se', cursor: 'se-resize', corner: true },
      { pos: 's', cursor: 's-resize', corner: false },
      { pos: 'sw', cursor: 'sw-resize', corner: true },
      { pos: 'w', cursor: 'w-resize', corner: false }
    ];

    handles.forEach(handle => {
      const div = document.createElement('div');
      div.className = `resize-handle resize-${handle.pos}`;
      div.style.cssText = `
        position: absolute;
        width: 8px;
        height: 8px;
        background: #007acc;
        border: 1px solid white;
        cursor: ${handle.cursor};
        pointer-events: all;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      `;

      // Position handles
      switch(handle.pos) {
        case 'nw': div.style.cssText += 'top: -4px; left: -4px;'; break;
        case 'n': div.style.cssText += 'top: -4px; left: 50%; transform: translateX(-50%);'; break;
        case 'ne': div.style.cssText += 'top: -4px; right: -4px;'; break;
        case 'e': div.style.cssText += 'top: 50%; right: -4px; transform: translateY(-50%);'; break;
        case 'se': div.style.cssText += 'bottom: -4px; right: -4px;'; break;
        case 's': div.style.cssText += 'bottom: -4px; left: 50%; transform: translateX(-50%);'; break;
        case 'sw': div.style.cssText += 'bottom: -4px; left: -4px;'; break;
        case 'w': div.style.cssText += 'top: 50%; left: -4px; transform: translateY(-50%);'; break;
      }

      div.addEventListener('mousedown', (e) => this.startResize(e, handle));
      container.appendChild(div);
    });
  }

  startResize(e, handle) {
    e.preventDefault();
    e.stopPropagation();
    
    this.isResizing = true;
    this.resizeHandle = handle;
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    const rect = this.activeImage.getBoundingClientRect();
    this.startWidth = rect.width;
    this.startHeight = rect.height;
    this.aspectRatio = this.startWidth / this.startHeight;

    document.addEventListener('mousemove', this.handleResize);
    document.addEventListener('mouseup', this.stopResize);
    document.body.style.userSelect = 'none';
  }

  handleResize = (e) => {
    if (!this.isResizing || !this.activeImage) return;

    const deltaX = e.clientX - this.startX;
    const deltaY = e.clientY - this.startY;
    
    let newWidth = this.startWidth;
    let newHeight = this.startHeight;

    switch(this.resizeHandle.pos) {
      case 'se': // Southeast - most common
        newWidth = this.startWidth + deltaX;
        if (this.resizeHandle.corner) {
          newHeight = newWidth / this.aspectRatio;
        } else {
          newHeight = this.startHeight + deltaY;
        }
        break;
      case 'nw': // Northwest
        newWidth = this.startWidth - deltaX;
        if (this.resizeHandle.corner) {
          newHeight = newWidth / this.aspectRatio;
        } else {
          newHeight = this.startHeight - deltaY;
        }
        break;
      case 'ne': // Northeast
        newWidth = this.startWidth + deltaX;
        if (this.resizeHandle.corner) {
          newHeight = newWidth / this.aspectRatio;
        } else {
          newHeight = this.startHeight - deltaY;
        }
        break;
      case 'sw': // Southwest
        newWidth = this.startWidth - deltaX;
        if (this.resizeHandle.corner) {
          newHeight = newWidth / this.aspectRatio;
        } else {
          newHeight = this.startHeight + deltaY;
        }
        break;
      case 'e': // East
        newWidth = this.startWidth + deltaX;
        break;
      case 'w': // West
        newWidth = this.startWidth - deltaX;
        break;
      case 'n': // North
        newHeight = this.startHeight - deltaY;
        break;
      case 's': // South
        newHeight = this.startHeight + deltaY;
        break;
    }

    // Apply minimum size constraints
    newWidth = Math.max(50, newWidth);
    newHeight = Math.max(50, newHeight);
    
    // Apply maximum size constraints
    const maxWidth = this.activeImage.closest('.page-content').offsetWidth - 40;
    newWidth = Math.min(maxWidth, newWidth);

    this.activeImage.style.width = newWidth + 'px';
    this.activeImage.style.height = newHeight + 'px';
    
    this.updateContainerPosition();
  }

  stopResize = () => {
    this.isResizing = false;
    this.resizeHandle = null;
    document.removeEventListener('mousemove', this.handleResize);
    document.removeEventListener('mouseup', this.stopResize);
    document.body.style.userSelect = '';
  }

  createControlPanel(container, img) {
    const panel = document.createElement('div');
    panel.className = 'image-control-panel';
    panel.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border: 1px solid #ffd700;
      border-radius: 6px;
      padding: 4px;
      display: flex;
      gap: 4px;
      pointer-events: all;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="ri-delete-bin-line"></i>';
    deleteBtn.title = 'Delete Image (Del)';
    deleteBtn.style.cssText = `
      background: #ff4444;
      border: none;
      color: white;
      padding: 4px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    `;
    deleteBtn.onclick = () => this.deleteImage(img);

    // Align left button
    const alignLeftBtn = document.createElement('button');
    alignLeftBtn.innerHTML = '<i class="ri-align-left"></i>';
    alignLeftBtn.title = 'Align Left';
    alignLeftBtn.style.cssText = `
      background: #ffd700;
      border: none;
      color: #1a1a1a;
      padding: 4px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    `;
    alignLeftBtn.onclick = () => this.alignImage(img, 'left');

    // Align right button
    const alignRightBtn = document.createElement('button');
    alignRightBtn.innerHTML = '<i class="ri-align-right"></i>';
    alignRightBtn.title = 'Align Right';
    alignRightBtn.style.cssText = `
      background: #ffd700;
      border: none;
      color: #1a1a1a;
      padding: 4px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    `;
    alignRightBtn.onclick = () => this.alignImage(img, 'right');

    // Align center button
    const alignCenterBtn = document.createElement('button');
    alignCenterBtn.innerHTML = '<i class="ri-align-center"></i>';
    alignCenterBtn.title = 'Align Center';
    alignCenterBtn.style.cssText = `
      background: #ffd700;
      border: none;
      color: #1a1a1a;
      padding: 4px 6px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 12px;
    `;
    alignCenterBtn.onclick = () => this.alignImage(img, 'center');

    panel.appendChild(deleteBtn);
    panel.appendChild(alignLeftBtn);
    panel.appendChild(alignCenterBtn);
    panel.appendChild(alignRightBtn);
    container.appendChild(panel);
  }

  deleteImage(img) {
    if (confirm('Delete this image?')) {
      img.remove();
      this.deselectImage();
    }
  }

  alignImage(img, alignment) {
    const parent = img.parentElement;
    switch(alignment) {
      case 'left':
        img.style.display = 'block';
        img.style.margin = '10px auto 10px 0';
        img.style.float = 'left';
        img.style.marginRight = '15px';
        break;
      case 'right':
        img.style.display = 'block';
        img.style.margin = '10px 0 10px auto';
        img.style.float = 'right';
        img.style.marginLeft = '15px';
        break;
      case 'center':
        img.style.display = 'block';
        img.style.margin = '10px auto';
        img.style.float = 'none';
        break;
    }
    this.updateContainerPosition();
  }

  updateContainerPosition() {
    if (!this.resizeContainer || !this.activeImage) return;
    
    const rect = this.activeImage.getBoundingClientRect();
    const editorRect = this.activeImage.closest('.page-content').getBoundingClientRect();
    
    this.resizeContainer.style.left = (rect.left - editorRect.left) + 'px';
    this.resizeContainer.style.top = (rect.top - editorRect.top) + 'px';
    this.resizeContainer.style.width = rect.width + 'px';
    this.resizeContainer.style.height = rect.height + 'px';
  }
}

// Global instance
export const imageResizer = new ImageResizer();