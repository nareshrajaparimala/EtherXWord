import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CollaborationRequests from '../components/CollaborationRequests';
import { useNotification } from '../context/NotificationContext';
import './Home.css';

const Home = () => {
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSection, setSelectedSection] = useState('Quick Access');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState([]);
  const [trashDocuments, setTrashDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentDocuments, setRecentDocuments] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: '📄', label: 'Quick Access', mobileVisible: false },
    { icon: '➕', label: 'New Document', mobileVisible: true },
    { icon: '📑', label: 'Templates', mobileVisible: true, action: () => navigate('/templates') },
    { icon: '📂', label: 'All Documents', mobileVisible: true },
    { icon: '👥', label: 'Collaboration', mobileVisible: true },
    { icon: '⭐', label: 'Favorites', mobileVisible: true },
    { icon: '🗑️', label: 'Trash', mobileVisible: true },
    { icon: '⚙️', label: 'Settings', mobileVisible: true, action: () => navigate('/settings') }
  ];

  const [collaborativeDocuments, setCollaborativeDocuments] = useState([]);
  
  useEffect(() => {
    loadRecentDocuments();
  }, []);
  
  const loadRecentDocuments = () => {
    const recent = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
    setRecentDocuments(recent.slice(0, 6)); // Show last 6 recent documents
  };
  
  const searchDocuments = async (query) => {
    if (!query.trim()) {
      if (selectedSection === 'All Documents') fetchUserDocuments();
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDocuments(data);
      }
    } catch (error) {
      console.error('Error searching documents:', error);
    }
  };
  
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Debounce search
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      searchDocuments(query);
    }, 300);
  };
  
  useEffect(() => {
    // Check if navigated from notification
    if (location.state?.activeSection) {
      setSelectedSection(location.state.activeSection);
    }
  }, [location.state]);
  
  useEffect(() => {
    if (selectedSection === 'Collaboration') {
      fetchCollaborativeDocuments();
    } else if (selectedSection === 'All Documents') {
      fetchUserDocuments();
    } else if (selectedSection === 'Favorites') {
      fetchFavoriteDocuments();
    } else if (selectedSection === 'Trash') {
      fetchTrashDocuments();
    }
  }, [selectedSection]);
  
  const fetchUserDocuments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching user documents:', error);
    }
  };
  
  const fetchFavoriteDocuments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/favorites`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavoriteDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching favorite documents:', error);
    }
  };
  
  const fetchTrashDocuments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/trash`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrashDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching trash documents:', error);
    }
  };
  
  const toggleFavorite = async (docId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Refresh current section
      if (selectedSection === 'All Documents') fetchUserDocuments();
      if (selectedSection === 'Favorites') fetchFavoriteDocuments();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };
  
  const moveToTrash = async (docId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/trash`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      // Refresh current section
      if (selectedSection === 'All Documents') fetchUserDocuments();
      if (selectedSection === 'Favorites') fetchFavoriteDocuments();
    } catch (error) {
      console.error('Error moving to trash:', error);
    }
  };
  
  const restoreFromTrash = async (docId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      fetchTrashDocuments();
    } catch (error) {
      console.error('Error restoring from trash:', error);
    }
  };
  
  const permanentlyDelete = async (docId) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/permanent`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        fetchTrashDocuments();
      } catch (error) {
        console.error('Error permanently deleting:', error);
      }
    }
  };
  
  const setStartDocument = async (docId) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/start`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      showNotification('Start document updated!', 'success');
      if (selectedSection === 'All Documents') fetchUserDocuments();
      if (selectedSection === 'Favorites') fetchFavoriteDocuments();
    } catch (error) {
      console.error('Error setting start document:', error);
    }
  };
  
  const fetchCollaborativeDocuments = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/collaboration/documents`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCollaborativeDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching collaborative documents:', error);
    }
  };

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
              onClick={() => item.action ? item.action() : setSelectedSection(item.label)}
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
                placeholder="Search by title, content, or date" 
                className="search-input"
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="ri-search-line search-icon"></i>
            </div>

            {/* Recent Documents Grid */}
            <div className="documents-grid">
              {recentDocuments.length === 0 ? (
                <div className="empty-state">
                  <i className="ri-file-text-line"></i>
                  <h3>No recent documents</h3>
                  <p>Start creating documents to see them here</p>
                  <button className="btn btn-primary" onClick={() => navigate('/editor')}>Create Document</button>
                </div>
              ) : (
                recentDocuments.map((doc, index) => (
                  <div key={index} className="document-card" onClick={() => navigate('/editor')}>
                    <div className="card-header">
                      <h3>{doc.title}</h3>
                      <button className="card-menu" onClick={(e) => e.stopPropagation()}>⋯</button>
                    </div>
                    <p className="card-preview">{doc.preview || 'No preview available'}</p>
                    <div className="card-footer">
                      <span className="last-edit">{new Date(doc.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Suggested Templates */}
            <div className="templates-section">
              <h3>Suggested Templates</h3>
              <div className="templates-slider">
                <div className="template-card">📄 Blank Document</div>
                <div className="template-card"><i class="ri-chat-smile-3-line"></i> Work together</div>
                <div className="template-card"><i class="ri-shake-hands-fill"></i> Rent a design</div>
                <div className="template-card"><i class="ri-store-3-fill"></i> Make a design</div>
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
              <h2>My Documents</h2>
              <div className="quick-actions">
                <button className="btn btn-primary" onClick={() => navigate('/editor')}>➕ New Document</button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="search-input"
                value={searchQuery}
                onChange={handleSearch}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
            
            {userDocuments.length === 0 ? (
              <div className="empty-state">
                <i className="ri-file-text-line"></i>
                <h3>No documents yet</h3>
                <p>Create your first document to get started</p>
                <button className="btn btn-primary" onClick={() => navigate('/editor')}>Create Document</button>
              </div>
            ) : (
              <div className="documents-grid">
                {userDocuments.map((doc) => (
                  <div key={doc._id} className="document-card" onClick={() => navigate(`/editor/${doc._id}`)}>
                    <div className="card-header">
                      <h3>{doc.title}</h3>
                      <div className="card-badges">
                        <span className="owner-badge">Owner</span>
                        {doc.collaborators.length > 0 && (
                          <span className="collaborators-count">
                            <i className="ri-group-line"></i>
                            {doc.collaborators.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="card-preview">
                      {doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content yet'}...
                    </p>
                    <div className="card-footer">
                      <span className="word-count">{doc.wordCount || 0} words</span>
                      <span className="last-edit">{new Date(doc.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editor/${doc._id}`);
                        }}
                      >
                        <i className="ri-edit-line"></i>
                        Edit
                      </button>
                      <button 
                        className={`action-btn favorite-btn ${doc.isFavorite ? 'favorited' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(doc._id);
                        }}
                      >
                        <i className={`ri-star-${doc.isFavorite ? 'fill' : 'line'}`}></i>
                        {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
                      </button>
                      <button 
                        className="action-btn trash-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveToTrash(doc._id);
                        }}
                      >
                        <i className="ri-delete-bin-line"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Collaboration Section */}
        {selectedSection === 'Collaboration' && (
          <div className="workspace-section">
            <div className="section-header">
              <h2>Collaboration</h2>
            </div>
            
            <div className="collaboration-content">
              <div className="collaboration-panel">
                <CollaborationRequests />
              </div>
              
              <div className="collaboration-panel">
                <h3>Shared with Me</h3>
                {collaborativeDocuments.length === 0 ? (
                  <div className="empty-state">
                    <i className="ri-share-line"></i>
                    <p>No shared documents yet</p>
                  </div>
                ) : (
                  <div className="documents-grid">
                    {collaborativeDocuments.map((doc) => {
                      const userCollaboration = doc.collaborators.find(c => 
                        c.user._id === JSON.parse(localStorage.getItem('userProfile') || '{}')._id ||
                        c.user._id === localStorage.getItem('userId')
                      );
                      const permission = userCollaboration?.permission || 'view';
                      const canEdit = permission === 'edit';
                      
                      return (
                        <div 
                          key={doc._id} 
                          className={`document-card ${!canEdit ? 'view-only' : ''}`}
                          onClick={() => {
                            if (canEdit) {
                              navigate(`/editor/${doc._id}`);
                            } else {
                              navigate(`/viewer/${doc._id}`);
                            }
                          }}
                        >
                          <div className="card-header">
                            <h3>{doc.title}</h3>
                            <div className="card-badges">
                              <span className={`permission-badge ${permission}`}>
                                {canEdit ? 'Can Edit' : 'Can View'}
                              </span>
                              {!canEdit && <i className="ri-eye-line view-icon"></i>}
                            </div>
                          </div>
                          <p className="card-preview">
                            {doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No preview available'}...
                          </p>
                          <div className="card-footer">
                            <span className="owner-info">by {doc.owner.fullName}</span>
                            <span className="last-edit">{new Date(doc.lastModified).toLocaleDateString()}</span>
                          </div>
                          <div className="card-actions">
                            <button 
                              className={`action-btn ${canEdit ? 'edit-btn' : 'view-btn'}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (canEdit) {
                                  navigate(`/editor/${doc._id}`);
                                } else {
                                  navigate(`/viewer/${doc._id}`);
                                }
                              }}
                            >
                              <i className={`ri-${canEdit ? 'edit' : 'eye'}-line`}></i>
                              {canEdit ? 'Edit' : 'View'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {selectedSection === 'Favorites' && (
          <div className="workspace-section">
            <div className="section-header">
              <h2>Favorite Documents</h2>
            </div>
            
            {favoriteDocuments.length === 0 ? (
              <div className="empty-state">
                <i className="ri-star-line"></i>
                <h3>No favorite documents</h3>
                <p>Star your important documents to find them easily</p>
              </div>
            ) : (
              <div className="documents-grid">
                {favoriteDocuments.map((doc) => (
                  <div key={doc._id} className="document-card favorite-card" onClick={() => navigate(`/editor/${doc._id}`)}>
                    <div className="card-header">
                      <h3>{doc.title}</h3>
                      <div className="card-badges">
                        <span className="favorite-badge">
                          <i className="ri-star-fill"></i>
                          Favorite
                        </span>
                      </div>
                    </div>
                    <p className="card-preview">
                      {doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content yet'}...
                    </p>
                    <div className="card-footer">
                      <span className="word-count">{doc.wordCount || 0} words</span>
                      <span className="last-edit">{new Date(doc.lastModified).toLocaleDateString()}</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/editor/${doc._id}`);
                        }}
                      >
                        <i className="ri-edit-line"></i>
                        Edit
                      </button>
                      <button 
                        className="action-btn unfavorite-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(doc._id);
                        }}
                      >
                        <i className="ri-star-fill"></i>
                        Unfavorite
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Trash Section */}
        {selectedSection === 'Trash' && (
          <div className="workspace-section">
            <div className="section-header">
              <h2>Trash</h2>
            </div>
            
            {trashDocuments.length === 0 ? (
              <div className="empty-state">
                <i className="ri-delete-bin-line"></i>
                <h3>Trash is empty</h3>
                <p>Deleted documents will appear here</p>
              </div>
            ) : (
              <div className="documents-grid">
                {trashDocuments.map((doc) => (
                  <div key={doc._id} className="document-card trash-card">
                    <div className="card-header">
                      <h3>{doc.title}</h3>
                      <div className="card-badges">
                        <span className="deleted-badge">
                          <i className="ri-delete-bin-line"></i>
                          Deleted
                        </span>
                      </div>
                    </div>
                    <p className="card-preview">
                      {doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content'}...
                    </p>
                    <div className="card-footer">
                      <span className="deleted-date">
                        Deleted: {new Date(doc.deletedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="action-btn restore-btn"
                        onClick={() => restoreFromTrash(doc._id)}
                      >
                        <i className="ri-refresh-line"></i>
                        Restore
                      </button>
                      <button 
                        className="action-btn permanent-delete-btn"
                        onClick={() => permanentlyDelete(doc._id)}
                      >
                        <i className="ri-delete-bin-2-line"></i>
                        Delete Forever
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Other sections */}
        {!['Quick Access', 'New Document', 'All Documents', 'Collaboration', 'Favorites', 'Trash'].includes(selectedSection) && (
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