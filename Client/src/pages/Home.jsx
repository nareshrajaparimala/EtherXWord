import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CollaborationRequests from '../components/CollaborationRequests';
import QuickSearch from '../components/QuickSearch';
import { useNotification } from '../context/NotificationContext';
import './Home.css';

const Home = () => {
  const { showNotification } = useNotification();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedSection, setSelectedSection] = useState('Quick Access');
  const [isLoading, setIsLoading] = useState(false);
  const [animateCards, setAnimateCards] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [userDocuments, setUserDocuments] = useState([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState([]);
  const [trashDocuments, setTrashDocuments] = useState([]);
  const [recentDocuments, setRecentDocuments] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: 'ri-dashboard-line', label: 'Quick Access', mobileVisible: false },
    { icon: 'ri-add-circle-line', label: 'New Document', mobileVisible: true },
    { icon: 'ri-layout-2-line', label: 'Templates', mobileVisible: true, action: () => navigate('/templates') },
    { icon: 'ri-folder-line', label: 'All Documents', mobileVisible: true },
    { icon: 'ri-team-line', label: 'Collaboration', mobileVisible: true },
    { icon: 'ri-star-line', label: 'Favorites', mobileVisible: true },
    { icon: 'ri-delete-bin-line', label: 'Recycle Bin', mobileVisible: true },
    { icon: 'ri-settings-3-line', label: 'Settings', mobileVisible: true, action: () => navigate('/settings') }
  ];

  const [collaborativeDocuments, setCollaborativeDocuments] = useState([]);
  
  useEffect(() => {
    loadRecentDocuments();
    
    const handleToggleSidebar = () => {
      setSidebarCollapsed(!sidebarCollapsed);
    };
    
    window.addEventListener('toggleHomeSidebar', handleToggleSidebar);
    return () => window.removeEventListener('toggleHomeSidebar', handleToggleSidebar);
  }, [sidebarCollapsed]);
  
  const loadRecentDocuments = () => {
    const recent = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
    const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
    
    // Merge recent documents with saved documents to get complete data
    const enrichedRecent = recent.map(recentDoc => {
      const savedDoc = savedDocs.find(doc => doc.title === recentDoc.title);
      return {
        ...recentDoc,
        id: savedDoc?.id || recentDoc.id || null,
        isFavorite: savedDoc?.isFavorite || false,
        content: savedDoc?.content || '',
        pages: savedDoc?.pages || []
      };
    });
    
    setRecentDocuments(enrichedRecent.slice(0, 6)); // Show last 6 recent documents
  };
  

  
  useEffect(() => {
    // Check if navigated from notification
    if (location.state?.activeSection) {
      setSelectedSection(location.state.activeSection);
    }
  }, [location.state]);
  
  useEffect(() => {
    if (selectedSection === 'All Documents') {
      fetchUserDocuments();
    } else if (selectedSection === 'Favorites') {
      fetchFavoriteDocuments();
    } else if (selectedSection === 'Collaboration') {
      fetchCollaborativeDocuments();
    } else if (selectedSection === 'Recycle Bin') {
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
      } else {
        // Fallback to local documents
        const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
        setUserDocuments(localDocs.map(doc => ({
          _id: doc.id,
          title: doc.title,
          content: doc.content,
          lastModified: doc.lastModified,
          wordCount: doc.wordCount,
          isFavorite: doc.isFavorite || false,
          collaborators: doc.collaborators || [],
          documentAddress: doc.documentAddress || doc.id
        })));
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Fallback to local documents
      const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
      setUserDocuments(localDocs.map(doc => ({
        _id: doc.id,
        title: doc.title,
        content: doc.content,
        lastModified: doc.lastModified,
        wordCount: doc.wordCount,
        isFavorite: doc.isFavorite || false,
        collaborators: doc.collaborators || [],
        documentAddress: doc.documentAddress || doc.id
      })));
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
      } else {
        // Fallback to local favorites
        const localDocs = JSON.parse(localStorage.getItem('documents') || '[]');
        const favorites = localDocs.filter(doc => doc.isFavorite).map(doc => ({
          _id: doc.id,
          title: doc.title,
          content: doc.content,
          lastModified: doc.lastModified,
          wordCount: doc.wordCount,
          isFavorite: doc.isFavorite || false,
          collaborators: doc.collaborators || [],
          documentAddress: doc.documentAddress || doc.id
        }));
        setFavoriteDocuments(favorites);
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
  
  const toggleFavorite = (docId, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Handle local documents only to avoid rate limiting
    const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
    const docIndex = savedDocs.findIndex(d => d.id === docId);
    
    if (docIndex >= 0) {
      savedDocs[docIndex].isFavorite = !savedDocs[docIndex].isFavorite;
      localStorage.setItem('documents', JSON.stringify(savedDocs));
      
      showNotification(
        savedDocs[docIndex].isFavorite ? 'Added to favorites' : 'Removed from favorites',
        'success'
      );
      
      // Refresh current section
      if (selectedSection === 'All Documents') fetchUserDocuments();
      if (selectedSection === 'Favorites') fetchFavoriteDocuments();
      if (selectedSection === 'Quick Access') loadRecentDocuments();
    }
  };
  
  const moveToTrash = async (docId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/trash`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        showNotification('Document moved to trash (will be deleted in 1 hour)', 'success');
        
        // Refresh current section
        if (selectedSection === 'All Documents') fetchUserDocuments();
        if (selectedSection === 'Favorites') fetchFavoriteDocuments();
        if (selectedSection === 'Quick Access') loadRecentDocuments();
      } else {
        showNotification('Failed to move document to trash', 'error');
      }
    } catch (error) {
      console.error('Error moving to trash:', error);
      showNotification('Error moving document to trash', 'error');
    }
  };
  
  const restoreFromTrash = async (docId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/restore`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        showNotification('Document restored successfully', 'success');
        fetchTrashDocuments();
      } else {
        showNotification('Failed to restore document', 'error');
      }
    } catch (error) {
      console.error('Error restoring from trash:', error);
      showNotification('Error restoring document', 'error');
    }
  };
  
  const permanentlyDelete = async (docId) => {
    if (window.confirm('Are you sure? This action cannot be undone.')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/documents/${docId}/permanent`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        
        if (response.ok) {
          showNotification('Document permanently deleted', 'success');
          fetchTrashDocuments();
        } else {
          showNotification('Failed to delete document permanently', 'error');
        }
      } catch (error) {
        console.error('Error permanently deleting:', error);
        showNotification('Error deleting document permanently', 'error');
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
      } else {
        console.error('Failed to fetch collaborative documents');
        setCollaborativeDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching collaborative documents:', error);
      setCollaborativeDocuments([]);
    }
  };

  return (
    <div className="home-container">
      <Navbar />

      {/* Sidebar */}
      <aside className={`home-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-content">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`sidebar-item ${selectedSection === item.label ? 'active' : ''} ${item.mobileVisible ? 'mobile-visible' : ''}`}
              data-tooltip={item.label}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else {
                  setAnimateCards(true);
                  setSelectedSection(item.label);
                  setTimeout(() => setAnimateCards(false), 600);
                }
              }}
            >
              <i className={`sidebar-icon ${item.icon}`}></i>
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
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => {
                      navigate('/editor');
                    }, 500);
                  }}
                  disabled={isLoading}
                >
                  <i className={`ri-add-line ${isLoading ? 'animate-spin' : ''}`}></i>
                  {isLoading ? 'Creating...' : 'New Document'}
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/templates')}>
                  <i className="ri-layout-2-line"></i>
                  Browse Templates
                </button>
              </div>
            </div>

            {/* Quick Search */}
            <div className="search-container">
              <QuickSearch 
                placeholder="Search by title, content, document address, or keywords..."
                onResults={(results) => {
                  // Update recent documents with search results for quick access
                  if (results.length > 0) {
                    const searchResults = results.slice(0, 6).map(doc => ({
                      title: doc.title,
                      lastModified: doc.lastModified,
                      preview: doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No preview available',
                      wordCount: doc.wordCount || 0,
                      id: doc._id,
                      documentAddress: doc.documentAddress,
                      isFavorite: doc.isFavorite,
                      searchScore: doc.searchScore
                    }));
                    setRecentDocuments(searchResults);
                  } else if (searchQuery === '') {
                    loadRecentDocuments();
                  }
                }}
              />
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
                  <div 
                    key={index} 
                    className={`document-card ${animateCards ? 'animate' : ''}`}
                    onClick={() => {
                      // Add to recent documents
                      const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
                      const docData = {
                        title: doc.title,
                        lastModified: new Date().toISOString(),
                        preview: doc.preview || doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No preview available',
                        wordCount: doc.wordCount || 0,
                        id: doc.id
                      };
                      
                      const filtered = recentDocs.filter(d => d.title !== doc.title);
                      filtered.unshift(docData);
                      localStorage.setItem('recentDocuments', JSON.stringify(filtered.slice(0, 10)));
                      
                      if (doc.id) {
                        // Store document ID for editor to load
                        localStorage.setItem('currentDocumentId', doc.id);
                        navigate('/editor');
                      } else {
                        // No ID - create new document with this title
                        navigate('/editor', { state: { title: doc.title, content: doc.content } });
                      }
                    }}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="card-header">
                      <h3>{doc.title}</h3>
                      <div className="card-menu">
                        {doc.id && (
                          <button 
                            className={`favorite-btn ${doc.isFavorite ? 'favorited' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              // For local documents, toggle favorite in localStorage
                              const savedDocs = JSON.parse(localStorage.getItem('documents') || '[]');
                              const docIndex = savedDocs.findIndex(d => d.id === doc.id);
                              if (docIndex >= 0) {
                                savedDocs[docIndex].isFavorite = !savedDocs[docIndex].isFavorite;
                                localStorage.setItem('documents', JSON.stringify(savedDocs));
                                loadRecentDocuments();
                                showNotification(
                                  savedDocs[docIndex].isFavorite ? 'Added to favorites' : 'Removed from favorites', 
                                  'success'
                                );
                              }
                            }}
                          >
                            <i className={`ri-star-${doc.isFavorite ? 'fill' : 'line'}`}></i>
                          </button>
                        )}
                        <button 
                          className="menu-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <i className="ri-more-line"></i>
                        </button>
                      </div>
                    </div>
                    <p className="card-preview">{doc.preview || 'No preview available'}</p>
                    <div className="card-footer">
                      <span className="word-count">
                        <i className="ri-file-text-line"></i>
                        {doc.wordCount || 0} words
                      </span>
                      <span className="last-edit">{new Date(doc.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Suggested Templates */}
            <div className="templates-section">
              <h3>
                <i className="ri-layout-2-line"></i>
                Suggested Templates
              </h3>
              <div className="templates-slider">
                <div className="template-card" onClick={() => navigate('/editor')}>
                  <i className="ri-file-text-line template-icon"></i>
                  <span>Blank Document</span>
                </div>
                <div className="template-card" onClick={() => navigate('/templates')}>
                  <i className="ri-team-line template-icon"></i>
                  <span>Collaboration</span>
                </div>
                <div className="template-card" onClick={() => navigate('/templates')}>
                  <i className="ri-briefcase-line template-icon"></i>
                  <span>Business</span>
                </div>
                <div className="template-card" onClick={() => navigate('/templates')}>
                  <i className="ri-graduation-cap-line template-icon"></i>
                  <span>Academic</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Document Section */}
        {selectedSection === 'New Document' && (
          <div className="workspace-section">
            <h2>Create New Document</h2>
            <div className="new-doc-options">
              <button 
                className="new-doc-btn" 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => navigate('/editor'), 500);
                }}
              >
                <i className="ri-file-text-line new-doc-icon"></i>
                <span>Blank Document</span>
                <p>Start with a clean slate</p>
              </button>
              <button 
                className="new-doc-btn"
                onClick={() => navigate('/templates')}
              >
                <i className="ri-layout-2-line new-doc-icon"></i>
                <span>From Template</span>
                <p>Choose from our collection</p>
              </button>
              <button 
                className="new-doc-btn"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.txt,.docx,.html,.md';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      showNotification('File import started', 'info');
                      navigate('/editor');
                    }
                  };
                  input.click();
                }}
              >
                <i className="ri-upload-line new-doc-icon"></i>
                <span>Import File</span>
                <p>Upload existing document</p>
              </button>
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
            
            {/* Quick Search */}
            <div className="search-container">
              <QuickSearch 
                placeholder="Search your documents..."
                onResults={(results) => setUserDocuments(results)}
              />
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
                  <div 
                    key={doc._id} 
                    className="document-card" 
                    onClick={() => {
                      // Add to recent documents
                      const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
                      const docData = {
                        title: doc.title,
                        lastModified: new Date().toISOString(),
                        preview: doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content yet',
                        wordCount: doc.wordCount || 0,
                        id: doc._id
                      };
                      
                      const filtered = recentDocs.filter(d => d.id !== doc._id);
                      filtered.unshift(docData);
                      localStorage.setItem('recentDocuments', JSON.stringify(filtered.slice(0, 10)));
                      
                      navigate(`/editor/${doc._id}`);
                    }}
                  >
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
                        onClick={(e) => toggleFavorite(doc._id, e)}
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
                            // Add to recent documents
                            const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
                            const docData = {
                              title: doc.title,
                              lastModified: new Date().toISOString(),
                              preview: doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No preview available',
                              wordCount: doc.wordCount || 0,
                              id: doc._id
                            };
                            
                            const filtered = recentDocs.filter(d => d.id !== doc._id);
                            filtered.unshift(docData);
                            localStorage.setItem('recentDocuments', JSON.stringify(filtered.slice(0, 10)));
                            
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
                              <button 
                                className={`favorite-btn ${doc.isFavorite ? 'favorited' : ''}`}
                                onClick={(e) => toggleFavorite(doc._id, e)}
                                title={doc.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                              >
                                <i className={`ri-star-${doc.isFavorite ? 'fill' : 'line'}`}></i>
                              </button>
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
                  <div 
                    key={doc._id} 
                    className="document-card favorite-card" 
                    onClick={() => {
                      // Add to recent documents
                      const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
                      const docData = {
                        title: doc.title,
                        lastModified: new Date().toISOString(),
                        preview: doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No content yet',
                        wordCount: doc.wordCount || 0,
                        id: doc._id
                      };
                      
                      const filtered = recentDocs.filter(d => d.id !== doc._id);
                      filtered.unshift(docData);
                      localStorage.setItem('recentDocuments', JSON.stringify(filtered.slice(0, 10)));
                      
                      navigate(`/editor/${doc._id}`);
                    }}
                  >
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
                        onClick={(e) => toggleFavorite(doc._id, e)}
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