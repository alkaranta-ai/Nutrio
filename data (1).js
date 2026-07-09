// ============================================================
// Base de datos nutricional — enfocada en alimentos e ingredientes
// comunes en Latinoamérica. Valores aproximados por 100 g (o 100 ml).
// Fuentes de referencia: USDA FoodData Central / tablas INCAP-CA
// (Instituto de Nutrición de Centroamérica y Panamá) / tablas
// nacionales de composición de alimentos, usadas como aproximación
// educativa, no como dato clínico exacto.
// ============================================================

const FOODS = [
  // --- Granos, tubérculos y cereales ---
  { id: "maiz",       name: "Choclo / maíz",         cat: "cereal",   kcal: 96,  protein: 3.4, carbs: 21,  fat: 1.5, fiber: 2.4, sodium: 15 },
  { id: "arroz",      name: "Arroz blanco cocido",   cat: "cereal",   kcal: 130, protein: 2.7, carbs: 28,  fat: 0.3, fiber: 0.4, sodium: 1 },
  { id: "tortilla",   name: "Tortilla de maíz",      cat: "cereal",   kcal: 218, protein: 5.7, carbs: 45,  fat: 2.7, fiber: 6.3, sodium: 15 },
  { id: "arepa",      name: "Arepa de maíz",         cat: "cereal",   kcal: 240, protein: 5.5, carbs: 51,  fat: 1.8, fiber: 3.5, sodium: 250 },
  { id: "yuca",       name: "Yuca / mandioca",       cat: "tuberculo",kcal: 160, protein: 1.4, carbs: 38,  fat: 0.3, fiber: 1.8, sodium: 14 },
  { id: "papa",       name: "Papa cocida",           cat: "tuberculo",kcal: 87,  protein: 1.9, carbs: 20,  fat: 0.1, fiber: 1.8, sodium: 5 },
  { id: "camote",     name: "Camote / batata",       cat: "tuberculo",kcal: 86,  protein: 1.6, carbs: 20,  fat: 0.1, fiber: 3,   sodium: 55 },
  { id: "quinoa",     name: "Quinoa cocida",         cat: "cereal",   kcal: 120, protein: 4.4, carbs: 21,  fat: 1.9, fiber: 2.8, sodium: 7 },
  { id: "avena",      name: "Avena cocida",          cat: "cereal",   kcal: 68,  protein: 2.4, carbs: 12,  fat: 1.4, fiber: 1.7, sodium: 4 },
  { id: "pan",        name: "Pan blanco",            cat: "cereal",   kcal: 265, protein: 9,   carbs: 49,  fat: 3.2, fiber: 2.7, sodium: 490 },

  // --- Leguminosas ---
  { id: "frijol_negro",name:"Frijoles negros cocidos",cat:"legumbre", kcal: 132, protein: 8.9, carbs: 24,  fat: 0.5, fiber: 8.7, sodium: 2 },
  { id: "lenteja",    name: "Lentejas cocidas",      cat: "legumbre", kcal: 116, protein: 9,   carbs: 20,  fat: 0.4, fiber: 7.9, sodium: 2 },
  { id: "garbanzo",   name: "Garbanzos cocidos",     cat: "legumbre", kcal: 164, protein: 8.9, carbs: 27,  fat: 2.6, fiber: 7.6, sodium: 7 },

  // --- Verduras y frutas ---
  { id: "aguacate",   name: "Palta / aguacate",      cat: "fruta",    kcal: 160, protein: 2,   carbs: 8.5, fat: 14.7,fiber: 6.7, sodium: 7 },
  { id: "tomate",     name: "Tomate",                cat: "verdura",  kcal: 18,  protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 },
  { id: "cilantro",   name: "Cilantro",               cat: "verdura",  kcal: 23,  protein: 2.1, carbs: 3.7, fat: 0.5, fiber: 2.8, sodium: 46 },
  { id: "chile",      name: "Chile / ají",           cat: "verdura",  kcal: 40,  protein: 1.9, carbs: 9,   fat: 0.4, fiber: 1.5, sodium: 9 },
  { id: "platano",    name: "Plátano macho cocido",  cat: "fruta",    kcal: 122, protein: 1.3, carbs: 32,  fat: 0.3, fiber: 2.3, sodium: 4 },
  { id: "banana",     name: "Banana / cambur",       cat: "fruta",    kcal: 89,  protein: 1.1, carbs: 23,  fat: 0.3, fiber: 2.6, sodium: 1 },
  { id: "mango",      name: "Mango",                 cat: "fruta",    kcal: 60,  protein: 0.8, carbs: 15,  fat: 0.4, fiber: 1.6, sodium: 1 },
  { id: "papaya",     name: "Papaya",                cat: "fruta",    kcal: 43,  protein: 0.5, carbs: 11,  fat: 0.3, fiber: 1.7, sodium: 8 },
  { id: "pina",       name: "Piña",                  cat: "fruta",    kcal: 50,  protein: 0.5, carbs: 13,  fat: 0.1, fiber: 1.4, sodium: 1 },
  { id: "guayaba",    name: "Guayaba",               cat: "fruta",    kcal: 68,  protein: 2.6, carbs: 14,  fat: 1,   fiber: 5.4, sodium: 2 },
  { id: "limon",      name: "Limón",                 cat: "fruta",    kcal: 29,  protein: 1.1, carbs: 9.3, fat: 0.3, fiber: 2.8, sodium: 2 },

  // --- Proteínas animales ---
  { id: "pollo",      name: "Pechuga de pollo",      cat: "proteina", kcal: 165, protein: 31,  carbs: 0,   fat: 3.6, fiber: 0,   sodium: 74 },
  { id: "carne_res",  name: "Carne de res magra",    cat: "proteina", kcal: 217, protein: 26,  carbs: 0,   fat: 12,  fiber: 0,   sodium: 60 },
  { id: "cerdo",      name: "Carne de cerdo",        cat: "proteina", kcal: 242, protein: 27,  carbs: 0,   fat: 14,  fiber: 0,   sodium: 62 },
  { id: "huevo",      name: "Huevo",                 cat: "proteina", kcal: 155, protein: 13,  carbs: 1.1, fat: 11,  fiber: 0,   sodium: 124 },
  { id: "pescado",    name: "Pescado blanco",        cat: "proteina", kcal: 105, protein: 21,  carbs: 0,   fat: 2,   fiber: 0,   sodium: 68 },
  { id: "atun",       name: "Atún en agua",          cat: "proteina", kcal: 116, protein: 26,  carbs: 0,   fat: 1,   fiber: 0,   sodium: 247 },
  { id: "queso_fresco",name:"Queso fresco",          cat: "lacteo",   kcal: 264, protein: 18,  carbs: 3.4, fat: 21,  fiber: 0,   sodium: 621 },
  { id: "leche",      name: "Leche entera",          cat: "lacteo",   kcal: 61,  protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0,   sodium: 43 },
  { id: "yogur",      name: "Yogur natural",         cat: "lacteo",   kcal: 59,  protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0,   sodium: 46 },

  // --- Grasas y otros ---
  { id: "aceite_oliva",name:"Aceite de oliva",       cat: "grasa",    kcal: 884, protein: 0,   carbs: 0,   fat: 100, fiber: 0,   sodium: 2 },
  { id: "azucar",     name: "Azúcar",                cat: "otro",     kcal: 387, protein: 0,   carbs: 100, fat: 0,   fiber: 0,   sodium: 1 },
];

function findFood(query) {
  const q = normalize(query);
  return FOODS.find(f => normalize(f.name).includes(q) || normalize(f.id).includes(q));
}

function searchFoods(query) {
  const q = normalize(query);
  return FOODS.filter(f => normalize(f.name).includes(q));
}

function normalize(str) {
  return (str || "").toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// ============================================================
// Recetas — variadas por región y tipo de comida.
// Cada ingrediente referencia un id de FOODS + gramos aproximados
// (o "u" para unidades, convertido a un peso estimado).
// ============================================================

const RECIPES = [
  {
    id: "r1", name: "Gallo pinto con huevo", region: "Costa Rica / Nicaragua", meal: "desayuno",
    tags: ["vegetariano"], time: 20,
    ingredients: [
      { food: "frijol_negro", g: 150 }, { food: "arroz", g: 150 },
      { food: "huevo", g: 100 }, { food: "cilantro", g: 5 },
    ],
    steps: [
      "Sofríe la cebolla y el chile picado hasta que estén transparentes.",
      "Agrega el arroz cocido y los frijoles negros cocidos, mezcla bien.",
      "Cocina revolviendo 5-7 minutos hasta que tome un color parejo.",
      "Sirve con huevo frito o revuelto y cilantro fresco encima.",
    ],
  },
  {
    id: "r2", name: "Arepas rellenas de pollo y aguacate", region: "Venezuela / Colombia", meal: "almuerzo",
    tags: [], time: 30,
    ingredients: [
      { food: "arepa", g: 200 }, { food: "pollo", g: 120 },
      { food: "aguacate", g: 60 }, { food: "tomate", g: 50 },
    ],
    steps: [
      "Prepara la masa de arepa y cocina en plancha o al horno hasta dorar.",
      "Deshilacha la pechuga de pollo previamente cocida.",
      "Abre la arepa por la mitad y rellena con pollo, aguacate y tomate.",
    ],
  },
  {
    id: "r3", name: "Ceviche de pescado", region: "Perú / Ecuador", meal: "almuerzo",
    tags: ["sin gluten"], time: 25,
    ingredients: [
      { food: "pescado", g: 180 }, { food: "limon", g: 80 },
      { food: "chile", g: 10 }, { food: "cilantro", g: 5 },
    ],
    steps: [
      "Corta el pescado fresco en cubos pequeños.",
      "Marina en jugo de limón durante 15-20 minutos hasta que 'cocine'.",
      "Agrega chile picado, cilantro y sal al gusto. Sirve frío.",
    ],
  },
  {
    id: "r4", name: "Bowl de quinoa con pollo y palta", region: "Andino", meal: "almuerzo",
    tags: ["alto en proteína"], time: 25,
    ingredients: [
      { food: "quinoa", g: 150 }, { food: "pollo", g: 120 },
      { food: "aguacate", g: 50 }, { food: "tomate", g: 60 },
    ],
    steps: [
      "Cocina la quinoa en agua con sal hasta que esté suave (15 min).",
      "Sella la pechuga de pollo en sartén y córtala en tiras.",
      "Arma el bowl con quinoa, pollo, aguacate en láminas y tomate.",
    ],
  },
  {
    id: "r5", name: "Tacos de carne con frijoles", region: "México", meal: "cena",
    tags: [], time: 20,
    ingredients: [
      { food: "tortilla", g: 100 }, { food: "carne_res", g: 120 },
      { food: "frijol_negro", g: 100 }, { food: "cilantro", g: 5 },
    ],
    steps: [
      "Cocina la carne en tiras con especias al gusto (comino, ajo, chile).",
      "Calienta las tortillas de maíz en comal.",
      "Rellena con carne, frijoles y cilantro fresco.",
    ],
  },
  {
    id: "r6", name: "Sopa de lentejas con verduras", region: "Andina / Caribeña", meal: "cena",
    tags: ["vegano", "sin gluten"], time: 35,
    ingredients: [
      { food: "lenteja", g: 180 }, { food: "tomate", g: 60 },
      { food: "camote", g: 80 },
    ],
    steps: [
      "Sofríe cebolla, ajo y tomate picado en una olla.",
      "Agrega las lentejas, el camote en cubos y agua o caldo de verduras.",
      "Cocina 25-30 minutos a fuego medio hasta que espese.",
    ],
  },
  {
    id: "r7", name: "Tostadas de aguacate con huevo", region: "Latinoamérica en general", meal: "desayuno",
    tags: ["vegetariano"], time: 10,
    ingredients: [
      { food: "pan", g: 60 }, { food: "aguacate", g: 70 }, { food: "huevo", g: 100 },
    ],
    steps: [
      "Tuesta el pan hasta que esté crocante.",
      "Machaca la palta con sal, limón y un toque de chile si gustas.",
      "Unta sobre el pan y corona con huevo poché o frito.",
    ],
  },
  {
    id: "r8", name: "Batido de banana y avena", region: "Latinoamérica en general", meal: "desayuno",
    tags: ["vegetariano"], time: 5,
    ingredients: [
      { food: "banana", g: 120 }, { food: "avena", g: 40 }, { food: "leche", g: 200 },
    ],
    steps: [
      "Coloca la banana, la avena y la leche en la licuadora.",
      "Licúa 30-45 segundos hasta obtener una textura cremosa.",
      "Sirve frío, opcionalmente con canela.",
    ],
  },
  {
    id: "r9", name: "Ensalada de garbanzo y queso fresco", region: "Latinoamérica en general", meal: "almuerzo",
    tags: ["vegetariano"], time: 15,
    ingredients: [
      { food: "garbanzo", g: 150 }, { food: "queso_fresco", g: 50 },
      { food: "tomate", g: 60 }, { food: "aceite_oliva", g: 10 },
    ],
    steps: [
      "Mezcla los garbanzos cocidos con el tomate picado en cubos.",
      "Agrega el queso fresco desmenuzado.",
      "Aliña con aceite de oliva, sal y limón al gusto.",
    ],
  },
  {
    id: "r10", name: "Pescado al horno con camote", region: "Costero", meal: "cena",
    tags: ["sin gluten", "alto en proteína"], time: 35,
    ingredients: [
      { food: "pescado", g: 180 }, { food: "camote", g: 150 }, { food: "limon", g: 20 },
    ],
    steps: [
      "Precalienta el horno a 200°C.",
      "Coloca el pescado sazonado sobre camote en rodajas.",
      "Hornea 20-25 minutos, sirve con jugo de limón.",
    ],
  },
  {
    id: "r11", name: "Yogur con papaya y avena", region: "Latinoamérica en general", meal: "snack",
    tags: ["vegetariano"], time: 5,
    ingredients: [
      { food: "yogur", g: 150 }, { food: "papaya", g: 100 }, { food: "avena", g: 20 },
    ],
    steps: [
      "Corta la papaya en cubos pequeños.",
      "Mezcla con el yogur natural y espolvorea avena por encima.",
    ],
  },
  {
    id: "r12", name: "Guacamole con totopos", region: "México", meal: "snack",
    tags: ["vegano", "sin gluten"], time: 10,
    ingredients: [
      { food: "aguacate", g: 150 }, { food: "tomate", g: 40 },
      { food: "cilantro", g: 5 }, { food: "limon", g: 15 },
    ],
    steps: [
      "Machaca la palta con un tenedor hasta lograr una textura semi-cremosa.",
      "Agrega tomate picado, cilantro, limón y sal.",
      "Sirve con totopos de maíz horneados.",
    ],
  },
];

function recipeMacros(recipe) {
  let kcal = 0, protein = 0, carbs = 0, fat = 0, fiber = 0;
  recipe.ingredients.forEach(ing => {
    const food = FOODS.find(f => f.id === ing.food);
    if (!food) return;
    const factor = ing.g / 100;
    kcal += food.kcal * factor;
    protein += food.protein * factor;
    carbs += food.carbs * factor;
    fat += food.fat * factor;
    fiber += food.fiber * factor;
  });
  return { kcal: Math.round(kcal), protein: Math.round(protein), carbs: Math.round(carbs), fat: Math.round(fat), fiber: Math.round(fiber) };
}
