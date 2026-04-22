import { api } from '../api.js';
import { Dish, DishFilter } from '../types.js';
import { showNotification, categoryLabels, flagLabels } from '../utils.js';
import { navigate } from '../router.js';

export class DishListPage {
  private container: HTMLElement;
  private filter: DishFilter = {};

  constructor(container: HTMLElement) {
    this.container = container;
  }

  async render() {
    this.container.innerHTML = `
      <div class="page-header">
        <h2>Блюда</h2>
        <button class="btn btn-primary" id="add-dish-btn">+ Новое блюдо</button>
      </div>
      <div class="filters-panel">
        <input type="text" id="search-name" placeholder="Поиск по названию..." class="filter-input" />
        <select id="filter-category" class="filter-select">
          <option value="">Все категории</option>
          ${Object.entries(categoryLabels).filter(([k]) => 
            ['DESSERT','FIRST_COURSE','SECOND_COURSE','DRINK','SALAD','SOUP','SNACK'].includes(k)
          ).map(([val, label]) => `<option value="${val}">${label}</option>`).join('')}
        </select>
        <label class="filter-checkbox"><input type="checkbox" id="flag-vegan"> Веган</label>
        <label class="filter-checkbox"><input type="checkbox" id="flag-gluten"> Без глютена</label>
        <label class="filter-checkbox"><input type="checkbox" id="flag-sugar"> Без сахара</label>
        <button class="btn" id="apply-filter">Применить</button>
        <button class="btn btn-outline" id="reset-filter">Сбросить</button>
      </div>
      <div id="dishes-table-container"></div>
    `;

    this.bindEvents();
    await this.loadDishes();
  }

  private bindEvents() {
    document.getElementById('add-dish-btn')?.addEventListener('click', () => navigate('/dishes/new'));
    document.getElementById('apply-filter')?.addEventListener('click', () => {
      this.updateFilterFromUI();
      this.loadDishes();
    });
    document.getElementById('reset-filter')?.addEventListener('click', () => {
      this.resetFilterUI();
      this.filter = {};
      this.loadDishes();
    });

    const tableContainer = document.getElementById('dishes-table-container');
    tableContainer?.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('edit-dish')) {
        navigate(`/dishes/${target.dataset.id}/edit`);
      } else if (target.classList.contains('delete-dish')) {
        if (confirm('Удалить блюдо?')) {
          try {
            await api.deleteDish(target.dataset.id!);
            showNotification('Блюдо удалено', 'success');
            await this.loadDishes();
          } catch (err: any) {
            showNotification(`Ошибка: ${err.message}`, 'error');
          }
        }
      } else if (target.classList.contains('view-dish')) {
        navigate(`/dishes/${target.dataset.id}`);
      }
    });
  }

  private updateFilterFromUI() {
    this.filter = {
      name: (document.getElementById('search-name') as HTMLInputElement)?.value || undefined,
      category: (document.getElementById('filter-category') as HTMLSelectElement)?.value || undefined,
      vegan: (document.getElementById('flag-vegan') as HTMLInputElement)?.checked || undefined,
      glutenFree: (document.getElementById('flag-gluten') as HTMLInputElement)?.checked || undefined,
      sugarFree: (document.getElementById('flag-sugar') as HTMLInputElement)?.checked || undefined,
    };
  }

  private resetFilterUI() {
    (document.getElementById('search-name') as HTMLInputElement).value = '';
    (document.getElementById('filter-category') as HTMLSelectElement).value = '';
    (document.getElementById('flag-vegan') as HTMLInputElement).checked = false;
    (document.getElementById('flag-gluten') as HTMLInputElement).checked = false;
    (document.getElementById('flag-sugar') as HTMLInputElement).checked = false;
  }

  private async loadDishes() {
    const container = document.getElementById('dishes-table-container')!;
    try {
      const dishes = await api.getDishes(this.filter);
      this.renderTable(container, dishes);
    } catch (err: any) {
      container.innerHTML = `<p class="error">Ошибка: ${err.message}</p>`;
    }
  }

  private renderTable(container: HTMLElement, dishes: Dish[]) {
    if (dishes.length === 0) {
      container.innerHTML = '<p>Блюда не найдены</p>';
      return;
    }

    const rows = dishes.map(d => `
      <tr>
        <td><a href="#/dishes/${d.id}" class="view-link">${d.name}</a></td>
        <td>${categoryLabels[d.category] || d.category}</td>
        <td>${d.calories.toFixed(0)}</td>
        <td>${d.portionSize.toFixed(0)} г</td>
        <td>${d.flags.map(f => flagLabels[f] || f).join(', ') || '—'}</td>
        <td>
          <button class="icon-btn view-dish" data-id="${d.id}">👁️</button>
          <button class="icon-btn edit-dish" data-id="${d.id}">✏️</button>
          <button class="icon-btn delete-dish" data-id="${d.id}">🗑️</button>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Категория</th>
            <th>Ккал/порц.</th>
            <th>Порция</th>
            <th>Флаги</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }
}