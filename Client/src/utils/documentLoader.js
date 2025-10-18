// Document Loader Utility for Quick Access
// This utility provides safe document loading that preserves all document data

export const DocumentLoader = {
  // Load document by setting ID in localStorage and navigating to editor
  loadDocument: (documentId, navigate) => {
    if (!documentId) {
      console.error('Document ID is required');
      return false;
    }

    try {
      // Verify document exists
      const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      const doc = savedDocs.find(d => d.id === documentId);
      
      if (!doc) {
        console.error('Document not found');
        return false;
      }

      // Set document ID for editor to load
      localStorage.setItem('currentDocumentId', documentId);
      
      // Navigate to editor
      if (navigate) {
        navigate('/editor');
      } else {
        window.location.href = '/editor';
      }
      
      return true;
    } catch (error) {
      console.error('Error loading document:', error);
      return false;
    }
  },

  // Load document directly if editor is already open
  loadDocumentDirect: (documentId) => {
    if (typeof window !== 'undefined' && window.EtherXWordEditor) {
      return window.EtherXWordEditor.loadSavedDocument(documentId);
    }
    
    console.warn('EtherXWordEditor not available. Use loadDocument with navigation instead.');
    return false;
  },

  // Get all saved documents
  getSavedDocuments: () => {
    try {
      return JSON.parse(localStorage.getItem('documents') || '[]');
    } catch (error) {
      console.error('Error getting saved documents:', error);
      return [];
    }
  },

  // Get recent documents
  getRecentDocuments: () => {
    try {
      return JSON.parse(localStorage.getItem('recentDocuments') || '[]');
    } catch (error) {
      console.error('Error getting recent documents:', error);
      return [];
    }
  },

  // Delete document
  deleteDocument: (documentId) => {
    try {
      const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      const docIndex = savedDocs.findIndex(d => d.id === documentId);
      
      if (docIndex === -1) {
        console.error('Document not found');
        return false;
      }

      const doc = savedDocs[docIndex];
      
      // Move to deleted documents
      const deletedDocs = JSON.parse(localStorage.getItem('deletedDocuments') || '[]');
      deletedDocs.unshift({
        ...doc,
        deletedAt: new Date().toISOString(),
        deletedBy: 'User'
      });
      localStorage.setItem('deletedDocuments', JSON.stringify(deletedDocs));
      
      // Remove from active documents
      savedDocs.splice(docIndex, 1);
      localStorage.setItem('documents', JSON.stringify(savedDocs));
      
      // Remove from recent documents
      const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
      const filteredRecent = recentDocs.filter(d => d.title !== doc.title);
      localStorage.setItem('recentDocuments', JSON.stringify(filteredRecent));
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  },

  // Duplicate document
  duplicateDocument: (documentId) => {
    try {
      const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      const doc = savedDocs.find(d => d.id === documentId);
      
      if (!doc) {
        console.error('Document not found');
        return false;
      }

      const duplicatedDoc = {
        ...doc,
        id: Date.now().toString(),
        title: `${doc.title} (Copy)`,
        lastModified: new Date().toISOString()
      };
      
      savedDocs.push(duplicatedDoc);
      localStorage.setItem('documents', JSON.stringify(savedDocs));
      
      return duplicatedDoc.id;
    } catch (error) {
      console.error('Error duplicating document:', error);
      return false;
    }
  }
};

// Export for global access
if (typeof window !== 'undefined') {
  window.DocumentLoader = DocumentLoader;
}

export default DocumentLoader;