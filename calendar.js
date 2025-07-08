const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
const CREDENTIALS_PATH = path.join(__dirname, 'calendar-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'calendar-token.json');

let cachedClient = null;

async function authorize() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const redirectUri = redirect_uris[0] || 'http://localhost';

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
    prompt: 'consent'
  });

  console.log('\n🔗 Please open the following URL in your browser:\n');
  console.log(authUrl);

  console.log('\nOnce redirected, copy the full URL from the address bar (it will fail to load).');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const fullRedirectUrl = await new Promise(resolve =>
    rl.question('\n📥 Paste the full redirected URL here: ', input => {
      rl.close();
      resolve(input.trim());
    })
  );

  const urlObj = new URL(fullRedirectUrl);
  const code = urlObj.searchParams.get('code');

  if (!code) {
    throw new Error('❌ No authorization code found in URL. Try again.');
  }

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('✅ Calendar authorization complete.');
  cachedClient = oAuth2Client;
  return oAuth2Client;
}

module.exports = { authorize };
