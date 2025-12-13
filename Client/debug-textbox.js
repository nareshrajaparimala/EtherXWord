// DEBUGGING: Test if Text Box popup is working
// Add this to your browser console to test:

// 1. Check if the popup state exists
console.log('showTextBoxPopup state:', document.querySelector('[data-testid="textbox-popup"]'));

// 2. Manually open the popup
// Find the component and set state (if you can access React DevTools)

// 3. Check for event listeners on overlay
const overlay = document.querySelector('.popup-overlay');
if (overlay) {
    console.log('Overlay found:', overlay);
    console.log('Overlay style:', overlay.style.pointerEvents);
    console.log('Overlay onclick:', overlay.onclick);
}

// 4. Check for event listeners on document
console.log('Document click listeners:', getEventListeners(document));

// 5. Test pointer events
const dialog = document.querySelector('.popup-dialog');
if (dialog) {
    console.log('Dialog found:', dialog);
    console.log('Dialog style:', dialog.style.pointerEvents);
}
