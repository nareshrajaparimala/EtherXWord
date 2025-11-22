import Document from '../models/document.model.js';
import cron from 'node-cron';

// Auto-delete documents from trash after 1 hour
export const startTrashCleanup = () => {
  // Run every 10 minutes to check for expired trash documents
  cron.schedule('*/10 * * * *', async () => {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
      
      const expiredDocuments = await Document.find({
        isDeleted: true,
        deletedAt: { $lt: oneHourAgo }
      });

      if (expiredDocuments.length > 0) {
        await Document.deleteMany({
          isDeleted: true,
          deletedAt: { $lt: oneHourAgo }
        });
        
        console.log(`Auto-deleted ${expiredDocuments.length} expired documents from trash`);
      }
    } catch (error) {
      console.error('Trash cleanup error:', error);
    }
  });
  
  console.log('Trash cleanup service started - documents will be auto-deleted after 1 hour');
};