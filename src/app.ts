// src/app.ts
import {
  ProductCategory,
  CookingNecessity,
  DishCategory,
  Flag,
  SortField,
  MacroMap,
  MacroRegex,
  ProductCategoryLabels,
  CookingNecessityLabels,
  DishCategoryLabels,
  FlagLabels,
} from './models.js';
import type {
  ProductDto,
  DishDto,
  IngredientDto,
  CreateProductRequest,
  ChangeProductRequest,
  CreateDishRequest,
  ChangeDishRequest,
} from './models.js';
import * as api from './api.js';
import * as ui from './ui.js';
import { showToast, debounce, getElement, getAllElements, escapeHtml } from './utils.js';
import { calculateNutrition } from './nutrition.js';


// -=-=-=-=-=-=-=-=-=-=- Глобальное состояние -=-=-=-=-=-=-=-=-=-=-
let products: ProductDto[] = [];
let dishes: DishDto[] = [];

const productFilters = {
  search: '',
  category: '' as ProductCategory | '',
  cookingNecessity: '' as CookingNecessity | '',
  flags: [] as Flag[],
  sort: '' as SortField | '',
};

const dishFilters = {
  search: '',
  category: '' as DishCategory | '',
  flags: [] as Flag[],
};


// -=-=-=-=-=-=-=-=-=-=- Вспомогательные функции -=-=-=-=-=-=-=-=-=-=-

// Загрузка продуктов с текущими фильтрами и рендер
async function loadAndRenderProducts() {
  try {
    products = await api.fetchProducts(
      productFilters.category || undefined,
      productFilters.cookingNecessity || undefined,
      productFilters.flags.length ? productFilters.flags : undefined,
      productFilters.search || undefined,
      productFilters.sort || undefined,
    );
    ui.renderProductList(products, getElement('#productList'));
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

// Загрузка блюд с текущими фильтрами и рендер
async function loadAndRenderDishes() {
  try {
    dishes = await api.fetchDishes(
      dishFilters.category || undefined,
      dishFilters.flags.length ? dishFilters.flags : undefined,
      dishFilters.search || undefined,
    );
    ui.renderDishList(dishes, getElement('#dishList'));
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

// Загрузка нескольких изображений (до лимита в 5)
async function uploadMultipleImages(files: File[], existingUrls: string[] = []): Promise<string[]> {
  const urls = [...existingUrls];
  for (const file of files) {
    if (urls.length >= 5) break;
    try {
      const result = await api.uploadImage(file);
      urls.push(result.url);
    } catch (e: any) {
      showToast('Ошибка загрузки: ' + e.message, 'error');
    }
  }
  return urls;
}

function renderPhotoPreviews(container: HTMLElement, photos: string[], onRemove: (index: number) => void) {
  container.innerHTML = photos.map((url, index) => `
    <div class="photo-preview-wrapper" style="position: relative; display: inline-block;">
      <img src="${escapeHtml(url)}" class="photo-preview-item" alt="preview" onerror="this.style.display='none'">
      <button type="button" class="photo-remove-btn" data-index="${index}" 
              style="position: absolute; top: -8px; right: -8px; background: #c0392b; color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; font-size: 14px; line-height: 1;">✕</button>
    </div>
  `).join('');

  container.querySelectorAll('.photo-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt((btn as HTMLElement).dataset.index!);
      onRemove(idx);
    });
  });
}


// -=-=-=-=-=-=-=-=-=-=- Действия с продуктами и блюдами -=-=-=-=-=-=-=-=-=-=-

async function viewProduct(id: string) {
  try {
    const product = await api.getProduct(id);
    ui.viewProductDetail(product);
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

async function editProduct(id: string) {
  try {
    const product = await api.getProduct(id);
    buildAndOpenProductForm(product);
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

async function deleteProduct(id: string) {
  try {
    const result = await api.deleteProduct(id);
    if (result.Acknowledge) {
      showToast('Продукт удалён');
      await loadAndRenderProducts();
    } else {
      const dishNames = result.Dishes?.map(d => d.Name).join(', ') || '';
      showToast(
        `Невозможно удалить продукт – он используется в блюдах: ${dishNames}`,
        'error'
      );
    }
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

async function viewDish(id: string) {
  try {
    const dish = await api.getDish(id);
    ui.viewDishDetail(dish);
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

async function editDish(id: string) {
  try {
    if (products.length === 0) await loadAndRenderProducts();
    const dish = await api.getDish(id);
    buildAndOpenDishForm(dish);
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

async function deleteDish(id: string) {
  try {
    await api.deleteDish(id);
    showToast('Блюдо удалено');
    await loadAndRenderDishes();
  } catch (e: any) {
    showToast(e.message, 'error');
  }
}

// -=-=-=-=-=-=-=-=-=-=- Форма продукта -=-=-=-=-=-=-=-=-=-=-

function buildAndOpenProductForm(existing?: ProductDto) {
  const isEdit = !!existing;
  const name = existing?.Name ?? '';
  const photos = existing?.Photos ?? [];
  const flags = existing?.Flags ?? [];

  const html = `
    <div class="modal-header">
      <h3>${isEdit ? 'Редактирование продукта' : 'Новый продукт'}</h3>
      <button class="modal-close" type="button" onclick="window._closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="productForm" autocomplete="off">
        <div class="form-group">
          <label><span class="required">*</span> Название (мин. 2 символа)</label>
          <input type="text" class="form-input" name="Name" value="${escapeHtml(name)}" required minlength="2" maxlength="200">
        </div>
        <div class="form-group">
          <label>Фотографии (макс. 5)</label>
          <div class="photo-upload-wrapper">
            <input type="file" id="productPhotoInput" accept="image/*" multiple style="display:none;">
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('productPhotoInput').click()">📷 Выбрать фото</button>
            <span class="form-hint" id="photoCount">${photos.length}/5</span>
          </div>
          <div class="photo-previews" id="photoPreviews"></div>
          <input type="hidden" id="existingPhotos" value='${JSON.stringify(photos)}'>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label><span class="required">*</span> Калорийность (ккал / 100 г)</label>
            <input type="number" class="form-input" name="CalorieContent" value="${existing?.CalorieContent ?? ''}" required min="0" step="any">
          </div>
          <div class="form-group">
            <label><span class="required">*</span> Белки (г / 100 г, 0–100)</label>
            <input type="number" class="form-input bju-input" name="Proteins" value="${existing?.Proteins ?? ''}" required min="0" max="100" step="any">
          </div>
          <div class="form-group">
            <label><span class="required">*</span> Жиры (г / 100 г, 0–100)</label>
            <input type="number" class="form-input bju-input" name="Fats" value="${existing?.Fats ?? ''}" required min="0" max="100" step="any">
          </div>
          <div class="form-group">
            <label><span class="required">*</span> Углеводы (г / 100 г, 0–100)</label>
            <input type="number" class="form-input bju-input" name="Carbohydrates" value="${existing?.Carbohydrates ?? ''}" required min="0" max="100" step="any">
          </div>
        </div>
        <div class="form-group">
          <span class="form-error" id="bjuError" style="display:none;">Сумма БЖУ на 100 г не может превышать 100!</span>
        </div>
        <div class="form-group">
          <label>Состав (опционально)</label>
          <textarea class="form-textarea" name="Composition">${escapeHtml(existing?.Composition ?? '')}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label><span class="required">*</span> Категория</label>
            <select class="form-input" name="Category" required>
              ${Object.values(ProductCategory).map(cat => `<option value="${cat}" ${existing?.Category === cat ? 'selected' : ''}>${ProductCategoryLabels[cat]}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label><span class="required">*</span> Необходимость готовки</label>
            <select class="form-input" name="CookingNecessity" required>
              ${Object.values(CookingNecessity).map(cn => `<option value="${cn}" ${existing?.CookingNecessity === cn ? 'selected' : ''}>${CookingNecessityLabels[cn]}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Дополнительные флаги</label>
          <div class="checkbox-group">
            ${Object.values(Flag).map(f => `
              <label class="checkbox-label">
                <input type="checkbox" name="Flag_${f}" value="${f}" ${flags.includes(f) ? 'checked' : ''}> ${FlagLabels[f]}
              </label>`).join('')}
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" type="button" onclick="window._closeModal()">Отмена</button>
      <button class="btn btn-primary" id="btnSubmitProduct">${isEdit ? 'Сохранить' : 'Создать'}</button>
    </div>`;

  ui.openModal(html);

  // Навешиваем обработчики
  attachProductFormHandlers(isEdit, existing?.Id, photos);
}

function attachProductFormHandlers(isEdit: boolean, existingId: string | undefined, existingPhotos: string[]) {
  const form = getElement<HTMLFormElement>('#productForm');
  const bjuError = getElement('#bjuError');
  const previewsContainer = getElement('#photoPreviews');
  const countEl = getElement('#photoCount');
  const photoInput = getElement<HTMLInputElement>('#productPhotoInput');

  // Накопительный список выбранных (но ещё не загруженных) файлов
  let selectedFiles: File[] = [];

  /** Обновляет превью и счётчик, использует renderPhotoPreviews */
  function updatePhotoPreview() {
    const allPhotos: string[] = [
      ...existingPhotos,
      ...selectedFiles.map(file => URL.createObjectURL(file))
    ];
    const total = allPhotos.length;
    countEl.textContent = `${total}/5`;

    renderPhotoPreviews(previewsContainer, allPhotos, (index: number) => {
      if (index < existingPhotos.length) {
        // Удаляем существующую фотографию (URL)
        existingPhotos.splice(index, 1);
      } else {
        // Удаляем локальный файл
        const fileIndex = index - existingPhotos.length;
        selectedFiles.splice(fileIndex, 1);
      }
      updatePhotoPreview(); // Перерисовать
    });
  }

  // Первоначальное отображение
  updatePhotoPreview();

  // Валидация БЖУ
  const bjuInputs = form.querySelectorAll<HTMLInputElement>('.bju-input');
  bjuInputs.forEach(input => {
    input.addEventListener('input', () => {
      const prot = parseFloat((form.querySelector<HTMLInputElement>('input[name="Proteins"]')?.value) ?? '0');
      const fat = parseFloat((form.querySelector<HTMLInputElement>('input[name="Fats"]')?.value) ?? '0');
      const carb = parseFloat((form.querySelector<HTMLInputElement>('input[name="Carbohydrates"]')?.value) ?? '0');
      bjuError.style.display = (prot + fat + carb > 100) ? 'block' : 'none';
    });
  });

  // Обработчик выбора файлов
  photoInput.addEventListener('change', () => {
    const files = Array.from(photoInput.files || []);
    const remaining = 5 - existingPhotos.length - selectedFiles.length;
    if (remaining <= 0) {
      showToast('Максимум 5 фотографий', 'warning');
      photoInput.value = '';
      return;
    }
    const toAdd = files.slice(0, remaining);
    selectedFiles.push(...toAdd);
    photoInput.value = ''; // сбрасываем input, чтобы можно было выбрать тот же файл повторно
    updatePhotoPreview();
  });

  // Отправка формы
  const submitBtn = getElement('#btnSubmitProduct');
  submitBtn.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const formData = new FormData(form);
    const bjuSum =
      (parseFloat(formData.get('Proteins') as string) || 0) +
      (parseFloat(formData.get('Fats') as string) || 0) +
      (parseFloat(formData.get('Carbohydrates') as string) || 0);
    if (bjuSum > 100) {
      bjuError.style.display = 'block';
      return;
    }

    const selectedFlags: Flag[] = [];
    Object.values(Flag).forEach(f => {
      if (formData.get(`Flag_${f}`)) selectedFlags.push(f);
    });

    // Загружаем накопленные локальные файлы
    let photos = existingPhotos;
    if (selectedFiles.length > 0) {
      const uploadedUrls = await uploadMultipleImages(selectedFiles);
      photos = [...existingPhotos, ...uploadedUrls];
    }

    const payload: CreateProductRequest = {
      Name: formData.get('Name') as string,
      Photos: photos,
      CalorieContent: parseFloat(formData.get('CalorieContent') as string),
      Proteins: parseFloat(formData.get('Proteins') as string),
      Fats: parseFloat(formData.get('Fats') as string),
      Carbohydrates: parseFloat(formData.get('Carbohydrates') as string),
      Composition: (formData.get('Composition') as string) || null,
      Category: formData.get('Category') as ProductCategory,
      CookingNecessity: formData.get('CookingNecessity') as CookingNecessity,
      Flags: selectedFlags.length ? selectedFlags : null,
    };

    try {
      if (isEdit && existingId) {
        const changeReq: ChangeProductRequest = {
          ...payload,
          CookingNecessity: payload.CookingNecessity,
        };
        await api.updateProduct(existingId, changeReq);
        showToast('Продукт обновлён');
      } else {
        await api.createProduct(payload);
        showToast('Продукт создан');
      }
      ui.closeModal();
      await loadAndRenderProducts();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  });
}


// -=-=-=-=-=-=-=-=-=-=- Форма блюда -=-=-=-=-=-=-=-=-=-=-

function buildAndOpenDishForm(existing?: DishDto) {
  const isEdit = !!existing;
  const name = existing?.Name ?? '';
  const photos = existing?.Photos ?? [];
  const flags = existing?.Flags ?? [];
  const composition = existing?.Composition ?? [];
  const size = existing?.Size ?? 0;
  const category = existing?.Category ?? DishCategory.SECOND;

  // Опции для выпадающих списков продуктов
  const productOptions = products.map(p =>
    `<option value="${p.Id}" data-name="${escapeHtml(p.Name)}" data-cal="${p.CalorieContent}" data-prot="${p.Proteins}" data-fat="${p.Fats}" data-carb="${p.Carbohydrates}" data-flags='${JSON.stringify(p.Flags)}'>${escapeHtml(p.Name)} (🔥${p.CalorieContent.toFixed(0)})</option>`
  ).join('');

  const compositionRows = composition.map((ing, i) => `
    <div class="composition-row" data-index="${i}">
      <select class="comp-product" required>
        <option value="">— Выберите продукт —</option>
        ${productOptions.replace(`value="${ing.ProductId}"`, `value="${ing.ProductId}" selected`)}
      </select>
      <input type="number" class="comp-amount" value="${ing.Amount}" placeholder="г" required min="0.01" step="any">
      <button type="button" class="btn btn-danger btn-icon btn-sm comp-remove" title="Удалить">✕</button>
    </div>`).join('');

  const html = `
    <div class="modal-header">
      <h3>${isEdit ? 'Редактирование блюда' : 'Новое блюдо'}</h3>
      <button class="modal-close" type="button" onclick="window._closeModal()">✕</button>
    </div>
    <div class="modal-body">
      <form id="dishForm" autocomplete="off">
        <div class="form-group">
          <label><span class="required">*</span> Название (мин. 2 символа)</label>
          <input type="text" class="form-input" name="Name" id="dishNameInput" value="${escapeHtml(name)}" required minlength="2" maxlength="200">
          <span class="form-hint">Макросы: !десерт, !первое, !второе, !напиток, !салат, !суп, !перекус (авто-категория)</span>
        </div>
        <div class="form-group">
          <label>Фотографии (макс. 5)</label>
          <div class="photo-upload-wrapper">
            <input type="file" id="dishPhotoInput" accept="image/*" multiple style="display:none;">
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('dishPhotoInput').click()">📷 Выбрать фото</button>
            <span class="form-hint" id="dishPhotoCount">${photos.length}/5</span>
          </div>
          <div class="photo-previews" id="dishPhotoPreviews">
            ${photos.map(url => `<img src="${escapeHtml(url)}" class="photo-preview-item" alt="preview" onerror="this.style.display='none'">`).join('')}
          </div>
          <input type="hidden" id="existingDishPhotos" value='${JSON.stringify(photos)}'>
        </div>
        <div class="form-group">
          <label><span class="required">*</span> Состав блюда (минимум 1 продукт)</label>
          <div id="compositionContainer">
            ${compositionRows || `<div class="composition-row" data-index="0">
              <select class="comp-product" required><option value="">— Выберите продукт —</option>${productOptions}</select>
              <input type="number" class="comp-amount" placeholder="г" required min="0.01" step="any">
              <button type="button" class="btn btn-danger btn-icon btn-sm comp-remove" title="Удалить">✕</button>
            </div>`}
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="btnAddCompositionRow" style="margin-top:8px;">+ Добавить продукт</button>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Калорийность (ккал / порция) <span class="form-hint">(авто-расчёт)</span></label>
            <input type="number" class="form-input" name="CalorieContent" id="dishCalorieContent" value="${existing?.CalorieContent ?? ''}" required min="0" step="any">
          </div>
          <div class="form-group">
            <label>Белки (г / порция)</label>
            <input type="number" class="form-input" name="Proteins" id="dishProteins" value="${existing?.Proteins ?? ''}" required min="0" max="100" step="any">
          </div>
          <div class="form-group">
            <label>Жиры (г / порция)</label>
            <input type="number" class="form-input" name="Fats" id="dishFats" value="${existing?.Fats ?? ''}" required min="0" max="100" step="any">
          </div>
          <div class="form-group">
            <label>Углеводы (г / порция)</label>
            <input type="number" class="form-input" name="Carbohydrates" id="dishCarbohydrates" value="${existing?.Carbohydrates ?? ''}" required min="0" max="100" step="any">
          </div>
        </div>
        <div class="form-group">
          <span class="form-error" id="dishBjuError" style="display:none;">Сумма БЖУ на 100 г блюда не может превышать 100! (Рассчитывается как БЖУ порции / размер порции × 100)</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label><span class="required">*</span> Размер порции (г, > 0)</label>
            <input type="number" class="form-input" name="Size" id="dishSize" value="${size || ''}" required min="0.01" step="any">
          </div>
          <div class="form-group">
            <label><span class="required">*</span> Категория</label>
            <select class="form-input" name="Category" id="dishCategorySelect" required>
              ${Object.values(DishCategory).map(cat => `<option value="${cat}" ${category === cat ? 'selected' : ''}>${DishCategoryLabels[cat]}</option>`).join('')}
            </select>
            <span class="form-hint" id="macroHint" style="display:none;"></span>
          </div>
        </div>
        <div class="form-group">
          <label>Дополнительные флаги (определяются составом)</label>
          <div class="checkbox-group" id="dishFlagsGroup">
            ${Object.values(Flag).map(f => {
              const canSet = checkDishFlagAvailability(f, composition);
              const isChecked = flags.includes(f) && canSet;
              return `
                <label class="checkbox-label ${canSet ? '' : 'disabled'}" id="dishFlagLabel_${f}">
                  <input type="checkbox" name="Flag_${f}" value="${f}" ${isChecked ? 'checked' : ''} ${canSet ? '' : 'disabled'}> ${FlagLabels[f]}
                </label>`;
            }).join('')}
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-outline" type="button" onclick="window._closeModal()">Отмена</button>
      <button class="btn btn-primary" id="btnSubmitDish">${isEdit ? 'Сохранить' : 'Создать'}</button>
    </div>`;

  ui.openModal(html);
  attachDishFormHandlers(isEdit, existing?.Id, photos);
}

// Проверка возможности установки флага блюда на основе состава
function checkDishFlagAvailability(flag: Flag, composition: IngredientDto[]): boolean {
  if (!composition.length) return false;
  return composition.every(ing => {
    const prod = products.find(p => p.Id === ing.ProductId);
    return prod && prod.Flags.includes(flag);
  });
}

// Получение текущего состава из DOM
function getCompositionData(): IngredientDto[] {
  const rows = getAllElements<HTMLDivElement>('#compositionContainer .composition-row');
  const composition: IngredientDto[] = [];
  rows.forEach(row => {
    const select = row.querySelector<HTMLSelectElement>('.comp-product');
    const amountInput = row.querySelector<HTMLInputElement>('.comp-amount');
    if (select && select.value && amountInput && parseFloat(amountInput.value) > 0) {
      const option = select.selectedOptions[0];
      composition.push({
        ProductId: select.value,
        ProductName: option.dataset.name || option.textContent?.split(' (')[0] || '',
        Amount: parseFloat(amountInput.value),
      });
    }
  });
  return composition;
}

// Пересчёт КБЖУ блюда на основе состава
function recalculateDishKbju() {
  const rows = getAllElements<HTMLDivElement>('#compositionContainer .composition-row');
  const ingredients: IngredientDto[] = [];
  const productMap = new Map<string, ProductDto>();

  // Собираем данные из DOM
  for (const row of rows) {
    const select = row.querySelector<HTMLSelectElement>('.comp-product');
    const amountInput = row.querySelector<HTMLInputElement>('.comp-amount');
    if (!select || !select.value || !amountInput) continue;

    const productId = select.value;
    const amount = parseFloat(amountInput.value) || 0;
    if (amount <= 0) continue;

    // Находим продукт в уже загруженном массиве products
    const product = products.find(p => p.Id === productId);
    if (!product) continue;

    ingredients.push({
      ProductId: productId,
      ProductName: product.Name,
      Amount: amount,
    });
    productMap.set(productId, product);
  }

  // Чистый расчёт
  const nutrition = calculateNutrition(ingredients, productMap);

  // Заполняем поля формы
  const calInput = getElement<HTMLInputElement>('#dishCalorieContent');
  const protInput = getElement<HTMLInputElement>('#dishProteins');
  const fatInput = getElement<HTMLInputElement>('#dishFats');
  const carbInput = getElement<HTMLInputElement>('#dishCarbohydrates');
  calInput.value = nutrition.calorieContent.toFixed(1);
  protInput.value = nutrition.proteins.toFixed(1);
  fatInput.value = nutrition.fats.toFixed(1);
  carbInput.value = nutrition.carbohydrates.toFixed(1);

  updateDishFlagAvailability();
}

// Обновление доступности флагов блюда в зависимости от состава
function updateDishFlagAvailability() {
  const composition = getCompositionData();
  Object.values(Flag).forEach(f => {
    const label = getElement(`#dishFlagLabel_${f}`);
    const checkbox = getElement<HTMLInputElement>(`input[name="Flag_${f}"]`);
    const canSet = checkDishFlagAvailability(f, composition);
    if (canSet) {
      label.classList.remove('disabled');
      checkbox.disabled = false;
    } else {
      label.classList.add('disabled');
      checkbox.disabled = true;
      checkbox.checked = false;
    }
  });
}

function attachDishFormHandlers(isEdit: boolean, existingId: string | undefined, existingPhotos: string[]) {
  const form = getElement<HTMLFormElement>('#dishForm');
  const compContainer = getElement('#compositionContainer');
  const btnAddRow = getElement('#btnAddCompositionRow');
  const photoInput = getElement<HTMLInputElement>('#dishPhotoInput');
  const dishSize = getElement<HTMLInputElement>('#dishSize');
  const nameInput = getElement<HTMLInputElement>('#dishNameInput');
  const categorySelect = getElement<HTMLSelectElement>('#dishCategorySelect');
  const macroHint = getElement('#macroHint');
  const previewsContainer = getElement('#dishPhotoPreviews');
  const countEl = getElement('#dishPhotoCount');

  let selectedFiles: File[] = [];

  // Добавление строки состава
  btnAddRow.addEventListener('click', () => {
    const productOptions = products.map(p =>
      `<option value="${p.Id}" data-name="${escapeHtml(p.Name)}" data-cal="${p.CalorieContent}" data-prot="${p.Proteins}" data-fat="${p.Fats}" data-carb="${p.Carbohydrates}" data-flags='${JSON.stringify(p.Flags)}'>${escapeHtml(p.Name)} (🔥${p.CalorieContent.toFixed(0)})</option>`
    ).join('');
    const row = document.createElement('div');
    row.className = 'composition-row';
    row.innerHTML = `
      <select class="comp-product" required>
        <option value="">— Выберите продукт —</option>
        ${productOptions}
      </select>
      <input type="number" class="comp-amount" placeholder="г" required min="0.01" step="0.01">
      <button type="button" class="btn btn-danger btn-icon btn-sm comp-remove" title="Удалить">✕</button>`;
    compContainer.appendChild(row);
  });

  // Удаление строки состава
  compContainer.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.comp-remove');
    if (btn) {
      const rows = compContainer.querySelectorAll('.composition-row');
      if (rows.length > 1) {
        btn.closest('.composition-row')!.remove();
        recalculateDishKbju();
      }
    }
  });

  // Автопересчёт при изменении состава или размера порции
  compContainer.addEventListener('change', (e) => {
    if ((e.target as HTMLElement).matches('.comp-product, .comp-amount')) {
      recalculateDishKbju();
    }
  });
  compContainer.addEventListener('input', (e) => {
    if ((e.target as HTMLElement).matches('.comp-amount')) {
      recalculateDishKbju();
    }
  });

  // Валидация при ручном изменении БЖУ
  ['dishCalorieContent', 'dishProteins', 'dishFats', 'dishCarbohydrates'].forEach(id => {
    const el = document.getElementById(id);
  });

  // Макросы в названии
  let categoryExplicitlySet = false;
  categorySelect.addEventListener('change', () => { categoryExplicitlySet = true; });
  nameInput.addEventListener('input', () => {
    const match = nameInput.value.match(MacroRegex);
    if (match && !categoryExplicitlySet) {
      const macroKey = match[0].toLowerCase();
      const category = MacroMap[macroKey];
      if (category) {
        macroHint.textContent = `Обнаружен макрос "${match[0]}" → категория "${DishCategoryLabels[category]}"`;
        macroHint.style.display = 'block';
        categorySelect.value = category;
      }
    } else {
      macroHint.style.display = 'none';
    }
  });

  /** Обновление превью фотографий блюда */
  function updateDishPhotoPreview() {
    const allPhotos: string[] = [
      ...existingPhotos,
      ...selectedFiles.map(file => URL.createObjectURL(file))
    ];
    countEl.textContent = `${allPhotos.length}/5`;
    renderPhotoPreviews(previewsContainer, allPhotos, (index: number) => {
      if (index < existingPhotos.length) {
        existingPhotos.splice(index, 1);
      } else {
        const fileIndex = index - existingPhotos.length;
        selectedFiles.splice(fileIndex, 1);
      }
      updateDishPhotoPreview();
    });
  }

  // Первичное отображение
  updateDishPhotoPreview();

  // Обработчик выбора файлов
  photoInput.addEventListener('change', () => {
    const files = Array.from(photoInput.files || []);
    const remaining = 5 - existingPhotos.length - selectedFiles.length;
    if (remaining <= 0) {
      showToast('Максимум 5 фотографий', 'warning');
      photoInput.value = '';
      return;
    }
    const toAdd = files.slice(0, remaining);
    selectedFiles.push(...toAdd);
    photoInput.value = '';
    updateDishPhotoPreview();
  });

 // Отправка формы
  const submitBtn = getElement('#btnSubmitDish');
  submitBtn.addEventListener('click', async () => {
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const composition = getCompositionData();
    if (composition.length < 1) {
      showToast('Добавьте хотя бы один продукт в состав', 'error');
      return;
    }

    const selectedFlags: Flag[] = [];
    Object.values(Flag).forEach(f => {
      const cb = form.elements.namedItem(`Flag_${f}`) as HTMLInputElement;
      if (cb && cb.checked) selectedFlags.push(f);
    });

    // Фотографии: теперь используем selectedFiles, а не photoInput.files
    let photos = existingPhotos;
    if (selectedFiles.length > 0) {
      const uploadedUrls = await uploadMultipleImages(selectedFiles);
      photos = [...existingPhotos, ...uploadedUrls];
    }

    // Всегда удаляем все макросы из названия
    let finalName = (formData.get('Name') as string).trim();
    finalName = finalName.replace(new RegExp(MacroRegex.source, 'g'), '').trim().replace(/\s+/g, ' ');

    // Определяем категорию: если пользователь не трогал select – берём из первого макроса
    let finalCategory = formData.get('Category') as DishCategory;
    if (!categoryExplicitlySet) {
      const originalName = formData.get('Name') as string;
      const match = originalName.match(MacroRegex);
      if (match) {
        const macroKey = match[0].toLowerCase();
        const cat = MacroMap[macroKey];
        if (cat) {
          finalCategory = cat;
        }
      }
    }

    const payload: CreateDishRequest = {
      Name: finalName,
      Photos: photos,
      CalorieContent: parseFloat(formData.get('CalorieContent') as string),
      Proteins: parseFloat(formData.get('Proteins') as string),
      Fats: parseFloat(formData.get('Fats') as string),
      Carbohydrates: parseFloat(formData.get('Carbohydrates') as string),
      Composition: composition,
      Size: parseFloat(formData.get('Size') as string),
      Category: finalCategory,
      Flags: selectedFlags.length ? selectedFlags : null,
    };

    try {
      if (isEdit && existingId) {
        const changeReq: ChangeDishRequest = { ...payload };
        await api.updateDish(existingId, changeReq);
        showToast('Блюдо обновлено');
      } else {
        await api.createDish(payload);
        showToast('Блюдо создано');
      }
      ui.closeModal();
      await loadAndRenderDishes();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  });
  // Если блюдо редактируется или в форме уже есть состав – сразу пересчитываем КБЖУ
  if (isEdit || getCompositionData().length > 0) {
    recalculateDishKbju();
  }
}


// -=-=-=-=-=-=-=-=-=-=- Инициализация приложения -=-=-=-=-=-=-=-=-=-=-

function initFilters() {
  // Категории продуктов
  const prodCatSelect = getElement<HTMLSelectElement>('#productCategoryFilter');
  Object.values(ProductCategory).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = ProductCategoryLabels[cat];
    prodCatSelect.appendChild(opt);
  });

  // Готовность
  const prodCookSelect = getElement<HTMLSelectElement>('#productCookingFilter');
  Object.values(CookingNecessity).forEach(cn => {
    const opt = document.createElement('option');
    opt.value = cn;
    opt.textContent = CookingNecessityLabels[cn];
    prodCookSelect.appendChild(opt);
  });

  // Категории блюд
  const dishCatSelect = getElement<HTMLSelectElement>('#dishCategoryFilter');
  Object.values(DishCategory).forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = DishCategoryLabels[cat];
    dishCatSelect.appendChild(opt);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFilters();

  // Навигация
  getAllElements<HTMLButtonElement>('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function () {
      const page = this.dataset.page;
      getAllElements('.nav-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      getAllElements('.page').forEach(p => p.classList.remove('active'));
      getElement(`#page-${page}`).classList.add('active');
      if (page === 'products') loadAndRenderProducts();
      else if (page === 'dishes') loadAndRenderDishes();
    });
  });

  // Продукты — фильтры
  getElement<HTMLInputElement>('#productSearch').addEventListener('input', debounce(() => {
    productFilters.search = (getElement<HTMLInputElement>('#productSearch').value ?? '').trim();
    loadAndRenderProducts();
  }, 350));

  getElement<HTMLSelectElement>('#productCategoryFilter').addEventListener('change', function () {
    productFilters.category = this.value as ProductCategory || '';
    loadAndRenderProducts();
  });
  getElement<HTMLSelectElement>('#productCookingFilter').addEventListener('change', function () {
    productFilters.cookingNecessity = this.value as CookingNecessity || '';
    loadAndRenderProducts();
  });
  getElement<HTMLSelectElement>('#productSort').addEventListener('change', function () {
    productFilters.sort = this.value as SortField || '';
    loadAndRenderProducts();
  });

  // Флаги продуктов
  getElement('#productFlagChips').addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('.flag-chip');
    if (!chip) return;
    const flag = chip.dataset.flag as Flag;
    chip.classList.toggle('active');
    if (chip.classList.contains('active')) {
      if (!productFilters.flags.includes(flag)) productFilters.flags.push(flag);
    } else {
      productFilters.flags = productFilters.flags.filter(f => f !== flag);
    }
    loadAndRenderProducts();
  });

  // Блюда — фильтры
  getElement<HTMLInputElement>('#dishSearch').addEventListener('input', debounce(() => {
    dishFilters.search = (getElement<HTMLInputElement>('#dishSearch').value ?? '').trim();
    loadAndRenderDishes();
  }, 350));

  getElement<HTMLSelectElement>('#dishCategoryFilter').addEventListener('change', function () {
    dishFilters.category = this.value as DishCategory || '';
    loadAndRenderDishes();
  });

  getElement('#dishFlagChips').addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>('.flag-chip');
    if (!chip) return;
    const flag = chip.dataset.flag as Flag;
    chip.classList.toggle('active');
    if (chip.classList.contains('active')) {
      if (!dishFilters.flags.includes(flag)) dishFilters.flags.push(flag);
    } else {
      dishFilters.flags = dishFilters.flags.filter(f => f !== flag);
    }
    loadAndRenderDishes();
  });

  // Кнопки добавления
  getElement('#btnAddProduct').addEventListener('click', () => buildAndOpenProductForm());
  getElement('#btnAddDish').addEventListener('click', async () => {
    if (products.length === 0) await loadAndRenderProducts();
    buildAndOpenDishForm();
  });

  // Делегирование кликов на карточках и кнопках в них
  getElement('#productList').addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    // Кнопки действий (можно добавить, если вернуть кнопки в разметку ui.ts)
    const card = target.closest<HTMLElement>('.card[data-type="product"]');
    if (!card) return;
    const id = card.dataset.id!;
    if (target.closest('.btn')) return; // если кнопка — не реагируем, пусть будет через window
    viewProduct(id);
  });

  // Удаление / редактирование продуктов через делегирование
  getElement('#productList').addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest<HTMLElement>('.card[data-type="product"]');
    if (!card) return;
    const id = card.dataset.id!;
    if (target.closest('.btn-delete')) {
      e.stopPropagation(); // чтобы не сработал просмотр
      if (confirm(`Удалить продукт?`)) {
        deleteProduct(id);
      }
    } else if (target.closest('.btn-edit')) {
      e.stopPropagation();
      editProduct(id);
    }
    // иначе клик мимо кнопок — просмотр уже обрабатывается в существующем блоке
  });

  getElement('#dishList').addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest<HTMLElement>('.card[data-type="dish"]');
    if (!card) return;
    const id = card.dataset.id!;
    if (target.closest('.btn')) return;
    viewDish(id);
  });

  getElement('#dishList').addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const card = target.closest<HTMLElement>('.card[data-type="dish"]');
    if (!card) return;
    const id = card.dataset.id!;
    if (target.closest('.btn-delete')) {
      e.stopPropagation();
      if (confirm(`Удалить блюдо?`)) {
        deleteDish(id);
      }
    } else if (target.closest('.btn-edit')) {
      e.stopPropagation();
      editDish(id);
    }
  });

  // Глобальные функции для модалок
  (window as any)._closeModal = ui.closeModal;
  (window as any)._viewProduct = viewProduct;
  (window as any)._editProduct = editProduct;
  (window as any)._deleteProduct = deleteProduct;
  (window as any)._viewDish = viewDish;
  (window as any)._editDish = editDish;
  (window as any)._deleteDish = deleteDish;

  // Первичная загрузка
  loadAndRenderProducts();
});