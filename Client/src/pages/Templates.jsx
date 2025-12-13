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
      highlight: { icon: '✉️', text: 'Made for official correspondence' },
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
      highlight: { icon: '💼', text: 'ATS-friendly professional resume' },
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
      highlight: { icon: '📊', text: 'Pitch clients with confidence' },
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
    },
    {
      id: 'modern-resume',
      title: 'Modern Resume',
      description: 'Bold two-column resume layout with skills emphasis',
      category: 'Career',
      highlight: { icon: '🧠', text: 'Creative layout for standout roles' },
      preview: `
        <div style="font-family: 'Poppins', sans-serif; font-size: 11pt; line-height: 1.5;">
          <div style="display:flex; gap:28px;">
            <div style="width:32%; background:#0f172a; color:#f8fafc; padding:18px; border-radius:12px;">
              <div style="text-align:center; margin-bottom:18px;">
                <div style="width:78px; height:78px; border-radius:50%; background:#1e293b; margin:0 auto 10px;"></div>
                <h2 style="margin:0; font-size:18pt;">[Your Name]</h2>
                <p style="margin:0; font-size:10pt;">[Title]</p>
              </div>
              <h3 style="font-size:11pt; letter-spacing:1px;">CONTACT</h3>
              <p>[Phone]<br/>[Email]<br/>[Website]</p>
              <h3 style="font-size:11pt; letter-spacing:1px; margin-top:18px;">SKILLS</h3>
              <ul style="padding-left:16px;">
                <li>[Skill One]</li>
                <li>[Skill Two]</li>
                <li>[Skill Three]</li>
              </ul>
            </div>
            <div style="flex:1;">
              <div style="border-bottom:2px solid #e2e8f0; padding-bottom:12px; margin-bottom:18px;">
                <h1 style="margin:0; font-size:28pt; color:#0f172a;">[Your Name]</h1>
                <p style="margin:4px 0 0; color:#475569;">[Professional Summary - 3 lines describing strengths]</p>
              </div>
              <section style="margin-bottom:18px;">
                <h2 style="margin:0 0 8px; color:#0f172a;">EXPERIENCE</h2>
                <div>
                  <h3 style="margin:0;">[Role] • [Company]</h3>
                  <p style="margin:0; color:#64748b;">[YYYY – YYYY]</p>
                  <ul style="margin:6px 0 12px; padding-left:18px; color:#475569;">
                    <li>Key achievement bullet one</li>
                    <li>Key achievement bullet two</li>
                  </ul>
                </div>
              </section>
              <section>
                <h2 style="margin:0 0 8px; color:#0f172a;">EDUCATION</h2>
                <p style="margin:0;">[Degree], [University], [Year]</p>
              </section>
            </div>
          </div>
        </div>
      `,
      thumbnail: '🧾'
    },
    {
      id: 'creative-portfolio',
      title: 'Creative Portfolio',
      description: 'Showcase projects, clients, and testimonials in one page',
      category: 'Creative',
      highlight: { icon: '🎯', text: 'Tell your brand story visually' },
      preview: `
        <div style="font-family:'Montserrat', sans-serif; font-size:11pt; line-height:1.6;">
          <header style="text-align:center; margin-bottom:20px;">
            <h1 style="margin:0; letter-spacing:4px;">[Studio Name]</h1>
            <p style="margin:4px 0; color:#6b7280;">Branding • UI/UX • Illustration</p>
          </header>
          <section style="display:flex; gap:18px; margin-bottom:16px;">
            <div style="flex:1; background:#f9fafb; padding:12px; border-radius:10px;">
              <h3 style="margin:0 0 8px;">PROJECT HIGHLIGHT</h3>
              <p>[Brief project description, goals, and results.]</p>
            </div>
            <div style="flex:1; background:#eef2ff; padding:12px; border-radius:10px;">
              <h3 style="margin:0 0 8px;">CLIENTS</h3>
              <ul style="margin:0; padding-left:16px;">
                <li>[Client A]</li>
                <li>[Client B]</li>
                <li>[Client C]</li>
              </ul>
            </div>
          </section>
          <section>
            <h3 style="margin:0 0 6px;">TESTIMONIAL</h3>
            <blockquote style="margin:0; padding:12px; background:#fff7ed; border-left:4px solid #f97316;">
              “Working with [Your Name] transformed our product experience!”
            </blockquote>
          </section>
        </div>
      `,
      thumbnail: '🎨'
    },
    {
      id: 'freelance-invoice',
      title: 'Freelance Invoice',
      description: 'Minimal invoice for services rendered with totals section',
      category: 'Finance',
      highlight: { icon: '🧾', text: 'Keep billables clear and polished' },
      preview: `
        <div style="font-family: 'Inter', sans-serif; font-size: 11pt; color:#0f172a;">
          <header style="display:flex; justify-content:space-between; margin-bottom:18px;">
            <div>
              <h1 style="margin:0; letter-spacing:4px;">INVOICE</h1>
              <p style="margin:4px 0;">Invoice #: [00123]<br/>Date: [MMM DD, YYYY]</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0;">[Your Studio]<br/>[Address Line]<br/>[City, Country]</p>
            </div>
          </header>
          <section style="margin-bottom:16px;">
            <h3 style="margin:0 0 6px;">BILL TO</h3>
            <p style="margin:0;">[Client Name]<br/>[Client Company]<br/>[Client Email]</p>
          </section>
          <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
            <thead>
              <tr style="background:#f8fafc;">
                <th style="text-align:left; padding:8px; border:1px solid #e2e8f0;">Description</th>
                <th style="text-align:center; padding:8px; border:1px solid #e2e8f0;">Qty</th>
                <th style="text-align:right; padding:8px; border:1px solid #e2e8f0;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:8px; border:1px solid #e2e8f0;">UX Design Sprint</td>
                <td style="text-align:center; padding:8px; border:1px solid #e2e8f0;">1</td>
                <td style="text-align:right; padding:8px; border:1px solid #e2e8f0;">$2,400.00</td>
              </tr>
              <tr>
                <td style="padding:8px; border:1px solid #e2e8f0;">Prototype Handoff</td>
                <td style="text-align:center; padding:8px; border:1px solid #e2e8f0;">1</td>
                <td style="text-align:right; padding:8px; border:1px solid #e2e8f0;">$850.00</td>
              </tr>
            </tbody>
          </table>
          <div style="display:flex; justify-content:flex-end;">
            <div style="width:220px;">
              <div style="display:flex; justify-content:space-between; padding:4px 0;">
                <span>Subtotal</span><strong>$3,250.00</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:4px 0;">
                <span>Tax (6%)</span><strong>$195.00</strong>
              </div>
              <div style="display:flex; justify-content:space-between; padding:6px 0; border-top:1px solid #e2e8f0; margin-top:6px;">
                <span>Total Due</span><strong>$3,445.00</strong>
              </div>
            </div>
          </div>
        </div>
      `,
      thumbnail: '📑'
    },
    {
      id: 'event-invite',
      title: 'Event Invitation',
      description: 'Chic single-page invite for dinners, launches, or meetups',
      category: 'Events',
      highlight: { icon: '🥂', text: 'Elegant RSVP-ready invite' },
      preview: `
        <div style="font-family:'Playfair Display', serif; font-size: 12pt; line-height:1.6; text-align:center;">
          <p style="letter-spacing:6px; color:#a855f7; margin:0;">YOU'RE INVITED</p>
          <h1 style="margin:12px 0;">[Event Name]</h1>
          <p style="margin:0;">Hosted by [Host Name]</p>
          <div style="margin:20px auto; width:70%; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; padding:16px 0;">
            <p style="margin:4px 0; font-weight:bold;">[Saturday, August 24]</p>
            <p style="margin:4px 0;">[6:00 PM – 10:00 PM]</p>
            <p style="margin:4px 0;">[Venue Name, City]</p>
          </div>
          <p style="margin:0;">Dress Code: [Smart Casual]</p>
          <p style="margin:4px 0 0;">RSVP by [Date] • [email@domain.com]</p>
        </div>
      `,
      thumbnail: '🎟️'
    },
    {
      id: 'newsletter',
      title: 'Company Newsletter',
      description: 'Monthly update layout with hero story and highlights',
      category: 'Marketing',
      highlight: { icon: '📣', text: 'Share product and team wins' },
      preview: `
        <div style="font-family:'Inter', sans-serif; font-size:11pt; color:#0f172a; line-height:1.6;">
          <header style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e5e7eb; padding-bottom:12px; margin-bottom:18px;">
            <div>
              <h1 style="margin:0; letter-spacing:3px;">THE PULSE</h1>
              <p style="margin:0; color:#6b7280;">Issue 12 · [Month Year]</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0;">[Company Name]</p>
              <p style="margin:0; font-size:10pt;">[website.com]</p>
            </div>
          </header>
          <section style="margin-bottom:18px;">
            <h2 style="margin:0 0 8px; color:#2563eb;">FEATURE STORY</h2>
            <p>[Lead story summary introducing a recent launch, milestone, or insight.]</p>
          </section>
          <section style="display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:14px;">
            <article style="background:#f8fafc; padding:12px; border-radius:10px;">
              <h3 style="margin:0 0 6px;">Team Spotlight</h3>
              <p style="margin:0;">[Highlight a team, member, or department achievement.]</p>
            </article>
            <article style="background:#fff7ed; padding:12px; border-radius:10px;">
              <h3 style="margin:0 0 6px;">By the Numbers</h3>
              <ul style="margin:0; padding-left:18px;">
                <li>[Metric 1]</li>
                <li>[Metric 2]</li>
                <li>[Metric 3]</li>
              </ul>
            </article>
          </section>
        </div>
      `,
      thumbnail: '🗞️'
    },
    {
      id: 'meeting-notes',
      title: 'Meeting Notes',
      description: 'Structured notes template with agenda, actions, and next steps',
      category: 'Productivity',
      highlight: { icon: '✅', text: 'Capture decisions & follow-ups' },
      preview: `
        <div style="font-family:'Source Sans Pro', sans-serif; font-size:12pt; line-height:1.5; border:1px solid #e4e4e7; padding:18px;">
          <header style="display:flex; justify-content:space-between; margin-bottom:14px;">
            <div>
              <h1 style="margin:0; font-size:20pt;">Meeting Notes</h1>
              <p style="margin:0;">Project: [Project Name]</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0;">Date: [MM/DD/YYYY]</p>
              <p style="margin:0;">Facilitator: [Name]</p>
            </div>
          </header>
          <section style="margin-bottom:12px;">
            <h3 style="margin:0 0 6px;">Agenda</h3>
            <ol style="margin:0; padding-left:20px;">
              <li>[Topic A]</li>
              <li>[Topic B]</li>
              <li>[Topic C]</li>
            </ol>
          </section>
          <section style="margin-bottom:12px;">
            <h3 style="margin:0 0 6px;">Discussion Highlights</h3>
            <p>[Summaries and key decisions taken during the meeting.]</p>
          </section>
          <section>
            <h3 style="margin:0 0 6px;">Action Items</h3>
            <table style="width:100%; border-collapse:collapse;">
              <thead>
                <tr style="background:#f4f4f5;">
                  <th style="text-align:left; padding:6px; border:1px solid #e4e4e7;">Owner</th>
                  <th style="text-align:left; padding:6px; border:1px solid #e4e4e7;">Task</th>
                  <th style="text-align:left; padding:6px; border:1px solid #e4e4e7;">Due</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:6px; border:1px solid #e4e4e7;">[Name]</td>
                  <td style="padding:6px; border:1px solid #e4e4e7;">[Follow-up task]</td>
                  <td style="padding:6px; border:1px solid #e4e4e7;">[Due Date]</td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      `,
      thumbnail: '📝'
    },
    {
      id: 'press-release',
      title: 'Press Release',
      description: 'Media announcement with headline, quote, and boilerplate',
      category: 'Public Relations',
      highlight: { icon: '📰', text: 'Broadcast news to media outlets' },
      preview: `
        <div style="font-family:'Georgia', serif; font-size:12pt; line-height:1.6;">
          <p style="text-transform:uppercase; letter-spacing:4px; color:#dc2626; margin:0;">FOR IMMEDIATE RELEASE</p>
          <h1 style="margin:6px 0;">[Headline Capturing Major Announcement]</h1>
          <p style="margin:0 0 14px; color:#6b7280;">[City, State] – [Date]</p>
          <p>[Opening paragraph summarizing the news, why it matters, and who is involved.]</p>
          <p>[Second paragraph with supporting details, data points, or milestones.]</p>
          <blockquote style="margin:16px 0; padding:12px 16px; background:#f1f5f9; border-left:4px solid #3b82f6;">
            “A compelling quote from a spokesperson that adds credibility and emotion,” said [Name], [Title].
          </blockquote>
          <p>[Additional context, partnerships, availability, or pricing information.]</p>
          <h3 style="margin:20px 0 6px;">About [Company]</h3>
          <p>[Boilerplate paragraph describing the organization.]</p>
          <p style="margin-top:18px;">Media Contact: [Name] · [Email] · [Phone]</p>
        </div>
      `,
      thumbnail: '📰'
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
        </div>
        <div className="header-center">
          <h1>Document Templates</h1>
          <p>Choose from our professionally designed templates to get started quickly</p>
        </div>
        <div className="header-right">
          <button className="back-btn btn btn-primary" onClick={() => navigate('/home')}>
            <i className="ri-arrow-left-line"></i>
            Back
          </button>
        </div>
      </div>

      <div className="templates-grid">
        {templates.map(template => (
          <div key={template.id} className="template-card-wrapper">
            <div className="template-card">
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default Templates;
