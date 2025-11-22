import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import PinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';
import Document from '../models/document.model.js';

dotenv.config();
const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const upload = multer({ dest: path.join(__dirname, '../uploads/') });


const pinata = new PinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
  
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    if (!req.body.owner) {
      return res.status(400).json({ success: false, message: 'Owner (userId) is required' });
    }

    const filePath = path.join(__dirname, '../uploads/', req.file.filename);
    const stream = fs.createReadStream(filePath);

  
    const options = {
      pinataMetadata: {
        name: req.body.title || req.file.originalname || 'Untitled.html',
        keyvalues: {
          owner: req.body.owner,
          wordCount: req.body.wordCount || 0,
          pageCount: req.body.pageCount || 1
        }
      },
      pinataOptions: { cidVersion: 1 }
    };

    console.log('Uploading to IPFS...');
    const result = await pinata.pinFileToIPFS(stream, options);
    console.log('Pinata success:', result);

  
    fs.unlinkSync(filePath);

  
    const doc = await Document.create({
      title: req.body.title || req.file.originalname || 'Untitled',
      content: req.body.content || '',
      owner: req.body.owner,
      author: req.body.author || req.body.owner,
      wordCount: req.body.wordCount || 0,
      pageCount: req.body.pageCount || 1,
      preview: req.body.preview || '',
      documentAddress: result.IpfsHash 
    });

    res.json({ success: true, ipfsHash: result.IpfsHash, doc });

  } catch (err) {
    console.error('IPFS Upload Error:', err.response?.data || err.message);

    
    if (req.file) {
      const filePath = path.join(__dirname, '../uploads/', req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(500).json({ success: false, message: 'IPFS upload failed', error: err.message });
  }
});

export default router;
