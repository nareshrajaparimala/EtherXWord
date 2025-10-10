import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'edited', 'shared', 'collaborated', 'viewed'],
    required: true
  },
  details: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

activitySchema.index({ document: 1, createdAt: -1 });
activitySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Activity', activitySchema);