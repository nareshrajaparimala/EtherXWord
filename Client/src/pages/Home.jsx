import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSection, setSelectedSection] = useState('Quick Access');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { icon: '📄', label: 'Quick Access', mobileVisible: false },
    { icon: '➕', label: 'New Document', mobileVisible: true },
    { icon: '📑', label: 'Templates', mobileVisible: true },
    { icon: '📂', label: 'All Documents', mobileVisible: true },
    { icon: '⭐', label: 'Favorites', mobileVisible: true },
    { icon: '🗑️', label: 'Trash', mobileVisible: true },
    { icon: '⚙️', label: 'Settings', mobileVisible: true }
  ];

  const recentDocs = [
    { title: 'Project Proposal', preview: 'Lorem ipsum dolor sit amet...', lastEdit: '2 hours ago' },
    { title: 'Meeting Notes', preview: 'Team meeting discussion...', lastEdit: '1 day ago' },
    { title: 'Research Paper', preview: 'Academic research on...', lastEdit: '3 days ago' }
  ];

  return (
    <div className="home-container">
      {/* Home Header */}
      <div className="home-header">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`home-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-content">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`sidebar-item ${selectedSection === item.label ? 'active' : ''} ${item.mobileVisible ? 'mobile-visible' : ''}`}
              onClick={() => setSelectedSection(item.label)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="workspace">
        {/* Quick Access Section */}
        {selectedSection === 'Quick Access' && (
          <div className="workspace-section">
            <div className="section-header">
              <h2>Quick Access</h2>
              <div className="quick-actions">
                <button className="btn btn-primary" onClick={() => navigate('/editor')}>➕ New Document</button>
                <button className="btn btn-secondary">📑 Default Template</button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search by title, tags, or date" 
                className="search-input"
              />
            </div>

            {/* Recent Documents Grid */}
            <div className="documents-grid">
              {recentDocs.map((doc, index) => (
                <div key={index} className="document-card" onClick={() => navigate('/editor')}>
                  <div className="card-header">
                    <h3>{doc.title}</h3>
                    <button className="card-menu" onClick={(e) => e.stopPropagation()}>⋯</button>
                  </div>
                  <p className="card-preview">{doc.preview}</p>
                  <div className="card-footer">
                    <span className="last-edit">{doc.lastEdit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Suggested Templates */}
            <div className="templates-section">
              <h3>Suggested Templates</h3>
              <div className="templates-slider">
                <div className="template-card">📄 Blank Document</div>
                <div className="template-card">📊 Report Template</div>
                <div className="template-card">📝 Meeting Notes</div>
                <div className="template-card">📋 Project Plan</div>
              </div>
            </div>
          </div>
        )}

        {/* New Document Section */}
        {selectedSection === 'New Document' && (
          <div className="workspace-section">
            <h2>Create New Document</h2>
            <div className="new-doc-options">
              <button className="new-doc-btn" onClick={() => navigate('/editor')}>📄 Blank Document</button>
              <button className="new-doc-btn">📑 From Template</button>
              <button className="new-doc-btn">📤 Import File</button>
            </div>
          </div>
        )}

        {/* All Documents Section */}
        {selectedSection === 'All Documents' && (
          <div className="workspace-section">
            <div className="section-header">
              <h2>All Documents</h2>
              <div className="filters">
                <select className="filter-select">
                  <option>Sort by Date</option>
                  <option>Sort by Name</option>
                  <option>Sort by Type</option>
                </select>
              </div>
            </div>
            <div className="documents-list">
              {recentDocs.map((doc, index) => (
                <div key={index} className="document-row">
                  <div className="doc-info">
                    <h4>{doc.title}</h4>
                    <span className="doc-date">{doc.lastEdit}</span>
                  </div>
                  <div className="doc-actions">
                    <button onClick={() => navigate('/editor')}>✏️</button>
                    <button>📤</button>
                    <button>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other sections */}
        {!['Quick Access', 'New Document', 'All Documents'].includes(selectedSection) && (
          <div className="workspace-section">
            <h2>{selectedSection}</h2>
            <p>Content for {selectedSection} coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;