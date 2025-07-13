function formatLocalISO(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseTimeToday(input) {
  if (input === undefined || input === null) return null;

  if (typeof input === 'number') {
    const now = new Date();
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), input, 0, 0);
    return formatLocalISO(dt);
  }

  if (input instanceof Date) {
    return formatLocalISO(input);
  }

  const str = String(input).trim();
  const m = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (m) {
    let hour = parseInt(m[1], 10);
    const minute = m[2] ? parseInt(m[2], 10) : 0;
    const period = m[3] ? m[3].toLowerCase() : '';
    if (period === 'pm' && hour < 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    const now = new Date();
    const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
    return formatLocalISO(dt);
  }

  const parsed = new Date(str);
  if (!isNaN(parsed)) {
    return formatLocalISO(parsed);
  }
  return null;
}

module.exports = { parseTimeToday };
