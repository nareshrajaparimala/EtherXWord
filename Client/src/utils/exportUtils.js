import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { exportDocxOOXML } from './ooxmlUtils';

// Export format options
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  DOCX: 'docx'
};

// Export dialog component
export const showExportDialog = () => {
  return new Promise((resolve) => {
    const isDark = document.body.classList.contains('dark') || 
                  document.documentElement.getAttribute('data-theme') === 'dark' ||
                  window.matchMedia('(prefers-color-scheme: dark)').matches;

    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.innerHTML = `
      <div class="export-backdrop"></div>
      <div class="export-dialog">
        <div class="export-header">
          <div class="export-icon">
            <i class="ri-download-cloud-line"></i>
          </div>
          <h2>Export Document</h2>
          <p>Choose your preferred export format</p>
        </div>
        
        <div class="export-options">
          <button class="export-option" data-format="pdf">
            <div class="option-icon">
              <i class="ri-file-pdf-line"></i>
            </div>
            <div class="option-content">
              <h3>PDF</h3>
              <p>Portable Document Format</p>
              <span class="option-badge">Universal</span>
            </div>
          </button>
          
          <button class="export-option" data-format="docx">
            <div class="option-icon">
              <i class="ri-file-word-line"></i>
            </div>
            <div class="option-content">
              <h3>DOCX</h3>
              <p>Microsoft Word Document</p>
              <span class="option-badge">Editable</span>
            </div>
          </button>
        </div>
        
        <div class="export-actions">
          <button class="cancel-btn">
            <i class="ri-close-line"></i>
            Cancel
          </button>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .export-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: modalFadeIn 0.3s ease;
      }
      
      .export-backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
      }
      
      .export-dialog {
        position: relative;
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 2px solid #ffd700;
        border-radius: 20px;
        padding: 40px;
        min-width: 520px;
        max-width: 90vw;
        box-shadow: 0 32px 80px rgba(255, 215, 0, 0.3), 0 0 0 1px rgba(255, 215, 0, 0.1);
        animation: dialogSlideIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        color: #ffffff;
      }
      
      .export-header {
        text-align: center;
        margin-bottom: 40px;
      }
      
      .export-icon {
        width: 80px;
        height: 80px;
        margin: 0 auto 20px;
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: iconFloat 2s ease-in-out infinite;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.4);
      }
      
      .export-icon i {
        font-size: 36px;
        color: #1a1a1a;
      }
      
      .export-header h2 {
        margin: 0 0 12px 0;
        font-size: 28px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .export-header p {
        margin: 0;
        color: #cccccc;
        font-size: 16px;
      }
      
      .export-options {
        display: flex;
        gap: 24px;
        margin-bottom: 40px;
      }
      
      .export-option {
        flex: 1;
        padding: 28px 24px;
        border: 2px solid #444444;
        border-radius: 16px;
        background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%);
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        gap: 20px;
        position: relative;
        overflow: hidden;
      }
      
      .export-option::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.1), transparent);
        transition: left 0.6s;
      }
      
      .export-option:hover::before {
        left: 100%;
      }
      
      .export-option:hover {
        border-color: #ffd700;
        background: linear-gradient(135deg, #3d3d3d 0%, #4d4d4d 100%);
        transform: translateY(-4px) scale(1.02);
        box-shadow: 0 16px 40px rgba(255, 215, 0, 0.2);
      }
      
      .option-icon {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
      }
      
      .option-icon i {
        font-size: 28px;
        color: #1a1a1a;
      }
      
      .option-content h3 {
        margin: 0 0 6px 0;
        font-size: 20px;
        font-weight: 700;
        color: #ffffff;
      }
      
      .option-content p {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #cccccc;
      }
      
      .option-badge {
        display: inline-block;
        padding: 4px 12px;
        background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
        color: #1a1a1a;
        font-size: 11px;
        font-weight: 600;
        border-radius: 16px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
        box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
      }
      
      .export-actions {
        display: flex;
        justify-content: center;
      }
      
      .cancel-btn {
        padding: 14px 28px;
        border: 2px solid #444444;
        border-radius: 12px;
        background: transparent;
        color: #cccccc;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .cancel-btn:hover {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
        color: #ffd700;
      }
      
      @keyframes modalFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes dialogSlideIn {
        from {
          opacity: 0;
          transform: translateY(-30px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      @keyframes iconFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      
      @media (max-width: 600px) {
        .export-dialog {
          min-width: auto;
          width: calc(100% - 32px);
          padding: 32px 24px;
        }
        
        .export-options {
          flex-direction: column;
        }
        
        .export-option {
          padding: 24px 20px;
        }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);

    // Event listeners
    const options = modal.querySelectorAll('.export-option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        const format = option.dataset.format;
        document.body.removeChild(modal);
        document.head.removeChild(style);
        resolve(format);
      });
    });

    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
      resolve(null);
    });

    modal.querySelector('.export-backdrop').addEventListener('click', () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
      resolve(null);
    });
  });
};

// PDF Export with multipage support
export const exportToPDF = async (paginationEngine, documentTitle = 'document') => {
  try {
    const pages = paginationEngine.pages;
    if (!pages || pages.length === 0) {
      throw new Error('No pages to export');
    }

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Process each page
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      // Add new page for subsequent pages
      if (i > 0) {
        pdf.addPage();
      }

      // Create canvas from page content
      const canvas = await html2canvas(page.element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: page.element.offsetWidth,
        height: page.element.offsetHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Calculate dimensions to fit A4
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, 297));
    }

    // Save PDF
    pdf.save(`${documentTitle}.pdf`);
    return { success: true, pages: pages.length };
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};

// DOCX Export with multipage support
export const exportToDOCX = async (paginationEngine, documentTitle = 'document') => {
  try {
    let fullContent = paginationEngine.getAllContent();
    
    // Fallback: get content from individual pages if getAllContent is empty
    if (!fullContent || fullContent.trim() === '' || fullContent === '<p></p>') {
      const pageContents = [];
      paginationEngine.pages.forEach(page => {
        const content = page.content.innerHTML || page.content.textContent || '';
        if (content && content.trim() !== '') {
          pageContents.push(content);
        }
      });
      fullContent = pageContents.join('<div style="page-break-after: always;"></div>');
    }
    
    // Final check - if still empty, create default content
    if (!fullContent || fullContent.trim() === '') {
      fullContent = '<p>Document content</p>';
    }
    
    console.log('Exporting DOCX with content:', fullContent.substring(0, 200) + '...');
    
    const buffer = await exportDocxOOXML(fullContent, documentTitle);
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    saveAs(blob, `${documentTitle}.docx`);
    return { success: true, pages: paginationEngine.getPageCount() };
  } catch (error) {
    console.error('DOCX export error:', error);
    throw error;
  }
};

// Main export function
export const exportDocument = async (paginationEngine, documentTitle = 'document', showNotification) => {
  try {
    // Show export format dialog
    const selectedFormat = await showExportDialog();
    
    if (!selectedFormat) {
      return; // User cancelled
    }

    showNotification(`Exporting to ${selectedFormat.toUpperCase()}...`, 'info');

    let result;
    if (selectedFormat === EXPORT_FORMATS.PDF) {
      result = await exportToPDF(paginationEngine, documentTitle);
      showNotification(`PDF exported successfully! (${result.pages} pages)`, 'success');
    } else if (selectedFormat === EXPORT_FORMATS.DOCX) {
      result = await exportToDOCX(paginationEngine, documentTitle);
      showNotification(`DOCX exported successfully! (${result.pages} pages)`, 'success');
    }

    return result;
  } catch (error) {
    console.error('Export error:', error);
    showNotification(`Export failed: ${error.message}`, 'error');
    throw error;
  }
};

// Enhanced PDF export with better page handling
export const exportToPDFAdvanced = async (paginationEngine, documentTitle = 'document') => {
  try {
    const pages = paginationEngine.pages;
    if (!pages || pages.length === 0) {
      throw new Error('No pages to export');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Process each page with better quality
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      
      if (i > 0) {
        pdf.addPage();
      }

      // Temporarily modify page for better PDF rendering
      const originalStyle = page.element.style.cssText;
      page.element.style.cssText = `
        ${originalStyle}
        transform: none !important;
        box-shadow: none !important;
        margin: 0 !important;
      `;

      try {
        const canvas = await html2canvas(page.element, {
          scale: 3, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794, // A4 width in pixels at 96 DPI
          height: 1123, // A4 height in pixels at 96 DPI
          scrollX: 0,
          scrollY: 0,
          logging: false
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      } finally {
        // Restore original style
        page.element.style.cssText = originalStyle;
      }
    }

    pdf.save(`${documentTitle}.pdf`);
    return { success: true, pages: pages.length };
  } catch (error) {
    console.error('Advanced PDF export error:', error);
    throw error;
  }
};