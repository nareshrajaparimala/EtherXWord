import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import documentRoutes from './routes/document.routes.js';
import activityRoutes from './routes/activity.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import ipfsRoutes from './routes/ipfs.Routes.js';
import notificationRoutes from './routes/notification.routes.js';
import { initializeSocket } from './services/realtime.service.js';
import { startTrashCleanup } from './services/cleanup.service.js';

// Configuration
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize App
const app = express();
const server = http.createServer(app);

// Database Connection
connectDB();

// Middleware
app.use(cors({
    origin: [
        process.env.CLIENT_URL || 'http://localhost:3000',
        'http://localhost:5173', // Vite default
        'http://localhost:3001',
        'http://localhost:3002'
    ],
    credentials: true
}));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Uploads directory
const uploadsDir = path.join(__dirname, '../uploads');
// Ensure uploads directory exists (fs is not imported, relying on existing structure or creation in routes)
// But we can serve it statically if needed
app.use('/uploads', express.static(uploadsDir));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/ipfs', ipfsRoutes);
app.use('/api/notifications', notificationRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('EtherXWord API is running');
});

// Services
initializeSocket(server);
startTrashCleanup();

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5030;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
