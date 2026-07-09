// BASE DE DATOS DE RECETAS — ÚNICA FUENTE DE VERDAD (no duplicar en otros archivos)
const RECIPES_DB = [

  // ---------- DESAYUNOS ----------
  { id: "d1", name: "Pancakes de Avena y Claras", category: "desayuno", kcal: 350, country: "General", tags: ["saludable"],
    ingredients: ["40g Avena", "3 Claras de huevo", "100g Frutillas"],
    instructions: ["Licuar la avena con las claras hasta lograr una masa homogénea.", "Cocinar de a pequeñas porciones en sartén antiadherente, 2 minutos por lado.", "Servir apilados con las frutillas cortadas por encima."] },

  { id: "d2", name: "Tostadas con Huevo y Aguacate", category: "desayuno", kcal: 450, country: "General", tags: [],
    ingredients: ["2 panes integrales", "1 Huevo entero", "Media palta (aguacate)"],
    instructions: ["Tostar el pan integral.", "Pisar la palta con un tenedor y salpimentar.", "Untar el pan con la palta y coronar con el huevo (frito o poché)."] },

  { id: "d3", name: "Tortilla de Avena y Plátano", category: "desayuno", kcal: 400, country: "General", tags: ["vegetariano", "sin_lactosa"],
    ingredients: ["40g de avena en hojuelas", "1 plátano (banana) maduro", "2 huevos", "Un toque de canela"],
    instructions: ["Pisar el plátano con un tenedor hasta hacer un puré.", "Mezclarlo con los huevos, la avena y la canela.", "Cocinar en una sartén antiadherente a fuego medio, 3 minutos por lado."] },

  { id: "d4", name: "Bowl de Yogur con Granola y Frutos Rojos", category: "desayuno", kcal: 380, country: "General", tags: ["vegetariano"],
    ingredients: ["200g Yogur natural", "40g Granola casera", "80g Frutos rojos (frutilla, arándanos)"],
    instructions: ["Colocar el yogur como base en un bowl.", "Agregar la granola por encima.", "Terminar con los frutos rojos frescos o descongelados."] },

  { id: "d5", name: "Huevos Revueltos con Espinaca y Queso", category: "desayuno", kcal: 420, country: "General", tags: ["sin_carbo"],
    ingredients: ["3 Huevos", "1 puñado de espinaca fresca", "30g Queso fresco", "Sal y pimienta"],
    instructions: ["Saltear la espinaca en una sartén hasta que se ablande.", "Batir los huevos y agregarlos a la sartén.", "Revolver a fuego bajo y agregar el queso en cubos al final."] },

  { id: "d6", name: "Chia Pudding con Mango", category: "desayuno", kcal: 320, country: "General", tags: ["vegetariano", "sin_lactosa"],
    ingredients: ["3 cdas Semillas de chía", "250ml Leche descremada o vegetal", "Media taza de mango en cubos"],
    instructions: ["Mezclar la chía con la leche en un frasco y revolver bien.", "Dejar reposar en la heladera mínimo 4 horas (o toda la noche).", "Servir frío coronado con el mango picado."] },

  { id: "d7", name: "Sandwich de Palta y Tomate Integral", category: "desayuno", kcal: 360, country: "General", tags: ["vegetariano"],
    ingredients: ["2 rodajas de pan integral", "Media palta", "1 Tomate en rodajas", "Orégano"],
    instructions: ["Tostar el pan integral.", "Untar con la palta pisada.", "Agregar las rodajas de tomate y espolvorear orégano."] },

  { id: "d8", name: "Panqueque de Ricota y Miel", category: "desayuno", kcal: 410, country: "Argentina", tags: ["vegetariano"],
    ingredients: ["1 Huevo", "100g Ricota descremada", "1 cda Harina integral", "1 cdita Miel"],
    instructions: ["Batir el huevo con la ricota y la harina hasta integrar.", "Cocinar en sartén antiadherente caliente, 2 minutos por lado.", "Servir tibio con un hilo de miel."] },

  // ---------- ALMUERZOS ----------
  { id: "a1", name: "Pechuga Grillé con Arroz Integral", category: "almuerzo", kcal: 550, country: "General", tags: [],
    ingredients: ["150g Pechuga de pollo", "70g Arroz integral", "Mix de vegetales verdes"],
    instructions: ["Cocinar el arroz integral según las indicaciones del paquete.", "Grillar la pechuga sazonada 5-6 minutos por lado.", "Servir junto a los vegetales salteados o al vapor."] },

  { id: "a2", name: "Filete de Carne con Puré de Calabaza", category: "almuerzo", kcal: 650, country: "General", tags: [],
    ingredients: ["180g Carne magra de res", "200g Calabaza", "1 cdita Aceite de oliva"],
    instructions: ["Hervir o hornear la calabaza hasta que esté tierna y hacer puré.", "Cocinar el filete a la plancha al punto deseado.", "Servir el filete sobre el puré, con un hilo de aceite de oliva."] },

  { id: "a3", name: "Pollo con Arroz Primavera", category: "almuerzo", kcal: 550, country: "General", tags: ["saludable"],
    ingredients: ["200g de pechuga de pollo", "80g de arroz", "Media taza de arvejas y zanahoria", "1 cucharadita de aceite de oliva"],
    instructions: ["Cocinar el arroz de forma tradicional.", "Cortar el pollo en cubos y dorarlo en una sartén con el aceite.", "Agregar las verduras al pollo, cocinar 5 minutos más y mezclar con el arroz."] },

  { id: "a4", name: "Ensalada de Quinoa con Garbanzos", category: "almuerzo", kcal: 480, country: "Mediterráneo", tags: ["vegetariano", "sin_lactosa"],
    ingredients: ["80g Quinoa", "100g Garbanzos cocidos", "Tomate cherry", "Pepino", "Limón y aceite de oliva"],
    instructions: ["Cocinar la quinoa en agua con sal hasta que absorba el líquido.", "Mezclar en un bowl con los garbanzos, tomate y pepino picados.", "Aliñar con jugo de limón, aceite de oliva y sal."] },

  { id: "a5", name: "Milanesa de Pollo al Horno con Ensalada", category: "almuerzo", kcal: 520, country: "Argentina", tags: [],
    ingredients: ["1 Pechuga de pollo fileteada", "Pan rallado integral", "1 Huevo", "Lechuga y tomate"],
    instructions: ["Pasar el pollo por huevo batido y luego por pan rallado.", "Hornear a 200°C durante 20 minutos, dando vuelta a mitad de cocción.", "Servir con ensalada fresca de lechuga y tomate."] },

  { id: "a6", name: "Salmón con Batatas Asadas", category: "almuerzo", kcal: 600, country: "General", tags: ["sin_lactosa"],
    ingredients: ["150g Filete de salmón", "1 Batata mediana", "Romero fresco", "Aceite de oliva"],
    instructions: ["Cortar la batata en bastones y hornear con aceite y romero a 200°C por 25 minutos.", "Sellar el salmón en sartén caliente, 3-4 minutos por lado.", "Servir el salmón junto a los bastones de batata."] },

  { id: "a7", name: "Wok de Vegetales y Tofu", category: "almuerzo", kcal: 430, country: "Asiático", tags: ["vegetariano", "sin_lactosa"],
    ingredients: ["150g Tofu firme", "Morrón, brócoli y zanahoria", "2 cdas Salsa de soja", "1 cdita Aceite de sésamo"],
    instructions: ["Cortar el tofu en cubos y dorarlo en el wok con un poco de aceite.", "Retirar el tofu y saltear los vegetales a fuego fuerte 4-5 minutos.", "Reincorporar el tofu, agregar la salsa de soja y mezclar todo 1 minuto más."] },

  { id: "a8", name: "Guiso de Lentejas", category: "almuerzo", kcal: 500, country: "Argentina", tags: ["vegetariano"],
    ingredients: ["150g Lentejas", "Cebolla, zanahoria y apio", "Pulpa de tomate", "Comino y laurel"],
    instructions: ["Rehogar la cebolla, zanahoria y apio picados en una olla.", "Agregar las lentejas, la pulpa de tomate y cubrir con agua.", "Cocinar a fuego medio 30-35 minutos, condimentando con comino y laurel."] },

  // ---------- MERIENDAS ----------
  { id: "m1", name: "Yogur Griego con Nueces y Banana", category: "meriendas", kcal: 300, country: "General", tags: ["vegetariano"],
    ingredients: ["200g Yogur natural descremado", "15g Nueces", "Media banana"],
    instructions: ["Colocar el yogur en un bowl o vaso.", "Cortar la banana en rodajas y agregarla encima.", "Coronar con las nueces picadas."] },

  { id: "m2", name: "Batido Proteico con Avena", category: "meriendas", kcal: 380, country: "General", tags: [],
    ingredients: ["1 scoop Proteína en polvo", "30g Avena", "250ml Leche descremada"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea.", "Servir inmediatamente."] },

  { id: "m3", name: "Frutos Secos y Manzana", category: "meriendas", kcal: 250, country: "General", tags: ["vegetariano", "sin_lactosa"],
    ingredients: ["1 Manzana", "20g Mix de frutos secos (nueces, almendras, castañas)"],
    instructions: ["Cortar la manzana en gajos.", "Servir junto al mix de frutos secos como snack."] },

  { id: "m4", name: "Tostada Integral con Queso Untable y Tomate", category: "meriendas", kcal: 280, country: "General", tags: ["vegetariano"],
    ingredients: ["1 Tostada integral", "2 cdas Queso untable light", "Rodajas de tomate"],
    instructions: ["Untar la tostada con el queso.", "Agregar las rodajas de tomate por encima.", "Sazonar con una pizca de sal y orégano."] },

  { id: "m5", name: "Barra de Cereal Casera", category: "meriendas", kcal: 260, country: "General", tags: ["vegetariano"],
    ingredients: ["50g Avena", "1 cda Miel", "20g Pasas de uva", "1 cda Manteca de maní"],
    instructions: ["Mezclar todos los ingredientes en un bowl hasta integrar.", "Compactar la mezcla en un molde chico forrado con papel manteca.", "Enfriar en la heladera 1 hora y cortar en barras."] },

  { id: "m6", name: "Licuado de Frutilla y Avena", category: "meriendas", kcal: 290, country: "General", tags: ["vegetariano", "sin_lactosa"],
    ingredients: ["150g Frutillas", "30g Avena", "200ml Leche vegetal o descremada"],
    instructions: ["Colocar las frutillas, la avena y la leche en la licuadora.", "Licuar hasta lograr una textura suave.", "Servir bien frío."] },

  // ---------- CENAS ----------
  { id: "c1", name: "Filete de Pescado con Ensalada Completa", category: "cena", kcal: 400, country: "General", tags: ["sin_lactosa"],
    ingredients: ["150g Pescado blanco", "Tomate", "Lechuga", "Zanahoria"],
    instructions: ["Sellar el pescado en sartén caliente con un poco de aceite, 3-4 minutos por lado.", "Cortar los vegetales de la ensalada y mezclarlos en un bowl.", "Servir el pescado junto a la ensalada, aliñada a gusto."] },

  { id: "c2", name: "Salteado de Pollo y Cubos de Zucchini", category: "cena", kcal: 500, country: "General", tags: [],
    ingredients: ["150g Pollo", "1 Zucchini grande", "Cebolla", "Morrón"],
    instructions: ["Cortar el pollo y los vegetales en cubos parejos.", "Saltear el pollo en sartén o wok hasta dorar.", "Agregar los vegetales y cocinar 5-6 minutos más, revolviendo seguido."] },

  { id: "c3", name: "Tacos de Carne y Aguacate", category: "cena", kcal: 600, country: "México", tags: ["sin_lactosa"],
    ingredients: ["3 tortillas de maíz", "150g de carne molida magra", "Medio aguacate", "Cebolla y cilantro picado"],
    instructions: ["Cocinar la carne en una sartén sazonando a gusto.", "Calentar las tortillas.", "Armar los tacos con la carne, rebanadas de aguacate, cebolla y cilantro."] },

  { id: "c4", name: "Sopa de Verduras con Pollo Desmenuzado", category: "cena", kcal: 350, country: "General", tags: ["sin_lactosa"],
    ingredients: ["100g Pechuga de pollo cocida y desmenuzada", "Zanahoria, apio y zapallo", "Caldo de verduras"],
    instructions: ["Cortar los vegetales en cubos pequeños y hervirlos en el caldo hasta que estén tiernos.", "Agregar el pollo desmenuzado.", "Cocinar 5 minutos más y servir caliente."] },

  { id: "c5", name: "Omelette de Espinaca y Champiñones", category: "cena", kcal: 380, country: "General", tags: ["sin_carbo", "vegetariano"],
    ingredients: ["3 Huevos", "1 puñado Espinaca", "5 Champiñones fileteados"],
    instructions: ["Saltear los champiñones y la espinaca en una sartén hasta que se ablanden.", "Batir los huevos y verterlos sobre el salteado.", "Cocinar tapado a fuego bajo hasta que cuaje, doblar al medio y servir."] },

  { id: "c6", name: "Pizza Casera de Vegetales (Integral)", category: "cena", kcal: 520, country: "Argentina", tags: ["vegetariano"],
    ingredients: ["1 Base de pizza integral", "Salsa de tomate", "Morrón, cebolla y champiñones", "Queso mozzarella light"],
    instructions: ["Cubrir la base con la salsa de tomate.", "Distribuir los vegetales y el queso por encima.", "Hornear a 220°C durante 12-15 minutos hasta gratinar."] },

  { id: "c7", name: "Ensalada Caesar con Pollo Grillado", category: "cena", kcal: 450, country: "General", tags: [],
    ingredients: ["150g Pechuga de pollo", "Lechuga romana", "Croutons integrales", "Aderezo Caesar light"],
    instructions: ["Grillar la pechuga y cortarla en tiras.", "Mezclar la lechuga con los croutons en un bowl grande.", "Agregar el pollo y aliñar con el aderezo Caesar."] },

  { id: "c8", name: "Wrap de Atún y Vegetales", category: "cena", kcal: 420, country: "General", tags: ["sin_lactosa"],
    ingredients: ["1 Tortilla de trigo integral", "1 Lata de atún al natural", "Lechuga, tomate y zanahoria rallada"],
    instructions: ["Escurrir el atún y mezclarlo con los vegetales picados.", "Colocar el relleno sobre la tortilla.", "Enrollar bien apretado y cortar al medio para servir."] },
];

// Helper: devuelve todas las recetas de una categoría ("desayuno", "almuerzo", "meriendas", "cena")
function getRecipesByCategory(category) {
  return RECIPES_DB.filter(r => r.category === category);
}

// Metadata visual por categoría (usada por app.js para íconos y etiquetas)
const CATEGORY_META = {
  desayuno: { icon: "🍳", label: "Desayuno" },
  almuerzo: { icon: "🍗", label: "Almuerzo" },
  meriendas: { icon: "🥪", label: "Merienda" },
  cena: { icon: "🍽️", label: "Cena" }
};
