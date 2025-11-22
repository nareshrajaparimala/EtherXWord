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

// Convert HTML to OOXML
const convertHTMLToOOXML = (htmlContent) => {
  let ooxml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>`;
  
  // Convert paragraphs
  const paragraphs = htmlContent.match(/<p[^>]*>(.*?)<\/p>/gs) || [];
  
  paragraphs.forEach(paragraph => {
    let alignment = '';
    let content = paragraph.replace(/<p[^>]*>|<\/p>/g, '');
    
    // Check alignment
    if (paragraph.includes('text-align: center')) alignment = '<w:pPr><w:jc w:val="center"/></w:pPr>';
    else if (paragraph.includes('text-align: right')) alignment = '<w:pPr><w:jc w:val="right"/></w:pPr>';
    else if (paragraph.includes('text-align: justify')) alignment = '<w:pPr><w:jc w:val="both"/></w:pPr>';
    
    ooxml += `<w:p>${alignment}`;
    
    // Handle formatted text
    if (content.includes('<strong>') || content.includes('<b>') || content.includes('<em>') || content.includes('<i>') || content.includes('<u>')) {
      // Process formatted runs
      const parts = content.split(/(<\/?(?:strong|b|em|i|u)[^>]*>)/);
      let isBold = false, isItalic = false, isUnderline = false;
      
      parts.forEach(part => {
        if (part === '<strong>' || part === '<b>') isBold = true;
        else if (part === '</strong>' || part === '</b>') isBold = false;
        else if (part === '<em>' || part === '<i>') isItalic = true;
        else if (part === '</em>' || part === '</i>') isItalic = false;
        else if (part === '<u>') isUnderline = true;
        else if (part === '</u>') isUnderline = false;
        else if (part && !part.startsWith('<')) {
          let rPr = '';
          if (isBold || isItalic || isUnderline) {
            rPr = '<w:rPr>';
            if (isBold) rPr += '<w:b/>';
            if (isItalic) rPr += '<w:i/>';
            if (isUnderline) rPr += '<w:u w:val="single"/>';
            rPr += '</w:rPr>';
          }
          ooxml += `<w:r>${rPr}<w:t>${part}</w:t></w:r>`;
        }
      });
    } else {
      // Plain text
      const plainText = content.replace(/<[^>]*>/g, '');
      ooxml += `<w:r><w:t>${plainText || ' '}</w:t></w:r>`;
    }
    
    ooxml += '</w:p>';
  });
  
  // Convert tables
  const tables = htmlContent.match(/<table[^>]*>(.*?)<\/table>/gs) || [];
  
  tables.forEach(table => {
    ooxml += '<w:tbl>';
    const rows = table.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
    
    rows.forEach(row => {
      ooxml += '<w:tr>';
      const cells = row.match(/<td[^>]*>(.*?)<\/td>/gs) || [];
      
      cells.forEach(cell => {
        const cellContent = cell.replace(/<td[^>]*>|<\/td>/g, '').replace(/<[^>]*>/g, '');
        ooxml += `<w:tc><w:p><w:r><w:t>${cellContent || ' '}</w:t></w:r></w:p></w:tc>`;
      });
      
      ooxml += '</w:tr>';
    });
    
    ooxml += '</w:tbl>';
  });
  
  ooxml += `  </w:body>
</w:document>`;
  
  return ooxml;
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