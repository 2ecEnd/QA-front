import { api } from '../api.js';
import { showNotification, categoryLabels, cookingLabels, flagLabels } from '../utils.js';
import { navigate } from '../router.js';
export class ProductListPage {
    constructor(container) {
        this.filter = {};
        this.sortBy = 'name';
        this.sortDir = 'asc';
        this.container = container;
    }
    async render() {
        this.container.innerHTML = `
      <div class="page-header">
        <h2>Продукты</h2>
        <button class="btn btn-primary" id="add-product-btn">+ Новый продукт</button>
      </div>
      <div class="filters-panel">
        <input type="text" id="search-name" placeholder="Поиск по названию..." class="filter-input" />
        <select id="filter-category" class="filter-select">
          <option value="">Все категории</option>
          ${Object.entries(categoryLabels).map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
        </select>
        <select id="filter-cooking" class="filter-select">
          <option value="">Любая готовность</option>
          ${Object.entries(cookingLabels).map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
        </select>
        <label class="filter-checkbox"><input type="checkbox" id="flag-vegan"> Веган</label>
        <label class="filter-checkbox"><input type="checkbox" id="flag-gluten"> Без глютена</label>
        <label class="filter-checkbox"><input type="checkbox" id="flag-sugar"> Без сахара</label>
        <button class="btn" id="apply-filter">Применить</button>
        <button class="btn btn-outline" id="reset-filter">Сбросить</button>
      </div>
      <div id="products-table-container"></div>
    `;
        this.bindEvents();
        await this.loadProducts();
    }
    bindEvents() {
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            navigate('/products/new');
        });
        document.getElementById('apply-filter')?.addEventListener('click', () => {
            this.updateFilterFromUI();
            this.loadProducts();
        });
        document.getElementById('reset-filter')?.addEventListener('click', () => {
            this.resetFilterUI();
            this.filter = {};
            this.sortBy = 'name';
            this.sortDir = 'asc';
            this.loadProducts();
        });
        // Делегирование событий для сортировки и действий со строками
        const tableContainer = document.getElementById('products-table-container');
        tableContainer?.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.classList.contains('sortable')) {
                const field = target.dataset.sort;
                if (this.sortBy === field) {
                    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
                }
                else {
                    this.sortBy = field;
                    this.sortDir = 'asc';
                }
                await this.loadProducts();
            }
            else if (target.classList.contains('edit-product')) {
                const id = target.dataset.id;
                navigate(`/products/${id}/edit`);
            }
            else if (target.classList.contains('delete-product')) {
                const id = target.dataset.id;
                if (confirm('Удалить продукт?')) {
                    try {
                        await api.deleteProduct(id);
                        showNotification('Продукт удалён', 'success');
                        await this.loadProducts();
                    }
                    catch (err) {
                        showNotification(`Ошибка: ${err.message}`, 'error');
                    }
                }
            }
            else if (target.classList.contains('view-product')) {
                const id = target.dataset.id;
                navigate(`/products/${id}`);
            }
        });
    }
    updateFilterFromUI() {
        this.filter = {
            name: document.getElementById('search-name')?.value || undefined,
            category: document.getElementById('filter-category')?.value || undefined,
            cookingRequired: document.getElementById('filter-cooking')?.value || undefined,
            vegan: document.getElementById('flag-vegan')?.checked || undefined,
            glutenFree: document.getElementById('flag-gluten')?.checked || undefined,
            sugarFree: document.getElementById('flag-sugar')?.checked || undefined,
        };
    }
    resetFilterUI() {
        document.getElementById('search-name').value = '';
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-cooking').value = '';
        document.getElementById('flag-vegan').checked = false;
        document.getElementById('flag-gluten').checked = false;
        document.getElementById('flag-sugar').checked = false;
    }
    async loadProducts() {
        const container = document.getElementById('products-table-container');
        try {
            const products = await api.getProducts({
                ...this.filter,
                sortBy: this.sortBy,
                sortDir: this.sortDir,
            });
            this.renderTable(container, products);
        }
        catch (err) {
            container.innerHTML = `<p class="error">Ошибка загрузки: ${err.message}</p>`;
        }
    }
    renderTable(container, products) {
        if (products.length === 0) {
            container.innerHTML = '<p>Продукты не найдены</p>';
            return;
        }
        const getSortIcon = (field) => {
            if (this.sortBy !== field)
                return '↕️';
            return this.sortDir === 'asc' ? '↑' : '↓';
        };
        const rows = products.map(p => `
      <tr>
        <td><a href="#/products/${p.id}" class="view-link">${p.name}</a></td>
        <td>${categoryLabels[p.category] || p.category}</td>
        <td>${p.calories.toFixed(1)}</td>
        <td>${p.proteins.toFixed(1)} / ${p.fats.toFixed(1)} / ${p.carbohydrates.toFixed(1)}</td>
        <td>${p.flags.map(f => flagLabels[f] || f).join(', ') || '—'}</td>
        <td>
          <button class="icon-btn view-product" data-id="${p.id}" title="Просмотр">👁️</button>
          <button class="icon-btn edit-product" data-id="${p.id}" title="Редактировать">✏️</button>
          <button class="icon-btn delete-product" data-id="${p.id}" title="Удалить">🗑️</button>
        </td>
      </tr>
    `).join('');
        container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th class="sortable" data-sort="name">Название ${getSortIcon('name')}</th>
            <th>Категория</th>
            <th class="sortable" data-sort="calories">Ккал/100г ${getSortIcon('calories')}</th>
            <th class="sortable" data-sort="proteins">Б/Ж/У ${getSortIcon('proteins')}</th>
            <th>Флаги</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    }
}
