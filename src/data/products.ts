/** Product catalogue as displayed on SauceDemo (used as expected test data). */
export interface Product {
  name: string;
  price: number;
  slug: string; // used in data-test ids, e.g. add-to-cart-sauce-labs-backpack
}

export const PRODUCTS = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99, slug: 'sauce-labs-backpack' },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99, slug: 'sauce-labs-bike-light' },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: 15.99, slug: 'sauce-labs-bolt-t-shirt' },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: 49.99, slug: 'sauce-labs-fleece-jacket' },
  onesie: { name: 'Sauce Labs Onesie', price: 7.99, slug: 'sauce-labs-onesie' },
  redTShirt: {
    name: 'Test.allTheThings() T-Shirt (Red)',
    price: 15.99,
    slug: 'test.allthethings()-t-shirt-(red)',
  },
} satisfies Record<string, Product>;

export const ALL_PRODUCTS: Product[] = Object.values(PRODUCTS);

export const TAX_RATE = 0.08;

export const SORT_OPTIONS = {
  nameAsc: 'az',
  nameDesc: 'za',
  priceAsc: 'lohi',
  priceDesc: 'hilo',
} as const;

export type SortOption = (typeof SORT_OPTIONS)[keyof typeof SORT_OPTIONS];
