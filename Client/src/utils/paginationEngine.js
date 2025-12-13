// MS Word-like Pagination Engine with Font Height Calculations

// Page metrics
export const PAGE_METRICS = {
  width: 210, // mm
  height: 297, // mm
  margins: { top: 0, bottom: 0, left: 0, right: 0 }, // No margins for full page content
  mmToPx: 3.7795275591,
  get contentHeight() {
    return this.height * this.mmToPx; // Full A4 height
  }
};

// MS Word-like Pagination Manager
export class MSWordPagination {
  constructor(container, onStatsUpdate = null) {
    this.container = container;
    this.pages = [];
    this.currentPageIndex = 0;
    this.isProcessing = false;
    this.observer = null;
    this.onStatsUpdate = onStatsUpdate;
    this.headerFooterConfig = null;
    this.init();
  }

  init() {
    this.createPage();
    // setupObserver removed - method doesn't exist
    // Initial stats update
    setTimeout(() => this.updateStats(), 100);
  }

  createPage() {
    const pageNumber = this.pages.length + 1;
    const pageId = `page-${Date.now()}-${pageNumber}`;
    const pageElement = document.createElement('div');
    pageElement.className = 'editor-page';
    pageElement.id = pageId;
    pageElement.dataset.pageNumber = pageNumber;

    pageElement.style.cssText = `
      width: 210mm;
      height: 297mm;
      background: white;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      position: relative;
      overflow: hidden;
    `;

    // Create header
    const header = document.createElement('div');
    header.className = 'page-header';
    header.style.cssText = `
      position: absolute;
      top: 10mm;
      left: 20mm;
      right: 20mm;
      height: 15mm;
      display: flex;
      align-items: center;
      font-family: Georgia, serif;
      font-size: 10pt;
      color: #333;
      border-bottom: none;
      z-index: 1;
    `;

    // Create footer
    const footer = document.createElement('div');
    footer.className = 'page-footer';
    footer.style.cssText = `
      position: absolute;
      bottom: 10mm;
      left: 20mm;
      right: 20mm;
      height: 15mm;
      display: flex;
      align-items: center;
      font-family: Georgia, serif;
      font-size: 10pt;
      color: #333;
      border-top: none;
      z-index: 1;
    `;

    const content = document.createElement('div');
    content.className = 'page-content';
    content.contentEditable = true;
    content.style.cssText = `
      width: calc(100% - 40mm);
      height: calc(297mm - 60mm);
      padding: 0;
      margin: 35mm 20mm 35mm 20mm;
      box-sizing: border-box;
      outline: none;
      font-family: Georgia, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #333;
      overflow: hidden;
      word-wrap: break-word;
      direction: ltr;
      text-align: left;
      position: absolute;
      top: 0;
      left: 0;
    `;

    pageElement.appendChild(header);
    pageElement.appendChild(content);
    pageElement.appendChild(footer);
    this.container.appendChild(pageElement);

    const page = { element: pageElement, content, header, footer, pageNumber, pageId };
    this.pages.push(page);

    // Apply current header/footer config if exists
    if (this.headerFooterConfig) {
      this.applyHeaderFooterToPage(page);
    }

    // setupPageEvents removed - handleInput method doesn't exist
    return page;
  }

  setupPageEvents(content) {
    content.addEventListener('input', (e) => this.handleInput(e));
  }


  getPageCount() {
    return this.pages.length;
  }

  getCurrentPage() {
    return this.currentPageIndex + 1;
  }

  getDocumentStats() {
    const allText = this.getAllText();
    const words = allText.trim() ? allText.trim().split(/\s+/).length : 0;
    const characters = allText.length;
    const paragraphs = this.getParagraphCount();
    const pages = this.getPageCount();
    const currentPage = this.getCurrentPage();

    return { words, characters, paragraphs, pages, currentPage };
  }

  updateStats() {
    if (this.onStatsUpdate) {
      const stats = this.getDocumentStats();
      this.onStatsUpdate(stats);
    }
  }

  getAllText() {
    return this.pages.map(page => page.content.textContent || '').join(' ').trim();
  }

  getParagraphCount() {
    let paragraphs = 0;
    this.pages.forEach(page => {
      const pElements = page.content.querySelectorAll('p');
      paragraphs += pElements.length;
    });
    return paragraphs || (this.getAllText().trim() ? 1 : 0);
  }

  goToPage(pageNumber) {
    const pageIndex = pageNumber - 1;
    if (pageIndex >= 0 && pageIndex < this.pages.length) {
      this.currentPageIndex = pageIndex;
      const page = this.pages[pageIndex];
      page.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      page.content.focus();
    }
  }

  getPageIndex(pageContent) {
    return this.pages.findIndex(p => p.content === pageContent);
  }

  ensureNextPage(pageIndex) {
    // If next page doesn't exist, create it
    if (pageIndex + 1 >= this.pages.length) {
      // Create new page after current
      const newPage = this.createPage();
      // createPage appends to end. If we need to insert in middle it's harder, 
      // but for standard typing flow, appending is usually functionally okay 
      // unless we are in the middle of the doc. 
      // Ideally should support insertion at index. 
      // For now, assuming standard flow (append if at end).
      // If we are strictly inserting, we might need to splice this.pages/dom?
      // Since pages are absolute, DOM order matters for z-index/flow?
      // CSS says 'editor-page' relative. So DOM order matters.
      // If pageIndex is not last, we need to insertAfter.
      if (pageIndex + 1 < this.pages.length - 1) {
        // Re-order DOM
        const nextExisting = this.pages[pageIndex + 1].element;
        this.container.insertBefore(newPage.element, nextExisting);
        // Update pages array
        this.pages.pop(); // Remove from end
        this.pages.splice(pageIndex + 1, 0, newPage);
        // Re-number pages? 
        this.updatePageNumbers();
      }
    }
  }

  updatePageNumbers() {
    this.pages.forEach((p, i) => {
      p.pageNumber = i + 1;
      p.dataset.pageNumber = i + 1;
      // Verify headers/footers
      if (this.headerFooterConfig) this.applyHeaderFooterToPage(p);
    });
  }

  insertPageBreak() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    // Find closest page content
    let node = range.commonAncestorContainer;
    while (node && !node.classList?.contains('page-content')) {
      node = node.parentNode;
    }
    const pageContent = node;

    if (!pageContent) return;

    const pageIndex = this.getPageIndex(pageContent);
    this.ensureNextPage(pageIndex);

    // Extract content after cursor
    const endRange = document.createRange();
    endRange.setStart(range.endContainer, range.endOffset);
    endRange.setEnd(pageContent, pageContent.childNodes.length);

    const fragment = endRange.extractContents();

    // Move to next page
    const nextPage = this.pages[pageIndex + 1];

    // Prepend to next page
    if (nextPage.content.firstChild) {
      nextPage.content.insertBefore(fragment, nextPage.content.firstChild);
    } else {
      nextPage.content.appendChild(fragment);
    }

    // Move cursor to next page start
    nextPage.content.focus();
    const newRange = document.createRange();
    newRange.setStart(nextPage.content, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    this.updateStats();
  }

  insertBlankPage() {
    // 1. Break current page (moves rest of content to next page)
    this.insertPageBreak();

    // 2. Break AGAIN at the start of the new page (pushes content to a 3rd page, leaving 2nd blank)
    // We are already at start of next page due to insertPageBreak behavior
    this.insertPageBreak();

    // 3. Move cursor back to the Blank Page (the one in the middle)
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Current range is at start of P3 content.
      // We want P2 content.
      let node = range.commonAncestorContainer;
      while (node && !node.classList?.contains('page-content')) {
        node = node.parentNode;
      }
      if (node) {
        const p3Index = this.getPageIndex(node);
        const p2Index = p3Index - 1;
        if (p2Index >= 0) {
          const p2 = this.pages[p2Index];
          p2.content.focus();
          // Ensure visible
          p2.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }

  getAllContent() {
    return this.pages.map(page => page.content.innerHTML).join('<div style="page-break-after: always;"></div>');
  }

  exportToDocx() {
    const content = this.getAllContent();
    const event = new CustomEvent('exportDocx', { detail: { content, pages: this.pages } });
    document.dispatchEvent(event);
  }

  exportToPdf() {
    const event = new CustomEvent('exportPdf', { detail: { pages: this.pages } });
    document.dispatchEvent(event);
  }

  getPageById(pageId) {
    return this.pages.find(page => page.pageId === pageId);
  }

  getAllPageIds() {
    return this.pages.map(page => page.pageId);
  }

  setContent(html) {
    // Clear existing pages except first
    while (this.pages.length > 1) {
      const lastPage = this.pages.pop();
      lastPage.element.remove();
    }

    // Set content in first page
    this.pages[0].content.innerHTML = html;

    // Trigger pagination
    setTimeout(() => this.checkPagination(), 100);
  }

  formatPageNumber(pageNum, type) {
    switch (type) {
      case 'roman-upper':
      case 'romanUpper':
        return this.toRoman(pageNum);
      case 'roman-lower':
      case 'romanLower':
        return this.toRoman(pageNum).toLowerCase();
      case 'alpha-upper':
      case 'alphaUpper':
        return String.fromCharCode(64 + pageNum); // A, B, C...
      case 'alpha-lower':
      case 'alphaLower':
        return String.fromCharCode(96 + pageNum); // a, b, c...
      case 'arabic':
      default:
        return pageNum.toString();
    }
  }

  toRoman(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i];
        num -= values[i];
      }
    }
    return result;
  }

  setHeaderFooter(config) {
    this.headerFooterConfig = config;

    // Apply to all existing pages
    this.pages.forEach(page => {
      this.applyHeaderFooterToPage(page);
    });
  }

  applyHeaderFooterToPage(page) {
    if (!this.headerFooterConfig) return;

    const config = this.headerFooterConfig;

    // Apply header
    if (config.headerText || (config.pageNumbers.enabled && config.pageNumbers.position.startsWith('header'))) {
      page.header.style.display = 'flex';
      page.header.style.justifyContent = this.getAlignmentStyle(config.headerAlignment);

      let headerContent = config.headerText || '';

      // Replace {PAGE} placeholder with actual page number
      if (headerContent.includes('{PAGE}')) {
        headerContent = headerContent.replace('{PAGE}', page.pageNumber.toString());
      }

      // Add page numbers to header if configured
      if (config.pageNumbers.enabled && config.pageNumbers.position.startsWith('header')) {
        const pageNum = this.formatPageNumber(page.pageNumber, config.pageNumbers.type);
        const formattedPageNum = config.pageNumbers.format.replace('{n}', pageNum).replace('{total}', this.pages.length);

        if (config.pageNumbers.position === 'header-left') {
          headerContent = formattedPageNum + (headerContent ? ' ' + headerContent : '');
        } else if (config.pageNumbers.position === 'header-right') {
          headerContent = (headerContent ? headerContent + ' ' : '') + formattedPageNum;
        } else if (config.pageNumbers.position === 'header-center') {
          headerContent = headerContent ? `${headerContent} ${formattedPageNum}` : formattedPageNum;
        }
      }

      page.header.innerHTML = headerContent;
    } else {
      page.header.style.display = 'none';
    }

    // Apply footer
    if (config.footerText || (config.pageNumbers.enabled && config.pageNumbers.position.startsWith('footer'))) {
      page.footer.style.display = 'flex';
      page.footer.style.justifyContent = this.getAlignmentStyle(config.footerAlignment);

      let footerContent = config.footerText || '';

      // Replace {PAGE} placeholder with actual page number
      if (footerContent.includes('{PAGE}')) {
        footerContent = footerContent.replace('{PAGE}', page.pageNumber.toString());
      }

      // Add page numbers to footer if configured
      if (config.pageNumbers.enabled && config.pageNumbers.position.startsWith('footer')) {
        const pageNum = this.formatPageNumber(page.pageNumber, config.pageNumbers.type);
        const formattedPageNum = config.pageNumbers.format.replace('{n}', pageNum).replace('{total}', this.pages.length);

        if (config.pageNumbers.position === 'footer-left') {
          footerContent = formattedPageNum + (footerContent ? ' ' + footerContent : '');
        } else if (config.pageNumbers.position === 'footer-right') {
          footerContent = (footerContent ? footerContent + ' ' : '') + formattedPageNum;
        } else if (config.pageNumbers.position === 'footer-center') {
          footerContent = footerContent ? `${footerContent} ${formattedPageNum}` : formattedPageNum;
        }
      }

      page.footer.innerHTML = footerContent;
    } else {
      page.footer.style.display = 'none';
    }

    // Apply borders only if borderType is not 'none'
    if (config.borderType && config.borderType !== 'none') {
      this.applyBorders(page);
    } else {
      // Remove borders
      page.header.style.borderTop = 'none';
      page.header.style.borderBottom = 'none';
      page.footer.style.borderTop = 'none';
      page.footer.style.borderBottom = 'none';
    }
  }

  applyBorders(page) {
    if (!this.headerFooterConfig) return;

    const config = this.headerFooterConfig;
    const borderStyle = `${config.borderWidth} solid ${config.borderColor}`;

    // Reset borders
    page.element.style.border = 'none';
    page.header.style.borderBottom = 'none';
    page.footer.style.borderTop = 'none';

    switch (config.borderType) {
      case 'top':
        page.element.style.borderTop = borderStyle;
        break;
      case 'bottom':
        page.element.style.borderBottom = borderStyle;
        break;
      case 'top-bottom':
        page.element.style.borderTop = borderStyle;
        page.element.style.borderBottom = borderStyle;
        break;
      case 'all':
        page.element.style.border = borderStyle;
        break;
    }

    // Add separator lines for header/footer if they have content
    if (page.header.innerHTML.trim()) {
      page.header.style.borderBottom = `1px solid ${config.borderColor}`;
    }
    if (page.footer.innerHTML.trim()) {
      page.footer.style.borderTop = `1px solid ${config.borderColor}`;
    }
  }

  getAlignmentStyle(alignment) {
    switch (alignment) {
      case 'center': return 'center';
      case 'right': return 'flex-end';
      default: return 'flex-start';
    }
  }

  formatPageNumber(pageNum, type) {
    switch (type) {
      case 'roman-lower':
        return this.toRoman(pageNum).toLowerCase();
      case 'roman-upper':
        return this.toRoman(pageNum);
      case 'alpha-lower':
        return String.fromCharCode(96 + pageNum); // a, b, c...
      case 'alpha-upper':
        return String.fromCharCode(64 + pageNum); // A, B, C...
      default:
        return pageNum.toString();
    }
  }

  toRoman(num) {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';

    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i];
        num -= values[i];
      }
    }

    return result;
  }
}