/**
 * Рассчитывает КБЖУ на порцию на основе состава и данных продуктов.
 * Формула: ∑ (показатель_на_100г × количество_в_граммах / 100)
 * @param ingredients - список ингредиентов
 * @param productMap - Map productId → ProductDto
 * @returns Nutrition – рассчитанные суммарные значения
 * @throws Error если количество <= 0
 */
export function calculateNutrition(ingredients, productMap) {
    let calorieContent = 0;
    let proteins = 0;
    let fats = 0;
    let carbohydrates = 0;
    for (const ing of ingredients) {
        if (ing.Amount <= 0) {
            throw new Error(`Amount must be > 0 for product ${ing.ProductId}`);
        }
        const product = productMap.get(ing.ProductId);
        if (!product)
            continue;
        const factor = ing.Amount / 100;
        calorieContent += product.CalorieContent * factor;
        proteins += product.Proteins * factor;
        fats += product.Fats * factor;
        carbohydrates += product.Carbohydrates * factor;
    }
    return { calorieContent, proteins, fats, carbohydrates };
}
//# sourceMappingURL=nutrition.js.map