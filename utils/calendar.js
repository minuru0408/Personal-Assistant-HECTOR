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
    id: e.id,
    summary: e.summary || 'No Title',
    start: e.start?.dateTime || e.start?.date || '',
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

async function createEvent(
  summary,
  description,
  start,
  end,
  calendarId = 'primary',
  debug = false
) {
  try {
    const calendar = await getCalendar();

    // Show calendars so the user can verify the ID being used
    await listCalendars();

    const event = {
      summary,
      description,
      start,
      end,
    };

    if (debug) {
      console.log(
        '📤 Sending event payload to Google:',
        JSON.stringify(event, null, 2)
      );
    }

    const res = await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    const link = res && res.data && res.data.htmlLink;
    if (res.status === 200 && link) {
      console.log('✅ Event created:', link);
      return link;
    }

    const msg = res.statusText || 'Unknown error creating event';
    console.error('❌ Failed to create calendar event:', msg);
    return msg;
  } catch (err) {
    console.error('❌ Failed to create calendar event:', err.message);
    return err.message;
  }
}

async function deleteEvent(eventId, calendarId = 'primary') {
  try {
    const calendar = await getCalendar();
    await calendar.events.delete({ calendarId, eventId });
    console.log('✅ Event deleted:', eventId);
    return true;
  } catch (err) {
    console.error('❌ Failed to delete calendar event:', err.message);
    return false;
  }
}

async function findEvents({ title, time, maxResults = 10 } = {}) {
  const calendar = await getCalendar();
  const params = {
    calendarId: 'primary',
    singleEvents: true,
    orderBy: 'startTime',
    maxResults,
  };
  if (time) {
    const d = new Date(time);
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    params.timeMin = startOfDay.toISOString();
    params.timeMax = endOfDay.toISOString();
  } else {
    params.timeMin = new Date().toISOString();
  }
  if (title) {
    params.q = title;
  }
  const res = await calendar.events.list(params);
  return res.data.items || [];
}

module.exports = {
  getUpcomingEvents,
  listCalendars,
  createEvent,
  deleteEvent,
  findEvents
};

// Allow manual testing
if (require.main === module) {
  authorize()
    .then(() => console.log('✅ Calendar authorization complete.'))
    .catch((err) => console.error('❌ Authorization failed:', err));
}
