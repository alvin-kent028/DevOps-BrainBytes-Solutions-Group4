// backend/utils/trainingData.js
// Expanded training data for BrainBytes AI across subjects

const trainingData = [
  // ===== MATH =====
  { input: "What is a fraction?", output: "A fraction represents a part of a whole. It has two parts: the numerator (top number) shows how many parts you have, and the denominator (bottom number) shows how many equal parts the whole is divided into. Example: 3/4 means 3 out of 4 equal parts.", type: "definition", subject: "Math" },
  { input: "How do you add fractions?", output: "To add fractions: (1) Make the denominators the same (find the LCD). (2) Add the numerators. (3) Keep the denominator. (4) Simplify if needed. Example: 1/4 + 2/4 = 3/4.", type: "explanation", subject: "Math" },
  { input: "Give me an example of algebra", output: "Sure! Algebra uses variables to solve problems. Example: If x + 3 = 7, what is x? Subtract 3 from both sides: x = 7 - 3 = 4. We solved for the unknown value x!", type: "example", subject: "Math" },
  { input: "What is the Pythagorean theorem?", output: "The Pythagorean theorem states that in a right triangle, the square of the hypotenuse (longest side) equals the sum of the squares of the other two sides: a² + b² = c². Example: if a=3 and b=4, then c=5 because 9+16=25.", type: "definition", subject: "Math" },
  { input: "What is a percentage?", output: "A percentage is a way of expressing a number as a fraction of 100. The symbol is %. Example: 50% means 50 out of 100, which is the same as 1/2 or 0.5.", type: "definition", subject: "Math" },

  // ===== SCIENCE =====
  { input: "What is photosynthesis?", output: "Photosynthesis is the process plants use to make food. They absorb sunlight, water, and carbon dioxide, then convert them into glucose (sugar) and oxygen. Formula: 6CO₂ + 6H₂O + light → C₆H₁₂O₆ + 6O₂.", type: "definition", subject: "Science" },
  { input: "How does gravity work?", output: "Gravity is a force that attracts objects with mass toward each other. The more mass an object has, the stronger its gravitational pull. Earth's gravity pulls everything toward its center, which is why objects fall down when dropped.", type: "explanation", subject: "Science" },
  { input: "What is an atom?", output: "An atom is the smallest unit of matter that retains the properties of an element. It has a nucleus (containing protons and neutrons) surrounded by electrons orbiting in shells. Everything around us is made of atoms!", type: "definition", subject: "Science" },
  { input: "Give me an example of a chemical reaction", output: "A great example is burning wood. Wood (carbon-based) reacts with oxygen in the air to produce carbon dioxide, water vapor, and heat energy. Another example: baking soda + vinegar → bubbles of CO₂ gas!", type: "example", subject: "Science" },
  { input: "What is the difference between a cell and an atom?", output: "An atom is the smallest unit of matter (like a single Lego brick). A cell is the smallest unit of life, made up of billions of atoms. Cells contain water, proteins, DNA, and more. Atoms are to cells what bricks are to a house.", type: "explanation", subject: "Science" },

  // ===== PROGRAMMING =====
  { input: "What is a variable?", output: "A variable is a named container that stores a value in a program. Think of it like a labeled box — you can put a value in it, look at it, or change it. Example in JavaScript: let age = 18; — here 'age' is the variable holding the value 18.", type: "definition", subject: "Programming" },
  { input: "How does a for loop work?", output: "A for loop repeats a block of code a set number of times. It has 3 parts: (1) initialization — start value, (2) condition — keep looping while this is true, (3) update — change the counter each time. Example: for(let i=0; i<5; i++) { console.log(i); } prints 0,1,2,3,4.", type: "explanation", subject: "Programming" },
  { input: "What is a function?", output: "A function is a reusable block of code that performs a specific task. You define it once and can call it many times. Example: function greet(name) { return 'Hello, ' + name; } — calling greet('Maria') returns 'Hello, Maria'.", type: "definition", subject: "Programming" },
  { input: "Give me an example of an array", output: "An array stores multiple values in one variable. Example in JavaScript: let fruits = ['apple', 'banana', 'mango']; — fruits[0] gives 'apple', fruits[1] gives 'banana'. Arrays are great for storing lists!", type: "example", subject: "Programming" },
  { input: "What is debugging?", output: "Debugging is the process of finding and fixing errors (bugs) in your code. Tools include console.log() to print values, browser DevTools, or a debugger. A bug is any mistake that causes your program to behave incorrectly.", type: "definition", subject: "Programming" },

  // ===== ENGLISH =====
  { input: "What is a noun?", output: "A noun is a word that names a person, place, thing, or idea. Examples: teacher (person), school (place), book (thing), freedom (idea). Nouns are one of the most basic parts of speech in English.", type: "definition", subject: "English" },
  { input: "What is the difference between affect and effect?", output: "'Affect' is usually a verb meaning to influence something. 'Effect' is usually a noun meaning the result. Memory trick: Affect = Action (verb), Effect = End result (noun). Example: The rain affected our plans. The effect of rain was a cancelled trip.", type: "explanation", subject: "English" },
  { input: "Give me an example of a simile", output: "A simile compares two things using 'like' or 'as'. Examples: 'She runs like the wind.' / 'He is as brave as a lion.' / 'The water was as cold as ice.' Similes make writing more vivid and descriptive!", type: "example", subject: "English" },

  // ===== HISTORY =====
  { input: "What caused World War 1?", output: "WWI was caused by several factors, often remembered as MAIN: Militarism (arms race between nations), Alliances (tangled treaty obligations), Imperialism (competition over colonies), and Nationalism (rising pride and tensions). The spark was the assassination of Archduke Franz Ferdinand in 1914.", type: "explanation", subject: "History" },
  { input: "What was the Industrial Revolution?", output: "The Industrial Revolution (roughly 1760–1840) was a period of major change when manufacturing shifted from hand production to machine-based factory work. It began in Britain and spread worldwide. Key inventions included the steam engine and power loom, transforming economies and cities.", type: "definition", subject: "History" },
];

module.exports = trainingData;
