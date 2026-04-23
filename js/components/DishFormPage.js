// ===== ФОРМА БЛЮДА (создание/редактирование) =====
import { api } from '../api.js';
import { showNotification, categoryLabels, extractMacroCategory, formatNumber } from '../utils.js';
import { navigate } from '../router.js';
import { ProductFormModal } from './ProductFormModal.js';
export class DishFormPage {
    constructor(container, params) {
        this.ingredients = [];
        this.availableProducts = [];
        this.calculatedFields = { calories: 0, proteins: 0, fats: 0, carbohydrates: 0, portionSize: 0 };
        // Фотографии
        this.photoUrls = [];
        this.newPhotoFiles = [];
        this.container = container;
        this.dishId = params?.id;
    }
    async render() {
        // Загрузка списка продуктов для выпадающего списка
        try {
            this.availableProducts = await api.getProducts();
        }
        catch (err) {
            showNotification('Не удалось загрузить список продуктов', 'error');
        }
        let initialData = {};
        if (this.dishId) {
            try {
                this.dish = await api.getDish(this.dishId);
                initialData = this.dish;
                this.photoUrls = this.dish.photoUrls || [];
                this.ingredients = this.dish.ingredients.map(ing => ({
                    productId: ing.product.id,
                    productName: ing.product.name,
                    quantity: ing.quantity,
                }));
            }
            catch (err) {
                showNotification('Не удалось загрузить блюдо', 'error');
                navigate('/dishes');
                return;
            }
        }
        this.container.innerHTML = `
      <div class="form-container">
        <h2>${this.dishId ? 'Редактирование блюда' : 'Новое блюдо'}</h2>
        <form id="dish-form">
          <div class="form-group">
            <label for="name">Название *</label>
            <input type="text" id="name" name="name" required minlength="2" value="${initialData.name || ''}">
            <small>Можно использовать макросы: !десерт, !первое, !второе, !напиток, !салат, !суп, !перекус</small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="category">Категория</label>
              <select id="category">
                <option value="">Не выбрана (можно задать макросом)</option>
                ${['DESSERT', 'FIRST_COURSE', 'SECOND_COURSE', 'DRINK', 'SALAD', 'SOUP', 'SNACK'].map(cat => `<option value="${cat}" ${initialData.category === cat ? 'selected' : ''}>${categoryLabels[cat]}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- БЛОК ИНГРЕДИЕНТОВ -->
          <h3>Состав блюда</h3>
          <div class="ingredients-section">
            <div class="ingredient-add">
              <select id="product-select" class="product-select">
                <option value="">Выберите продукт</option>
                ${this.availableProducts.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
              </select>
              <input type="number" id="ingredient-quantity" placeholder="Кол-во, г" min="0.1" step="0.1" class="quantity-input">
              <button type="button" class="btn btn-small" id="add-ingredient-btn">Добавить</button>
              <button type="button" class="btn btn-outline btn-small" id="create-product-modal-btn">+ Новый продукт</button>
            </div>
            <div id="ingredients-list" class="ingredients-list"></div>
          </div>

          <!-- БЛОК КБЖУ (авторасчёт) -->
          <div class="form-row">
            <div class="form-group">
              <label for="calories">Калорийность (ккал/порц.)</label>
              <input type="number" step="0.1" min="0" id="calories" value="${initialData.calories || ''}">
              <small>Авторасчёт, можно изменить</small>
            </div>
            <div class="form-group">
              <label for="portionSize">Размер порции (г) *</label>
              <input type="number" step="0.1" min="0.1" id="portionSize" required readonly value="${this.calculatedFields.portionSize || initialData.portionSize || ''}">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="proteins">Белки (г/порц.)</label>
              <input type="number" step="0.1" min="0" max="100" id="proteins" value="${initialData.proteins || ''}">
            </div>
            <div class="form-group">
              <label for="fats">Жиры (г/порц.)</label>
              <input type="number" step="0.1" min="0" max="100" id="fats" value="${initialData.fats || ''}">
            </div>
            <div class="form-group">
              <label for="carbohydrates">Углеводы (г/порц.)</label>
              <input type="number" step="0.1" min="0" max="100" id="carbohydrates" value="${initialData.carbohydrates || ''}">
            </div>
          </div>

          <!-- ФЛАГИ (доступность зависит от состава) -->
          <div class="form-group">
            <label>Дополнительные флаги</label>
            <div class="checkbox-group" id="flags-group">
              <label><input type="checkbox" id="flag-vegan" ${initialData.flags?.includes('VEGAN') ? 'checked' : ''} disabled> Веган</label>
              <label><input type="checkbox" id="flag-gluten" ${initialData.flags?.includes('GLUTEN_FREE') ? 'checked' : ''} disabled> Без глютена</label>
              <label><input type="checkbox" id="flag-sugar" ${initialData.flags?.includes('SUGAR_FREE') ? 'checked' : ''} disabled> Без сахара</label>
            </div>
            <small>Доступность флагов определяется составом блюда</small>
          </div>

          <!-- БЛОК ФОТОГРАФИЙ -->
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
        // Кэширование элементов
        this.productSelect = document.getElementById('product-select');
        this.ingredientQuantityInput = document.getElementById('ingredient-quantity');
        this.ingredientsListDiv = document.getElementById('ingredients-list');
        this.initPhotoUpload();
        this.bindEvents();
        this.renderIngredientsList();
        this.recalculateNutrition();
        this.updateFlagsAvailability();
    }
    // ----- ФОТОГРАФИИ (аналогично продукту) -----
    initPhotoUpload() {
        const photoInput = document.getElementById('photo-input');
        const addBtn = document.getElementById('add-photo-btn');
        const previewsDiv = document.getElementById('photo-previews');
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
            const target = e.target;
            if (target.classList.contains('remove-photo')) {
                const index = parseInt(target.dataset.index);
                const type = target.dataset.type;
                if (type === 'url') {
                    this.photoUrls.splice(index, 1);
                }
                else {
                    this.newPhotoFiles.splice(index, 1);
                }
                this.renderPreviews(previewsDiv);
            }
        });
    }
    renderPreviews(container) {
        let html = '';
        this.photoUrls.forEach((url, idx) => {
            html += `<div class="photo-preview"><img src="${url}"><button type="button" class="remove-photo" data-type="url" data-index="${idx}">✕</button></div>`;
        });
        this.newPhotoFiles.forEach((file, idx) => {
            const objectUrl = URL.createObjectURL(file);
            html += `<div class="photo-preview"><img src="${objectUrl}"><button type="button" class="remove-photo" data-type="file" data-index="${idx}">✕</button></div>`;
        });
        container.innerHTML = html || '<p class="muted">Нет фотографий</p>';
    }
    // ----- СОБЫТИЯ -----
    bindEvents() {
        document.getElementById('add-ingredient-btn')?.addEventListener('click', () => this.addIngredient());
        document.getElementById('create-product-modal-btn')?.addEventListener('click', () => this.openCreateProductModal());
        document.getElementById('cancel-btn')?.addEventListener('click', () => navigate('/dishes'));
        const form = document.getElementById('dish-form');
        form?.addEventListener('submit', (e) => this.handleSubmit(e));
        this.ingredientsListDiv.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('remove-ingredient')) {
                const index = parseInt(target.dataset.index);
                this.ingredients.splice(index, 1);
                this.renderIngredientsList();
                this.recalculateNutrition();
                this.updateFlagsAvailability();
            }
        });
    }
    addIngredient() {
        const productId = this.productSelect.value;
        const quantity = parseFloat(this.ingredientQuantityInput.value);
        if (!productId) {
            showNotification('Выберите продукт', 'error');
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            showNotification('Введите положительное количество', 'error');
            return;
        }
        const product = this.availableProducts.find(p => p.id === productId);
        if (!product)
            return;
        const existingIndex = this.ingredients.findIndex(i => i.productId === productId);
        if (existingIndex >= 0) {
            this.ingredients[existingIndex].quantity += quantity;
        }
        else {
            this.ingredients.push({ productId, productName: product.name, quantity });
        }
        this.renderIngredientsList();
        this.recalculateNutrition();
        this.updateFlagsAvailability();
        this.productSelect.value = '';
        this.ingredientQuantityInput.value = '';
    }
    renderIngredientsList() {
        if (this.ingredients.length === 0) {
            this.ingredientsListDiv.innerHTML = '<p class="muted">Нет ингредиентов</p>';
            return;
        }
        const items = this.ingredients.map((ing, idx) => `
      <div class="ingredient-item">
        <span>${ing.productName} — ${formatNumber(ing.quantity)} г</span>
        <button type="button" class="remove-ingredient" data-index="${idx}">❌</button>
      </div>
    `).join('');
        this.ingredientsListDiv.innerHTML = items;
    }
    recalculateNutrition() {
        let totalCalories = 0, totalProteins = 0, totalFats = 0, totalCarbs = 0;
        let totalWeight = 0;
        for (const ing of this.ingredients) {
            const product = this.availableProducts.find(p => p.id === ing.productId);
            if (!product)
                continue;
            const factor = ing.quantity / 100;
            totalCalories += product.calories * factor;
            totalProteins += product.proteins * factor;
            totalFats += product.fats * factor;
            totalCarbs += product.carbohydrates * factor;
            totalWeight += ing.quantity;
        }
        this.calculatedFields = {
            calories: totalCalories,
            proteins: totalProteins,
            fats: totalFats,
            carbohydrates: totalCarbs,
            portionSize: totalWeight,
        };
        document.getElementById('calories').value = totalCalories.toFixed(1);
        document.getElementById('proteins').value = totalProteins.toFixed(1);
        document.getElementById('fats').value = totalFats.toFixed(1);
        document.getElementById('carbohydrates').value = totalCarbs.toFixed(1);
        document.getElementById('portionSize').value = totalWeight.toFixed(1);
    }
    updateFlagsAvailability() {
        if (this.ingredients.length === 0) {
            this.setFlagsEnabled(false, false, false);
            return;
        }
        let veganAvailable = true, glutenFreeAvailable = true, sugarFreeAvailable = true;
        for (const ing of this.ingredients) {
            const product = this.availableProducts.find(p => p.id === ing.productId);
            if (!product)
                continue;
            if (!product.flags.includes('VEGAN'))
                veganAvailable = false;
            if (!product.flags.includes('GLUTEN_FREE'))
                glutenFreeAvailable = false;
            if (!product.flags.includes('SUGAR_FREE'))
                sugarFreeAvailable = false;
        }
        this.setFlagsEnabled(veganAvailable, glutenFreeAvailable, sugarFreeAvailable);
        const veganCheck = document.getElementById('flag-vegan');
        const glutenCheck = document.getElementById('flag-gluten');
        const sugarCheck = document.getElementById('flag-sugar');
        if (!veganAvailable)
            veganCheck.checked = false;
        if (!glutenFreeAvailable)
            glutenCheck.checked = false;
        if (!sugarFreeAvailable)
            sugarCheck.checked = false;
    }
    setFlagsEnabled(vegan, gluten, sugar) {
        document.getElementById('flag-vegan').disabled = !vegan;
        document.getElementById('flag-gluten').disabled = !gluten;
        document.getElementById('flag-sugar').disabled = !sugar;
    }
    async openCreateProductModal() {
        const modal = new ProductFormModal(async (newProduct) => {
            this.availableProducts = await api.getProducts();
            this.productSelect.innerHTML = `<option value="">Выберите продукт</option>` +
                this.availableProducts.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
            showNotification(`Продукт "${newProduct.name}" добавлен`, 'success');
        });
        modal.show();
    }
    async handleSubmit(e) {
        e.preventDefault();
        const errorDiv = document.getElementById('form-error');
        errorDiv.textContent = '';
        const form = e.target;
        const formData = new FormData(form);
        if (this.ingredients.length === 0) {
            errorDiv.textContent = 'Добавьте хотя бы один ингредиент';
            return;
        }
        // Обработка макроса в названии
        let name = formData.get('name');
        const { cleanedName, category: macroCat } = extractMacroCategory(name);
        name = cleanedName;
        let category = formData.get('category');
        if (!category && macroCat)
            category = macroCat;
        if (!category) {
            errorDiv.textContent = 'Укажите категорию (вручную или через макрос)';
            return;
        }
        const flags = [];
        if (document.getElementById('flag-vegan').checked)
            flags.push('VEGAN');
        if (document.getElementById('flag-gluten').checked)
            flags.push('GLUTEN_FREE');
        if (document.getElementById('flag-sugar').checked)
            flags.push('SUGAR_FREE');
        // Загрузка фотографий
        const uploadedUrls = [];
        for (const file of this.newPhotoFiles) {
            try {
                const res = await api.uploadImage(file);
                uploadedUrls.push(res.url);
            }
            catch (err) {
                errorDiv.textContent = `Ошибка загрузки изображения: ${err.message}`;
                return;
            }
        }
        const finalPhotoUrls = [...this.photoUrls, ...uploadedUrls];
        const data = {
            name,
            calories: parseFloat(formData.get('calories')) || undefined,
            proteins: parseFloat(formData.get('proteins')) || undefined,
            fats: parseFloat(formData.get('fats')) || undefined,
            carbohydrates: parseFloat(formData.get('carbohydrates')) || undefined,
            portionSize: parseFloat(formData.get('portionSize')),
            category,
            flags,
            ingredients: this.ingredients.map(ing => ({ productId: ing.productId, quantity: ing.quantity })),
            photoUrls: finalPhotoUrls,
        };
        // Проверка суммы БЖУ на 100 г
        const portion = data.portionSize;
        const sum100 = ((data.proteins || 0) + (data.fats || 0) + (data.carbohydrates || 0)) / portion * 100;
        if (sum100 > 100) {
            errorDiv.textContent = 'Сумма БЖУ на 100 г блюда не может превышать 100 г';
            return;
        }
        try {
            if (this.dishId) {
                await api.updateDish(this.dishId, data);
                showNotification('Блюдо обновлено', 'success');
            }
            else {
                await api.createDish(data);
                showNotification('Блюдо создано', 'success');
            }
            navigate('/dishes');
        }
        catch (err) {
            errorDiv.textContent = err.message;
        }
    }
}
