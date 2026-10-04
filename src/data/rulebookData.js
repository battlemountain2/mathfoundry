// Curated rulebook reference database for core foundation, geometry, and algebra concepts.
// Provides diagnostic triggers ("when to use"), core procedural methods, checked examples, and common pitfalls.

export const RULEBOOK_CATEGORIES = [
  { id: 'fractions', label: 'Fractions & Ratios' },
  { id: 'arithmetic', label: 'Arithmetic & Operations' },
  { id: 'algebra', label: 'Algebra & Equations' },
  { id: 'geometry', label: 'Geometry & Measurement' },
];

export const defaultRulebookEntries = [
  // --- FRACTIONS ---
  {
    id: 'rule:addition',
    conceptId: 'addition',
    category: 'fractions',
    title: 'Adding and Subtracting Fractions',
    whenToUse: 'When combining or taking the difference between two fractions that have different denominators.',
    explanation: 'Fractions can only be combined when they have equal-sized pieces (a common denominator). Find a common multiple for the denominators, convert each fraction to an equivalent form, then add or subtract only the numerators while keeping the common denominator.',
    pitfall: 'Adding or subtracting across both numerators and denominators (e.g. 1/4 + 1/6 ≠ 2/10). Denominators name the size of the pieces; they do not get added.',
    example: {
      question: 'Calculate 1/4 + 1/6.',
      steps: [
        'Find common denominator: multiples of 4 (4, 8, 12) and 6 (6, 12). LCD is 12.',
        'Convert 1/4 = (1×3)/(4×3) = 3/12.',
        'Convert 1/6 = (1×2)/(6×2) = 2/12.',
        'Add the numerators: 3/12 + 2/12 = 5/12.',
      ],
    },
    suggestedNotes: 'Remember: Denominator = piece size. Numerator = count of pieces.',
  },
  {
    id: 'rule:subtraction-fractions',
    conceptId: 'addition',
    category: 'fractions',
    title: 'Subtracting Unlike Fractions',
    whenToUse: 'When finding the difference between two fractional amounts with unlike denominators.',
    explanation: 'Rewrite both fractions with a common denominator first. Subtract the second numerator from the first numerator, keeping the common denominator unchanged.',
    pitfall: 'Subtracting denominators (e.g. 3/4 − 1/6 ≠ 2/2). Find common denominator 12 first: 9/12 − 2/12 = 7/12.',
    example: {
      question: 'Calculate 3/4 − 1/6.',
      steps: [
        'Common denominator for 4 and 6 is 12.',
        '3/4 = (3×3)/12 = 9/12.',
        '1/6 = (1×2)/12 = 2/12.',
        'Subtract numerators: 9/12 − 2/12 = 7/12.',
      ],
    },
    suggestedNotes: 'Check by adding: 7/12 + 2/12 = 9/12 = 3/4.',
  },
  {
    id: 'rule:equivalence',
    conceptId: 'equivalence',
    category: 'fractions',
    title: 'Equivalent Fractions',
    whenToUse: 'When simplifying an answer or converting fractions to prepare for addition, subtraction, or comparison.',
    explanation: 'Multiply or divide both the numerator and denominator by the exact same nonzero integer. This changes the number and size of the partitions without changing the total quantity.',
    pitfall: 'Adding the same number to numerator and denominator (e.g. 1/2 ≠ 2/3). Equivalence requires multiplication or division, not addition.',
    example: {
      question: 'Write 2/5 with denominator 15.',
      steps: [
        'Determine the scale factor: 15 ÷ 5 = 3.',
        'Multiply numerator by 3: 2 × 3 = 6.',
        '2/5 = 6/15.',
      ],
    },
    suggestedNotes: 'Multiplying by n/n is multiplying by 1: it changes the form, not the value.',
  },
  {
    id: 'rule:multiplication',
    conceptId: 'multiplication',
    category: 'fractions',
    title: 'Multiplying Fractions',
    whenToUse: 'When finding a fraction of a fraction, or scaling by a fractional rate.',
    explanation: 'Multiply numerators together to find the new numerator; multiply denominators together to find the new denominator. A common denominator is never required for multiplication.',
    pitfall: 'Cross-multiplying or searching for a common denominator. Cross-multiplication is for solving equations, not multiplying fractions.',
    example: {
      question: 'Calculate 2/3 × 3/5.',
      steps: [
        'Multiply numerators: 2 × 3 = 6.',
        'Multiply denominators: 3 × 5 = 15.',
        'Simplify: 6/15 = 2/5 (divide numerator and denominator by 3).',
      ],
    },
    suggestedNotes: 'Multiplying fractions shrinks the magnitude when both fractions are between 0 and 1.',
  },
  {
    id: 'rule:division',
    conceptId: 'division',
    category: 'fractions',
    title: 'Dividing Fractions (Multiply by Reciprocal)',
    whenToUse: 'When determining how many fractional portions fit into a given quantity.',
    explanation: 'Multiply the dividend by the reciprocal (the inverted fraction) of the divisor: a/b ÷ c/d = a/b × d/c.',
    pitfall: 'Inverting the wrong fraction (inverting the dividend instead of the divisor). Always invert the fraction that comes AFTER the division symbol.',
    example: {
      question: 'Calculate 3/4 ÷ 1/2.',
      steps: [
        'Identify the divisor: 1/2. Its reciprocal is 2/1.',
        'Rewrite as multiplication: 3/4 × 2/1.',
        'Multiply across: (3 × 2) / (4 × 1) = 6/4.',
        'Simplify: 6/4 = 3/2 = 1.5.',
      ],
    },
    suggestedNotes: 'Check by multiplying quotient by divisor: (3/2) × (1/2) = 3/4.',
  },

  // --- ARITHMETIC ---
  {
    id: 'rule:arithmetic-subtraction',
    conceptId: 'arithmetic',
    category: 'arithmetic',
    title: 'Multi-Digit Subtraction & Decomposition',
    whenToUse: 'When taking the difference between two multi-digit whole numbers or decimals.',
    explanation: 'Decompose the subtrahend into friendly parts (tens and ones), then subtract sequentially. Alternatively, add up from the smaller number to the larger number.',
    pitfall: 'Subtracting the smaller digit from the larger digit regardless of position (e.g. calculating 43 − 17 by doing 40−10=30 and 7−3=4 to get 34). 43 − 17 = 26.',
    example: {
      question: 'Calculate 43 − 17 mentally or on paper.',
      steps: [
        'Decompose 17 into 10 + 7.',
        'Subtract tens: 43 − 10 = 33.',
        'Subtract remaining 7: 33 − 7 = 26.',
        'Check with addition: 26 + 17 = 43.',
      ],
    },
    suggestedNotes: 'Always check subtraction with inverse addition.',
  },
  {
    id: 'rule:arithmetic-decomposition',
    conceptId: 'arithmetic',
    category: 'arithmetic',
    title: 'Mental Multiplication via Distributive Decomposition',
    whenToUse: 'When multiplying a 2-digit number by a 1-digit number without a calculator.',
    explanation: 'Decompose the multi-digit factor into tens and ones, multiply each part by the other factor, and sum the partial products: a × (b + c) = ab + ac.',
    pitfall: 'Forgetting to multiply both decomposed parts by the multiplier.',
    example: {
      question: 'Calculate 14 × 7.',
      steps: [
        'Decompose 14 into 10 + 4.',
        'Multiply tens: 10 × 7 = 70.',
        'Multiply ones: 4 × 7 = 28.',
        'Add partial products: 70 + 28 = 98.',
      ],
    },
    suggestedNotes: '10 × n is just n with a zero; use it as your anchor.',
  },

  // --- GEOMETRY & MEASUREMENT ---
  {
    id: 'rule:area-vs-perimeter',
    moduleId: 'area-perimeter',
    category: 'geometry',
    title: 'Perimeter vs. Area Distinction',
    whenToUse: 'When calculating the distance around a shape versus the 2-dimensional space it encloses.',
    explanation: 'Perimeter is the one-dimensional distance around the outside boundary (measured in linear units: cm, m). Area is the two-dimensional surface enclosed inside (measured in square units: cm², m²). For rectangles: P = 2(l + w), while A = l × w.',
    pitfall: 'Confusing the two formulas or writing square units for perimeter. A 4×4 square has P = 16 and A = 16, but a 1×7 rectangle has P = 16 and A = 7.',
    example: {
      question: 'A rectangle is 5 cm long and 3 cm wide. Find both perimeter and area.',
      steps: [
        'Perimeter: distance around = 2 × (5 + 3) = 2 × 8 = 16 cm (linear units).',
        'Area: surface inside = 5 × 3 = 15 cm² (square units).',
      ],
    },
    suggestedNotes: 'Perimeter is fencing; area is grass.',
  },
  {
    id: 'rule:pythagorean',
    moduleId: 'pythagorean',
    category: 'geometry',
    title: 'Pythagorean Theorem (a² + b² = c²)',
    whenToUse: 'When finding an unknown side of a right triangle, or checking if an angle is 90°.',
    explanation: 'In any right-angled triangle, the sum of the squares of the two shorter legs equals the square of the hypotenuse: a² + b² = c². The hypotenuse (c) is always strictly opposite the 90° right angle.',
    pitfall: 'Adding legs when finding a missing leg (e.g. if hypotenuse is 5 and leg is 3, doing 3² + 5² = 34). To find a leg, subtract: a² = c² − b² = 25 − 9 = 16, so a = 4.',
    example: {
      question: 'A right triangle has hypotenuse 10 and one leg 6. Find the other leg.',
      steps: [
        'Set up equation: a² + 6² = 10².',
        'Simplify squares: a² + 36 = 100.',
        'Subtract 36: a² = 64.',
        'Take square root: a = √64 = 8.',
      ],
    },
    suggestedNotes: 'Common triples: (3, 4, 5), (5, 12, 13), (6, 8, 10), (8, 15, 17).',
  },
  {
    id: 'rule:angles',
    moduleId: 'angles',
    category: 'geometry',
    title: 'Supplementary vs. Complementary Angles',
    whenToUse: 'When solving for unknown angle measures along a straight line or in a right corner.',
    explanation: 'Complementary angles add up to 90° (forming a corner). Supplementary angles add up to 180° (forming a straight line). Vertical angles across an intersection are always congruent.',
    pitfall: 'Swapping 90° and 180°. Memory cue: C comes before S in the alphabet; 90 comes before 180.',
    example: {
      question: 'Find the complement of 35° and the supplement of 110°.',
      steps: [
        'Complement: 90° − 35° = 55°.',
        'Supplement: 180° − 110° = 70°.',
      ],
    },
    suggestedNotes: 'C for Corner (90°); S for Straight line (180°).',
  },

  // --- ALGEBRA & EQUATIONS ---
  {
    id: 'rule:linear-equations',
    moduleId: 'linear-equations',
    category: 'algebra',
    title: 'Solving Two-Step Linear Equations',
    whenToUse: 'When isolating an unknown variable x in equations like ax + b = c.',
    explanation: 'Apply inverse operations in reverse order of operations (SADMEP). First, undo addition or subtraction using inverse operations on both sides. Second, undo multiplication or division to isolate the variable.',
    pitfall: 'Dividing before undoing addition/subtraction, or performing an operation on only one side of the equal sign.',
    example: {
      question: 'Solve for x: 2x − 5 = 11.',
      steps: [
        'Undo subtraction: add 5 to both sides: 2x = 11 + 5 = 16.',
        'Undo multiplication: divide both sides by 2: x = 16 ÷ 2 = 8.',
        'Check: 2(8) − 5 = 16 − 5 = 11. Checks out.',
      ],
    },
    suggestedNotes: 'Whatever you do to one side, you MUST do to the other side.',
  },
  {
    id: 'rule:linear-inequalities',
    moduleId: 'linear-inequalities',
    category: 'algebra',
    title: 'Solving Linear Inequalities & The Negative Rule',
    whenToUse: 'When solving inequalities containing <, ≤, >, or ≥.',
    explanation: 'Solve just like an equation, with one critical exception: whenever you multiply or divide both sides by a NEGATIVE number, you must reverse the inequality symbol (e.g. < becomes >).',
    pitfall: 'Forgetting to reverse the inequality sign when dividing by a negative number.',
    example: {
      question: 'Solve −3x < 12.',
      steps: [
        'Divide both sides by −3.',
        'Reverse the inequality direction: < becomes >.',
        'Result: x > −4.',
        'Test a value: if x = 0 (which is > −4), −3(0) = 0 < 12 (True!).',
      ],
    },
    suggestedNotes: 'Multiply or divide by negative? FLIP the sign!',
  },
];
