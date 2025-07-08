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

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    cachedClient = oAuth2Client;
    return oAuth2Client;
  }

  const server = http.createServer(async (req, res) => {
    const urlParts = new URL(req.url, 'http://localhost');
    const code = urlParts.searchParams.get('code');
    if (code) {
      res.end('Authorization successful. You can close this window.');
      // Exchange code here...
    }
  }).listen(80);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Please visit this URL to authorize calendar access:\n', authUrl);
  return oAuth2Client;
}

module.exports = { authorize };
