# API Testing Guide

## Test User Credentials
- **Email**: test@example.com
- **Password**: Test123!@#
- **Full Name**: Test User

## API Endpoints Testing

### 1. Health Check
```bash
curl -X GET http://localhost:5030/health
```

### 2. Sign Up
```bash
curl -X POST http://localhost:5030/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Sign In
```bash
curl -X POST http://localhost:5030/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 4. Forgot Password
```bash
curl -X POST http://localhost:5030/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### 5. Verify OTP (use OTP from email)
```bash
curl -X POST http://localhost:5030/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 6. Reset Password (use resetToken from verify-otp response)
```bash
curl -X POST http://localhost:5030/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_RESET_TOKEN" \
  -d '{
    "newPassword": "NewTest123!@#",
    "confirmPassword": "NewTest123!@#"
  }'
```

### 7. Refresh Token (use refreshToken from signin response)
```bash
curl -X POST http://localhost:5030/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Frontend Testing

1. **Start the server**: `cd server && npm run dev`
2. **Start the client**: `cd Client && npm run dev`
3. **Open browser**: http://localhost:3000

### Test Flow:
1. Go to Sign Up page
2. Use credentials: test@example.com / Test123!@#
3. Sign in with same credentials
4. Test forgot password flow
5. Toggle dark/light theme
6. Test responsive design on mobile

## Notes:
- Make sure MongoDB is running
- Configure email settings in .env for OTP testing
- All passwords must be at least 8 characters with mixed case, numbers, and symbols