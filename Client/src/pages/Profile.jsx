import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    documentsCreated: 0,
    collaborations: 0,
    totalWords: 0,
    recentActivity: []
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', email: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchUserStats();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setEditForm({ fullName: userData.fullName, email: userData.email });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const [docsResponse, collabResponse] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/documents`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/api/collaboration/documents`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        })
      ]);
      
      const docs = docsResponse.ok ? await docsResponse.json() : [];
      const collabs = collabResponse.ok ? await collabResponse.json() : [];
      
      const totalWords = docs.reduce((sum, doc) => sum + (doc.wordCount || 0), 0);
      
      setStats({
        documentsCreated: docs.length,
        collaborations: collabs.length,
        totalWords,
        recentActivity: [...docs, ...collabs]
          .sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified))
          .slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditing(false);
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <i className="ri-user-line"></i>
          <h3>Profile not found</h3>
          <button onClick={() => navigate('/')} className="btn btn-primary">Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Navigation */}
      <div className="profile-nav">
        <button onClick={() => navigate(-1)} className="nav-btn back-btn">
          <i className="ri-arrow-left-line"></i>
          Back
        </button>
        <button onClick={() => navigate('/')} className="nav-btn home-btn">
          <i className="ri-home-line"></i>
          Home
        </button>
      </div>
      
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-avatar">
            <span>{user.fullName?.charAt(0).toUpperCase()}</span>
          </div>
        </div>
        
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-form">
              <input
                type="text"
                value={editForm.fullName}
                onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                className="edit-input"
                placeholder="Full Name"
              />
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="edit-input"
                placeholder="Email"
              />
              <div className="edit-actions">
                <button onClick={handleSaveProfile} className="btn btn-primary">Save</button>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{user.fullName}</h1>
              <p className="user-email">{user.email}</p>
              <div className="user-meta">
                <span className="join-date">
                  <i className="ri-calendar-line"></i>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span className="user-status">
                  <i className="ri-shield-check-line"></i>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
            </>
          )}
        </div>
        
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)} 
            className="edit-profile-btn"
          >
            <i className="ri-edit-line"></i>
            Edit Profile
          </button>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-file-text-line"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.documentsCreated}</h3>
            <p>Documents Created</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-group-line"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.collaborations}</h3>
            <p>Collaborations</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-text"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalWords.toLocaleString()}</h3>
            <p>Total Words</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-time-line"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.recentActivity.length}</h3>
            <p>Recent Activity</p>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="activity-section">
        <h2>Recent Activity</h2>
        {stats.recentActivity.length === 0 ? (
          <div className="empty-activity">
            <i className="ri-history-line"></i>
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="activity-list">
            {stats.recentActivity.map((item, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <i className={item.owner ? "ri-file-text-line" : "ri-share-line"}></i>
                </div>
                <div className="activity-content">
                  <h4>{item.title}</h4>
                  <p>{item.owner ? 'Document created' : 'Collaboration'}</p>
                  <span className="activity-time">
                    {new Date(item.lastModified).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  onClick={() => navigate(item.owner ? `/editor/${item._id}` : `/viewer/${item._id}`)}
                  className="activity-action"
                >
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/editor')} className="action-card">
            <i className="ri-add-line"></i>
            <span>New Document</span>
          </button>
          <button onClick={() => navigate('/', { state: { activeSection: 'All Documents' } })} className="action-card">
            <i className="ri-folder-line"></i>
            <span>My Documents</span>
          </button>
          <button onClick={() => navigate('/', { state: { activeSection: 'Collaboration' } })} className="action-card">
            <i className="ri-group-line"></i>
            <span>Collaborations</span>
          </button>
          <button onClick={() => navigate('/settings')} className="action-card">
            <i className="ri-settings-line"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;