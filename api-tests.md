# EtherXWord API Testing Guide

## Authentication APIs

### 1. Sign Up
```bash
curl -X POST http://localhost:5030/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 2. Sign In
```bash
curl -X POST http://localhost:5030/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Forgot Password
```bash
curl -X POST http://localhost:5030/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 4. Verify OTP
```bash
curl -X POST http://localhost:5030/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

### 5. Reset Password
```bash
curl -X POST http://localhost:5030/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_RESET_TOKEN" \
  -d '{"newPassword": "NewTest123!@#", "confirmPassword": "NewTest123!@#"}'
```

### 6. Refresh Token
```bash
curl -X POST http://localhost:5030/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

## Document APIs

### 1. Create Document
```bash
curl -X POST http://localhost:5030/api/documents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title": "My Document", "content": "<p>Hello World</p>"}'
```

### 2. Get User Documents
```bash
curl -X GET http://localhost:5030/api/documents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Document by ID
```bash
curl -X GET http://localhost:5030/api/documents/DOCUMENT_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Update Document
```bash
curl -X PUT http://localhost:5030/api/documents/DOCUMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"title": "Updated Title", "content": "<p>Updated content</p>"}'
```

### 5. Search Documents
```bash
curl -X GET "http://localhost:5030/api/documents/search?q=hello" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. Toggle Favorite
```bash
curl -X PATCH http://localhost:5030/api/documents/DOCUMENT_ID/favorite \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Get Favorites
```bash
curl -X GET http://localhost:5030/api/documents/favorites \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 8. Move to Trash
```bash
curl -X PATCH http://localhost:5030/api/documents/DOCUMENT_ID/trash \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 9. Get Trash Documents
```bash
curl -X GET http://localhost:5030/api/documents/trash \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 10. Generate Share Link
```bash
curl -X POST http://localhost:5030/api/documents/DOCUMENT_ID/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"permission": "view"}'
```

## Collaboration APIs

### 1. Add Collaborator
```bash
curl -X POST http://localhost:5030/api/documents/DOCUMENT_ID/collaborators \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"email": "collaborator@example.com", "permission": "edit"}'
```

### 2. Get Collaborative Documents
```bash
curl -X GET http://localhost:5030/api/collaboration/documents \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Get Version History
```bash
curl -X GET http://localhost:5030/api/documents/DOCUMENT_ID/versions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend URLs

- **Home**: http://localhost:3000/
- **Sign In**: http://localhost:3000/signin
- **Sign Up**: http://localhost:3000/signup
- **Forgot Password**: http://localhost:3000/forgot-password
- **Document Editor**: http://localhost:3000/editor
- **Document Editor (ID)**: http://localhost:3000/editor/:id
- **Document Viewer**: http://localhost:3000/viewer/:id
- **Templates**: http://localhost:3000/templates
- **Profile**: http://localhost:3000/profile
- **Settings**: http://localhost:3000/settings

## Environment Variables

### Client (.env)
```
VITE_API_URL=http://localhost:5030
```

### Server (.env)
```
PORT=5030
MONGODB_URI=mongodb://localhost:27017/etherxword
JWT_SECRET=your-super-secret-jwt-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Test Credentials
- **Email**: test@example.com
- **Password**: Test123!@#
- **Full Name**: Test User