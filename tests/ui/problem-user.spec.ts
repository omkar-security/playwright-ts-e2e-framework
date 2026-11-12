import { test, expect } from '../../src/fixtures/test-fixtures';
import { PROBLEM_USER_STATE, STORAGE_STATE } from '../../src/utils/constants';

// Swap the wristband for every test in this file
test.use({ storageState: PROBLEM_USER_STATE });

test('TC-USR-07: problem_user session is reused from storageState', { tag: '@regression' }, async ({
  inventoryPage,
  context,
}) => {
  // No login step! We go straight to the shop.
  await inventoryPage.goto();
  await inventoryPage.expectToBeOpen();

  // Prove WHO we are by reading the cookie 
  const cookies = await context.cookies();
  const session = cookies.find((c) => c.name === 'session-username');
  expect(session?.value).toBe('problem_user');
});