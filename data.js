// BASE DE DATOS DE RECETAS — ÚNICA FUENTE DE VERDAD (no duplicar en otros archivos)
//
// Cada receta tiene:
//   tags       -> restricciones que CUMPLE (vegetariano, vegano, sin_gluten, sin_lactosa, sin_carbo, keto, mediterraneo)
//   allergens  -> alérgenos que CONTIENE (huevo, lactosa, gluten, frutos_secos, soja, mariscos)
//   avoidFor   -> condiciones de salud para las que NO es ideal (hipertension, diabetes, colesterol_alto)
//
// Estos tres campos son los que usa el motor de filtrado (más abajo) para elegir
// qué recetas le puede mostrar a cada usuario según su perfil.
//
// NOVEDAD: los domingos son "día permitido" — el motor relaja el filtro de
// avoidFor (condiciones de salud) ese día, y habilita la sugerencia de bebida
// CON alcohol. Las restricciones dietarias y las alergias NUNCA se relajan,
// ni siquiera domingo (son de seguridad, no de "gusto").

const RECIPES_DB = [

  // ---------- DESAYUNOS (50) ----------
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

  { id: "d18", name: "Licuado de Avena, Banana y Cacao", category: "desayuno", kcal: 320, country: "General", tags: ["vegetariano", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["40g Avena", "1 Banana", "1 cda Cacao amargo", "200ml Leche vegetal"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea y cremosa.", "Servir bien frío en un vaso alto."] },

  { id: "d19", name: "Sandwich de Pavo, Queso y Rúcula", category: "desayuno", kcal: 380, country: "General", tags: [], allergens: ["lactosa", "gluten"], avoidFor: [],
    ingredients: ["2 rodajas de pan integral", "2 fetas de pechuga de pavo", "1 feta de queso light", "Rúcula fresca"],
    instructions: ["Armar el sándwich intercalando el pavo, el queso y la rúcula.", "Tostar levemente en sandwichera o sartén.", "Cortar al medio y servir."] },

  { id: "d20", name: "Bowl de Avena Fría con Manzana y Nueces", category: "desayuno", kcal: 360, country: "General", tags: ["vegetariano"], allergens: ["frutos_secos", "lactosa"], avoidFor: [],
    ingredients: ["50g Avena", "150ml Leche descremada", "Media manzana en cubos", "15g Nueces picadas"],
    instructions: ["Mezclar la avena con la leche en un bowl.", "Agregar la manzana en cubos y revolver.", "Coronar con las nueces picadas y servir frío o a temperatura ambiente."] },

  { id: "d21", name: "Huevos Poché con Espárragos y Parmesano", category: "desayuno", kcal: 380, country: "General", tags: ["sin_carbo", "sin_gluten"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["2 Huevos", "8 Espárragos", "15g Queso parmesano rallado"],
    instructions: ["Cocinar los espárragos al vapor 5 minutos hasta que estén tiernos.", "Escalfar los huevos en agua hirviendo con un chorrito de vinagre, 3 minutos.", "Servir los huevos sobre los espárragos y espolvorear el parmesano."] },

  { id: "d22", name: "Medialunas Integrales Caseras", category: "desayuno", kcal: 420, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["150g Harina integral", "30g Manteca", "1 cda Miel", "Levadura"],
    instructions: ["Formar la masa con la harina, la manteca, la miel y la levadura, y dejar leudar 1 hora.", "Estirar, cortar en triángulos y enrollar dándoles forma de medialuna.", "Hornear a 180°C durante 15-18 minutos hasta dorar."] },

  { id: "d23", name: "Budín de Pan Integral Light", category: "desayuno", kcal: 400, country: "General", tags: ["vegetariano"], allergens: ["huevo", "gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["3 rodajas de pan integral duro", "1 Huevo", "150ml Leche descremada", "Canela"],
    instructions: ["Remojar el pan en la leche con el huevo batido y la canela.", "Colocar la mezcla en un molde y hornear a 180°C por 25 minutos.", "Dejar entibiar antes de desmoldar y servir."] },

  { id: "d24", name: "Tostada de Ricota, Miel y Nueces", category: "desayuno", kcal: 380, country: "General", tags: ["vegetariano"], allergens: ["lactosa", "gluten", "frutos_secos"], avoidFor: ["diabetes"],
    ingredients: ["1 rodaja de pan integral", "50g Ricota descremada", "1 cdita Miel", "10g Nueces picadas"],
    instructions: ["Tostar el pan integral.", "Untar con la ricota.", "Agregar un hilo de miel y las nueces picadas por encima."] },

  { id: "d25", name: "Bowl de Frutas Tropicales con Coco Rallado", category: "desayuno", kcal: 280, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["Media taza de ananá en cubos", "Media taza de mango en cubos", "1 cda Coco rallado"],
    instructions: ["Cortar las frutas en cubos parejos.", "Mezclarlas en un bowl.", "Espolvorear el coco rallado por encima antes de servir."] },

  { id: "d26", name: "Omelette de Jamón y Queso", category: "desayuno", kcal: 420, country: "General", tags: ["sin_carbo", "sin_gluten"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["3 Huevos", "2 fetas de jamón cocido", "30g Queso rallado"],
    instructions: ["Batir los huevos y verterlos en una sartén caliente.", "Agregar el jamón picado y el queso cuando la base empiece a cuajar.", "Doblar al medio y cocinar 1 minuto más antes de servir."] },

  { id: "d27", name: "Yogur con Avena y Miel", category: "desayuno", kcal: 340, country: "General", tags: ["vegetariano"], allergens: ["lactosa"], avoidFor: ["diabetes"],
    ingredients: ["200g Yogur natural", "30g Avena", "1 cdita Miel"],
    instructions: ["Colocar el yogur en un bowl.", "Agregar la avena y mezclar bien.", "Terminar con un hilo de miel por encima."] },

  { id: "d28", name: "Empanada de Verdura al Horno", category: "desayuno", kcal: 380, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["2 Tapas de empanada integrales", "Acelga o espinaca", "50g Queso rallado"],
    instructions: ["Saltear la acelga o espinaca hasta que se ablande y dejar enfriar.", "Mezclar con el queso rallado y rellenar las tapas, cerrando con un repulgue.", "Hornear a 200°C durante 15-18 minutos hasta dorar."] },

  { id: "d29", name: "Café con Leche y Tostadas Integrales", category: "desayuno", kcal: 350, country: "Argentina", tags: ["vegetariano"], allergens: ["lactosa", "gluten"], avoidFor: [],
    ingredients: ["1 Café", "150ml Leche descremada", "2 Tostadas integrales", "Queso untable light"],
    instructions: ["Preparar el café y calentar la leche.", "Tostar el pan integral.", "Untar las tostadas con el queso light y servir junto al café con leche."] },

  { id: "d30", name: "Wafles de Avena Integrales", category: "desayuno", kcal: 400, country: "General", tags: ["vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["60g Avena molida", "1 Huevo", "150ml Leche descremada", "Canela"],
    instructions: ["Mezclar todos los ingredientes hasta formar una masa homogénea.", "Cocinar en wafflera precalentada hasta dorar, 4-5 minutos.", "Servir tibios con fruta fresca a gusto."] },

  { id: "d31", name: "Bowl de Quinoa Dulce con Frutas y Canela", category: "desayuno", kcal: 350, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["60g Quinoa", "200ml Leche vegetal", "Media manzana en cubos", "Canela"],
    instructions: ["Cocinar la quinoa en la leche vegetal hasta que esté tierna, unos 15 minutos.", "Agregar la manzana en cubos y la canela.", "Servir tibio o frío según preferencia."] },

  { id: "d32", name: "Sándwich de Queso y Tomate", category: "desayuno", kcal: 340, country: "General", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["2 rodajas de pan integral", "1 feta de queso light", "1 Tomate en rodajas"],
    instructions: ["Armar el sándwich con el queso y el tomate entre las rodajas de pan.", "Tostar en sandwichera o sartén hasta dorar.", "Cortar al medio y servir caliente."] },

  { id: "d33", name: "Tortilla Española Light", category: "desayuno", kcal: 400, country: "España", tags: ["vegetariano", "sin_gluten", "sin_lactosa"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["3 Huevos", "1 Papa mediana", "Media cebolla", "1 cdita Aceite de oliva"],
    instructions: ["Cortar la papa y la cebolla en láminas finas y cocinar en sartén con el aceite hasta tiernizar.", "Batir los huevos e incorporar la papa y cebolla ya cocidas.", "Volcar en la sartén y cocinar tapado 5 minutos por lado, dando vuelta con un plato."] },

  { id: "d34", name: "Bruschetta de Tomate, Albahaca y Aceite de Oliva", category: "desayuno", kcal: 280, country: "Mediterráneo", tags: ["vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["2 rodajas de pan integral", "2 Tomates en cubos", "Albahaca fresca", "Aceite de oliva"],
    instructions: ["Tostar el pan integral.", "Mezclar el tomate en cubos con la albahaca picada y un chorrito de aceite.", "Servir la mezcla sobre las tostadas."] },

  { id: "d35", name: "Batido de Mango, Yogur y Semillas de Chía", category: "desayuno", kcal: 320, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["150g Mango en cubos", "150g Yogur natural", "1 cda Semillas de chía"],
    instructions: ["Colocar el mango y el yogur en la licuadora.", "Licuar hasta lograr una textura suave.", "Servir y espolvorear las semillas de chía por encima."] },

  { id: "d36", name: "Croissant Integral con Palta", category: "desayuno", kcal: 400, country: "General", tags: ["vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["1 Croissant integral", "Media palta", "Jugo de limón"],
    instructions: ["Cortar el croissant al medio.", "Pisar la palta con jugo de limón y sal.", "Rellenar el croissant con la palta pisada."] },

  { id: "d37", name: "Huevos a la Copa con Tostadas Finitas", category: "desayuno", kcal: 380, country: "General", tags: [], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["2 Huevos", "2 Tostadas finas integrales", "Sal y pimienta"],
    instructions: ["Hervir agua y cocinar los huevos con cáscara 4-5 minutos para que queden a la copa.", "Tostar las tostadas finas.", "Servir los huevos en huevera con las tostadas para untar."] },

  { id: "d38", name: "Pan de Campo con Queso y Mermelada", category: "desayuno", kcal: 420, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["2 rodajas de pan de campo integral", "1 feta de queso", "1 cda Mermelada light"],
    instructions: ["Tostar el pan de campo.", "Colocar el queso sobre una rodaja.", "Untar la mermelada en la otra rodaja y armar el sándwich."] },

  { id: "d39", name: "Porridge de Avena con Canela y Pasas de Uva", category: "desayuno", kcal: 360, country: "General", tags: ["vegetariano", "sin_lactosa"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["50g Avena", "200ml Leche vegetal", "15g Pasas de uva", "Canela"],
    instructions: ["Cocinar la avena con la leche vegetal a fuego bajo, revolviendo, 5 minutos.", "Agregar las pasas y la canela.", "Servir caliente en un bowl."] },

  { id: "d40", name: "Bowl Energético de Semillas y Frutos Rojos", category: "desayuno", kcal: 300, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Yogur de coco o vegetal", "1 cda Semillas de chía", "1 cda Semillas de girasol", "80g Frutos rojos"],
    instructions: ["Colocar el yogur vegetal como base en un bowl.", "Agregar las semillas de chía y girasol.", "Coronar con los frutos rojos frescos."] },

  // ---------- DESAYUNOS KETO (nuevas) ----------
  { id: "dk1", name: "Huevos Revueltos con Panceta y Palta", category: "desayuno", kcal: 480, country: "General", tags: ["keto", "sin_carbo", "sin_gluten", "sin_lactosa"], allergens: ["huevo"], avoidFor: ["colesterol_alto"],
    ingredients: ["3 Huevos", "40g Panceta", "Media palta"],
    instructions: ["Dorar la panceta en una sartén hasta que quede crocante.", "Agregar los huevos batidos y revolver a fuego bajo hasta cuajar.", "Servir con la palta en láminas al costado."] },

  { id: "dk2", name: "Bowl Keto de Yogur Griego y Semillas", category: "desayuno", kcal: 400, country: "General", tags: ["keto", "vegetariano", "sin_gluten"], allergens: ["lactosa", "frutos_secos"], avoidFor: [],
    ingredients: ["200g Yogur griego entero", "2 cdas Semillas de chía", "15g Nueces picadas", "Canela"],
    instructions: ["Colocar el yogur griego en un bowl.", "Agregar las semillas de chía y las nueces picadas.", "Espolvorear canela y servir frío."] },

  { id: "dk3", name: "Omelette Keto de Espinaca y Queso de Cabra", category: "desayuno", kcal: 460, country: "General", tags: ["keto", "sin_carbo", "sin_gluten", "vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["3 Huevos", "1 puñado Espinaca fresca", "40g Queso de cabra", "1 cdita Aceite de oliva"],
    instructions: ["Saltear la espinaca en el aceite de oliva hasta que se ablande.", "Batir los huevos y verterlos sobre la espinaca.", "Agregar el queso de cabra en trozos, cocinar tapado a fuego bajo y doblar al medio."] },

  { id: "dk4", name: "Chia Pudding Keto de Coco", category: "desayuno", kcal: 420, country: "General", tags: ["keto", "vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["3 cdas Semillas de chía", "200ml Leche de coco entera", "10g Coco rallado sin azúcar"],
    instructions: ["Mezclar la chía con la leche de coco en un frasco y revolver bien.", "Dejar reposar en la heladera mínimo 4 horas.", "Espolvorear el coco rallado antes de servir."] },

  // ---------- DESAYUNOS MEDITERRÁNEOS (nuevas) ----------
  { id: "dm1", name: "Yogur Griego con Miel, Nueces y Aceite de Oliva", category: "desayuno", kcal: 380, country: "Mediterráneo", tags: ["mediterraneo", "vegetariano", "sin_gluten"], allergens: ["lactosa", "frutos_secos"], avoidFor: ["diabetes"],
    ingredients: ["200g Yogur griego", "1 cdita Miel", "15g Nueces", "Un hilo de Aceite de oliva"],
    instructions: ["Colocar el yogur griego en un bowl.", "Agregar la miel y las nueces picadas.", "Terminar con un hilo fino de aceite de oliva por encima."] },

  { id: "dm2", name: "Tostada Mediterránea de Tomate, Aceitunas y Feta", category: "desayuno", kcal: 400, country: "Mediterráneo", tags: ["mediterraneo", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["1 rodaja de pan integral", "1 Tomate en cubos", "30g Queso feta", "6 Aceitunas negras", "Aceite de oliva"],
    instructions: ["Tostar el pan integral.", "Mezclar el tomate con las aceitunas y un chorrito de aceite de oliva.", "Volcar sobre la tostada y desmenuzar el queso feta por encima."] },

  { id: "dm3", name: "Huevos con Tomate y Aceite de Oliva (Shakshuka Liviana)", category: "desayuno", kcal: 420, country: "Mediterráneo", tags: ["mediterraneo", "sin_gluten", "sin_lactosa"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["2 Huevos", "2 Tomates", "Cebolla y ajo", "Aceite de oliva y comino"],
    instructions: ["Rehogar la cebolla y el ajo en aceite de oliva.", "Agregar el tomate en cubos y el comino, cocinar 10 minutos hasta formar una salsa.", "Hacer huecos y cascar los huevos encima, tapar y cocinar 5 minutos más hasta que cuajen."] },

  { id: "dm4", name: "Bowl Mediterráneo de Frutas, Almendras y Aceite de Oliva", category: "desayuno", kcal: 320, country: "Mediterráneo", tags: ["mediterraneo", "vegano", "sin_gluten", "sin_lactosa"], allergens: ["frutos_secos"], avoidFor: [],
    ingredients: ["1 taza de frutas de estación", "15g Almendras", "Un hilo de Aceite de oliva", "Jugo de limón"],
    instructions: ["Cortar las frutas en cubos parejos.", "Rociar con jugo de limón y un hilo de aceite de oliva.", "Espolvorear las almendras picadas antes de servir."] },

  // ---------- DESAYUNOS ADICIONALES (nuevas) ----------
  { id: "d41", name: "Bowl de Requesón con Duraznos", category: "desayuno", kcal: 340, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["150g Requesón o cottage", "1 Durazno en cubos", "1 cdita Miel"],
    instructions: ["Colocar el requesón en un bowl.", "Agregar el durazno cortado en cubos.", "Rociar con la miel antes de servir."] },

  { id: "d42", name: "Tostadas Francesas Integrales Light", category: "desayuno", kcal: 400, country: "General", tags: ["vegetariano"], allergens: ["huevo", "gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["2 rodajas de pan integral", "1 Huevo", "50ml Leche descremada", "Canela"],
    instructions: ["Batir el huevo con la leche y la canela.", "Remojar el pan en la mezcla unos segundos por lado.", "Cocinar en sartén antiadherente hasta dorar de ambos lados."] },

  { id: "d43", name: "Bowl Verde de Palta, Espinaca y Huevo Poché", category: "desayuno", kcal: 400, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["Media palta", "1 puñado de espinaca fresca", "1 Huevo poché"],
    instructions: ["Colocar la espinaca fresca como base del bowl.", "Agregar la palta en láminas.", "Coronar con el huevo poché recién hecho."] },

  { id: "d44", name: "Muesli Casero con Leche y Frutas", category: "desayuno", kcal: 380, country: "General", tags: ["vegetariano"], allergens: ["lactosa", "frutos_secos"], avoidFor: [],
    ingredients: ["50g Muesli casero", "200ml Leche descremada", "Media manzana en cubos", "10g Almendras"],
    instructions: ["Colocar el muesli en un bowl.", "Agregar la leche y mezclar.", "Sumar la manzana y las almendras por encima."] },

  { id: "d45", name: "Roll de Avena, Cacao y Banana", category: "desayuno", kcal: 350, country: "General", tags: ["vegano", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["50g Avena", "1 Banana", "1 cda Cacao amargo", "Agua c/n"],
    instructions: ["Pisar la banana hasta hacer puré.", "Mezclar con la avena y el cacao, agregando agua hasta lograr una masa manejable.", "Cocinar en sartén antiadherente de a porciones, 2 minutos por lado."] },

  { id: "d46", name: "Sándwich de Queso Crema y Pepino", category: "desayuno", kcal: 320, country: "General", tags: ["vegetariano"], allergens: ["lactosa", "gluten"], avoidFor: [],
    ingredients: ["2 rodajas de pan integral", "2 cdas Queso crema light", "Pepino en rodajas finas"],
    instructions: ["Untar las rodajas de pan con el queso crema.", "Distribuir el pepino en rodajas finas.", "Cerrar el sándwich y cortar al medio."] },

  { id: "d47", name: "Bowl de Avena con Cacao y Frutos Rojos", category: "desayuno", kcal: 360, country: "General", tags: ["vegetariano", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["50g Avena", "1 cda Cacao amargo", "200ml Leche vegetal", "80g Frutos rojos"],
    instructions: ["Cocinar la avena con la leche vegetal y el cacao a fuego bajo, revolviendo.", "Cocinar 5 minutos hasta espesar.", "Servir coronado con los frutos rojos frescos."] },

  { id: "d48", name: "Huevos a la Plancha con Champiñones", category: "desayuno", kcal: 380, country: "General", tags: ["sin_carbo", "sin_gluten", "sin_lactosa"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["2 Huevos", "5 Champiñones fileteados", "Perejil fresco"],
    instructions: ["Saltear los champiñones en una sartén hasta dorar.", "Cocinar los huevos a la plancha por separado o encima de los champiñones.", "Espolvorear perejil fresco picado antes de servir."] },

  { id: "d49", name: "Bagel Integral con Palta y Semillas", category: "desayuno", kcal: 420, country: "General", tags: ["vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["1 Bagel integral", "Media palta", "1 cda Semillas mixtas (chía, girasol, sésamo)"],
    instructions: ["Cortar el bagel al medio y tostarlo levemente.", "Untar con la palta pisada.", "Espolvorear las semillas mixtas antes de cerrar o servir abierto."] },

  { id: "d50", name: "Batido de Avena, Dátil y Canela", category: "desayuno", kcal: 330, country: "General", tags: ["vegano", "sin_lactosa"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["40g Avena", "2 Dátiles", "200ml Leche vegetal", "Canela"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea.", "Servir bien frío espolvoreado con canela."] },

  // ---------- ALMUERZOS (50) ----------
  { id: "a1", name: "Pechuga Grillé con Arroz Integral", category: "almuerzo", kcal: 550, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pechuga de pollo", "70g Arroz integral", "Mix de vegetales verdes"],
    instructions: ["Cocinar el arroz integral según las indicaciones del paquete.", "Grillar la pechuga sazonada 5-6 minutos por lado.", "Servir junto a los vegetales salteados o al vapor."] },

  { id: "a2", name: "Filete de Carne con Puré de Calabaza", category: "almuerzo", kcal: 650, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Carne magra de res", "200g Calabaza", "1 cdita Aceite de oliva"],
    instructions: ["Hervir o hornear la calabaza hasta que esté tierna y hacer puré.", "Cocinar el filete a la plancha al punto deseado.", "Servir el filete sobre el puré, con un hilo de aceite de oliva."] },

  { id: "a3", name: "Pollo con Arroz Primavera", category: "almuerzo", kcal: 550, country: "General", tags: ["saludable", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["200g de pechuga de pollo", "80g de arroz", "Media taza de arvejas y zanahoria", "1 cucharadita de aceite de oliva"],
    instructions: ["Cocinar el arroz de forma tradicional.", "Cortar el pollo en cubos y dorarlo en una sartén con el aceite.", "Agregar las verduras al pollo, cocinar 5 minutos más y mezclar con el arroz."] },

  { id: "a4", name: "Ensalada de Quinoa con Garbanzos", category: "almuerzo", kcal: 480, country: "Mediterráneo", tags: ["vegetariano", "vegano", "sin_lactosa", "sin_gluten", "mediterraneo"], allergens: [], avoidFor: [],
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

  { id: "a18", name: "Pollo al Limón con Puré de Papas", category: "almuerzo", kcal: 560, country: "General", tags: ["sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "2 Papas medianas", "Jugo de 1 limón", "30ml Leche descremada"],
    instructions: ["Grillar la pechuga y bañarla con el jugo de limón al final de la cocción.", "Hervir las papas y hacer un puré con la leche descremada.", "Servir el pollo sobre el puré."] },

  { id: "a19", name: "Cerdo a la Naranja con Arroz", category: "almuerzo", kcal: 600, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Solomillo de cerdo", "Jugo de 2 naranjas", "70g Arroz"],
    instructions: ["Cocinar el arroz aparte según indicaciones del paquete.", "Sellar el cerdo en sartén caliente y bañarlo con el jugo de naranja.", "Cocinar 8-10 minutos a fuego medio hasta reducir la salsa y servir sobre el arroz."] },

  { id: "a20", name: "Ensalada César con Camarones", category: "almuerzo", kcal: 480, country: "General", tags: [], allergens: ["mariscos", "lactosa", "gluten", "huevo"], avoidFor: [],
    ingredients: ["150g Camarones", "Lechuga romana", "Croutons integrales", "Aderezo Caesar light"],
    instructions: ["Saltear los camarones en sartén caliente 2-3 minutos por lado.", "Mezclar la lechuga con los croutons en un bowl grande.", "Agregar los camarones y aliñar con el aderezo Caesar."] },

  { id: "a21", name: "Fideos con Salsa de Tomate y Albahaca", category: "almuerzo", kcal: 520, country: "General", tags: ["vegetariano", "vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["90g Fideos integrales", "200ml Salsa de tomate casera", "Albahaca fresca"],
    instructions: ["Cocinar los fideos en agua con sal hasta que estén al dente.", "Calentar la salsa de tomate con la albahaca picada.", "Mezclar los fideos con la salsa y servir."] },

  { id: "a22", name: "Risotto de Hongos", category: "almuerzo", kcal: 550, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["80g Arroz arbóreo", "150g Hongos variados", "Caldo de verduras", "20g Queso parmesano"],
    instructions: ["Saltear los hongos en una olla hasta dorar y reservar.", "Cocinar el arroz agregando el caldo de a poco, revolviendo constantemente, 18-20 minutos.", "Incorporar los hongos y el parmesano al final, mezclar y servir."] },

  { id: "a23", name: "Pollo Teriyaki con Arroz", category: "almuerzo", kcal: 560, country: "Asiático", tags: ["sin_lactosa"], allergens: ["soja"], avoidFor: ["hipertension"],
    ingredients: ["200g Pechuga de pollo", "3 cdas Salsa teriyaki", "70g Arroz"],
    instructions: ["Cocinar el arroz aparte.", "Saltear el pollo en cubos hasta dorar.", "Agregar la salsa teriyaki y cocinar 5 minutos más hasta glasear. Servir sobre el arroz."] },

  { id: "a24", name: "Estofado de Ternera con Vegetales", category: "almuerzo", kcal: 600, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["200g Carne de ternera en cubos", "Zanahoria, papa y arvejas", "Caldo de carne"],
    instructions: ["Dorar la carne en una olla con un poco de aceite.", "Agregar los vegetales cortados y cubrir con el caldo.", "Cocinar a fuego bajo tapado durante 40-45 minutos hasta que la carne esté tierna."] },

  { id: "a25", name: "Ensalada de Atún y Huevo", category: "almuerzo", kcal: 420, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: ["mariscos", "huevo"], avoidFor: [],
    ingredients: ["1 Lata de atún al natural", "2 Huevos duros", "Lechuga, tomate y cebolla morada"],
    instructions: ["Hervir los huevos 9-10 minutos y dejar enfriar.", "Escurrir el atún y mezclarlo con los vegetales cortados en un bowl.", "Agregar los huevos en cuartos y aliñar a gusto."] },

  { id: "a26", name: "Milanesa de Soja con Puré", category: "almuerzo", kcal: 500, country: "General", tags: ["vegano"], allergens: ["soja"], avoidFor: [],
    ingredients: ["2 Milanesas de soja", "2 Papas medianas", "Aceite de oliva"],
    instructions: ["Cocinar las milanesas de soja en sartén o al horno según el paquete.", "Hervir las papas y hacer un puré con un chorrito de aceite de oliva.", "Servir las milanesas junto al puré."] },

  { id: "a27", name: "Arroz Integral con Vegetales Salteados", category: "almuerzo", kcal: 480, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["80g Arroz integral", "Brócoli, zanahoria y morrón", "1 cdita Aceite de sésamo"],
    instructions: ["Cocinar el arroz integral según las indicaciones del paquete.", "Saltear los vegetales en el aceite de sésamo a fuego fuerte 5 minutos.", "Mezclar con el arroz y servir."] },

  { id: "a28", name: "Pollo a la Provenzal con Papas", category: "almuerzo", kcal: 550, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "2 Papas medianas", "Ajo y perejil picado"],
    instructions: ["Grillar la pechuga y espolvorear con el ajo y perejil picado (provenzal).", "Hervir o dorar las papas en cubos con un poco de aceite.", "Servir el pollo junto a las papas provenzal."] },

  { id: "a29", name: "Guiso de Mondongo Liviano", category: "almuerzo", kcal: 520, country: "Argentina", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: ["colesterol_alto"],
    ingredients: ["200g Mondongo cocido", "Zanahoria, papa y zapallo", "Pulpa de tomate"],
    instructions: ["Rehogar cebolla y ajo en una olla, agregar la pulpa de tomate.", "Sumar el mondongo cocido y los vegetales cortados, cubrir con agua.", "Cocinar a fuego medio 30 minutos hasta que los vegetales estén tiernos."] },

  { id: "a30", name: "Fideos Integrales con Atún", category: "almuerzo", kcal: 500, country: "General", tags: [], allergens: ["gluten", "mariscos"], avoidFor: [],
    ingredients: ["90g Fideos integrales", "1 Lata de atún al natural", "Tomate cherry y aceite de oliva"],
    instructions: ["Cocinar los fideos en agua con sal hasta que estén al dente.", "Escurrir el atún y mezclarlo con los tomates cherry cortados al medio.", "Mezclar todo con los fideos calientes y un hilo de aceite de oliva."] },

  { id: "a31", name: "Ensalada Mediterránea con Falafel", category: "almuerzo", kcal: 480, country: "Mediterráneo", tags: ["vegano", "sin_gluten", "sin_lactosa", "mediterraneo"], allergens: [], avoidFor: [],
    ingredients: ["4 Falafels", "Lechuga, tomate y pepino", "Limón y aceite de oliva"],
    instructions: ["Cocinar los falafels al horno o en sartén con poco aceite.", "Cortar los vegetales y mezclarlos en un bowl.", "Agregar los falafels y aliñar con limón y aceite de oliva."] },

  { id: "a32", name: "Pollo al Horno con Batatas y Miel", category: "almuerzo", kcal: 560, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["200g Muslo de pollo sin piel", "1 Batata mediana", "1 cdita Miel"],
    instructions: ["Cortar la batata en bastones y colocarla junto al pollo en una fuente.", "Bañar con la miel y condimentar a gusto.", "Hornear a 200°C durante 30-35 minutos hasta dorar."] },

  { id: "a33", name: "Carbonada Criolla", category: "almuerzo", kcal: 550, country: "Argentina", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Carne de res en cubos", "Zapallo, choclo y durazno", "Pulpa de tomate"],
    instructions: ["Dorar la carne en una olla con un poco de aceite.", "Agregar la pulpa de tomate y los vegetales cortados, cubrir con agua.", "Cocinar a fuego medio 35-40 minutos y agregar el durazno en los últimos 5 minutos."] },

  { id: "a34", name: "Ñoquis de Papa Caseros con Salsa Fileto", category: "almuerzo", kcal: 580, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["300g Papa", "100g Harina", "1 Huevo", "200ml Salsa fileto"],
    instructions: ["Hervir las papas, hacer puré y mezclar con la harina y el huevo hasta formar la masa.", "Formar los ñoquis y cocinarlos en agua hirviendo hasta que floten.", "Servir con la salsa fileto caliente."] },

  { id: "a35", name: "Pollo al Ajillo con Arroz", category: "almuerzo", kcal: 540, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "4 dientes de Ajo", "70g Arroz"],
    instructions: ["Cocinar el arroz aparte.", "Dorar el pollo en cubos junto con el ajo picado en sartén con aceite.", "Cocinar 8-10 minutos hasta que el pollo esté bien cocido y servir sobre el arroz."] },

  { id: "a36", name: "Cazuela de Mariscos", category: "almuerzo", kcal: 480, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: ["mariscos"], avoidFor: [],
    ingredients: ["200g Mix de mariscos", "Tomate, cebolla y morrón", "Caldo de pescado"],
    instructions: ["Rehogar la cebolla y el morrón en una cazuela.", "Agregar el tomate y el caldo de pescado, cocinar 10 minutos.", "Sumar los mariscos y cocinar 5-6 minutos más hasta que estén cocidos."] },

  { id: "a37", name: "Ensalada de Lentejas y Vegetales", category: "almuerzo", kcal: 460, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Lentejas cocidas", "Tomate, pepino y cebolla morada", "Limón y aceite de oliva"],
    instructions: ["Mezclar las lentejas cocidas con los vegetales picados en un bowl.", "Aliñar con jugo de limón, aceite de oliva y sal.", "Dejar reposar 10 minutos en la heladera antes de servir."] },

  { id: "a38", name: "Pollo al Curry Verde Tailandés", category: "almuerzo", kcal: 560, country: "Asiático", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["200g Pechuga de pollo", "150ml Leche de coco", "2 cdas Pasta de curry verde"],
    instructions: ["Dorar el pollo en cubos en una olla con un poco de aceite.", "Agregar la pasta de curry verde y cocinar 1 minuto.", "Sumar la leche de coco y cocinar a fuego medio 10 minutos hasta espesar."] },

  { id: "a39", name: "Bife a la Criolla con Ensalada", category: "almuerzo", kcal: 600, country: "Argentina", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Bife de carne", "Morrón, cebolla y tomate", "Lechuga"],
    instructions: ["Cocinar el bife en sartén a la plancha al punto deseado.", "Saltear el morrón, la cebolla y el tomate en tiras como guarnición criolla.", "Servir junto a una ensalada fresca de lechuga."] },

  { id: "a40", name: "Bowl de Arroz Integral, Pollo y Vegetales al Vapor", category: "almuerzo", kcal: 520, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pechuga de pollo", "70g Arroz integral", "Brócoli y zanahoria al vapor"],
    instructions: ["Cocinar el arroz integral según las indicaciones del paquete.", "Grillar la pechuga sazonada 5-6 minutos por lado y cortarla en tiras.", "Cocinar los vegetales al vapor y armar el bowl con el arroz, el pollo y los vegetales."] },

  // ---------- ALMUERZOS KETO (nuevas) ----------
  { id: "ak1", name: "Salmón Grillado con Espárragos y Manteca", category: "almuerzo", kcal: 620, country: "General", tags: ["keto", "sin_carbo", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["180g Filete de salmón", "10 Espárragos", "20g Manteca", "Limón"],
    instructions: ["Sellar el salmón en sartén caliente 3-4 minutos por lado.", "Saltear los espárragos en la manteca hasta que estén tiernos.", "Servir el salmón sobre los espárragos con un chorrito de limón."] },

  { id: "ak2", name: "Bife de Chorizo con Puré de Coliflor", category: "almuerzo", kcal: 650, country: "Argentina", tags: ["keto", "sin_carbo", "sin_gluten"], allergens: ["lactosa"], avoidFor: ["colesterol_alto"],
    ingredients: ["200g Bife de chorizo", "Media Coliflor", "20g Manteca", "Sal y pimienta"],
    instructions: ["Cocinar el bife en sartén o parrilla al punto deseado.", "Hervir la coliflor hasta que esté tierna y procesar con la manteca hasta lograr un puré.", "Servir el bife sobre el puré de coliflor."] },

  { id: "ak3", name: "Ensalada Keto de Pollo, Palta y Bacon", category: "almuerzo", kcal: 580, country: "General", tags: ["keto", "sin_carbo", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "1 Palta entera", "40g Panceta", "Hojas verdes mixtas"],
    instructions: ["Grillar la pechuga y cortarla en tiras.", "Dorar la panceta hasta que quede crocante.", "Armar la ensalada con las hojas verdes, la palta en láminas, el pollo y la panceta."] },

  { id: "ak4", name: "Wok Keto de Carne y Vegetales Verdes", category: "almuerzo", kcal: 560, country: "General", tags: ["keto", "sin_carbo", "sin_gluten", "sin_lactosa"], allergens: ["soja"], avoidFor: ["hipertension"],
    ingredients: ["180g Carne de res en tiras", "Brócoli y zucchini", "1 cdita Aceite de sésamo", "Salsa de soja sin azúcar"],
    instructions: ["Saltear la carne en el wok a fuego fuerte hasta dorar.", "Agregar el brócoli y el zucchini, cocinar 4-5 minutos.", "Sumar la salsa de soja y el aceite de sésamo, mezclar 1 minuto más."] },

  { id: "ak5", name: "Muslos de Pollo al Horno con Vegetales Verdes", category: "almuerzo", kcal: 540, country: "General", tags: ["keto", "sin_carbo", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["2 Muslos de pollo con piel", "Brócoli y zucchini", "Aceite de oliva y romero"],
    instructions: ["Colocar el pollo y los vegetales en una fuente para horno.", "Condimentar con romero, sal y un buen chorro de aceite de oliva.", "Hornear a 200°C durante 35-40 minutos hasta dorar la piel."] },

  // ---------- ALMUERZOS MEDITERRÁNEOS (nuevas) ----------
  { id: "am1", name: "Pescado al Horno con Aceitunas y Tomate Estilo Mediterráneo", category: "almuerzo", kcal: 480, country: "Mediterráneo", tags: ["mediterraneo", "sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Filete de pescado blanco", "Tomate cherry y aceitunas negras", "Ajo, orégano y aceite de oliva"],
    instructions: ["Colocar el pescado en una fuente para horno con los tomates y las aceitunas alrededor.", "Condimentar con ajo picado, orégano y un buen chorro de aceite de oliva.", "Hornear a 200°C durante 15-18 minutos hasta que el pescado esté cocido."] },

  { id: "am2", name: "Ensalada Griega Completa con Garbanzos", category: "almuerzo", kcal: 500, country: "Mediterráneo", tags: ["mediterraneo", "vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["Tomate, pepino y cebolla morada", "100g Garbanzos cocidos", "60g Queso feta", "Aceitunas y aceite de oliva"],
    instructions: ["Cortar el tomate, el pepino y la cebolla en trozos grandes.", "Mezclar en un bowl con los garbanzos y las aceitunas.", "Agregar el queso feta en cubos y aliñar con abundante aceite de oliva."] },

  { id: "am3", name: "Pollo al Limón y Orégano con Vegetales Mediterráneos", category: "almuerzo", kcal: 540, country: "Mediterráneo", tags: ["mediterraneo", "sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "Zucchini, berenjena y morrón", "Limón, orégano y aceite de oliva"],
    instructions: ["Marinar el pollo con jugo de limón, orégano y aceite de oliva 10 minutos.", "Grillar el pollo y los vegetales cortados en láminas.", "Servir todo junto con un hilo extra de aceite de oliva."] },

  { id: "am4", name: "Fideos Integrales con Vegetales, Aceitunas y Aceite de Oliva", category: "almuerzo", kcal: 520, country: "Mediterráneo", tags: ["mediterraneo", "vegetariano", "vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["90g Fideos integrales", "Zucchini, tomate cherry y aceitunas", "Ajo y aceite de oliva"],
    instructions: ["Cocinar los fideos en agua con sal hasta que estén al dente.", "Saltear el zucchini y el ajo en aceite de oliva, agregar los tomates cherry y las aceitunas.", "Mezclar todo con los fideos calientes y un buen chorro extra de aceite de oliva."] },

  { id: "am5", name: "Cazuela Mediterránea de Garbanzos y Pescado", category: "almuerzo", kcal: 500, country: "Mediterráneo", tags: ["mediterraneo", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Filete de pescado blanco", "100g Garbanzos cocidos", "Tomate, ajo y pimentón", "Aceite de oliva"],
    instructions: ["Rehogar el ajo en aceite de oliva y agregar el tomate y el pimentón.", "Sumar los garbanzos y un poco de agua, cocinar 10 minutos.", "Agregar el pescado en trozos y cocinar 8 minutos más hasta que esté cocido."] },

  // ---------- DESAYUNOS ARGENTINOS (nuevas) ----------
  { id: "dar1", name: "Facturas Caseras (Vigilantes)", category: "desayuno", kcal: 420, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["150g Harina", "30g Manteca", "Dulce de membrillo", "Levadura"],
    instructions: ["Armar la masa con la harina, la manteca y la levadura, dejar leudar 1 hora.", "Estirar, rellenar con dulce de membrillo y dar forma de vigilante.", "Hornear a 190°C durante 15-18 minutos hasta dorar."] },

  { id: "dar2", name: "Mate con Bizcochitos de Grasa", category: "desayuno", kcal: 350, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten"], avoidFor: ["colesterol_alto"],
    ingredients: ["Yerba mate", "Agua caliente", "4 Bizcochitos de grasa"],
    instructions: ["Cebar el mate con agua caliente (no hirviendo).", "Servir junto a los bizcochitos de grasa.", "Acompañar de a sorbos, alternando con los bizcochitos."] },

  { id: "dar3", name: "Torta Frita Casera", category: "desayuno", kcal: 400, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten"], avoidFor: ["colesterol_alto"],
    ingredients: ["200g Harina", "1 cdita Grasa o aceite", "Agua tibia y sal", "Aceite para freír"],
    instructions: ["Formar una masa simple con la harina, la grasa, sal y agua tibia.", "Estirar en discos finos y hacerles un agujero en el centro.", "Freír en aceite caliente hasta dorar de ambos lados y escurrir sobre papel absorbente."] },

  { id: "dar4", name: "Tostado de Jamón y Queso con Café con Leche", category: "desayuno", kcal: 420, country: "Argentina", tags: [], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["2 rodajas de pan de miga o lactal", "2 fetas de jamón cocido", "2 fetas de queso", "Café con leche"],
    instructions: ["Armar el sándwich con el jamón y el queso entre el pan.", "Tostar en sandwichera hasta que el queso funda.", "Acompañar con un café con leche caliente."] },

  { id: "dar5", name: "Chipá Casero", category: "desayuno", kcal: 380, country: "Argentina", tags: ["vegetariano", "sin_gluten"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["200g Almidón de mandioca", "80g Queso rallado", "1 Huevo", "50ml Leche"],
    instructions: ["Mezclar el almidón con el queso rallado.", "Agregar el huevo y la leche, amasar hasta formar una masa uniforme.", "Formar bollitos y hornear a 200°C durante 20 minutos hasta dorar."] },

  // ---------- ALMUERZOS ADICIONALES (nuevas) ----------
  { id: "a41", name: "Pollo al Romero con Papas al Horno", category: "almuerzo", kcal: 560, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["200g Pechuga de pollo", "3 Papas medianas", "Romero y aceite de oliva"],
    instructions: ["Cortar las papas en gajos y condimentarlas con romero y aceite.", "Hornear el pollo junto a las papas a 200°C durante 30-35 minutos.", "Servir caliente recién salido del horno."] },

  { id: "a42", name: "Ensalada de Garbanzos, Atún y Huevo", category: "almuerzo", kcal: 480, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: ["mariscos", "huevo"], avoidFor: [],
    ingredients: ["150g Garbanzos cocidos", "1 Lata de atún al natural", "1 Huevo duro", "Tomate cherry"],
    instructions: ["Mezclar los garbanzos con el atún escurrido en un bowl.", "Agregar el huevo duro en cuartos y los tomates cherry.", "Aliñar con aceite de oliva y sal a gusto."] },

  { id: "a43", name: "Guiso de Arroz con Pollo y Vegetales", category: "almuerzo", kcal: 550, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pollo en cubos", "100g Arroz", "Zanahoria, morrón y arvejas"],
    instructions: ["Sellar el pollo en una olla hasta dorar.", "Agregar los vegetales y el arroz, cubrir con caldo.", "Cocinar a fuego medio 18-20 minutos hasta que el arroz esté tierno."] },

  { id: "a44", name: "Milanesas de Merluza al Horno con Puré", category: "almuerzo", kcal: 520, country: "General", tags: [], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["2 Filetes de merluza", "1 Huevo", "Pan rallado", "3 Papas para puré"],
    instructions: ["Pasar los filetes por huevo batido y pan rallado.", "Hornear a 200°C durante 15-18 minutos, dando vuelta a mitad de cocción.", "Servir con puré de papas casero."] },

  { id: "a45", name: "Wok de Camarones y Vegetales", category: "almuerzo", kcal: 460, country: "Asiático", tags: ["sin_lactosa", "sin_gluten"], allergens: ["mariscos"], avoidFor: [],
    ingredients: ["200g Camarones pelados", "Brócoli, morrón y zanahoria", "Salsa de soja sin gluten"],
    instructions: ["Saltear los camarones en el wok hasta que tomen color.", "Agregar los vegetales cortados y cocinar 4-5 minutos a fuego fuerte.", "Sumar la salsa de soja, mezclar 1 minuto más y servir."] },

  { id: "a46", name: "Cazuela de Pollo y Batata", category: "almuerzo", kcal: 540, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["200g Muslo de pollo sin piel", "1 Batata grande en cubos", "Cebolla y caldo de verduras"],
    instructions: ["Sellar el pollo en una cazuela hasta dorar.", "Agregar la batata en cubos, la cebolla y el caldo.", "Cocinar tapado a fuego medio 25-30 minutos hasta que todo esté tierno."] },

  { id: "a47", name: "Ensalada Tibia de Pollo, Espinaca y Pera", category: "almuerzo", kcal: 460, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Pechuga de pollo grillada", "Espinaca fresca", "Media pera en láminas"],
    instructions: ["Grillar la pechuga y cortarla en tiras.", "Armar la ensalada con la espinaca como base y la pera en láminas.", "Agregar el pollo por encima y aliñar a gusto."] },

  { id: "a48", name: "Arroz Integral con Lentejas y Vegetales Salteados", category: "almuerzo", kcal: 500, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["80g Arroz integral", "80g Lentejas cocidas", "Zanahoria y morrón salteados"],
    instructions: ["Cocinar el arroz integral según las indicaciones del paquete.", "Saltear la zanahoria y el morrón en una sartén.", "Mezclar todo con las lentejas cocidas y servir tibio."] },

  { id: "a49", name: "Pastel de Papa con Carne Magra", category: "almuerzo", kcal: 580, country: "Argentina", tags: [], allergens: ["lactosa"], avoidFor: ["colesterol_alto"],
    ingredients: ["300g Carne molida magra", "4 Papas para puré", "Cebolla y morrón"],
    instructions: ["Cocinar la carne molida con la cebolla y el morrón picados.", "Colocar la carne en una fuente y cubrir con el puré de papas.", "Gratinar en horno a 200°C durante 15 minutos hasta dorar la superficie."] },

  { id: "a50", name: "Pollo Grillado con Ensalada Tricolor", category: "almuerzo", kcal: 480, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "Tomate, lechuga y choclo", "Aceite de oliva"],
    instructions: ["Grillar la pechuga sazonada 5-6 minutos por lado.", "Armar la ensalada con el tomate, la lechuga y el choclo.", "Servir el pollo en tiras sobre la ensalada, aliñado con aceite de oliva."] },

  // ---------- MERIENDAS (50) ----------
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

  { id: "m16", name: "Té con Tostadas y Queso Untable", category: "meriendas", kcal: 260, country: "General", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["1 Té", "2 Tostadas integrales", "2 cdas Queso untable light"],
    instructions: ["Preparar el té como de costumbre.", "Tostar el pan integral.", "Untar con el queso light y servir junto al té caliente."] },

  { id: "m17", name: "Batido de Banana y Manteca de Maní", category: "meriendas", kcal: 320, country: "General", tags: ["vegetariano"], allergens: ["frutos_secos", "lactosa"], avoidFor: [],
    ingredients: ["1 Banana", "1 cda Manteca de maní", "200ml Leche descremada"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea y cremosa.", "Servir bien frío."] },

  { id: "m18", name: "Ensalada de Frutas con Yogur", category: "meriendas", kcal: 240, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["1 taza de frutas de estación picadas", "100g Yogur natural"],
    instructions: ["Cortar las frutas en cubos parejos.", "Colocarlas en un bowl.", "Cubrir con el yogur natural y servir fresco."] },

  { id: "m19", name: "Alfajor de Avena Casero", category: "meriendas", kcal: 300, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["60g Avena", "1 cda Miel", "Dulce de leche light"],
    instructions: ["Mezclar la avena con la miel y formar dos discos chatos.", "Hornear a 180°C durante 10 minutos y dejar enfriar.", "Unir los dos discos con el dulce de leche light en el medio."] },

  { id: "m20", name: "Tostadas con Palta y Huevo Duro", category: "meriendas", kcal: 340, country: "General", tags: [], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["1 rodaja de pan integral", "Media palta", "1 Huevo duro"],
    instructions: ["Hervir el huevo 9-10 minutos y dejar enfriar.", "Tostar el pan y untar con la palta pisada.", "Cortar el huevo en rodajas y colocarlo sobre la tostada."] },

  { id: "m21", name: "Compota de Manzana con Canela", category: "meriendas", kcal: 180, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["2 Manzanas", "Canela", "Un chorrito de agua"],
    instructions: ["Cortar las manzanas en cubos.", "Cocinar a fuego bajo con el agua y la canela, tapado, 15 minutos.", "Pisar levemente con un tenedor y servir tibia o fría."] },

  { id: "m22", name: "Batido de Chocolate y Banana", category: "meriendas", kcal: 300, country: "General", tags: ["vegetariano"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["1 Banana", "1 cda Cacao amargo", "200ml Leche descremada"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea.", "Servir bien frío en un vaso."] },

  { id: "m23", name: "Mix de Semillas y Frutas Deshidratadas", category: "meriendas", kcal: 260, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 cda Semillas de girasol", "1 cda Semillas de calabaza", "20g Frutas deshidratadas (pasas, orejones)"],
    instructions: ["Mezclar todas las semillas en un bowl pequeño.", "Agregar las frutas deshidratadas.", "Servir como snack práctico para llevar."] },

  { id: "m24", name: "Sándwich de Miga de Jamón y Queso", category: "meriendas", kcal: 300, country: "Argentina", tags: [], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["2 rodajas de pan de miga", "1 feta de jamón cocido", "1 feta de queso"],
    instructions: ["Armar el sándwich con el jamón y el queso entre las rodajas de pan de miga.", "Cortar los bordes si se prefiere.", "Servir en triángulos."] },

  { id: "m25", name: "Torta de Manzana Light (porción)", category: "meriendas", kcal: 320, country: "General", tags: ["vegetariano"], allergens: ["huevo", "gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["1 porción de torta de manzana casera", "100g Harina integral", "1 Manzana", "1 Huevo"],
    instructions: ["Preparar la masa mezclando la harina, el huevo y la manzana en cubos.", "Volcar en un molde y hornear a 180°C durante 30-35 minutos.", "Dejar enfriar antes de cortar una porción."] },

  { id: "m26", name: "Yogur con Chips de Chocolate Amargo", category: "meriendas", kcal: 280, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["200g Yogur natural", "10g Chips de chocolate amargo"],
    instructions: ["Colocar el yogur en un bowl.", "Espolvorear los chips de chocolate amargo por encima.", "Servir inmediatamente."] },

  { id: "m27", name: "Bizcochos de Grasa Caseros", category: "meriendas", kcal: 340, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["colesterol_alto"],
    ingredients: ["150g Harina", "30g Grasa vacuna o manteca", "Sal y agua"],
    instructions: ["Formar la masa con la harina, la grasa, la sal y el agua hasta integrar.", "Estirar y cortar en cuadrados u óvalos.", "Hornear a 200°C durante 15-18 minutos hasta dorar."] },

  { id: "m28", name: "Batido Verde de Espinaca y Manzana", category: "meriendas", kcal: 220, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 puñado de Espinaca fresca", "1 Manzana verde", "200ml Agua fría"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura suave.", "Colar si se prefiere una textura más líquida y servir frío."] },

  { id: "m29", name: "Queso Crema con Frutos Rojos", category: "meriendas", kcal: 260, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["60g Queso crema light", "80g Frutos rojos"],
    instructions: ["Colocar el queso crema en un bowl pequeño.", "Agregar los frutos rojos frescos o descongelados por encima.", "Servir fresco."] },

  { id: "m30", name: "Galletas de Avena y Coco", category: "meriendas", kcal: 300, country: "General", tags: ["vegetariano"], allergens: ["gluten"], avoidFor: ["diabetes"],
    ingredients: ["80g Avena", "30g Coco rallado", "1 cda Miel"],
    instructions: ["Mezclar la avena, el coco rallado y la miel hasta integrar.", "Formar pequeñas galletas con las manos y colocarlas en una placa.", "Hornear a 180°C durante 12-15 minutos hasta dorar."] },

  { id: "m31", name: "Rodajas de Pera con Queso y Nueces", category: "meriendas", kcal: 280, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa", "frutos_secos"], avoidFor: [],
    ingredients: ["1 Pera", "40g Queso fresco", "10g Nueces"],
    instructions: ["Cortar la pera en rodajas finas.", "Colocar un trozo de queso fresco sobre cada rodaja.", "Coronar con las nueces picadas y servir."] },

  { id: "m32", name: "Batido de Frutilla y Banana", category: "meriendas", kcal: 260, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["100g Frutillas", "1 Banana", "200ml Leche vegetal"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea.", "Servir bien frío."] },

  { id: "m33", name: "Torta Fría de Ricota", category: "meriendas", kcal: 340, country: "Argentina", tags: ["vegetariano"], allergens: ["lactosa", "gluten"], avoidFor: ["diabetes"],
    ingredients: ["200g Ricota descremada", "10 Galletitas integrales", "1 cda Miel"],
    instructions: ["Triturar las galletitas y forrar la base de un molde.", "Mezclar la ricota con la miel hasta lograr una crema.", "Volcar sobre la base y enfriar en la heladera mínimo 3 horas antes de cortar."] },

  { id: "m34", name: "Palitos de Apio con Queso Untable", category: "meriendas", kcal: 200, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["3 ramas de Apio", "3 cdas Queso untable light"],
    instructions: ["Cortar el apio en bastones.", "Rellenar cada bastón con el queso untable.", "Servir como snack fresco y crocante."] },

  { id: "m35", name: "Pan Casero con Dulce de Batata", category: "meriendas", kcal: 380, country: "Argentina", tags: ["vegetariano"], allergens: ["gluten"], avoidFor: ["diabetes"],
    ingredients: ["2 rodajas de pan casero", "30g Dulce de batata"],
    instructions: ["Cortar el pan casero en rodajas.", "Untar o colocar el dulce de batata en cubos sobre el pan.", "Servir como merienda dulce tradicional."] },

  { id: "m36", name: "Ensalada de Frutas Cítricas", category: "meriendas", kcal: 180, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 Naranja", "Media toronja", "1 Mandarina"],
    instructions: ["Pelar y cortar todas las frutas cítricas en gajos.", "Mezclarlas en un bowl.", "Servir bien frías."] },

  { id: "m37", name: "Batido de Avena y Dátiles", category: "meriendas", kcal: 300, country: "General", tags: ["vegano", "sin_lactosa"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["30g Avena", "4 Dátiles sin carozo", "200ml Leche vegetal"],
    instructions: ["Remojar los dátiles en agua tibia 10 minutos y escurrir.", "Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea y servir."] },

  { id: "m38", name: "Tostaditas con Paté de Berenjena", category: "meriendas", kcal: 260, country: "Mediterráneo", tags: ["vegano", "mediterraneo"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["1 Berenjena", "2 Tostadas integrales", "Ajo y aceite de oliva"],
    instructions: ["Hornear la berenjena entera hasta que esté bien tierna, unos 30 minutos.", "Pisar la pulpa con ajo y aceite de oliva hasta formar un paté.", "Untar sobre las tostadas y servir."] },

  { id: "m39", name: "Muffins Integrales de Zanahoria", category: "meriendas", kcal: 320, country: "General", tags: ["vegetariano"], allergens: ["huevo", "gluten"], avoidFor: ["diabetes"],
    ingredients: ["100g Harina integral", "1 Zanahoria rallada", "1 Huevo", "1 cda Miel"],
    instructions: ["Mezclar la harina, la zanahoria rallada, el huevo y la miel hasta integrar.", "Distribuir la mezcla en pirotines o moldes para muffin.", "Hornear a 180°C durante 20 minutos hasta dorar."] },

  { id: "m40", name: "Cacao Caliente con Leche Descremada", category: "meriendas", kcal: 220, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["200ml Leche descremada", "1 cda Cacao amargo", "1 cdita Miel"],
    instructions: ["Calentar la leche en una olla pequeña.", "Agregar el cacao amargo y la miel, revolviendo hasta disolver.", "Servir caliente en una taza."] },

  // ---------- MERIENDAS KETO (nuevas) ----------
  { id: "mk1", name: "Bombas de Grasa de Coco y Cacao", category: "meriendas", kcal: 280, country: "General", tags: ["keto", "vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["30g Manteca a temperatura ambiente", "20g Coco rallado sin azúcar", "1 cda Cacao amargo"],
    instructions: ["Mezclar la manteca con el coco rallado y el cacao amargo hasta integrar.", "Formar bolitas pequeñas con las manos.", "Enfriar en la heladera 20 minutos antes de servir."] },

  { id: "mk2", name: "Huevos Rellenos con Palta", category: "meriendas", kcal: 260, country: "General", tags: ["keto", "sin_carbo", "sin_gluten", "sin_lactosa"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["2 Huevos duros", "Media palta", "Jugo de limón"],
    instructions: ["Hervir los huevos 9-10 minutos, enfriar y cortar al medio.", "Retirar las yemas y pisarlas junto con la palta y el jugo de limón.", "Rellenar las claras con la mezcla y servir frío."] },

  { id: "mk3", name: "Palitos de Apio con Queso Crema y Nueces", category: "meriendas", kcal: 300, country: "General", tags: ["keto", "vegetariano", "sin_gluten"], allergens: ["lactosa", "frutos_secos"], avoidFor: [],
    ingredients: ["3 ramas de Apio", "3 cdas Queso crema entero", "15g Nueces picadas"],
    instructions: ["Cortar el apio en bastones.", "Rellenar cada bastón con el queso crema.", "Espolvorear las nueces picadas por encima."] },

  { id: "mk4", name: "Mix Keto de Frutos Secos y Coco", category: "meriendas", kcal: 320, country: "General", tags: ["keto", "vegano", "sin_gluten", "sin_lactosa"], allergens: ["frutos_secos"], avoidFor: [],
    ingredients: ["20g Almendras", "10g Nueces", "10g Coco en láminas sin azúcar"],
    instructions: ["Mezclar todos los frutos secos y el coco en un bowl pequeño.", "Servir como snack práctico para llevar."] },

  // ---------- MERIENDAS MEDITERRÁNEAS (nuevas) ----------
  { id: "mm1", name: "Hummus con Bastones de Vegetales", category: "meriendas", kcal: 260, country: "Mediterráneo", tags: ["mediterraneo", "vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["4 cdas Hummus", "Zanahoria, apio y pepino en bastones", "Un hilo de Aceite de oliva"],
    instructions: ["Colocar el hummus en un bowl y rociarlo con el aceite de oliva.", "Cortar los vegetales en bastones parejos.", "Servir los bastones junto al hummus para untar."] },

  { id: "mm2", name: "Aceitunas, Queso Feta y Tomates Cherry", category: "meriendas", kcal: 260, country: "Mediterráneo", tags: ["mediterraneo", "vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["10 Aceitunas mixtas", "50g Queso feta en cubos", "8 Tomates cherry"],
    instructions: ["Colocar las aceitunas, el queso feta y los tomates cherry en un plato.", "Rociar con un hilo de aceite de oliva y orégano.", "Servir como snack fresco tipo mezze."] },

  { id: "mm3", name: "Tostada Mediterránea de Ricota y Miel con Nueces", category: "meriendas", kcal: 320, country: "Mediterráneo", tags: ["mediterraneo", "vegetariano"], allergens: ["lactosa", "gluten", "frutos_secos"], avoidFor: ["diabetes"],
    ingredients: ["1 rodaja de pan integral", "50g Ricota", "1 cdita Miel", "10g Nueces"],
    instructions: ["Tostar el pan integral.", "Untar con la ricota.", "Agregar un hilo de miel y las nueces picadas por encima."] },

  // ---------- MERIENDAS ADICIONALES (nuevas) ----------
  { id: "m41", name: "Tostadas de Arroz con Queso Untable", category: "meriendas", kcal: 220, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["3 Tostadas de arroz", "2 cdas Queso untable light", "Semillas de sésamo"],
    instructions: ["Untar las tostadas de arroz con el queso untable.", "Espolvorear las semillas de sésamo por encima.", "Servir enseguida para que no pierdan la textura crocante."] },

  { id: "m42", name: "Batido de Kiwi y Manzana", category: "meriendas", kcal: 200, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["2 Kiwis", "1 Manzana", "150ml Agua fría"],
    instructions: ["Pelar y cortar el kiwi y la manzana en trozos.", "Licuar con el agua fría hasta lograr una textura homogénea.", "Servir inmediatamente bien frío."] },

  { id: "m43", name: "Yogur con Granola y Miel", category: "meriendas", kcal: 300, country: "General", tags: ["vegetariano"], allergens: ["lactosa", "gluten"], avoidFor: ["diabetes"],
    ingredients: ["150g Yogur natural", "30g Granola", "1 cdita Miel"],
    instructions: ["Colocar el yogur como base en un vaso o bowl.", "Agregar la granola por encima.", "Rociar con la miel antes de servir."] },

  { id: "m44", name: "Palitos de Pepino con Queso Crema", category: "meriendas", kcal: 180, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["1 Pepino grande en bastones", "3 cdas Queso crema light"],
    instructions: ["Cortar el pepino en bastones parejos.", "Servir con el queso crema light como dip.", "Ideal para picar entre comidas."] },

  { id: "m45", name: "Barrita de Avena y Manteca de Maní", category: "meriendas", kcal: 320, country: "General", tags: ["vegetariano"], allergens: ["frutos_secos"], avoidFor: [],
    ingredients: ["60g Avena", "2 cdas Manteca de maní", "1 cda Miel"],
    instructions: ["Mezclar la avena con la manteca de maní y la miel hasta integrar.", "Formar una barra compacta en un molde.", "Enfriar en la heladera al menos 1 hora antes de cortar en porciones."] },

  { id: "m46", name: "Ensalada de Frutas de Estación", category: "meriendas", kcal: 160, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 taza de frutas de estación mixtas", "Jugo de medio limón"],
    instructions: ["Cortar las frutas en cubos parejos.", "Rociar con el jugo de limón para evitar que se oxiden.", "Servir bien fría en un bowl."] },

  { id: "m47", name: "Sándwich Integral de Atún", category: "meriendas", kcal: 340, country: "General", tags: [], allergens: ["gluten", "mariscos"], avoidFor: [],
    ingredients: ["2 rodajas de pan integral", "1 Lata de atún al natural", "Tomate en rodajas"],
    instructions: ["Escurrir el atún y mezclarlo con un poco de aceite de oliva.", "Untar el pan con el atún y agregar el tomate.", "Cerrar el sándwich y cortar al medio."] },

  { id: "m48", name: "Chips de Batata al Horno", category: "meriendas", kcal: 240, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["1 Batata mediana en láminas finas", "Aceite de oliva en spray", "Sal y pimentón"],
    instructions: ["Cortar la batata en láminas bien finas.", "Colocarlas en una placa con aceite en spray, sal y pimentón.", "Hornear a 200°C durante 20-25 minutos hasta que estén crocantes."] },

  { id: "m49", name: "Licuado de Avena y Manzana", category: "meriendas", kcal: 260, country: "General", tags: ["vegano", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["40g Avena", "1 Manzana", "200ml Leche vegetal", "Canela"],
    instructions: ["Colocar todos los ingredientes en la licuadora.", "Licuar hasta lograr una textura homogénea.", "Servir frío espolvoreado con canela."] },

  { id: "m50", name: "Torta de Ricota y Limón (porción)", category: "meriendas", kcal: 320, country: "Argentina", tags: ["vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["150g Ricota descremada", "1 Huevo", "Ralladura y jugo de 1 limón"],
    instructions: ["Batir la ricota con el huevo y la ralladura de limón hasta integrar.", "Colocar la mezcla en un molde y hornear a 180°C durante 30 minutos.", "Dejar enfriar antes de desmoldar y servir en porciones."] },

  // ---------- CENAS (50) ----------
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

  { id: "c18", name: "Pollo a la Plancha con Ensalada de Rúcula", category: "cena", kcal: 420, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pechuga de pollo", "Rúcula fresca", "Tomate cherry", "Limón"],
    instructions: ["Grillar la pechuga sazonada 5-6 minutos por lado.", "Mezclar la rúcula con los tomates cherry en un bowl.", "Aliñar con limón y servir junto al pollo cortado en tiras."] },

  { id: "c19", name: "Sopa de Lentejas Liviana", category: "cena", kcal: 380, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["100g Lentejas", "Zanahoria y apio", "Caldo de verduras"],
    instructions: ["Rehogar la zanahoria y el apio picados en una olla.", "Agregar las lentejas y cubrir con el caldo de verduras.", "Cocinar a fuego medio 25-30 minutos hasta que las lentejas estén tiernas."] },

  { id: "c20", name: "Revuelto de Zapallitos con Huevo", category: "cena", kcal: 350, country: "General", tags: ["sin_carbo", "vegetariano", "sin_gluten"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["2 Zapallitos", "3 Huevos", "Cebolla"],
    instructions: ["Saltear los zapallitos en cubos junto con la cebolla hasta que se ablanden.", "Batir los huevos y agregarlos a la sartén.", "Revolver a fuego bajo hasta que cuajen y servir caliente."] },

  { id: "c21", name: "Empanadas Árabes de Carne", category: "cena", kcal: 480, country: "Mediterráneo", tags: [], allergens: ["gluten"], avoidFor: [],
    ingredients: ["6 Tapas de empanada", "150g Carne molida magra", "Limón y especias árabes"],
    instructions: ["Mezclar la carne molida con jugo de limón y las especias.", "Rellenar las tapas dándoles forma abierta triangular típica.", "Hornear a 200°C durante 15-18 minutos hasta dorar."] },

  { id: "c22", name: "Pescado al Horno con Limón y Hierbas", category: "cena", kcal: 380, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["180g Filete de pescado blanco", "Jugo de 1 limón", "Hierbas frescas (perejil, tomillo)"],
    instructions: ["Colocar el pescado en una fuente para horno.", "Bañar con el jugo de limón y espolvorear las hierbas frescas.", "Hornear a 200°C durante 15-18 minutos hasta que esté cocido."] },

  { id: "c23", name: "Ensalada Templada de Quinoa y Vegetales", category: "cena", kcal: 420, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["70g Quinoa", "Zucchini y morrón asados", "Aceite de oliva"],
    instructions: ["Cocinar la quinoa según las indicaciones del paquete.", "Asar el zucchini y el morrón en sartén o al horno.", "Mezclar todo tibio con un hilo de aceite de oliva y servir."] },

  { id: "c24", name: "Wok de Pollo y Vegetales Asiático", category: "cena", kcal: 460, country: "Asiático", tags: ["sin_lactosa"], allergens: ["soja"], avoidFor: ["hipertension"],
    ingredients: ["150g Pollo en tiras", "Brócoli, zanahoria y morrón", "Salsa de soja"],
    instructions: ["Saltear el pollo en el wok hasta dorar.", "Agregar los vegetales cortados y cocinar 4-5 minutos a fuego fuerte.", "Sumar la salsa de soja, mezclar 1 minuto más y servir."] },

  { id: "c25", name: "Tarta de Zapallitos sin Tapa", category: "cena", kcal: 380, country: "Argentina", tags: ["vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["2 Zapallitos rallados", "3 Huevos", "50g Queso rallado"],
    instructions: ["Escurrir bien los zapallitos rallados con un paño.", "Batir los huevos con el queso rallado e integrar con los zapallitos.", "Volcar en una fuente para horno y cocinar a 180°C por 25-30 minutos."] },

  { id: "c26", name: "Milanesas de Pollo a la Napolitana", category: "cena", kcal: 560, country: "Argentina", tags: [], allergens: ["huevo", "gluten", "lactosa"], avoidFor: [],
    ingredients: ["1 Pechuga de pollo fileteada", "Pan rallado", "Salsa de tomate", "Queso mozzarella"],
    instructions: ["Pasar el pollo por huevo batido y luego por pan rallado, y cocinar en sartén hasta dorar.", "Cubrir con salsa de tomate y queso mozzarella.", "Gratinar en horno 8-10 minutos hasta que el queso se derrita."] },

  { id: "c27", name: "Sopa Minestrone", category: "cena", kcal: 350, country: "General", tags: ["vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["Zanahoria, apio y zapallito", "100g Fideos integrales chicos", "Pulpa de tomate"],
    instructions: ["Rehogar los vegetales picados en una olla.", "Agregar la pulpa de tomate y cubrir con agua o caldo de verduras.", "Sumar los fideos y cocinar hasta que estén tiernos, unos 10-12 minutos."] },

  { id: "c28", name: "Pollo al Verdeo Light", category: "cena", kcal: 420, country: "Argentina", tags: ["sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "Cebolla de verdeo", "100ml Crema light"],
    instructions: ["Dorar el pollo en cubos en una sartén.", "Agregar la cebolla de verdeo picada y saltear 2 minutos.", "Sumar la crema light y cocinar 5 minutos más a fuego bajo."] },

  { id: "c29", name: "Ensalada de Garbanzos y Atún", category: "cena", kcal: 420, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: ["mariscos"], avoidFor: [],
    ingredients: ["150g Garbanzos cocidos", "1 Lata de atún al natural", "Tomate y cebolla morada"],
    instructions: ["Escurrir el atún y mezclarlo con los garbanzos en un bowl.", "Agregar el tomate y la cebolla morada picados.", "Aliñar con aceite de oliva, sal y limón a gusto."] },

  { id: "c30", name: "Vegetales Grillados con Quinoa", category: "cena", kcal: 400, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["70g Quinoa", "Berenjena, zucchini y morrón", "Aceite de oliva"],
    instructions: ["Cocinar la quinoa según las indicaciones del paquete.", "Grillar los vegetales cortados en láminas con un poco de aceite.", "Servir los vegetales grillados sobre la quinoa."] },

  { id: "c31", name: "Croquetas de Arroz y Vegetales al Horno", category: "cena", kcal: 400, country: "General", tags: ["vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["100g Arroz cocido", "Zanahoria rallada", "1 Huevo", "30g Queso rallado"],
    instructions: ["Mezclar el arroz cocido con la zanahoria, el huevo y el queso rallado.", "Formar croquetas pequeñas con las manos.", "Hornear a 200°C durante 20 minutos, dando vuelta a mitad de cocción."] },

  { id: "c32", name: "Pechuga Rellena de Espinaca y Queso", category: "cena", kcal: 480, country: "General", tags: ["sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["1 Pechuga de pollo grande", "Espinaca salteada", "40g Queso"],
    instructions: ["Abrir la pechuga en forma de libro y rellenar con la espinaca y el queso.", "Cerrar con palillos y sellar en sartén caliente por ambos lados.", "Terminar la cocción al horno a 190°C durante 15-18 minutos."] },

  { id: "c33", name: "Ensalada Griega con Queso Feta", category: "cena", kcal: 380, country: "Mediterráneo", tags: ["vegetariano", "sin_gluten", "mediterraneo"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["Tomate, pepino y cebolla morada", "60g Queso feta", "Aceitunas negras"],
    instructions: ["Cortar el tomate, el pepino y la cebolla en trozos grandes.", "Mezclar en un bowl con las aceitunas.", "Agregar el queso feta en cubos y aliñar con aceite de oliva."] },

  { id: "c34", name: "Salteado de Camarones con Vegetales", category: "cena", kcal: 400, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: ["mariscos"], avoidFor: [],
    ingredients: ["180g Camarones", "Morrón, zucchini y brócoli", "Ajo y aceite de oliva"],
    instructions: ["Saltear el ajo en aceite de oliva en un wok o sartén.", "Agregar los camarones y cocinar 2-3 minutos por lado.", "Sumar los vegetales y saltear 4-5 minutos más hasta que estén tiernos."] },

  { id: "c35", name: "Hamburguesa de Lentejas Caseras", category: "cena", kcal: 460, country: "General", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Lentejas cocidas", "Cebolla y comino", "Lechuga y tomate"],
    instructions: ["Pisar las lentejas cocidas con la cebolla picada y el comino hasta formar una pasta.", "Formar medallones y cocinar en sartén con un poco de aceite, 4 minutos por lado.", "Servir con lechuga y tomate."] },

  { id: "c36", name: "Pollo al Romero con Puré de Coliflor", category: "cena", kcal: 400, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "Media Coliflor", "Romero fresco"],
    instructions: ["Grillar la pechuga condimentada con romero fresco.", "Hervir la coliflor hasta que esté tierna y procesar hasta lograr un puré.", "Servir el pollo sobre el puré de coliflor."] },

  { id: "c37", name: "Fideos de Zucchini con Pesto", category: "cena", kcal: 380, country: "General", tags: ["vegetariano", "sin_gluten"], allergens: ["lactosa", "frutos_secos"], avoidFor: [],
    ingredients: ["2 Zucchinis en cintas (fideos)", "Albahaca fresca", "20g Nueces", "20g Queso parmesano"],
    instructions: ["Cortar los zucchinis en tiras finas tipo fideo con un pelador o espiralizador.", "Procesar la albahaca con las nueces, el parmesano y aceite de oliva hasta formar el pesto.", "Saltear los fideos de zucchini 2 minutos y mezclar con el pesto antes de servir."] },

  { id: "c38", name: "Empanadas de Atún al Horno", category: "cena", kcal: 450, country: "General", tags: [], allergens: ["gluten", "mariscos"], avoidFor: [],
    ingredients: ["6 Tapas de empanada", "1 Lata de atún al natural", "Cebolla y morrón"],
    instructions: ["Rehogar la cebolla y el morrón, y mezclar con el atún escurrido.", "Rellenar las tapas y cerrar con un repulgue.", "Hornear a 200°C durante 15-18 minutos hasta dorar."] },

  { id: "c39", name: "Sopa de Pollo Casera", category: "cena", kcal: 320, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Pechuga de pollo", "Zanahoria, apio y fideos chicos", "Caldo casero"],
    instructions: ["Hervir la pechuga entera en el caldo hasta cocinarla y desmenuzarla.", "Agregar la zanahoria y el apio picados, cocinar 10 minutos.", "Sumar los fideos chicos y cocinar 8 minutos más antes de servir."] },

  { id: "c40", name: "Bowl de Tofu, Arroz y Vegetales Salteados", category: "cena", kcal: 440, country: "Asiático", tags: ["vegano", "sin_gluten", "sin_lactosa"], allergens: ["soja"], avoidFor: [],
    ingredients: ["150g Tofu firme", "70g Arroz", "Brócoli y zanahoria"],
    instructions: ["Cocinar el arroz aparte según las indicaciones del paquete.", "Dorar el tofu en cubos en una sartén con un poco de aceite.", "Saltear los vegetales, mezclar todo en un bowl junto al arroz y servir."] },

  // ---------- CENAS KETO (nuevas) ----------
  { id: "ck1", name: "Salmón a la Manteca con Espinaca Salteada", category: "cena", kcal: 500, country: "General", tags: ["keto", "sin_carbo", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["180g Filete de salmón", "20g Manteca", "1 puñado Espinaca fresca"],
    instructions: ["Sellar el salmón en sartén con la manteca, 3-4 minutos por lado.", "Retirar el salmón y saltear la espinaca en la misma sartén hasta que se ablande.", "Servir el salmón sobre la espinaca salteada."] },

  { id: "ck2", name: "Milanesas de Berenjena Keto (sin pan rallado)", category: "cena", kcal: 400, country: "General", tags: ["keto", "vegetariano", "sin_gluten"], allergens: ["huevo", "lactosa"], avoidFor: [],
    ingredients: ["1 Berenjena grande en láminas", "1 Huevo", "40g Queso parmesano rallado (como cobertura)"],
    instructions: ["Cortar la berenjena en láminas finas y salarlas 10 minutos para quitar el amargor.", "Pasar cada lámina por huevo batido y luego por el parmesano rallado.", "Hornear a 200°C durante 20 minutos, dando vuelta a mitad de cocción."] },

  { id: "ck3", name: "Pechuga Rellena de Queso y Panceta", category: "cena", kcal: 520, country: "General", tags: ["keto", "sin_carbo", "sin_gluten"], allergens: ["lactosa"], avoidFor: ["colesterol_alto"],
    ingredients: ["1 Pechuga de pollo grande", "40g Queso", "30g Panceta"],
    instructions: ["Abrir la pechuga en forma de libro y rellenar con el queso y la panceta.", "Cerrar con palillos y sellar en sartén caliente por ambos lados.", "Terminar la cocción al horno a 190°C durante 15-18 minutos."] },

  { id: "ck4", name: "Coliflor Gratinada con Queso y Panceta", category: "cena", kcal: 460, country: "General", tags: ["keto", "sin_carbo", "sin_gluten", "vegetariano"], allergens: ["lactosa"], avoidFor: ["colesterol_alto"],
    ingredients: ["Media Coliflor en ramitos", "60g Queso rallado", "30g Panceta"],
    instructions: ["Cocinar la coliflor al vapor hasta que esté tierna.", "Colocarla en una fuente, cubrir con el queso rallado y la panceta en trozos.", "Gratinar en horno a 200°C durante 12-15 minutos hasta dorar."] },

  // ---------- CENAS MEDITERRÁNEAS (nuevas) ----------
  { id: "cm1", name: "Pescado al Papillote con Hierbas Mediterráneas", category: "cena", kcal: 380, country: "Mediterráneo", tags: ["mediterraneo", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["180g Filete de pescado blanco", "Tomate, aceitunas y limón", "Aceite de oliva y orégano"],
    instructions: ["Colocar el pescado sobre papel manteca con el tomate, las aceitunas y rodajas de limón.", "Rociar con aceite de oliva y orégano, y cerrar el papillote.", "Hornear a 200°C durante 15-18 minutos hasta que el pescado esté cocido."] },

  { id: "cm2", name: "Berenjenas a la Mediterránea con Tomate y Queso Feta", category: "cena", kcal: 400, country: "Mediterráneo", tags: ["mediterraneo", "vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["2 Berenjenas medianas", "Tomate triturado", "50g Queso feta", "Orégano y aceite de oliva"],
    instructions: ["Cortar las berenjenas en rodajas y grillarlas con un poco de aceite de oliva.", "Cubrir con el tomate triturado condimentado con orégano.", "Coronar con el queso feta desmenuzado y gratinar en horno 10 minutos."] },

  { id: "cm3", name: "Ensalada Tibia de Garbanzos, Espinaca y Aceitunas", category: "cena", kcal: 420, country: "Mediterráneo", tags: ["mediterraneo", "vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["150g Garbanzos cocidos", "Espinaca fresca", "Aceitunas negras", "Aceite de oliva y limón"],
    instructions: ["Saltear los garbanzos en aceite de oliva 3-4 minutos.", "Agregar la espinaca y cocinar hasta que se ablande.", "Sumar las aceitunas, aliñar con limón y aceite de oliva extra, y servir tibio."] },

  { id: "cm4", name: "Pollo al Horno con Limón, Aceitunas y Romero", category: "cena", kcal: 460, country: "Mediterráneo", tags: ["mediterraneo", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["200g Muslo de pollo sin piel", "Aceitunas verdes", "Limón en rodajas", "Romero y aceite de oliva"],
    instructions: ["Colocar el pollo en una fuente para horno con las aceitunas y el limón en rodajas.", "Condimentar con romero y un buen chorro de aceite de oliva.", "Hornear a 200°C durante 30-35 minutos hasta dorar."] },

  // ---------- CENAS ADICIONALES (nuevas) ----------
  { id: "c41", name: "Sopa Minestrone Liviana", category: "cena", kcal: 340, country: "General", tags: ["vegano", "sin_lactosa"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["Zanahoria, apio y zapallito", "80g Fideos chicos", "150g Porotos cocidos"],
    instructions: ["Rehogar los vegetales picados en una olla.", "Agregar caldo de verduras y los porotos, cocinar 15 minutos.", "Sumar los fideos y cocinar 8-10 minutos más hasta que estén al dente."] },

  { id: "c42", name: "Pollo al Verdeo con Puré de Calabaza", category: "cena", kcal: 460, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["180g Pechuga de pollo", "Cebolla de verdeo", "300g Calabaza"],
    instructions: ["Saltear el pollo en tiras con la cebolla de verdeo hasta dorar.", "Hervir la calabaza y hacer un puré.", "Servir el pollo sobre el puré de calabaza."] },

  { id: "c43", name: "Ensalada de Salmón Ahumado y Rúcula", category: "cena", kcal: 400, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["100g Salmón ahumado", "Rúcula fresca", "Tomate cherry y limón"],
    instructions: ["Armar la base de la ensalada con la rúcula y los tomates cherry.", "Distribuir el salmón ahumado en láminas por encima.", "Aliñar con jugo de limón y aceite de oliva."] },

  { id: "c44", name: "Guiso Liviano de Pollo y Arroz Integral", category: "cena", kcal: 480, country: "General", tags: ["sin_lactosa", "sin_gluten"], allergens: [], avoidFor: [],
    ingredients: ["150g Pollo en cubos", "60g Arroz integral", "Zanahoria y apio"],
    instructions: ["Sellar el pollo en una olla hasta dorar.", "Agregar los vegetales y el arroz, cubrir con caldo de verduras.", "Cocinar tapado a fuego medio 25 minutos hasta que el arroz esté tierno."] },

  { id: "c45", name: "Zapallitos Rellenos de Carne", category: "cena", kcal: 420, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["3 Zapallitos redondos", "150g Carne molida magra", "Cebolla y morrón"],
    instructions: ["Ahuecar los zapallitos y reservar la pulpa.", "Saltear la carne con la cebolla, el morrón y la pulpa reservada.", "Rellenar los zapallitos y hornear a 190°C durante 25 minutos."] },

  { id: "c46", name: "Wrap Vegano de Garbanzos y Vegetales", category: "cena", kcal: 420, country: "General", tags: ["vegano"], allergens: ["gluten"], avoidFor: [],
    ingredients: ["1 Tortilla integral", "150g Garbanzos pisados", "Lechuga, tomate y zanahoria rallada"],
    instructions: ["Pisar los garbanzos con un tenedor y condimentar a gusto.", "Colocar el puré de garbanzos sobre la tortilla junto a los vegetales.", "Enrollar bien apretado y cortar al medio para servir."] },

  { id: "c47", name: "Merluza a la Romana Ligera", category: "cena", kcal: 400, country: "General", tags: [], allergens: ["huevo", "gluten"], avoidFor: [],
    ingredients: ["2 Filetes de merluza", "1 Huevo", "2 cdas Harina"],
    instructions: ["Pasar los filetes por harina y luego por huevo batido.", "Cocinar en sartén con poco aceite hasta dorar de ambos lados.", "Servir caliente con una guarnición de ensalada."] },

  { id: "c48", name: "Cazuela de Pollo y Vegetales de Estación", category: "cena", kcal: 440, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["180g Muslo de pollo sin piel", "Zapallo, zanahoria y apio", "Caldo de verduras"],
    instructions: ["Sellar el pollo en una cazuela hasta dorar.", "Agregar los vegetales cortados y el caldo.", "Cocinar tapado a fuego medio 30 minutos hasta que todo esté tierno."] },

  { id: "c49", name: "Tortilla de Papa y Cebolla Liviana", category: "cena", kcal: 380, country: "España", tags: ["vegetariano", "sin_gluten", "sin_lactosa"], allergens: ["huevo"], avoidFor: [],
    ingredients: ["2 Papas medianas", "1 Cebolla", "3 Huevos"],
    instructions: ["Cortar las papas y la cebolla en láminas finas y cocinarlas en sartén con poco aceite hasta que estén tiernas.", "Batir los huevos e integrarlos con las papas y la cebolla.", "Volcar en la sartén y cocinar tapado a fuego bajo, dando vuelta para dorar ambos lados."] },

  { id: "c50", name: "Brochettes de Pollo y Vegetales a la Parrilla", category: "cena", kcal: 420, country: "General", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["200g Pechuga de pollo en cubos", "Morrón, cebolla y zucchini", "Limón y hierbas"],
    instructions: ["Armar las brochettes intercalando el pollo con los vegetales.", "Marinar con jugo de limón, aceite de oliva y hierbas 15 minutos.", "Cocinar a la parrilla o plancha 10-12 minutos, girando hasta dorar por todos lados."] },

  // ---------- CENAS ARGENTINAS (nuevas) ----------
  { id: "car1", name: "Asado Liviano con Ensalada Mixta", category: "cena", kcal: 550, country: "Argentina", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: ["colesterol_alto"],
    ingredients: ["200g Corte magro de asado (vacío o entraña)", "Lechuga, tomate y cebolla", "Chimichurri casero"],
    instructions: ["Cocinar la carne a la parrilla o plancha a fuego medio hasta el punto deseado.", "Armar la ensalada mixta con lechuga, tomate y cebolla.", "Servir la carne junto a la ensalada y un toque de chimichurri."] },

  { id: "car2", name: "Empanadas de Carne al Horno", category: "cena", kcal: 480, country: "Argentina", tags: [], allergens: ["gluten", "huevo"], avoidFor: [],
    ingredients: ["6 Tapas de empanada", "200g Carne cortada a cuchillo", "Cebolla, huevo duro y aceitunas"],
    instructions: ["Rehogar la carne con la cebolla hasta cocinar bien.", "Agregar el huevo duro picado y las aceitunas, mezclar y dejar enfriar.", "Rellenar las tapas, cerrar con repulgue y hornear a 200°C durante 15-18 minutos."] },

  { id: "car3", name: "Milanesas a la Napolitana Livianas", category: "cena", kcal: 540, country: "Argentina", tags: [], allergens: ["huevo", "gluten", "lactosa"], avoidFor: [],
    ingredients: ["2 Milanesas de pollo al horno", "Salsa de tomate", "Jamón y queso mozzarella light"],
    instructions: ["Cocinar las milanesas de pollo al horno hasta dorar.", "Cubrir cada una con salsa de tomate, una feta de jamón y queso mozzarella.", "Gratinar en horno a 200°C durante 8-10 minutos hasta que funda el queso."] },

  { id: "car4", name: "Locro Liviano de Verano", category: "cena", kcal: 500, country: "Argentina", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["100g Maíz blanco", "100g Porotos", "150g Zapallo", "150g Carne magra"],
    instructions: ["Remojar el maíz y los porotos la noche anterior.", "Cocinar todos los ingredientes juntos a fuego bajo durante 1 hora y media hasta espesar.", "Servir bien caliente en un bowl hondo."] },

  { id: "car5", name: "Pollo a la Parrilla con Provenzal", category: "cena", kcal: 460, country: "Argentina", tags: ["sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["200g Pechuga de pollo", "Ajo y perejil picado (provenzal)", "Limón"],
    instructions: ["Marinar el pollo con el provenzal y jugo de limón 15 minutos.", "Cocinar a la parrilla o plancha 6-7 minutos por lado.", "Servir caliente con un extra de provenzal fresco por encima."] },
];

// Helper: devuelve todas las recetas de una categoría ("desayuno", "almuerzo", "meriendas", "cena")
function getRecipesByCategory(category) {
  return RECIPES_DB.filter(r => r.category === category);
}

// Helper: devuelve todas las recetas de un país dado (ej: "Argentina", "México", "Mediterráneo").
// La comparación ignora mayúsculas/acentos simples para que "argentina" o "Argentina" matcheen igual.
function getRecipesByCountry(country) {
  const normalize = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const target = normalize(country);
  return RECIPES_DB.filter(r => normalize(r.country) === target);
}

// Helper: igual que getRecipesByCountry pero además filtrado por categoría (opcional).
// Pensado para el chat: si el usuario escribe "Argentina", se puede llamar
// getRecipesByCountry("Argentina") para traer todas, o pasar una categoría puntual.
function getRecipesByCountryAndCategory(country, category) {
  const byCountry = getRecipesByCountry(country);
  return category ? byCountry.filter(r => r.category === category) : byCountry;
}

// Metadata visual por categoría (usada por app.js para íconos y etiquetas)
const CATEGORY_META = {
  desayuno: { icon: "🍳", label: "Desayuno" },
  almuerzo: { icon: "🍗", label: "Almuerzo" },
  meriendas: { icon: "🥪", label: "Merienda" },
  cena: { icon: "🍽️", label: "Cena" }
};


// ======================================================================
// BASE DE BEBIDAS — sugerencias con y sin alcohol por categoría de comida.
// La opción CON alcohol solo se ofrece los domingos (día permitido); el resto
// de la semana solo se sugieren opciones sin alcohol.
// ======================================================================

const BEBIDAS_DB = {
  desayuno: {
    sinAlcohol: [
      "Agua saborizada con menta y limón", "Infusión de jengibre y limón", "Café con leche descremada",
      "Té verde", "Agua de coco fría", "Jugo de naranja exprimido", "Mate cocido",
      "Licuado de frutas sin azúcar agregada", "Té negro con limón", "Infusión de rooibos",
      "Café cortado con leche vegetal", "Jugo de pomelo rosado exprimido", "Agua tibia con limón y jengibre",
      "Licuado de banana y avena sin azúcar", "Té chai con leche descremada", "Agua saborizada con frutilla"
    ],
    conAlcohol: [
      "Mimosa (jugo de naranja con espumante)", "Bellini (jugo de durazno con espumante)",
      "Copa de espumante bien frío", "Café irlandés (café con whisky)",
      "Kir Royale (espumante con licor de cassis)", "Mimosa de pomelo (pomelo con espumante)",
      "Bloody Mary suave (jugo de tomate con vodka)", "Sgroppino (espumante con sorbete de limón)"
    ]
  },
  almuerzo: {
    sinAlcohol: [
      "Agua con gas y rodajas de limón", "Limonada casera sin azúcar", "Agua saborizada con pepino y menta",
      "Té helado sin azúcar", "Soda con hielo", "Jugo de pomelo diluido con agua", "Agua tónica light",
      "Infusión fría de hibisco", "Limonada de jengibre sin azúcar", "Agua saborizada con naranja y romero",
      "Té helado de durazno sin azúcar", "Soda con lima y menta", "Agua de Jamaica (hibisco frío)",
      "Jugo de arándanos diluido con agua", "Mocktail de frutilla y limón (sin alcohol)"
    ],
    conAlcohol: [
      "Copa de vino tinto (150ml)", "Copa de vino blanco frío (150ml)", "Cerveza rubia chica",
      "Clericó con frutas (con moderación)", "Copa de rosado bien frío",
      "Spritz de aperol (con moderación)", "Sangría liviana con frutas (con moderación)",
      "Copa de malbec (150ml)", "Tinto de verano (vino tinto con gaseosa cítrica)",
      "Copa de torrontés bien frío", "Gin tonic suave (con moderación)"
    ]
  },
  meriendas: {
    sinAlcohol: [
      "Mate cebado", "Té con limón", "Infusión de manzanilla", "Agua saborizada natural",
      "Licuado liviano de frutas", "Café cortado", "Agua de hierbas frías", "Jugo de manzana natural",
      "Té de frutos rojos", "Infusión de boldo y menta", "Café con hielo (frappé liviano)",
      "Agua saborizada con pera y canela", "Mate con hierbas serranas", "Té blanco con limón"
    ],
    conAlcohol: [
      "Copa pequeña de vino dulce (de postre)", "Espumante dulce (frizzante) en copa chica",
      "Sidra bien fría (brindis liviano)", "Vermú dulce con hielo y naranja",
      "Copa chica de oporto", "Cóctel de espumante con jarabe de frutilla"
    ]
  },
  cena: {
    sinAlcohol: [
      "Agua con gas y jengibre", "Infusión digestiva de menta", "Té negro sin azúcar",
      "Agua saborizada con frutos rojos", "Soda con lima", "Jugo de arándanos sin azúcar",
      "Agua tibia con limón", "Kombucha sin alcohol", "Infusión de manzanilla y anís",
      "Agua saborizada con pepino y jengibre", "Té verde helado sin azúcar",
      "Mocktail de arándanos y soda", "Agua tónica con lima (sin alcohol)"
    ],
    conAlcohol: [
      "Copa de vino tinto (150ml)", "Cerveza artesanal chica", "Copa de espumante seco",
      "Fernet con cola (con moderación)", "Aperitivo tipo vermú con soda",
      "Negroni suave (con moderación)", "Old Fashioned liviano (con moderación)",
      "Copa de vino tinto joven (150ml)", "Mulled wine (vino caliente especiado, de estación)",
      "Whisky sour suave (con moderación)"
    ]
  }
};


// ======================================================================
// MOTOR DE FILTRADO Y ROTACIÓN — arma un "año" de comidas sin repetir
// una receta hasta agotar todo el pool filtrado, y sin nunca romper una
// restricción, alergia o condición de salud del usuario.
//
// DOMINGO = DÍA PERMITIDO: las condiciones de salud (avoidFor) se relajan
// solo ese día, y la sugerencia de bebida habilita también la opción con
// alcohol. Restricciones dietarias y alergias se respetan siempre, todos
// los días, sin excepción (son de seguridad, no de "gusto").
// ======================================================================

const MealEngine = {

  // Reparto aproximado del objetivo calórico diario entre las 4 comidas.
  KCAL_SHARE: { desayuno: 0.20, almuerzo: 0.35, meriendas: 0.15, cena: 0.30 },

  // --- 1) Filtrado duro: restricciones, alergias y disgustos son innegociables.
  //     Las condiciones de salud (avoidFor) se filtran, pero si dejan el pool
  //     vacío se relajan (es mejor mostrar algo aproximado que nada).
  //     relaxHealth=true (domingo) salta directamente el filtro de avoidFor.
  filterRecipesForProfile(category, profile, relaxHealth = false) {
    let pool = getRecipesByCategory(category);
    if (!profile) return pool;

    const restrictions = profile.restrictions || [];
    const health = profile.healthConditions || [];
    const allergiesText = (profile.allergies || []).map(a => a.toLowerCase());
    const dislikesText = (profile.dislikes || []).map(d => d.toLowerCase());

    // Restricciones dietarias: la receta TIENE que tener el tag.
    // Nota: todo lo "vegano" es también "vegetariano", así que ese caso
    // se acepta aunque la receta solo tenga el tag "vegano".
    // Esto se aplica SIEMPRE, incluso domingos.
    restrictions.forEach(r => {
      pool = pool.filter(rec =>
        rec.tags.includes(r) || (r === 'vegetariano' && rec.tags.includes('vegano'))
      );
    });

    // Alergias declaradas por el usuario (texto libre) vs. alérgenos de la receta
    // y también contra el texto de los ingredientes, por si el alérgeno no está tageado.
    // Esto se aplica SIEMPRE, incluso domingos (es seguridad, no gusto).
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

    // Condiciones de salud: se filtran, pero solo si no vacían el pool,
    // Y SOLO si no es domingo (día permitido).
    if (health.length && !relaxHealth) {
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

  // Devuelve true si la fecha dada es domingo (día permitido).
  isCheatDay(date) {
    return date.getDay() === 0;
  },

  // --- 4) Función principal: qué receta le toca a este perfil, en esta
  //     categoría, en esta fecha. Cicla por todo el pool filtrado sin repetir
  //     y, al agotarlo, vuelve a barajar con una semilla distinta (nuevo ciclo).
  //     Los domingos se relaja el filtro de condiciones de salud (avoidFor).
  getMealForDate(category, profile, date) {
    const isSunday = this.isCheatDay(date);
    let pool = this.filterRecipesForProfile(category, profile, isSunday);
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

  // --- 5) Sugerencia de bebida para una comida en una fecha dada.
  //     Siempre devuelve una opción sin alcohol; la opción con alcohol
  //     solo viene poblada (no null) si la fecha es domingo.
  getDrinkSuggestion(category, profile, date) {
    const options = BEBIDAS_DB[category] || BEBIDAS_DB.almuerzo;
    const isSunday = this.isCheatDay(date);
    const dayIndex = this._daysSinceEpoch(date);
    const seed = `${profile ? profile.name : 'anon'}-bebida-${category}-${dayIndex}`;
    const rand = this._hashString(seed);

    const sinAlcohol = options.sinAlcohol[rand() % options.sinAlcohol.length];
    const conAlcohol = isSunday ? options.conAlcohol[rand() % options.conAlcohol.length] : null;

    return { sinAlcohol, conAlcohol, alcoholPermitido: isSunday };
  },

  // --- 6) Plan de N días (por defecto 7) para mostrar en pantalla, ya
  //     resuelto contra el perfil del usuario. Cada comida incluye ahora
  //     su receta y su sugerencia de bebida (con/sin alcohol).
  getPlanForDays(profile, startDate, numDays = 7) {
    const categories = ['desayuno', 'almuerzo', 'meriendas', 'cena'];
    const plan = [];
    for (let i = 0; i < numDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const isSunday = this.isCheatDay(d);
      const dayMeals = {};
      categories.forEach(cat => {
        dayMeals[cat] = {
          recipe: this.getMealForDate(cat, profile, d),
          drink: this.getDrinkSuggestion(cat, profile, d)
        };
      });
      plan.push({ date: d, isCheatDay: isSunday, meals: dayMeals });
    }
    return plan;
  }
};
