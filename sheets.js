const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeSheet() {
    try {
        const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
        
        // Use absolute path resolution
        const credentialsPath = path.resolve(__dirname, process.env.GOOGLE_APPLICATION_CREDENTIALS);
        
        console.log('Looking for credentials at:', credentialsPath);
        
        if (!fs.existsSync(credentialsPath)) {
            throw new Error(`Credentials file not found at: ${credentialsPath}`);
        }
        
        const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
        
        if (!credentials.client_email || !credentials.private_key) {
            throw new Error('Invalid credentials format: missing client_email or private_key');
        }
        
        await doc.useServiceAccountAuth(credentials);
        await doc.loadInfo();
        return doc.sheetsByIndex[0];
    } catch (error) {
        console.error('Sheet initialization error:', error.message);
        if (error.code === 'ENOENT') {
            console.error('Please ensure client_secret.json is in the project root directory');
        }
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
