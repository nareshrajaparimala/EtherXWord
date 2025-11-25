import JSZip from 'jszip';

// OOXML Import Function
export const importDocxOOXML = async (fileBuffer) => {
  try {
    const zip = new JSZip();
    const docxFile = await zip.loadAsync(fileBuffer);
    
    // Read document.xml
    const documentXml = await docxFile.file('word/document.xml')?.async('string');
    if (!documentXml) {
      throw new Error('Invalid DOCX file: document.xml not found');
    }

    // Convert OOXML to HTML using simple parsing
    const html = convertOOXMLToHTML(documentXml);
    
    return {
      success: true,
      html: html,
      ooxml: documentXml,
      filename: 'imported.docx'
    };
  } catch (error) {
    console.error('DOCX import error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// OOXML Export Function
export const exportDocxOOXML = async (htmlContent, filename = 'document.docx') => {
  try {
    const zip = new JSZip();
    
    // Convert HTML to OOXML
    const ooxml = convertHTMLToOOXML(htmlContent);
    
    // Create DOCX structure
    zip.file('word/document.xml', ooxml);
    zip.file('[Content_Types].xml', getContentTypesXml());
    zip.file('_rels/.rels', getRelsXml());
    zip.file('word/_rels/document.xml.rels', getDocumentRelsXml());
    zip.file('docProps/app.xml', getAppPropsXml());
    zip.file('docProps/core.xml', getCorePropsXml());
    zip.file('word/styles.xml', getStylesXml());
    zip.file('word/settings.xml', getSettingsXml());
    zip.file('word/webSettings.xml', getWebSettingsXml());
    zip.file('word/fontTable.xml', getFontTableXml());
    
    // Generate DOCX buffer
    const buffer = await zip.generateAsync({ type: 'arraybuffer' });
    return buffer;
  } catch (error) {
    console.error('DOCX export error:', error);
    throw error;
  }
};

// Simple OOXML to HTML converter
const convertOOXMLToHTML = (xmlString) => {
  let html = '';
  
  try {
    // Extract paragraphs
    const paragraphs = xmlString.match(/<w:p[^>]*>.*?<\/w:p>/gs) || [];
    
    paragraphs.forEach(paragraph => {
      let content = '';
      let alignment = '';
      
      // Check alignment
      if (paragraph.includes('w:jc w:val="center"')) alignment = ' style="text-align: center;"';
      else if (paragraph.includes('w:jc w:val="right"')) alignment = ' style="text-align: right;"';
      else if (paragraph.includes('w:jc w:val="both"')) alignment = ' style="text-align: justify;"';
      
      // Extract text runs
      const runs = paragraph.match(/<w:r[^>]*>.*?<\/w:r>/gs) || [];
      
      runs.forEach(run => {
        let text = '';
        let styles = [];
        
        // Check formatting
        if (run.includes('<w:b/>')) styles.push('font-weight: bold');
        if (run.includes('<w:i/>')) styles.push('font-style: italic');
        if (run.includes('<w:u')) styles.push('text-decoration: underline');
        
        // Extract text
        const textMatches = run.match(/<w:t[^>]*>(.*?)<\/w:t>/gs) || [];
        textMatches.forEach(textMatch => {
          text += textMatch.replace(/<w:t[^>]*>|<\/w:t>/g, '');
        });
        
        if (styles.length > 0) {
          content += `<span style="${styles.join('; ')}">${text}</span>`;
        } else {
          content += text;
        }
      });
      
      html += `<p${alignment}>${content || '&nbsp;'}</p>`;
    });
    
    // Extract tables
    const tables = xmlString.match(/<w:tbl[^>]*>.*?<\/w:tbl>/gs) || [];
    
    tables.forEach(table => {
      let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">';
      
      const rows = table.match(/<w:tr[^>]*>.*?<\/w:tr>/gs) || [];
      
      rows.forEach(row => {
        tableHtml += '<tr>';
        const cells = row.match(/<w:tc[^>]*>.*?<\/w:tc>/gs) || [];
        
        cells.forEach(cell => {
          const cellParagraphs = cell.match(/<w:p[^>]*>.*?<\/w:p>/gs) || [];
          let cellContent = '';
          
          cellParagraphs.forEach(p => {
            const textMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/gs) || [];
            textMatches.forEach(textMatch => {
              cellContent += textMatch.replace(/<w:t[^>]*>|<\/w:t>/g, '');
            });
          });
          
          tableHtml += `<td style="border: 1px solid #ddd; padding: 8px;">${cellContent || '&nbsp;'}</td>`;
        });
        
        tableHtml += '</tr>';
      });
      
      tableHtml += '</table>';
      html += tableHtml;
    });
    
  } catch (error) {
    console.error('OOXML parsing error:', error);
    html = '<p>Error converting document content</p>';
  }
  
  return html || '<p>Start writing your document here...</p>';
};

// Detect and mark page breaks in HTML content
// A4 page: 297mm height, 20mm margins = 257mm usable, roughly 27-30 lines per page
const insertPageBreaks = (htmlContent) => {
  try {
    // Use regex-based parsing since DOMParser is browser-only
    const blockRegex = /<(p|table|div|h[1-6])[^>]*>[\s\S]*?<\/\1>/gi;
    const blocks = [];
    let match;
    
    while ((match = blockRegex.exec(htmlContent)) !== null) {
      const block = {
        html: match[0],
        type: match[1].toLowerCase(),
        startIndex: match.index
      };
      
      // Estimate lines for this block
      if (block.type === 'table') {
        const rowMatches = block.html.match(/<tr[^>]*>/gi) || [];
        block.lines = rowMatches.length + 2; // Add overhead
      } else {
        // For paragraphs: count text content + estimate wrapping
        const text = block.html.replace(/<[^>]+>/g, '');
        const lineBreaks = (text.match(/\n/g) || []).length;
        const estimatedWrappedLines = Math.ceil(text.length / 80);
        block.lines = Math.max(lineBreaks + 1, estimatedWrappedLines, 1);
      }
      
      blocks.push(block);
    }
    
    // Now accumulate line counts and insert page breaks
    let result = '';
    let lineCount = 0;
    const LINES_PER_PAGE = 28;
    
    blocks.forEach((block, index) => {
      lineCount += block.lines;
      
      // Insert page break if we exceed capacity (not before first block)
      if (lineCount > LINES_PER_PAGE && index > 0) {
        result += '<div style="page-break-before: always; margin: 0; padding: 0; height: 0;"></div>';
        lineCount = block.lines; // Reset for new page
      }
      
      result += block.html;
    });
    
    return result || htmlContent;
  } catch (error) {
    console.warn('Page break detection error:', error);
    return htmlContent; // Fallback to original if parsing fails
  }
};

// Convert HTML to OOXML
const convertHTMLToOOXML = (htmlContent) => {
  // Ensure we have content
  if (!htmlContent || htmlContent.trim() === '') {
    htmlContent = '<p>Document content</p>';
  }
  
  // Insert page break markers based on estimated content height
  const htmlWithPageBreaks = insertPageBreaks(htmlContent);
  
  let ooxml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>`;
  
  // Helper: detect alignment from a tag string (style attr or align attr)
  const getAlignmentXml = (tagString) => {
    const styleMatch = tagString.match(/style=["']([^"']*)["']/i);
    let style = styleMatch ? styleMatch[1] : '';
    const alignAttrMatch = tagString.match(/align=["']?([^"'\s>]+)["']?/i);
    let align = alignAttrMatch ? alignAttrMatch[1] : null;

    // If style contains text-align
    const taMatch = style.match(/text-align\s*:\s*(left|center|right|justify)/i);
    if (taMatch) align = taMatch[1].toLowerCase();

    if (!align) return '';
    
    // Build pPr with alignment and spacing for cross-platform compatibility
    let pPr = '<w:pPr>';
    
    // Add alignment
    if (align === 'center') pPr += '<w:jc w:val="center"/>';
    else if (align === 'right') pPr += '<w:jc w:val="right"/>';
    else if (align === 'justify' || align === 'both') pPr += '<w:jc w:val="both"/>';
    
    // Add spacing (important for macOS Pages and paragraph separation)
    pPr += '<w:spacing w:before="0" w:after="200" w:line="360" w:lineRule="auto"/>';
    
    pPr += '</w:pPr>';
    return pPr;
  };

  const createRunsFromHtml = (content) => {
    let runs = '';
    // Split keeping inline tags (case-insensitive)
    const parts = content.split(/(<\/?(?:strong|b|em|i|u)[^>]*>)/i);
    let isBold = false, isItalic = false, isUnderline = false;

    parts.forEach(part => {
      const lower = part.toLowerCase();
      if (lower === '<strong>' || lower === '<b>') isBold = true;
      else if (lower === '</strong>' || lower === '</b>') isBold = false;
      else if (lower === '<em>' || lower === '<i>') isItalic = true;
      else if (lower === '</em>' || lower === '</i>') isItalic = false;
      else if (lower === '<u>') isUnderline = true;
      else if (lower === '</u>') isUnderline = false;
      else if (part && !part.startsWith('<')) {
        let rPr = '';
        if (isBold || isItalic || isUnderline) {
          rPr = '<w:rPr>';
          if (isBold) rPr += '<w:b/>';
          if (isItalic) rPr += '<w:i/>';
          if (isUnderline) rPr += '<w:u w:val="single"/>';
          rPr += '</w:rPr>';
        }
        runs += `<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(part)}</w:t></w:r>`;
      }
    });

    return runs || `<w:r><w:t xml:space="preserve"> </w:t></w:r>`;
  };

  // Convert paragraphs (using content with page breaks marked)
  // First, handle explicit page break markers
  const partsWithBreaks = htmlWithPageBreaks.split(/<div[^>]*page-break[^>]*><\/div>/);
  let isFirstPage = true;
  
  partsWithBreaks.forEach((part, pageIndex) => {
    // Add page break at start of subsequent pages (not before first page)
    if (!isFirstPage && pageIndex > 0) {
      ooxml += '<w:p><w:pPr><w:pageBreakBefore/></w:pPr></w:p>';
    }
    isFirstPage = false;
    
    // Extract paragraphs, but also handle plain text
    const paragraphs = part.match(/<p[^>]*>(.*?)<\/p>/gis) || [];
    
    // If no paragraphs found but we have content, wrap it in a paragraph
    if (paragraphs.length === 0 && part.trim()) {
      const cleanContent = part.replace(/<[^>]+>/g, '').trim();
      if (cleanContent) {
        ooxml += '<w:p><w:pPr><w:spacing w:before="0" w:after="200" w:line="360" w:lineRule="auto"/></w:pPr>';
        ooxml += createRunsFromHtml(cleanContent);
        ooxml += '</w:p>';
      }
    } else {
      paragraphs.forEach(paragraph => {
        const alignment = getAlignmentXml(paragraph);
        let content = paragraph.replace(/<p[^>]*>|<\/p>/gi, '');

        // Build paragraph with properties (alignment and/or spacing)
        let pPr = '';
        if (alignment) {
          // alignment already includes <w:pPr>...</w:pPr> with spacing
          pPr = alignment;
        } else {
          // No alignment: still add spacing for proper paragraph separation
          pPr = '<w:pPr><w:spacing w:before="0" w:after="200" w:line="360" w:lineRule="auto"/></w:pPr>';
        }

        ooxml += `<w:p>${pPr}`;
        // Create runs (handles inline formatting)
        ooxml += createRunsFromHtml(content);
        ooxml += '</w:p>';
      });
    }
  });
  
  // Ensure we have at least one paragraph
  if (!ooxml.includes('<w:p>')) {
    ooxml += '<w:p><w:pPr><w:spacing w:before="0" w:after="200" w:line="360" w:lineRule="auto"/></w:pPr>';
    ooxml += '<w:r><w:t xml:space="preserve">Document content</w:t></w:r>';
    ooxml += '</w:p>';
  }
  
  // Convert tables
  const tables = htmlWithPageBreaks.match(/<table[^>]*>(.*?)<\/table>/gs) || [];
  
  tables.forEach(table => {
    ooxml += '<w:tbl>';
    const rows = table.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
    
    rows.forEach(row => {
      ooxml += '<w:tr>';
      const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs) || [];
      
      cells.forEach(cell => {
        // Keep inner HTML to preserve inline tags
        const cellInner = cell.replace(/<td[^>]*>|<\/td>/gi, '');
        const cellAlignment = getAlignmentXml(cell);
        
        // Build cell paragraph with properties
        let cellPPr = '';
        if (cellAlignment) {
          cellPPr = cellAlignment;
        } else {
          cellPPr = '<w:pPr><w:spacing w:before="0" w:after="200" w:line="360" w:lineRule="auto"/></w:pPr>';
        }
        
        ooxml += `<w:tc><w:p>${cellPPr}`;
        ooxml += createRunsFromHtml(cellInner);
        ooxml += '</w:p></w:tc>';
      });
      
      ooxml += '</w:tr>';
    });
    
    ooxml += '</w:tbl>';
  });
  
  // Add section properties so Word recognizes document boundaries
  ooxml += `    <w:sectPr/>
  </w:body>
</w:document>`;
  
  return ooxml;
};

// Escape XML special characters inside text nodes
const escapeXml = (unsafe) => {
  if (unsafe === null || unsafe === undefined) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

// DOCX XML Templates
const getContentTypesXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const getRelsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const getDocumentRelsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const getAppPropsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">
  <Application>EtherXWord</Application>
  <AppVersion>1.0.0</AppVersion>
</Properties>`;

const getCorePropsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>EtherXWord Document</dc:title>
  <dc:creator>EtherXWord</dc:creator>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`;

const getStylesXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Georgia" w:hAnsi="Georgia"/>
        <w:sz w:val="24"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`;

const getSettingsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:defaultTabStop w:val="708"/>
</w:settings>`;

const getWebSettingsXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:webSettings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:optimizeForBrowser/>
</w:webSettings>`;

const getFontTableXml = () => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:fonts xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:font w:name="Georgia">
    <w:charset w:val="00"/>
    <w:family w:val="roman"/>
  </w:font>
</w:fonts>`;