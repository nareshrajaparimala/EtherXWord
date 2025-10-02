import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem('userProfile');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  if (!user) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
        <h1>Profile</h1>
      </div>
      
      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-large">
            {user.fullName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h2>{user.fullName || 'User'}</h2>
          <p>{user.email || 'No email'}</p>
          
          <div className="profile-actions">
            <button className="btn btn-primary">Edit Profile</button>
            <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;