const { getUpcomingEvents } = require('./utils/calendar');

getUpcomingEvents().then(events => {
  console.log('📆 Upcoming Events:\n');
  for (const e of events) {
    console.log(`${e.summary} - ${e.start}`);
  }
});
