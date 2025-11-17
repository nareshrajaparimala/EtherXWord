import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import OTP from '../models/otp.model.js';
import { hashPassword, comparePassword, hashOtp, compareOtp } from '../utils/hash.util.js';
import { generateOtp, getOtpExpiry } from '../utils/otp.util.js';
import { sendOtpEmail, sendWelcomeEmail } from '../utils/email.util.js';

const generateTokens = (userId, rememberMe = false) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TTL || '15m'
  });
  
  const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: rememberMe ? '30d' : (process.env.JWT_REFRESH_TTL || '7d')
  });

  return { accessToken, refreshToken };
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const passwordHash = await hashPassword(password);
    const user = new User({
      fullName,
      email,
      passwordHash
    });

    await user.save();
    
    try {
      await sendWelcomeEmail(email, fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const signin = async (req, res) => {
  try {
    console.log('Signin request:', req.body);
    const { email, password, rememberMe } = req.body;

    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found, verifying password');
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password valid, generating tokens');
    const { accessToken, refreshToken } = generateTokens(user._id, rememberMe);

    console.log('Signin successful for user:', email);
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Signin error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const { accessToken } = generateTokens(decoded.userId);

    res.json({ accessToken });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    console.log('Forgot password request:', req.body);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('Looking for user with email:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found for email:', email);
      if (process.env.NODE_ENV === 'development') {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({ message: 'If email exists, OTP sent' });
    }

    console.log('User found, deleting old OTPs');
    await OTP.deleteMany({ email });

    console.log('Generating new OTP');
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);
    const expiresAt = getOtpExpiry();

    console.log('Creating OTP record');
    await OTP.create({
      email,
      otpHash,
      expiresAt
    });

    console.log('Attempting to send OTP email');
    try {
      await sendOtpEmail(email, otp, user.fullName);
      console.log('OTP email sent successfully');
    } catch (emailError) {
      console.error('Failed to send OTP email:', {
        error: emailError.message,
        code: emailError.code,
        response: emailError.response,
        stack: emailError.stack
      });
      return res.status(500).json({ 
        message: 'Failed to send OTP',
        error: process.env.NODE_ENV === 'development' ? emailError.message : 'Email service unavailable'
      });
    }

    res.json({ message: 'If email exists, OTP sent' });
  } catch (error) {
    console.error('Forgot password error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (otpRecord.attempts >= 5) {
      await OTP.deleteOne({ email });
      return res.status(429).json({ message: 'Too many attempts' });
    }

    const isValidOtp = await compareOtp(otp, otpRecord.otpHash);
    if (!isValidOtp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await OTP.deleteOne({ email });

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: process.env.RESET_TOKEN_TTL || '15m'
    });

    res.json({ resetToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const authHeader = req.headers['authorization'];
    const resetToken = authHeader && authHeader.split(' ')[1];

    if (!resetToken) {
      return res.status(401).json({ message: 'Reset token required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordHash = await hashPassword(newPassword);
    user.passwordHash = passwordHash;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid reset token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};