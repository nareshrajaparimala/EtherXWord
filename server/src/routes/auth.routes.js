import express from 'express';
import { 
  signup, 
  signin, 
  refreshToken, 
  forgotPassword, 
  verifyOtp, 
  resetPassword 
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;