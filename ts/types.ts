export interface Product {
  id: string;
  name: string;
  photoUrls: string[];
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  composition: string | null;
  category: ProductCategory;
  cookingRequired: CookingRequired;
  flags: ProductFlag[];
  createdAt: string;
  updatedAt: string | null;
}

export type ProductCategory =
  | 'FROZEN' | 'MEAT' | 'VEGETABLES' | 'GREENS' | 'SPICES'
  | 'CEREALS' | 'CANNED' | 'LIQUID' | 'SWEETS';

export type CookingRequired = 'RAW' | 'NEEDS_COOKING' | 'READY_TO_EAT';

export type ProductFlag = 'VEGAN' | 'GLUTEN_FREE' | 'SUGAR_FREE';

export interface Dish {
  id: string;
  name: string;
  photoUrls: string[];
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  ingredients: DishIngredient[];
  portionSize: number;
  category: DishCategory;
  flags: DishFlag[];
  createdAt: string;
  updatedAt: string | null;
}

export interface DishIngredient {
  id?: string;
  product: Product;
  quantity: number;
}

export type DishCategory =
  | 'DESSERT' | 'FIRST_COURSE' | 'SECOND_COURSE'
  | 'DRINK' | 'SALAD' | 'SOUP' | 'SNACK';

export type DishFlag = 'VEGAN' | 'GLUTEN_FREE' | 'SUGAR_FREE';

// DTO для создания/обновления (без ID и системных полей)
export interface ProductCreateDto {
  name: string;
  photoUrls?: string[];
  calories: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
  composition?: string | null;
  category: ProductCategory;
  cookingRequired: CookingRequired;
  flags?: ProductFlag[];
}

export interface DishCreateDto {
  name: string;
  photoUrls?: string[];
  calories?: number;
  proteins?: number;
  fats?: number;
  carbohydrates?: number;
  ingredients: { productId: string; quantity: number }[];
  portionSize?: number; // может вычисляться
  category?: DishCategory | null;
  flags?: DishFlag[];
}

// Фильтры для запросов
export interface ProductFilter {
  name?: string;
  category?: string;
  cookingRequired?: string;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
  sortBy?: 'name' | 'calories' | 'proteins' | 'fats' | 'carbohydrates';
  sortDir?: 'asc' | 'desc';
}

export interface DishFilter {
  name?: string;
  category?: string;
  vegan?: boolean;
  glutenFree?: boolean;
  sugarFree?: boolean;
}