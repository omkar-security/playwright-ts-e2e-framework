import { expect as baseExpect } from '@playwright/test';

/**
 * Custom matchers extend Playwright's `expect` with domain-specific assertions.
 * Docs: https://playwright.dev/docs/test-assertions#add-custom-matchers-using-expectextend
 */
export const expect = baseExpect.extend({
  toBeSorted(received: Array<string | number>, order: 'asc' | 'desc' = 'asc') {
    const sorted = [...received].sort((a, b) => {
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });
    if (order === 'desc') sorted.reverse();

    const pass = JSON.stringify(received) === JSON.stringify(sorted);
    return {
      pass,
      name: 'toBeSorted',
      message: () =>
        `expected list ${pass ? 'not ' : ''}to be sorted ${order}\n` +
        `Received: ${JSON.stringify(received)}\nExpected: ${JSON.stringify(sorted)}`,
    };
  },
});
