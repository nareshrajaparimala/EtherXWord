import { useState, useEffect } from 'react';
import IPFSDocuments from './pages/IPFSDocuments';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoadingPage from './components/LoadingPage';
import NotificationContainer from './components/NotificationContainer';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Templates from './pages/Templates';
import DocumentEditor from './pages/DocumentEditor';
import DocumentViewer from './pages/DocumentViewer';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SignUp from './pages/Auth/SignUp';
import SignIn from './pages/Auth/SignIn';
import ForgotPassword from './pages/Auth/ForgotPassword';
import VerifyOtp from './pages/Auth/VerifyOtp';
import ResetPassword from './pages/Auth/ResetPassword';
import './styles/main.css';
import './styles/auth.css';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/editor') || location.pathname.startsWith('/viewer');
  const token = localStorage.getItem('accessToken');

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/ipfs-documents" element={<ProtectedRoute><IPFSDocuments /></ProtectedRoute>} />

        <Route path="/" element={token ? <Navigate to="/home" replace /> : <Navigate to="/signin" replace />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/editor" element={<ProtectedRoute><DocumentEditor /></ProtectedRoute>} />
        <Route path="/editor/:id" element={<ProtectedRoute><DocumentEditor /></ProtectedRoute>} />
        <Route path="/editor/address/:documentAddress" element={<DocumentEditor />} />
        <Route path="/viewer/:documentId" element={<ProtectedRoute><DocumentViewer /></ProtectedRoute>} />
        <Route path="/viewer/address/:documentAddress" element={<DocumentViewer />} />
        <Route path="/viewer/shared/:token" element={<DocumentViewer />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <NotificationContainer />
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user should stay logged in
    const token = localStorage.getItem('accessToken');
    const persist = localStorage.getItem('persistLogin');
    
    // Only clear tokens if user explicitly chose not to be remembered AND there's no valid session
    if (persist === 'false' && !sessionStorage.getItem('sessionActive')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userProfile');
    } else if (token) {
      // Set session as active if user has token
      sessionStorage.setItem('sessionActive', 'true');
    }

    const handleBeforeUnload = () => {
      // Only clear on browser close if user didn't choose "Remember me"
      if (localStorage.getItem('persistLogin') === 'false') {
        sessionStorage.removeItem('sessionActive');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Reduce loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <AppContent />
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;