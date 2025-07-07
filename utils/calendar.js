const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS_PATH = path.join(__dirname, 'calendar-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'calendar-token.json');

function loadCredentials() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    throw new Error(
      `Calendar credentials not found. Please place your OAuth client JSON at ${CREDENTIALS_PATH}.`
    );
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
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirectUri
  );

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
  console.log('Please visit this URL to connect Google Calendar:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code = await new Promise((resolve) =>
    rl.question('Enter the code from that page here: ', (input) => {
      rl.close();
      resolve(input.trim());
    })
  );

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  saveToken(tokens);
  cachedClient = oAuth2Client;
  return oAuth2Client;
}

async function getCalendar() {
  if (!cachedClient) {
    cachedClient = await authorize();
  }
  return google.calendar({ version: 'v3', auth: cachedClient });
}

async function getUpcomingEvents(count) {
  const calendar = await getCalendar();
  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: count,
    singleEvents: true,
    orderBy: 'startTime',
  });
  const events = res.data.items || [];
  return events.map((ev) => ({
    id: ev.id,
    summary: ev.summary || '',
    start: ev.start.dateTime || ev.start.date,
    end: ev.end.dateTime || ev.end.date,
    description: ev.description || '',
    location: ev.location || '',
  }));
}

async function createEvent({ summary, start, end, description, location }) {
  const calendar = await getCalendar();
  const event = {
    summary,
    start: { dateTime: start },
    end: { dateTime: end },
    description,
    location,
  };
  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event,
  });
  return res.data;
}

module.exports = {
  getUpcomingEvents,
  createEvent,
};

if (require.main === module) {
  authorize()
    .then(() => console.log('✅ Calendar authorization complete.'))
    .catch((err) => console.error('❌ Authorization failed:', err));
}
