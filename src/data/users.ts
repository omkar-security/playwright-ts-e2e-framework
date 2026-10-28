/**
 * SauceDemo test users. All share the same password.
 * Each user simulates a different behaviour of the application.
 */
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const USERS = {
  standard: { username: process.env.STANDARD_USER ?? 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
  problem: { username: 'problem_user', password: PASSWORD },
  performanceGlitch: { username: 'performance_glitch_user', password: PASSWORD },
  error: { username: 'error_user', password: PASSWORD },
  visual: { username: 'visual_user', password: PASSWORD },
} as const;

export type User = { username: string; password: string };

export const LOGIN_ERRORS = {
  usernameRequired: 'Epic sadface: Username is required',
  passwordRequired: 'Epic sadface: Password is required',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
} as const;

/** Data-driven negative login scenarios */
export const INVALID_LOGIN_CASES = [
  { title: 'empty username and password', username: '', password: '', error: LOGIN_ERRORS.usernameRequired },
  { title: 'empty password', username: 'standard_user', password: '', error: LOGIN_ERRORS.passwordRequired },
  { title: 'empty username', username: '', password: PASSWORD, error: LOGIN_ERRORS.usernameRequired },
  { title: 'wrong password', username: 'standard_user', password: 'wrong_pass', error: LOGIN_ERRORS.invalidCredentials },
  { title: 'unknown user', username: 'ghost_user', password: PASSWORD, error: LOGIN_ERRORS.invalidCredentials },
  { title: 'case-sensitive username', username: 'STANDARD_USER', password: PASSWORD, error: LOGIN_ERRORS.invalidCredentials },
  { title: 'locked out user', username: 'locked_out_user', password: PASSWORD, error: LOGIN_ERRORS.lockedOut },
];
