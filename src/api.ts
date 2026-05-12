import {
  ProductDto,
  CreateProductRequest,
  ChangeProductRequest,
  DishDto,
  CreateDishRequest,
  ChangeDishRequest,
  CreateEntityResponse,
  ChangeEntityResponse,
  DeleteEntityResponse,
  ProductCategory,
  CookingNecessity,
  Flag,
  SortField,
  DishCategory,
  DeleteProductResponse,
} from './models.js';

const API_BASE = 'http://localhost:8080';

async function request<T>(method: string, path: string, body?: unknown, isFormData = false): Promise<T> {
  const url = API_BASE + path;
  const options: RequestInit = { method, headers: {} };
  if (body && !isFormData) {
    (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  } else if (body && isFormData) {
    options.body = body as FormData;
  }
  const resp = await fetch(url, options);
  if (!resp.ok) {
    let errorData: any = {};
    try {
      errorData = await resp.json();
    } catch {}
    const message = errorData.message || `Ошибка ${resp.status}`;
    const err: any = new Error(message);
    err.status = resp.status;
    err.data = errorData;
    throw err;
  }
  const text = await resp.text();
  return JSON.parse(text);
}

// ─── Products ───────────────────────────
export async function fetchProducts(
  category?: ProductCategory,
  cookingNecessity?: CookingNecessity,
  flags?: Flag[],
  search?: string,
  sort?: SortField
): Promise<ProductDto[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (cookingNecessity) params.append('readinessDegree', cookingNecessity);
  if (flags && flags.length) flags.forEach(f => params.append('flags', f));
  if (search) params.append('search', search);
  if (sort) params.append('sort', sort);
  const qs = params.toString();
  return request<ProductDto[]>('GET', '/products' + (qs ? '?' + qs : ''));
}

export async function getProduct(id: string): Promise<ProductDto> {
  return request<ProductDto>('GET', `/products/${id}`);
}

export async function createProduct(data: CreateProductRequest): Promise<CreateEntityResponse> {
  return request<CreateEntityResponse>('POST', '/products/create', data);
}

export async function updateProduct(id: string, data: ChangeProductRequest): Promise<ChangeEntityResponse> {
  return request<ChangeEntityResponse>('PUT', `/products/${id}/update`, data);
}

export async function deleteProduct(id: string): Promise<DeleteProductResponse> {
  const url = API_BASE + `/products/${id}/delete`;
  const resp = await fetch(url, { method: 'DELETE' });
  const text = await resp.text();
  const data = text ? (JSON.parse(text) as DeleteProductResponse) : null;

  // Если успех (200) и Acknowledge === true – всё хорошо
  if (resp.ok && data?.Acknowledge) {
    return data;
  }

  // Если сервер вернул 409 Conflict с информацией о блюдах
  if (resp.status === 409 && data) {
    return data; // Acknowledge будет false, Dishes – перечень блюд
  }

  // Если ответ 200, но Acknowledge === false (на всякий случай)
  if (resp.ok && data && !data.Acknowledge) {
    return data;
  }

  // Все остальные ошибки
  throw new Error(`Ошибка ${resp.status}: ${data ? JSON.stringify(data) : text}`);
}

// ─── Dishes ─────────────────────────────
export async function fetchDishes(
  category?: DishCategory,
  flags?: Flag[],
  search?: string
): Promise<DishDto[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (flags && flags.length) flags.forEach(f => params.append('flags', f));
  if (search) params.append('search', search);
  const qs = params.toString();
  return request<DishDto[]>('GET', '/dishes' + (qs ? '?' + qs : ''));
}

export async function getDish(id: string): Promise<DishDto> {
  return request<DishDto>('GET', `/dishes/${id}`);
}

export async function createDish(data: CreateDishRequest): Promise<CreateEntityResponse> {
  return request<CreateEntityResponse>('POST', '/dishes', data);
}

export async function updateDish(id: string, data: ChangeDishRequest): Promise<ChangeEntityResponse> {
  return request<ChangeEntityResponse>('PUT', `/dishes/${id}/update`, data);
}

export async function deleteDish(id: string): Promise<DeleteEntityResponse> {
  return request<DeleteEntityResponse>('DELETE', `/dishes/${id}/delete`);
}

// ─── Upload ─────────────────────────────
export async function uploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  return request<{ url: string }>('POST', '/upload/image', formData, true);
}