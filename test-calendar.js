const { getUpcomingEvents } = require('./utils/calendar');

(async () => {
  const events = await getUpcomingEvents(5);
  console.log('📅 Upcoming events:');
  for (const e of events) {
    console.log(`• ${e.summary} at ${e.start}`);
  }
})();
