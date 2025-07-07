const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const readline = require('readline');

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.send'
];
const CREDENTIALS_PATH = path.join(__dirname, 'gmail-credentials.json');
const TOKEN_PATH = path.join(__dirname, 'gmail-token.json');

function loadCredentials() {
  const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  return JSON.parse(content);
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
}

async function authorize() {
  const credentials = loadCredentials();
  const { client_secret, client_id, redirect_uris } = credentials.installed || credentials.web;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }
  const authUrl = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
  console.log('Please visit this URL to connect Gmail:\n', authUrl);
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise((resolve) => rl.question('Enter the code from that page here: ', (input) => {
    rl.close();
    resolve(input.trim());
  }));
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  saveToken(tokens);
  return oAuth2Client;
}

async function getGmail() {
  const auth = await authorize();
  return google.gmail({ version: 'v1', auth });
}

async function getRecentEmails(count) {
  const gmail = await getGmail();
  const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread', maxResults: count });
  const msgs = res.data.messages || [];
  const emails = [];
  for (const m of msgs) {
    const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['Subject', 'From'] });
    const headers = msg.data.payload.headers;
    const get = (name) => headers.find(h => h.name === name)?.value || '';
    emails.push({
      id: m.id,
      subject: get('Subject'),
      sender: get('From'),
      snippet: msg.data.snippet || ''
    });
  }
  return emails;
}

async function deleteEmailById(id) {
  const gmail = await getGmail();
  await gmail.users.messages.delete({ userId: 'me', id });
  return true;
}

async function sendEmail(to, subject, body) {
  const gmail = await getGmail();
  const raw = Buffer.from(`To: ${to}\r\nSubject: ${subject}\r\n\r\n${body}`)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return true;
}

async function analyzeInbox() {
  const gmail = await getGmail();
  const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread', maxResults: 100 });
  const msgs = res.data.messages || [];
  const senders = {};
  const labels = {};
  for (const m of msgs) {
    const msg = await gmail.users.messages.get({ userId: 'me', id: m.id, format: 'metadata', metadataHeaders: ['From'] });
    const from = msg.data.payload.headers.find(h => h.name === 'From')?.value || '';
    senders[from] = (senders[from] || 0) + 1;
    for (const label of msg.data.labelIds || []) {
      labels[label] = (labels[label] || 0) + 1;
    }
  }
  const topSenders = Object.entries(senders).sort((a,b) => b[1]-a[1]).slice(0,5);
  const topLabels = Object.entries(labels).sort((a,b) => b[1]-a[1]).slice(0,5);
  return { unreadCount: msgs.length, topSenders, topLabels };
}

module.exports = {
  getRecentEmails,
  deleteEmailById,
  sendEmail,
  analyzeInbox
};
