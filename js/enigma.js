// A tiny three-rotor Enigma under the enigmajs row on /projects: rotors I-II-III, reflector B,
// no plugboard or ring settings. Ported from https://github.com/khaosdoctor/enigmajs
// (src/enigma/Rotor.ts, src/enigma/Reflector.ts and the stepping in src/App.vue)
const ROTORS = [
  { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 16 }, // I, left, notch at Q
  { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 4 }, // II, middle, notch at E
  { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 21 }, // III, right, notch at V
];
const REFLECTOR_B = 'YRUHQSLDPXNGOKMIEBFZCWVJAT';

const mod = n => ((n % 26) + 26) % 26;
const toIndex = letter => letter.charCodeAt(0) - 65;
const toLetter = i => String.fromCharCode(65 + i);

// Right to left uses the wiring, left to right (after the reflector) uses its inverse
function through(rotor, position, c, back) {
  const shifted = mod(c + position);
  const out = back ? rotor.wiring.indexOf(toLetter(shifted)) : toIndex(rotor.wiring[shifted]);
  return mod(out - position);
}

// Turns positions ([left, middle, right]) in place before each key press.
// A middle rotor at its notch turns itself and the left one: the double step
function step(positions) {
  const middleAtNotch = positions[1] === ROTORS[1].notch;
  const rightAtNotch = positions[2] === ROTORS[2].notch;
  if (middleAtNotch) positions[0] = mod(positions[0] + 1);
  if (middleAtNotch || rightAtNotch) positions[1] = mod(positions[1] + 1);
  positions[2] = mod(positions[2] + 1);
}

// Letters get encrypted, anything else passes through without turning the rotors
function encrypt(text, start) {
  const positions = [...start].map(toIndex);
  const out = [];
  for (const ch of text.toUpperCase()) {
    if (!/[A-Z]/.test(ch)) {
      out.push(ch);
      continue;
    }
    step(positions);
    let c = toIndex(ch);
    for (const i of [2, 1, 0]) c = through(ROTORS[i], positions[i], c, false);
    c = toIndex(REFLECTOR_B[c]);
    for (const i of [0, 1, 2]) c = through(ROTORS[i], positions[i], c, true);
    out.push(toLetter(c));
  }
  return out.join('');
}

function mount(row) {
  const widget = document.createElement('details');
  widget.className = 'enigma';
  // Static markup, no user input goes through innerHTML
  widget.innerHTML = `
    <summary>try it</summary>
    <p>Rotors I, II and III with reflector B. Type the output back in with the same start to decrypt.</p>
    <label>start <input class="enigma-start" value="AAA" maxlength="3" autocomplete="off" spellcheck="false"></label>
    <label>text <textarea class="enigma-in" rows="2" placeholder="type here" spellcheck="false"></textarea></label>
    <output class="enigma-out" aria-live="polite"></output>`;
  row.append(widget);

  const start = widget.querySelector('.enigma-start');
  const input = widget.querySelector('.enigma-in');
  const output = widget.querySelector('.enigma-out');
  const render = () => {
    const letters = (start.value.toUpperCase().replace(/[^A-Z]/g, '') + 'AAA').slice(0, 3);
    output.textContent = encrypt(input.value, letters);
  };
  start.addEventListener('input', render);
  input.addEventListener('input', render);
}

const row = document.querySelector('a[href="https://github.com/khaosdoctor/enigmajs"]')?.closest('li');
if (row) mount(row);
