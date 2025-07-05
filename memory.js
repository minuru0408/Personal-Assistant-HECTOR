const { google } = require('googleapis')

let sheets
const SHEET_NAME = 'Logs'

async function initGoogle() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('GOOGLE_APPLICATION_CREDENTIALS is not set')
    return
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets'
    ]
  })
  const authClient = await auth.getClient()
  sheets = google.sheets({ version: 'v4', auth: authClient })
}

async function appendMemory(time, user, hector) {
  if (!sheets) {
    await initGoogle()
  }
  const spreadsheetId = process.env.SPREADSHEET_ID
  if (!spreadsheetId) {
    console.error('SPREADSHEET_ID is not set')
    return
  }
  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${SHEET_NAME}!A:C`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[time, user, hector]]
      }
    })
  } catch (error) {
    console.error('Failed to append memory:', error.message)
    throw error
  }
}

module.exports = { appendMemory }
