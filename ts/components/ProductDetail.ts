import { api } from '../api.js';
import { Product } from '../types.js';
import { categoryLabels, cookingLabels, flagLabels } from '../utils.js';
import { navigate } from '../router.js';

export class ProductDetailPage {
  private container: HTMLElement;
  private productId: string;

  constructor(container: HTMLElement, params: { id: string }) {
    this.container = container;
    this.productId = params.id;
  }

  async render() {
    try {
      const product = await api.getProduct(this.productId);
      this.displayProduct(product);
    } catch (err: any) {
      this.container.innerHTML = `<p class="error">Ошибка загрузки продукта: ${err.message}</p>`;
    }
  }

  private displayProduct(product: Product) {
    this.container.innerHTML = `
      <div class="detail-container">
        <div class="detail-header">
          <h2>${product.name}</h2>
          <div class="detail-actions">
            <button class="btn btn-outline" id="edit-btn">Редактировать</button>
            <button class="btn btn-outline" id="back-btn">← Назад</button>
          </div>
        </div>

        <div class="detail-section">
          <h3>Пищевая ценность (на 100 г)</h3>
          <p>Калорийность: ${product.calories.toFixed(1)} ккал</p>
          <p>Белки: ${product.proteins.toFixed(1)} г</p>
          <p>Жиры: ${product.fats.toFixed(1)} г</p>
          <p>Углеводы: ${product.carbohydrates.toFixed(1)} г</p>
        </div>

        <div class="detail-section">
          <h3>Характеристики</h3>
          <p><strong>Категория:</strong> ${categoryLabels[product.category] || product.category}</p>
          <p><strong>Готовность:</strong> ${cookingLabels[product.cookingRequired] || product.cookingRequired}</p>
          <p><strong>Флаги:</strong> ${product.flags.map(f => flagLabels[f] || f).join(', ') || '—'}</p>
          ${product.composition ? `<p><strong>Состав:</strong> ${product.composition}</p>` : ''}
        </div>

        <div class="detail-section">
          <h3>Системная информация</h3>
          <p>Создан: ${new Date(product.createdAt).toLocaleString()}</p>
          ${product.updatedAt ? `<p>Обновлён: ${new Date(product.updatedAt).toLocaleString()}</p>` : ''}
        </div>
      </div>
    `;

    document.getElementById('edit-btn')?.addEventListener('click', () => {
      navigate(`/products/${product.id}/edit`);
    });
    document.getElementById('back-btn')?.addEventListener('click', () => {
      navigate('/products');
    });
  }
}