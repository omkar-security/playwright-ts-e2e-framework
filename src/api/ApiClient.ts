import { type APIRequestContext, type APIResponse, expect } from '@playwright/test';

/**
 * Thin service-object wrapper around Playwright's APIRequestContext
 * for the DummyJSON e-commerce API (https://dummyjson.com/docs).
 */
export class ApiClient {
  private token?: string;

  constructor(private readonly request: APIRequestContext) {}

  private get authHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  /* ---------- Auth ---------- */
  async login(username: string, password: string): Promise<APIResponse> {
    const response = await this.request.post('/auth/login', {
      data: { username, password, expiresInMins: 30 },
    });
    if (response.ok()) {
      const body = await response.json();
      this.token = body.accessToken;
    }
    return response;
  }

  async getCurrentUser(): Promise<APIResponse> {
    return this.request.get('/auth/me', { headers: this.authHeaders });
  }

  /* ---------- Products ---------- */
  async getProducts(params: { limit?: number; skip?: number; select?: string; sortBy?: string; order?: 'asc' | 'desc' } = {}) {
    return this.request.get('/products', { params });
  }

  async getProduct(id: number) {
    return this.request.get(`/products/${id}`);
  }

  async searchProducts(query: string) {
    return this.request.get('/products/search', { params: { q: query } });
  }

  async getProductsByCategory(category: string) {
    return this.request.get(`/products/category/${category}`);
  }

  async getCategories() {
    return this.request.get('/products/categories');
  }

  async addProduct(data: Record<string, unknown>) {
    return this.request.post('/products/add', { data });
  }

  async updateProduct(id: number, data: Record<string, unknown>) {
    return this.request.put(`/products/${id}`, { data });
  }

  async patchProduct(id: number, data: Record<string, unknown>) {
    return this.request.patch(`/products/${id}`, { data });
  }

  async deleteProduct(id: number) {
    return this.request.delete(`/products/${id}`);
  }

  /* ---------- Carts ---------- */
  async getCart(id: number) {
    return this.request.get(`/carts/${id}`);
  }

  async getCartsByUser(userId: number) {
    return this.request.get(`/carts/user/${userId}`);
  }

  async addCart(userId: number, products: { id: number; quantity: number }[]) {
    return this.request.post('/carts/add', { data: { userId, products } });
  }

  /** Small helper: assert status and return parsed JSON in one line. */
  static async expectJson<T = any>(response: APIResponse, status = 200): Promise<T> {
    expect(response.status(), `Unexpected status for ${response.url()}`).toBe(status);
    expect(response.headers()['content-type']).toContain('application/json');
    return (await response.json()) as T;
  }
}
