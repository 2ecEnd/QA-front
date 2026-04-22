import { api } from '../api.js';
import { Product, ProductCreateDto, ProductCategory, CookingRequired, ProductFlag } from '../types.js';
import { showNotification, categoryLabels, cookingLabels } from '../utils.js';
import { navigate } from '../router.js';

export class ProductFormPage {
  private container: HTMLElement;
  private productId?: string;
  private product?: Product;

  constructor(container: HTMLElement, params?: { id?: string }) {
    this.container = container;
    this.productId = params?.id;
  }

  async render() {
    let initialData: Partial<Product> = {};
    if (this.productId) {
      try {
        this.product = await api.getProduct(this.productId);
        initialData = this.product;
      } catch (err) {
        showNotification('Не удалось загрузить продукт', 'error');
        navigate('/products');
        return;
      }
    }

    this.container.innerHTML = `
      <div class="form-container">
        <h2>${this.productId ? 'Редактирование продукта' : 'Новый продукт'}</h2>
        <form id="product-form">
          <div class="form-group">
            <label for="name">Название *</label>
            <input type="text" id="name" name="name" required minlength="2" value="${initialData.name || ''}">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="calories">Калорийность (ккал/100г) *</label>
              <input type="number" step="0.1" min="0" id="calories" required value="${initialData.calories || ''}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="proteins">Белки (г/100г) *</label>
              <input type="number" step="0.1" min="0" max="100" id="proteins" required value="${initialData.proteins || ''}">
            </div>
            <div class="form-group">
              <label for="fats">Жиры (г/100г) *</label>
              <input type="number" step="0.1" min="0" max="100" id="fats" required value="${initialData.fats || ''}">
            </div>
            <div class="form-group">
              <label for="carbohydrates">Углеводы (г/100г) *</label>
              <input type="number" step="0.1" min="0" max="100" id="carbohydrates" required value="${initialData.carbohydrates || ''}">
            </div>
          </div>

          <div class="form-group">
            <label for="composition">Состав (описание)</label>
            <textarea id="composition" rows="3">${initialData.composition || ''}</textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Категория *</label>
              <select id="category" required>
                ${Object.entries(categoryLabels).map(([val, label]) => 
                  `<option value="${val}" ${initialData.category === val ? 'selected' : ''}>${label}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="cookingRequired">Готовность *</label>
              <select id="cookingRequired" required>
                ${Object.entries(cookingLabels).map(([val, label]) => 
                  `<option value="${val}" ${initialData.cookingRequired === val ? 'selected' : ''}>${label}</option>`
                ).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Дополнительные флаги</label>
            <div class="checkbox-group">
              <label><input type="checkbox" id="flag-vegan" ${initialData.flags?.includes('VEGAN') ? 'checked' : ''}> Веган</label>
              <label><input type="checkbox" id="flag-gluten" ${initialData.flags?.includes('GLUTEN_FREE') ? 'checked' : ''}> Без глютена</label>
              <label><input type="checkbox" id="flag-sugar" ${initialData.flags?.includes('SUGAR_FREE') ? 'checked' : ''}> Без сахара</label>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-outline" id="cancel-btn">Отмена</button>
          </div>
          <div id="form-error" class="error-message"></div>
        </form>
      </div>
    `;

    this.bindEvents();
  }

  private bindEvents() {
    const form = document.getElementById('product-form') as HTMLFormElement;
    const cancelBtn = document.getElementById('cancel-btn');

    cancelBtn?.addEventListener('click', () => navigate('/products'));

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorDiv = document.getElementById('form-error')!;
      errorDiv.textContent = '';

      const formData = new FormData(form);
      const data: ProductCreateDto = {
        name: formData.get('name') as string,
        calories: parseFloat(formData.get('calories') as string),
        proteins: parseFloat(formData.get('proteins') as string),
        fats: parseFloat(formData.get('fats') as string),
        carbohydrates: parseFloat(formData.get('carbohydrates') as string),
        composition: formData.get('composition') as string || null,
        category: formData.get('category') as ProductCategory,
        cookingRequired: formData.get('cookingRequired') as CookingRequired,
        flags: [],
        photoUrls: [],
      };

      // Валидация суммы БЖУ
      const sum = data.proteins + data.fats + data.carbohydrates;
      if (sum > 100) {
        errorDiv.textContent = 'Сумма белков, жиров и углеводов не может превышать 100 г';
        return;
      }

      if ((document.getElementById('flag-vegan') as HTMLInputElement).checked) data.flags!.push('VEGAN');
      if ((document.getElementById('flag-gluten') as HTMLInputElement).checked) data.flags!.push('GLUTEN_FREE');
      if ((document.getElementById('flag-sugar') as HTMLInputElement).checked) data.flags!.push('SUGAR_FREE');

      try {
        if (this.productId) {
          await api.updateProduct(this.productId, data);
          showNotification('Продукт обновлён', 'success');
        } else {
          await api.createProduct(data);
          showNotification('Продукт создан', 'success');
        }
        navigate('/products');
      } catch (err: any) {
        errorDiv.textContent = err.message;
      }
    });
  }
}