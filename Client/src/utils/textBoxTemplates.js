// Text Box Templates - MS Word Style
// Comprehensive template definitions for all built-in text box styles

export const textBoxTemplates = {
    // SIMPLE CATEGORY
    'simple-text-box': {
        id: 'simple-text-box',
        name: 'Simple Text Box',
        category: 'simple',
        type: 'box',
        preview: 'A clean, blank rectangular box',
        style: {
            border: { width: '1pt', color: '#000000', style: 'solid' },
            fill: 'none',
            shadow: 'none',
            width: '200px',
            height: 'auto',
            minHeight: '100px',
            padding: '10px',
            borderRadius: '0px'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'left',
            color: '#000000',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'text-box-fill': {
        id: 'text-box-fill',
        name: 'Text Box with Fill',
        category: 'simple',
        type: 'box',
        preview: 'Box with light background fill',
        style: {
            border: { width: '1pt', color: '#4472C4', style: 'solid' },
            fill: '#E7F0FF',
            shadow: 'none',
            width: '200px',
            height: 'auto',
            minHeight: '100px',
            padding: '12px',
            borderRadius: '0px'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'left',
            color: '#000000',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'text-box-shadow': {
        id: 'text-box-shadow',
        name: 'Shadowed Text Box',
        category: 'simple',
        type: 'box',
        preview: 'Box with drop shadow',
        style: {
            border: { width: '1pt', color: '#000000', style: 'solid' },
            fill: '#FFFFFF',
            shadow: '4px 4px 8px rgba(0,0,0,0.3)',
            width: '200px',
            height: 'auto',
            minHeight: '100px',
            padding: '12px',
            borderRadius: '2px'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'left',
            color: '#000000',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    // QUOTE STYLES
    'simple-quote': {
        id: 'simple-quote',
        name: 'Simple Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Minimalist quote box',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'none',
            shadow: 'none',
            width: '250px',
            height: 'auto',
            minHeight: '80px',
            padding: '15px',
            borderRadius: '0px',
            borderLeft: '4px solid #4472C4'
        },
        text: {
            font: 'Calibri',
            size: '12pt',
            alignment: 'left',
            color: '#333333',
            lineHeight: '1.6',
            fontStyle: 'italic'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'annual-quote': {
        id: 'annual-quote',
        name: 'Annual Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Quote with quotation marks',
        style: {
            border: { width: '2pt', color: '#70AD47', style: 'solid' },
            fill: '#F2F8F0',
            shadow: 'none',
            width: '220px',
            height: 'auto',
            minHeight: '100px',
            padding: '15px 20px',
            borderRadius: '4px'
        },
        text: {
            font: 'Georgia',
            size: '11pt',
            alignment: 'center',
            color: '#2F5233',
            lineHeight: '1.6',
            fontStyle: 'italic'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'austin-quote': {
        id: 'austin-quote',
        name: 'Austin Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Modern quote with thick left border',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'none',
            shadow: 'none',
            width: '240px',
            height: 'auto',
            minHeight: '90px',
            padding: '12px 15px',
            borderRadius: '0px',
            borderLeft: '6px solid #ED7D31'
        },
        text: {
            font: 'Calibri',
            size: '13pt',
            alignment: 'left',
            color: '#000000',
            lineHeight: '1.5',
            fontStyle: 'italic',
            fontWeight: 'bold'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'banded-quote': {
        id: 'banded-quote',
        name: 'Banded Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Quote with color band at top',
        style: {
            border: { width: '1pt', color: '#CCCCCC', style: 'solid' },
            fill: '#FFFFFF',
            shadow: 'none',
            width: '230px',
            height: 'auto',
            minHeight: '100px',
            padding: '40px 15px 15px 15px',
            borderRadius: '6px',
            borderTop: '20px solid #5B9BD5'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'left',
            color: '#000000',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'bold-quote': {
        id: 'bold-quote',
        name: 'Bold Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Strong attention-grabbing quote',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'none',
            shadow: 'none',
            width: '250px',
            height: 'auto',
            minHeight: '80px',
            padding: '10px 10px 10px 20px',
            borderRadius: '0px',
            borderLeft: '8px solid #C00000'
        },
        text: {
            font: 'Calibri',
            size: '14pt',
            alignment: 'left',
            color: '#C00000',
            lineHeight: '1.4',
            fontWeight: 'bold'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'contrast-quote': {
        id: 'contrast-quote',
        name: 'Contrast Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Black and white contrast design',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: '#000000',
            shadow: '2px 2px 6px rgba(0,0,0,0.4)',
            width: '220px',
            height: 'auto',
            minHeight: '90px',
            padding: '15px',
            borderRadius: '0px'
        },
        text: {
            font: 'Calibri',
            size: '12pt',
            alignment: 'center',
            color: '#FFFFFF',
            lineHeight: '1.6',
            fontStyle: 'italic'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    // SIDEBAR STYLES
    'alphabet-sidebar': {
        id: 'alphabet-sidebar',
        name: 'Alphabet Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Sidebar with decorative letter',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'linear-gradient(180deg, #F5E6D3 0%, #E8D4B8 100%)',
            shadow: 'none',
            width: '180px',
            height: 'auto',
            minHeight: '250px',
            padding: '20px 15px',
            borderRadius: '0px'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#333333',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        },
        decorative: {
            letter: 'A',
            letterSize: '72pt',
            letterColor: 'rgba(0,0,0,0.1)',
            letterPosition: 'background'
        }
    },

    'annual-sidebar': {
        id: 'annual-sidebar',
        name: 'Annual Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Professional sidebar with header',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: '#4472C4',
            shadow: 'none',
            width: '160px',
            height: 'auto',
            minHeight: '300px',
            padding: '15px',
            borderRadius: '0px'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#FFFFFF',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'austin-sidebar': {
        id: 'austin-sidebar',
        name: 'Austin Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Modern sidebar with shaded background',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: '#F2F2F2',
            shadow: 'none',
            width: '170px',
            height: 'auto',
            minHeight: '280px',
            padding: '20px 12px',
            borderRadius: '0px',
            borderTop: '4px solid #ED7D31'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#000000',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'branded-sidebar': {
        id: 'branded-sidebar',
        name: 'Branded Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Corporate-style sidebar',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: '#FFFFFF',
            shadow: '0px 2px 8px rgba(0,0,0,0.15)',
            width: '175px',
            height: 'auto',
            minHeight: '260px',
            padding: '0px',
            borderRadius: '4px',
            borderTop: '30px solid #5B9BD5'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#333333',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'conservative-sidebar': {
        id: 'conservative-sidebar',
        name: 'Conservative Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Simple minimal sidebar',
        style: {
            border: { width: '1pt', color: '#CCCCCC', style: 'solid' },
            fill: '#FAFAFA',
            shadow: 'none',
            width: '165px',
            height: 'auto',
            minHeight: '240px',
            padding: '15px',
            borderRadius: '0px'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#000000',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'facet-sidebar': {
        id: 'facet-sidebar',
        name: 'Facet Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Modern template sidebar',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            shadow: '0px 4px 12px rgba(0,0,0,0.2)',
            width: '170px',
            height: 'auto',
            minHeight: '270px',
            padding: '18px 14px',
            borderRadius: '6px'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#FFFFFF',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'ion-sidebar': {
        id: 'ion-sidebar',
        name: 'Ion Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Tech-style sidebar',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: '#2C3E50',
            shadow: 'none',
            width: '160px',
            height: 'auto',
            minHeight: '250px',
            padding: '15px',
            borderRadius: '0px',
            borderLeft: '5px solid #3498DB'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#ECF0F1',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'motion-sidebar': {
        id: 'motion-sidebar',
        name: 'Motion Sidebar',
        category: 'sidebars',
        type: 'sidebar',
        preview: 'Diagonal graphics sidebar',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'linear-gradient(45deg, #FF6B6B 0%, #FFE66D 100%)',
            shadow: '2px 2px 8px rgba(0,0,0,0.15)',
            width: '175px',
            height: 'auto',
            minHeight: '260px',
            padding: '16px',
            borderRadius: '4px'
        },
        text: {
            font: 'Calibri',
            size: '10pt',
            alignment: 'left',
            color: '#2C3E50',
            lineHeight: '1.5',
            fontWeight: 'bold'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    // MORE QUOTE STYLES
    'braces-quote': {
        id: 'braces-quote',
        name: 'Braces Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Quote with decorative braces',
        style: {
            border: { width: '2pt', color: '#70AD47', style: 'solid' },
            fill: '#F8FFF8',
            shadow: 'none',
            width: '240px',
            height: 'auto',
            minHeight: '90px',
            padding: '15px 20px',
            borderRadius: '8px'
        },
        text: {
            font: 'Georgia',
            size: '12pt',
            alignment: 'center',
            color: '#2F5233',
            lineHeight: '1.6',
            fontStyle: 'italic'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'cubicles-quote': {
        id: 'cubicles-quote',
        name: 'Cubicles Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Modern geometric quote',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: '#E8F4F8',
            shadow: 'none',
            width: '230px',
            height: 'auto',
            minHeight: '85px',
            padding: '12px 18px',
            borderRadius: '0px',
            borderLeft: '4px solid #5B9BD5',
            borderTop: '4px solid #5B9BD5'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'left',
            color: '#2C5F7C',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'decorative-quote': {
        id: 'decorative-quote',
        name: 'Decorative Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Ornamental quote style',
        style: {
            border: { width: '2pt', color: '#C55A11', style: 'double' },
            fill: '#FFF4E6',
            shadow: 'none',
            width: '235px',
            height: 'auto',
            minHeight: '95px',
            padding: '18px',
            borderRadius: '4px'
        },
        text: {
            font: 'Georgia',
            size: '11pt',
            alignment: 'center',
            color: '#8B4513',
            lineHeight: '1.6',
            fontStyle: 'italic'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'motion-quote': {
        id: 'motion-quote',
        name: 'Motion Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Dynamic motion quote',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            shadow: '3px 3px 10px rgba(0,0,0,0.3)',
            width: '225px',
            height: 'auto',
            minHeight: '88px',
            padding: '14px 16px',
            borderRadius: '6px'
        },
        text: {
            font: 'Calibri',
            size: '12pt',
            alignment: 'center',
            color: '#FFFFFF',
            lineHeight: '1.5',
            fontWeight: 'bold'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'perspective-quote': {
        id: 'perspective-quote',
        name: 'Perspective Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Quote with perspective shadow',
        style: {
            border: { width: '1pt', color: '#999999', style: 'solid' },
            fill: '#FFFFFF',
            shadow: '8px 8px 0px rgba(0,0,0,0.1)',
            width: '230px',
            height: 'auto',
            minHeight: '90px',
            padding: '15px',
            borderRadius: '2px'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'left',
            color: '#333333',
            lineHeight: '1.5',
            fontStyle: 'italic'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'sideline-quote': {
        id: 'sideline-quote',
        name: 'Sideline Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Narrow bar quote',
        style: {
            border: { width: '0px', color: 'none', style: 'none' },
            fill: 'none',
            shadow: 'none',
            width: '245px',
            height: 'auto',
            minHeight: '80px',
            padding: '10px 10px 10px 18px',
            borderRadius: '0px',
            borderLeft: '3px solid #E74C3C'
        },
        text: {
            font: 'Calibri',
            size: '12pt',
            alignment: 'left',
            color: '#2C3E50',
            lineHeight: '1.5',
            fontStyle: 'italic'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'stacks-quote': {
        id: 'stacks-quote',
        name: 'Stacks Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Layered stack quote',
        style: {
            border: { width: '2pt', color: '#9B59B6', style: 'solid' },
            fill: '#F4ECF7',
            shadow: '0px 4px 6px rgba(155, 89, 182, 0.3)',
            width: '228px',
            height: 'auto',
            minHeight: '92px',
            padding: '16px',
            borderRadius: '4px'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'center',
            color: '#6C3483',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    },

    'tiles-quote': {
        id: 'tiles-quote',
        name: 'Tiles Quote',
        category: 'quotes',
        type: 'quote',
        preview: 'Tiled pattern quote',
        style: {
            border: { width: '1pt', color: '#16A085', style: 'solid' },
            fill: '#E8F8F5',
            shadow: 'none',
            width: '232px',
            height: 'auto',
            minHeight: '87px',
            padding: '14px',
            borderRadius: '2px',
            borderTop: '6px solid #16A085'
        },
        text: {
            font: 'Calibri',
            size: '11pt',
            alignment: 'left',
            color: '#0E6655',
            lineHeight: '1.5'
        },
        position: {
            wrapping: 'square',
            zIndex: 1000
        }
    }
};

// Helper function to get templates by category
export function getTemplatesByCategory(category) {
    if (category === 'all') {
        return Object.values(textBoxTemplates);
    }
    return Object.values(textBoxTemplates).filter(t => t.category === category);
}

// Helper function to get template by ID
export function getTemplateById(id) {
    return textBoxTemplates[id];
}

// Categories for filtering
export const textBoxCategories = [
    { id: 'all', name: 'All', icon: 'ri-grid-line' },
    { id: 'simple', name: 'Simple', icon: 'ri-square-line' },
    { id: 'quotes', name: 'Quotes', icon: 'ri-double-quotes-l' },
    { id: 'sidebars', name: 'Sidebars', icon: 'ri-layout-left-line' }
];
