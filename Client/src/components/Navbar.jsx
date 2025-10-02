import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  const [showSidebar, setShowSidebar] = useState(false);
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
  
  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
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
            <div className="profile-avatar">👤</div>
            <div className="profile-info">
              <h4>John Doe</h4>
              <p>john.doe@example.com</p>
            </div>
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
            <button className="sidebar-item logout">
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