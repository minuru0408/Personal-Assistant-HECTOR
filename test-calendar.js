const { createEvent, getUpcomingEvents } = require('./utils/calendar');

async function testCalendar() {
  try {
    // 🗓️ Create an event (adjust time to now +1hr for real-time testing)
    const now = new Date();
    const start = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

    const summary = '🚀 AI Assistant Planning Session';
    const description = 'Discuss updates to Hector and GPT integrations';

    const result = await createEvent(
      summary,
      description,
      start.toISOString(),
      end.toISOString()
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
