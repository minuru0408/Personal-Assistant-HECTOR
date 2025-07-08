const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, 'calendar-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'calendar-token.json');

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(`❌ Calendar credentials not found at ${CREDENTIALS_PATH}`);
  }
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  return JSON.parse(content);
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
}

let cachedClient = null;

async function authorize() {
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } =
    credentials.installed || credentials.web;
  const redirectUri = (redirect_uris && redirect_uris[0]) || 'urn:ietf:wg:oauth:2.0:oob';
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUri);

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    cachedClient = oAuth2Client;
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('🔗 Please visit this URL to authorize Calendar access:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) =>
    rl.question('📥 Enter the code from that page here: ', (input) => {
      rl.close();
      resolve(input.trim());
    })
  );

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  saveToken(tokens);
  cachedClient = oAuth2Client;
  console.log('✅ Calendar authorization complete');
  return oAuth2Client;
}

async function getCalendar() {
  if (!cachedClient) {
    cachedClient = await authorize();
  }
  return google.calendar({ version: 'v3', auth: cachedClient });
}

async function getUpcomingEvents(count = 3) {
  const calendar = await getCalendar();
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: count,
    singleEvents: true,
    orderBy: 'startTime',
  });

  const events = res.data.items || [];
  return events.map((e) => ({
    summary: e.summary || 'No Title',
    start: e.start?.dateTime || e.start?.date || 'No Start Time',
    description: e.description || '',
  }));
}

module.exports = {
  getUpcomingEvents
};

// Allow manual testing
if (require.main === module) {
  authorize()
    .then(() => console.log('✅ Calendar authorization complete.'))
    .catch((err) => console.error('❌ Authorization failed:', err));
}
