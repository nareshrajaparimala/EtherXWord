# EtherXWord - MERN Authentication System

A complete authentication system for EtherXWord document editor with dark/light themes, responsive design, and smooth animations.

## Features

- 🔐 Complete authentication flow (Sign Up, Sign In, Forgot Password, OTP Verification)
- 🌙 Dark/Light theme toggle with smooth transitions
- 📱 Fully responsive design for mobile and desktop
- ✨ Beautiful animations and modern UI
- 🔒 JWT-based authentication with refresh tokens
- 📧 Email OTP verification system
- 🎨 Yellow/Black color scheme as requested

## Tech Stack

**Frontend:**
- React 18 with Vite
- Vanilla CSS with CSS Variables
- React Router DOM
- Axios for API calls

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Nodemailer for emails
- bcryptjs for password hashing

## Quick Start

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Gmail account for email service

### Installation

1. **Clone and setup:**
```bash
cd EtherXWord
```

2. **Install client dependencies:**
```bash
cd Client
npm install
```

3. **Install server dependencies:**
```bash
cd ../server
npm install
```

4. **Configure environment variables:**

**Client (.env):**
```
VITE_API_URL=http://localhost:5000
```

**Server (.env):**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/etherxword
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

5. **Start the application:**

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd Client
npm run dev
```

6. **Access the application:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password with token

## Features Implemented

### Frontend
- ✅ Responsive design (mobile + desktop)
- ✅ Dark/Light theme toggle
- ✅ Yellow/Black color scheme
- ✅ Smooth animations and transitions
- ✅ Form validation with error handling
- ✅ OTP input with auto-focus
- ✅ Password visibility toggle
- ✅ Loading states and spinners
- ✅ Success/Error messages

### Backend
- ✅ User registration with password hashing
- ✅ JWT authentication with refresh tokens
- ✅ OTP generation and email sending
- ✅ Password reset flow
- ✅ Rate limiting and security middleware
- ✅ MongoDB integration
- ✅ Error handling and validation

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with short expiry (15m access, 7d refresh)
- OTP with 10-minute expiry and attempt limiting
- Rate limiting on API endpoints
- CORS and Helmet security headers
- Input validation and sanitization

## Theme System

The application supports both dark and light themes:

**Dark Theme (Default):**
- Background: Deep black (#0a0a0a)
- Surface: Dark gray (#1a1a1a)
- Text: White/Yellow
- Accents: Gold (#ffd700)

**Light Theme:**
- Background: White (#ffffff)
- Surface: Light gray (#f8f9fa)
- Text: Black/Dark gray
- Accents: Gold (#ffd700)

## Responsive Design

- Mobile-first approach
- Breakpoints at 768px and 480px
- Touch-friendly buttons and inputs
- Optimized typography scaling
- Flexible layouts with CSS Grid/Flexbox

## Future Enhancements

- Google OAuth integration
- IPFS document storage
- Real-time collaboration
- Document versioning
- Advanced user roles

## License

MIT License - see LICENSE file for details.