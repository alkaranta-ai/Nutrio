// BASE DE DATOS DE RECETAS
// IMPORTANTE: app.js usa índices FIJOS RECIPES_DB[0]..[7] para armar la pantalla
// de Inicio y el Plan Semanal (0,1 = desayuno | 2,3 = almuerzo | 4,5 = meriendas | 6,7 = cena).
// Por eso las recetas 8 en adelante son "extra" solo para el chat (antojos) y
// NUNCA hay que insertarlas antes del índice 7, o se rompe Inicio/Semana.
//
// "keywords" = palabras que el chat busca en el mensaje del usuario para
// reconocer un antojo y ofrecer esta receta como respuesta.
const RECIPES_DB = [
  // Desayunos (0 y 1)
  { id: "d1", name: "Pancakes de Avena y Claras", category: "desayuno", kcal: 350, ingredients: ["40g Avena", "3 Claras de huevo", "100g Frutillas"], keywords: ["pancake", "panqueque", "avena"] },
  { id: "d2", name: "Tostadas con Huevo y Aguacate", category: "desayuno", kcal: 450, ingredients: ["2 panes integrales", "1 Huevo entero", "Media palta (aguacate)"], keywords: ["tostada", "huevo", "aguacate", "palta"] },
  // Almuerzos (2 y 3)
  { id: "a1", name: "Pechuga Grillé con Arroz Integral", category: "almuerzo", kcal: 550, ingredients: ["150g Pechuga de pollo", "70g Arroz integral", "Mix de vegetales verdes"], keywords: ["pollo", "arroz"] },
  { id: "a2", name: "Filete de Carne con Puré de Calabaza", category: "almuerzo", kcal: 650, ingredients: ["180g Carne magra de res", "200g Calabaza", "1 cdita Aceite de oliva"], keywords: ["carne", "bife", "asado", "calabaza"] },
  // Meriendas (4 y 5)
  { id: "m1", name: "Yogur Griego con Nueces y Banana", category: "meriendas", kcal: 300, ingredients: ["200g Yogur natural descremado", "15g Nueces", "Media banana"], keywords: ["yogur", "banana", "nueces"] },
  { id: "m2", name: "Batido Proteico con Avena", category: "meriendas", kcal: 380, ingredients: ["1 scoop Proteína en polvo", "30g Avena", "250ml Leche descremada"], keywords: ["batido", "licuado", "proteina", "shake"] },
  // Cenas (6 y 7)
  { id: "c1", name: "Filete de Pescado con Ensalada Completa", category: "cena", kcal: 400, ingredients: ["150g Pescado blanco", "Tomate", "Lechuga", "Zanahoria"], keywords: ["pescado", "ensalada"] },
  { id: "c2", name: "Salteado de Pollo y Cubos de Zucchini", category: "cena", kcal: 500, ingredients: ["150g Pollo", "1 Zucchini grande", "Cebolla", "Morrón"], keywords: ["salteado", "zucchini", "zapallito", "wok"] },

  // --- Extras para antojos del chat (no se muestran en Inicio/Semana) ---
  { id: "x1", name: "Pizza Fit de Masa de Coliflor", category: "antojo", kcal: 480,
    ingredients: ["1 base de pizza de coliflor o masa integral fina", "3 cdas Salsa de tomate natural", "60g Muzzarella light", "Vegetales a elección (morrón, cebolla, tomate cherry)", "Orégano"],
    instructions: ["Precalentar el horno a 200°C.", "Cubrir la base con la salsa de tomate.", "Agregar la muzzarella y los vegetales.", "Hornear 12-15 minutos hasta que gratine y espolvorear orégano."],
    keywords: ["pizza"] },
  { id: "x2", name: "Hamburguesa Casera Magra", category: "antojo", kcal: 520,
    ingredients: ["150g Carne picada magra (o lentejas para versión vegetariana)", "1 pan integral", "1 hoja de lechuga", "1 rodaja de tomate", "1 cdita Mostaza o yogur en vez de mayonesa"],
    instructions: ["Formar el medallón y cocinar en sartén o parrilla a fuego medio, 4 minutos por lado.", "Tostar el pan integral.", "Armar con lechuga, tomate y la salsa elegida."],
    keywords: ["hamburguesa", "burger"] },
  { id: "x3", name: "Fideos Integrales con Pollo y Vegetales", category: "antojo", kcal: 560,
    ingredients: ["80g Fideos integrales", "120g Pechuga de pollo en tiras", "Vegetales salteados (zapallito, morrón, cebolla)", "1 cdita Aceite de oliva", "Parmesano a gusto"],
    instructions: ["Cocinar los fideos integrales al dente.", "Saltear el pollo con los vegetales en el aceite.", "Mezclar todo y servir con un toque de parmesano."],
    keywords: ["fideos", "pasta", "spaghetti", "tallarines", "noquis", "ñoquis"] },
  { id: "x4", name: "Mousse Proteico de Cacao", category: "antojo", kcal: 220,
    ingredients: ["1 banana madura", "1 scoop Proteína o cacao amargo en polvo", "100g Yogur natural o griego", "Canela a gusto"],
    instructions: ["Pisar la banana hasta hacer puré.", "Mezclar con el yogur, el cacao/proteína y la canela.", "Enfriar en la heladera 15 minutos antes de servir."],
    keywords: ["dulce", "postre", "chocolate", "cacao"] },
  { id: "x5", name: "Nice Cream de Banana y Frutos Rojos", category: "antojo", kcal: 180,
    ingredients: ["2 bananas congeladas", "80g Frutos rojos congelados", "Un chorrito de leche o bebida vegetal"],
    instructions: ["Procesar las bananas congeladas con los frutos rojos y la leche hasta lograr textura cremosa tipo helado.", "Servir de inmediato."],
    keywords: ["helado", "heladito"] }
];
