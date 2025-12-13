import React, { useState } from 'react';
import './BackstagePanel.css';

const BackstagePanel = ({ onClose, onApply }) => {
  const [selectedSection, setSelectedSection] = useState('Home');

  const menuItems = [
    { id: 'Home', label: 'Home', icon: 'ri-home-line' },
    { id: 'New', label: 'New', icon: 'ri-file-add-line' },
    { id: 'Open', label: 'Open', icon: 'ri-folder-open-line' },
    { id: 'Save', label: 'Save', icon: 'ri-save-line' },
    { id: 'SaveAs', label: 'Save As', icon: 'ri-save-2-line' },
    { id: 'Print', label: 'Print', icon: 'ri-printer-line' },
    { id: 'Share', label: 'Share', icon: 'ri-share-line' },
    { id: 'Export', label: 'Export', icon: 'ri-download-line' },
    { id: 'Close', label: 'Close', icon: 'ri-close-line' }
  ];

  const handleAction = (action, value) => {
    if (action === 'openTemplates') {
      window.location.href = '/templates';
      return;
    }
    
    // Map backstage actions to the expected file actions
    const actionMap = {
      'fileSave': 'fileSave',
      'fileSaveAs': 'fileSaveAs',
      'fileClose': 'fileClose'
    };
    
    const mappedAction = actionMap[action] || action;
    onApply(mappedAction, value);
    
    // Keep backstage open for share action, close for others
    if (action !== 'fileShare') {
      onClose();
    }
  };

  return (
    <div className="backstage-overlay">
      <div className="backstage-panel">
        {/* Sidebar */}
        <div className="backstage-sidebar">
          <div className="backstage-header">
            <button className="backstage-close" onClick={onClose}>
              <i className="ri-arrow-left-line"></i>
            </button>
            <h2>File</h2>
          </div>
          
          <nav className="backstage-nav">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`backstage-nav-item ${selectedSection === item.id ? 'active' : ''}`}
                onClick={() => setSelectedSection(item.id)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="backstage-content">
          {/* Home Section - Always visible */}
          {selectedSection === 'Home' && (
            <div className="backstage-section">
              <h3>Home</h3>
              <div className="backstage-grid">
                <div className="backstage-card" onClick={() => handleAction('fileNew')}>
                  <i className="ri-file-add-line"></i>
                  <h4>New Document</h4>
                  <p>Create a blank document</p>
                </div>
                <div className="backstage-card" onClick={() => handleAction('fileOpen')}>
                  <i className="ri-folder-open-line"></i>
                  <h4>Open</h4>
                  <p>Open an existing document</p>
                </div>
                <div className="backstage-card" onClick={() => handleAction('fileSave')}>
                  <i className="ri-save-line"></i>
                  <h4>Save</h4>
                  <p>Save the current document</p>
                </div>
                <div className="backstage-card" onClick={() => handleAction('fileExport')}>
                  <i className="ri-download-line"></i>
                  <h4>Export</h4>
                  <p>Export as DOCX</p>
                </div>
              </div>
            </div>
          )}

          {/* New Section */}
          {selectedSection === 'New' && (
            <div className="backstage-section">
              <h3>Create New Document</h3>
              <div className="backstage-grid">
                <div className="backstage-card" onClick={() => handleAction('fileNew')}>
                  <i className="ri-file-text-line"></i>
                  <h4>Blank Document</h4>
                  <p>Start with a clean slate</p>
                </div>
                <div className="backstage-card" onClick={() => handleAction('openTemplates')}>
                  <i className="ri-layout-2-line"></i>
                  <h4>From Template</h4>
                  <p>Choose from templates</p>
                </div>
              </div>
            </div>
          )}

          {/* Open Section */}
          {selectedSection === 'Open' && (
            <div className="backstage-section">
              <h3>Open Document</h3>
              <div className="backstage-actions">
                <button className="backstage-btn primary" onClick={() => handleAction('fileOpen')}>
                  <i className="ri-folder-open-line"></i>
                  Browse Files
                </button>
              </div>
            </div>
          )}

          {/* Save Section */}
          {selectedSection === 'Save' && (
            <div className="backstage-section">
              <h3>Save Document</h3>
              <div className="backstage-actions">
                <button className="backstage-btn primary" onClick={() => handleAction('fileSave')}>
                  <i className="ri-save-line"></i>
                  Save
                </button>
                <button className="backstage-btn" onClick={() => handleAction('fileSaveAs')}>
                  <i className="ri-save-2-line"></i>
                  Save As
                </button>
              </div>
            </div>
          )}

          {/* Save As Section */}
          {selectedSection === 'SaveAs' && (
            <div className="backstage-section">
              <h3>Save As</h3>
              <div className="backstage-actions">
                <button className="backstage-btn primary" onClick={() => handleAction('fileSaveAs')}>
                  <i className="ri-save-2-line"></i>
                  Save As New File
                </button>
              </div>
            </div>
          )}

          {/* Print Section */}
          {selectedSection === 'Print' && (
            <div className="backstage-section">
              <h3>Print</h3>
              <div className="backstage-actions">
                <button className="backstage-btn primary" onClick={() => handleAction('filePrint')}>
                  <i className="ri-printer-line"></i>
                  Print Document
                </button>
              </div>
            </div>
          )}

          {/* Share Section */}
          {selectedSection === 'Share' && (
            <div className="backstage-section">
              <h3>Share Document</h3>
              <div className="backstage-actions">
                <button className="backstage-btn primary" onClick={() => handleAction('fileShare')}>
                  <i className="ri-share-line"></i>
                  Share
                </button>
                <button className="backstage-btn" onClick={() => handleAction('fileCopy')}>
                  <i className="ri-file-copy-line"></i>
                  Create Copy
                </button>
              </div>
            </div>
          )}

          {/* Export Section */}
          {selectedSection === 'Export' && (
            <div className="backstage-section">
              <h3>Export Document</h3>
              <div className="backstage-grid">
                <div className="backstage-card" onClick={() => handleAction('fileExport')}>
                  <i className="ri-file-word-line"></i>
                  <h4>Export as DOCX</h4>
                  <p>Microsoft Word format</p>
                </div>
                <div className="backstage-card">
                  <i className="ri-file-pdf-line"></i>
                  <h4>Export as PDF</h4>
                  <p>Portable Document Format</p>
                </div>
              </div>
            </div>
          )}

          {/* Close Section */}
          {selectedSection === 'Close' && (
            <div className="backstage-section">
              <h3>Close Document</h3>
              <div className="backstage-actions">
                <button className="backstage-btn primary" onClick={() => handleAction('fileClose')}>
                  <i className="ri-close-line"></i>
                  Close Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackstagePanel;