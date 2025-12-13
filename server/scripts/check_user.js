import Link from 'mongoose';
import connectDB from '../src/config/db.js';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
    try {
        await connectDB();
        console.log('Connected to DB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log({
                id: u._id,
                email: u.email,
                fullName: u.fullName,
                hasPasswordHash: !!u.passwordHash
            });
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
