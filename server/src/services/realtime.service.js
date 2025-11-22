import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Document from '../models/document.model.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Join document room
    socket.on('join-document', async (documentId) => {
      try {
        const document = await Document.findById(documentId);
        if (!document) return;

        // Check if user has access
        const isOwner = document.owner.toString() === socket.userId;
        const isCollaborator = document.collaborators.some(c => c.user.toString() === socket.userId);
        
        if (isOwner || isCollaborator) {
          socket.join(documentId);
          socket.documentId = documentId;
          
          // Notify others that user joined
          socket.to(documentId).emit('user-joined', {
            userId: socket.userId,
            timestamp: new Date()
          });
        }
      } catch (error) {
        console.error('Join document error:', error);
      }
    });

    // Handle document changes
    socket.on('document-change', (data) => {
      if (socket.documentId) {
        socket.to(socket.documentId).emit('document-change', {
          ...data,
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Handle cursor position
    socket.on('cursor-position', (data) => {
      if (socket.documentId) {
        socket.to(socket.documentId).emit('cursor-position', {
          ...data,
          userId: socket.userId
        });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.documentId) {
        socket.to(socket.documentId).emit('user-left', {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
      console.log('User disconnected:', socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};