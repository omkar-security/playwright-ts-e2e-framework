import path from 'path';

/** File where the authenticated browser state (cookies + localStorage) is saved. */
export const STORAGE_STATE = path.join(__dirname, '../../.auth/standard_user.json');

/** An empty storage state – use it to run a test as a logged-out visitor. */
export const LOGGED_OUT = { cookies: [], origins: [] };

export const TAGS = {
  smoke: '@smoke',
  regression: '@regression',
  e2e: '@e2e',
  api: '@api',
  negative: '@negative',
} as const;
