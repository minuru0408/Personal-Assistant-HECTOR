function toLocalISOString(date) {
  const tzOffset = -date.getTimezoneOffset();
  const sign = tzOffset >= 0 ? '+' : '-';
  const pad = (n) => String(Math.floor(Math.abs(n))).padStart(2, '0');
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds()) +
    sign +
    pad(tzOffset / 60) +
    ':' +
    pad(tzOffset % 60)
  );
}

function parseTimeToday(text) {
  if (!text) return null;

  const match = String(text)
    .trim()
    .match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] ? match[3].toLowerCase() : null;

  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;

  const now = new Date();
  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0
  );

  return toLocalISOString(date);
}

module.exports = { parseTimeToday, toLocalISOString };
