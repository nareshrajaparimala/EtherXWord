import express from "express";
import mime from "mime-types";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Persistent file-based IPFS implementation
class FileIPFS {
  constructor() {
    this.storageDir = path.join(__dirname, 'storage');
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  generateCID() {
    return 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  async addBytes(bytes) {
    const cid = this.generateCID();
    const filePath = path.join(this.storageDir, cid);
    fs.writeFileSync(filePath, bytes);
    return { toString: () => cid };
  }

  async *cat(cid) {
    const filePath = path.join(this.storageDir, cid);
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const data = fs.readFileSync(filePath);
    yield data;
  }
}

const app = express();
app.use(cors());
const upload = multer();

// Create file-based IPFS instance
const ipfsStorage = new FileIPFS();
console.log("✅ File-based IPFS Node Running");

// Upload file to IPFS
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const bytes = new Uint8Array(req.file.buffer);
    const cid = await ipfsStorage.addBytes(bytes);
    console.log("📦 Uploaded to IPFS:", cid.toString());

    res.json({ success: true, cid: cid.toString() });
  } catch (error) {
    console.error("❌ IPFS upload error:", error);
    res.status(500).json({ success: false, error: "Failed to upload to IPFS" });
  }
});

// Download/View file by CID
app.get("/ipfs/:cid", async (req, res) => {
  try {
    const cid = req.params.cid;
    console.log("Reading CID:", cid);
    const decoder = new TextDecoder();

    let chunks = [];
    for await (const chunk of ipfsStorage.cat(cid)) {
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

    // Try to detect better MIME type
    const ext = isHTML ? "html" : "txt";
    mimeType = mime.lookup(ext) || mimeType;

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", "inline");

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'IPFS server is running' });
});

// Debug endpoint to list stored files
app.get('/debug/files', (req, res) => {
  try {
    const files = fs.readdirSync(ipfsStorage.storageDir);
    res.json({ 
      storageDir: ipfsStorage.storageDir,
      files: files,
      count: files.length 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(4000, () => {
  console.log("✅ IPFS Server running on http://localhost:4000");
});