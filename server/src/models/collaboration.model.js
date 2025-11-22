import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  permission: {
    type: String,
    enum: ['view', 'edit'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    trim: true
  },
  respondedAt: Date
}, {
  timestamps: true
});

collaborationRequestSchema.index({ recipient: 1, status: 1 });
collaborationRequestSchema.index({ sender: 1 });
collaborationRequestSchema.index({ document: 1 });

export default mongoose.model('CollaborationRequest', collaborationRequestSchema);