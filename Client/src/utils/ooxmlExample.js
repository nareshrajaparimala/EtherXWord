// OOXML Usage Example
// This file demonstrates how to use the OOXML import/export functions

import { importDocxOOXML, exportDocxOOXML } from './ooxmlUtils.js';

// Example 1: Import DOCX file
export const exampleImportDocx = async (fileInput) => {
  try {
    // Get file from input element
    const file = fileInput.files[0];
    if (!file) return;
    
    // Convert to buffer
    const fileBuffer = await file.arrayBuffer();
    
    // Import DOCX
    const result = await importDocxOOXML(fileBuffer);
    
    if (result.success) {
      console.log('Import successful!');
      console.log('HTML Content:', result.html);
      console.log('Original OOXML:', result.ooxml);
      console.log('Filename:', result.filename);
      
      // Use the HTML content in your editor
      return result.html;
    } else {
      console.error('Import failed:', result.error);
      return null;
    }
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
};

// Example 2: Export HTML to DOCX
export const exampleExportDocx = async (htmlContent, filename = 'document') => {
  try {
    // Export HTML to DOCX buffer
    const buffer = await exportDocxOOXML(htmlContent, filename);
    
    // Create blob and download
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Export successful!');
    return true;
  } catch (error) {
    console.error('Export error:', error);
    return false;
  }
};

// Example 3: Complete workflow
export const exampleCompleteWorkflow = async () => {
  // Sample HTML content
  const htmlContent = `
    <p>This is a sample document with <strong>bold text</strong> and <em>italic text</em>.</p>
    <p style="text-align: center;">This paragraph is centered.</p>
    <p>Here's a list:</p>
    <ul>
      <li>First item</li>
      <li>Second item</li>
      <li>Third item</li>
    </ul>
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px;">Header 1</th>
        <th style="border: 1px solid #ddd; padding: 8px;">Header 2</th>
      </tr>
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Cell 1</td>
        <td style="border: 1px solid #ddd; padding: 8px;">Cell 2</td>
      </tr>
    </table>
  `;
  
  try {
    // Export to DOCX
    const buffer = await exportDocxOOXML(htmlContent, 'sample-document');
    
    // Simulate importing it back
    const importResult = await importDocxOOXML(buffer);
    
    if (importResult.success) {
      console.log('Round-trip successful!');
      console.log('Original HTML:', htmlContent);
      console.log('Converted HTML:', importResult.html);
      return importResult.html;
    } else {
      console.error('Round-trip failed:', importResult.error);
      return null;
    }
  } catch (error) {
    console.error('Workflow error:', error);
    return null;
  }
};

// Example 4: Integration with React component
export const useOOXMLIntegration = () => {
  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return null;
    
    const fileBuffer = await file.arrayBuffer();
    const result = await importDocxOOXML(fileBuffer);
    
    if (result.success) {
      // Update your editor state with result.html
      return result.html;
    }
    return null;
  };
  
  const handleExport = async (htmlContent, filename) => {
    try {
      const buffer = await exportDocxOOXML(htmlContent, filename);
      
      // Use file-saver or similar library
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      
      // Return blob for further processing
      return blob;
    } catch (error) {
      console.error('Export failed:', error);
      return null;
    }
  };
  
  return { handleImport, handleExport };
};

// Example HTML content for testing
export const sampleHTMLContent = `
<p>Welcome to EtherXWord!</p>
<p>This is a <strong>bold</strong> statement with <em>italic</em> emphasis and <u>underlined</u> text.</p>
<p style="text-align: center;">This paragraph is centered.</p>
<p style="text-align: right;">This paragraph is right-aligned.</p>
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<p>Here's an unordered list:</p>
<ul>
  <li>First item</li>
  <li>Second item with <strong>bold text</strong></li>
  <li>Third item with <em>italic text</em></li>
</ul>
<p>And here's an ordered list:</p>
<ol>
  <li>First numbered item</li>
  <li>Second numbered item</li>
  <li>Third numbered item</li>
</ol>
<p>Here's a simple table:</p>
<table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
  <tr>
    <th style="border: 1px solid #ddd; padding: 8px; background: rgba(255, 215, 0, 0.1);">Name</th>
    <th style="border: 1px solid #ddd; padding: 8px; background: rgba(255, 215, 0, 0.1);">Age</th>
    <th style="border: 1px solid #ddd; padding: 8px; background: rgba(255, 215, 0, 0.1);">City</th>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">John Doe</td>
    <td style="border: 1px solid #ddd; padding: 8px;">30</td>
    <td style="border: 1px solid #ddd; padding: 8px;">New York</td>
  </tr>
  <tr>
    <td style="border: 1px solid #ddd; padding: 8px;">Jane Smith</td>
    <td style="border: 1px solid #ddd; padding: 8px;">25</td>
    <td style="border: 1px solid #ddd; padding: 8px;">Los Angeles</td>
  </tr>
</table>
<p>This document demonstrates the OOXML import/export functionality of EtherXWord.</p>
`;