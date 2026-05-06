
import { calculateCpfc, Nutrition } from '../nutrition';
import { IngredientDto, ProductDto, Flag, ProductCategory, CookingNecessity } from '../models';

describe('calculateCpfc', () => {
    
  function product(
    id: string,
    calorie: number,
    proteins: number,
    fats: number,
    carbohydrates: number
  ): ProductDto {
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
  function ingredient(productId: string, amount: number): IngredientDto {
    return {
      ProductId: productId,
      ProductName: 'TestIngredient',
      Amount: amount,
    };
  }
    
  // -=-=-=-=-=-=- Базовые тесты расчёта КБЖУ -=-=-=-=-=-=-
  test.each`
    amount | cal   | prot  | fat  | carb  | expCal | expProt | expFat | expCarb
    ${100} | ${150} | ${12} | ${5} | ${20} | ${150} | ${12} | ${5} | ${20}
    ${50}  | ${150} | ${12} | ${5} | ${20} | ${75}  | ${6}  | ${2.5} | ${10}
    ${33}  | ${150} | ${12} | ${5} | ${20} | ${49.5}  | ${4.0}  | ${1.7} | ${6.6}
    ${0.1} | ${150} | ${12} | ${5} | ${20} | ${0.1} | ${0} | ${0} | ${0}
    ${1} | ${150} | ${12} | ${5} | ${20} | ${1.5} | ${0.1} | ${0.1} | ${0.2}
    ${10000} | ${150} | ${12} | ${5} | ${20} | ${15000} | ${1200} | ${500} | ${2000}
  `(
    'calculateCpfc with one ingredient for $amount g calculate correctly', 
    ({ amount, cal, prot, fat, carb, expCal, expProt, expFat, expCarb }) => {
      const ingredients = [ingredient('p1', amount)];
      const products = new Map([
        ['p1', product('p1', cal, prot, fat, carb)]
      ]);

      const result = calculateCpfc(ingredients, products);

      expect(result.calorieContent).toBeCloseTo(expCal, 1);
      expect(result.proteins).toBeCloseTo(expProt, 1);
      expect(result.fats).toBeCloseTo(expFat, 1);
      expect(result.carbohydrates).toBeCloseTo(expCarb, 1);
    }
  );

  // -=-=-=-=-=-=- Тесты значений количества продукта -=-=-=-=-=-=-
  // Позитивные тесты количества продукта
  test.each`
    amount | cal   | prot  | fat  | carb  | expCal | expProt | expFat | expCarb
    ${0.001}  | ${150} | ${12} | ${5} | ${20} | ${0}  | ${0}  | ${0} | ${0}
    ${1}  | ${150} | ${12} | ${5} | ${20} | ${1.5}  | ${0.12}  | ${0.1} | ${0.2}
    ${10000}  | ${150} | ${12} | ${5} | ${20} | ${15000}  | ${1200}  | ${500} | ${2000}
  `(
    'calculateCpfc with one ingredient for $amount g calculate correctly', 
    ({ amount, cal, prot, fat, carb, expCal, expProt, expFat, expCarb }) => {
      const ingredients = [ingredient('p1', amount)];
      const products = new Map([
        ['p1', product('p1', cal, prot, fat, carb)]
      ]);

      const result = calculateCpfc(ingredients, products);

      expect(result.calorieContent).toBeCloseTo(expCal, 1);
      expect(result.proteins).toBeCloseTo(expProt, 1);
      expect(result.fats).toBeCloseTo(expFat, 1);
      expect(result.carbohydrates).toBeCloseTo(expCarb, 1);
    }
  );
  // Негативные тесты количества продукта
  test.each`
    amount | cal   | prot  | fat  | carb 
    ${0}  | ${150} | ${12} | ${5} | ${20}
    ${-0.001}  | ${150} | ${12} | ${5} | ${20}
    ${-10000}  | ${150} | ${12} | ${5} | ${20}
  `(
    'calculateCpfc with one ingredient for $amount g throws error', 
    ({ amount, cal, prot, fat, carb }) => {
      const ingredients = [ingredient('p1', amount)];
      const products = new Map([
        ['p1', product('p1', cal, prot, fat, carb)]
      ]);

      expect(() => calculateCpfc(ingredients, products)).toThrow('Amount must be > 0 for product p1');
    }
  );

  // -=-=-=-=-=-=- Тесты на разное количество ингредиентов -=-=-=-=-=-=-
  test.each([
    [
      [],
      [],
      { calorieContent: 0, proteins: 0, fats: 0, carbohydrates: 0 }
    ],
    [
      [
        { ProductId: 'p1', Amount: 100 },
        { ProductId: 'p2', Amount: 100 },
      ],
      [
        { Id: 'p1', CalorieContent: 10, Proteins: 10, Fats: 10, Carbohydrates: 10 },
        { Id: 'p2', CalorieContent: 20, Proteins: 20, Fats: 20, Carbohydrates: 20 },
      ],
      { calorieContent: 30, proteins: 30, fats: 30, carbohydrates: 30 }
    ],
    [
      [
        { ProductId: 'p1', Amount: 500 },
        { ProductId: 'p2', Amount: 200 },
        { ProductId: 'p3', Amount: 150 },
      ],
      [
        { Id: 'p1', CalorieContent: 0, Proteins: 0, Fats: 0, Carbohydrates: 0 },
        { Id: 'p2', CalorieContent: 77, Proteins: 2.0, Fats: 0.4, Carbohydrates: 16.3 },
        { Id: 'p3', CalorieContent: 43, Proteins: 1.5, Fats: 0.1, Carbohydrates: 8.8 }
      ],
      { calorieContent: 218.5, proteins: 6.3, fats: 1, carbohydrates: 45.8 }
    ],
    [
      [
        { ProductId: 'p1', Amount: 500 },
        { ProductId: 'p2', Amount: 200 },
        { ProductId: 'p3', Amount: 200 },
        { ProductId: 'p4', Amount: 150 },
      ],
      [
        { Id: 'p1', CalorieContent: 0, Proteins: 0, Fats: 0, Carbohydrates: 0 },
        { Id: 'p2', CalorieContent: 187.2, Proteins: 18.9, Fats: 12.4, Carbohydrates: 0.0 },
        { Id: 'p3', CalorieContent: 77, Proteins: 2.0, Fats: 0.4, Carbohydrates: 16.3 },
        { Id: 'p4', CalorieContent: 43, Proteins: 1.5, Fats: 0.1, Carbohydrates: 8.8 }
      ],
      { calorieContent: 592.9, proteins: 44.0, fats: 25.8, carbohydrates: 45.8 }
    ]
  ])(
    'calculateCpfc with different ingredients count calculate correctly',
    (ingredientsList, productsList, expected) => {
      const ingredients: IngredientDto[] = [];
      const products = new Map();

      ingredientsList.forEach(el => {
        ingredients.push(ingredient(el.ProductId, el.Amount));
      });
      productsList.forEach(el => {
        products.set(el.Id, product(el.Id, el.CalorieContent, el.Proteins, el.Fats, el.Carbohydrates));
      });

      const result = calculateCpfc(ingredients, products);

      expect(result.calorieContent).toBeCloseTo(expected.calorieContent, 1);
      expect(result.proteins).toBeCloseTo(expected.proteins, 1);
      expect(result.fats).toBeCloseTo(expected.fats, 1);
      expect(result.carbohydrates).toBeCloseTo(expected.carbohydrates, 1);
    }
  );
});