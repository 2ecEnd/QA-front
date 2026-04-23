// ===== ДЕТАЛИ БЛЮДА =====
import { api } from '../api.js';
import { categoryLabels, flagLabels, formatNumber } from '../utils.js';
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
        const photosHtml = dish.photoUrls.length > 0
            ? `<div class="photo-gallery">${dish.photoUrls.map(url => `<img src="${url}" alt="фото блюда">`).join('')}</div>`
            : '<p class="muted">Нет фотографий</p>';
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
          <h3>Пищевая ценность на порцию (${formatNumber(dish.portionSize)} г)</h3>
          <p>Калорийность: ${formatNumber(dish.calories)} ккал</p>
          <p>Белки: ${formatNumber(dish.proteins)} г</p>
          <p>Жиры: ${formatNumber(dish.fats)} г</p>
          <p>Углеводы: ${formatNumber(dish.carbohydrates)} г</p>
        </div>

        <div class="detail-section">
          <h3>Состав</h3>
          <ul>
            ${dish.ingredients.map(ing => `<li>${ing.product.name} — ${formatNumber(ing.quantity)} г</li>`).join('')}
          </ul>
        </div>

        <div class="detail-section">
          <h3>Характеристики</h3>
          <p><strong>Категория:</strong> ${categoryLabels[dish.category] || dish.category}</p>
          <p><strong>Флаги:</strong> ${dish.flags.map(f => flagLabels[f]).join(', ') || '—'}</p>
        </div>

        <div class="detail-section">
          <h3>Фотографии</h3>
          ${photosHtml}
        </div>
      </div>
    `;
        document.getElementById('edit-btn')?.addEventListener('click', () => navigate(`/dishes/${dish.id}/edit`));
        document.getElementById('back-btn')?.addEventListener('click', () => navigate('/dishes'));
    }
}
