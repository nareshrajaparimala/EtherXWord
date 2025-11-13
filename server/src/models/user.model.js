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
  }],
  profile: {
    bio: {
      type: String,
      default: '',
      maxlength: 500
    },
    location: {
      type: String,
      default: '',
      maxlength: 100
    },
    website: {
      type: String,
      default: '',
      maxlength: 200
    },
    avatar: {
      type: String,
      default: ''
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'auto'],
      default: 'dark'
    },
    language: {
      type: String,
      default: 'en'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    defaultFont: {
      type: String,
      default: 'Georgia'
    },
    defaultFontSize: {
      type: String,
      default: '12pt'
    },
    pageSize: {
      type: String,
      default: 'A4'
    },
    showLineNumbers: {
      type: Boolean,
      default: false
    },
    spellCheck: {
      type: Boolean,
      default: true
    },
    wordWrap: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'friends'],
      default: 'public'
    },
    documentSharing: {
      type: Boolean,
      default: true
    },
    activityStatus: {
      type: Boolean,
      default: true
    },
    dataCollection: {
      type: Boolean,
      default: true
    }
  },
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    loginAlerts: {
      type: Boolean,
      default: true
    },
    sessionTimeout: {
      type: String,
      default: '30'
    },
    passwordLastChanged: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);