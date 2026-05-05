import { IngredientDto, ProductDto } from './models';

export interface Nutrition {
  calorieContent: number;
  proteins: number;
  fats: number;
  carbohydrates: number;
}

export function calculateCpfc(
  ingredients: IngredientDto[],
  productMap: Map<string, ProductDto>
): Nutrition {
  let calorieContent = 0;
  let proteins = 0;
  let fats = 0;
  let carbohydrates = 0;

  for (const ing of ingredients) {
    if (ing.Amount <= 0) {
      throw new Error(`Amount must be > 0 for product ${ing.ProductId}`);
    }

    const product = productMap.get(ing.ProductId);
    if (!product) continue;

    const factor = ing.Amount / 100;
    calorieContent += product.CalorieContent * factor;
    proteins += product.Proteins * factor;
    fats += product.Fats * factor;
    carbohydrates += product.Carbohydrates * factor;
  }

  return { calorieContent, proteins, fats, carbohydrates };
}