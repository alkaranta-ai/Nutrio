// BASE DE DATOS DE RECETAS
// app.js usa RECIPES_DB[0]..[7] así:
//   0,1 = desayuno | 2,3 = almuerzo | 4,5 = meriendas | 6,7 = cena
const RECIPES_DB = [
  // Desayunos (0 y 1)
  { id: "d1", name: "Pancakes de Avena y Claras", category: "desayuno", kcal: 350, ingredients: ["40g Avena", "3 Claras de huevo", "100g Frutillas"] },
  { id: "d2", name: "Tostadas con Huevo y Aguacate", category: "desayuno", kcal: 450, ingredients: ["2 panes integrales", "1 Huevo entero", "Media palta (aguacate)"] },
  // Almuerzos (2 y 3)
  { id: "a1", name: "Pechuga Grillé con Arroz Integral", category: "almuerzo", kcal: 550, ingredients: ["150g Pechuga de pollo", "70g Arroz integral", "Mix de vegetales verdes"] },
  { id: "a2", name: "Filete de Carne con Puré de Calabaza", category: "almuerzo", kcal: 650, ingredients: ["180g Carne magra de res", "200g Calabaza", "1 cdita Aceite de oliva"] },
  // Meriendas (4 y 5)
  { id: "m1", name: "Yogur Griego con Nueces y Banana", category: "meriendas", kcal: 300, ingredients: ["200g Yogur natural descremado", "15g Nueces", "Media banana"] },
  { id: "m2", name: "Batido Proteico con Avena", category: "meriendas", kcal: 380, ingredients: ["1 scoop Proteína en polvo", "30g Avena", "250ml Leche descremada"] },
  // Cenas (6 y 7)
  { id: "c1", name: "Filete de Pescado con Ensalada Completa", category: "cena", kcal: 400, ingredients: ["150g Pescado blanco", "Tomate", "Lechuga", "Zanahoria"] },
  { id: "c2", name: "Salteado de Pollo y Cubos de Zucchini", category: "cena", kcal: 500, ingredients: ["150g Pollo", "1 Zucchini grande", "Cebolla", "Morrón"] }
];
