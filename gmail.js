const { google } = require('googleapis');
const { authorize } = require('./auth');

let cachedClient = null;

async function getGmail() {
  if (!cachedClient) {
    cachedClient = await authorize();
  }
  return google.gmail({ version: 'v1', auth: cachedClient });
}

async function getRecentEmails(count) {
  const gmail = await getGmail();
  const res = await gmail.users.messages.list({ userId: 'me', labelIds: ['INBOX'], maxResults: count });
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

// Allow manual triggering from terminal for OAuth setup
if (require.main === module) {
  authorize()
    .then(() => console.log('✅ Gmail authorization complete.'))
    .catch((err) => console.error('❌ Authorization failed:', err));
}
