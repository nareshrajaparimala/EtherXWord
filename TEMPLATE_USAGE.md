# Template Usage Guide - EtherXWord

This guide explains how to use templates in EtherXWord without collapsing existing features.

## Overview

The EtherXWord editor now includes a robust template system that preserves all existing functionality while allowing you to load and use templates. The system is designed to be safe and non-destructive.

## Key Features

### ✅ Feature Preservation
- **All editor features remain intact** when loading templates
- **Undo/Redo history is preserved** and updated
- **Formatting tools continue to work** normally
- **Collaboration features remain active**
- **Page borders, headers, footers** are maintained
- **Image controls and other tools** stay functional

### ✅ Safe Loading Options
- **Merge Mode (Default)**: Adds template content below existing content
- **Replace Mode**: Replaces all content with template (use with caution)
- **Preserve Formatting**: Keeps existing text formatting
- **Preserve Title**: Maintains current document title

## How to Use Templates

### Method 1: Using localStorage (Current Implementation)
```javascript
// Set template data in localStorage before navigating to editor
const templateData = {
  title: "My Template",
  content: "<h1>Template Content</h1><p>Template body...</p>"
};

localStorage.setItem('selectedTemplate', JSON.stringify(templateData));
// Navigate to editor - template will load automatically
```

### Method 2: Using the Template Loader API
```javascript
import { TemplateLoader } from './utils/templateLoader';

// Load template with merge (safe - preserves existing content)
TemplateLoader.loadTemplate(templateData, {
  merge: true,           // Add below existing content
  preserveTitle: true,   // Keep current document title
  preserveFormatting: true, // Maintain existing formatting
  showNotification: true    // Show success/error messages
});

// Load template with replace (destructive - clears all content)
TemplateLoader.loadTemplate(templateData, {
  merge: false,          // Replace all content
  preserveTitle: false,  // Use template title
  preserveFormatting: false, // Apply template formatting
  showNotification: true
});
```

### Method 3: Using Global API (Available in browser)
```javascript
// Available globally when DocumentEditor is loaded
window.EtherXWordEditor.loadTemplate(templateData, options);
window.EtherXWordEditor.getCurrentContent();
window.EtherXWordEditor.setContent(content);
```

## Template Data Structure

```javascript
const templateData = {
  title: "Template Title",        // Optional: Document title
  content: "<h1>HTML Content</h1>", // Required: HTML content
  createdAt: "2024-01-01T00:00:00Z", // Optional: Creation timestamp
  version: "1.0"                  // Optional: Template version
};
```

## Sample Templates

The system includes several built-in templates:

### 1. Business Letter Template
- Professional business letter format
- Placeholder fields for customization
- Proper spacing and alignment

### 2. Meeting Minutes Template
- Structured meeting documentation
- Attendee tracking
- Action items table
- Agenda organization

### 3. Project Proposal Template
- Executive summary section
- Timeline and budget tables
- Risk assessment
- Professional formatting

## Best Practices

### ✅ Do's
- **Always use merge mode** when adding to existing content
- **Test templates** in development before production use
- **Validate template data** before loading
- **Preserve user's work** by defaulting to safe options
- **Show notifications** to inform users of template actions

### ❌ Don'ts
- **Don't use replace mode** without user confirmation
- **Don't load templates** without validating the data structure
- **Don't override** existing formatting without permission
- **Don't disable** existing editor features during template loading

## Error Handling

The template system includes comprehensive error handling:

```javascript
// Validate template before loading
const validation = TemplateLoader.validateTemplate(templateData);
if (!validation.valid) {
  console.error('Template validation failed:', validation.error);
  return;
}

// Safe loading with error handling
try {
  const success = TemplateLoader.loadTemplate(templateData);
  if (!success) {
    console.error('Template loading failed');
  }
} catch (error) {
  console.error('Template loading error:', error);
}
```

## Development Testing

In development mode, a Template Demo panel appears on the right side of the editor with buttons to test different templates:

- **Business Letter**: Loads professional letter template
- **Meeting Minutes**: Loads meeting documentation template  
- **Project Proposal**: Loads project proposal template
- **Custom Template**: Loads a sample custom template
- **Replace All Content**: Demonstrates replace mode (destructive)

## Integration Examples

### From Template Gallery
```javascript
// When user selects template from gallery
const handleTemplateSelect = (template) => {
  const confirmed = window.confirm(
    'Add this template to your document? Your existing content will be preserved.'
  );
  
  if (confirmed) {
    TemplateLoader.loadTemplate(template, {
      merge: true,
      preserveTitle: true,
      preserveFormatting: true
    });
  }
};
```

### From External Source
```javascript
// Loading template from API or external source
const loadExternalTemplate = async (templateId) => {
  try {
    const response = await fetch(`/api/templates/${templateId}`);
    const templateData = await response.json();
    
    const validation = TemplateLoader.validateTemplate(templateData);
    if (validation.valid) {
      TemplateLoader.loadTemplate(templateData);
    } else {
      console.error('Invalid template:', validation.error);
    }
  } catch (error) {
    console.error('Failed to load template:', error);
  }
};
```

## Troubleshooting

### Template Not Loading
1. Check if `window.EtherXWordEditor` is available
2. Verify template data structure
3. Ensure DocumentEditor component is mounted
4. Check browser console for errors

### Features Not Working After Template Load
1. Verify you're using merge mode (not replace)
2. Check if template content has conflicting styles
3. Ensure template HTML is valid
4. Try refreshing the page if issues persist

### Content Disappearing
1. Always use merge mode for safety
2. Check undo history (Ctrl+Z) to recover
3. Verify template validation before loading
4. Use replace mode only with user confirmation

## Security Considerations

- **Sanitize template content** before loading
- **Validate HTML structure** to prevent XSS
- **Limit template size** to prevent performance issues
- **Restrict template sources** to trusted origins

## Performance Tips

- **Lazy load** large templates
- **Cache** frequently used templates
- **Minimize** template HTML size
- **Optimize** images in templates

## Future Enhancements

- Template versioning system
- Template marketplace integration
- Real-time template collaboration
- Template customization tools
- Advanced template validation

---

This template system ensures that your existing editor features remain fully functional while providing powerful template capabilities. Always prioritize user content preservation and provide clear feedback about template actions.