const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
require('dotenv').config();

async function initializeSheet() {
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
    const credentials = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS));
    await doc.useServiceAccountAuth(credentials);
    await doc.loadInfo();
    return doc.sheetsByIndex[0];
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
