const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeSheet() {
    try {
        const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
        
        // Read credentials from client_secret.json in the project directory
        const credentialsPath = path.join(__dirname, 'client_secret.json');
        if (!fs.existsSync(credentialsPath)) {
            throw new Error(`Credentials file not found at: ${credentialsPath}`);
        }
        
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
        
        // Verify required fields
        if (!credentials.private_key || !credentials.client_email) {
            throw new Error('Invalid credentials file: missing private_key or client_email');
        }
        
        await doc.useServiceAccountAuth(credentials);
        await doc.loadInfo();
        return doc.sheetsByIndex[0];
    } catch (error) {
        console.error('Sheet initialization error:', error.message);
        throw error;
    }
}

async function logConversation(time, user, message) {
    try {
        const sheet = await initializeSheet();
        await sheet.addRow({
            Time: time,
            User: user,
            Message: message
        });
    } catch (error) {
        console.error('Error logging to sheet:', error);
    }
}

module.exports = { logConversation };
