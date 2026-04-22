import { initRouter, addRoute, navigate } from './router.js';
import { ProductListPage } from './components/ProductList.js';
import { ProductFormPage } from './components/ProductForm.js';
import { ProductDetailPage } from './components/ProductDetail.js';
import { DishListPage } from './components/DishList.js';
import { DishFormPage } from './components/DishForm.js';
import { DishDetailPage } from './components/DishDetail.js';

function setupRoutes() {
  const container = document.getElementById('app-content')!;

  addRoute(/^\/products\/?$/, async () => {
    await new ProductListPage(container).render();
  });

  addRoute(/^\/products\/new\/?$/, async () => {
    await new ProductFormPage(container).render();
  });

  addRoute(/^\/products\/(?<id>[^/]+)\/edit\/?$/, async (params) => {
    await new ProductFormPage(container, { id: params!.id }).render();
  });

  addRoute(/^\/products\/(?<id>[^/]+)\/?$/, async (params) => {
    await new ProductDetailPage(container, { id: params!.id }).render();
  });

  addRoute(/^\/dishes\/?$/, async () => {
    await new DishListPage(container).render();
  });

  addRoute(/^\/dishes\/new\/?$/, async () => {
    await new DishFormPage(container).render();
  });

  addRoute(/^\/dishes\/(?<id>[^/]+)\/edit\/?$/, async (params) => {
    await new DishFormPage(container, { id: params!.id }).render();
  });

  addRoute(/^\/dishes\/(?<id>[^/]+)\/?$/, async (params) => {
    await new DishDetailPage(container, { id: params!.id }).render();
  });

  // Редирект с корня на продукты
  addRoute(/^\/?$/, () => {
    navigate('/products');
  });
}

// Навигация в шапке
function initNavigation() {
  document.getElementById('nav-products')?.addEventListener('click', () => navigate('/products'));
  document.getElementById('nav-dishes')?.addEventListener('click', () => navigate('/dishes'));
}

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  setupRoutes();
  initRouter();
});