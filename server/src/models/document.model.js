import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: {
    type: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      permission: {
        type: String,
        enum: ['view', 'edit'],
        default: 'view'
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    default: []
  },
  shareSettings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    shareLink: {
      type: String,
      unique: true,
      sparse: true
    },
    linkPermission: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    }
  },
  // Enhanced document structure
  pages: {
    type: [{
      id: Number,
      content: String,
      pageNumber: Number,
      headerText: String,
      footerText: String
    }],
    default: [{ id: 1, content: '', pageNumber: 1, headerText: '', footerText: '' }]
  },
  // Document formatting
  formatting: {
    defaultFont: {
      family: { type: String, default: 'Georgia' },
      size: { type: String, default: '12pt' },
      lineHeight: { type: String, default: '1.5' },
      color: { type: String, default: '#333333' }
    },
    pageBorder: {
      enabled: { type: Boolean, default: false },
      color: { type: String, default: '#FFD700' },
      width: { type: String, default: '2px' },
      style: { type: String, default: 'solid' },
      position: { type: String, default: 'all' }
    },
    watermark: {
      enabled: { type: Boolean, default: false },
      type: { type: String, enum: ['text', 'image'], default: 'text' },
      text: { type: String, default: 'CONFIDENTIAL' },
      opacity: { type: Number, default: 0.3 },
      size: { type: Number, default: 48 },
      color: { type: String, default: '#cccccc' },
      rotation: { type: Number, default: 45 }
    },
    pageNumbering: {
      enabled: { type: Boolean, default: true },
      position: { type: String, default: 'bottom-right' },
      format: { type: String, default: '1' }
    }
  },
  // Document metadata
  lastModified: {
    type: Date,
    default: Date.now
  },
  wordCount: {
    type: Number,
    default: 0
  },
  pageCount: {
    type: Number,
    default: 1
  },
  // Document status
  isFavorite: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  isStartDocument: {
    type: Boolean,
    default: false
  },
  // Version control
  version: {
    type: Number,
    default: 1
  },
  versionHistory: {
    type: [{
      version: Number,
      content: String,
      timestamp: { type: Date, default: Date.now },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      changes: String
    }],
    default: []
  },
  // Document address/ID for sharing
  documentAddress: {
    type: String,
    unique: true,
    required: true
  }
}, {
  timestamps: true
});

// Generate unique document address before saving
documentSchema.pre('save', function(next) {
  if (this.isNew && !this.documentAddress) {
    // Create a more readable document address based on title
    const titleSlug = this.title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 6);
    this.documentAddress = `${titleSlug}-${timestamp}-${randomId}`;
  }
  
  // Update word count if content changed
  if (this.isModified('content') || this.isModified('pages')) {
    let totalContent = this.content || '';
    if (this.pages && this.pages.length > 0) {
      totalContent += ' ' + this.pages.map(p => p.content || '').join(' ');
    }
    this.wordCount = totalContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  
  next();
});

// Indexes for performance
documentSchema.index({ owner: 1 });
documentSchema.index({ 'collaborators.user': 1 });
documentSchema.index({ 'shareSettings.shareLink': 1 }, { sparse: true });
documentSchema.index({ owner: 1, isDeleted: 1 });
documentSchema.index({ owner: 1, isFavorite: 1 });
documentSchema.index({ documentAddress: 1 }, { unique: true });

// Text search indexes
documentSchema.index({ 
  title: 'text', 
  content: 'text',
  'pages.content': 'text'
}, {
  weights: {
    title: 10,
    content: 5,
    'pages.content': 3
  },
  name: 'document_text_search'
});

// Compound indexes for common queries
documentSchema.index({ owner: 1, lastModified: -1 });
documentSchema.index({ owner: 1, title: 1 });
documentSchema.index({ 'collaborators.user': 1, lastModified: -1 });

export default mongoose.model('Document', documentSchema);