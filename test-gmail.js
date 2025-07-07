// test-gmail.js
const { getRecentEmails } = require('./gmail');

(async () => {
  try {
    const emails = await getRecentEmails(3);
    console.log('\n📬 Recent Emails:\n');
    for (const mail of emails) {
      console.log(`Subject: ${mail.subject}`);
      console.log(`From: ${mail.sender}`);
      console.log(`Snippet: ${mail.snippet}`);
      console.log('-----------------------------');
    }
  } catch (err) {
    console.error('❌ Failed to fetch emails:', err);
  }
})();
