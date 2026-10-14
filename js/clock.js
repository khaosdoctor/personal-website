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

// Renders now, then again as each new minute starts. Aiming at the minute on every tick keeps it
// on time after the computer sleeps, where a 60s interval would stay off by the time asleep
function tick() {
  render(clock);
  setTimeout(tick, 60000 - (Date.now() % 60000));
}

const clock = document.querySelector('.intro-clock');
if (clock) tick();
