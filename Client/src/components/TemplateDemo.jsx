import React from 'react';
import { TemplateLoader, loadBusinessLetter, loadMeetingMinutes, loadProjectProposal } from '../utils/templateLoader';

const TemplateDemo = ({ onHide }) => {
  const handleLoadTemplate = (templateType) => {
    switch (templateType) {
      case 'business-letter':
        loadBusinessLetter();
        break;
      case 'meeting-minutes':
        loadMeetingMinutes();
        break;
      case 'project-proposal':
        loadProjectProposal();
        break;
      default:
        console.log('Unknown template type');
    }
  };

  const handleCustomTemplate = () => {
    const customTemplate = {
      title: 'Custom Template',
      content: `
        <h1 style="color: #FFD700; text-align: center;">Custom Template Example</h1>
        <p>This is a custom template that demonstrates safe loading.</p>
        <p>It preserves existing content and features while adding new content.</p>
        <ul>
          <li>Feature 1: Preserves existing formatting</li>
          <li>Feature 2: Maintains undo/redo history</li>
          <li>Feature 3: Keeps all editor functionality intact</li>
        </ul>
        <p style="color: #666; font-style: italic;">Template loaded at: ${new Date().toLocaleString()}</p>
      `
    };

    TemplateLoader.loadTemplate(customTemplate, {
      merge: true,
      preserveTitle: true,
      preserveFormatting: true
    });
  };

  const handleReplaceContent = () => {
    const replaceTemplate = {
      title: 'New Document',
      content: `
        <h1>Fresh Start</h1>
        <p>This template replaces all existing content.</p>
        <p>Use this option when you want to start completely fresh.</p>
      `
    };

    TemplateLoader.loadTemplate(replaceTemplate, {
      merge: false,
      preserveTitle: false,
      preserveFormatting: false
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '100px',
      right: '20px',
      background: 'rgba(26, 26, 26, 0.95)',
      backdropFilter: 'blur(20px)',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '20px',
      minWidth: '250px',
      zIndex: 1000,
      color: 'white'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#FFD700' }}>Template Demo</h3>
        <button
          onClick={onHide}
          style={{
            background: 'none',
            border: 'none',
            color: '#ccc',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px'
          }}
          title="Hide Template Demo"
        >
          ×
        </button>
      </div>
      
      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Merge Templates:</h4>
        <button
          onClick={() => handleLoadTemplate('business-letter')}
          style={{
            width: '100%',
            background: '#FFD700',
            color: '#000',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '4px',
            fontSize: '12px'
          }}
        >
          Business Letter
        </button>
        <button
          onClick={() => handleLoadTemplate('meeting-minutes')}
          style={{
            width: '100%',
            background: '#FFD700',
            color: '#000',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '4px',
            fontSize: '12px'
          }}
        >
          Meeting Minutes
        </button>
        <button
          onClick={() => handleLoadTemplate('project-proposal')}
          style={{
            width: '100%',
            background: '#FFD700',
            color: '#000',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '4px',
            fontSize: '12px'
          }}
        >
          Project Proposal
        </button>
        <button
          onClick={handleCustomTemplate}
          style={{
            width: '100%',
            background: '#4CAF50',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '4px',
            fontSize: '12px'
          }}
        >
          Custom Template
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Replace Content:</h4>
        <button
          onClick={handleReplaceContent}
          style={{
            width: '100%',
            background: '#f44336',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Replace All Content
        </button>
      </div>

      <div style={{ fontSize: '11px', color: '#ccc', marginTop: '12px' }}>
        <p style={{ margin: '0 0 4px 0' }}>• Merge: Adds template below existing content</p>
        <p style={{ margin: '0 0 4px 0' }}>• Replace: Clears all content first</p>
        <p style={{ margin: '0' }}>• All editor features remain intact</p>
      </div>
    </div>
  );
};

export default TemplateDemo;