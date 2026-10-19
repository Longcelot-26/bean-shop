


function fmt(n) {
  const v = Math.trunc(Number(n) || 0);
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

const TIME_FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
});


function fmtTime(ts, withTime) {
  const parts = {};
  TIME_FORMATTER.formatToParts(new Date((ts || 0) * 1000)).forEach((p) => { parts[p.type] = p.value; });
  const hour = parts.hour === '24' ? '00' : parts.hour;
  const date = `${parts.day}/${parts.month}/${parts.year}`;
  return withTime === false ? date : `${date} ${hour}:${parts.minute}`;
}

module.exports = { fmt, fmtTime };
