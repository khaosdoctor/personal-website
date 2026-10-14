// Shared setup for every sync step: command line flags, logging, folder paths and the fetch timeout
import chalk from 'chalk';
import createDebug from 'debug';

const argv = process.argv.slice(2);
export const flag = name => argv.includes(`--${name}`);
// --name=value wins over the env var, so a one-off run needs no exported variable
export const opt = (name, env, fallback = '') =>
  argv.find(a => a.startsWith(`--${name}=`))?.slice(name.length + 3).trim() || process.env[env]?.trim() || fallback;

// --debug turns on every sync namespace; DEBUG=sync:covers still narrows it to one
if (flag('debug')) createDebug.enable(process.env.DEBUG || 'sync:*');
export const debug = {
  vault: createDebug('sync:vault'),
  covers: createDebug('sync:covers'),
  gear: createDebug('sync:gear'),
  bake: createDebug('sync:bake'),
};

// chalk already drops the escape codes on a non-TTY stream, on NO_COLOR and on TERM=dumb,
// so CI logs stay plain; the emoji prefixes are the fallback marker when the color is gone
export const log = {
  step: msg => console.log(chalk.bold.cyan(`\n▶ ${msg}`)),
  info: msg => console.log(chalk.dim(`  · ${msg}`)),
  ok: msg => console.log(chalk.green(`  ✔ ${msg}`)),
  warn: msg => console.warn(chalk.yellow(`  ⚠ ${msg}`)),
  error: msg => console.error(chalk.red(`  ✖ ${msg}`)),
};

if (flag('help')) {
  console.log(`Usage: bun sync.js [options]

  --watch              rebuild when a note or data file changes
  --debug              verbose per-file logging (same as DEBUG=sync:*)
  --prune-images       delete images in img/gear no note uses any more (only the CI bake passes it)
  --timeout=<ms>       per-request fetch timeout (env FETCH_TIMEOUT_MS, default 15000)
  --help               this text`);
  process.exit(0);
}

export const SITE = 'https://lsantos.dev';
export const RSS_URL = 'https://blog.lsantos.dev/en/rss.xml';
export const GEAR_DIR = './gear';
export const BUILD_DIR = './builds';
export const GEAR_IMG = './img/gear';
export const DATA_DIR = './data';
// The second-brain repo pushes only the public notes and their images here; the bake never reads the Obsidian vault
export const VAULT_DIR = './data/vault';
export const VAULT_ASSETS = './data/vault/assets';

// AbortSignal.timeout() rejects anything but a non-negative integer, so a bad value falls back to the default
const timeoutOpt = opt('timeout', 'FETCH_TIMEOUT_MS');
const timeout = Number(timeoutOpt);
const validTimeout = Number.isInteger(timeout) && timeout > 0;
if (timeoutOpt !== '' && !validTimeout) log.warn(`timeout "${timeoutOpt}" is not a positive whole number of ms, using 15000`);
export const FETCH_TIMEOUT_MS = validTimeout ? timeout : 15000;

export const fetchWithTimeout = url => fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
