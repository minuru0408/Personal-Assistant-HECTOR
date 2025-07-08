const { google } = require('googleapis');
const { authorize } = require('../auth');

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
  try {
    const calendar = await getCalendar();
    const timeZone = 'Asia/Tokyo';
    const event = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone
      },
      end: {
        dateTime: end,
        timeZone
      }
    };

    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event
    });

    console.log('✅ Event created:', res.data.htmlLink);
    return `Event "${summary}" scheduled from ${start} to ${end}`;
  } catch (err) {
    console.error('❌ Failed to create calendar event:', err.message);
    throw err;
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
