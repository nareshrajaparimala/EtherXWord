import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { startTrashCleanup } from './services/cleanup.service.js';

// ✅ Routes
import authRoutes from './routes/auth.routes.js';
import collaborationRoutes from './routes/collaboration.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import documentRoutes from './routes/document.routes.js';
import activityRoutes from './routes/activity.routes.js';
import ipfsRoutes from './routes/ipfs.Routes.js'; // ✅ Make sure filename is lowercase

// ✅ Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5031;

// ✅ Connect to MongoDB
connectDB().catch(err => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});

// ✅ Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      'https://etherxword.netlify.app',
      'https://ether-x-word-ba14avyrv-nareshrajaparimalas-projects.vercel.app',
      'https://ether-x-word.vercel.app',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  })
);

// ✅ Rate limiting (1 minute window, 1000 requests)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
});
app.use(limiter);

// ✅ Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ Register routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ipfs', ipfsRoutes); // ✅ IPFS route properly registered

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ Root route
app.get('/', (req, res) => {
  res.json({
    message: 'EtherXWord API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documents: '/api/documents',
      ipfs: '/api/ipfs/upload',
      health: '/health',
    },
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });
  res.status(500).json({
    message: 'Server error',
    error:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
});

// ✅ 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Start the server
server.listen(PORT, () => {
  console.log('Server running on port ${PORT}');
  console.log('🌍 Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Missing',
    JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Missing',
    EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Missing',
  });

  // Start cleanup service
  startTrashCleanup();
});