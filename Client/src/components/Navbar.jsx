import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userProfile');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const sidebarRef = useRef(null);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.body.className = newTheme;
  };
  
  useEffect(() => {
    document.body.className = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      fetchUserProfile();
    }
  }, []);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetchUserProfile();
      } else {
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      console.log('Token:', token);
      
      if (!token) {
        console.log('No token found');
        setUser(null);
        return;
      }
      
      console.log('Fetching profile from:', 'http://localhost:5030/api/auth/profile');
      const response = await fetch('http://localhost:5030/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User data received:', userData);
        setUser(userData);
        localStorage.setItem('userProfile', JSON.stringify(userData));
      } else {
        const errorText = await response.text();
        console.error('Profile fetch failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userProfile');
      }
    } catch (error) {
      console.error('Network error fetching user profile:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setUser(null);
      localStorage.removeItem('userProfile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userProfile');
    setUser(null);
    setShowSidebar(false);
    window.location.href = '/signin';
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };
    
    if (showSidebar) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar]);

  return (
    <>
      <nav className={`navbar ${theme}`}>
        <div className="navbar-left">
          <div className="navbar-logo">
            <span className="logo-text">EtherXWord</span>
          </div>
        </div>
        
        <div className="navbar-right">
          <button 
            className="nav-icon"
            aria-label="Notifications"
          >
            🔔
          </button>
          
          <button 
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          <button 
            className="nav-icon profile-btn"
            onClick={toggleSidebar}
            aria-label="Profile"
          >
            👤
          </button>
        </div>
      </nav>
      
      {showSidebar && <div className="sidebar-overlay" onClick={() => setShowSidebar(false)} />}
      
      <div ref={sidebarRef} className={`right-sidebar ${showSidebar ? 'open' : ''} ${theme}`}>
        <div className="sidebar-header">
          <h3>Profile Menu</h3>
          <button className="close-btn" onClick={() => setShowSidebar(false)}>✕</button>
        </div>
        
        <div className="sidebar-content">
          <div className="profile-section">
            {loading ? (
              <div className="profile-loading">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
              </div>
            ) : user && user.fullName && user.email ? (
              <>
                <div className="profile-avatar">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h4>{user.fullName}</h4>
                  <p>{user.email}</p>
                </div>
              </>
            ) : (
              <>
                <div className="profile-avatar">👤</div>
                <div className="profile-info">
                  <h4>Guest User</h4>
                  <p>Please sign in</p>
                  <small style={{color: '#666'}}>Token: {localStorage.getItem('accessToken') ? 'Present' : 'Missing'}</small>
                  <button onClick={fetchUserProfile} style={{marginTop: '10px', padding: '5px 10px', fontSize: '12px'}}>Refresh Profile</button>
                </div>
              </>
            )}
          </div>
          
          <div className="sidebar-menu">
            <button className="sidebar-item">
              <span className="item-icon">👤</span>
              <span>Profile</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon">⚙️</span>
              <span>Settings</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon">📊</span>
              <span>Dashboard</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon">📄</span>
              <span>Documents</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon">🔔</span>
              <span>Notifications</span>
            </button>
            <button className="sidebar-item logout" onClick={handleLogout}>
              <span className="item-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;