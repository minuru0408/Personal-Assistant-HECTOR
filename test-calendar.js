const { createEvent, getUpcomingEvents, listCalendars } = require('./utils/calendar');

async function testCalendar() {
  try {
    // Display calendars and pick one ID if needed
    await listCalendars();

    // 🗓️ Create an event (adjust time to now +1hr for real-time testing)
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    const summary = '🚀 AI Assistant Planning Session';
    const description = 'Discuss updates to Hector and GPT integrations';

    const result = await createEvent(
      summary,
      description,
      { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      'primary'
    );

    console.log('✅ Event Created:', result);

    // 📅 Optionally fetch upcoming events
    const events = await getUpcomingEvents(3);
    console.log('\n📅 Upcoming events:');
    for (const e of events) {
      console.log(`- ${e.summary} (${e.start})`);
    }

  } catch (err) {
    console.error('❌ Test failed:', err);
  }
}

testCalendar();

(async () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 0);

  try {
    const msg = await createEvent(
      'Test: Shopping Trip',
      'Auto-created event by Hector',
      { dateTime: start.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      { dateTime: end.toISOString(), timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone },
      'primary'
    );
    console.log(msg);
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
})();
