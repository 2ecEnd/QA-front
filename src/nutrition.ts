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
    if ((product.CalorieContent < 0) ||
        (product.Proteins > 100 || product.Proteins < 0) ||
        (product.Fats > 100 || product.Fats < 0) ||
        (product.Carbohydrates > 100 || product.Carbohydrates < 0) ) {
      throw new Error(`Incorrect CPFC`);
    }

    const factor = ing.Amount / 100;
    calorieContent += product.CalorieContent * factor;
    proteins += product.Proteins * factor;
    fats += product.Fats * factor;
    carbohydrates += product.Carbohydrates * factor;
  }

  calorieContent = parseFloat(calorieContent.toFixed(1));
  proteins = parseFloat(proteins.toFixed(1));
  fats = parseFloat(fats.toFixed(1));
  carbohydrates = parseFloat(carbohydrates.toFixed(1));

  return { calorieContent, proteins, fats, carbohydrates };
}