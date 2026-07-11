// cheatDayDB.js
// Extensión de RECIPES_DB para el "día permitido" (domingo, o activación manual por chat).
// MISMO SCHEMA que RECIPES_DB: id, name, category, kcal, country, tags, allergens, avoidFor,
// ingredients, instructions. Así reutilizan el mismo motor de filtrado de seguridad
// (alergias y restricciones dietarias) sin duplicar lógica.
//
// category: "trago" | "permitido"
// tags adicionales propios de este archivo:
//   - tragos: "con_alcohol" | "sin_alcohol"
//   - permitidos: "dulce" | "salado"
//
// IMPORTANTE: avoidFor en estos ítems se respeta igual que en RECIPES_DB, pero el
// MealEngine ya relaja avoidFor los domingos (relaxHealth = isCheatDay). Alergias y
// restricciones dietarias (tags) NUNCA se relajan, tampoco acá.

const TRAGOS_DB = [
  // ===== CON ALCOHOL =====
  { id: "t1", name: "Fernet con Coca", category: "trago", kcal: 220, country: "Argentina", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["4 partes de Coca-Cola", "1 parte de fernet", "hielo abundante"],
    instructions: ["Llenar un vaso alto con mucho hielo.", "Agregar el fernet primero y completar con la Coca bien fría.", "Revolver suave, sin romper la espuma."] },
  { id: "t2", name: "Gin Tonic", category: "trago", kcal: 180, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["50ml de gin", "150ml de agua tónica", "hielo", "rodaja de pomelo"],
    instructions: ["Servir el gin en copa balón con hielo.", "Completar con la tónica bien fría, de a poco.", "Decorar con la rodaja de pomelo."] },
  { id: "t3", name: "Cuba Libre", category: "trago", kcal: 200, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension", "diabetes"],
    ingredients: ["50ml de ron blanco", "150ml de Coca-Cola", "jugo de medio limón", "hielo"],
    instructions: ["Colocar hielo, ron y limón en un vaso alto.", "Completar con Coca y mezclar suave."] },
  { id: "t4", name: "Caipirinha", category: "trago", kcal: 210, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["1 limón en cuartos", "2 cdas de azúcar", "50ml de cachaça", "hielo picado"],
    instructions: ["Machacar el limón con el azúcar en el vaso.", "Agregar hielo picado y la cachaça.", "Mezclar bien."] },
  { id: "t5", name: "Mojito", category: "trago", kcal: 190, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["8 hojas de menta", "1 limón en cuartos", "2 cdas de azúcar", "50ml de ron blanco", "soda"],
    instructions: ["Machacar la menta con el limón y el azúcar.", "Agregar hielo y ron, completar con soda.", "Mezclar de abajo hacia arriba."] },
  { id: "t6", name: "Aperol Spritz", category: "trago", kcal: 170, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["60ml de Aperol", "90ml de espumante", "soda", "hielo", "rodaja de naranja"],
    instructions: ["Copa de vino con hielo, agregar el Aperol.", "Completar con el espumante y un toque de soda.", "Decorar con la naranja."] },
  { id: "t7", name: "Vodka Sour", category: "trago", kcal: 200, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["50ml de vodka", "25ml de jugo de limón", "15ml de almíbar", "hielo"],
    instructions: ["Coctelera con hielo y todos los ingredientes.", "Agitar fuerte 15 segundos.", "Colar en copa fría."] },
  { id: "t8", name: "Negroni", category: "trago", kcal: 220, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["30ml de gin", "30ml de Campari", "30ml de vermut rojo", "hielo"],
    instructions: ["Vaso bajo con hielo.", "Mezclar los tres en partes iguales.", "Decorar con cáscara de naranja."] },
  { id: "t9", name: "Clericot", category: "trago", kcal: 180, country: "Argentina", tags: ["con_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["vino blanco", "frutas variadas picadas", "2 cdas de azúcar", "jugo de naranja"],
    instructions: ["Mezclar el vino con la fruta y el azúcar en una jarra.", "Macerar 30 min en la heladera.", "Servir con hielo."] },
  { id: "t10", name: "Margarita", category: "trago", kcal: 230, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["50ml de tequila", "25ml de triple sec", "25ml de jugo de limón", "sal"],
    instructions: ["Escarchar el borde de la copa con sal.", "Coctelera con hielo y los líquidos, agitar.", "Colar en la copa."] },
  { id: "t11", name: "Whisky Sour", category: "trago", kcal: 210, country: "General", tags: ["con_alcohol"], allergens: ["huevo"], avoidFor: ["diabetes"],
    ingredients: ["50ml de whisky", "25ml de jugo de limón", "20ml de almíbar", "clara de huevo (opcional)"],
    instructions: ["Coctelera con hielo, agitar bien.", "Doble agitado si se usa clara.", "Colar en vaso bajo con hielo."] },
  { id: "t12", name: "Piña Colada", category: "trago", kcal: 280, country: "General", tags: ["con_alcohol"], allergens: ["lactosa"], avoidFor: ["diabetes", "colesterol_alto"],
    ingredients: ["50ml de ron blanco", "50ml de crema de coco", "80ml de jugo de ananá", "hielo"],
    instructions: ["Licuar todos los ingredientes con hielo.", "Servir bien frío."] },
  { id: "t13", name: "Bellini", category: "trago", kcal: 160, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["60ml de puré de durazno", "90ml de espumante frío"],
    instructions: ["Copa flauta bien fría.", "Agregar el puré y completar lento con el espumante."] },
  { id: "t14", name: "Daiquiri", category: "trago", kcal: 200, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["50ml de ron blanco", "25ml de jugo de limón", "15ml de almíbar", "hielo"],
    instructions: ["Coctelera con hielo, agitar fuerte.", "Colar en copa cóctel fría."] },
  { id: "t15", name: "Submarino con Fernet", category: "trago", kcal: 200, country: "Argentina", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["1 medida de fernet", "ginger ale", "hielo"],
    instructions: ["Vaso alto con hielo y fernet.", "Completar con ginger ale bien frío."] },
  { id: "t16", name: "Paloma", category: "trago", kcal: 190, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["50ml de tequila", "100ml de bebida de pomelo", "jugo de medio limón", "sal"],
    instructions: ["Vaso alto con hielo, tequila y limón.", "Completar con la bebida de pomelo."] },
  { id: "t17", name: "Espumante con Frutos Rojos", category: "trago", kcal: 150, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["150ml de espumante frío", "frutos rojos"],
    instructions: ["Poner los frutos rojos en el fondo de la copa.", "Completar con el espumante bien frío."] },
  { id: "t18", name: "Moscow Mule", category: "trago", kcal: 200, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["50ml de vodka", "jugo de medio limón", "ginger beer", "hielo"],
    instructions: ["Vaso con hielo, vodka y limón.", "Completar con ginger beer y mezclar suave."] },
  { id: "t19", name: "Vino con Soda", category: "trago", kcal: 120, country: "Argentina", tags: ["con_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["100ml de vino tinto", "100ml de soda", "hielo"],
    instructions: ["Vaso alto con hielo.", "Vino y soda en partes iguales."] },
  { id: "t20", name: "Old Fashioned", category: "trago", kcal: 210, country: "General", tags: ["con_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["50ml de whisky bourbon", "1 terrón de azúcar", "2 gotas de angostura", "hielo"],
    instructions: ["Machacar el azúcar con la angostura.", "Agregar hielo y el whisky.", "Revolver despacio y decorar."] },

  // ===== SIN ALCOHOL / MOCKTAILS =====
  { id: "t21", name: "Mojito Virgen", category: "trago", kcal: 90, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["8 hojas de menta", "1 limón en cuartos", "2 cdas de azúcar", "soda"],
    instructions: ["Machacar la menta con el limón y el azúcar.", "Agregar hielo y completar con soda."] },
  { id: "t22", name: "Limonada de Jengibre", category: "trago", kcal: 80, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["jugo de 3 limones", "2 cdas de miel", "jengibre rallado", "agua o soda"],
    instructions: ["Mezclar el jugo de limón con la miel y el jengibre.", "Completar con agua o soda bien fría."] },
  { id: "t23", name: "Piña Colada Sin Alcohol", category: "trago", kcal: 160, country: "General", tags: ["sin_alcohol"], allergens: ["lactosa"], avoidFor: ["diabetes"],
    ingredients: ["100ml de jugo de ananá", "50ml de crema de coco", "hielo"],
    instructions: ["Licuar todo con hielo hasta que quede cremoso."] },
  { id: "t24", name: "Fresas con Soda", category: "trago", kcal: 70, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["6 frutillas", "jugo de medio limón", "1 cda de azúcar", "soda"],
    instructions: ["Machacar las frutillas con el limón y el azúcar.", "Completar con soda y hielo."] },
  { id: "t25", name: "Té Helado Casero", category: "trago", kcal: 60, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["2 saquitos de té negro", "agua", "2 cdas de azúcar", "jugo de limón"],
    instructions: ["Preparar el té concentrado y endulzar en caliente.", "Enfriar, agregar limón y servir con hielo."] },
  { id: "t26", name: "Pomelo Tonic", category: "trago", kcal: 70, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["100ml de jugo de pomelo", "100ml de agua tónica", "hielo", "romero"],
    instructions: ["Vaso con hielo, jugo de pomelo.", "Completar con tónica y decorar con romero."] },
  { id: "t27", name: "Naranjada Especiada", category: "trago", kcal: 90, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["jugo de 3 naranjas", "canela", "hielo"],
    instructions: ["Mezclar el jugo con la canela.", "Agregar hielo y servir."] },
  { id: "t28", name: "Sandía Fresca", category: "trago", kcal: 60, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["2 tazas de sandía", "jugo de limón", "menta", "hielo"],
    instructions: ["Licuar la sandía con el limón.", "Servir con hielo y menta."] },
  { id: "t29", name: "Ginger Ale con Frutos Rojos", category: "trago", kcal: 90, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["150ml de ginger ale", "frutos rojos", "hielo"],
    instructions: ["Poner los frutos rojos en el vaso.", "Completar con ginger ale bien frío."] },
  { id: "t30", name: "Cooler de Manzana", category: "trago", kcal: 80, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["100ml de jugo de manzana", "100ml de soda", "canela"],
    instructions: ["Vaso con hielo, jugo de manzana y soda en partes iguales.", "Decorar con canela."] },
  { id: "t31", name: "Virgin Mary", category: "trago", kcal: 50, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["150ml de jugo de tomate", "jugo de limón", "tabasco", "sal y pimienta"],
    instructions: ["Mezclar todo en un vaso con hielo.", "Ajustar la picante a gusto."] },
  { id: "t32", name: "Maracuyá Splash", category: "trago", kcal: 90, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["100ml de pulpa de maracuyá", "2 cdas de azúcar", "soda"],
    instructions: ["Mezclar la pulpa con el azúcar.", "Agregar hielo y completar con soda."] },
  { id: "t33", name: "Limonada de Coco", category: "trago", kcal: 130, country: "General", tags: ["sin_alcohol"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["jugo de 2 limones", "100ml de leche de coco", "1 cda de azúcar"],
    instructions: ["Licuar todos los ingredientes con hielo hasta que quede espumoso."] },
  { id: "t34", name: "Soda Italiana", category: "trago", kcal: 70, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["30ml de jarabe de frutos rojos", "150ml de soda", "hielo"],
    instructions: ["Vaso con hielo, jarabe en el fondo.", "Completar con soda despacio."] },
  { id: "t35", name: "Chai Frío", category: "trago", kcal: 110, country: "General", tags: ["sin_alcohol"], allergens: ["lactosa"], avoidFor: [],
    ingredients: ["1 saquito de té chai", "leche o bebida vegetal", "miel"],
    instructions: ["Preparar el chai concentrado y endulzar.", "Enfriar, agregar la leche y servir con hielo."] },
  { id: "t36", name: "Pepino y Menta", category: "trago", kcal: 40, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["medio pepino", "menta", "jugo de limón", "soda"],
    instructions: ["Licuar el pepino con la menta y el limón.", "Colar, agregar hielo y completar con soda."] },
  { id: "t37", name: "Durazno Fizz", category: "trago", kcal: 80, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["100ml de puré de durazno", "soda", "hielo"],
    instructions: ["Vaso con hielo y el puré de durazno.", "Completar con soda bien fría."] },
  { id: "t38", name: "Agua Saborizada de Frutos del Bosque", category: "trago", kcal: 20, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["frutos del bosque", "agua fría", "menta"],
    instructions: ["Machacar levemente la fruta.", "Agregar al agua con la menta y reposar 15 min en la heladera."] },
  { id: "t39", name: "Naranja y Romero", category: "trago", kcal: 80, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: [],
    ingredients: ["150ml de jugo de naranja", "romero", "soda"],
    instructions: ["Vaso con hielo, jugo de naranja.", "Completar con soda y decorar con romero."] },
  { id: "t40", name: "Cítrico Espumoso", category: "trago", kcal: 90, country: "General", tags: ["sin_alcohol"], allergens: [], avoidFor: ["diabetes"],
    ingredients: ["jugo de limón", "jugo de naranja", "2 cdas de azúcar", "agua tónica o soda"],
    instructions: ["Mezclar los jugos con el azúcar.", "Agregar hielo y completar con la tónica o soda."] }
];

const PERMITIDOS_DB = [
  // ===== DULCES =====
  { id: "p1", name: "Alfajor de Maicena Casero", category: "permitido", kcal: 280, country: "Argentina", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["maicena", "harina", "manteca", "yemas", "azúcar", "dulce de leche", "coco rallado"],
    instructions: ["Mezclar los secos con la manteca y las yemas hasta formar masa.", "Estirar, cortar círculos, hornear 10-12 min a 180°C.", "Unir de a dos con dulce de leche y pasar el borde por coco."] },
  { id: "p2", name: "Brownie Clásico", category: "permitido", kcal: 350, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo", "frutos_secos"], avoidFor: ["diabetes"],
    ingredients: ["chocolate", "manteca", "huevos", "azúcar", "harina", "nueces"],
    instructions: ["Derretir el chocolate con la manteca.", "Mezclar con huevos y azúcar, incorporar harina y nueces.", "Hornear 25 min a 180°C."] },
  { id: "p3", name: "Tarta de Manzana", category: "permitido", kcal: 320, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["masa dulce", "manzanas", "azúcar", "canela"],
    instructions: ["Forrar el molde con la masa y acomodar las manzanas en fetas.", "Espolvorear azúcar y canela.", "Hornear 35 min a 180°C."] },
  { id: "p4", name: "Helado Casero de Banana", category: "permitido", kcal: 180, country: "General", tags: ["dulce", "vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: [],
    ingredients: ["bananas congeladas", "cacao amargo", "leche"],
    instructions: ["Procesar las bananas congeladas hasta lograr textura de helado.", "Agregar cacao y leche, volver a procesar."] },
  { id: "p5", name: "Torta de Chocolate Húmeda", category: "permitido", kcal: 380, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["harina", "azúcar", "cacao", "huevos", "leche", "aceite", "polvo de hornear"],
    instructions: ["Mezclar los secos, agregar los líquidos y batir bien.", "Hornear 35-40 min a 180°C."] },
  { id: "p6", name: "Flan Casero", category: "permitido", kcal: 260, country: "Argentina", tags: ["dulce", "vegetariano", "sin_gluten"], allergens: ["huevo", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["huevos", "leche", "azúcar"],
    instructions: ["Hacer un caramelo y cubrir el molde.", "Batir huevos, leche y azúcar, colar y volcar sobre el caramelo.", "Cocinar a baño maría 45 min a 180°C."] },
  { id: "p7", name: "Cookies con Chips de Chocolate", category: "permitido", kcal: 300, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["manteca", "azúcar", "huevo", "harina", "chips de chocolate", "vainilla"],
    instructions: ["Batir la manteca con el azúcar, agregar huevo y vainilla.", "Incorporar harina y chips.", "Hornear 10-12 min a 180°C."] },
  { id: "p8", name: "Panqueques con Dulce de Leche", category: "permitido", kcal: 340, country: "Argentina", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["huevos", "leche", "harina", "sal", "dulce de leche"],
    instructions: ["Mezclar todo hasta lograr masa líquida sin grumos.", "Cocinar de a poco en sartén caliente.", "Rellenar con dulce de leche."] },
  { id: "p9", name: "Cheesecake sin Horno", category: "permitido", kcal: 400, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes", "colesterol_alto"],
    ingredients: ["galletitas", "manteca", "queso crema", "crema de leche", "azúcar", "mermelada"],
    instructions: ["Procesar galletitas con manteca para la base.", "Batir queso, crema y azúcar, volcar sobre la base.", "Enfriar 4 horas y cubrir con mermelada."] },
  { id: "p10", name: "Budín de Limón", category: "permitido", kcal: 320, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["manteca", "azúcar", "huevos", "harina", "limón", "polvo de hornear"],
    instructions: ["Batir manteca y azúcar, agregar huevos y limón.", "Incorporar harina y polvo de hornear.", "Hornear 40 min a 180°C."] },
  { id: "p11", name: "Mousse de Chocolate", category: "permitido", kcal: 300, country: "General", tags: ["dulce", "vegetariano", "sin_gluten"], allergens: ["huevo"], avoidFor: ["diabetes"],
    ingredients: ["chocolate", "huevos", "azúcar"],
    instructions: ["Derretir el chocolate y mezclar con las yemas.", "Batir las claras a nieve e incorporar con movimientos envolventes.", "Enfriar mínimo 3 horas."] },
  { id: "p12", name: "Chocotorta", category: "permitido", kcal: 420, country: "Argentina", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes", "colesterol_alto"],
    ingredients: ["galletitas chocolatadas", "queso crema", "dulce de leche", "café"],
    instructions: ["Mezclar el queso con el dulce de leche.", "Humedecer las galletitas en café y armar capas.", "Enfriar 4 horas."] },
  { id: "p13", name: "Waffles Dulces", category: "permitido", kcal: 350, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["harina", "huevos", "leche", "manteca", "polvo de hornear", "miel"],
    instructions: ["Mezclar todos los ingredientes hasta lograr una masa homogénea.", "Cocinar en waflera caliente.", "Servir con miel o dulce de leche."] },
  { id: "p14", name: "Rogel", category: "permitido", kcal: 380, country: "Argentina", tags: ["dulce", "vegetariano"], allergens: ["gluten", "huevo"], avoidFor: ["diabetes"],
    ingredients: ["tapas de masa para rogel", "dulce de leche", "claras", "azúcar"],
    instructions: ["Hornear las tapas hasta dorar.", "Armar capas con dulce de leche.", "Cubrir con merengue y dorar."] },
  { id: "p15", name: "Bombones de Dulce de Leche", category: "permitido", kcal: 260, country: "Argentina", tags: ["dulce", "vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: ["diabetes", "colesterol_alto"],
    ingredients: ["dulce de leche repostero", "chocolate cobertura", "nueces o coco"],
    instructions: ["Formar bolitas con el dulce de leche frío.", "Bañar en chocolate derretido.", "Llevar a la heladera hasta que endurezca."] },
  { id: "p16", name: "Torta Rogel de Manzana", category: "permitido", kcal: 340, country: "General", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["masa dulce", "manzanas", "azúcar", "canela", "crema chantilly"],
    instructions: ["Hornear la masa con las manzanas 30 min a 180°C.", "Dejar enfriar y cubrir con chantilly."] },
  { id: "p17", name: "Medialunas Caseras", category: "permitido", kcal: 300, country: "Argentina", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["harina", "manteca", "azúcar", "levadura", "leche", "almíbar"],
    instructions: ["Formar la masa y dejar levar.", "Laminar con manteca, cortar y enrollar.", "Hornear 15 min a 200°C y pincelar con almíbar."] },
  { id: "p18", name: "Tiramisú", category: "permitido", kcal: 380, country: "Mediterráneo", tags: ["dulce", "vegetariano"], allergens: ["huevo", "lactosa"], avoidFor: ["diabetes", "colesterol_alto"],
    ingredients: ["vainillas", "café", "mascarpone", "huevos", "azúcar", "cacao"],
    instructions: ["Batir yemas con azúcar, sumar el mascarpone.", "Incorporar claras batidas a nieve.", "Humedecer vainillas en café, armar capas y espolvorear cacao."] },
  { id: "p19", name: "Pastelitos Criollos", category: "permitido", kcal: 320, country: "Argentina", tags: ["dulce", "vegano"], allergens: ["gluten"], avoidFor: ["diabetes", "colesterol_alto"],
    ingredients: ["masa hojaldrada", "dulce de membrillo o batata", "aceite", "almíbar"],
    instructions: ["Armar los pastelitos rellenando entre dos tapas.", "Sellar los bordes y freír hasta dorar.", "Pasar por almíbar caliente."] },
  { id: "p20", name: "Postre Chocotorta en Vaso", category: "permitido", kcal: 300, country: "Argentina", tags: ["dulce", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["diabetes"],
    ingredients: ["galletitas chocolatadas", "queso crema", "dulce de leche", "café"],
    instructions: ["Armar capas en un vaso individual igual que la chocotorta tradicional."] },

  // ===== SALADOS =====
  { id: "p21", name: "Pizza Casera", category: "permitido", kcal: 420, country: "Argentina", tags: ["salado", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["hipertension"],
    ingredients: ["masa de pizza", "salsa de tomate", "muzzarella", "orégano"],
    instructions: ["Estirar la masa, cubrir con salsa y muzzarella.", "Hornear 15-20 min a 220°C.", "Terminar con orégano."] },
  { id: "p22", name: "Hamburguesa Completa", category: "permitido", kcal: 550, country: "General", tags: ["salado"], allergens: ["gluten", "lactosa"], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["medallón de carne", "pan de hamburguesa", "queso", "lechuga", "tomate", "panceta"],
    instructions: ["Cocinar el medallón a la plancha.", "Armar la hamburguesa con todos los ingredientes."] },
  { id: "p23", name: "Papas Fritas Caseras", category: "permitido", kcal: 380, country: "General", tags: ["salado", "vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["papas", "aceite", "sal"],
    instructions: ["Cortar las papas en bastones.", "Freír en dos tandas hasta dorar.", "Escurrir y salar."] },
  { id: "p24", name: "Empanadas de Carne", category: "permitido", kcal: 320, country: "Argentina", tags: ["salado"], allergens: ["gluten", "huevo"], avoidFor: ["hipertension"],
    ingredients: ["tapas para empanadas", "carne picada", "cebolla", "huevo duro", "condimentos"],
    instructions: ["Rehogar la cebolla, agregar la carne y condimentos.", "Rellenar las tapas con el relleno frío.", "Hornear o freír."] },
  { id: "p25", name: "Nachos con Queso", category: "permitido", kcal: 480, country: "México", tags: ["salado", "vegetariano"], allergens: ["lactosa"], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["nachos de maíz", "queso cheddar", "guacamole", "pico de gallo"],
    instructions: ["Disponer los nachos en una fuente y cubrir con queso.", "Gratinar.", "Servir con guacamole y pico de gallo aparte."] },
  { id: "p26", name: "Milanesa con Papas", category: "permitido", kcal: 500, country: "Argentina", tags: ["salado"], allergens: ["gluten", "huevo"], avoidFor: ["hipertension"],
    ingredients: ["filet de carne o pollo", "huevo", "pan rallado", "papas"],
    instructions: ["Pasar la carne por huevo y pan rallado.", "Freír o hornear hasta dorar.", "Acompañar con papas."] },
  { id: "p27", name: "Choripán", category: "permitido", kcal: 420, country: "Argentina", tags: ["salado"], allergens: ["gluten"], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["chorizo", "pan francés", "chimichurri", "salsa criolla"],
    instructions: ["Cocinar el chorizo a la parrilla o plancha.", "Colocar en el pan con chimichurri y salsa criolla."] },
  { id: "p28", name: "Sándwich de Miga Especial", category: "permitido", kcal: 340, country: "General", tags: ["salado"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["hipertension"],
    ingredients: ["pan de miga", "jamón", "queso", "lechuga", "tomate", "mayonesa"],
    instructions: ["Armar los sándwiches con los ingredientes.", "Cortar los bordes y en triángulos."] },
  { id: "p29", name: "Tequeños de Queso", category: "permitido", kcal: 400, country: "General", tags: ["salado", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["colesterol_alto"],
    ingredients: ["masa para tequeños", "queso en bastones", "aceite"],
    instructions: ["Envolver cada bastón de queso con la masa.", "Freír hasta dorar y escurrir."] },
  { id: "p30", name: "Pizza a la Piedra Individual", category: "permitido", kcal: 380, country: "Argentina", tags: ["salado", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: ["hipertension"],
    ingredients: ["pre-pizza chica", "salsa de tomate", "muzzarella"],
    instructions: ["Cubrir la pre-pizza con salsa y queso.", "Hornear 10 min a 220°C."] },
  { id: "p31", name: "Papas al Horno con Cheddar y Panceta", category: "permitido", kcal: 460, country: "General", tags: ["salado"], allergens: ["lactosa"], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["papas", "queso cheddar", "panceta", "crema agria"],
    instructions: ["Hornear las papas enteras hasta tiernizar.", "Cortar y rellenar con queso, panceta y crema agria."] },
  { id: "p32", name: "Provoleta", category: "permitido", kcal: 380, country: "Argentina", tags: ["salado", "vegetariano", "sin_gluten"], allergens: ["lactosa"], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["queso provolone", "orégano", "aceite de oliva", "ají molido"],
    instructions: ["Cocinar en sartén o parrilla caliente hasta dorar.", "Condimentar con orégano y ají molido."] },
  { id: "p33", name: "Rabas Fritas", category: "permitido", kcal: 400, country: "General", tags: ["salado"], allergens: ["gluten", "mariscos"], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["calamar en aros", "harina", "aceite", "limón"],
    instructions: ["Pasar los aros de calamar por harina.", "Freír hasta dorar y crocante.", "Servir con limón."] },
  { id: "p34", name: "Bondiola al Pan", category: "permitido", kcal: 460, country: "Argentina", tags: ["salado"], allergens: ["gluten"], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["bondiola cocida", "pan", "chimichurri", "rúcula"],
    instructions: ["Cortar fetas finas de bondiola.", "Colocar en el pan con chimichurri y rúcula."] },
  { id: "p35", name: "Tarta de Jamón y Queso", category: "permitido", kcal: 400, country: "General", tags: ["salado", "vegetariano"], allergens: ["gluten", "lactosa", "huevo"], avoidFor: ["hipertension"],
    ingredients: ["tapa de masa", "jamón", "queso", "huevos", "crema de leche"],
    instructions: ["Forrar el molde con la masa, agregar jamón y queso.", "Cubrir con la mezcla de huevo y crema.", "Hornear 30 min a 180°C."] },
  { id: "p36", name: "Bruschettas", category: "permitido", kcal: 260, country: "Mediterráneo", tags: ["salado", "vegetariano"], allergens: ["gluten", "lactosa"], avoidFor: [],
    ingredients: ["pan baguette", "tomate", "ajo", "albahaca", "aceite de oliva", "queso"],
    instructions: ["Tostar las rodajas de pan.", "Cubrir con tomate picado, albahaca y aceite."] },
  { id: "p37", name: "Sandwichitos de Miga Tostados", category: "permitido", kcal: 300, country: "Argentina", tags: ["salado"], allergens: ["gluten", "lactosa"], avoidFor: ["hipertension"],
    ingredients: ["pan de miga", "jamón", "queso", "manteca"],
    instructions: ["Armar los sándwiches, untar con manteca.", "Tostar en sandwichera hasta dorar."] },
  { id: "p38", name: "Papas Rústicas al Horno", category: "permitido", kcal: 320, country: "General", tags: ["salado", "vegano", "sin_gluten", "sin_lactosa"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["papas con cáscara", "aceite de oliva", "romero", "ajo", "sal gruesa"],
    instructions: ["Cortar las papas en gajos, condimentar.", "Hornear 30-35 min a 200°C."] },
  { id: "p39", name: "Locro (versión ocasión especial)", category: "permitido", kcal: 520, country: "Argentina", tags: ["salado"], allergens: [], avoidFor: ["hipertension", "colesterol_alto"],
    ingredients: ["maíz blanco", "porotos", "zapallo", "carne y chorizo colorado", "condimentos"],
    instructions: ["Remojar el maíz y los porotos.", "Cocinar todo junto varias horas hasta lograr consistencia cremosa."] },
  { id: "p40", name: "Alitas de Pollo BBQ", category: "permitido", kcal: 420, country: "General", tags: ["salado", "sin_lactosa"], allergens: [], avoidFor: ["hipertension"],
    ingredients: ["alitas de pollo", "salsa barbacoa", "ajo en polvo", "pimentón"],
    instructions: ["Condimentar las alitas.", "Hornear 30-35 min a 200°C, pincelando con salsa BBQ."] }
];

// ======================================================================
// Extensión del MealEngine para tragos y permitidos.
// Reutiliza filterRecipesForProfile (misma lógica de seguridad: alergias
// y restricciones dietarias NUNCA se relajan) y el PRNG seedeado existente.
// ======================================================================

Object.assign(MealEngine, {

  // Filtra TRAGOS_DB o PERMITIDOS_DB contra el perfil, igual que con RECIPES_DB,
  // pero sobre un array dado en lugar de una categoría de getRecipesByCategory.
  // El health filter (avoidFor) SIEMPRE se relaja acá, porque estos ítems solo
  // se ofrecen en contexto de día permitido; alergias y restricciones, nunca.
  _filterCheatPool(pool, profile) {
    if (!profile) return pool;
    const restrictions = profile.restrictions || [];
    const allergiesText = (profile.allergies || []).map(a => a.toLowerCase());
    const dislikesText = (profile.dislikes || []).map(d => d.toLowerCase());

    restrictions.forEach(r => {
      pool = pool.filter(rec =>
        rec.tags.includes(r) || (r === 'vegetariano' && rec.tags.includes('vegano'))
      );
    });

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

    if (dislikesText.length) {
      pool = pool.filter(rec => {
        const ingredientsText = rec.ingredients.join(' ').toLowerCase();
        return !dislikesText.some(d => ingredientsText.includes(d));
      });
    }

    return pool;
  },

  // Trago del día. tipo: null (cualquiera), "con_alcohol" o "sin_alcohol".
  // Rota sin repetir dentro del pool filtrado, igual que getMealForDate.
  getTragoDelDia(profile, date, tipo = null) {
    let pool = this._filterCheatPool(TRAGOS_DB, profile);
    if (tipo) pool = pool.filter(t => t.tags.includes(tipo));
    if (pool.length === 0) pool = this._filterCheatPool(TRAGOS_DB, profile); // fallback sin filtrar por tipo
    if (pool.length === 0) return null; // nunca debería pasar salvo alergia a TODO

    const dayIndex = this._daysSinceEpoch(date);
    const cycleNumber = Math.floor(dayIndex / pool.length);
    const positionInCycle = dayIndex % pool.length;
    const seed = `${profile ? profile.name : 'anon'}-trago-${tipo || 'todos'}-${cycleNumber}`;
    return this._seededShuffle(pool, seed)[positionInCycle];
  },

  // Permitido del día. categoria: null (cualquiera), "dulce" o "salado".
  getPermitidoDelDia(profile, date, categoria = null) {
    let pool = this._filterCheatPool(PERMITIDOS_DB, profile);
    if (categoria) pool = pool.filter(p => p.tags.includes(categoria));
    if (pool.length === 0) pool = this._filterCheatPool(PERMITIDOS_DB, profile);
    if (pool.length === 0) return null;

    const dayIndex = this._daysSinceEpoch(date);
    const cycleNumber = Math.floor(dayIndex / pool.length);
    const positionInCycle = dayIndex % pool.length;
    const seed = `${profile ? profile.name : 'anon'}-permitido-${categoria || 'todos'}-${cycleNumber}`;
    return this._seededShuffle(pool, seed)[positionInCycle];
  }
});
