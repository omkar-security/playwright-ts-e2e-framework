import { test, expect } from '../../src/fixtures/test-fixtures';
import { ApiClient } from '../../src/api/ApiClient';

const USERNAME = process.env.API_USERNAME ?? 'emilys';
const PASSWORD = process.env.API_PASSWORD ?? 'emilyspass';

/**
 * Authentication API.
 * Concepts: token-based auth, chained requests, negative auth tests, data-driven API tests.
 */
test.describe('Auth API', { tag: '@api' }, () => {
  test('TC-AUTH-01: valid login returns access and refresh tokens', { tag: '@smoke' }, async ({ api }) => {
    const body = await ApiClient.expectJson(await api.login(USERNAME, PASSWORD));

    expect(body.username).toBe(USERNAME);
    expect(body.accessToken).toEqual(expect.any(String));
    expect(body.refreshToken).toEqual(expect.any(String));
    // JWT format: header.payload.signature
    expect(body.accessToken.split('.')).toHaveLength(3);
  });

  test('TC-AUTH-02: token gives access to the current user profile', { tag: '@smoke' }, async ({ api }) => {
    await api.login(USERNAME, PASSWORD); // stores the token inside the client
    const me = await ApiClient.expectJson(await api.getCurrentUser());
    expect(me.username).toBe(USERNAME);
    expect(me.email).toContain('@');
  });

  test('TC-AUTH-03: profile endpoint rejects requests without a token', { tag: ['@regression', '@negative'] }, async ({
    api,
  }) => {
    const response = await api.getCurrentUser();
    expect(response.status()).toBe(401);
  });

  test('TC-AUTH-04: profile endpoint rejects an invalid token', { tag: ['@regression', '@negative'] }, async ({
    request,
  }) => {
    const response = await request.get('/auth/me', { headers: { Authorization: 'Bearer invalid.token.value' } });
    expect([401, 403, 500]).toContain(response.status());
    expect(response.ok()).toBeFalsy();
  });

  const invalidLogins = [
    { title: 'wrong password', username: USERNAME, password: 'wrong' },
    { title: 'unknown user', username: 'no_such_user_123', password: PASSWORD },
    { title: 'empty credentials', username: '', password: '' },
  ];

  for (const { title, username, password } of invalidLogins) {
    test(`TC-AUTH-05: login fails with ${title}`, { tag: ['@regression', '@negative'] }, async ({ api }) => {
      const response = await api.login(username, password);
      expect(response.status()).toBe(400);
      expect((await response.json()).message).toBeTruthy();
    });
  }
});
