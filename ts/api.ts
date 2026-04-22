import { Product, ProductCreateDto, ProductFilter, Dish, DishCreateDto, DishFilter } from './types.js';

const API_BASE = 'http://localhost:8080';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }
  return response.json();
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        searchParams.append(key, value ? 'true' : 'false');
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  // Продукты
  getProducts: (filter: ProductFilter = {}): Promise<Product[]> =>
    request(`/products${buildQueryString(filter)}`),

  getProduct: (id: string): Promise<Product> =>
    request(`/products/${id}`),

  createProduct: (dto: ProductCreateDto): Promise<Product> =>
    request('/products/create', { method: 'POST', body: JSON.stringify(dto) }),

  updateProduct: (id: string, dto: ProductCreateDto): Promise<Product> =>
    request(`/products/${id}/update`, { method: 'PUT', body: JSON.stringify(dto) }),

  deleteProduct: (id: string): Promise<void> =>
    request(`/products/${id}/delete`, { method: 'DELETE' }),

  // Блюда
  getDishes: (filter: DishFilter = {}): Promise<Dish[]> =>
    request(`/dishes${buildQueryString(filter)}`),

  getDish: (id: string): Promise<Dish> =>
    request(`/dishes/${id}`),

  createDish: (dto: DishCreateDto): Promise<Dish> =>
    request('/dishes/create', { method: 'POST', body: JSON.stringify(dto) }),

  updateDish: (id: string, dto: DishCreateDto): Promise<Dish> =>
    request(`/dishes/${id}/update`, { method: 'PUT', body: JSON.stringify(dto) }),

  deleteDish: (id: string): Promise<void> =>
    request(`/dishes/${id}/delete`, { method: 'DELETE' }),
};