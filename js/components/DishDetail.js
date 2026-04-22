import { api } from '../api.js';
import { categoryLabels, flagLabels } from '../utils.js';
import { navigate } from '../router.js';
export class DishDetailPage {
    constructor(container, params) {
        this.container = container;
        this.dishId = params.id;
    }
    async render() {
        try {
            const dish = await api.getDish(this.dishId);
            this.displayDish(dish);
        }
        catch (err) {
            this.container.innerHTML = `<p class="error">Ошибка: ${err.message}</p>`;
        }
    }
    displayDish(dish) {
        this.container.innerHTML = `
      <div class="detail-container">
        <div class="detail-header">
          <h2>${dish.name}</h2>
          <div class="detail-actions">
            <button class="btn btn-outline" id="edit-btn">Редактировать</button>
            <button class="btn btn-outline" id="back-btn">← Назад</button>
          </div>
        </div>

        <div class="detail-section">
          <h3>Пищевая ценность на порцию (${dish.portionSize} г)</h3>
          <p>Калорийность: ${dish.calories.toFixed(1)} ккал</p>
          <p>Белки: ${dish.proteins.toFixed(1)} г</p>
          <p>Жиры: ${dish.fats.toFixed(1)} г</p>
          <p>Углеводы: ${dish.carbohydrates.toFixed(1)} г</p>
        </div>

        <div class="detail-section">
          <h3>Состав</h3>
          <ul>
            ${dish.ingredients.map(ing => `<li>${ing.product.name} — ${ing.quantity} г</li>`).join('')}
          </ul>
        </div>

        <div class="detail-section">
          <h3>Характеристики</h3>
          <p><strong>Категория:</strong> ${categoryLabels[dish.category] || dish.category}</p>
          <p><strong>Флаги:</strong> ${dish.flags.map(f => flagLabels[f]).join(', ') || '—'}</p>
        </div>
      </div>
    `;
        document.getElementById('edit-btn')?.addEventListener('click', () => navigate(`/dishes/${dish.id}/edit`));
        document.getElementById('back-btn')?.addEventListener('click', () => navigate('/dishes'));
    }
}
