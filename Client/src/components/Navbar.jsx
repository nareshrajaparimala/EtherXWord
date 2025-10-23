import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import './Navbar.css';

const Navbar = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userProfile');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const isLogoAnimating = useLogoAnimation();
  
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
      fetchNotifications();
    }
  }, []);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        fetchUserProfile();
        fetchNotifications();
      } else {
        setUser(null);
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };
  
  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notification._id}/read`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          // Remove notification from display
          setNotifications(prev => prev.filter(n => n._id !== notification._id));
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          console.error('Failed to mark notification as read:', response.status);
        }
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate based on notification type
    setShowNotifications(false);
    
    switch (notification.type) {
      case 'collaboration_request':
        navigate('/home', { state: { activeSection: 'Collaboration' } });
        break;
      case 'collaboration_accepted':
      case 'collaboration_rejected':
        if (notification.data?.documentId) {
          navigate(`/editor/${notification.data.documentId}`);
        } else {
          navigate('/home');
        }
        break;
      case 'document_shared':
        if (notification.data?.documentId) {
          navigate(`/viewer/${notification.data.documentId}`);
        } else {
          navigate('/home');
        }
        break;
      default:
        navigate('/home');
    }
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
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
      if (!event.target.closest('.notification-dropdown')) {
        setShowNotifications(false);
      }
    };
    
    if (showSidebar || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSidebar, showNotifications]);

  return (
    <>
      <nav className={`navbar ${theme}`}>
        <div className="navbar-left">
          <button 
            className="sidebar-toggle"
            onClick={() => window.dispatchEvent(new CustomEvent('toggleHomeSidebar'))}
            style={{
              background: 'var(--accent-color)',
              border: 'none',
              borderRadius: '8px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '18px',
              fontWeight: 'bold',
              marginRight: '16px'
            }}
          >
            ☰
          </button>
          <div className="navbar-logo">
            <Logo size={28} className={isLogoAnimating ? 'animate' : ''} />
            <span className="logo-text-main">EtherXWord</span>
          </div>
        </div>
        
        <div className="navbar-right">
          <div className="notification-dropdown">
            <button 
              className="nav-icon"
              aria-label="Notifications"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="ri-notification-3-line"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {showNotifications && (
              <div className="dropdown-menu">
                <div className="notification-header">
                  <h4>Notifications</h4>
                </div>
                {notifications.length === 0 ? (
                  <div className="notification-item">
                    <span className="notification-text">No new notifications</span>
                  </div>
                ) : (
                  notifications.slice(0, 5).map(notification => (
                    <div 
                      key={notification._id} 
                      className={`notification-item ${!notification.isRead ? 'unread' : ''} clickable`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <span className="notification-text">{notification.message}</span>
                      <span className="notification-time">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
                <div className="notification-footer">
                  <button className="clear-all-btn" onClick={async () => {
                    try {
                      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
                        method: 'PATCH',
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      
                      if (response.ok) {
                        setUnreadCount(0);
                        setNotifications([]);
                      } else {
                        console.error('Failed to mark all notifications as read:', response.status);
                      }
                    } catch (error) {
                      console.error('Error marking all notifications as read:', error);
                    }
                  }}>Mark All Read</button>
                </div>
              </div>
            )}
          </div>
          
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
            <i className="ri-user-line"></i>
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
            <button className="sidebar-item" onClick={() => { navigate('/profile'); setShowSidebar(false); }}>
              <span className="item-icon">👤</span>
              <span>Profile</span>
            </button>
            <button className="sidebar-item" onClick={() => { navigate('/settings'); setShowSidebar(false); }}>
              <span className="item-icon">⚙️</span>
              <span>Settings</span>
            </button>
            <button className="sidebar-item" onClick={() => { navigate('/home'); setShowSidebar(false); }}>
              <span className="item-icon">📊</span>
              <span>Dashboard</span>
            </button>
            <button className="sidebar-item" onClick={() => { navigate('/templates'); setShowSidebar(false); }}>
              <span className="item-icon">📄</span>
              <span>Templates</span>
            </button>
            <button className="sidebar-item" onClick={() => { navigate('/home'); setShowSidebar(false); }}>
              <span className="item-icon">📝</span>
              <span>My Documents</span>
            </button>
            <button className="sidebar-item">
              <span className="item-icon"><i className="ri-notification-3-line"></i></span>
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