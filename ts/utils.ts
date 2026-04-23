// ===== УТИЛИТЫ =====
import { DishCategory } from './types.js';

/** Показать всплывающее уведомление */
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
  const container = document.getElementById('notification-container') || createNotificationContainer();
  const toast = document.createElement('div');
  toast.className = `notification ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
    if (container.children.length === 0) {
      container.remove();
    }
  }, 5000);
}

function createNotificationContainer(): HTMLElement {
  const container = document.createElement('div');
  container.id = 'notification-container';
  document.body.appendChild(container);
  return container;
}

/** Человеко-читаемые названия категорий продуктов */
export const categoryLabels: Record<string, string> = {
  FROZEN: 'Замороженный',
  MEAT: 'Мясной',
  VEGETABLES: 'Овощи',
  GREENS: 'Зелень',
  SPICES: 'Специи',
  CEREALS: 'Крупы',
  CANNED: 'Консервы',
  LIQUID: 'Жидкость',
  SWEETS: 'Сладости',
  DESSERT: 'Десерт',
  FIRST_COURSE: 'Первое',
  SECOND_COURSE: 'Второе',
  DRINK: 'Напиток',
  SALAD: 'Салат',
  SOUP: 'Суп',
  SNACK: 'Перекус',
};

/** Человеко-читаемые статусы готовности */
export const cookingLabels: Record<string, string> = {
  RAW: 'Сырой',
  NEEDS_COOKING: 'Требует готовки',
  READY_TO_EAT: 'Готов к употреблению',
};

/** Человеко-читаемые названия флагов */
export const flagLabels: Record<string, string> = {
  VEGAN: 'Веган',
  GLUTEN_FREE: 'Без глютена',
  SUGAR_FREE: 'Без сахара',
};

/** Форматирование числа с одним знаком после запятой */
export function formatNumber(value: number, digits = 1): string {
  return value.toFixed(digits);
}

/** Извлечение категории из макроса в названии блюда */
const macroMap: Record<string, DishCategory> = {
  '!десерт': 'DESSERT',
  '!первое': 'FIRST_COURSE',
  '!второе': 'SECOND_COURSE',
  '!напиток': 'DRINK',
  '!салат': 'SALAD',
  '!суп': 'SOUP',
  '!перекус': 'SNACK',
};

export function extractMacroCategory(name: string): { cleanedName: string; category?: DishCategory } {
  for (const [macro, cat] of Object.entries(macroMap)) {
    if (name.includes(macro)) {
      return {
        cleanedName: name.replace(macro, '').trim(),
        category: cat,
      };
    }
  }
  return { cleanedName: name };
}