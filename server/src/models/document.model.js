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
  lastModified: {
    type: Date,
    default: Date.now
  },
  wordCount: {
    type: Number,
    default: 0
  },
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
  }
}, {
  timestamps: true
});

documentSchema.index({ owner: 1 });
documentSchema.index({ 'collaborators.user': 1 });
documentSchema.index({ 'shareSettings.shareLink': 1 }, { sparse: true });
documentSchema.index({ owner: 1, isDeleted: 1 });
documentSchema.index({ owner: 1, isFavorite: 1 });

export default mongoose.model('Document', documentSchema);