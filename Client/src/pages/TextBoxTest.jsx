// Simple test page to demonstrate Text Box functionality
// This can be accessed at /textbox-test

import React from 'react';

function TextBoxTest() {
    const handleOpenTextBox = () => {
        // Dispatch event to open text box popup
        const event = new CustomEvent('openTextBoxPopup');
        window.dispatchEvent(event);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Text Box Feature Test</h1>
            <p>Click the button below to open the Text Box gallery:</p>
            <button
                onClick={handleOpenTextBox}
                style={{
                    padding: '10px 20px',
                    background: '#FFD700',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                }}
            >
                Open Text Box Gallery
            </button>

            <div style={{ marginTop: '40px', border: '1px solid #ccc', padding: '20px', minHeight: '400px' }}>
                <h3>Test Area</h3>
                <p>Text boxes will appear here when inserted.</p>
            </div>
        </div>
    );
}

export default TextBoxTest;
