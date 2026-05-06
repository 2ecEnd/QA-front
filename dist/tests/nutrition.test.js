import { calculateCpfc } from '../nutrition';
import { ProductCategory, CookingNecessity } from '../models';
describe('calculateCpfc', () => {
    function product(id, calorie, proteins, fats, carbohydrates) {
        return {
            Id: id,
            Name: `TestProduct-${id}`,
            Photos: [],
            CalorieContent: calorie,
            Proteins: proteins,
            Fats: fats,
            Carbohydrates: carbohydrates,
            Composition: null,
            Category: ProductCategory.FOOD,
            CookingNecessity: CookingNecessity.READY,
            Flags: [],
            CreationDate: new Date().toISOString(),
            EditDate: null,
        };
    }
    function ingredient(productId, amount) {
        return {
            ProductId: productId,
            ProductName: 'TestIngredient',
            Amount: amount,
        };
    }
    // Базовые тесты расчёта КБЖУ
    test.each `
    amount | cal   | prot  | fat  | carb  | expCal | expProt | expFat | expCarb
    ${100} | ${150} | ${12} | ${5} | ${20} | ${150.0} | ${12.0} | ${5.0} | ${20.0}
    ${50}  | ${150} | ${12} | ${5} | ${20} | ${75.0}  | ${6.0}  | ${2.5} | ${10.0}
    ${33}  | ${150} | ${12} | ${5} | ${20} | ${49.5}  | ${4.0}  | ${1.7} | ${6.6}
  `('calculateCpfc with one ingredient for $amount g calculate correctly', ({ amount, cal, prot, fat, carb, expCal, expProt, expFat, expCarb }) => {
        const ingredients = [ingredient('p1', amount)];
        const products = new Map([
            ['p1', product('p1', cal, prot, fat, carb)]
        ]);
        const result = calculateCpfc(ingredients, products);
        expect(result.calorieContent).toBeCloseTo(expCal, 1);
        expect(result.proteins).toBeCloseTo(expProt, 1);
        expect(result.fats).toBeCloseTo(expFat, 1);
        expect(result.carbohydrates).toBeCloseTo(expCarb, 1);
    });
    // Позитивные теста количества продукта
    test.each `
    amount | cal   | prot  | fat  | carb  | expCal | expProt | expFat | expCarb
    ${0.001}  | ${150} | ${12} | ${5} | ${20} | ${0}  | ${0}  | ${0} | ${0}
    ${1}  | ${150} | ${12} | ${5} | ${20} | ${1.5}  | ${0.12}  | ${0.1} | ${0.2}
    ${10000}  | ${150} | ${12} | ${5} | ${20} | ${15000}  | ${1200}  | ${500} | ${2000}
  `('calculateCpfc with one ingredient for $amount g calculate correctly', ({ amount, cal, prot, fat, carb, expCal, expProt, expFat, expCarb }) => {
        const ingredients = [ingredient('p1', amount)];
        const products = new Map([
            ['p1', product('p1', cal, prot, fat, carb)]
        ]);
        const result = calculateCpfc(ingredients, products);
        expect(result.calorieContent).toBeCloseTo(expCal, 1);
        expect(result.proteins).toBeCloseTo(expProt, 1);
        expect(result.fats).toBeCloseTo(expFat, 1);
        expect(result.carbohydrates).toBeCloseTo(expCarb, 1);
    });
    test('calculateCpfc empty list returns zeros', () => {
        const ingredients = [];
        const products = new Map();
        const result = calculateCpfc(ingredients, products);
        expect(result.calorieContent).toBe(0);
        expect(result.proteins).toBe(0);
        expect(result.fats).toBe(0);
        expect(result.carbohydrates).toBe(0);
    });
    test('calculateCpfc many ingredients correct calculations', () => {
        const ingredients = [
            ingredient('p1', 500),
            ingredient('p2', 200),
            ingredient('p3', 200),
            ingredient('p4', 150)
        ];
        const products = new Map([
            ['p1', product('p1', 0.0, 0.0, 0.0, 0.0)],
            ['p2', product('p2', 187.2, 18.9, 12.4, 0.0)],
            ['p3', product('p3', 77.0, 2.0, 0.4, 16.3)],
            ['p4', product('p4', 43, 1.5, 0.1, 8.8)]
        ]);
        const result = calculateCpfc(ingredients, products);
        expect(result.calorieContent).toBe(592.9);
        expect(result.proteins).toBe(44.0);
        expect(result.fats).toBe(25.8);
        expect(result.carbohydrates).toBe(45.8);
    });
});
//# sourceMappingURL=nutrition.test.js.map