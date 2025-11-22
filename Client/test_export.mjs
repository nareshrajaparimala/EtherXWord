import fs from 'fs';
import path from 'path';
import { exportDocxOOXML } from './src/utils/ooxmlUtils.js';

(async () => {
  try {
    // Create content long enough to span multiple pages (28 lines per page)
    let paragraphs = '';
    for (let i = 1; i <= 35; i++) {
      paragraphs += `<p>Paragraph ${i}: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>\n`;
    }
    
    const html = `
      <p style="text-align: center;"><strong>Document Title</strong></p>
      ${paragraphs}
      <p style="text-align: center;"><strong>End of Document</strong></p>
    `;

    const buffer = await exportDocxOOXML(html, 'test.docx');
    const outPath = path.resolve('test-output.docx');
    fs.writeFileSync(outPath, Buffer.from(buffer));
    console.log('Wrote', outPath);
  } catch (e) {
    console.error('Export failed', e);
    process.exit(1);
  }
})();
