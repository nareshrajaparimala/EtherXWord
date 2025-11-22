import express from "express";
import mime from "mime-types"; // <-- add this at the top

import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { MemoryBlockstore } from "blockstore-core/memory";
import { MemoryDatastore } from "datastore-core/memory";

const app = express();
app.use(cors());
const upload = multer();

// --------------------------------------------------------
// ✅ Setup memory-based IPFS node (no LevelDB issues)
// --------------------------------------------------------
const blockstore = new MemoryBlockstore();
const datastore = new MemoryDatastore();

// --------------------------------------------------------
// ✅ Create Helia IPFS Node
// --------------------------------------------------------
const helia = await createHelia({
  blockstore,
  datastore,
});

const fs = unixfs(helia);
console.log("✅ Helia IPFS Node (Memory Mode) Running");

// --------------------------------------------------------
// ✅ Upload file to IPFS
// --------------------------------------------------------
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const bytes = new Uint8Array(req.file.buffer);
    const cid = await fs.addBytes(bytes);
    console.log("📦 Uploaded to IPFS:", cid.toString());

    res.json({ success: true, cid: cid.toString() });
  } catch (error) {
    console.error("❌ IPFS upload error:", error);
    res.status(500).json({ success: false, error: "Failed to upload to IPFS" });
  }
});

// --------------------------------------------------------
// ✅ Download/View file by CID
// --------------------------------------------------------
app.get("/ipfs/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    console.log("Reading CID:", cid);
    const decoder = new TextDecoder();

    let chunks = [];
    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
    }

    // Combine chunks
    const data = new Uint8Array(chunks.reduce((acc, val) => acc + val.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      data.set(chunk, offset);
      offset += chunk.length;
    }

    // Try to decode text content
    let content = "";
    try {
      content = decoder.decode(data);
    } catch {
      content = null;
    }

    // Detect file type
    const isText = content && /^[\x20-\x7E\r\n\t]+$/.test(content);
    const isHTML = content && content.trim().startsWith("<");

    let mimeType = "application/octet-stream";
    if (isHTML) mimeType = "text/html";
    else if (isText) mimeType = "text/plain";

    // ✅ Try to detect better MIME type (optional)
    const ext = isHTML ? "html" : "txt";
    mimeType = mime.lookup(ext) || mimeType;

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", "inline"); // 👈 prevents download

    if (isHTML || isText) {
      res.send(content);
    } else {
      res.send(Buffer.from(data));
    }

  } catch (error) {
    console.error("❌ Error reading IPFS file:", error);
    res.status(404).send("File not found in IPFS");
  }
});

// --------------------------------------------------------
// ✅ Start Server
// --------------------------------------------------------
app.listen(4000, () => {
  console.log("✅ IPFS Server running on http://localhost:4000");
});
