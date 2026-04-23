// ===== ГЛАВНЫЙ ФАЙЛ ПРИЛОЖЕНИЯ =====
import { initRouter, addRoute, navigate } from './router.js';
import { ProductListPage } from './components/ProductListPage.js';
import { ProductFormPage } from './components/ProductFormPage.js';
import { ProductDetailPage } from './components/ProductDetailPage.js';
import { DishListPage } from './components/DishListPage.js';
import { DishFormPage } from './components/DishFormPage.js';
import { DishDetailPage } from './components/DishDetailPage.js';
function setupRoutes() {
    const container = document.getElementById('app-content');
    addRoute(/^\/products\/?$/, async () => {
        await new ProductListPage(container).render();
    });
    addRoute(/^\/products\/new\/?$/, async () => {
        await new ProductFormPage(container).render();
    });
    addRoute(/^\/products\/(?<id>[^/]+)\/edit\/?$/, async (params) => {
        await new ProductFormPage(container, { id: params.id }).render();
    });
    addRoute(/^\/products\/(?<id>[^/]+)\/?$/, async (params) => {
        await new ProductDetailPage(container, { id: params.id }).render();
    });
    addRoute(/^\/dishes\/?$/, async () => {
        await new DishListPage(container).render();
    });
    addRoute(/^\/dishes\/new\/?$/, async () => {
        await new DishFormPage(container).render();
    });
    addRoute(/^\/dishes\/(?<id>[^/]+)\/edit\/?$/, async (params) => {
        await new DishFormPage(container, { id: params.id }).render();
    });
    addRoute(/^\/dishes\/(?<id>[^/]+)\/?$/, async (params) => {
        await new DishDetailPage(container, { id: params.id }).render();
    });
    // Редирект с корня на продукты
    addRoute(/^\/?$/, () => {
        navigate('/products');
    });
}
function initNavigation() {
    document.getElementById('nav-products')?.addEventListener('click', () => navigate('/products'));
    document.getElementById('nav-dishes')?.addEventListener('click', () => navigate('/dishes'));
}
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    setupRoutes();
    initRouter();
});
