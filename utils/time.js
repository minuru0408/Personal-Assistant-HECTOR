function parseTimeToday(text) {
  if (!text) return null;

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const match = String(text).trim().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] ? match[3].toLowerCase() : null;

  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return {
    start: {
      dateTime: startDate.toISOString(),
      timeZone
    },
    end: {
      dateTime: endDate.toISOString(),
      timeZone
    }
  };
}

module.exports = { parseTimeToday };
