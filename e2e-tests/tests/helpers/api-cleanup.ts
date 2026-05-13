import { deleteProduct, deleteDish } from '../../../src/api.ts';
import { DishDto, ProductDto } from '../../../src/models.ts';

const API_BASE = 'http://localhost:8080';

async function fetchJson(url: string, options?: RequestInit) {
  const resp = await fetch(url, options);
  if (!resp.ok) throw new Error(`API error ${resp.status}: ${await resp.text()}`);
  return resp.json();
}

export async function cleanupDatabase() {
  // Удаляем все блюда
  const dishes = await fetchJson(`${API_BASE}/dishes`) as DishDto[];
  for (const d of dishes) {
    deleteDish(d.Id);
  }
  // Удаляем все продукты
  const products = await fetchJson(`${API_BASE}/products`) as ProductDto[];
  for (const p of products) {
    deleteProduct(p.Id);
  }
}