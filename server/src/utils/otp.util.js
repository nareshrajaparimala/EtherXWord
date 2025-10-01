import crypto from 'crypto';

export const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const getOtpExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};