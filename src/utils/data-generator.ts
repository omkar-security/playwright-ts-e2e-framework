import { faker } from '@faker-js/faker';

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Generates random but realistic checkout data for every run. */
export function generateCustomer(overrides: Partial<CustomerInfo> = {}): CustomerInfo {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: faker.location.zipCode('#####'),
    ...overrides,
  };
}

/** Generates a random product payload for API tests. */
export function generateProductPayload() {
  return {
    title: `${faker.commerce.productAdjective()} ${faker.commerce.product()}`,
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 5, max: 500 })),
    category: faker.commerce.department().toLowerCase(),
  };
}
