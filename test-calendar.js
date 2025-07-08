const { authorize } = require('./utils/calendar');
const { google } = require('googleapis');

async function createTestEvent() {
  const auth = await authorize();
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: '🧪 Hector Test Event',
    location: 'Tokyo International University',
    description: 'This is a test event created by Hector.',
    start: {
      dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
      timeZone: 'Asia/Tokyo',
    },
    end: {
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      timeZone: 'Asia/Tokyo',
    },
  };

  try {
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    console.log('✅ Event created:');
    console.log(`📅 ${res.data.summary} → ${res.data.start.dateTime}`);
  } catch (err) {
    console.error('❌ Failed to create event:', err.message);
  }
}

createTestEvent();
