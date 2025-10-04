# EtherXWord Vercel Deployment Guide

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **MongoDB Atlas**: Set up cloud database
4. **Email Service**: Gmail app password for OTP

## 🚀 Deployment Steps

### 1. Environment Variables Setup

Create these environment variables in Vercel dashboard:

**Backend Environment Variables:**
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/etherxword
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
PORT=5000
```

**Frontend Environment Variables:**
```
VITE_API_URL=https://your-vercel-app.vercel.app
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel --prod
```

#### Option B: GitHub Integration
1. Connect GitHub repository to Vercel
2. Import project from GitHub
3. Configure build settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `cd Client && npm run build`
   - **Output Directory**: `Client/dist`

### 3. Project Structure for Vercel

```
EtherXWord/
├── vercel.json              # Main deployment config
├── Client/                  # Frontend
│   ├── package.json        # With vercel-build script
│   ├── vite.config.js      # Optimized build config
│   └── dist/               # Build output
├── server/                 # Backend
│   ├── vercel.json         # Server config
│   ├── package.json        # Server dependencies
│   └── src/
│       └── index.js        # Entry point
└── DEPLOYMENT_GUIDE.md     # This file
```

## 🔧 Configuration Files

### Root `vercel.json`
```json
{
  "builds": [
    {
      "src": "server/src/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "Client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "server/src/index.js" },
    { "src": "/(.*)", "dest": "Client/dist/$1" }
  ]
}
```

### Client `package.json` (Add script)
```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

## 🌐 Domain Configuration

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `VITE_API_URL` to use custom domain

### CORS Configuration
Update server CORS settings:
```javascript
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'https://your-custom-domain.com',
    'http://localhost:3000' // For development
  ],
  credentials: true
}));
```

## 📊 Post-Deployment Checklist

### ✅ Verify Deployment
- [ ] Frontend loads correctly
- [ ] API endpoints respond
- [ ] Authentication works
- [ ] Database connection established
- [ ] Email service functional
- [ ] File uploads/exports work

### ✅ Performance Optimization
- [ ] Enable Vercel Analytics
- [ ] Configure caching headers
- [ ] Optimize images and assets
- [ ] Monitor function execution times
- [ ] Set up error tracking

### ✅ Security Checks
- [ ] Environment variables secured
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] HTTPS enforced
- [ ] Security headers enabled

## 🐛 Troubleshooting

### Common Issues

**1. Build Failures**
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
# Verify Node.js version compatibility
```

**2. API Routes Not Working**
```bash
# Check vercel.json routes configuration
# Verify server entry point path
# Ensure environment variables are set
```

**3. Database Connection Issues**
```bash
# Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for Vercel)
# Check connection string format
# Ensure database user has proper permissions
```

**4. CORS Errors**
```bash
# Add Vercel domain to CORS origins
# Check if credentials: true is needed
# Verify API URL in frontend
```

## 📈 Monitoring & Analytics

### Vercel Analytics
```bash
# Enable in Vercel dashboard
# Monitor page views and performance
# Track Core Web Vitals
```

### Function Logs
```bash
# View in Vercel dashboard → Functions tab
# Monitor API response times
# Check for errors and timeouts
```

## 🔄 Continuous Deployment

### Automatic Deployments
- **Production**: Deploys from `main` branch
- **Preview**: Deploys from feature branches
- **Development**: Local development server

### Deployment Hooks
```bash
# Set up webhooks for external triggers
# Configure deployment notifications
# Integrate with monitoring services
```

## 📞 Support Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **MongoDB Atlas**: [mongodb.com/atlas](https://mongodb.com/atlas)
- **React Deployment**: [vitejs.dev/guide/static-deploy](https://vitejs.dev/guide/static-deploy.html)

---

## 🎉 Success!

Your EtherXWord application is now deployed on Vercel with:
- ✅ Frontend and Backend on same domain
- ✅ Serverless functions for API
- ✅ Static site generation for frontend
- ✅ Environment variables configured
- ✅ Custom domain support
- ✅ Automatic deployments from Git

**Live URL**: `https://your-app.vercel.app`