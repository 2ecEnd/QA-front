import { ProductCategoryLabels, CookingNecessityLabels, DishCategoryLabels, FlagLabels, } from './models.js';
import { escapeHtml, formatDate } from './utils.js';
// ─── Рендер списка продуктов ─────────────────
export function renderProductList(products, container) {
    if (products.length === 0) {
        container.innerHTML = '<div class="no-results">📭 Продукты не найдены.</div>';
        return;
    }
    container.innerHTML = products
        .map(p => {
        const photosHtml = p.Photos.length === 1
            ? `<img class="card-photo" src="${escapeHtml(p.Photos[0])}" alt="фото" loading="lazy" onerror="this.style.display='none'">`
            : p.Photos.length > 1
                ? `<div class="card-photos-row">${p.Photos.map(url => `<img src="${escapeHtml(url)}" alt="фото" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`
                : '';
        const flagsHtml = p.Flags.map(f => {
            const cls = f === 'VEGAN' ? 'vegan' : f === 'GLUTEN_FREE' ? 'gluten' : 'sugar';
            return `<span class="card-flag ${cls}">${FlagLabels[f]}</span>`;
        }).join('');
        return `
      <div class="card" data-id="${p.Id}" data-type="product">
        ${photosHtml}
        <div class="card-header">
          <span class="card-title">${escapeHtml(p.Name)}</span>
          <span class="card-badge">${ProductCategoryLabels[p.Category]}</span>
        </div>
        <div class="card-meta">
          <span>🔥 ${p.CalorieContent?.toFixed(1) ?? '—'} ккал</span>
          <span>Б: ${p.Proteins?.toFixed(1) ?? '—'}</span>
          <span>Ж: ${p.Fats?.toFixed(1) ?? '—'}</span>
          <span>У: ${p.Carbohydrates?.toFixed(1) ?? '—'}</span>
        </div>
        ${flagsHtml ? `<div class="card-flags">${flagsHtml}</div>` : ''}
        <!-- НОВЫЙ БЛОК -->
        <div class="card-actions">
          <button class="btn btn-outline btn-sm btn-edit" title="Редактировать">✏️</button>
          <button class="btn btn-danger btn-sm btn-delete" title="Удалить">🗑️</button>
        </div>
      </div>`;
    }).join('');
}
// ─── Рендер списка блюд ──────────────────────
export function renderDishList(dishes, container) {
    if (dishes.length === 0) {
        container.innerHTML = '<div class="no-results">🍽️ Блюда не найдены.</div>';
        return;
    }
    container.innerHTML = dishes
        .map(d => {
        const photosHtml = d.Photos.length === 1
            ? `<img class="card-photo" src="${escapeHtml(d.Photos[0])}" alt="фото" loading="lazy" onerror="this.style.display='none'">`
            : d.Photos.length > 1
                ? `<div class="card-photos-row">${d.Photos.map(url => `<img src="${escapeHtml(url)}" alt="фото" loading="lazy" onerror="this.style.display='none'">`).join('')}</div>`
                : '';
        const flagsHtml = d.Flags.map(f => {
            const cls = f === 'VEGAN' ? 'vegan' : f === 'GLUTEN_FREE' ? 'gluten' : 'sugar';
            return `<span class="card-flag ${cls}">${FlagLabels[f]}</span>`;
        }).join('');
        return `
      <div class="card" data-id="${d.Id}" data-type="dish">
        ${photosHtml}
        <div class="card-header">
          <span class="card-title">${escapeHtml(d.Name)}</span>
          <span class="card-badge">${DishCategoryLabels[d.Category]}</span>
        </div>
        <div class="card-meta">
          <span>🔥 ${d.CalorieContent?.toFixed(1) ?? '—'} ккал/порц</span>
          <span>Б: ${d.Proteins?.toFixed(1) ?? '—'}</span>
          <span>Ж: ${d.Fats?.toFixed(1) ?? '—'}</span>
          <span>У: ${d.Carbohydrates?.toFixed(1) ?? '—'}</span>
          <span>⚖️ ${d.Size?.toFixed(0) ?? '—'} г</span>
        </div>
        ${flagsHtml ? `<div class="card-flags">${flagsHtml}</div>` : ''}
        <!-- НОВЫЙ БЛОК -->
        <div class="card-actions">
          <button class="btn btn-outline btn-sm btn-edit" title="Редактировать">✏️</button>
          <button class="btn btn-danger btn-sm btn-delete" title="Удалить">🗑️</button>
        </div>
      </div>`;
    }).join('');
}
// ─── Модальные окна ──────────────────────────
export function openModal(html) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    content.innerHTML = html;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}
export function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.style.display = 'none';
    document.getElementById('modalContent').innerHTML = '';
    document.body.style.overflow = '';
}
// ─── Детальные просмотры ─────────────────────
export function viewProductDetail(product) {
    const flags = product.Flags.map(f => FlagLabels[f]).join(', ') || '—';
    const photos = product.Photos.map(url => `<img src="${escapeHtml(url)}" style="max-width:100%;border-radius:8px;margin:4px 0;" onerror="this.style.display='none'">`).join('');
    const html = `
    <div class="modal-header">
      <h3>🍎 ${escapeHtml(product.Name)}</h3>
      <button class="modal-close" onclick="window._closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${photos ? `<div style="margin-bottom:16px;">${photos}</div>` : ''}
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">Калорийность</span><div class="detail-value">${product.CalorieContent?.toFixed(1)} ккал / 100 г</div></div>
        <div class="detail-item"><span class="detail-label">Белки</span><div class="detail-value">${product.Proteins?.toFixed(1)} г</div></div>
        <div class="detail-item"><span class="detail-label">Жиры</span><div class="detail-value">${product.Fats?.toFixed(1)} г</div></div>
        <div class="detail-item"><span class="detail-label">Углеводы</span><div class="detail-value">${product.Carbohydrates?.toFixed(1)} г</div></div>
        <div class="detail-item"><span class="detail-label">Категория</span><div class="detail-value">${ProductCategoryLabels[product.Category]}</div></div>
        <div class="detail-item"><span class="detail-label">Готовность</span><div class="detail-value">${CookingNecessityLabels[product.CookingNecessity]}</div></div>
        <div class="detail-item detail-full"><span class="detail-label">Состав</span><div class="detail-value">${escapeHtml(product.Composition || '—')}</div></div>
        <div class="detail-item"><span class="detail-label">Флаги</span><div class="detail-value">${flags}</div></div>
        <div class="detail-item"><span class="detail-label">Создан</span><div class="detail-value">${formatDate(product.CreationDate)}</div></div>
        <div class="detail-item"><span class="detail-label">Изменён</span><div class="detail-value">${formatDate(product.EditDate)}</div></div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="window._closeModal()">Закрыть</button>
    </div>`;
    openModal(html);
}
export function viewDishDetail(dish) {
    const flags = dish.Flags.map(f => FlagLabels[f]).join(', ') || '—';
    const photos = dish.Photos.map(url => `<img src="${escapeHtml(url)}" style="max-width:100%;border-radius:8px;margin:4px 0;" onerror="this.style.display='none'">`).join('');
    const compHtml = dish.Composition.map(ing => `<div class="detail-item"><span class="detail-label">Продукт</span><div class="detail-value">${escapeHtml(ing.ProductName)} — ${ing.Amount?.toFixed(1)} г</div></div>`).join('');
    const bjuPer100 = dish.Size > 0 ? ((dish.Proteins + dish.Fats + dish.Carbohydrates) / dish.Size) * 100 : 0;
    const html = `
    <div class="modal-header">
      <h3>🍽️ ${escapeHtml(dish.Name)}</h3>
      <button class="modal-close" onclick="window._closeModal()">✕</button>
    </div>
    <div class="modal-body">
      ${photos ? `<div style="margin-bottom:16px;">${photos}</div>` : ''}
      <div class="detail-grid">
        <div class="detail-item"><span class="detail-label">Калорийность</span><div class="detail-value">${dish.CalorieContent?.toFixed(1)} ккал / порция</div></div>
        <div class="detail-item"><span class="detail-label">Размер порции</span><div class="detail-value">${dish.Size?.toFixed(1)} г</div></div>
        <div class="detail-item"><span class="detail-label">Белки</span><div class="detail-value">${dish.Proteins?.toFixed(1)} г / порция</div></div>
        <div class="detail-item"><span class="detail-label">Жиры</span><div class="detail-value">${dish.Fats?.toFixed(1)} г / порция</div></div>
        <div class="detail-item"><span class="detail-label">Углеводы</span><div class="detail-value">${dish.Carbohydrates?.toFixed(1)} г / порция</div></div>
        <div class="detail-item"><span class="detail-label">БЖУ на 100 г</span><div class="detail-value">${bjuPer100.toFixed(1)} г</div></div>
        <div class="detail-item"><span class="detail-label">Категория</span><div class="detail-value">${DishCategoryLabels[dish.Category]}</div></div>
        <div class="detail-item"><span class="detail-label">Флаги</span><div class="detail-value">${flags}</div></div>
        <div class="detail-item"><span class="detail-label">Создан</span><div class="detail-value">${formatDate(dish.CreationDate)}</div></div>
        <div class="detail-item"><span class="detail-label">Изменён</span><div class="detail-value">${formatDate(dish.EditDate)}</div></div>
      </div>
      <h4 style="margin-top:16px;">Состав:</h4>
      <div class="detail-grid" style="margin-top:8px;">${compHtml || '<div class="detail-item detail-full"><span class="detail-label">—</span></div>'}</div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="window._closeModal()">Закрыть</button>
    </div>`;
    openModal(html);
}
/**
 * Показывает простое информационное/предупреждающее модальное окно
 */
export function showAlertModal(title, message, type = 'warning') {
    const icon = type === 'warning' ? '⚠️' : 'ℹ️';
    const html = `
    <div class="modal-header">
      <h3>${icon} ${escapeHtml(title)}</h3>
      <button class="modal-close" type="button" onclick="window._closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" onclick="window._closeModal()">Понятно</button>
    </div>`;
    openModal(html);
}
//# sourceMappingURL=ui.js.map