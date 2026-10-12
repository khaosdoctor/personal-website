// Stockholm time and how likely I am to be awake, refreshed every minute
// Each row covers the hours before `until`, checked in order
const ODDS = [
  { until: 5, label: 'high' },
  { until: 10, label: 'very low' },
  { until: 12, label: 'medium' },
  { until: 20, label: 'likely' },
  { until: 24, label: 'high' },
];

const format = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Stockholm',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function oddsFor(hour) {
  return ODDS.find(row => hour < row.until).label;
}

function render(el) {
  const time = format.format(new Date());
  const hour = Number(time.slice(0, 2));
  // innerHTML is safe here: the time is digits and the label comes from ODDS
  el.innerHTML = `It is <em>${time}</em> in <em>Stockholm</em>. Odds I'm awake: <strong class="clock-odds">${oddsFor(hour)}</strong>.`;
}

const clock = document.querySelector('.intro-clock');
if (clock) {
  render(clock);
  // Wait for the next minute to start, then tick every 60s
  setTimeout(() => {
    render(clock);
    setInterval(() => render(clock), 60000);
  }, 60000 - (Date.now() % 60000));
}
