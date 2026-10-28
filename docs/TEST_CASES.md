# Test Cases

**Application under test:** SauceDemo (https://www.saucedemo.com) · DummyJSON API (https://dummyjson.com)
**Test password for all SauceDemo users:** `secret_sauce`

Priority: **P1** = critical (smoke) · **P2** = important (regression) · **P3** = nice to have
Test case IDs match the test titles in the code, e.g. `TC-LOGIN-01` → `tests/ui/login.spec.ts`.

---

## 1. Login — `tests/ui/login.spec.ts`

| ID | Title | Pre-conditions | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-LOGIN-01 | Valid login | Logged out | 1. Open login page 2. Enter `standard_user` / `secret_sauce` 3. Click Login | Redirected to Products page; 6 products shown | P1 |
| TC-LOGIN-02 | Login page UI | Logged out | Open login page | Logo "Swag Labs", username & password fields, password masked, Login enabled | P2 |
| TC-LOGIN-03 | Login with Enter key | Logged out | Fill valid credentials, press Enter | Products page opens | P2 |
| TC-LOGIN-04a | Empty username & password | Logged out | Click Login with empty fields | "Epic sadface: Username is required" | P2 |
| TC-LOGIN-04b | Empty password | Logged out | Username only, click Login | "Epic sadface: Password is required" | P2 |
| TC-LOGIN-04c | Empty username | Logged out | Password only, click Login | "Epic sadface: Username is required" | P2 |
| TC-LOGIN-04d | Wrong password | Logged out | Valid user + wrong password | "Username and password do not match..." | P2 |
| TC-LOGIN-04e | Unknown user | Logged out | Unknown username + valid password | "Username and password do not match..." | P2 |
| TC-LOGIN-04f | Case-sensitive username | Logged out | `STANDARD_USER` + valid password | "Username and password do not match..." | P3 |
| TC-LOGIN-04g | Locked-out user | Logged out | `locked_out_user` + valid password | "Sorry, this user has been locked out." | P1 |
| TC-LOGIN-05 | Dismiss error | Error is shown | Click the ✕ on the error | Error disappears | P3 |
| TC-LOGIN-06 | Protected page without login | Logged out | Open `/inventory.html` directly | Redirected to login with access error | P1 |
| TC-LOGIN-07 | Session cookie | Logged out | Log in, inspect cookies | `session-username` cookie = `standard_user` | P2 |

## 2. Product listing — `tests/ui/inventory.spec.ts`

| ID | Title | Pre-conditions | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-INV-01 | All products displayed | Logged in | Open Products page | 6 cards, each with name, description, `$x.xx` price, image, Add to cart | P1 |
| TC-INV-02 | Catalogue prices | Logged in | Read each product's price | Matches catalogue (e.g. Backpack $29.99) | P2 |
| TC-INV-03 | Default sort | Logged in | Open Products page | Sort = "Name (A to Z)", names ascending | P2 |
| TC-INV-04a–d | Sorting | Logged in | Select each sort option (A–Z, Z–A, price low→high, high→low) | List is ordered accordingly | P2 |
| TC-INV-05 | Add / remove toggle | Logged in | Add Backpack, then Remove | Button toggles; badge 1 → hidden | P1 |
| TC-INV-06 | Badge counter | Logged in | Add all 6 products one by one | Badge shows 1..6 | P2 |
| TC-INV-07 | Cart persists after reload | Logged in | Add 2 products, reload | Badge still 2; localStorage has 2 items | P2 |
| TC-INV-08 | Footer | Logged in | Inspect footer | Copyright text + Twitter/Facebook/LinkedIn links | P3 |

## 3. Product detail — `tests/ui/product-detail.spec.ts`

| ID | Title | Pre-conditions | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC-PDP-01 (×6) | Product details | Logged in | Click each product name | Correct name, price, description, image, Add to cart | P2 |
| TC-PDP-02 | Add/remove on detail page | Logged in | Open Fleece Jacket, Add, then Remove | Button toggles; badge updates | P1 |
| TC-PDP-03 | Back to products | On detail page | Click "Back to products" | Products page opens | P2 |
| TC-PDP-04 | Browser back/forward | On detail page | Browser Back, then Forward | Products page, then the same product again | P3 |
| TC-PDP-05 | State sync | Logged in | Add Onesie on detail page, go back | Onesie card shows "Remove" | P2 |

## 4. Cart — `tests/ui/cart.spec.ts`

Pre-condition for all: logged in, Backpack + Bolt T-Shirt + Onesie added, cart opened.

| ID | Title | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- |
| TC-CART-01 | Cart contents | Open cart | 3 items with correct names & prices | P1 |
| TC-CART-02 | Quantities | Open cart | Each quantity = 1 | P2 |
| TC-CART-03 | Remove one item | Remove Bolt T-Shirt | 2 items left; badge 2 | P2 |
| TC-CART-04 | Remove all | Remove all items | Cart empty; no badge | P2 |
| TC-CART-05 | Continue shopping | Click Continue Shopping | Products page; badge 3 | P2 |
| TC-CART-06 | Go to checkout | Click Checkout | "Checkout: Your Information" page | P1 |
| TC-CART-07 | Reset app state | Menu → Reset App State | Cart cleared | P2 |

## 5. Checkout — `tests/ui/checkout.spec.ts`

Pre-condition for all: logged in, Backpack ($29.99) + Bike Light ($9.99) in cart, on step one.

| ID | Title | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- |
| TC-CHK-01a | Missing first name | Leave first name empty, Continue | "Error: First Name is required" | P2 |
| TC-CHK-01b | Missing last name | Leave last name empty, Continue | "Error: Last Name is required" | P2 |
| TC-CHK-01c | Missing postal code | Leave postal code empty, Continue | "Error: Postal Code is required" | P2 |
| TC-CHK-02 | Valid info | Fill random valid data, Continue | Overview page lists both products | P1 |
| TC-CHK-03 | Price calculation | Reach overview | Item total $39.98, Tax $3.20 (8%), Total $43.18; SauceCard + Pony Express shown | P1 |
| TC-CHK-04 | Cancel at step one | Click Cancel | Back to cart, items kept | P2 |
| TC-CHK-05 | Cancel at overview | Click Cancel on overview | Products page, badge 2 | P2 |
| TC-CHK-06 | Complete order | Click Finish | "Thank you for your order!", cart emptied | P1 |
| TC-CHK-07 | Special characters | Enter `Zoë-Anne`, `O'Brien`, `SW1A 1AA` | Overview page opens | P3 |

## 6. End-to-end — `tests/ui/e2e-purchase.spec.ts`

| ID | Title | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- |
| TC-E2E-01 | Buy 2 cheapest products | Login → sort low→high → add first 2 → cart → checkout → finish → back home → logout | Correct totals, order confirmed, user logged out | P1 |
| TC-E2E-02 | Buy every product | Login → add all 6 → checkout → finish | Total $140.34 (129.94 + 10.40 tax), order confirmed | P1 |

## 7. Navigation — `tests/ui/navigation.spec.ts`

| ID | Title | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- |
| TC-NAV-01 | Menu options | Open burger menu | All Items, About, Logout, Reset App State | P2 |
| TC-NAV-02 | Close menu | Open then close menu | Menu hidden | P3 |
| TC-NAV-03 | Logout | Menu → Logout, then open `/inventory.html` | Login page; protected page blocked | P1 |
| TC-NAV-04 | All Items | From cart: Menu → All Items | Products page | P2 |
| TC-NAV-05 | About link | Open menu | About links to saucelabs.com | P3 |
| TC-NAV-06 | Cart icon | Click cart icon | Cart page | P1 |

## 8. Special users — `tests/ui/user-types.spec.ts`

| ID | Title | Steps | Expected result | Priority |
| --- | --- | --- | --- | --- |
| TC-USR-01 | problem_user images | Log in as problem_user | All product images identical (bug reproduced) | P2 |
| TC-USR-02 | problem_user last name (known bug) | Checkout, type last name | Field does not keep the value → marked `test.fail` | P2 |
| TC-USR-03 | performance_glitch_user | Log in, measure time | Login completes < 15s | P2 |
| TC-USR-04 | locked_out_user | Log in | Locked-out error, stays on login | P1 |
| TC-USR-05/06 | Serial flow | Open login page, then log in | Both pass in order | P3 |

## 9. API — `tests/api/*.api.spec.ts`

| ID | Endpoint | Scenario | Expected result | Priority |
| --- | --- | --- | --- | --- |
| TC-API-01 | `GET /products` | List products | 200, has `products`, `total`, `skip`, `limit` | P1 |
| TC-API-02 | `GET /products?limit=10` | Schema check | Every product has id, title, price>0, rating 0–5, etc. | P2 |
| TC-API-03 | `GET /products?limit&skip` | Pagination | 5 per page, page 2 continues after page 1 | P2 |
| TC-API-04 | `GET /products?select=title,price` | Field selection | Only id, title, price returned | P2 |
| TC-API-05 | `GET /products?sortBy=price&order=asc` | Sorting | Prices ascending | P2 |
| TC-API-06 | `GET /products/1` | Single product | 200, id = 1 | P1 |
| TC-API-07 | `GET /products/999999` | Not found | 404, message contains "not found" | P2 |
| TC-API-08 | `GET /products/search?q=phone` | Search | All results relate to "phone" | P2 |
| TC-API-09 | `GET /products/search?q=<nonsense>` | Empty search | `products: []`, `total: 0` | P2 |
| TC-API-10 | `GET /products/category/smartphones` | Category filter | All results are smartphones | P2 |
| TC-API-11 | `POST /products/add` | Create | 200/201, echoes payload with new id | P1 |
| TC-API-12 | `PUT /products/1` | Update | Title updated | P2 |
| TC-API-13 | `PATCH /products/2` | Partial update | Price updated | P2 |
| TC-API-14 | `DELETE /products/1` | Delete | `isDeleted: true`, `deletedOn` set | P2 |
| TC-API-15 | `GET /products/categories` | Performance | Response < 3s | P3 |
| TC-API-16 | `GET /products/1` | Polling | `expect.poll` reaches 200 | P3 |
| TC-AUTH-01 | `POST /auth/login` | Valid login | 200, JWT access + refresh tokens | P1 |
| TC-AUTH-02 | `GET /auth/me` | With token | 200, correct user | P1 |
| TC-AUTH-03 | `GET /auth/me` | No token | 401 | P2 |
| TC-AUTH-04 | `GET /auth/me` | Invalid token | Request rejected | P2 |
| TC-AUTH-05a–c | `POST /auth/login` | Wrong password / unknown user / empty | 400 with message | P2 |
| TC-CARTAPI-01 | `GET /carts/1` | Totals | quantity sum & line totals consistent; discounted ≤ total | P1 |
| TC-CARTAPI-02 | `GET /carts/user/33` | By user | All carts belong to user 33 | P2 |
| TC-CARTAPI-03 | `POST /carts/add` | Create cart | 2 products, quantity 3 | P2 |
| TC-CARTAPI-04 | `GET /carts/999999` | Not found | 404 | P2 |

## 10. Advanced — `tests/advanced/`

| ID | Title | Expected result |
| --- | --- | --- |
| TC-NET-01 | Block all images | Shop still usable, image requests aborted |
| TC-NET-02 | Monitor responses | No first-party 4xx/5xx responses |
| TC-NET-03 | Wait for response | Specific response captured |
| TC-NET-04 | Mock API (`route.fulfill`) | Front-end receives mocked JSON |
| TC-NET-05 | Modify real response | Title replaced in the response |
| TC-NET-06 | Simulate 500 error | Status 500 received |
| TC-NET-07 | Offline mode | Navigation fails while offline |
| TC-A11Y-01/02 | axe-core scan | No *new* WCAG A/AA violations vs. baseline |
| TC-A11Y-03 | Keyboard-only login | Tab order username → password → Login works |
| TC-A11Y-04 | ARIA snapshot | Form exposes Username, Password textboxes + Login button |
| TC-INT-01–03 | Alert / confirm / prompt | Dialogs handled, result text correct |
| TC-INT-04 | Nested iframes | Text read from inner frames |
| TC-INT-05 | File upload | "File Uploaded!" with file name |
| TC-INT-06 | File download | File saved to disk |
| TC-INT-07 | New tab | New window opened and verified |
| TC-INT-08 | Drag & drop | Columns swapped |
| TC-INT-09 | Hover | Hidden caption becomes visible |
| TC-INT-10 | Dynamic loading | "Hello World!" appears without hard waits |
| TC-INT-11 | Checkboxes & dropdown | States/values set correctly |
| TC-INT-12 | Key press | "You entered: ESCAPE" |
| TC-INT-13 | Two browser contexts | Sessions isolated |
| TC-VIS-01–03 | Visual regression | Screenshots match baseline |
