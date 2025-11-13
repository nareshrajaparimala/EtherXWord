import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import './Settings.css';

const Settings = () => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [animateTab, setAnimateTab] = useState(false);
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    avatar: '',
    bio: '',
    location: '',
    website: ''
  });
  
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    autoSave: true,
    notifications: true,
    emailNotifications: true,
    defaultFont: 'Georgia',
    defaultFontSize: '12pt',
    pageSize: 'A4',
    showLineNumbers: false,
    spellCheck: true,
    wordWrap: true
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    documentSharing: 'enabled',
    activityStatus: true,
    dataCollection: true
  });
  
  const [security, setSecurity] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '30',
    passwordLastChanged: null
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
    { id: 'preferences', label: 'Preferences', icon: 'ri-settings-3-line' },
    { id: 'privacy', label: 'Privacy', icon: 'ri-shield-user-line' },
    { id: 'security', label: 'Security', icon: 'ri-lock-line' },
    { id: 'notifications', label: 'Notifications', icon: 'ri-notification-3-line' },
    { id: 'storage', label: 'Storage', icon: 'ri-hard-drive-2-line' },
    { id: 'account', label: 'Account', icon: 'ri-user-settings-line' }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile || {});
        setPreferences(data.preferences || {});
        setPrivacy(data.privacy || {});
        setSecurity(data.security || {});
        // Update localStorage with server data
        localStorage.setItem('userProfile', JSON.stringify(data.profile || {}));
        localStorage.setItem('userPreferences', JSON.stringify(data.preferences || {}));
        localStorage.setItem('userPrivacy', JSON.stringify(data.privacy || {}));
        localStorage.setItem('userSecurity', JSON.stringify(data.security || {}));
      } else {
        // Fallback to localStorage
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        setUserProfile(profile);
        const savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPrefs }));
        const savedPrivacy = JSON.parse(localStorage.getItem('userPrivacy') || '{}');
        setPrivacy(prev => ({ ...prev, ...savedPrivacy }));
        const savedSecurity = JSON.parse(localStorage.getItem('userSecurity') || '{}');
        setSecurity(prev => ({ ...prev, ...savedSecurity }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fallback to localStorage
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      setUserProfile(profile);
      const savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
      setPreferences(prev => ({ ...prev, ...savedPrefs }));
      const savedPrivacy = JSON.parse(localStorage.getItem('userPrivacy') || '{}');
      setPrivacy(prev => ({ ...prev, ...savedPrivacy }));
      const savedSecurity = JSON.parse(localStorage.getItem('userSecurity') || '{}');
      setSecurity(prev => ({ ...prev, ...savedSecurity }));
    }
  };

  const saveSettings = async (section, data) => {
    try {
      localStorage.setItem(`user${section.charAt(0).toUpperCase() + section.slice(1)}`, JSON.stringify(data));
      
      // Also save to server if needed
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ section, data })
      });
      
      if (response.ok) {
        showNotification('Settings saved successfully!', 'success');
        return true;
      } else {
        showNotification('Failed to save settings on server', 'error');
        return false;
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Failed to save settings', 'error');
      return false;
    }
  };

  // Update local profile state only. Persist when user clicks Save.
  const handleProfileUpdate = (field, value) => {
    const updated = { ...userProfile, [field]: value };
    setUserProfile(updated);
  };

  const submitProfileChanges = async () => {
    setIsLoading(true);
    const ok = await saveSettings('profile', userProfile);
    setIsLoading(false);
    return ok;
  };

  const cancelProfileChanges = () => {
    // reload profile from localStorage
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    setUserProfile(profile);
    showNotification('Changes reverted', 'info');
  };

  const handlePreferenceUpdate = (field, value) => {
    const updated = { ...preferences, [field]: value };
    setPreferences(updated);
    saveSettings('preferences', updated);
    
    // Apply theme immediately with animation
    if (field === 'theme') {
      document.body.style.transition = 'all 0.5s ease';
      document.documentElement.setAttribute('data-theme', value);
      localStorage.setItem('theme', value);
      setTimeout(() => {
        document.body.style.transition = '';
      }, 500);
    }
  };

  const handlePrivacyUpdate = (field, value) => {
    const updated = { ...privacy, [field]: value };
    setPrivacy(updated);
    saveSettings('privacy', updated);
  };

  const handleSecurityUpdate = (field, value) => {
    const updated = { ...security, [field]: value };
    setSecurity(updated);
    saveSettings('security', updated);
  };

  const exportData = () => {
    const data = {
      profile: userProfile,
      preferences,
      privacy,
      documents: JSON.parse(localStorage.getItem('documents') || '[]'),
      recentDocuments: JSON.parse(localStorage.getItem('recentDocuments') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'etherxword-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure? This will delete all your local data and cannot be undone.')) {
      localStorage.clear();
      showNotification('All data cleared', 'success');
      navigate('/signin');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <i className="ri-arrow-left-line"></i>
        </button>
        <h1>Settings</h1>
      </div>

      <div className="settings-content">
        <nav className="settings-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''} ${animateTab ? 'animate' : ''}`}
              onClick={() => {
                setAnimateTab(true);
                setActiveTab(tab.id);
                setTimeout(() => setAnimateTab(false), 300);
              }}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="settings-panel">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <h2>Profile Information</h2>
              
              <div className="profile-section">
                <div className="avatar-section">
                  <div className="avatar-preview">
                    {userProfile.avatar ? (
                      <img src={userProfile.avatar} alt="Avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        <i className="ri-user-line"></i>
                      </div>
                    )}
                  </div>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            handleProfileUpdate('avatar', event.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                  >
                    <i className="ri-camera-line"></i>
                    Change Avatar
                  </button>
                </div>
                
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={userProfile.fullName}
                    onChange={(e) => handleProfileUpdate('fullName', e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => handleProfileUpdate('email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                
                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={userProfile.bio}
                    onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                    placeholder="Tell us about yourself"
                    rows="3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={userProfile.location}
                      onChange={(e) => handleProfileUpdate('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      value={userProfile.website}
                      onChange={(e) => handleProfileUpdate('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                  <div className="action-buttons" style={{ marginTop: '16px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={submitProfileChanges}
                      disabled={isLoading}
                    >
                      <i className={`ri-save-2-line ${isLoading ? 'ri-loader-4-line animate-spin' : ''}`}></i>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={cancelProfileChanges}
                      disabled={isLoading}
                      style={{ marginLeft: '8px' }}
                    >
                      Cancel
                    </button>
                  </div>

                </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="tab-content">
              <h2>Preferences</h2>
              
              <div className="settings-section">
                <h3>Appearance</h3>
                <div className="form-group">
                  <label>Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceUpdate('theme', e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => handlePreferenceUpdate('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
              
              <div className="settings-section">
                <h3>Editor</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Default Font</label>
                    <select
                      value={preferences.defaultFont}
                      onChange={(e) => handlePreferenceUpdate('defaultFont', e.target.value)}
                    >
                      <option value="Georgia">Georgia</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Font Size</label>
                    <select
                      value={preferences.defaultFontSize}
                      onChange={(e) => handlePreferenceUpdate('defaultFontSize', e.target.value)}
                    >
                      <option value="10pt">10pt</option>
                      <option value="12pt">12pt</option>
                      <option value="14pt">14pt</option>
                      <option value="16pt">16pt</option>
                    </select>
                  </div>
                </div>
                
                <div className="toggle-group">
                  <div className="toggle-item">
                    <label>Auto Save</label>
                    <input
                      type="checkbox"
                      checked={preferences.autoSave}
                      onChange={(e) => handlePreferenceUpdate('autoSave', e.target.checked)}
                    />
                  </div>
                  
                  <div className="toggle-item">
                    <label>Spell Check</label>
                    <input
                      type="checkbox"
                      checked={preferences.spellCheck}
                      onChange={(e) => handlePreferenceUpdate('spellCheck', e.target.checked)}
                    />
                  </div>
                  
                  <div className="toggle-item">
                    <label>Word Wrap</label>
                    <input
                      type="checkbox"
                      checked={preferences.wordWrap}
                      onChange={(e) => handlePreferenceUpdate('wordWrap', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="tab-content">
              <h2>Privacy Settings</h2>
              
              <div className="settings-section">
                <div className="form-group">
                  <label>Profile Visibility</label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => handlePrivacyUpdate('profileVisibility', e.target.value)}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>
                
                <div className="toggle-group">
                  <div className="toggle-item">
                    <label>Document Sharing</label>
                    <input
                      type="checkbox"
                      checked={privacy.documentSharing}
                      onChange={(e) => handlePrivacyUpdate('documentSharing', e.target.checked)}
                    />
                  </div>
                  
                  <div className="toggle-item">
                    <label>Show Activity Status</label>
                    <input
                      type="checkbox"
                      checked={privacy.activityStatus}
                      onChange={(e) => handlePrivacyUpdate('activityStatus', e.target.checked)}
                    />
                  </div>
                  
                  <div className="toggle-item">
                    <label>Allow Data Collection</label>
                    <input
                      type="checkbox"
                      checked={privacy.dataCollection}
                      onChange={(e) => handlePrivacyUpdate('dataCollection', e.target.checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <h2>Security Settings</h2>
              
              <div className="settings-section">
                <div className="toggle-group">
                  <div className="toggle-item">
                    <label>Two-Factor Authentication</label>
                    <input
                      type="checkbox"
                      checked={security.twoFactorAuth}
                      onChange={(e) => handleSecurityUpdate('twoFactorAuth', e.target.checked)}
                    />
                  </div>
                  
                  <div className="toggle-item">
                    <label>Login Alerts</label>
                    <input
                      type="checkbox"
                      checked={security.loginAlerts}
                      onChange={(e) => handleSecurityUpdate('loginAlerts', e.target.checked)}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Session Timeout (minutes)</label>
                  <select
                    value={security.sessionTimeout}
                    onChange={(e) => handleSecurityUpdate('sessionTimeout', e.target.value)}
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
                
                <div className="action-buttons">
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setIsLoading(true);
                      setTimeout(() => {
                        setIsLoading(false);
                        showNotification('Password change initiated', 'info');
                      }, 2000);
                    }}
                    disabled={isLoading}
                  >
                    <i className={`ri-lock-line ${isLoading ? 'ri-loader-4-line animate-spin' : ''}`}></i>
                    {isLoading ? 'Processing...' : 'Change Password'}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      const codes = Array.from({length: 10}, () => 
                        Math.random().toString(36).substring(2, 10).toUpperCase()
                      );
                      const blob = new Blob([codes.join('\n')], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'recovery-codes.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                      showNotification('Recovery codes downloaded', 'success');
                    }}
                  >
                    <i className="ri-download-line"></i>
                    Download Recovery Codes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Storage Tab */}
          {activeTab === 'storage' && (
            <div className="tab-content">
              <h2>Storage & Data</h2>
              
              <div className="storage-info">
                <div className="storage-item">
                  <i className="ri-file-text-line"></i>
                  <div>
                    <h4>Documents</h4>
                    <p>{JSON.parse(localStorage.getItem('documents') || '[]').length} documents</p>
                  </div>
                </div>
                
                <div className="storage-item">
                  <i className="ri-image-line"></i>
                  <div>
                    <h4>Images</h4>
                    <p>0 MB used</p>
                  </div>
                </div>
                
                <div className="storage-item">
                  <i className="ri-settings-line"></i>
                  <div>
                    <h4>Settings</h4>
                    <p>&lt; 1 MB</p>
                  </div>
                </div>
              </div>
              
              <div className="action-buttons">
                <button className="btn btn-primary" onClick={exportData}>
                  <i className="ri-download-line"></i>
                  Export Data
                </button>
                <button className="btn btn-danger" onClick={clearAllData}>
                  <i className="ri-delete-bin-line"></i>
                  Clear All Data
                </button>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="tab-content">
              <h2>Account Management</h2>
              
              <div className="account-section">
                <h3><i className="ri-error-warning-line"></i> Danger Zone</h3>
                <div className="danger-actions">
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to deactivate your account? This action can be reversed.')) {
                        showNotification('Account deactivation initiated', 'warning');
                      }
                    }}
                  >
                    <i className="ri-user-unfollow-line"></i>
                    Deactivate Account
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete your account? This action cannot be undone!')) {
                        if (window.confirm('This will permanently delete all your data. Type DELETE to confirm.')) {
                          showNotification('Account deletion initiated', 'error');
                        }
                      }
                    }}
                  >
                    <i className="ri-delete-bin-line"></i>
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;