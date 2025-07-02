console.log("Dashboard renderer loaded");

// TODO: hook up interactivity

// TODO: Add event listeners for command input
document.querySelector('.command-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        // TODO: Handle command processing
        console.log('Command entered:', e.target.value)
    }
})
