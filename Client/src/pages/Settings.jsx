import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const isLogoAnimating = useLogoAnimation();

  // Theme settings
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Notification settings
  const [notifications, setNotifications] = useState(() => {
    return JSON.parse(localStorage.getItem('notificationSettings') || '{"email":true,"push":true,"collaboration":true,"documentUpdates":true,"marketing":false}');
  });

  // Editor settings
  const [editorSettings, setEditorSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('editorSettings') || '{"autoSave":true,"autoSaveInterval":30,"spellCheck":true,"wordCount":true,"lineNumbers":false,"fontSize":"medium","fontFamily":"Arial"}');
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState(() => {
    return JSON.parse(localStorage.getItem('privacySettings') || '{"profileVisibility":"private","documentSharing":"invite-only","analytics":true,"cookies":true}');
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('accountSettings') || '{"language":"en","timezone":"UTC","dateFormat":"MM/DD/YYYY","currency":"USD"}');
  });

  const [activeSection, setActiveSection] = useState('appearance');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.body.className = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleNotificationChange = (key, value) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem('notificationSettings', JSON.stringify(updated));
  };

  const handleEditorChange = (key, value) => {
    const updated = { ...editorSettings, [key]: value };
    setEditorSettings(updated);
    localStorage.setItem('editorSettings', JSON.stringify(updated));
  };

  const handlePrivacyChange = (key, value) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettings(updated);
    localStorage.setItem('privacySettings', JSON.stringify(updated));
  };

  const handleAccountChange = (key, value) => {
    const updated = { ...accountSettings, [key]: value };
    setAccountSettings(updated);
    localStorage.setItem('accountSettings', JSON.stringify(updated));
  };

  const exportSettings = () => {
    const allSettings = {
      theme,
      notifications,
      editorSettings,
      privacySettings,
      accountSettings,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(allSettings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `etherxword-settings-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target.result);

          if (importedSettings.theme) {
            setTheme(importedSettings.theme);
          }
          if (importedSettings.notifications) {
            setNotifications(importedSettings.notifications);
          }
          if (importedSettings.editorSettings) {
            setEditorSettings(importedSettings.editorSettings);
          }
          if (importedSettings.privacySettings) {
            setPrivacySettings(importedSettings.privacySettings);
          }
          if (importedSettings.accountSettings) {
            setAccountSettings(importedSettings.accountSettings);
          }

          alert('Settings imported successfully!');
        } catch (error) {
          alert('Invalid settings file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      // Reset theme
      setTheme('dark');

      // Reset notifications
      const defaultNotifications = {
        email: true,
        push: true,
        collaboration: true,
        documentUpdates: true,
        marketing: false
      };
      setNotifications(defaultNotifications);

      // Reset editor settings
      const defaultEditor = {
        autoSave: true,
        autoSaveInterval: 30,
        spellCheck: true,
        wordCount: true,
        lineNumbers: false,
        fontSize: "medium",
        fontFamily: "Arial"
      };
      setEditorSettings(defaultEditor);

      // Reset privacy settings
      const defaultPrivacy = {
        profileVisibility: "private",
        documentSharing: "invite-only",
        analytics: true,
        cookies: true
      };
      setPrivacySettings(defaultPrivacy);

      // Reset account settings
      const defaultAccount = {
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        currency: "USD"
      };
      setAccountSettings(defaultAccount);

      // Clear localStorage
      localStorage.removeItem('notificationSettings');
      localStorage.removeItem('editorSettings');
      localStorage.removeItem('privacySettings');
      localStorage.removeItem('accountSettings');

      alert('Settings reset to defaults successfully!');
    }
  };

  const menuItems = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'editor', label: 'Editor', icon: '📝' },
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'data', label: 'Data Management', icon: '💾' }
  ];

  return (
    <div className="settings-page">
      {/* Settings Header */}
      <div className="settings-header">
        <div className="header-left">
          <div className="logo-section">
            <Logo size={32} className={isLogoAnimating ? 'animate' : ''} />
            <span className="brand-text">EtherXWord</span>
          </div>
        </div>
        <div className="header-center">
          <h1>Settings</h1>
          <p>Customize your EtherXWord experience</p>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={() => navigate('/home')}>
            <i className="ri-arrow-left-line"></i>
            Back to Home
          </button>
        </div>
      </div>

      <div className="settings-container">
        {/* Sidebar */}
        <div className="settings-sidebar">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`sidebar-item ${activeSection === item.id ? 'active' : ''}`}
              onClick={() => setActiveSection(item.id)}
            >
              <span className="item-icon">{item.icon}</span>
              <span className="item-label">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {/* Appearance Section */}
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h2>Appearance</h2>
              <div className="settings-group">
                <h3>Theme</h3>
                <div className="theme-options">
                  <button
                    className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="theme-preview light">
                      <div className="preview-header"></div>
                      <div className="preview-content"></div>
                    </div>
                    <span>Light</span>
                  </button>
                  <button
                    className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="theme-preview dark">
                      <div className="preview-header"></div>
                      <div className="preview-content"></div>
                    </div>
                    <span>Dark</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2>Notifications</h2>

              <div className="settings-group">
                <h3>Email Notifications</h3>
                <div className="toggle-options">
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => handleNotificationChange('email', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Email notifications</span>
                  </label>
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={notifications.collaboration}
                      onChange={(e) => handleNotificationChange('collaboration', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Collaboration requests</span>
                  </label>
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={notifications.documentUpdates}
                      onChange={(e) => handleNotificationChange('documentUpdates', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Document updates</span>
                  </label>
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={notifications.marketing}
                      onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Marketing emails</span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h3>Push Notifications</h3>
                <div className="toggle-options">
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => handleNotificationChange('push', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Browser push notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Editor Section */}
          {activeSection === 'editor' && (
            <div className="settings-section">
              <h2>Editor Preferences</h2>

              <div className="settings-group">
                <h3>Auto-save</h3>
                <div className="toggle-options">
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={editorSettings.autoSave}
                      onChange={(e) => handleEditorChange('autoSave', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Enable auto-save</span>
                  </label>
                </div>
                {editorSettings.autoSave && (
                  <div className="sub-setting">
                    <label>Auto-save interval (seconds):</label>
                    <select
                      value={editorSettings.autoSaveInterval}
                      onChange={(e) => handleEditorChange('autoSaveInterval', parseInt(e.target.value))}
                    >
                      <option value={15}>15 seconds</option>
                      <option value={30}>30 seconds</option>
                      <option value={60}>1 minute</option>
                      <option value={300}>5 minutes</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="settings-group">
                <h3>Editor Features</h3>
                <div className="toggle-options">
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={editorSettings.spellCheck}
                      onChange={(e) => handleEditorChange('spellCheck', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Spell check</span>
                  </label>
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={editorSettings.wordCount}
                      onChange={(e) => handleEditorChange('wordCount', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Word count display</span>
                  </label>
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={editorSettings.lineNumbers}
                      onChange={(e) => handleEditorChange('lineNumbers', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Line numbers</span>
                  </label>
                </div>
              </div>

              <div className="settings-group">
                <h3>Typography</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Font Size:</label>
                    <select
                      value={editorSettings.fontSize}
                      onChange={(e) => handleEditorChange('fontSize', e.target.value)}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Font Family:</label>
                    <select
                      value={editorSettings.fontFamily}
                      onChange={(e) => handleEditorChange('fontFamily', e.target.value)}
                    >
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                      <option value="Helvetica">Helvetica</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy & Security</h2>

              <div className="settings-group">
                <h3>Profile Visibility</h3>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </div>

              <div className="settings-group">
                <h3>Document Sharing</h3>
                <select
                  value={privacySettings.documentSharing}
                  onChange={(e) => handlePrivacyChange('documentSharing', e.target.value)}
                >
                  <option value="public">Anyone with link</option>
                  <option value="invite-only">Invite only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="settings-group">
                <h3>Data Collection</h3>
                <div className="toggle-options">
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={privacySettings.analytics}
                      onChange={(e) => handlePrivacyChange('analytics', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Analytics tracking</span>
                  </label>
                  <label className="toggle-item">
                    <input
                      type="checkbox"
                      checked={privacySettings.cookies}
                      onChange={(e) => handlePrivacyChange('cookies', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="toggle-label">Essential cookies</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Account Section */}
          {activeSection === 'account' && (
            <div className="settings-section">
              <h2>Account Preferences</h2>

              <div className="settings-group">
                <h3>Language & Region</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Language:</label>
                    <select
                      value={accountSettings.language}
                      onChange={(e) => handleAccountChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Timezone:</label>
                    <select
                      value={accountSettings.timezone}
                      onChange={(e) => handleAccountChange('timezone', e.target.value)}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="GMT">Greenwich Mean Time</option>
                      <option value="CET">Central European Time</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h3>Display Preferences</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date Format:</label>
                    <select
                      value={accountSettings.dateFormat}
                      onChange={(e) => handleAccountChange('dateFormat', e.target.value)}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Currency:</label>
                    <select
                      value={accountSettings.currency}
                      onChange={(e) => handleAccountChange('currency', e.target.value)}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Section */}
          {activeSection === 'data' && (
            <div className="settings-section">
              <h2>Data Management</h2>

              <div className="settings-group">
                <h3>Export Settings</h3>
                <p>Download a copy of your settings and preferences.</p>
                <button className="action-btn" onClick={exportSettings}>
                  <i className="ri-download-line"></i>
                  Export Settings
                </button>
              </div>

              <div className="settings-group">
                <h3>Import Settings</h3>
                <p>Import settings from a previously exported file.</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  style={{ display: 'none' }}
                  id="import-settings"
                />
                <button
                  className="action-btn"
                  onClick={() => document.getElementById('import-settings').click()}
                >
                  <i className="ri-upload-line"></i>
                  Import Settings
                </button>
              </div>

              <div className="settings-group danger">
                <h3>Reset to Defaults</h3>
                <p>This will reset all your settings to their default values. This action cannot be undone.</p>
                <button className="action-btn danger" onClick={resetToDefaults}>
                  <i className="ri-refresh-line"></i>
                  Reset All Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
