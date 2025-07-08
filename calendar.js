const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, 'calendar-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'calendar-token.json');

let cachedClient = null;

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error('Calendar credentials not found. Please place your OAuth client JSON at ' + CREDENTIALS_PATH);
  }
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  return JSON.parse(content);
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
  console.log('✅ Token saved to:', TOKEN_PATH);
}

async function authorize() {
  const credentials = loadCredentials();
  const { client_secret, client_id } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, 
    client_secret,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    cachedClient = oAuth2Client;
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Please visit this URL to authorize calendar access:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const code = await new Promise((resolve) =>
    rl.question('Enter the code from that page here: ', (input) => {
      rl.close();
      resolve(input.trim());
    })
  );

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    saveToken(tokens);
    cachedClient = oAuth2Client;
    return oAuth2Client;
  } catch (err) {
    console.error('Failed to retrieve access token:', err);
    throw err;
  }
}

// Allow manual triggering from terminal for OAuth setup
if (require.main === module) {
  authorize()
    .then(() => console.log('✅ Calendar authorization complete.'))
    .catch((err) => console.error('❌ Authorization failed:', err));
}

module.exports = { authorize };
