import { test, expect } from '@playwright/test';
import { cleanupDatabase } from './helpers/api-cleanup';

const inputName = 'input[name="Name"]';
const inputPhotos = 'input[type=file]';
const btnPhotoRemove = '.photo-remove-btn';
const inputCalorieContent = 'input[name="CalorieContent"]';
const inputProteins = 'input[name="Proteins"]';
const inputFats = 'input[name="Fats"]';
const inputCarbohydrates = 'input[name="Carbohydrates"]';
const inputComposition = 'textarea[name="Composition"]';
const selectCategory = 'select[name="Category"]';
const selectCookingNecessity = 'select[name="CookingNecessity"]';
const dishInputflagVegan = '#dishFlagLabel_VEGAN input[name="Flag_VEGAN"]';
const dishInputflagGlutenFree = '#dishFlagLabel_GLUTEN_FREE input[name="Flag_GLUTEN_FREE"]';
const dishInputflagSugarFree = '#dishFlagLabel_SUGAR_FREE input[name="Flag_SUGAR_FREE"]';

const productPage = 'text=🍎 Продукты';
const dishPage = 'text=🍽️ Блюда';

const dishList = '#dishList';
const btnAddDish = '#page-dishes #btnAddDish';
const btnSubmitDish = '#btnSubmitDish';
const dishSize = '#dishSize';
const dishCalorieContent = '#dishCalorieContent';
const dishProteins = '#dishProteins';
const dishFats = '#dishFats';
const dishCarbohydrates = '#dishCarbohydrates';
const dishCompProduct = '.comp-product';
const dishCompAmount = '.comp-amount';

const dishForm = '#dishForm';

const dishCard = '#page-dishes .card';
const dishCardDeleteBtn = '#page-dishes .card .btn-delete';
const dishCardEditBtn = '#page-dishes .card .btn-edit';
const dishCardTitle = '#page-dishes .card-title';

const toastContainer = '#toastContainer'
const toastError = '.toast.error'

const product = '#productList';
const btnAddProduct = '#btnAddProduct';
const btnSubmitProduct = '#btnSubmitProduct';
const productInputflagVegan = '#productForm input[name="Flag_VEGAN"]';
const productInputflagGlutenFree = '#productForm input[name="Flag_GLUTEN_FREE"]';
const productInputflagSugarFree = '#productForm input[name="Flag_SUGAR_FREE"]';

const detailItem = '.detail-item';
const modalHeader = '.modal-header';
const modalBodyImg = '.modal-body img';

const dishInvalidCpfc = [
  { cal: '-1', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '-1', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '-1', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '-1' },
  { cal: '-0.01', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '-0.01', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '-0.01', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '-0.01' },
]
const dishValidCpfc = [
  { cal: '0', prot: '0', fats: '0', carb: '0' },
  { cal: '1', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '1', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '1', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '1' },
  { cal: '0.01', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '0.01', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '0.01', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '0.01' },
]

test.describe('Dishes', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupDatabase();
    await page.goto('/');
    await page.click(dishPage);
    await page.waitForSelector(dishList);
  });


  test.describe('Create dish', () => {
    test.beforeEach(async ({ page }) => {
      await page.click(productPage);
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.click(btnSubmitProduct);
      
      await page.click(dishPage);
      await page.waitForSelector(dishList);
    });


    test('Create dish short name error', async ({ page }) => {
      await page.click(btnAddDish);
      await page.fill(inputName, 'С');
      await page.click(btnSubmitDish);

      await expect(page.locator(dishForm)).toBeVisible();
    });

    dishInvalidCpfc.forEach((dish) => {
      test(`Create dish invalid CPFC error: ${dish.cal} ${dish.prot} ${dish.fats} ${dish.carb}`, async ({ page }) => {
        await page.click(btnAddDish);
        await page.fill(inputName, 'Dish');
        await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
        await page.locator(dishCompAmount).fill('150');
        await page.fill(inputCalorieContent, dish.cal);
        await page.fill(inputProteins, dish.prot);
        await page.fill(inputFats, dish.fats);
        await page.fill(inputCarbohydrates, dish.carb);
        
        await page.click(btnSubmitDish);

        await expect(page.locator(dishForm)).toBeVisible();
      });
    });

    dishValidCpfc.forEach((dish) => {
      test(`Create dish valid CPFC success: ${dish.cal} ${dish.prot} ${dish.fats} ${dish.carb}`, async ({ page }) => {
        await page.click(btnAddDish);
        await page.fill(inputName, 'Dish');
        await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
        await page.locator(dishCompAmount).fill('150');
        await page.fill(inputCalorieContent, dish.cal);
        await page.fill(inputProteins, dish.prot);
        await page.fill(inputFats, dish.fats);
        await page.fill(inputCarbohydrates, dish.carb);
        await page.fill(dishSize, '100');
        await page.click(btnSubmitDish);

        await expect(page.locator(dishCardTitle)).toContainText('Dish');
      });
    });

    test('Create dish more than 6 photos error', async ({ page }) => {
      await page.click(btnAddDish);
      await page.fill(inputName, 'Борщ');
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png'
        ]
      );
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png'
        ]
      );

      await expect(page.locator(toastContainer)).toContainText('Максимум 5 фотографий');
    });

    test('Create dish valid data success', async ({ page }) => {
      await page.click(dishPage);
      await page.click(btnAddDish);
      await page.fill(inputName, 'Свекольный суп');
      await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
      await page.locator(dishCompAmount).fill('150');
      await page.fill(dishSize, '100');
      await page.click(btnSubmitDish);

      await page.waitForSelector(dishList);
      await expect(page.locator(dishCardTitle)).toContainText('Свекольный суп');
    });

    test('Create dish valida data with macros success ', async ({ page }) => {
      await page.click(dishPage);
      await page.click(btnAddDish);
      await page.fill(inputName, '!супСвекольный суп');
      await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
      await page.locator(dishCompAmount).fill('150');
      await page.fill(dishSize, '100');
      await page.click(btnSubmitDish);

      await page.waitForSelector(dishList);
      await expect(page.locator(dishCardTitle)).toContainText('Свекольный суп');
      await page.locator(dishCard).click();
      const categoryRow = page.locator(detailItem)
        .filter({ hasText: 'Категория' });
      await expect(categoryRow).toContainText('Суп');
    });
  });

  test.describe('Retrieve dish', () => {
    test.beforeEach(async ({ page }) => {
      await page.click(productPage);
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.check(productInputflagVegan);
      await page.check(productInputflagGlutenFree);
      await page.check(productInputflagSugarFree);
      await page.click(btnSubmitProduct);
      
      await page.click(dishPage);
      await page.waitForSelector(dishList);

      await page.click(btnAddDish);
      await page.fill(inputName, 'Свекольный суп');
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch_vegan.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch_vegan.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch_vegan.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch_vegan.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch_vegan.png'
        ]
      );
      await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
      await page.locator(dishCompAmount).fill('300');
      await page.selectOption(selectCategory, { label: 'Суп' });
      await page.fill(dishSize, '300');
      await page.check(dishInputflagVegan);
      await page.check(dishInputflagGlutenFree);
      await page.check(dishInputflagSugarFree);
      await page.click(btnSubmitDish);
      
      await page.waitForSelector(dishList);
    });


    test('Retrieve dish just created dish has correct data', async ({ page }) => {
      await page.locator(dishCard).click();

      const name = page.locator(modalHeader);
      const photos = page.locator(modalBodyImg);
      const caloriesRow = page.locator(detailItem)
        .filter({ hasText: 'Калорийность' });
      const proteinsRow = page.locator(detailItem)
        .filter({ hasText: 'Белки' });
      const fatsRow = page.locator(detailItem)
        .filter({ hasText: 'Жиры' });
      const carbohydratesRow = page.locator(detailItem)
        .filter({ hasText: 'Углеводы' });
      const categoryRow = page.locator(detailItem)
        .filter({ hasText: 'Категория' });
      const flagsRow = page.locator(detailItem)
        .filter({ hasText: 'Флаги' });
      const createdAtRow = page.locator(detailItem)
        .filter({ hasText: 'Создан' });
      const updatedAtRow = page.locator(detailItem)
        .filter({ hasText: 'Изменён' });

      await expect(name).toContainText('Свекольный суп');
      await expect(photos).toHaveCount(5);
      await expect(caloriesRow).toContainText('129.0 ккал / порция');
      await expect(categoryRow).toContainText('Суп');
      await expect(proteinsRow).toContainText('4.5 г / порция');
      await expect(fatsRow).toContainText('0.3 г / порция');
      await expect(carbohydratesRow).toContainText('26.4 г / порция');
      await expect(flagsRow).toContainText('Без сахара');
      await expect(flagsRow).toContainText('Веган');
      await expect(flagsRow).toContainText('Без глютена');
      await expect(createdAtRow).toHaveText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
      await expect(updatedAtRow).toContainText('—');
    });

    test('Retrieve product updated product has correct data', async ({ page }) => {
      await page.click(productPage);
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Мясо');
      await page.fill(inputCalorieContent, '187.2');
      await page.fill(inputProteins, '18.9');
      await page.fill(inputFats, '12.4');
      await page.fill(inputCarbohydrates, '0');
      await page.check(productInputflagGlutenFree); 
      await page.check(productInputflagSugarFree);
      await page.click(btnSubmitProduct);
      
      await page.click(dishPage);
      await page.waitForSelector(dishList);

      await page.locator(dishCardEditBtn).click();
      await page.fill(inputName, 'Борщ!!!');
      await page.locator(btnPhotoRemove).first().click();
      await page.locator(btnPhotoRemove).first().click();
      await page.locator(btnPhotoRemove).first().click();
      await page.selectOption(selectCategory, { label: 'Десерт' });
      await page.fill(dishSize, '300');
      await page.uncheck(dishInputflagVegan);
      await page.uncheck(dishInputflagGlutenFree);
      await page.uncheck(dishInputflagSugarFree);
      await page.click(btnSubmitDish);

      await page.click(dishCard);

      const name = page.locator(modalHeader);
      const photos = page.locator(modalBodyImg);
      const caloriesRow = page.locator(detailItem)
        .filter({ hasText: 'Калорийность' });
      const sizeRow = page.locator(detailItem)
        .filter({ hasText: 'Размер порции' });
      const proteinsRow = page.locator(detailItem)
        .filter({ hasText: 'Белки' });
      const fatsRow = page.locator(detailItem)
        .filter({ hasText: 'Жиры' });
      const carbohydratesRow = page.locator(detailItem)
        .filter({ hasText: 'Углеводы' });
      const categoryRow = page.locator(detailItem)
        .filter({ hasText: 'Категория' });
      const flagsRow = page.locator(detailItem)
        .filter({ hasText: 'Флаги' });
      const createdAtRow = page.locator(detailItem)
        .filter({ hasText: 'Создан' });
      const updatedAtRow = page.locator(detailItem)
        .filter({ hasText: 'Изменён' });
      const ingredients = page.locator(detailItem)
        .filter({ hasText: 'Продукт' });

      await expect(name).toContainText('Борщ!!!');
      await expect(photos).toHaveCount(2);
      await expect(caloriesRow).toContainText('129.0 ккал / порция');
      await expect(proteinsRow).toContainText('4.5 г / порция');
      await expect(fatsRow).toContainText('0.3 г / порция');
      await expect(carbohydratesRow).toContainText('26.4 г / порция');
      await expect(sizeRow).toContainText('300.0 г');
      await expect(categoryRow).toContainText('Десерт');
      await expect(flagsRow).toContainText('—');
      await expect(createdAtRow).toHaveText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
      await expect(updatedAtRow).toHaveText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
      await expect(ingredients.nth(0)).toContainText('Свекла — 300.0 г');
    });
  });
  
  test.describe('Update dish', () => {
    test.beforeEach(async ({ page }) => {
      await page.click(productPage);
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.click(btnSubmitProduct);
      
      await page.click(dishPage);
      await page.waitForSelector(dishList);

      await page.click(btnAddDish);
      await page.fill(inputName, 'Dish');
      await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
      await page.locator(dishCompAmount).fill('300');
      await page.fill(inputCalorieContent, '200');
      await page.fill(inputProteins, '200');
      await page.fill(inputFats, '200');
      await page.fill(inputCarbohydrates, '200');
      await page.fill(dishSize, '300');
      await page.click(btnSubmitDish);
      
      await page.waitForSelector(dishList);
    });

    
    test('Update dish short name error', async ({ page }) => {
      await page.locator(dishCardEditBtn).click();
      await page.fill(inputName, 'С');
      await page.click(btnSubmitDish);

      await expect(page.locator(dishForm)).toBeVisible();
    });

    dishInvalidCpfc.forEach((dish) => {
      test(`Update dish invalid CPFC error: ${dish.cal} ${dish.prot} ${dish.fats} ${dish.carb}`, async ({ page }) => {
      await page.locator(dishCardEditBtn).click();
        await page.fill(inputName, 'Dish');
        await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
        await page.locator(dishCompAmount).fill('150');
        await page.fill(inputCalorieContent, dish.cal);
        await page.fill(inputProteins, dish.prot);
        await page.fill(inputFats, dish.fats);
        await page.fill(inputCarbohydrates, dish.carb);
        
        await page.click(btnSubmitDish);

        await expect(page.locator(dishForm)).toBeVisible();
      });
    });

    dishValidCpfc.forEach((dish) => {
      test(`Create dish valid CPFC success: ${dish.cal} ${dish.prot} ${dish.fats} ${dish.carb}`, async ({ page }) => {
      await page.locator(dishCardEditBtn).click();
        await page.fill(inputName, 'Dish');
        await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
        await page.locator(dishCompAmount).fill('150');
        await page.fill(inputCalorieContent, dish.cal);
        await page.fill(inputProteins, dish.prot);
        await page.fill(inputFats, dish.fats);
        await page.fill(inputCarbohydrates, dish.carb);
        await page.fill(dishSize, '100');
        await page.click(btnSubmitDish);

        await expect(page.locator(dishCardTitle)).toContainText('Dish');
      });
    });

    test('Update dish more than 6 photos error', async ({ page }) => {
      await page.locator(dishCardEditBtn).click();
      await page.fill(inputName, 'Борщ');
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png'
        ]
      );
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/borsch.png'
        ]
      );

      await expect(page.locator(toastContainer)).toContainText('Максимум 5 фотографий');
    });
  });

  test.describe('Delete dish', () => {
    test.beforeEach(async ({ page }) => {
      await page.click(productPage);
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.click(btnSubmitProduct);
      
      await page.click(dishPage);
      await page.waitForSelector(dishList);
    });

    test('Delete dish success', async ({ page }) => {
      await page.click(btnAddDish);
      await page.fill(inputName, 'Свекольный суп');
      await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
      await page.locator(dishCompAmount).fill('150');
      await page.fill(dishSize, '100');
      await page.click(btnSubmitDish);

      page.on('dialog', dialog => dialog.accept());
      await page.locator(dishCardDeleteBtn).click();
      await expect(page.locator(dishCardTitle)).toHaveCount(1);
    });
  });
});


/*
test.describe('Блюда', () => {

    test('Флаг "Веган" недоступен, если продукт не веган', async ({ page }) => {
      await page.click('#btnAddDish');
      await page.fill('input[name="Name"]', 'Тест флага');
      await page.selectOption('.comp-product', { label: 'Курица' });
      await page.fill('.comp-amount', '100');
      // Чекбокс "Веган" должен быть заблокирован
      await expect(page.locator('#dishFlagLabel_VEGAN')).toHaveClass(/disabled/);
      await expect(page.locator('input[name="Flag_VEGAN"]')).toBeDisabled();
    });
  });
});

*/