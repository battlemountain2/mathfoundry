/**
 * Procedural problem generator and curated reflex banks for Speed Run Drills.
 * Generates fresh questions with clean whole-number answers.
 */

// Helper to shuffle array
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Random integer in range [min, max]
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------------- PROCEDURAL GENERATORS ---------------- //

export function generateSupplementaryAngle() {
  const angle = randInt(25, 155);
  const correct = 180 - angle;
  const distractors = [correct + 10, correct - 10, 90 - (angle % 90), 360 - angle]
    .filter(v => v > 0 && v !== correct)
    .slice(0, 3);

  while (distractors.length < 3) distractors.push(correct + randInt(5, 20));

  const options = shuffle([`${correct}^\\circ`, ...distractors.map(d => `${d}^\\circ`)]);
  return {
    id: `supp-${Date.now()}-${Math.random()}`,
    category: 'Geometry',
    prompt: `What is the supplementary angle to $${angle}^\\circ$?`,
    subtext: 'Supplementary angles sum to 180°',
    options,
    correctAnswer: options.indexOf(`${correct}^\\circ`),
    explanation: `Supplementary angles sum to $180^\\circ$. So $180^\\circ - ${angle}^\\circ = ${correct}^\\circ$.`,
  };
}

export function generateComplementaryAngle() {
  const angle = randInt(15, 75);
  const correct = 90 - angle;
  const distractors = [correct + 10, correct - 10, 180 - angle, 90 + angle]
    .filter(v => v > 0 && v !== correct)
    .slice(0, 3);

  while (distractors.length < 3) distractors.push(correct + randInt(5, 15));

  const options = shuffle([`${correct}^\\circ`, ...distractors.map(d => `${d}^\\circ`)]);
  return {
    id: `comp-${Date.now()}-${Math.random()}`,
    category: 'Geometry',
    prompt: `What is the complementary angle to $${angle}^\\circ$?`,
    subtext: 'Complementary angles sum to 90°',
    options,
    correctAnswer: options.indexOf(`${correct}^\\circ`),
    explanation: `Complementary angles sum to $90^\\circ$. So $90^\\circ - ${angle}^\\circ = ${correct}^\\circ$.`,
  };
}

export function generatePythagoreanTriple() {
  const triples = [
    [3, 4, 5],
    [6, 8, 10],
    [5, 12, 13],
    [8, 15, 17],
    [7, 24, 25],
    [9, 12, 15],
    [10, 24, 26],
    [12, 16, 20],
  ];
  const choice = triples[randInt(0, triples.length - 1)];
  const [a, b, c] = choice;

  // 50% ask for hypotenuse, 50% ask for a leg
  const askHypotenuse = Math.random() > 0.5;

  if (askHypotenuse) {
    const correct = c;
    const distractors = [c + 1, c - 2, a + b, c + 3].filter(v => v !== correct).slice(0, 3);
    const options = shuffle([`c = ${correct}`, ...distractors.map(d => `c = ${d}`)]);
    return {
      id: `pyth-${Date.now()}-${Math.random()}`,
      category: 'Geometry',
      prompt: `Right triangle with legs $a = ${a}$ and $b = ${b}$. Find hypotenuse $c$:`,
      subtext: 'a² + b² = c²',
      options,
      correctAnswer: options.indexOf(`c = ${correct}`),
      explanation: `$c^2 = ${a}^2 + ${b}^2 = ${a*a} + ${b*b} = ${c*c} \\implies c = ${c}$.`,
    };
  } else {
    const correct = a;
    const distractors = [a + 1, a - 1, c - b, a + 2].filter(v => v > 0 && v !== correct).slice(0, 3);
    const options = shuffle([`a = ${correct}`, ...distractors.map(d => `a = ${d}`)]);
    return {
      id: `pyth-${Date.now()}-${Math.random()}`,
      category: 'Geometry',
      prompt: `Right triangle has hypotenuse $c = ${c}$ and leg $b = ${b}$. Find leg $a$:`,
      subtext: 'a² = c² - b²',
      options,
      correctAnswer: options.indexOf(`a = ${correct}`),
      explanation: `$a^2 = ${c}^2 - ${b}^2 = ${c*c} - ${b*b} = ${a*a} \\implies a = ${a}$.`,
    };
  }
}

export function generateTriangleThirdAngle() {
  const a = randInt(30, 80);
  const b = randInt(30, 80);
  const c = 180 - a - b;
  const correct = c;
  const distractors = [correct + 10, correct - 10, 90 - (correct % 45), correct + 15]
    .filter(v => v > 0 && v !== correct)
    .slice(0, 3);

  const options = shuffle([`${correct}^\\circ`, ...distractors.map(d => `${d}^\\circ`)]);
  return {
    id: `tri3-${Date.now()}-${Math.random()}`,
    category: 'Geometry',
    prompt: `Triangle has angles $${a}^\\circ$ and $${b}^\\circ$. What is the 3rd angle?`,
    subtext: 'Interior angles sum to 180°',
    options,
    correctAnswer: options.indexOf(`${correct}^\\circ`),
    explanation: `$180^\\circ - (${a}^\\circ + ${b}^\\circ) = 180^\\circ - ${a + b}^\\circ = ${correct}^\\circ$.`,
  };
}

export function generateLinearEquationOneStep() {
  const isMult = Math.random() > 0.5;

  if (isMult) {
    const a = randInt(2, 9);
    const x = randInt(-8, 8);
    const b = a * x;
    const correct = `x = ${x}`;
    const distractors = [`x = ${-x}`, `x = ${x + a}`, `x = ${b - a}`].filter(d => d !== correct).slice(0, 3);
    while (distractors.length < 3) distractors.push(`x = ${x + randInt(1, 5)}`);

    const options = shuffle([correct, ...distractors]);
    return {
      id: `lineq-${Date.now()}-${Math.random()}`,
      category: 'Algebra',
      prompt: `Solve for $x$: $${a}x = ${b}$`,
      subtext: 'Divide both sides by coefficient',
      options,
      correctAnswer: options.indexOf(correct),
      explanation: `Divide both sides by $${a}$: $x = \\frac{${b}}{${a}} = ${x}$.`,
    };
  } else {
    const a = randInt(-15, 20);
    const x = randInt(-10, 15);
    const b = x + a;
    const sign = a >= 0 ? `+ ${a}` : `- ${Math.abs(a)}`;
    const correct = `x = ${x}`;
    const distractors = [`x = ${b + a}`, `x = ${-x}`, `x = ${x + 2}`].filter(d => d !== correct).slice(0, 3);
    while (distractors.length < 3) distractors.push(`x = ${x + randInt(1, 5)}`);

    const options = shuffle([correct, ...distractors]);
    return {
      id: `lineq-${Date.now()}-${Math.random()}`,
      category: 'Algebra',
      prompt: `Solve for $x$: $x ${sign} = ${b}$`,
      subtext: 'Apply inverse operation to both sides',
      options,
      correctAnswer: options.indexOf(correct),
      explanation: `Subtract/add to isolate $x$: $x = ${b} - (${a}) = ${x}$.`,
    };
  }
}

export function generateTwoStepEquation() {
  const a = randInt(2, 6);
  const x = randInt(1, 9);
  const c = randInt(1, 12);
  const isAdd = Math.random() > 0.5;
  const b = isAdd ? (a * x + c) : (a * x - c);
  const sign = isAdd ? `+ ${c}` : `- ${c}`;

  const correct = `x = ${x}`;
  const distractors = [`x = ${x + 1}`, `x = ${x - 1}`, `x = ${a}`, `x = ${x + 2}`]
    .filter(d => d !== correct)
    .slice(0, 3);

  const options = shuffle([correct, ...distractors]);
  return {
    id: `two-step-${Date.now()}-${Math.random()}`,
    category: 'Algebra',
    prompt: `Solve for $x$: $${a}x ${sign} = ${b}$`,
    subtext: 'Step 1: Isolate term. Step 2: Divide.',
    options,
    correctAnswer: options.indexOf(correct),
    explanation: `$${a}x = ${isAdd ? b - c : b + c} \\implies x = ${x}$.`,
  };
}

export function generateExponentRule() {
  const base = 'x';
  const m = randInt(2, 6);
  const n = randInt(2, 6);
  const isProduct = Math.random() > 0.5;

  if (isProduct) {
    const correct = `x^{${m + n}}`;
    const distractors = [`x^{${m * n}}`, `x^{${Math.abs(m - n)}}`, `2x^{${m + n}}`];
    const options = shuffle([`$${correct}$`, ...distractors.map(d => `$${d}$`)]);
    return {
      id: `exp-${Date.now()}-${Math.random()}`,
      category: 'Algebra',
      prompt: `Simplify: $x^${m} \\cdot x^${n}$`,
      subtext: 'Product rule: add exponents with like bases',
      options,
      correctAnswer: options.indexOf(`$${correct}$`),
      explanation: `When multiplying identical bases, add the exponents: $x^{${m} + ${n}} = x^{${m + n}}$.`,
    };
  } else {
    const correct = `x^{${m * n}}`;
    const distractors = [`x^{${m + n}}`, `x^{${m}^${n}}`, `${n}x^${m}`];
    const options = shuffle([`$${correct}$`, ...distractors.map(d => `$${d}$`)]);
    return {
      id: `exp-${Date.now()}-${Math.random()}`,
      category: 'Algebra',
      prompt: `Simplify: $(x^${m})^${n}$`,
      subtext: 'Power to a power rule: multiply exponents',
      options,
      correctAnswer: options.indexOf(`$${correct}$`),
      explanation: `Power of a power: multiply the exponents: $(x^${m})^${n} = x^{${m} \\cdot ${n}} = x^{${m * n}}$.`,
    };
  }
}

export function generateSlopeFromPoints() {
  const x1 = randInt(-3, 3);
  const y1 = randInt(-3, 3);
  const m = randInt(-3, 4); // integer slope
  const dx = randInt(1, 3);
  const x2 = x1 + dx;
  const y2 = y1 + m * dx;

  const correct = `m = ${m}`;
  const distractors = [`m = ${-m}`, `m = ${m + 1}`, `m = ${m - 1}`].filter(d => d !== correct).slice(0, 3);
  while (distractors.length < 3) distractors.push(`m = ${m + randInt(2, 5)}`);

  const options = shuffle([correct, ...distractors]);
  return {
    id: `slope-${Date.now()}-${Math.random()}`,
    category: 'Algebra',
    prompt: `Slope between points $(${x1}, ${y1})$ and $(${x2}, ${y2})$:`,
    subtext: 'm = (y₂ - y₁) / (x₂ - x₁)',
    options,
    correctAnswer: options.indexOf(correct),
    explanation: `$m = \\frac{${y2} - (${y1})}{${x2} - (${x1})} = \\frac{${y2 - y1}}{${x2 - x1}} = ${m}$.`,
  };
}

export function generateCuratedReflexQuestion() {
  const curated = [
    {
      category: 'Geometry',
      prompt: 'What is the sum of interior angles in ANY quadrilateral?',
      subtext: 'Divide into two triangles',
      options: ['$360^\\circ$', '$180^\\circ$', '$540^\\circ$', '$720^\\circ$'],
      correctAnswer: 0,
      explanation: 'Every quadrilateral can be divided into 2 triangles: $2 \\times 180^\\circ = 360^\\circ$.',
    },
    {
      category: 'Geometry',
      prompt: 'Formula for the Circumference of a circle with radius $r$:',
      subtext: 'Distance around the perimeter',
      options: ['$C = 2\\pi r$', '$C = \\pi r^2$', '$C = 4\\pi r$', '$C = \\frac{1}{2}\\pi r$'],
      correctAnswer: 0,
      explanation: 'Circumference $C = 2\\pi r$ (or $\\pi d$). Area is $\\pi r^2$.',
    },
    {
      category: 'Geometry',
      prompt: 'If two lines are perpendicular, the product of their slopes $m_1 \\cdot m_2$ is:',
      subtext: 'Negative reciprocals',
      options: ['$-1$', '$1$', '$0$', 'Undefined'],
      correctAnswer: 0,
      explanation: 'Perpendicular slopes are negative reciprocals: $m_1 \\cdot m_2 = -1$.',
    },
    {
      category: 'Algebra',
      prompt: 'What happens to the inequality sign when dividing both sides by $-4$?',
      subtext: 'Reversing direction on the number line',
      options: ['It reverses direction ($<$ becomes $>$)', 'It stays the same', 'It becomes an equals sign', 'It squares itself'],
      correctAnswer: 0,
      explanation: 'Multiplying or dividing an inequality by a negative number ALWAYS flips the inequality sign.',
    },
    {
      category: 'Algebra',
      prompt: 'Evaluate $3^{-2}$ as a fraction:',
      subtext: 'Negative exponent rule: x⁻ⁿ = 1 / xⁿ',
      options: ['$\\frac{1}{9}$', '$-9$', '$-6$', '$\\frac{1}{6}$'],
      correctAnswer: 0,
      explanation: '$3^{-2} = \\frac{1}{3^2} = \\frac{1}{9}$.',
    },
    {
      category: 'Algebra',
      prompt: 'In the equation $y = -3x + 7$, what is the y-intercept?',
      subtext: 'y = mx + b',
      options: ['$(0, 7)$', '$(0, -3)$', '$(7, 0)$', '$(-3, 7)$'],
      correctAnswer: 0,
      explanation: 'In $y = mx + b$, $b$ is the y-intercept where $x=0$, giving $(0, 7)$.',
    },
    {
      category: 'Algebra',
      prompt: 'Factor the difference of squares: $x^2 - 49$',
      subtext: 'a² - b² = (a - b)(a + b)',
      options: ['$(x - 7)(x + 7)$', '$(x - 7)^2$', '$(x + 7)^2$', '$(x - 49)(x + 1)$'],
      correctAnswer: 0,
      explanation: '$x^2 - 49 = x^2 - 7^2 = (x - 7)(x + 7)$.',
    },
    {
      category: 'Algebra',
      prompt: 'Evaluate: $8 + 2 \\times 5$',
      subtext: 'Order of Operations (PEMDAS)',
      options: ['$18$', '$50$', '$26$', '$80$'],
      correctAnswer: 0,
      explanation: 'Multiplication precedes addition: $2 \\times 5 = 10$, then $8 + 10 = 18$.',
    },
  ];

  const q = curated[randInt(0, curated.length - 1)];
  return {
    ...q,
    id: `curated-${Date.now()}-${Math.random()}`,
  };
}

/**
 * Returns a randomized reflex question targeting either 'geometry', 'algebra', or 'mixed'.
 */
export function getSpeedRunQuestion(topic = 'mixed') {
  const geoGenerators = [
    generateSupplementaryAngle,
    generateComplementaryAngle,
    generatePythagoreanTriple,
    generateTriangleThirdAngle,
  ];

  const algGenerators = [
    generateLinearEquationOneStep,
    generateTwoStepEquation,
    generateExponentRule,
    generateSlopeFromPoints,
  ];

  let pool = [];
  if (topic === 'geometry') {
    pool = geoGenerators;
  } else if (topic === 'algebra') {
    pool = algGenerators;
  } else {
    // 50% procedural mixed, 25% curated
    pool = [...geoGenerators, ...algGenerators, generateCuratedReflexQuestion];
  }

  const selectedGenerator = pool[randInt(0, pool.length - 1)];
  return selectedGenerator();
}
