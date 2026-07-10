// BASE DE DATOS DE RECETAS — ÚNICA FUENTE DE VERDAD (no duplicar en otros archivos)
//
// Cada receta tiene:
//   tags       -> restricciones que CUMPLE (vegetariano, vegano, sin_gluten, sin_lactosa, sin_carbo)
//   allergens  -> alérgenos que CONTIENE (huevo, lactosa, gluten, frutos_secos, soja, mariscos)
//   avoidFor   -> condiciones de salud para las que NO es ideal (hipertension, diabetes, colesterol_alto)
//
// Estos tres campos son los que usa el motor de filtrado (más abajo) para elegir
// qué recetas le puede mostrar a cada usuario según su perfil.

const RECIPES_DB = [

  // ---------- DESAYUNOS ----------
  { id: "d1", name: "Pancakes de Avena y Claras", category: "desayuno", kcal: 350, country: "General", tags: ["saludable"], allergens: [], avoidFor: [],
    ingredients: ["40g Avena", "3 Claras de huevo", "100g Frutillas"],
    instructions: ["Licuar la avena con las claras hasta lograr una masa homogénea.", "Cocinar de a pequeñas porciones en sartén antiadherente, 2 minutos por lado.", "Servir apilados con las frutillas cortadas por encima."] },

  { id: "d2", name: "Tostadas con Huevo y Aguacate", category: "desayuno", kcal: 450, country: "General", tags: [], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["2 panes integrales", "1 Huevo entero", "Media palta (aguacate)"],
    instructions: ["Tostar el pan integral.", "Pisar la palta con un tenedor y salpimentar.", "Untar el pan con la palta y coronar con el huevo (frito o poché)."] },

  { id: "d3", name: "Tortilla de Avena y Plátano", category: "desayuno", kcal: 400, country: "General", tags: ["vegetariano", "sin_lactosa"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["40g de avena en hojuelas", "1 plátano (banana) maduro", "2 huevos", "Un toque de canela"],
    instructions: ["Pisar el plátano con un tenedor hasta hacer un puré.", "Mezclarlo con los huevos, la avena y la canela.", "Cocinar en una sartén antiadherente a fuego medio, 3 minutos por lado."] },

  { id: "d4", name: "Bowl de Yogur con Granola y Frutos Rojos", category: "desayuno", kcal: 380, country: "General", tags: ["vegetariano"], allergens: ["lactosa", "gluten"], avoidFor: [],
    ingredients: ["200g Yogur natural", "40g Granola casera", "80g Frutos rojos (frutilla, arándanos)"],
    instructions: ["Colocar el yogur como base en un bowl.", "Agregar la granola por encima.", "Terminar con los frutos rojos frescos o descongelados."] },

  { id: "d5", name: "Huevos Revueltos con Espinaca y Queso", category: "desayuno", kcal: 420, country: "General", tags: ["sin_carbo"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["3 Huevos", "1 puñado de espinaca fresca", "30g Queso fresco", "Sal y pimienta"],
    instructions: ["Saltear la espinaca en una sartén hasta que se ablande.", "Batir los huevos y agregarlos a la sartén.", "Revolver a fuego bajo y agregar el queso en cubos al final."] },

  { id: "d6", name: "Chia Pudding con Mango", category: "desayuno", kcal: 320, country: "General", tags: ["vegetariano", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["3 cdas Semillas de chía", "250ml Leche descremada o vegetal", "Media taza de mango en cubos"],
    instructions: ["Mezclar la chía con la leche en un frasco y revolver bien.", "Dejar reposar en la heladera mínimo 4 horas (o toda la noche).", "Servir frío coronado con el mango picado."] },

  { id: "d7", name: "Sandwich de Palta y Tomate Integral", category: "desayuno", kcal: 360, country: "General", tags: ["vegetariano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["2 rodajas de pan integral", "Media palta", "1 Tomate en rodajas", "Orégano"],
    instructions: ["Tostar el pan integral.", "Untar con la palta pisada.", "Agregar las rodajas de tomate y espolvorear orégano."] },

  { id: "d8", name: "Panqueque de Ricota y Miel", category: "desayuno", kcal: 410, country: "Argentina", tags: ["vegetariano"], allergens: ["huevo", "lactosa", "gluten"], avoidFor: ["diabetes"],
    ingredients: ["1 Huevo", "100g Ricota descremada", "1 cda Harina integral", "1 cdita Miel"],
    instructions: ["Batir el huevo con la ricota y la harina hasta integrar.", "Cocinar en sartén antiadherente caliente, 2 minutos por lado.", "Servir tibio con un hilo de miel."] },

  { id: "d9", name: "Panqueques de Avena Veganos", category: "desayuno", kcal: 330, country: "General", tags: ["vegano", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["50g Avena", "1 Banana", "150ml Leche vegetal", "Canela"],
    instructions: ["Licuar la avena, la banana y la leche vegetal hasta integrar.", "Cocinar de a pequeñas porciones en sartén antiadherente, 2 minutos por lado.", "Espolvorear canela antes de servir."] },

  { id: "d10", name: "Huevos Duros con Palta y Tostada", category: "desayuno", kcal: 400, country: "General", tags: [], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["2 Huevos duros", "Media palta", "1 rodaja de pan integral"],
    instructions: ["Hervir los huevos 9-10 minutos y dejar enfriar.", "Tostar el pan y untar con la palta pisada.", "Servir los huevos en mitades junto a la tostada."] },

  { id: "d11", name: "Avena Overnight con Manzana", category: "desayuno", kcal: 350, country: "General", tags: ["vegetariano"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["50g Avena", "150g Yogur natural", "Media manzana en cubos", "Canela"],
    instructions: ["Mezclar la avena con el yogur en un frasco.", "Agregar la manzana picada y la canela, revolver.", "Dejar reposar en la heladera toda la noche y servir frío."] },

  { id: "d12", name: "Smoothie de Proteína y Frutos Rojos", category: "desayuno", kcal: 300, country: "General", tags: ["sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["1 scoop Proteína en polvo", "200ml Leche descremada", "80g Frutos rojos"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea.", "Servir inmediatamente bien frío."] },

  { id: "d13", name: "Arepa Rellena de Queso", category: "desayuno", kcal: 420, country: "Colombia", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["100g Harina de maíz precocida", "Agua y sal", "50g Queso blanco rallado"],
    instructions: ["Mezclar la harina con agua y sal hasta lograr una masa manejable.", "Formar la arepa y cocinarla en plancha o sartén 5 minutos por lado.", "Abrirla al medio y rellenar con el queso."] },

  { id: "d14", name: "Chilaquiles Verdes Ligeros", category: "desayuno", kcal: 460, country: "México", tags: ["vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["6 Tortillas de maíz", "150ml Salsa verde", "1 Huevo", "30g Queso fresco"],
    instructions: ["Cortar las tortillas en triángulos y tostarlas ligeramente.", "Calentar la salsa verde y sumergir las tortillas hasta ablandar.", "Coronar con el huevo frito y el queso fresco desmenuzado."] },

  { id: "d15", name: "Pan Árabe con Hummus y Verduras", category: "desayuno", kcal: 380, country: "Mediterráneo", tags: ["vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["1 Pan árabe o pita", "3 cdas Hummus", "Tomate y pepino en rodajas"],
    instructions: ["Tostar levemente el pan árabe.", "Untarlo con el hummus.", "Agregar el tomate y el pepino en rodajas por encima."] },

  { id: "d16", name: "Bowl de Frutas con Semillas de Girasol", category: "desayuno", kcal: 260, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 taza de frutas de estación", "1 cda Semillas de girasol", "Jugo de medio limón"],
    instructions: ["Cortar las frutas en cubos parejos.", "Rociar con el jugo de limón para evitar que se oxiden.", "Espolvorear las semillas de girasol antes de servir."] },

  { id: "d17", name: "Sándwich de Jamón y Queso Light", category: "desayuno", kcal: 400, country: "General", tags: [], allergens: ["lactosa", "gluten"], avoidFor: ["hipertension"],
    ingredients: ["2 rodajas de pan integral", "2 fetas de jamón cocido light", "1 feta de queso light"],
    instructions: ["Armar el sándwich con el jamón y el queso entre las rodajas de pan.", "Tostar en sandwichera o sartén hasta dorar de ambos lados.", "Cortar al medio y servir caliente."] },

  // ---------- ALMUERZOS ----------
  { id: "a1", name: "Pechuga Grillé con Arroz Integral", category: "almuerzo", kcal: 550, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pechuga de pollo", "70g Arroz integral", "Mix de vegetales verdes"],
    instructions: ["Cocinar el arroz integral según las indicaciones del paquete.", "Grillar la pechuga sazonada 5-6 minutos por lado.", "Servir junto a los vegetales salteados o al vapor."] },

  { id: "a2", name: "Filete de Carne con Puré de Calabaza", category: "almuerzo", kcal: 650, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Carne magra de res", "200g Calabaza", "1 cdita Aceite de oliva"],
    instructions: ["Hervir o hornear la calabaza hasta que esté tierna y hacer puré.", "Cocinar el filete a la plancha al punto deseado.", "Servir el filete sobre el puré, con un hilo de aceite de oliva."] },

  { id: "a3", name: "Pollo con Arroz Primavera", category: "almuerzo", kcal: 550, country: "General", tags: ["saludable", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["200g de pechuga de pollo", "80g de arroz", "Media taza de arvejas y zanahoria", "1 cucharadita de aceite de oliva"],
    instructions: ["Cocinar el arroz de forma tradicional.", "Cortar el pollo en cubos y dorarlo en una sartén con el aceite.", "Agregar las verduras al pollo, cocinar 5 minutos más y mezclar con el arroz."] },

  { id: "a4", name: "Ensalada de Quinoa con Garbanzos", category: "almuerzo", kcal: 480, country: "Mediterráneo", tags: ["vegetariano", "vegano", "sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["80g Quinoa", "100g Garbanzos cocidos", "Tomate cherry", "Pepino", "Limón y aceite de oliva"],
    instructions: ["Cocinar la quinoa en agua con sal hasta que absorba el líquido.", "Mezclar en un bowl con los garbanzos, tomate y pepino picados.", "Aliñar con jugo de limón, aceite de oliva y sal."] },

  { id: "a5", name: "Milanesa de Pollo al Horno con Ensalada", category: "almuerzo", kcal: 520, country: "Argentina", tags: [], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["1 Pechuga de pollo fileteada", "Pan rallado integral", "1 Huevo", "Lechuga y tomate"],
    instructions: ["Pasar el pollo por huevo batido y luego por pan rallado.", "Hornear a 200°C durante 20 minutos, dando vuelta a mitad de cocción.", "Servir con ensalada fresca de lechuga y tomate."] },

  { id: "a6", name: "Salmón con Batatas Asadas", category: "almuerzo", kcal: 600, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Filete de salmón", "1 Batata mediana", "Romero fresco", "Aceite de oliva"],
    instructions: ["Cortar la batata en bastones y hornear con aceite y romero a 200°C por 25 minutos.", "Sellar el salmón en sartén caliente, 3-4 minutos por lado.", "Servir el salmón junto a los bastones de batata."] },

  { id: "a7", name: "Wok de Vegetales y Tofu", category: "almuerzo", kcal: 430, country: "Asiático", tags: ["vegetariano", "vegano", "sin_lactosa"], allergens: ["soja"], avoidFor: ["hipertension"],
    ingredients: ["150g Tofu firme", "Morrón, brócoli y zanahoria", "2 cdas Salsa de soja", "1 cdita Aceite de sésamo"],
    instructions: ["Cortar el tofu en cubos y dorarlo en el wok con un poco de aceite.", "Retirar el tofu y saltear los vegetales a fuego fuerte 4-5 minutos.", "Reincorporar el tofu, agregar la salsa de soja y mezclar todo 1 minuto más."] },

  { id: "a8", name: "Guiso de Lentejas", category: "almuerzo", kcal: 500, country: "Argentina", tags: ["vegetariano", "vegano", "sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Lentejas", "Cebolla, zanahoria y apio", "Pulpa de tomate", "Comino y laurel"],
    instructions: ["Rehogar la cebolla, zanahoria y apio picados en una olla.", "Agregar las lentejas, la pulpa de tomate y cubrir con agua.", "Cocinar a fuego medio 30-35 minutos, condimentando con comino y laurel."] },

  { id: "a9", name: "Pollo al Curry con Arroz Basmati", category: "almuerzo", kcal: 580, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["200g Pechuga de pollo", "150ml Leche de coco", "1 cda Curry en polvo", "70g Arroz basmati"],
    instructions: ["Cocinar el arroz basmati aparte según indicaciones del paquete.", "Dorar el pollo en cubos y agregar el curry en polvo.", "Sumar la leche de coco y cocinar a fuego medio 10 minutos. Servir sobre el arroz."] },

  { id: "a10", name: "Bowl de Garbanzos y Vegetales Asados", category: "almuerzo", kcal: 500, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Garbanzos cocidos", "Zapallo, morrón y cebolla", "Aceite de oliva y comino"],
    instructions: ["Cortar los vegetales y hornear con aceite de oliva a 200°C por 25 minutos.", "Calentar los garbanzos con comino en una sartén.", "Mezclar todo en un bowl y servir tibio."] },

  { id: "a11", name: "Arroz Chaufa con Pollo", category: "almuerzo", kcal: 560, country: "Perú", tags: [], allergens: ["soja", "huevo"], avoidFor: ["hipertension"],
    ingredients: ["150g Pollo en cubos", "80g Arroz", "1 Huevo", "2 cdas Salsa de soja", "Cebolla de verdeo"],
    instructions: ["Cocinar el arroz y dejar enfriar (idealmente del día anterior).", "Saltear el pollo, agregar el huevo revuelto y mezclar.", "Incorporar el arroz frío, la salsa de soja y la cebolla de verdeo, saltear 3-4 minutos."] },

  { id: "a12", name: "Bandeja Paisa Ligera", category: "almuerzo", kcal: 650, country: "Colombia", tags: [], allergens: ["huevo"], avoidFor: ["hipertension"],
    ingredients: ["120g Carne molida magra", "100g Frijoles cocidos", "60g Arroz", "1 Huevo", "Media palta"],
    instructions: ["Cocinar los frijoles con un sofrito de cebolla y tomate.", "Dorar la carne molida sazonada aparte.", "Servir todo junto con el arroz, el huevo frito y la palta en láminas."] },

  { id: "a13", name: "Pescado a la Veracruzana", category: "almuerzo", kcal: 480, country: "México", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Filete de pescado blanco", "Tomate, cebolla y aceitunas", "Ajo y laurel"],
    instructions: ["Preparar una salsa rehogando cebolla, ajo y tomate picados.", "Agregar las aceitunas y el laurel, cocinar 10 minutos.", "Sumar el pescado y cocinar tapado 8-10 minutos a fuego bajo."] },

  { id: "a14", name: "Pasta Integral con Pesto de Espinaca", category: "almuerzo", kcal: 550, country: "General", tags: ["vegetariano"], allergens: ["gluten", "lactosa", "frutos_secos"], avoidFor: [],
    ingredients: ["90g Pasta integral", "Espinaca fresca", "20g Nueces", "20g Queso parmesano", "Aceite de oliva"],
    instructions: ["Cocinar la pasta integral en agua con sal.", "Procesar la espinaca con las nueces, el parmesano y el aceite hasta formar el pesto.", "Mezclar la pasta caliente con el pesto y servir."] },

  { id: "a15", name: "Cazuela de Garbanzos y Espinaca", category: "almuerzo", kcal: 480, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Garbanzos cocidos", "Espinaca fresca", "Tomate triturado", "Pimentón y comino"],
    instructions: ["Rehogar cebolla y ajo, agregar el tomate triturado y las especias.", "Sumar los garbanzos y un poco de agua, cocinar 15 minutos.", "Agregar la espinaca al final y cocinar 3 minutos más hasta que se ablande."] },

  { id: "a16", name: "Pollo a la Plancha con Ensalada de Quinoa", category: "almuerzo", kcal: 540, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "70g Quinoa", "Tomate, pepino y limón"],
    instructions: ["Cocinar la quinoa y dejar enfriar.", "Grillar la pechuga sazonada 5-6 minutos por lado.", "Mezclar la quinoa con el tomate y pepino picados, aliñar con limón y servir junto al pollo."] },

  { id: "a17", name: "Arroz con Pollo y Vegetales al Wok", category: "almuerzo", kcal: 520, country: "General", tags: ["sin_lactosa"], allergens: ["soja"], avoidFor: [],
    ingredients: ["150g Pollo en cubos", "70g Arroz", "Brócoli, zanahoria y morrón", "Salsa de soja"],
    instructions: ["Cocinar el arroz aparte.", "Saltear el pollo en el wok hasta dorar, agregar los vegetales.", "Incorporar el arroz y un chorrito de salsa de soja, saltear todo 3 minutos."] },

  // ---------- MERIENDAS ----------
  { id: "m1", name: "Yogur Griego con Nueces y Banana", category: "meriendas", kcal: 300, country: "General", tags: ["vegetariano"], allergens: ["lactosa", "frutos_secos"], avoidFor: [],
    ingredients: ["200g Yogur natural descremado", "15g Nueces", "Media banana"],
    instructions: ["Colocar el yogur en un bowl o vaso.", "Cortar la banana en rodajas y agregarla encima.", "Coronar con las nueces picadas."] },

  { id: "m2", name: "Batido Proteico con Avena", category: "meriendas", kcal: 380, country: "General", tags: [], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["1 scoop Proteína en polvo", "30g Avena", "250ml Leche descremada"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea.", "Servir inmediatamente."] },

  { id: "m3", name: "Frutos Secos y Manzana", category: "meriendas", kcal: 250, country: "General", tags: ["vegetariano", "vegano", "sin_lactosa", "sin_gluten"], allergens: ["frutos_secos"], avoidFor: [],
    ingredients: ["1 Manzana", "20g Mix de frutos secos (nueces, almendras, castañas)"],
    instructions: ["Cortar la manzana en gajos.", "Servir junto al mix de frutos secos como snack."] },

  { id: "m4", name: "Tostada Integral con Queso Untable y Tomate", category: "meriendas", kcal: 280, country: "General", tags: ["vegetariano"], allergens: ["lactosa", "gluten"], avoidFor: [],
    ingredients: ["1 Tostada integral", "2 cdas Queso untable light", "Rodajas de tomate"],
    instructions: ["Untar la tostada con el queso.", "Agregar las rodajas de tomate por encima.", "Sazonar con una pizca de sal y orégano."] },

  { id: "m5", name: "Barra de Cereal Casera", category: "meriendas", kcal: 260, country: "General", tags: ["vegetariano"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["50g Avena", "1 cda Miel", "20g Pasas de uva", "1 cda Manteca de maní"],
    instructions: ["Mezclar todos los ingredientes en un bowl hasta integrar.", "Compactar la mezcla en un molde chico forrado con papel manteca.", "Enfriar en la heladera 1 hora y cortar en barras."] },

  { id: "m6", name: "Licuado de Frutilla y Avena", category: "meriendas", kcal: 290, country: "General", tags: ["vegetariano", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Frutillas", "30g Avena", "200ml Leche vegetal o descremada"],
    instructions: ["Colocar las frutillas, la avena y la leche en la licuadora.", "Licuar hasta lograr una textura suave.", "Servir bien frío."] },

  { id: "m7", name: "Palitos de Zanahoria y Hummus", category: "meriendas", kcal: 220, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["2 Zanahorias en bastones", "3 cdas Hummus"],
    instructions: ["Cortar las zanahorias en bastones parejos.", "Servir junto al hummus para untar como snack."] },

  { id: "m8", name: "Yogur con Miel y Semillas de Chía", category: "meriendas", kcal: 260, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: ["diabetes"],
    ingredients: ["180g Yogur natural", "1 cdita Miel", "1 cda Semillas de chía"],
    instructions: ["Colocar el yogur en un bowl.", "Agregar la miel y mezclar suavemente.", "Espolvorear las semillas de chía por encima."] },

  { id: "m9", name: "Gelatina Light con Frutas", category: "meriendas", kcal: 150, country: "General", tags: ["vegetariano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 sobre Gelatina light", "Medio vaso de frutas picadas"],
    instructions: ["Preparar la gelatina light según las indicaciones del sobre.", "Agregar las frutas picadas antes de que solidifique.", "Enfriar en la heladera al menos 2 horas."] },

  { id: "m10", name: "Bolitas Energéticas de Dátil y Coco", category: "meriendas", kcal: 280, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["8 Dátiles sin carozo", "3 cdas Coco rallado", "1 cda Avena"],
    instructions: ["Procesar los dátiles con la avena hasta formar una pasta.", "Formar bolitas pequeñas con las manos.", "Pasarlas por el coco rallado y enfriar antes de servir."] },

  { id: "m11", name: "Queso Fresco con Membrillo", category: "meriendas", kcal: 300, country: "Argentina", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: ["diabetes"],
    ingredients: ["60g Queso fresco", "30g Dulce de membrillo"],
    instructions: ["Cortar el queso fresco en láminas.", "Servir junto al dulce de membrillo en cubos pequeños."] },

  { id: "m12", name: "Mate con Tostadas Integrales", category: "meriendas", kcal: 240, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["Yerba mate", "2 Tostadas integrales", "Queso untable light"],
    instructions: ["Cebar el mate como de costumbre.", "Untar las tostadas con el queso light.", "Disfrutar juntos como merienda tradicional."] },

  { id: "m13", name: "Smoothie Verde de Manzana y Apio", category: "meriendas", kcal: 200, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 Manzana verde", "2 ramas de Apio", "200ml Agua fría", "Jugo de medio limón"],
    instructions: ["Cortar la manzana y el apio en trozos.", "Licuar con el agua y el jugo de limón hasta lograr textura suave.", "Colar si se prefiere una textura más líquida y servir frío."] },

  { id: "m14", name: "Puñado de Almendras y Pasas", category: "meriendas", kcal: 270, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: ["frutos_secos"], avoidFor: [],
    ingredients: ["25g Almendras", "20g Pasas de uva"],
    instructions: ["Mezclar las almendras y las pasas en un bowl pequeño.", "Servir como snack práctico para llevar."] },

  { id: "m15", name: "Tostada de Palta y Semillas", category: "meriendas", kcal: 300, country: "General", tags: ["vegano", "sin_lactosa"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["1 rodaja de pan integral", "Media palta", "1 cdita Semillas de sésamo o girasol"],
    instructions: ["Tostar el pan integral.", "Untar con la palta pisada y salpimentar.", "Espolvorear las semillas por encima antes de servir."] },

  // ---------- CENAS ----------
  { id: "c1", name: "Filete de Pescado con Ensalada Completa", category: "cena", kcal: 400, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pescado blanco", "Tomate", "Lechuga", "Zanahoria"],
    instructions: ["Sellar el pescado en sartén caliente con un poco de aceite, 3-4 minutos por lado.", "Cortar los vegetales de la ensalada y mezclarlos en un bowl.", "Servir el pescado junto a la ensalada, aliñada a gusto."] },

  { id: "c2", name: "Salteado de Pollo y Cubos de Zucchini", category: "cena", kcal: 500, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pollo", "1 Zucchini grande", "Cebolla", "Morrón"],
    instructions: ["Cortar el pollo y los vegetales en cubos parejos.", "Saltear el pollo en sartén o wok hasta dorar.", "Agregar los vegetales y cocinar 5-6 minutos más, revolviendo seguido."] },

  { id: "c3", name: "Tacos de Carne y Aguacate", category: "cena", kcal: 600, country: "México", tags: ["sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["3 tortillas de maíz", "150g de carne molida magra", "Medio aguacate", "Cebolla y cilantro picado"],
    instructions: ["Cocinar la carne en una sartén sazonando a gusto.", "Calentar las tortillas.", "Armar los tacos con la carne, rebanadas de aguacate, cebolla y cilantro."] },

  { id: "c4", name: "Sopa de Verduras con Pollo Desmenuzado", category: "cena", kcal: 350, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["100g Pechuga de pollo cocida y desmenuzada", "Zanahoria, apio y zapallo", "Caldo de verduras"],
    instructions: ["Cortar los vegetales en cubos pequeños y hervirlos en el caldo hasta que estén tiernos.", "Agregar el pollo desmenuzado.", "Cocinar 5 minutos más y servir caliente."] },

  { id: "c5", name: "Omelette de Espinaca y Champiñones", category: "cena", kcal: 380, country: "General", tags: ["sin_carbo", "vegetariano"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["3 Huevos", "1 puñado Espinaca", "5 Champiñones fileteados"],
    instructions: ["Saltear los champiñones y la espinaca en una sartén hasta que se ablanden.", "Batir los huevos y verterlos sobre el salteado.", "Cocinar tapado a fuego bajo hasta que cuaje, doblar al medio y servir."] },

  { id: "c6", name: "Pizza Casera de Vegetales (Integral)", category: "cena", kcal: 520, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["1 Base de pizza integral", "Salsa de tomate", "Morrón, cebolla y champiñones", "Queso mozzarella light"],
    instructions: ["Cubrir la base con la salsa de tomate.", "Distribuir los vegetales y el queso por encima.", "Hornear a 220°C durante 12-15 minutos hasta gratinar."] },

  { id: "c7", name: "Ensalada Caesar con Pollo Grillado", category: "cena", kcal: 450, country: "General", tags: [], allergens: ["gluten", "lactosa", "huevo"], avoidFor: [],
    ingredients: ["150g Pechuga de pollo", "Lechuga romana", "Croutons integrales", "Aderezo Caesar light"],
    instructions: ["Grillar la pechuga y cortarla en tiras.", "Mezclar la lechuga con los croutons en un bowl grande.", "Agregar el pollo y aliñar con el aderezo Caesar."] },

  { id: "c8", name: "Wrap de Atún y Vegetales", category: "cena", kcal: 420, country: "General", tags: ["sin_lactosa"], allergens: ["gluten", "mariscos"], avoidFor: [],
    ingredients: ["1 Tortilla de trigo integral", "1 Lata de atún al natural", "Lechuga, tomate y zanahoria rallada"],
    instructions: ["Escurrir el atún y mezclarlo con los vegetales picados.", "Colocar el relleno sobre la tortilla.", "Enrollar bien apretado y cortar al medio para servir."] },

  { id: "c9", name: "Pollo al Horno con Vegetales Asados", category: "cena", kcal: 480, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["200g Muslo de pollo sin piel", "Zapallo, morrón y cebolla", "Romero y aceite de oliva"],
    instructions: ["Colocar el pollo y los vegetales cortados en una fuente para horno.", "Condimentar con romero, sal y un chorrito de aceite de oliva.", "Hornear a 200°C durante 30-35 minutos hasta dorar."] },

  { id: "c10", name: "Ceviche de Pescado", category: "cena", kcal: 350, country: "Perú", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["200g Pescado blanco fresco", "Jugo de 3 Limones", "Cebolla morada", "Cilantro y ají al gusto"],
    instructions: ["Cortar el pescado en cubos pequeños.", "Cubrir con el jugo de limón y dejar marinar en la heladera 15-20 minutos.", "Agregar la cebolla morada en pluma, el cilantro y el ají, mezclar y servir frío."] },

  { id: "c11", name: "Berenjenas Rellenas de Vegetales", category: "cena", kcal: 400, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["2 Berenjenas medianas", "Tomate, morrón y cebolla picados", "Orégano"],
    instructions: ["Cortar las berenjenas al medio y ahuecar levemente la pulpa.", "Rellenar con los vegetales salteados y condimentados con orégano.", "Hornear a 190°C durante 25-30 minutos hasta que estén tiernas."] },

  { id: "c12", name: "Sopa Crema de Zapallo", category: "cena", kcal: 300, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["400g Zapallo", "Cebolla y ajo", "100ml Leche descremada", "Nuez moscada"],
    instructions: ["Hervir el zapallo con la cebolla y el ajo hasta que estén tiernos.", "Procesar todo con la leche hasta lograr una crema homogénea.", "Servir caliente con una pizca de nuez moscada."] },

  { id: "c13", name: "Milanesas de Berenjena al Horno", category: "cena", kcal: 420, country: "General", tags: ["vegetariano"], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["1 Berenjena grande en láminas", "1 Huevo", "Pan rallado integral"],
    instructions: ["Cortar la berenjena en láminas finas y salarlas 10 minutos para quitar el amargor.", "Pasar cada lámina por huevo batido y luego por pan rallado.", "Hornear a 200°C durante 20 minutos, dando vuelta a mitad de cocción."] },

  { id: "c14", name: "Arepas de Pollo Mechado", category: "cena", kcal: 520, country: "Venezuela", tags: ["sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["2 Arepas de maíz", "150g Pechuga de pollo desmenuzada", "Tomate y cebolla"],
    instructions: ["Cocinar el pollo hervido y desmenuzarlo con las manos.", "Saltear el pollo desmenuzado con tomate y cebolla picados.", "Abrir las arepas al medio y rellenar con el pollo mechado."] },

  { id: "c15", name: "Tarta de Verduras sin Tapa", category: "cena", kcal: 380, country: "Argentina", tags: ["vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["Acelga o espinaca", "3 Huevos", "50g Queso rallado", "Cebolla"],
    instructions: ["Saltear la acelga y la cebolla hasta que se ablanden.", "Batir los huevos con el queso rallado e integrar con las verduras.", "Volcar en una fuente para horno y cocinar a 180°C por 25-30 minutos."] },

  { id: "c16", name: "Curry de Garbanzos y Espinaca", category: "cena", kcal: 450, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Garbanzos cocidos", "Espinaca fresca", "150ml Leche de coco", "Curry en polvo"],
    instructions: ["Rehogar cebolla y ajo, agregar el curry en polvo y cocinar 1 minuto.", "Sumar los garbanzos y la leche de coco, cocinar 10 minutos a fuego medio.", "Agregar la espinaca al final y cocinar hasta que se ablande."] },

  { id: "c17", name: "Hamburguesa Casera de Pollo con Ensalada", category: "cena", kcal: 500, country: "General", tags: ["sin_lactosa"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["200g Pechuga de pollo molida", "1 Pan integral para hamburguesa", "Lechuga y tomate"],
    instructions: ["Formar la medallón con el pollo molido condimentado.", "Cocinar en sartén o plancha 5 minutos por lado hasta dorar.", "Armar la hamburguesa en el pan con lechuga y tomate."] },
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


// ======================================================================
// MOTOR DE FILTRADO Y ROTACIÓN — arma un "año" de comidas sin repetir
// una receta hasta agotar todo el pool filtrado, y sin nunca romper una
// restricción, alergia o condición de salud del usuario.
// ======================================================================

const MealEngine = {

  // Reparto aproximado del objetivo calórico diario entre las 4 comidas.
  KCAL_SHARE: { desayuno: 0.20, almuerzo: 0.35, meriendas: 0.15, cena: 0.30 },

  // --- 1) Filtrado duro: restricciones, alergias y disgustos son innegociables.
  //     Las condiciones de salud (avoidFor) se filtran, pero si dejan el pool
  //     vacío se relajan (es mejor mostrar algo aproximado que nada).
  filterRecipesForProfile(category, profile) {
    let pool = getRecipesByCategory(category);
    if (!profile) return pool;

    const restrictions = profile.restrictions || [];
    const health = profile.healthConditions || [];
    const allergiesText = (profile.allergies || []).map(a => a.toLowerCase());
    const dislikesText = (profile.dislikes || []).map(d => d.toLowerCase());

    // Restricciones dietarias: la receta TIENE que tener el tag.
    // Nota: todo lo "vegano" es también "vegetariano", así que ese caso
    // se acepta aunque la receta solo tenga el tag "vegano".
    restrictions.forEach(r => {
      pool = pool.filter(rec =>
        rec.tags.includes(r) || (r === 'vegetariano' && rec.tags.includes('vegano'))
      );
    });

    // Alergias declaradas por el usuario (texto libre) vs. alérgenos de la receta
    // y también contra el texto de los ingredientes, por si el alérgeno no está tageado.
    if (allergiesText.length) {
      pool = pool.filter(rec => {
        const recAllergens = (rec.allergens || []).map(a => a.toLowerCase());
        const ingredientsText = rec.ingredients.join(' ').toLowerCase();
        return !allergiesText.some(a =>
          recAllergens.some(ra => ra.includes(a) || a.includes(ra)) ||
          ingredientsText.includes(a)
        );
      });
    }

    // Ingredientes que no le gustan (texto libre contra ingredientes).
    if (dislikesText.length) {
      pool = pool.filter(rec => {
        const ingredientsText = rec.ingredients.join(' ').toLowerCase();
        return !dislikesText.some(d => ingredientsText.includes(d));
      });
    }

    // Condiciones de salud: se filtran, pero solo si no vacían el pool.
    if (health.length) {
      const withoutHealthRisk = pool.filter(rec => {
        const avoid = rec.avoidFor || [];
        return !health.some(h => avoid.includes(h));
      });
      if (withoutHealthRisk.length > 0) pool = withoutHealthRisk;
    }

    // Si el filtrado fue demasiado agresivo y no queda nada, volvemos a la
    // categoría completa (mejor mostrar algo que romper la app), priorizando
    // siempre no violar restricciones dietarias (que sí se mantienen).
    if (pool.length === 0) {
      let fallback = getRecipesByCategory(category);
      restrictions.forEach(r => {
        const filtered = fallback.filter(rec =>
          rec.tags.includes(r) || (r === 'vegetariano' && rec.tags.includes('vegano'))
        );
        if (filtered.length) fallback = filtered;
      });
      pool = fallback;
    }

    return pool;
  },

  // --- 2) Ajuste fino por calorías: dentro del pool ya filtrado, preferimos
  //     las recetas más cercanas al target calórico de esa comida.
  refineByKcal(pool, profile, category) {
    if (!profile || !profile.targetKcal || pool.length <= 1) return pool;
    const targetMealKcal = profile.targetKcal * (this.KCAL_SHARE[category] || 0.25);
    let tolerance = 120;
    let refined = pool.filter(r => Math.abs(r.kcal - targetMealKcal) <= tolerance);
    while (refined.length < Math.min(4, pool.length) && tolerance < 500) {
      tolerance += 100;
      refined = pool.filter(r => Math.abs(r.kcal - targetMealKcal) <= tolerance);
    }
    return refined.length ? refined : pool;
  },

  // --- 3) PRNG determinístico (mulberry32) a partir de un string semilla,
  //     para que el mismo usuario + mismo ciclo siempre generen el mismo orden,
  //     pero distinto entre usuarios y distinto entre ciclos.
  _hashString(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return () => {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  },

  _seededShuffle(array, seedStr) {
    const rand = this._hashString(seedStr);
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = rand() % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  _daysSinceEpoch(date) {
    return Math.floor(date.getTime() / 86400000);
  },

  // --- 4) Función principal: qué receta le toca a este perfil, en esta
  //     categoría, en esta fecha. Cicla por todo el pool filtrado sin repetir
  //     y, al agotarlo, vuelve a barajar con una semilla distinta (nuevo ciclo).
  getMealForDate(category, profile, date) {
    let pool = this.filterRecipesForProfile(category, profile);
    pool = this.refineByKcal(pool, profile, category);
    if (pool.length === 0) pool = getRecipesByCategory(category);

    const dayIndex = this._daysSinceEpoch(date);
    const cycleLength = pool.length;
    const cycleNumber = Math.floor(dayIndex / cycleLength);
    const positionInCycle = dayIndex % cycleLength;

    const seed = `${profile ? profile.name : 'anon'}-${category}-${cycleNumber}`;
    const shuffled = this._seededShuffle(pool, seed);
    return shuffled[positionInCycle];
  },

  // --- 5) Plan de N días (por defecto 7) para mostrar en pantalla, ya
  //     resuelto contra el perfil del usuario.
  getPlanForDays(profile, startDate, numDays = 7) {
    const categories = ['desayuno', 'almuerzo', 'meriendas', 'cena'];
    const plan = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dayMeals = {};
      categories.forEach(cat => {
        dayMeals[cat] = this.getMealForDate(cat, profile, d);
      });
      plan.push({ date: d, meals: dayMeals });
    }
    return plan;
  }
};
