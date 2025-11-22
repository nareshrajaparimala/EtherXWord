// Template Loader Utility
// This utility provides safe template loading that preserves existing editor features

export const TemplateLoader = {
  // Load template safely without disrupting existing content
  loadTemplate: (templateData, options = {}) => {
    const {
      merge = true,
      preserveTitle = false,
      preserveFormatting = true,
      showNotification = true
    } = options;

    // Check if EtherXWordEditor is available
    if (typeof window !== 'undefined' && window.EtherXWordEditor) {
      return window.EtherXWordEditor.loadTemplate(templateData, options);
    }

    console.warn('EtherXWordEditor not available. Template loading failed.');
    return false;
  },

  // Get current editor content
  getCurrentContent: () => {
    if (typeof window !== 'undefined' && window.EtherXWordEditor) {
      return window.EtherXWordEditor.getCurrentContent();
    }
    return '';
  },

  // Set editor content safely
  setContent: (content) => {
    if (typeof window !== 'undefined' && window.EtherXWordEditor) {
      return window.EtherXWordEditor.setContent(content);
    }
    return false;
  },

  // Validate template data
  validateTemplate: (templateData) => {
    if (!templateData || typeof templateData !== 'object') {
      return { valid: false, error: 'Invalid template data' };
    }

    if (!templateData.content || typeof templateData.content !== 'string') {
      return { valid: false, error: 'Template must have content property' };
    }

    if (templateData.title && typeof templateData.title !== 'string') {
      return { valid: false, error: 'Template title must be a string' };
    }

    return { valid: true };
  },

  // Create template from current content
  createTemplate: (title = 'Untitled Template') => {
    const content = TemplateLoader.getCurrentContent();
    if (!content) {
      return null;
    }

    return {
      title,
      content,
      createdAt: new Date().toISOString(),
      version: '1.0'
    };
  },

  // Sample templates for testing
  getSampleTemplates: () => [
    {
      title: 'Business Letter Template',
      content: `
        <div style="text-align: right; margin-bottom: 20px;">
          <p>[Your Name]<br>
          [Your Address]<br>
          [City, State ZIP Code]<br>
          [Email Address]<br>
          [Phone Number]</p>
          <p>[Date]</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <p>[Recipient Name]<br>
          [Title]<br>
          [Company Name]<br>
          [Address]<br>
          [City, State ZIP Code]</p>
        </div>
        
        <p>Dear [Recipient Name],</p>
        
        <p>I am writing to [state the purpose of your letter]. [Provide details and context for your message].</p>
        
        <p>[Additional paragraphs as needed to convey your message clearly and professionally].</p>
        
        <p>Thank you for your time and consideration. I look forward to hearing from you soon.</p>
        
        <p>Sincerely,<br>
        [Your Signature]<br>
        [Your Typed Name]</p>
      `
    },
    {
      title: 'Meeting Minutes Template',
      content: `
        <h1 style="text-align: center; color: #333;">Meeting Minutes</h1>
        
        <div style="margin-bottom: 20px;">
          <p><strong>Meeting Title:</strong> [Meeting Name]</p>
          <p><strong>Date:</strong> [Date]</p>
          <p><strong>Time:</strong> [Start Time] - [End Time]</p>
          <p><strong>Location:</strong> [Location/Platform]</p>
          <p><strong>Facilitator:</strong> [Name]</p>
        </div>
        
        <h2>Attendees</h2>
        <ul>
          <li>[Name 1] - [Role]</li>
          <li>[Name 2] - [Role]</li>
          <li>[Name 3] - [Role]</li>
        </ul>
        
        <h2>Agenda Items</h2>
        <ol>
          <li><strong>[Agenda Item 1]</strong>
            <p>Discussion: [Summary of discussion]</p>
            <p>Decision: [Decision made]</p>
            <p>Action Items: [Who will do what by when]</p>
          </li>
          <li><strong>[Agenda Item 2]</strong>
            <p>Discussion: [Summary of discussion]</p>
            <p>Decision: [Decision made]</p>
            <p>Action Items: [Who will do what by when]</p>
          </li>
        </ol>
        
        <h2>Action Items Summary</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">Task</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Assigned To</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Due Date</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">[Task 1]</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Person]</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Date]</td>
          </tr>
        </table>
        
        <h2>Next Meeting</h2>
        <p><strong>Date:</strong> [Next Meeting Date]</p>
        <p><strong>Time:</strong> [Time]</p>
        <p><strong>Location:</strong> [Location]</p>
      `
    },
    {
      title: 'Project Proposal Template',
      content: `
        <h1 style="text-align: center; color: #2c3e50;">Project Proposal</h1>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #34495e;">[Project Title]</h2>
          <p><strong>Prepared by:</strong> [Your Name]</p>
          <p><strong>Date:</strong> [Date]</p>
          <p><strong>Version:</strong> 1.0</p>
        </div>
        
        <h2>Executive Summary</h2>
        <p>[Provide a brief overview of the project, its objectives, and expected outcomes. This should be concise but comprehensive enough to give readers a clear understanding of what you're proposing.]</p>
        
        <h2>Project Background</h2>
        <p>[Explain the context and rationale for the project. What problem does it solve? Why is it needed now?]</p>
        
        <h2>Project Objectives</h2>
        <ul>
          <li>[Objective 1]</li>
          <li>[Objective 2]</li>
          <li>[Objective 3]</li>
        </ul>
        
        <h2>Scope of Work</h2>
        <h3>Included in Scope:</h3>
        <ul>
          <li>[Deliverable 1]</li>
          <li>[Deliverable 2]</li>
          <li>[Deliverable 3]</li>
        </ul>
        
        <h3>Excluded from Scope:</h3>
        <ul>
          <li>[Exclusion 1]</li>
          <li>[Exclusion 2]</li>
        </ul>
        
        <h2>Timeline</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #ddd; padding: 10px;">Phase</th>
            <th style="border: 1px solid #ddd; padding: 10px;">Duration</th>
            <th style="border: 1px solid #ddd; padding: 10px;">Key Deliverables</th>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Phase 1: Planning</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Duration]</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Deliverables]</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Phase 2: Implementation</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Duration]</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Deliverables]</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">Phase 3: Testing & Deployment</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Duration]</td>
            <td style="border: 1px solid #ddd; padding: 8px;">[Deliverables]</td>
          </tr>
        </table>
        
        <h2>Budget</h2>
        <p><strong>Total Project Cost:</strong> $[Amount]</p>
        <p>[Provide breakdown of costs if necessary]</p>
        
        <h2>Risk Assessment</h2>
        <ul>
          <li><strong>[Risk 1]:</strong> [Mitigation strategy]</li>
          <li><strong>[Risk 2]:</strong> [Mitigation strategy]</li>
        </ul>
        
        <h2>Success Criteria</h2>
        <p>[Define how success will be measured and what constitutes project completion]</p>
        
        <h2>Conclusion</h2>
        <p>[Summarize the proposal and call for action/approval]</p>
      `
    }
  ]
};

// Example usage functions
export const loadBusinessLetter = () => {
  const templates = TemplateLoader.getSampleTemplates();
  const businessLetter = templates.find(t => t.title === 'Business Letter Template');
  return TemplateLoader.loadTemplate(businessLetter, { merge: true });
};

export const loadMeetingMinutes = () => {
  const templates = TemplateLoader.getSampleTemplates();
  const meetingMinutes = templates.find(t => t.title === 'Meeting Minutes Template');
  return TemplateLoader.loadTemplate(meetingMinutes, { merge: true });
};

export const loadProjectProposal = () => {
  const templates = TemplateLoader.getSampleTemplates();
  const projectProposal = templates.find(t => t.title === 'Project Proposal Template');
  return TemplateLoader.loadTemplate(projectProposal, { merge: true });
};

// Export for global access
if (typeof window !== 'undefined') {
  window.TemplateLoader = TemplateLoader;
}

export default TemplateLoader;