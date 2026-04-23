// ===== МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ПРОДУКТА =====
import { api } from '../api.js';
import { showNotification, categoryLabels, cookingLabels } from '../utils.js';
export class ProductFormModal {
    constructor(onSave) {
        this.onSave = onSave;
        this.modalElement = document.createElement('div');
        this.modalElement.className = 'modal hidden';
        this.overlay = document.createElement('div');
        this.overlay.className = 'modal-overlay hidden';
        document.body.appendChild(this.overlay);
        document.body.appendChild(this.modalElement);
    }
    show() {
        this.render();
        this.modalElement.classList.remove('hidden');
        this.overlay.classList.remove('hidden');
    }
    hide() {
        this.modalElement.classList.add('hidden');
        this.overlay.classList.add('hidden');
    }
    render() {
        this.modalElement.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Быстрое добавление продукта</h3>
        <form id="modal-product-form">
          <div class="form-group">
            <label>Название *</label>
            <input type="text" id="modal-name" required minlength="2">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Калорийность *</label>
              <input type="number" step="0.1" min="0" id="modal-calories" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Белки *</label>
              <input type="number" step="0.1" min="0" max="100" id="modal-proteins" required>
            </div>
            <div class="form-group">
              <label>Жиры *</label>
              <input type="number" step="0.1" min="0" max="100" id="modal-fats" required>
            </div>
            <div class="form-group">
              <label>Углеводы *</label>
              <input type="number" step="0.1" min="0" max="100" id="modal-carbs" required>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Категория *</label>
              <select id="modal-category" required>
                ${Object.entries(categoryLabels).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Готовность *</label>
              <select id="modal-cooking" required>
                ${Object.entries(cookingLabels).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Сохранить</button>
            <button type="button" class="btn btn-outline" id="modal-cancel">Отмена</button>
          </div>
          <div class="error-message" id="modal-error"></div>
        </form>
      </div>
    `;
        this.modalElement.querySelector('.close-modal')?.addEventListener('click', () => this.hide());
        this.overlay.addEventListener('click', () => this.hide());
        document.getElementById('modal-cancel')?.addEventListener('click', () => this.hide());
        const form = document.getElementById('modal-product-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const errorDiv = document.getElementById('modal-error');
            errorDiv.textContent = '';
            const name = document.getElementById('modal-name').value;
            const calories = parseFloat(document.getElementById('modal-calories').value);
            const proteins = parseFloat(document.getElementById('modal-proteins').value);
            const fats = parseFloat(document.getElementById('modal-fats').value);
            const carbs = parseFloat(document.getElementById('modal-carbs').value);
            const category = document.getElementById('modal-category').value;
            const cooking = document.getElementById('modal-cooking').value;
            if (proteins + fats + carbs > 100) {
                errorDiv.textContent = 'Сумма БЖУ превышает 100 г';
                return;
            }
            const dto = {
                name, calories, proteins, fats, carbohydrates: carbs,
                composition: null,
                category,
                cookingRequired: cooking,
                flags: [],
                photoUrls: [],
            };
            try {
                const product = await api.createProduct(dto);
                showNotification('Продукт создан', 'success');
                this.hide();
                this.onSave(product);
            }
            catch (err) {
                errorDiv.textContent = err.message;
            }
        });
    }
}
