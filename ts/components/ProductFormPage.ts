// ===== ФОРМА ПРОДУКТА (создание/редактирование) =====
import { api } from '../api.js';
import { Product, ProductCreateDto, ProductCategory, CookingRequired, ProductFlag } from '../types.js';
import { showNotification, categoryLabels, cookingLabels } from '../utils.js';
import { navigate } from '../router.js';

export class ProductFormPage {
  private container: HTMLElement;
  private productId?: string;
  private product?: Product;
  private photoUrls: string[] = [];
  private newPhotoFiles: File[] = [];

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
        this.photoUrls = this.product.photoUrls || [];
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

          <!-- БЛОК ЗАГРУЗКИ ФОТОГРАФИЙ -->
          <div class="form-group">
            <label>Фотографии (до 5)</label>
            <div class="photo-upload-area">
              <div id="photo-previews" class="photo-previews"></div>
              <input type="file" id="photo-input" accept="image/*" multiple style="display: none;">
              <button type="button" class="btn btn-outline" id="add-photo-btn">+ Добавить фото</button>
            </div>
            <small>Поддерживаются JPG, PNG. Максимум 5 изображений.</small>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-outline" id="cancel-btn">Отмена</button>
          </div>
          <div id="form-error" class="error-message"></div>
        </form>
      </div>
    `;

    this.initPhotoUpload();
    this.bindEvents();
  }

  // ----- ЛОГИКА ЗАГРУЗКИ ФОТО -----
  private initPhotoUpload() {
    const photoInput = document.getElementById('photo-input') as HTMLInputElement;
    const addBtn = document.getElementById('add-photo-btn');
    const previewsDiv = document.getElementById('photo-previews')!;

    this.renderPreviews(previewsDiv);

    addBtn?.addEventListener('click', () => photoInput.click());

    photoInput?.addEventListener('change', () => {
      const files = Array.from(photoInput.files || []);
      const totalCount = this.photoUrls.length + this.newPhotoFiles.length + files.length;
      if (totalCount > 5) {
        showNotification('Максимум 5 изображений', 'error');
        photoInput.value = '';
        return;
      }
      this.newPhotoFiles.push(...files);
      this.renderPreviews(previewsDiv);
      photoInput.value = '';
    });

    previewsDiv.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('remove-photo')) {
        const index = parseInt(target.dataset.index!);
        const type = target.dataset.type!;
        if (type === 'url') {
          this.photoUrls.splice(index, 1);
        } else {
          this.newPhotoFiles.splice(index, 1);
        }
        this.renderPreviews(previewsDiv);
      }
    });
  }

  private renderPreviews(container: HTMLElement) {
    let html = '';
    
    this.photoUrls.forEach((url, idx) => {
      html += `
        <div class="photo-preview">
          <img src="${url}" alt="preview">
          <button type="button" class="remove-photo" data-type="url" data-index="${idx}">✕</button>
        </div>
      `;
    });

    this.newPhotoFiles.forEach((file, idx) => {
      const objectUrl = URL.createObjectURL(file);
      html += `
        <div class="photo-preview">
          <img src="${objectUrl}" alt="new preview">
          <button type="button" class="remove-photo" data-type="file" data-index="${idx}">✕</button>
        </div>
      `;
    });

    container.innerHTML = html || '<p class="muted">Нет фотографий</p>';
  }

  // ----- ПРИВЯЗКА СОБЫТИЙ ФОРМЫ -----
  private bindEvents() {
    const form = document.getElementById('product-form') as HTMLFormElement;
    const cancelBtn = document.getElementById('cancel-btn');

    cancelBtn?.addEventListener('click', () => navigate('/products'));

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  // ----- ОТПРАВКА ДАННЫХ -----
  private async handleSubmit() {
    const errorDiv = document.getElementById('form-error')!;
    errorDiv.textContent = '';

    const form = document.getElementById('product-form') as HTMLFormElement;
    const formData = new FormData(form);

    const name = formData.get('name') as string;
    const calories = parseFloat(formData.get('calories') as string);
    const proteins = parseFloat(formData.get('proteins') as string);
    const fats = parseFloat(formData.get('fats') as string);
    const carbohydrates = parseFloat(formData.get('carbohydrates') as string);
    const composition = formData.get('composition') as string || null;
    const category = formData.get('category') as ProductCategory;
    const cookingRequired = formData.get('cookingRequired') as CookingRequired;

    // Проверка суммы БЖУ
    const sum = proteins + fats + carbohydrates;
    if (sum > 100) {
      errorDiv.textContent = 'Сумма белков, жиров и углеводов не может превышать 100 г';
      return;
    }

    // Сбор флагов
    const flags: ProductFlag[] = [];
    if ((document.getElementById('flag-vegan') as HTMLInputElement).checked) flags.push('VEGAN');
    if ((document.getElementById('flag-gluten') as HTMLInputElement).checked) flags.push('GLUTEN_FREE');
    if ((document.getElementById('flag-sugar') as HTMLInputElement).checked) flags.push('SUGAR_FREE');

    // Загрузка новых изображений на сервер
    const uploadedUrls: string[] = [];
    for (const file of this.newPhotoFiles) {
      try {
        const res = await api.uploadImage(file);
        uploadedUrls.push(res.url);
      } catch (err: any) {
        errorDiv.textContent = `Ошибка загрузки изображения: ${err.message}`;
        return;
      }
    }

    const finalPhotoUrls = [...this.photoUrls, ...uploadedUrls];

    const dto: ProductCreateDto = {
      name,
      calories,
      proteins,
      fats,
      carbohydrates,
      composition,
      category,
      cookingRequired,
      flags,
      photoUrls: finalPhotoUrls,
    };

    try {
      if (this.productId) {
        await api.updateProduct(this.productId, dto);
        showNotification('Продукт обновлён', 'success');
      } else {
        await api.createProduct(dto);
        showNotification('Продукт создан', 'success');
      }
      navigate('/products');
    } catch (err: any) {
      errorDiv.textContent = err.message;
    }
  }
}