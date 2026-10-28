# 🛒 Playwright E-Commerce Test Automation Framework

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?logo=githubactions&logoColor=white)

An end-to-end test automation framework built with **Playwright + TypeScript**. It tests a complete
online-shopping flow (login → browse → cart → checkout) on the e-commerce demo site
[SauceDemo](https://www.saucedemo.com), and the REST API of [DummyJSON](https://dummyjson.com).

**118 test cases** · 3 browsers + mobile · UI + API + accessibility + visual + network tests

---

## 📚 Concepts covered

| Concept | Where to find it |
| --- | --- |
| **Page Object Model** (with base class + reusable component) | `src/pages/`, `src/pages/components/HeaderComponent.ts` |
| **Custom fixtures** (`test.extend`, setup + teardown) | `src/fixtures/test-fixtures.ts` |
| **Authentication reuse** (`storageState` + setup project) | `tests/setup/auth.setup.ts`, `playwright.config.ts` |
| **Projects & dependencies** (Chromium, Firefox, WebKit, mobile, API) | `playwright.config.ts` |
| **Locator strategies** (`getByRole`, `getByTestId`, CSS, `filter`, chaining) | all page objects |
| **Web-first assertions** & auto-waiting | every spec |
| **Soft assertions** (`expect.soft`) | `tests/ui/product-detail.spec.ts` |
| **Custom matchers** (`expect.extend` → `toBeSorted`) | `src/utils/custom-matchers.ts` |
| **Data-driven / parameterised tests** | `login.spec.ts`, `inventory.spec.ts`, `checkout.spec.ts` |
| **Test data generation** (Faker) | `src/utils/data-generator.ts` |
| **Tags & filtering** (`@smoke`, `@regression`, `@negative`...) | every spec, `package.json` scripts |
| **Hooks** (`beforeEach`), **`test.step`**, **attachments**, **annotations** | `tests/ui/e2e-purchase.spec.ts` |
| **`test.fail`, `test.slow`, `test.skip`, serial mode** | `tests/ui/user-types.spec.ts` |
| **API testing** (GET/POST/PUT/PATCH/DELETE, auth tokens, schemas) | `tests/api/`, `src/api/ApiClient.ts` |
| **`expect.poll`** | `tests/api/products.api.spec.ts` |
| **Network interception / mocking** (`route.abort`, `fulfill`, `fetch`) | `tests/advanced/network.spec.ts` |
| **Accessibility testing** (axe-core, keyboard, ARIA snapshots) | `tests/advanced/accessibility.spec.ts` |
| **Dialogs, iframes, upload, download, new tabs, drag & drop, hover** | `tests/advanced/browser-interactions.spec.ts` |
| **Multiple browser contexts** (two users at once) | `browser-interactions.spec.ts` |
| **Visual regression** (`toHaveScreenshot`, masking) | `tests/visual/visual.spec.ts` |
| **Cookies & localStorage** | `login.spec.ts`, `inventory.spec.ts` |
| **Reporters** (HTML, JUnit, list), traces, screenshots, videos | `playwright.config.ts` |
| **Environment config** (`.env` + dotenv) | `.env.example` |
| **CI/CD** (GitHub Actions, browser matrix, sharding, artifacts, nightly run) | `.github/workflows/playwright.yml` |

---

## 🗂️ Project structure

```
playwright-ecommerce-framework/
├── .github/workflows/playwright.yml   # CI pipeline
├── docs/TEST_CASES.md                 # Written test cases (IDs match the spec titles)
├── src/
│   ├── api/ApiClient.ts               # API service object
│   ├── data/                          # Static test data (users, products)
│   ├── fixtures/test-fixtures.ts      # Custom fixtures (page objects injected into tests)
│   ├── pages/                         # Page Object Model
│   │   ├── components/HeaderComponent.ts
│   │   ├── BasePage.ts
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailPage.ts
│   │   ├── CartPage.ts
│   │   └── CheckoutPage.ts
│   └── utils/                         # Helpers, custom matchers, constants, faker data
├── tests/
│   ├── setup/auth.setup.ts            # Logs in once and saves session
│   ├── ui/                            # UI tests (run on 3 browsers + mobile smoke)
│   ├── api/                           # REST API tests
│   ├── advanced/                      # Network, a11y, browser interactions
│   └── visual/                        # Screenshot comparison tests
├── test-data/upload-sample.txt
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Getting started

**Prerequisites:** [Node.js](https://nodejs.org) 18+ (20 or 22 recommended) and Git.

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npx playwright install

# 3. (Optional) create your env file
cp .env.example .env

# 4. Run everything
npm test

# 5. Open the HTML report
npm run report
```

### Useful commands

| Command | What it does |
| --- | --- |
| `npm test` | Run all projects |
| `npm run test:chromium` | UI tests in Chromium only |
| `npm run test:ui` | UI tests in Chromium, Firefox, WebKit |
| `npm run test:api` | API tests only |
| `npm run test:advanced` | Network / a11y / interaction tests |
| `npm run test:mobile` | Smoke tests on an emulated Pixel 7 |
| `npm run test:smoke` | Only tests tagged `@smoke` |
| `npm run test:regression` | Only tests tagged `@regression` |
| `npm run test:headed` | Watch the browser while tests run |
| `npm run test:interactive` | Playwright UI mode (time-travel debugging) |
| `npm run test:debug` | Step through with the Playwright Inspector |
| `npm run test:visual:update` | Create / update visual baselines |
| `npm run codegen` | Record a new test by clicking around |
| `npm run typecheck` | TypeScript type check |

Run a single file or test:

```bash
npx playwright test tests/ui/checkout.spec.ts --project=chromium
npx playwright test -g "TC-CHK-03"
```

> **Visual tests:** the first run has no baseline, so run `npm run test:visual:update` once.
> Screenshots differ between Windows/macOS/Linux, so generate baselines on the same OS that runs them.

---

## 🧪 Test coverage summary

| Area | File | Tests |
| --- | --- | --- |
| Login | `tests/ui/login.spec.ts` | 13 |
| Inventory | `tests/ui/inventory.spec.ts` | 11 |
| Product detail | `tests/ui/product-detail.spec.ts` | 10 |
| Cart | `tests/ui/cart.spec.ts` | 7 |
| Checkout | `tests/ui/checkout.spec.ts` | 9 |
| End-to-end journeys | `tests/ui/e2e-purchase.spec.ts` | 2 |
| Navigation | `tests/ui/navigation.spec.ts` | 6 |
| Special users | `tests/ui/user-types.spec.ts` | 6 |
| Products API | `tests/api/products.api.spec.ts` | 16 |
| Auth API | `tests/api/auth.api.spec.ts` | 7 |
| Carts API | `tests/api/carts.api.spec.ts` | 4 |
| Network | `tests/advanced/network.spec.ts` | 7 |
| Accessibility | `tests/advanced/accessibility.spec.ts` | 4 |
| Browser interactions | `tests/advanced/browser-interactions.spec.ts` | 13 |
| Visual | `tests/visual/visual.spec.ts` | 3 |

Full written test cases (steps + expected results): **[docs/TEST_CASES.md](docs/TEST_CASES.md)**

---

## ⚙️ CI/CD

The GitHub Actions workflow runs on every push / pull request to `main`, nightly on weekdays, and
manually (with an optional tag filter). It runs:

- **API tests** (no browser needed)
- **UI tests** on Chromium, Firefox and WebKit, each split into 2 shards (6 parallel jobs)
- **Advanced + mobile tests**

HTML reports are uploaded as artifacts — open a workflow run → *Artifacts* → download → open `index.html`.

---

## 📤 Publishing this project to GitHub

```bash
# inside the project folder (after `npm install`, so package-lock.json exists)
git init
git add .
git commit -m "Playwright e-commerce test automation framework"
git branch -M main
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/playwright-ecommerce-framework.git
git push -u origin main
```

The workflow starts automatically — check the **Actions** tab.

---

## 🧭 Design decisions

- **Page objects never contain assertions about business rules** — only reusable `expectToBeOpen()` checks.
  Tests own the assertions, so failures are easy to read.
- **Fixtures instead of `new Page()` in every test** — tests declare what they need and stay short.
- **Login once, reuse the session** — the `setup` project saves `storageState`, saving ~1–2s per test.
- **No hard waits** — only web-first assertions (`toBeVisible`, `toHaveText`...) that auto-retry.
- **Stable locators** — role-based and `data-test` attributes first, CSS classes as fallback.
- **Known bugs documented with `test.fail`** — the suite stays green but alerts when the bug is fixed.
