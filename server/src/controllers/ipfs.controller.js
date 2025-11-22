// server/src/controllers/ipfs.controller.js
import { create } from "ipfs-http-client";
import dotenv from "dotenv";

dotenv.config();

// ✅ Infura credentials (get from https://infura.io)
const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET;

if (!projectId || !projectSecret) {
  console.warn("⚠ Missing Infura credentials! Add INFURA_PROJECT_ID and INFURA_PROJECT_SECRET to your .env file");
}

// ✅ Authentication header for Infura
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// ✅ Create IPFS client instance
const ipfs = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

// ✅ Controller function
export const uploadToIPFS = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("📄 Uploading to IPFS:", req.file.originalname);

    // Upload file buffer to IPFS
    const result = await ipfs.add(req.file.buffer);

    const url = `https://ipfs.infura.io/ipfs/${result.path}`;

    console.log("IPFS upload successful:", url);

    res.status(200).json({
      message: "File uploaded to IPFS successfully",
      cid: result.path,
      url,
    });
  } catch (error) {
    console.error("❌ IPFS upload error:", error);
    res.status(500).json({
      message: "IPFS upload failed",
      error: error.message,
    });
  }
};