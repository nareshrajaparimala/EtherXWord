import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import { hashPassword } from '../utils/hash.util.js';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const email = 'nareshrajaparimala000@gmail.com';
    const password = 'Naresh@18';
    const fullName = 'Naresh Raja';

    const passwordHash = await hashPassword(password);
    
    const user = new User({
      fullName,
      email,
      passwordHash
    });

    await user.save();
    console.log('Test user created successfully:', email);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();