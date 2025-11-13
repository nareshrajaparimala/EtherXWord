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
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
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
      let updatedUser = { ...user, ...editForm };
      
      // Handle avatar upload if there's a new file
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const avatarResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: formData
        });
        
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          updatedUser.avatar = avatarData.avatarUrl;
        }
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(editForm)
      });
      
      if (response.ok) {
        const profileData = await response.json();
        updatedUser = { ...updatedUser, ...profileData };
        setUser(updatedUser);
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        localStorage.setItem('userProfile', JSON.stringify(updatedUser));
        setSaveMessage('Profile updated successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Error updating profile');
      setTimeout(() => setSaveMessage(''), 3000);
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
        <button onClick={() => navigate(-1)} className="modern-back-btn">
          <i className="ri-arrow-left-s-line"></i>
          <span>Back</span>
        </button>
        <button onClick={() => navigate('/')} className="nav-btn home-btn">
          <i className="ri-home-2-line"></i>
          Home
        </button>
      </div>
      
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-banner">
          <div className="profile-avatar" onClick={() => document.getElementById('avatar-upload').click()}>
            {avatarPreview || user.avatar ? (
              <img src={avatarPreview || user.avatar} alt="Profile" />
            ) : (
              <span>{user.fullName?.charAt(0).toUpperCase()}</span>
            )}
            <div className="avatar-overlay">
              <i className="ri-camera-line"></i>
            </div>
          </div>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setAvatarFile(file);
                const reader = new FileReader();
                reader.onload = (event) => setAvatarPreview(event.target.result);
                reader.readAsDataURL(file);
              }
            }}
          />
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
              {saveMessage && <div className="save-message">{saveMessage}</div>}
            </div>
          ) : (
            <>
              <h1>{user.fullName}</h1>
              <p className="user-email">{user.email}</p>
              <div className="user-meta">
                <span className="join-date">
                  <i className="ri-calendar-2-line"></i>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
                <span className="user-status">
                  <i className="ri-checkbox-circle-line"></i>
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
            <i className="ri-pencil-line"></i>
            Edit Profile
          </button>
        )}
      </div>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-file-list-2-line"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.documentsCreated}</h3>
            <p>Documents Created</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-team-line"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.collaborations}</h3>
            <p>Collaborations</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-font-size-2"></i>
          </div>
          <div className="stat-content">
            <h3>{stats.totalWords.toLocaleString()}</h3>
            <p>Total Words</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <i className="ri-history-line"></i>
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
            <i className="ri-time-line"></i>
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="activity-list">
            {stats.recentActivity.map((item, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  <i className={item.owner ? "ri-file-list-line" : "ri-share-forward-line"}></i>
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
                  <i className="ri-arrow-right-s-line"></i>
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
            <i className="ri-add-circle-line"></i>
            <span>New Document</span>
          </button>
          <button onClick={() => navigate('/', { state: { activeSection: 'All Documents' } })} className="action-card">
            <i className="ri-folder-2-line"></i>
            <span>My Documents</span>
          </button>
          <button onClick={() => navigate('/', { state: { activeSection: 'Collaboration' } })} className="action-card">
            <i className="ri-team-line"></i>
            <span>Collaborations</span>
          </button>
          <button onClick={() => navigate('/settings')} className="action-card">
            <i className="ri-settings-2-line"></i>
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;