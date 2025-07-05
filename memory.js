const { google } = require('googleapis')

let sheets
let drive

async function initGoogle() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS is not set')
    return
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file'
    ]
  })
  const authClient = await auth.getClient()
  sheets = google.sheets({ version: 'v4', auth: authClient })
  drive = google.drive({ version: 'v3', auth: authClient })
}

async function appendMemory(time, user, hector) {
  if (!sheets || !drive) {
    await initGoogle()
  }
  const spreadsheetId = process.env.SPREADSHEET_ID
  if (!spreadsheetId) {
    console.error('SPREADSHEET_ID is not set')
    return
  }
  try {
    await drive.files.get({ fileId: spreadsheetId })
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'HECTOR_Memory_Log!A:C', // Updated to match your sheet name
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[time, user, hector]] }
    })
  } catch (error) {
    console.error('Failed to append memory:', error.message) // Added .message for better error details
    throw error; // Added to propagate error
  }
}

module.exports = { appendMemory }
