// routes/exportDocx.js
import express from "express";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  TabStopType,
  TabStopPosition,
} from "docx";

const router = express.Router();

/* ----------------- Utilities ----------------- */

// Map various alignment inputs to docx AlignmentType
const mapAlignment = (value) => {
  if (!value) return AlignmentType.LEFT;
  const v = String(value).toLowerCase();
  if (v === "center" || v === "centre" || v === "c") return AlignmentType.CENTER;
  if (v === "right" || v === "r") return AlignmentType.RIGHT;
  if (v === "justify" || v === "both") return AlignmentType.JUSTIFIED;
  return AlignmentType.LEFT;
};

// Normalize a block's alignment value from many possible shapes
function getBlockAlignment(block) {
  // common places to find alignment
  if (!block) return AlignmentType.LEFT;
  const possible = [
    block.align,
    block.alignment,
    block.attrs && block.attrs.textAlign,
    block.attrs && block.attrs.align,
    block.style && block.style.textAlign,
    (block.ops && block.ops[0] && block.ops[0].attributes && block.ops[0].attributes.align),
    (block.format && block.format.align)
  ];
  for (const p of possible) {
    if (p) return mapAlignment(p);
  }
  return AlignmentType.LEFT;
}

// Create TextRun from a run-like object or simple string
function makeRun(r) {
  if (!r) return new TextRun("");
  if (typeof r === "string") return new TextRun(r);

  // r may be like { text, bold, italics, underline, color, size }
  const props = {};
  if (r.bold) props.bold = true;
  if (r.italic || r.italics) props.italics = true;
  if (r.underline) props.underline = {};
  if (r.color) props.color = String(r.color).replace("#", "");
  if (r.size) props.size = Number(r.size); // docx size is half-points
  if (r.font) props.font = r.font;
  // preserve text including leading/trailing spaces
  const text = r.text ?? r.insert ?? "";
  return new TextRun({ text: String(text), ...props });
}

// Create paragraph with explicit alignment, spacing and runs
function makeParagraphFromBlock(block) {
  const alignment = getBlockAlignment(block);
  const spacingAfter = Number.isFinite(block.spacingAfter) ? block.spacingAfter : 240;
  const leftIndent = Number.isFinite(block.indentLeft) ? block.indentLeft : (block.indent ? block.indent : 0);

  // build children runs
  let children = [];
  if (Array.isArray(block.runs) && block.runs.length) {
    children = block.runs.map(makeRun);
  } else if (Array.isArray(block.ops) && block.ops.length) {
    // Quill-like ops
    children = block.ops.map(op => {
      if (typeof op === "string") return makeRun(op);
      if (op.insert) {
        const run = { text: op.insert, ...op.attributes };
        return makeRun(run);
      }
      return makeRun("");
    });
  } else if (block.content && Array.isArray(block.content) && block.content.length) {
    // TipTap/ProseMirror like
    children = block.content.flatMap(node => {
      if (node.type === "text") return [makeRun({ text: node.text, ...node.marks && node.marks.reduce((acc, m) => ({ ...acc, ...m.attrs }), {}) })];
      if (node.text) return [makeRun(node)];
      return [];
    });
  } else {
    // fallback to simple text
    children = [makeRun({ text: block.text ?? block.value ?? "" })];
  }

  return new Paragraph({
    alignment,
    spacing: { after: spacingAfter, line: block.line || 276 },
    indent: { left: leftIndent },
    tabStops: [
      { type: TabStopType.LEFT, position: 720 }, // stabilizes tabs
      { type: TabStopType.RIGHT, position: TabStopPosition.MAX }
    ],
    keepLines: true,
    keepNext: !!block.keepNext,
    children
  });
}

// Build a two-column table (label / value) for stable alignment
function buildTwoColTable(rows = [], opts = { leftPct: 65, rightPct: 35, fontSize: 24 }) {
  const totalPctUnits = 100 * 50; // docx percent units
  const leftWidth = Math.round(totalPctUnits * (opts.leftPct / 100));
  const rightWidth = Math.round(totalPctUnits * (opts.rightPct / 100));
  const noBorders = { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 } };

  const tableRows = rows.map(([l, r]) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: leftWidth, type: WidthType.PERCENTAGE },
          borders: noBorders,
          children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [makeRun({ text: String(l || "") , size: opts.fontSize })] })],
        }),
        new TableCell({
          width: { size: rightWidth, type: WidthType.PERCENTAGE },
          borders: noBorders,
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [makeRun({ text: String(r || ""), size: opts.fontSize })] })],
        })
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
    borders: { top: { size: 0 }, bottom: { size: 0 }, left: { size: 0 }, right: { size: 0 }, insideH: { size: 0 }, insideV: { size: 0 } }
  });
}

/* ----------------- Routes ----------------- */

router.get("/ping", (_req, res) => res.json({ ok: true, route: "/api/export" }));

router.post("/docx", async (req, res) => {
  try {
    const body = req.body || {};
    // Accept both { title, blocks } and older shapes
    const title = body.title || body.name || "Document";
    const blocks = body.blocks || body.content || body.ops || [];

    const children = [];
    const twoColRows = [];

    // loop and map blocks robustly
    for (const b of blocks) {
      // detect two-col layout variants
      if (b.layout === "two-col" || (b.type === "two-col" || (b.attrs && b.attrs.layout === "two-col"))) {
        twoColRows.push([b.left ?? b.label ?? b.key ?? "", b.right ?? b.value ?? b.amount ?? ""]);
        continue;
      }

      // headings handling (TipTap/ProseMirror may have node.type = 'heading')
      if (b.type === "heading" || (b.nodeType && b.nodeType === "heading") || (b.attrs && b.attrs.level)) {
        const level = Number(b.level || (b.attrs && b.attrs.level) || 2);
        const heading =
          level === 1 ? HeadingLevel.HEADING_1 :
          level === 2 ? HeadingLevel.HEADING_2 :
          level === 3 ? HeadingLevel.HEADING_3 :
          level === 4 ? HeadingLevel.HEADING_4 :
          HeadingLevel.HEADING_6;

        // extract text (supports different shapes)
        const text = b.text ?? (b.content && b.content.map(c => c.text || "").join("") ) ?? (b.ops && b.ops.map(o => o.insert || "").join("")) ?? "";
        const para = new Paragraph({
          text,
          heading,
          alignment: getBlockAlignment(b),
          spacing: { after: Number.isFinite(b.spacingAfter) ? b.spacingAfter : 240 }
        });
        children.push(para);
        continue;
      }

      // bullet list (support different shapes)
      if (b.type === "bullet" || b.type === "unordered_list" || (b.attrs && b.attrs.list === "bullet")) {
        const level = Number(b.level || (b.attrs && b.attrs.level) || 0);
        const text = b.text ?? (b.content && b.content.map(c => c.text).join("")) ?? (b.ops && b.ops.map(o => o.insert || "").join("")) ?? "";
        children.push(new Paragraph({
          text,
          bullet: { level },
          alignment: getBlockAlignment(b),
          spacing: { after: Number.isFinite(b.spacingAfter) ? b.spacingAfter : 120 },
          indent: { left: 720 * (level + 1) }
        }));
        continue;
      }

      // numbered list
      if (b.type === "numbered" || b.type === "ordered_list" || (b.attrs && b.attrs.list === "numbered")) {
        const level = Number(b.level || (b.attrs && b.attrs.level) || 0);
        const text = b.text ?? (b.content && b.content.map(c => c.text).join("")) ?? (b.ops && b.ops.map(o => o.insert || "").join("")) ?? "";
        children.push(new Paragraph({
          text,
          numbering: { reference: "num-ref", level },
          alignment: getBlockAlignment(b),
          spacing: { after: Number.isFinite(b.spacingAfter) ? b.spacingAfter : 120 },
          indent: { left: 720 * (level + 1) }
        }));
        continue;
      }

      // default: paragraph (handles many editor shapes)
      children.push(makeParagraphFromBlock(b));
    }

    // Append two-col table if any
    if (twoColRows.length) {
      children.push(buildTwoColTable(twoColRows, { leftPct: 65, rightPct: 35, fontSize: 24 }));
    }

    // Build Document with defaults to avoid font substitution
    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: "Calibri", size: 24 }, // 12pt
            paragraph: { spacing: { before: 0, after: 240, line: 276 } }
          }
        }
      },
      numbering: {
        config: [
          {
            reference: "num-ref",
            levels: [
              { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT },
              { level: 1, format: "decimal", text: "%2.", alignment: AlignmentType.LEFT },
              { level: 2, format: "decimal", text: "%3.", alignment: AlignmentType.LEFT },
            ]
          }
        ]
      },
      sections: [
        {
          properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
          children: [
            new Paragraph({
              text: title,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER,
              spacing: { after: 300 }
            }),
            ...children
          ]
        }
      ]
    });

    const buffer = await Packer.toBuffer(doc);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="${(title || "document").replace(/"/g, "")}.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error("[DOCX] export error", err);
    res.status(500).json({ error: "Failed to generate DOCX" });
  }
});

export default router;