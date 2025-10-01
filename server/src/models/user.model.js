import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  authProviders: {
    type: [String],
    default: ['local']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  roles: {
    type: [String],
    default: ['user']
  },
  refreshTokens: [{
    tokenHash: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }],
  ipfsCIDs: [{
    cid: String,
    createdAt: { type: Date, default: Date.now },
    metadata: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);