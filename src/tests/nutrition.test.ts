
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
    
    test('calculateCpfc empty list returns zeros', () => {
        const ingredients: IngredientDto[] = [];
        const products = new Map();

        const result = calculateCpfc(ingredients, products);

        expect(result.calorieContent).toBe(0);
        expect(result.proteins).toBe(0);
        expect(result.fats).toBe(0);
        expect(result.carbohydrates).toBe(0);
    });
    
    test('calculateCpfc one ingredient returns equal values', () => {
        const ingredients = [ingredient('p1', 100)];
        const products = new Map([
            ['p1', product('p1', 150.0, 12.0, 5.0, 20.0)]
        ]);

        const result = calculateCpfc(ingredients, products);

        expect(result.calorieContent).toBe(150.0);
        expect(result.proteins).toBe(12.0);
        expect(result.fats).toBe(5.0);
        expect(result.carbohydrates).toBe(20.0);
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


  test('минимальное количество 0.01 г → корректный расчёт', () => {
    const prod = product('p2', 300.0, 0.0, 100.0, 0.0);
    const ing = ingredient('p2', 0.01);
    const result = calculateCpfc([ing], new Map([['p2', prod]]));
    // Коэффициент = 0.0001
    expect(result.calorieContent).toBeCloseTo(300 * 0.0001);
    expect(result.proteins).toBeCloseTo(0);
    expect(result.fats).toBeCloseTo(100 * 0.0001);
    expect(result.carbohydrates).toBeCloseTo(0);
  });
  
  test('количество = 0 вызывает ошибку', () => {
    const prod = product('p3', 100, 10, 5, 5);
    const ing = ingredient('p3', 0);
    expect(() => calculateCpfc([ing], new Map([['p3', prod]]))).toThrow(
      'Amount must be > 0'
    );
  });
  
  test('два продукта с разным количеством — суммарный расчёт', () => {
    const p1 = product('a', 200, 20, 10, 70);
    const p2 = product('b', 100, 5, 5, 80);
    const ingredients = [ingredient('a', 50), ingredient('b', 200)];
    const map = new Map([['a', p1], ['b', p2]]);

    const result = calculateCpfc(ingredients, map);
    // a: 50г → cal = 200*0.5=100, prot=20*0.5=10, fat=10*0.5=5, carb=70*0.5=35
    // b: 200г → cal = 100*2=200, prot=5*2=10, fat=5*2=10, carb=80*2=160
    // total: 300 cal, 20 prot, 15 fat, 195 carb
    expect(result.calorieContent).toBe(300);
    expect(result.proteins).toBe(20);
    expect(result.fats).toBe(15);
    expect(result.carbohydrates).toBe(195);
  });
  
  describe.each`
    cal     | prot   | fat    | carb   | amount  | expectedCal           | expectedProt          | expectedFat           | expectedCarb
    ${0}    | ${0}   | ${0}   | ${0}   | ${0.01} | ${0}                  | ${0}                  | ${0}                  | ${0}
    ${100}  | ${0}   | ${0}   | ${100} | ${0.01} | ${0.01}               | ${0}                  | ${0}                  | ${0.01}
    ${300}  | ${100} | ${0}   | ${0}   | ${100}  | ${300}                | ${100}                | ${0}                  | ${0}
    ${500}  | ${99.9}| ${0.1} | ${0}   | ${200}  | ${1000}               | ${199.8}              | ${0.2}                | ${0}
    ${250}  | ${50}  | ${50}  | ${0}   | ${50}   | ${125}                | ${25}                 | ${25}                 | ${0}
  `(
    'продукт: cal=$cal, prot=$prot, fat=$fat, carb=$carb, количество=$amount г',
    ({ cal, prot, fat, carb, amount, expectedCal, expectedProt, expectedFat, expectedCarb }) => {
      test(`возвращает cal=${expectedCal}, prot=${expectedProt}, fat=${expectedFat}, carb=${expectedCarb}`, () => {
        const prod = product('x', cal, prot, fat, carb);
        const ing = ingredient('x', amount);
        const result = calculateCpfc([ing], new Map([['x', prod]]));
        expect(result.calorieContent).toBeCloseTo(expectedCal);
        expect(result.proteins).toBeCloseTo(expectedProt);
        expect(result.fats).toBeCloseTo(expectedFat);
        expect(result.carbohydrates).toBeCloseTo(expectedCarb);
      });
    }
  );
});