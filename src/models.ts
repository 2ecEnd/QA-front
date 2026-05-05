// ─── ENUMS ──────────────────────────────
export enum ProductCategory {
  FROZEN = 'FROZEN',
  MEAT = 'MEAT',
  VEGETABLES = 'VEGETABLES',
  HERBS = 'HERBS',
  SPICES = 'SPICES',
  CEREALS = 'CEREALS',
  CANNED = 'CANNED',
  FOOD = 'FOOD',
  LIQUID = 'LIQUID',
  SWEETS = 'SWEETS',
}

export enum CookingNecessity {
  READY = 'READY',
  SEMI_FINISHED = 'SEMI_FINISHED',
  RAW = 'RAW',
}

export enum DishCategory {
  DESSERT = 'DESSERT',
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  DRINK = 'DRINK',
  SALAD = 'SALAD',
  SOUP = 'SOUP',
  SNACK = 'SNACK',
}

export enum Flag {
  VEGAN = 'VEGAN',
  GLUTEN_FREE = 'GLUTEN_FREE',
  SUGAR_FREE = 'SUGAR_FREE',
}

export enum SortField {
  NAME = 'NAME',
  CALORIE_CONTENT = 'CALORIE_CONTENT',
  PROTEINS = 'PROTEINS',
  FATS = 'FATS',
  CARBOHYDRATES = 'CARBOHYDRATES',
}

// ─── DTO ──────
export interface ProductDto {
  Id: string;               // UUID
  Name: string;
  Photos: string[];
  CalorieContent: number;
  Proteins: number;
  Fats: number;
  Carbohydrates: number;
  Composition: string | null;
  Category: ProductCategory;
  CookingNecessity: CookingNecessity;
  Flags: Flag[];
  CreationDate: string;
  EditDate: string | null;
}

export interface DishDto {
  Id: string;
  Name: string;
  Photos: string[];
  CalorieContent: number;
  Proteins: number;
  Fats: number;
  Carbohydrates: number;
  Composition: IngredientDto[];
  Size: number;
  Category: DishCategory;
  Flags: Flag[];
  CreationDate: string;
  EditDate: string | null;
}

export interface IngredientDto {
  ProductId: string;
  ProductName: string;
  Amount: number;  // float
}

// ─── Запросы на создание/изменение ─────
export interface CreateProductRequest {
  Name: string;
  Photos: string[];
  CalorieContent: number;
  Proteins: number;
  Fats: number;
  Carbohydrates: number;
  Composition: string | null;
  Category: ProductCategory;
  CookingNecessity: CookingNecessity;
  Flags: Flag[] | null;
}

export interface ChangeProductRequest extends Partial<CreateProductRequest> {
  CookingNecessity?: CookingNecessity; // для PATCH
}

export interface CreateDishRequest {
  Name: string;
  Photos: string[];
  CalorieContent: number;
  Proteins: number;
  Fats: number;
  Carbohydrates: number;
  Composition: IngredientDto[];
  Size: number;
  Category: DishCategory;
  Flags: Flag[] | null;
}

export type ChangeDishRequest = Partial<CreateDishRequest>;

export interface CreateEntityResponse {
  Id: string;
}
export interface ChangeEntityResponse {
  Count: number;
}
export interface DeleteEntityResponse {
  Count: number;
}

export interface DishShortInfoDto {
  Id: string;
  Name: string;
}

export interface DeleteProductResponse {
  Acknowledge: boolean;
  Dishes: DishShortInfoDto[] | null;
}

// ─── Макросы ───────────────────────────
export const MacroMap: Record<string, DishCategory> = {
  '!десерт': DishCategory.DESSERT,
  '!первое': DishCategory.FIRST,
  '!второе': DishCategory.SECOND,
  '!напиток': DishCategory.DRINK,
  '!салат': DishCategory.SALAD,
  '!суп': DishCategory.SOUP,
  '!перекус': DishCategory.SNACK,
};
export const MacroRegex = /!(десерт|первое|второе|напиток|салат|суп|перекус)/i;

// ─── Локализованные названия enum ──────
export const ProductCategoryLabels: Record<ProductCategory, string> = {
  [ProductCategory.FROZEN]: 'Замороженный',
  [ProductCategory.MEAT]: 'Мясной',
  [ProductCategory.VEGETABLES]: 'Овощи',
  [ProductCategory.HERBS]: 'Зелень',
  [ProductCategory.SPICES]: 'Специи',
  [ProductCategory.CEREALS]: 'Крупы',
  [ProductCategory.CANNED]: 'Консервы',
  [ProductCategory.FOOD]: 'Продукты',
  [ProductCategory.LIQUID]: 'Жидкость',
  [ProductCategory.SWEETS]: 'Сладости',
};

export const CookingNecessityLabels: Record<CookingNecessity, string> = {
  [CookingNecessity.READY]: 'Готовый к употреблению',
  [CookingNecessity.SEMI_FINISHED]: 'Полуфабрикат',
  [CookingNecessity.RAW]: 'Требует приготовления',
};

export const DishCategoryLabels: Record<DishCategory, string> = {
  [DishCategory.DESSERT]: 'Десерт',
  [DishCategory.FIRST]: 'Первое',
  [DishCategory.SECOND]: 'Второе',
  [DishCategory.DRINK]: 'Напиток',
  [DishCategory.SALAD]: 'Салат',
  [DishCategory.SOUP]: 'Суп',
  [DishCategory.SNACK]: 'Перекус',
};

export const FlagLabels: Record<Flag, string> = {
  [Flag.VEGAN]: 'Веган',
  [Flag.GLUTEN_FREE]: 'Без глютена',
  [Flag.SUGAR_FREE]: 'Без сахара',
};