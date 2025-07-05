const { appendMemory } = require('./memory');

// ...existing code...

// Add this where you handle messages/responses
async function handleMessage(message) {
    const timestamp = new Date().toISOString();

    // Your existing message handling code
    const response = await hector.respond(message);

    await appendMemory(timestamp, message, response);
    return response;
}

// ...existing code...