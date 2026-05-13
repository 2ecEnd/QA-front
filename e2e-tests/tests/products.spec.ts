import { test, expect, Page } from '@playwright/test';
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
const inputflagVegan = 'input[name="Flag_VEGAN"]';
const inputflagGlutenFree = 'input[name="Flag_GLUTEN_FREE"]';
const inputflagSugarFree = 'input[name="Flag_SUGAR_FREE"]';

const productPage = 'text=🍎 Продукты';
const dishPage = 'text=🍽️ Блюда';

const productList = '#productList';
const btnAddProduct = '#btnAddProduct';
const btnSubmitProduct = '#btnSubmitProduct';

const productForm = '#productForm';

const productCard = '#page-products .card';
const productCardDeleteBtn = '#page-products .card .btn-delete';
const productCardEditBtn = '#page-products .card .btn-edit';
const productCardTitle = '#page-products .card-title';

const toastContainer = '#toastContainer'
const toastError = '.toast.error'

const dishList = '#dishList';
const btnAddDish = '#btnAddDish';
const btnSubmitDish = '#btnSubmitDish';
const dishSize = '#dishSize';
const dishCalorieContent = '#dishCalorieContent';
const dishProteins = '#dishProteins';
const dishFats = '#dishFats';
const dishCarbohydrates = '#dishCarbohydrates';
const dishCompProduct = '.comp-product';
const dishCompAmount = '.comp-amount';

const productInvalidCpfc = [
  { cal: '-1', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '-1', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '-1', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '-1' },
  { cal: '-0.01', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '-0.01', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '-0.01', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '-0.01' },
  { cal: '0', prot: '100.01', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '100.01', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '100.01' },
  { cal: '0', prot: '101', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '101', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '101' }
]
const productValidCpfc = [
  { cal: '0', prot: '0', fats: '0', carb: '0' },
  { cal: '1', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '1', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '1', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '1' },
  { cal: '0.01', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '0.01', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '0.01', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '0.01' },
  { cal: '100', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '100', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '100', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '100' },
  { cal: '99', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '99', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '99', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '99' },
  { cal: '99.99', prot: '0', fats: '0', carb: '0' },
  { cal: '0', prot: '99.99', fats: '0', carb: '0' },
  { cal: '0', prot: '0', fats: '99.99', carb: '0' },
  { cal: '0', prot: '0', fats: '0', carb: '99.99' },
]

test.describe('Products', () => {
  test.beforeEach(async ({ page }) => {
    await cleanupDatabase();
    await page.goto('/');
    await page.click(productPage);
    await page.waitForSelector(productList);
  });


  test.describe('Create product', () => {
    test('Create product short name error', async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'С');
      await page.click(btnSubmitProduct);

      await expect(page.locator(productForm)).toBeVisible();
    });

    productInvalidCpfc.forEach((product) => {
      test(`Create product invalid CPFC error: ${product.cal} ${product.prot} ${product.fats} ${product.carb}`, async ({ page }) => {
        await page.click(btnAddProduct);
        await page.fill(inputName, 'Product');
        await page.fill(inputCalorieContent, product.cal);
        await page.fill(inputProteins, product.prot);
        await page.fill(inputFats, product.fats);
        await page.fill(inputCarbohydrates, product.carb);
        await page.click(btnSubmitProduct);

        await expect(page.locator(productForm)).toBeVisible();
      });
    });

    productValidCpfc.forEach((product) => {
      test(`Create product valid CPFC success: ${product.cal} ${product.prot} ${product.fats} ${product.carb}`, async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Product');
      await page.fill(inputCalorieContent, product.cal);
      await page.fill(inputProteins, product.prot);
      await page.fill(inputFats, product.fats);
      await page.fill(inputCarbohydrates, product.carb);
      await page.click(btnSubmitProduct);

      await page.waitForSelector(productList);
      await expect(page.locator(productCardTitle)).toContainText('Product');
      });
    });

    test('Create product more than 6 photos error', async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png'
        ]
      );
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png'
        ]
      );

      await expect(page.locator(toastContainer)).toContainText('Максимум 5 фотографий');
    });

    test('Create product valid data success', async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.fill(inputComposition, 'Корнеплод');
      await page.selectOption(selectCategory, { label: 'Овощи' });
      await page.selectOption(selectCookingNecessity, { label: 'Требует приготовления' });
      await page.check(inputflagVegan);
      await page.check(inputflagGlutenFree);
      await page.check(inputflagSugarFree);
      await page.click(btnSubmitProduct);

      await expect(page.locator(productCardTitle)).toContainText('Свекла');
    });
  });
  
  test.describe('Retrieve product', () => {
    test.beforeEach(async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/svekla.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/svekla.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/svekla.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/svekla.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/svekla.png'
        ]
      );
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.fill(inputComposition, 'Корнеплод');
      await page.selectOption(selectCategory, { label: 'Овощи' });
      await page.selectOption(selectCookingNecessity, { label: 'Требует приготовления' });
      await page.check(inputflagVegan);
      await page.check(inputflagGlutenFree);
      await page.check(inputflagSugarFree);
      await page.click(btnSubmitProduct);

      await page.waitForSelector(productCard);
    });


    test('Retrieve product just created product has correct data', async ({ page }) => {
      await page.click(productCard);

      const name = page.locator('.modal-header');
      const photos = page.locator('.modal-body img');
      const caloriesRow = page.locator('.detail-item')
        .filter({ hasText: 'Калорийность' });
      const proteinsRow = page.locator('.detail-item')
        .filter({ hasText: 'Белки' });
      const fatsRow = page.locator('.detail-item')
        .filter({ hasText: 'Жиры' });
      const carbohydratesRow = page.locator('.detail-item')
        .filter({ hasText: 'Углеводы' });
      const categoryRow = page.locator('.detail-item')
        .filter({ hasText: 'Категория' });
      const cookingNecessityRow = page.locator('.detail-item')
        .filter({ hasText: 'Готовность' });
      const compositionRow = page.locator('.detail-item')
        .filter({ hasText: 'Состав' });
      const flagsRow = page.locator('.detail-item')
        .filter({ hasText: 'Флаги' });
      const createdAtRow = page.locator('.detail-item')
        .filter({ hasText: 'Создан' });
      const updatedAtRow = page.locator('.detail-item')
        .filter({ hasText: 'Изменён' });

      await expect(name).toContainText('Свекла');
      await expect(photos).toHaveCount(5);
      await expect(caloriesRow).toContainText('43.0 ккал / 100 г');
      await expect(proteinsRow).toContainText('1.5 г');
      await expect(fatsRow).toContainText('0.1 г');
      await expect(carbohydratesRow).toContainText('8.8 г');
      await expect(categoryRow).toContainText('Овощи');
      await expect(cookingNecessityRow).toContainText('Требует приготовления');
      await expect(compositionRow).toContainText('Корнеплод'); 
      await expect(flagsRow).toContainText('Без сахара');
      await expect(flagsRow).toContainText('Веган');
      await expect(flagsRow).toContainText('Без глютена');
      await expect(createdAtRow).toHaveText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
      await expect(updatedAtRow).toContainText('—');
    });

    test('Retrieve product updated product has correct data', async ({ page }) => {
      await page.click(productCardEditBtn);
      await page.fill(inputName, 'Свекла!!!');
      await page.locator(btnPhotoRemove).nth(1).click();
      await page.locator(btnPhotoRemove).nth(1).click();
      await page.locator(btnPhotoRemove).nth(1).click();
      await page.fill(inputCalorieContent, '100');
      await page.fill(inputProteins, '10');
      await page.fill(inputFats, '20');
      await page.fill(inputCarbohydrates, '30');
      await page.fill(inputComposition, 'Корнеплод&faceroll');
      await page.selectOption(selectCategory, { label: 'Зелень' });
      await page.selectOption(selectCookingNecessity, { label: 'Полуфабрикат' });
      await page.uncheck(inputflagVegan);
      await page.uncheck(inputflagGlutenFree);
      await page.uncheck(inputflagSugarFree);
      await page.click(btnSubmitProduct);

      await page.click(productCard);

      const name = page.locator('.modal-header');
      const photos = page.locator('.modal-body img');
      const caloriesRow = page.locator('.detail-item')
        .filter({ hasText: 'Калорийность' });
      const proteinsRow = page.locator('.detail-item')
        .filter({ hasText: 'Белки' });
      const fatsRow = page.locator('.detail-item')
        .filter({ hasText: 'Жиры' });
      const carbohydratesRow = page.locator('.detail-item')
        .filter({ hasText: 'Углеводы' });
      const categoryRow = page.locator('.detail-item')
        .filter({ hasText: 'Категория' });
      const cookingNecessityRow = page.locator('.detail-item')
        .filter({ hasText: 'Готовность' });
      const compositionRow = page.locator('.detail-item')
        .filter({ hasText: 'Состав' });
      const flagsRow = page.locator('.detail-item')
        .filter({ hasText: 'Флаги' });
      const createdAtRow = page.locator('.detail-item')
        .filter({ hasText: 'Создан' });
      const updatedAtRow = page.locator('.detail-item')
        .filter({ hasText: 'Изменён' });

      await expect(name).toContainText('Свекла!!!');
      await expect(photos).toHaveCount(2);
      await expect(caloriesRow).toContainText('100.0 ккал / 100 г');
      await expect(proteinsRow).toContainText('10.0 г');
      await expect(fatsRow).toContainText('20.0 г');
      await expect(carbohydratesRow).toContainText('30.0 г');
      await expect(categoryRow).toContainText('Зелень');
      await expect(cookingNecessityRow).toContainText('Полуфабрикат');
      await expect(compositionRow).toContainText('Корнеплод&faceroll'); 
      await expect(flagsRow).toContainText('—');
      await expect(createdAtRow).toHaveText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
      await expect(updatedAtRow).toHaveText(/\d{2}\.\d{2}\.\d{4}, \d{2}:\d{2}/);
    });
  });

  test.describe('Update product', () => {
    test.beforeEach(async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.click(btnSubmitProduct);

      await page.waitForSelector(productCard);
    });


    test('Update product short name error', async ({ page }) => {
      await page.click(productCardEditBtn);
      await page.fill(inputName, 'С');
      await page.click(btnSubmitProduct);

      await expect(page.locator(productForm)).toBeVisible();
    });

    productInvalidCpfc.forEach((product) => {
      test(`Update product invalid CPFC error: ${product.cal} ${product.prot} ${product.fats} ${product.carb}`, async ({ page }) => {
        await page.click(productCardEditBtn);
        await page.fill(inputName, 'Product');
        await page.fill(inputCalorieContent, product.cal);
        await page.fill(inputProteins, product.prot);
        await page.fill(inputFats, product.fats);
        await page.fill(inputCarbohydrates, product.carb);
        await page.click(btnSubmitProduct);

        await expect(page.locator(productForm)).toBeVisible();
      });
    });

    productValidCpfc.forEach((product) => {
      test(`Update product valid CPFC success: ${product.cal} ${product.prot} ${product.fats} ${product.carb}`, async ({ page }) => {
        await page.click(productCardEditBtn);
        await page.fill(inputName, 'Product');
        await page.fill(inputCalorieContent, product.cal);
        await page.fill(inputProteins, product.prot);
        await page.fill(inputFats, product.fats);
        await page.fill(inputCarbohydrates, product.carb);
        await page.click(btnSubmitProduct);

      await expect(page.locator(productCardTitle)).toContainText('Product');
      });
    });

    test('Update product more than 6 photos error', async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png',
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png'
        ]
      );
      await page.setInputFiles(
        inputPhotos,
        [
          'D:/Programs/HITS/QA/hits_2026_lab1 _pictures/water.png'
        ]
      );

      await expect(page.locator(toastContainer)).toContainText('Максимум 5 фотографий');
    });

    test('Update product valid data success', async ({ page }) => {
      await page.click(productCardEditBtn);
      await page.fill(inputName, 'Новое');
      await page.fill(inputCalorieContent, '100');
      await page.fill(inputProteins, '10');
      await page.fill(inputFats, '20');
      await page.fill(inputCarbohydrates, '30');
      await page.fill(inputComposition, 'Корнеплод');
      await page.selectOption(selectCategory, { label: 'Овощи' });
      await page.selectOption(selectCookingNecessity, { label: 'Требует приготовления' });
      await page.check(inputflagVegan);
      await page.check(inputflagGlutenFree);
      await page.check(inputflagSugarFree);
      await page.click(btnSubmitProduct);

      await expect(page.locator(productCardTitle)).toContainText('Новое');
    });
  });

  test.describe('Delete product', () => {
    test('Delete product unused product success', async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.click(btnSubmitProduct);
      await page.waitForSelector(productCard);

      page.on('dialog', dialog => dialog.accept());
      await page.click(productCardDeleteBtn);
      await expect(page.locator(productCardTitle)).toHaveCount(0);
    });

    test('Delete product used product error', async ({ page }) => {
      await page.click(btnAddProduct);
      await page.fill(inputName, 'Свекла');
      await page.fill(inputCalorieContent, '43');
      await page.fill(inputProteins, '1.5');
      await page.fill(inputFats, '0.1');
      await page.fill(inputCarbohydrates, '8.8');
      await page.click(btnSubmitProduct);
      
      await page.click(dishPage);
      await page.click(btnAddDish);
      await page.fill(inputName, 'Свекольный суп');
      await page.locator(dishCompProduct).selectOption({ label: 'Свекла (🔥43.0)' });
      await page.locator(dishCompAmount).fill('150');
      await page.fill(dishSize, '200');
      await page.fill(dishCalorieContent, '50');
      await page.fill(dishProteins, '5');
      await page.fill(dishFats, '2');
      await page.fill(dishCarbohydrates, '3');
      await page.click(btnSubmitDish);
      
      await page.click(productPage);
      page.on('dialog', dialog => dialog.accept());
      await page.click(productCardDeleteBtn);
      

      await expect(page.locator(toastError)).toContainText('Невозможно удалить продукт');
      await expect(page.locator(toastError)).toContainText('Свекольный суп');
    });
  });

});