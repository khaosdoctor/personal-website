import { existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';
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

  --watch              rebuild when a vault note or data file changes
  --debug              verbose per-file logging (same as DEBUG=sync:*)
  --vault=<name>       vault folder name to match (env VAULT_NAME, default "default")
  --vault-dir=<path>   notes directory, skips vault lookup (env VAULT_DIR)
  --vault-assets=<path>  attachments directory (env VAULT_ASSETS)
  --timeout=<ms>       per-request fetch timeout (env FETCH_TIMEOUT_MS, default 15000)
  --help               this text`);
  process.exit(0);
}

// Obsidian has no CLI, but it registers every vault here, so the path can move between machines
const OBSIDIAN_CONFIG = process.platform === 'darwin'
  ? join(process.env.HOME, 'Library/Application Support/obsidian/obsidian.json')
  : join(process.env.APPDATA || join(process.env.HOME, '.config'), 'obsidian/obsidian.json');
const VAULT_NAME = opt('vault', 'VAULT_NAME', 'default');

// First registered vault whose folder name contains VAULT_NAME
function findVault() {
  if (!existsSync(OBSIDIAN_CONFIG)) {
    debug.vault('no Obsidian config at %s', OBSIDIAN_CONFIG);
    return '';
  }
  try {
    const { vaults = {} } = JSON.parse(readFileSync(OBSIDIAN_CONFIG, 'utf-8'));
    const paths = Object.values(vaults).map(v => v.path).filter(Boolean);
    debug.vault('registered vaults: %o', paths);
    const match = paths.find(p => basename(p).toLowerCase().includes(VAULT_NAME.toLowerCase()));
    debug.vault('matched "%s" -> %s', VAULT_NAME, match || 'nothing');
    return match || '';
  } catch (err) {
    debug.vault('unreadable Obsidian config: %s', err.message);
    return '';
  }
}

const VAULT = findVault();
export const VAULT_DIR = opt('vault-dir', 'VAULT_DIR') || (VAULT && join(VAULT, 'notes'));
export const VAULT_ASSETS = opt('vault-assets', 'VAULT_ASSETS') || (VAULT && join(VAULT, 'internal/assets'));
if (!VAULT_DIR) log.warn(`no vault matching "${VAULT_NAME}" in ${OBSIDIAN_CONFIG}, using only data/vault`);
export const SITE = 'https://lsantos.dev';
export const RSS_URL ='https://blog.lsantos.dev/en/rss.xml';
export const GEAR_DIR = './gear';
export const BUILD_DIR = './builds';
export const GEAR_IMG = './img/gear';
export const DATA_DIR = './data';
export const VAULT_DATA = './data/vault';

// AbortSignal.timeout() rejects anything but a non-negative integer, so a bad value falls back to the default
const timeoutOpt = opt('timeout', 'FETCH_TIMEOUT_MS');
const timeout = Number(timeoutOpt);
const validTimeout = Number.isInteger(timeout) && timeout > 0;
if (timeoutOpt !== '' && !validTimeout) log.warn(`timeout "${timeoutOpt}" is not a positive whole number of ms, using 15000`);
export const FETCH_TIMEOUT_MS = validTimeout ? timeout : 15000;

export const fetchWithTimeout = url => fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
