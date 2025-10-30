import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useLogoAnimation } from '../hooks/useLogoAnimation';
import './Templates.css';

const Templates = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => {
    return JSON.parse(localStorage.getItem('favoriteTemplates') || '[]');
  });
  const isLogoAnimating = useLogoAnimation();

  const templates = [
    {
      id: 'letter',
      title: 'Formal Letter',
      description: 'Professional letter template for business correspondence',
      category: 'Business',
      preview: `
        <div style="font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5;">
          <div style="text-align: right; margin-bottom: 40px;">
            <p>[Your Name]<br>
            [Your Address]<br>
            [City, State, ZIP Code]<br>
            [Email Address]<br>
            [Phone Number]<br>
            [Date]</p>
          </div>

          <div style="margin-bottom: 40px;">
            <p>[Recipient's Name]<br>
            [Recipient's Title]<br>
            [Company Name]<br>
            [Company Address]<br>
            [City, State, ZIP Code]</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p>Dear [Recipient's Name],</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p>[Introduction paragraph - State the purpose of your letter]</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p>[Body paragraph - Provide details and supporting information]</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p>[Closing paragraph - Summarize and state next steps]</p>
          </div>

          <div style="margin-bottom: 20px;">
            <p>Sincerely,</p>
            <p>[Your Name]<br>
            [Your Title]</p>
          </div>
        </div>
      `,
      thumbnail: '📄'
    },
    {
      id: 'resume',
      title: 'Professional Resume',
      description: 'Clean and modern resume template for job applications',
      category: 'Career',
      preview: `
        <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4;">
          <div style="text-align: center; border-bottom: 2px solid #FFD700; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; color: #333; font-size: 24pt;">[Your Full Name]</h1>
            <p style="margin: 5px 0; color: #666;">[Professional Title]</p>
            <p style="margin: 5px 0; color: #666;">[Phone Number] | [Email Address] | [Location]</p>
            <p style="margin: 5px 0; color: #666;">[LinkedIn Profile] | [Portfolio Website]</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #FFD700; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">PROFESSIONAL SUMMARY</h2>
            <p>[Write a compelling 3-4 sentence summary of your professional background and key strengths]</p>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #FFD700; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">WORK EXPERIENCE</h2>

            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0; color: #333;">[Job Title]</h3>
              <p style="margin: 2px 0; font-style: italic; color: #666;">[Company Name], [City, State] | [Start Date] - [End Date]</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>[Achievement/Responsibility 1]</li>
                <li>[Achievement/Responsibility 2]</li>
                <li>[Achievement/Responsibility 3]</li>
              </ul>
            </div>

            <div style="margin-bottom: 20px;">
              <h3 style="margin: 0; color: #333;">[Previous Job Title]</h3>
              <p style="margin: 2px 0; font-style: italic; color: #666;">[Previous Company], [City, State] | [Start Date] - [End Date]</p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>[Achievement/Responsibility 1]</li>
                <li>[Achievement/Responsibility 2]</li>
              </ul>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #FFD700; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">EDUCATION</h2>
            <div style="margin-bottom: 15px;">
              <h3 style="margin: 0; color: #333;">[Degree], [Field of Study]</h3>
              <p style="margin: 2px 0; font-style: italic; color: #666;">[University Name], [City, State] | [Graduation Year]</p>
              <p style="margin: 5px 0;">[Relevant coursework, honors, GPA if above 3.5]</p>
            </div>
          </div>

          <div style="margin-bottom: 25px;">
            <h2 style="color: #FFD700; border-bottom: 1px solid #FFD700; padding-bottom: 5px;">SKILLS</h2>
            <ul style="margin: 10px 0; padding-left: 20px; display: flex; flex-wrap: wrap; gap: 10px;">
              <li style="background: #f0f0f0; padding: 5px 10px; border-radius: 15px;">[Skill 1]</li>
              <li style="background: #f0f0f0; padding: 5px 10px; border-radius: 15px;">[Skill 2]</li>
              <li style="background: #f0f0f0; padding: 5px 10px; border-radius: 15px;">[Skill 3]</li>
              <li style="background: #f0f0f0; padding: 5px 10px; border-radius: 15px;">[Skill 4]</li>
            </ul>
          </div>
        </div>
      `,
      thumbnail: '📋'
    },
    {
      id: 'business',
      title: 'Business Proposal',
      description: 'Comprehensive business proposal template for projects and partnerships',
      category: 'Business',
      preview: `
        <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5;">
          <div style="text-align: center; border-bottom: 3px solid #FFD700; padding-bottom: 30px; margin-bottom: 40px;">
            <h1 style="margin: 0; color: #333; font-size: 28pt;">BUSINESS PROPOSAL</h1>
            <h2 style="margin: 10px 0; color: #666; font-size: 18pt;">[Project/Service Title]</h2>
            <p style="margin: 10px 0; color: #666;">Prepared by: [Your Company Name]</p>
            <p style="margin: 10px 0; color: #666;">Date: [Date]</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">EXECUTIVE SUMMARY</h2>
            <p>[Provide a concise overview of the proposal, including the problem being solved, your solution, and expected outcomes]</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">INTRODUCTION</h2>
            <p>[Introduce your company and establish credibility. Explain the purpose of this proposal.]</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">PROBLEM STATEMENT</h2>
            <p>[Clearly define the problem or opportunity that this proposal addresses]</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">SOLUTION OVERVIEW</h2>
            <p>[Describe your proposed solution in detail, including methodology and approach]</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">SCOPE OF WORK</h2>
            <ul style="margin: 15px 0; padding-left: 25px;">
              <li>[Deliverable 1]</li>
              <li>[Deliverable 2]</li>
              <li>[Deliverable 3]</li>
              <li>[Timeline and milestones]</li>
            </ul>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">TIMELINE</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Phase</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Duration</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Deliverables</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Phase 1]</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Duration]</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Deliverables]</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Phase 2]</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Duration]</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Deliverables]</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">COST BREAKDOWN</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                  <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Service/Item 1]</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$[Amount]</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">[Service/Item 2]</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">$[Amount]</td>
                </tr>
                <tr style="border-top: 2px solid #FFD700;">
                  <td style="border: 1px solid #ddd; padding: 8px; font-weight: bold;">Total</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">$[Total]</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">ABOUT US</h2>
            <p>[Brief company background, experience, and qualifications]</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 8px;">CONTACT INFORMATION</h2>
            <p>[Your Name]<br>
            [Your Title]<br>
            [Company Name]<br>
            [Phone Number]<br>
            [Email Address]<br>
            [Website]</p>
          </div>
        </div>
      `,
      thumbnail: '💼'
    }
  ];

  const toggleFavorite = (templateId) => {
    const newFavorites = favorites.includes(templateId)
      ? favorites.filter(id => id !== templateId)
      : [...favorites, templateId];

    setFavorites(newFavorites);
    localStorage.setItem('favoriteTemplates', JSON.stringify(newFavorites));
  };

  const useTemplate = (template) => {
    // Store template data in localStorage to be loaded by DocumentEditor
    const templateData = {
      title: `${template.title} - ${new Date().toLocaleDateString()}`,
      content: template.preview,
      templateId: template.id,
      lastModified: new Date().toISOString()
    };

    localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
    navigate('/editor');
  };

  return (
    <div className="templates-page">
      {/* Templates Header - Similar to Home Header */}
      <div className="templates-header">
        <div className="header-left">
          <div className="logo-section">
            <Logo size={32} className={isLogoAnimating ? 'animate' : ''} />
            <span className="brand-text">EtherXWord</span>
          </div>
        </div>
        <div className="header-center">
          <h1>Document Templates</h1>
          <p>Choose from our professionally designed templates to get started quickly</p>
        </div>
        <div className="header-right">
          <button className="back-btn" onClick={() => navigate('/home')}>
            <i className="ri-arrow-left-line"></i>
            Back
          </button>
        </div>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card">
            <div className="template-header">
              <div className="template-thumbnail">
                {template.thumbnail}
              </div>
              <button
                className={`favorite-btn ${favorites.includes(template.id) ? 'favorited' : ''}`}
                onClick={() => toggleFavorite(template.id)}
                title={favorites.includes(template.id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                {favorites.includes(template.id) ? '★' : '☆'}
              </button>
            </div>

            <div className="template-info">
              <h3>{template.title}</h3>
              <span className="template-category">{template.category}</span>
              <p>{template.description}</p>
            </div>

            <div className="template-preview">
              <div
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: template.preview }}
              />
            </div>

            <div className="template-actions">
              <button
                className="use-template-btn"
                onClick={() => useTemplate(template)}
              >
                Use This Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
