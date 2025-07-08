const { google } = require('googleapis');
const { authorize, readTokenFromFile } = require('../auth');

let cachedClient = null;

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

async function createEvent(summary, description, start, end) {
  const auth = await readTokenFromFile();
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: summary,
    description: description,
    start: {
      dateTime: start,
      timeZone: 'Asia/Tokyo'
    },
    end: {
      dateTime: end,
      timeZone: 'Asia/Tokyo'
    }
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

module.exports = {
  getUpcomingEvents,
  createEvent
};

// Allow manual testing
if (require.main === module) {
  authorize()
    .then(() => console.log('✅ Calendar authorization complete.'))
    .catch((err) => console.error('❌ Authorization failed:', err));
}
