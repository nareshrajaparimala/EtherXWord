import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const docxPath = path.resolve('test-output.docx');
if (!fs.existsSync(docxPath)) {
  console.error('test-output.docx not found. Run test_export.mjs first.');
  process.exit(1);
}

try {
  // Extract document.xml using unzip -p
  const cmd = `unzip -p "${docxPath}" word/document.xml`;
  const xml = execSync(cmd, { encoding: 'utf8' });

  // Find paragraph elements and their alignment
  const paraRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
  let match;
  let idx = 0;
  const results = [];
  while ((match = paraRegex.exec(xml)) !== null) {
    idx++;
    const inner = match[1];
    const jcMatch = inner.match(/<w:jc\s+w:val="([^"]+)"\/>/);
    const hasBold = /<w:b\s*\/?>/.test(inner) || /<w:rPr>\s*<w:b\/>/.test(inner);
    results.push({ paragraph: idx, alignment: jcMatch ? jcMatch[1] : 'left (default)', bold: hasBold });
  }

  console.log('Paragraphs found:', results.length);
  results.forEach(r => console.log(`Paragraph ${r.paragraph}: alignment=${r.alignment}, bold=${r.bold}`));

  // Also check table cell paragraphs
  const tcRegex = /<w:tc>([\s\S]*?)<\/w:tc>/g;
  let tmatch;
  let tcIdx = 0;
  const tcResults = [];
  while ((tmatch = tcRegex.exec(xml)) !== null) {
    tcIdx++;
    const inner = tmatch[1];
    const jcMatch = inner.match(/<w:jc\s+w:val="([^"]+)"\/>/);
    const textMatch = inner.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/);
    tcResults.push({ cell: tcIdx, alignment: jcMatch ? jcMatch[1] : 'left (default)', text: textMatch ? textMatch[1].trim() : '' });
  }
  console.log('Table cells found:', tcResults.length);
  tcResults.forEach(c => console.log(`Cell ${c.cell}: alignment=${c.alignment}, text='${c.text}'`));

} catch (e) {
  console.error('Verification failed', e);
  process.exit(1);
}
