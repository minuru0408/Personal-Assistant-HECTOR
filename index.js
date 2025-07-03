const { logConversation } = require('./sheets');

// ...existing code...

// Add this where you handle messages/responses
async function handleMessage(message) {
    const timestamp = new Date().toISOString();
    await logConversation(timestamp, 'User', message);
    
    // Your existing message handling code
    const response = await hector.respond(message);
    
    await logConversation(timestamp, 'Hector', response);
    return response;
}

// ...existing code...