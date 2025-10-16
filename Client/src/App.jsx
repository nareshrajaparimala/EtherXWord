import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoadingPage from './components/LoadingPage';
import NotificationContainer from './components/NotificationContainer';
import ProtectedRoute from './components/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';
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
        <Route path="/" element={token ? <Navigate to="/home" replace /> : <Navigate to="/signin" replace />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
        <Route path="/editor" element={<ProtectedRoute><DocumentEditor /></ProtectedRoute>} />
        <Route path="/editor/:id" element={<ProtectedRoute><DocumentEditor /></ProtectedRoute>} />
        <Route path="/viewer/:documentId" element={<ProtectedRoute><DocumentViewer /></ProtectedRoute>} />
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
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 10 seconds loading

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <NotificationProvider>
      <Router>
        <AppContent />
      </Router>
    </NotificationProvider>
  );
}

export default App;