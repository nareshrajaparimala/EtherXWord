import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Document from '../models/document.model.js';
import OTP from '../models/otp.model.js';
import Activity from '../models/activity.model.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared all users');

    await Document.deleteMany({});
    console.log('Cleared all documents');

    await OTP.deleteMany({});
    console.log('Cleared all OTPs');

    await Activity.deleteMany({});
    console.log('Cleared all activities');

    console.log('Database cleared successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();