// MS Word-like Pagination Engine with Font Height Calculations

// Page metrics
export const PAGE_METRICS = {
  width: 210, // mm
  height: 297, // mm
  margins: { top: 20, bottom: 20, left: 20, right: 20 },
  mmToPx: 3.7795275591,
  get contentHeight() {
    return (this.height - this.margins.top - this.margins.bottom) * this.mmToPx;
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
    this.init();
  }

  init() {
    this.createPage();
    this.setupObserver();
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

    const content = document.createElement('div');
    content.className = 'page-content';
    content.contentEditable = true;
    content.style.cssText = `
      padding: 20mm;
      height: auto;
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
    `;

    if (this.pages.length === 0) {
      content.innerHTML = '<p>Start writing your document here...</p>';
    }

    pageElement.appendChild(content);
    this.container.appendChild(pageElement);
    
    const page = { element: pageElement, content, pageNumber, pageId };
    this.pages.push(page);
    
    this.setupPageEvents(content);
    return page;
  }

  setupPageEvents(content) {
    content.addEventListener('input', (e) => this.handleInput(e));
    content.addEventListener('keydown', (e) => this.handleKeyDown(e));
    content.addEventListener('paste', (e) => this.handlePaste(e));
    content.addEventListener('focus', (e) => this.updateCurrentPage(e.target));
    content.addEventListener('click', (e) => this.updateCurrentPage(e.target));
  }

  updateCurrentPage(pageContent) {
    const pageIndex = this.getPageIndex(pageContent);
    if (pageIndex !== -1) {
      this.currentPageIndex = pageIndex;
      this.updateStats();
    }
  }

  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      if (this.isProcessing) return;
      this.scheduleReflow();
    });

    this.pages.forEach(page => {
      this.observer.observe(page.content, {
        childList: true,
        subtree: true,
        characterData: true
      });
    });
  }

  scheduleReflow() {
    if (this.reflowTimeout) clearTimeout(this.reflowTimeout);
    this.reflowTimeout = setTimeout(() => this.checkPagination(), 100);
  }

  handleInput(e) {
    this.scheduleReflow();
    this.checkCursorPosition(e.target);
    // Immediate stats update
    setTimeout(() => this.updateStats(), 0);
  }

  updateStats() {
    try {
      const stats = this.getDocumentStats();
      console.log('Updating stats:', stats); // Debug log
      
      // Use callback if provided
      if (this.onStatsUpdate && typeof this.onStatsUpdate === 'function') {
        this.onStatsUpdate(stats);
      }
      
      // Also dispatch events for compatibility
      const event = new CustomEvent('documentStatsUpdate', { 
        detail: stats,
        bubbles: true 
      });
      document.dispatchEvent(event);
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter') {
      setTimeout(() => this.scheduleReflow(), 10);
    }
    // Check if we need to move to next page after typing
    setTimeout(() => {
      this.checkCursorPosition(e.target);
      this.updateStats();
    }, 10);
  }

  checkCursorPosition(pageContent) {
    const pageIndex = this.getPageIndex(pageContent);
    if (pageIndex === -1) return;

    const contentHeight = pageContent.scrollHeight;
    const maxHeight = PAGE_METRICS.contentHeight;
    
    // If content exceeds page height, move cursor to next page
    if (contentHeight > maxHeight) {
      this.moveCursorToNextPage(pageIndex);
    }
  }

  moveCursorToNextPage(currentPageIndex) {
    this.ensureNextPage(currentPageIndex);
    const nextPage = this.pages[currentPageIndex + 1];
    
    // Focus next page and place cursor at the beginning
    nextPage.content.focus();
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    // If next page has placeholder text, select it for replacement
    if (nextPage.content.textContent.includes('Start writing')) {
      range.selectNodeContents(nextPage.content);
    } else {
      // Place cursor at the end of existing content
      range.setStart(nextPage.content, nextPage.content.childNodes.length);
      range.collapse(true);
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
  }

  handlePaste(e) {
    setTimeout(() => {
      this.scheduleReflow();
      this.updateStats();
    }, 50);
  }

  getPageIndex(pageContent) {
    return this.pages.findIndex(page => page.content === pageContent);
  }

  checkPagination() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      for (let i = 0; i < this.pages.length; i++) {
        this.checkPageOverflow(i);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  checkPageOverflow(pageIndex) {
    const page = this.pages[pageIndex];
    if (!page) return;

    const contentHeight = page.content.scrollHeight;
    const maxHeight = PAGE_METRICS.contentHeight;
    
    if (contentHeight > maxHeight) {
      this.handleOverflow(pageIndex);
    }
  }

  handleOverflow(pageIndex) {
    const page = this.pages[pageIndex];
    
    // Create next page if needed
    this.ensureNextPage(pageIndex);
    
    // Save cursor position before moving content
    const selection = window.getSelection();
    const cursorInCurrentPage = selection.rangeCount > 0 && 
      page.content.contains(selection.getRangeAt(0).commonAncestorContainer);
    
    // Get all text content and split it
    const allText = page.content.textContent || '';
    const words = allText.split(/\s+/).filter(word => word.length > 0);
    
    // Estimate how many words fit on current page
    const avgWordsPerLine = 12;
    const linesPerPage = Math.floor(PAGE_METRICS.contentHeight / 24);
    const wordsPerPage = Math.max(avgWordsPerLine * linesPerPage - 10, 50); // Leave some buffer
    
    if (words.length > wordsPerPage) {
      const keepWords = words.slice(0, wordsPerPage);
      const moveWords = words.slice(wordsPerPage);
      
      // Update current page content
      page.content.innerHTML = `<p>${keepWords.join(' ')}</p>`;
      
      // Move overflow to next page
      const nextPage = this.pages[pageIndex + 1];
      const newContent = `<p>${moveWords.join(' ')}</p>`;
      
      if (nextPage.content.textContent.includes('Start writing')) {
        nextPage.content.innerHTML = newContent;
      } else {
        nextPage.content.innerHTML = newContent + nextPage.content.innerHTML;
      }
      
      // If cursor was in current page and we moved content, move cursor to next page
      if (cursorInCurrentPage) {
        setTimeout(() => {
          this.moveCursorToNextPage(pageIndex);
        }, 50);
      }
      
      // Check if next page also overflows
      setTimeout(() => {
        this.checkPageOverflow(pageIndex + 1);
      }, 100);
    }
  }

  ensureNextPage(currentPageIndex) {
    if (currentPageIndex + 1 >= this.pages.length) {
      const newPage = this.createPage();
      this.observer.observe(newPage.content, {
        childList: true,
        subtree: true,
        characterData: true
      });
      // Update stats when new page is created
      setTimeout(() => this.updateStats(), 100);
    }
  }

  moveElementToNextPage(element, currentPageIndex) {
    this.ensureNextPage(currentPageIndex);
    
    // Remove from current page
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
    
    // Add to next page
    this.pages[currentPageIndex + 1].content.appendChild(element);
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

  insertPageBreak() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const pageContent = range.commonAncestorContainer.closest?.('.page-content') || 
                       range.commonAncestorContainer.parentElement?.closest('.page-content');
    
    if (!pageContent) return;
    
    const pageIndex = this.getPageIndex(pageContent);
    this.ensureNextPage(pageIndex);
    
    // Move cursor to next page
    const nextPage = this.pages[pageIndex + 1];
    nextPage.content.focus();
    
    // Place cursor at beginning of next page
    const newRange = document.createRange();
    newRange.setStart(nextPage.content, 0);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
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
}