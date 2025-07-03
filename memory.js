const { google } = require('googleapis')

let sheets
let drive

async function initGoogle() {
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
  try {
    await drive.files.get({ fileId: spreadsheetId })
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:C',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[time, user, hector]] }
    })
  } catch (error) {
    console.error('Failed to append memory:', error)
  }
}

module.exports = { appendMemory }
