// ─── ENUMS ──────────────────────────────
export var ProductCategory;
(function (ProductCategory) {
    ProductCategory["FROZEN"] = "FROZEN";
    ProductCategory["MEAT"] = "MEAT";
    ProductCategory["VEGETABLES"] = "VEGETABLES";
    ProductCategory["HERBS"] = "HERBS";
    ProductCategory["SPICES"] = "SPICES";
    ProductCategory["CEREALS"] = "CEREALS";
    ProductCategory["CANNED"] = "CANNED";
    ProductCategory["FOOD"] = "FOOD";
    ProductCategory["LIQUID"] = "LIQUID";
    ProductCategory["SWEETS"] = "SWEETS";
})(ProductCategory || (ProductCategory = {}));
export var CookingNecessity;
(function (CookingNecessity) {
    CookingNecessity["READY"] = "READY";
    CookingNecessity["SEMI_FINISHED"] = "SEMI_FINISHED";
    CookingNecessity["RAW"] = "RAW";
})(CookingNecessity || (CookingNecessity = {}));
export var DishCategory;
(function (DishCategory) {
    DishCategory["DESSERT"] = "DESSERT";
    DishCategory["FIRST"] = "FIRST";
    DishCategory["SECOND"] = "SECOND";
    DishCategory["DRINK"] = "DRINK";
    DishCategory["SALAD"] = "SALAD";
    DishCategory["SOUP"] = "SOUP";
    DishCategory["SNACK"] = "SNACK";
})(DishCategory || (DishCategory = {}));
export var Flag;
(function (Flag) {
    Flag["VEGAN"] = "VEGAN";
    Flag["GLUTEN_FREE"] = "GLUTEN_FREE";
    Flag["SUGAR_FREE"] = "SUGAR_FREE";
})(Flag || (Flag = {}));
export var SortField;
(function (SortField) {
    SortField["NAME"] = "NAME";
    SortField["CALORIE_CONTENT"] = "CALORIE_CONTENT";
    SortField["PROTEINS"] = "PROTEINS";
    SortField["FATS"] = "FATS";
    SortField["CARBOHYDRATES"] = "CARBOHYDRATES";
})(SortField || (SortField = {}));
// ─── Макросы ───────────────────────────
export const MacroMap = {
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
export const ProductCategoryLabels = {
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
export const CookingNecessityLabels = {
    [CookingNecessity.READY]: 'Готовый',
    [CookingNecessity.SEMI_FINISHED]: 'Полуфабрикат',
    [CookingNecessity.RAW]: 'Сырой',
};
export const DishCategoryLabels = {
    [DishCategory.DESSERT]: 'Десерт',
    [DishCategory.FIRST]: 'Первое',
    [DishCategory.SECOND]: 'Второе',
    [DishCategory.DRINK]: 'Напиток',
    [DishCategory.SALAD]: 'Салат',
    [DishCategory.SOUP]: 'Суп',
    [DishCategory.SNACK]: 'Перекус',
};
export const FlagLabels = {
    [Flag.VEGAN]: 'Веган',
    [Flag.GLUTEN_FREE]: 'Без глютена',
    [Flag.SUGAR_FREE]: 'Без сахара',
};
//# sourceMappingURL=models.js.map