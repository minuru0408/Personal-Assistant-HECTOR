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

async function listCalendars() {
  const calendar = await getCalendar();
  const res = await calendar.calendarList.list();
  const items = res.data.items || [];
  console.log('📖 Available calendars:');
  items.forEach((c) => {
    console.log(`- ${c.summary} (ID: ${c.id})`);
  });
  return items;
}

async function createEvent(summary, description, start, end, calendarId = 'primary', timeZone = 'UTC') {
  try {
    const calendar = await getCalendar();

    // Show calendars so the user can verify the ID being used
    await listCalendars();

    const event = {
      summary,
      description,
      start: {
        dateTime: start,
        timeZone,
      },
      end: {
        dateTime: end,
        timeZone,
      },
    };

    const res = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    console.log('✅ Event created:', res.data.htmlLink);
    return `Event "${summary}" scheduled from ${start} to ${end} in calendar ${calendarId}`;
  } catch (err) {
    console.error('❌ Failed to create calendar event:', err.message);
    throw err;
  }
}

module.exports = {
  getUpcomingEvents,
  listCalendars,
  createEvent
};

// Allow manual testing
if (require.main === module) {
  authorize()
    .then(() => console.log('✅ Calendar authorization complete.'))
    .catch((err) => console.error('❌ Authorization failed:', err));
}
