# EtherXWord - Advanced Document Editor

A comprehensive MERN stack document editor with real-time collaboration, advanced formatting, and professional document management features.

## 🚀 How to Run the Project

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Gmail account for email service

### Installation & Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd EtherXWord
```

2. **Install dependencies**
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../Client
npm install
```

3. **Environment Configuration**

**Server (.env)**
```env
PORT=5030
MONGODB_URI=mongodb+srv://EtherXuser:EtherXWordPassword@etherx.bxnyg9g.mongodb.net/etherxword?retryWrites=true&w=majority&appName=EtherX
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
EMAIL_USER=nareshrajaparimala000@gmail.com
EMAIL_PASS=cyepkcownjobkccw
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:5030
```

4. **Start the application**
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd Client
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend: http://localhost:5030

## ✅ Features Implemented

### Authentication & Security
- Complete JWT-based authentication system
- Email OTP verification for password reset
- Secure password hashing with bcrypt
- Refresh token mechanism
- Rate limiting and security middleware

### Document Management
- Advanced rich text editor with formatting tools
- Multi-page document support with A4 formatting
- Real-time auto-save functionality
- Document search and filtering
- Favorite documents system
- Trash/restore functionality
- Version history and document restoration

### Advanced Editor Features
- Professional formatting tools (fonts, colors, alignment)
- Custom list styles with icons
- Image upload and manipulation
- Page borders and watermarks
- Headers and footers with page numbering
- Find and replace functionality
- Undo/redo operations
- Template system

### Collaboration Features
- Real-time document sharing
- Collaborator management with permissions
- Document viewer for shared documents
- Share link generation with access control
- Collaboration requests system

### Export & Import
- PDF export with perfect formatting preservation
- DOCX export functionality
- Multiple file format import support
- Template loading system

### UI/UX Features
- Dark/Light theme toggle
- Fully responsive design
- Modern animations and transitions
- Professional yellow/black color scheme
- Mobile-optimized interface
- Loading states and notifications

## 🔄 Features Pending

### Real-time Collaboration
- Live cursor tracking
- Real-time text synchronization
- WebSocket integration for instant updates

### Advanced Features
- Google OAuth integration
- IPFS document storage
- Advanced user roles and permissions
- Document analytics and insights
- Advanced template marketplace

### Enhanced Export Options
- PowerPoint export
- Advanced PDF customization
- Batch export functionality

## 🛠 Complete Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Vanilla CSS with CSS Variables
- **Routing**: React Router DOM v6
- **HTTP Client**: Fetch API
- **PDF Generation**: jsPDF + html2canvas
- **Document Export**: docx library
- **File Handling**: file-saver

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer
- **Security**: Helmet, CORS
- **Validation**: Express-validator

### Development Tools
- **Build Tool**: Vite
- **Package Manager**: npm
- **Environment**: dotenv
- **Development**: nodemon

## 🌐 All URLs and API Endpoints

### Frontend Routes
- `/` - Home dashboard
- `/signin` - User login
- `/signup` - User registration
- `/forgot-password` - Password reset request
- `/verify-otp` - OTP verification
- `/reset-password` - Password reset
- `/editor` - New document editor
- `/editor/:id` - Edit existing document
- `/viewer/:id` - View shared document
- `/templates` - Template gallery
- `/profile` - User profile
- `/settings` - Application settings

### Backend API Endpoints

#### Authentication APIs
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/reset-password` - Reset password

#### Document APIs
- `GET /api/documents` - Get user documents
- `POST /api/documents` - Create new document
- `GET /api/documents/search` - Search documents
- `GET /api/documents/favorites` - Get favorite documents
- `GET /api/documents/trash` - Get deleted documents
- `GET /api/documents/:id` - Get document by ID
- `PUT /api/documents/:id` - Update document
- `PATCH /api/documents/:id/favorite` - Toggle favorite
- `PATCH /api/documents/:id/trash` - Move to trash
- `PATCH /api/documents/:id/restore` - Restore from trash
- `DELETE /api/documents/:id/permanent` - Permanently delete
- `POST /api/documents/:id/share` - Generate share link
- `GET /api/documents/shared/:token` - Access shared document

#### Collaboration APIs
- `GET /api/collaboration/documents` - Get collaborative documents
- `POST /api/documents/:id/collaborators` - Add collaborator
- `DELETE /api/documents/:id/collaborators/:userId` - Remove collaborator
- `GET /api/documents/:id/versions` - Get version history
- `POST /api/documents/:id/restore-version` - Restore version

## 📊 Current Project Status

### ✅ Completed (95%)
- Full authentication system with email verification
- Advanced document editor with professional features
- Document management (CRUD, search, favorites, trash)
- Multi-page document support with A4 formatting
- Export functionality (PDF, DOCX)
- Import support for multiple file formats
- Collaboration system with sharing and permissions
- Version control and document history
- Responsive UI with dark/light themes
- Professional styling and animations

### 🔄 In Progress (5%)
- Real-time collaboration features
- Advanced template marketplace
- Performance optimizations

### 🎯 Production Ready
The application is fully functional and ready for production deployment with:
- Secure authentication and authorization
- Complete document management system
- Professional document editing capabilities
- Collaboration and sharing features
- Export/import functionality
- Responsive and accessible UI

## 📝 API Testing
See `api-tests.md` for comprehensive API testing guide with curl commands and test credentials.

## 🔒 Security Features
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- OTP verification with time limits
- Rate limiting on sensitive endpoints
- CORS and security headers
- Input validation and sanitization
- Secure document sharing with access control

## 📱 Responsive Design
- Mobile-first approach
- Breakpoints: 480px, 768px, 1024px
- Touch-friendly interface
- Optimized for all screen sizes
- Progressive Web App ready

## 🎨 Theme System
- **Dark Theme**: Professional black/yellow scheme
- **Light Theme**: Clean white/gold scheme
- Smooth theme transitions
- System preference detection
- Persistent theme selection

## 📄 License
MIT License - Open source and free to use.