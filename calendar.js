const fs = require('fs');
const path = require('path');
const http = require('http');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, 'calendar-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'calendar-token.json');

let cachedClient = null;

async function authorize() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Calendar credentials not found. Please place your OAuth client JSON at ' + CREDENTIALS_PATH);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Use cached token if available
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    cachedClient = oAuth2Client;
    return oAuth2Client;
  }

  // Create auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('🔑 Please visit this URL to authorize calendar access:\n', authUrl);

  // Start server to catch redirect with code
  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, 'http://localhost');
      const code = url.searchParams.get('code');

      if (code) {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('✅ Authorization complete. You may now return to Hector.');
        server.close(); // Close the server after receiving code
        resolve(code);
      } else {
        res.end('No authorization code found.');
        reject(new Error('No code received'));
      }
    }).listen(80);
  });

  // Exchange code for tokens
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
  console.log('✅ Calendar authorization complete.');

  cachedClient = oAuth2Client;
  return oAuth2Client;
}

module.exports = { authorize };
