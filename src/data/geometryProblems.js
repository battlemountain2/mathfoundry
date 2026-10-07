/**
 * src/data/geometryProblems.js
 *
 * Dynamic problem generators for Geometry Foundations units.
 * Produces deterministic, non-repeating problem objects based on pseudo-random seeds.
 */

// Pythagorean integer triplets for reliable mental and scratch calculations
const PYTHAGOREAN_TRIPLETS = [
  { a: 3, b: 4, c: 5 },
  { a: 6, b: 8, c: 10 },
  { a: 9, b: 12, c: 15 },
  { a: 12, b: 16, c: 20 },
  { a: 15, b: 20, c: 25 },
  { a: 5, b: 12, c: 13 },
  { a: 10, b: 24, c: 26 },
  { a: 8, b: 15, c: 17 },
  { a: 7, b: 24, c: 25 },
  { a: 20, b: 21, c: 29 },
];

/**
 * Generate a geometry problem for a given unit and seed.
 *
 * @param {string} unitId - e.g. 'angles-lines', 'triangles-pythagoras'
 * @param {number} seed - integer seed for deterministic variation
 * @param {string} format - 'numeric' | 'rule'
 * @returns {object} Standard MathFoundry problem object
 */
export function makeGeometryProblem(unitId, seed = 0, format = 'numeric') {
  const cleanId = (unitId || 'angles-lines').replace(/^geometry\//, '');

  switch (cleanId) {
    case 'angles-lines':
      return makeAnglesLinesProblem(seed, format);
    case 'triangles-pythagoras':
      return makePythagorasProblem(seed, format);
    case 'area-perimeter':
      return makeAreaPerimeterProblem(seed, format);
    case 'circles-radians':
      return makeCirclesRadiansProblem(seed, format);
    case 'volume-surface-area':
      return makeVolumeProblem(seed, format);
    case 'coordinate-geometry':
      return makeCoordinateProblem(seed, format);
    default:
      return makeAnglesLinesProblem(seed, format);
  }
}

/**
 * Unit 1: Angles & Lines problem generator
 */
function makeAnglesLinesProblem(seed, format) {
  const normSeed = Math.abs(seed);

  if (format === 'rule') {
    const ruleTypes = [
      {
        id: `geom-rule-supp-${normSeed}`,
        conceptId: 'angles-lines',
        format: 'rule',
        question: 'Two angles lie on a straight line and form a linear pair. What is their sum in degrees?',
        prompt: 'Enter the sum of supplementary angles:',
        answer: 180,
        options: [90, 180, 270, 360],
        explanation: 'Angles along a straight line always sum to 180° (supplementary).',
        hint: 'A straight angle forms half of a complete 360° circle.',
      },
      {
        id: `geom-rule-vert-${normSeed}`,
        conceptId: 'angles-lines',
        format: 'rule',
        question: 'When two straight lines intersect, opposite (vertical) angles are always equal. If scissors open to 44°, what is the angle of the opposite blades?',
        prompt: 'Enter the opposite angle in degrees:',
        answer: 44,
        options: [44, 46, 136, 180],
        explanation: 'Vertical angles share a vertex and are strictly congruent.',
        hint: 'Opposite angles across an intersection are identical.',
      },
      {
        id: `geom-rule-consec-${normSeed}`,
        conceptId: 'angles-lines',
        format: 'rule',
        question: 'When two parallel lines are cut by a transversal, what is the sum in degrees of consecutive interior angles on the same side?',
        prompt: 'Enter the sum of consecutive interior angles:',
        answer: 180,
        options: [90, 180, 270, 360],
        explanation: 'Consecutive interior angles are supplementary, summing to 180°.',
        hint: 'One angle is acute and the other is obtuse; together they add to a straight line.',
      },
    ];
    return ruleTypes[normSeed % ruleTypes.length];
  }

  // Numeric problems
  const typeIndex = normSeed % 5;

  if (typeIndex === 0) {
    // Supplementary angle calculation: x + A = 180
    const acuteAngle = 35 + ((normSeed * 7) % 55); // 35 to 89
    const supplement = 180 - acuteAngle;
    return {
      id: `geom-num-supp-${normSeed}`,
      conceptId: 'angles-lines',
      format: 'numeric',
      question: `Two adjacent angles form a straight line. If one angle measures $${acuteAngle}^\\circ$, what is the measure of angle $x$?`,
      prompt: `Calculate $x$ such that $x + ${acuteAngle}^\\circ = 180^\\circ$:`,
      answer: String(supplement),
      explanation: `Angles along a straight line sum to $180^\\circ$. Therefore, $x = 180^\\circ - ${acuteAngle}^\\circ = ${supplement}^\\circ$.`,
      hint: `Subtract ${acuteAngle} from 180.`,
    };
  }

  if (typeIndex === 1) {
    // Complementary angle calculation: x + A = 90
    const angleA = 20 + ((normSeed * 5) % 50); // 20 to 69
    const complement = 90 - angleA;
    return {
      id: `geom-num-comp-${normSeed}`,
      conceptId: 'angles-lines',
      format: 'numeric',
      question: `Two angles form a right corner ($90^\\circ$). If one angle measures $${angleA}^\\circ$, what is the measure of the complementary angle?`,
      prompt: `Calculate the complement of $${angleA}^\\circ$:`,
      answer: String(complement),
      explanation: `Complementary angles sum to $90^\\circ$. $90^\\circ - ${angleA}^\\circ = ${complement}^\\circ$.`,
      hint: `Subtract ${angleA} from 90.`,
    };
  }

  if (typeIndex === 2) {
    // Alternate interior angle (Z-pattern): equal
    const angleZ = 42 + ((normSeed * 9) % 40); // 42 to 81
    return {
      id: `geom-num-alt-${normSeed}`,
      conceptId: 'angles-lines',
      format: 'numeric',
      question: `Two parallel lines $L_1$ and $L_2$ are cut by a transversal. If one interior angle is $${angleZ}^\\circ$, what is the measure of its alternate interior angle?`,
      prompt: `Enter the measure of the alternate interior angle:`,
      answer: String(angleZ),
      explanation: `Alternate interior angles between parallel lines are strictly congruent: both measure $${angleZ}^\\circ$.`,
      hint: `The "Z" pattern preserves the exact angle measure between parallel lines.`,
    };
  }

  if (typeIndex === 3) {
    // Consecutive interior angles: sum to 180
    const obtuseAngle = 105 + ((normSeed * 6) % 45); // 105 to 149
    const missingAngle = 180 - obtuseAngle;
    return {
      id: `geom-num-consec-${normSeed}`,
      conceptId: 'angles-lines',
      format: 'numeric',
      question: `Two parallel lines are cut by a transversal. Two consecutive interior angles on the same side measure $${obtuseAngle}^\\circ$ and $y$. What is the value of $y$?`,
      prompt: `Find $y$ such that $y + ${obtuseAngle}^\\circ = 180^\\circ$:`,
      answer: String(missingAngle),
      explanation: `Consecutive interior angles are supplementary: $y = 180^\\circ - ${obtuseAngle}^\\circ = ${missingAngle}^\\circ$.`,
      hint: `Consecutive interior angles add up to 180°.`,
    };
  }

  // Corresponding angle (F-pattern)
  const angleCorr = 52 + ((normSeed * 11) % 35);
  return {
    id: `geom-num-corr-${normSeed}`,
    conceptId: 'angles-lines',
    format: 'numeric',
    question: `Two parallel lines are intersected by a transversal. Angle 1 sits in the top-right position measuring $${angleCorr}^\\circ$. What is the measure of corresponding Angle 5 in the top-right position of the second line?`,
    prompt: `Enter the measure of the corresponding angle:`,
    answer: String(angleCorr),
    explanation: `Corresponding angles sit in identical relative positions along parallel lines and are congruent ($${angleCorr}^\\circ$).`,
    hint: `Corresponding angles in the "F" pattern are equal.`,
  };
}

/**
 * Unit 2: Triangles & The Pythagorean Theorem problem generator
 */
function makePythagorasProblem(seed, format) {
  const normSeed = Math.abs(seed);

  if (format === 'rule') {
    const ruleTypes = [
      {
        id: `pyth-rule-sum-${normSeed}`,
        conceptId: 'triangles-pythagoras',
        format: 'rule',
        question: 'What is the sum of the three interior angles of any triangle in Euclidean plane geometry?',
        prompt: 'Enter the sum in degrees:',
        answer: 180,
        options: [90, 180, 270, 360],
        explanation: 'The interior angles of any triangle always sum to exactly 180°.',
        hint: 'Tear off the three corners of any paper triangle and they form a straight line.',
      },
      {
        id: `pyth-rule-hyp-${normSeed}`,
        conceptId: 'triangles-pythagoras',
        format: 'rule',
        question: 'In a right triangle with legs measuring 3 and 4, what is the area of the square built on the hypotenuse ($c^2 = a^2 + b^2$)?',
        prompt: 'Enter the area of the hypotenuse square:',
        answer: 25,
        options: [7, 12, 25, 49],
        explanation: 'a² + b² = 3² + 4² = 9 + 16 = 25.',
        hint: 'Square each leg (3×3 and 4×4), then add them.',
      },
    ];
    return ruleTypes[normSeed % ruleTypes.length];
  }

  // Numeric problems
  const typeIndex = normSeed % 4;

  if (typeIndex === 0) {
    // Triangle angle sum: find 3rd angle
    const angle1 = 30 + ((normSeed * 7) % 50); // 30 to 79
    const angle2 = 40 + ((normSeed * 11) % 45); // 40 to 84
    const angle3 = 180 - (angle1 + angle2);
    return {
      id: `pyth-num-anglesum-${normSeed}`,
      conceptId: 'triangles-pythagoras',
      format: 'numeric',
      question: `A triangle has two angles measuring $${angle1}^\\circ$ and $${angle2}^\\circ$. What is the measure of the third angle?`,
      prompt: `Calculate the third angle:`,
      answer: String(angle3),
      explanation: `The interior angles sum to $180^\\circ$. Third angle $= 180^\\circ - (${angle1}^\\circ + ${angle2}^\\circ) = 180^\\circ - ${angle1 + angle2}^\\circ = ${angle3}^\\circ$.`,
      hint: `Add ${angle1} and ${angle2}, then subtract the total from 180.`,
    };
  }

  if (typeIndex === 1) {
    // Find hypotenuse c given legs a and b
    const triplet = PYTHAGOREAN_TRIPLETS[normSeed % PYTHAGOREAN_TRIPLETS.length];
    return {
      id: `pyth-num-hyp-${normSeed}`,
      conceptId: 'triangles-pythagoras',
      format: 'numeric',
      question: `A right triangle has legs of length $a = ${triplet.a}$ and $b = ${triplet.b}$. What is the length of the hypotenuse $c$?`,
      prompt: `Calculate $c = \\sqrt{${triplet.a}^2 + ${triplet.b}^2}$:`,
      answer: String(triplet.c),
      explanation: `By the Pythagorean theorem: $c^2 = a^2 + b^2 = ${triplet.a}^2 + ${triplet.b}^2 = ${triplet.a * triplet.a} + ${triplet.b * triplet.b} = ${triplet.c * triplet.c}$. Taking the square root gives $c = ${triplet.c}$.`,
      hint: `Compute ${triplet.a}² (${triplet.a * triplet.a}) plus ${triplet.b}² (${triplet.b * triplet.b}), then find the square root.`,
    };
  }

  if (typeIndex === 2) {
    // Find missing leg a given hypotenuse c and leg b
    const triplet = PYTHAGOREAN_TRIPLETS[normSeed % PYTHAGOREAN_TRIPLETS.length];
    return {
      id: `pyth-num-leg-${normSeed}`,
      conceptId: 'triangles-pythagoras',
      format: 'numeric',
      question: `A right triangle has a hypotenuse of length $c = ${triplet.c}$ and one leg $b = ${triplet.b}$. What is the length of the other leg $a$?`,
      prompt: `Calculate $a = \\sqrt{c^2 - b^2}$:`,
      answer: String(triplet.a),
      explanation: `Rearranging $a^2 + b^2 = c^2$ gives $a^2 = c^2 - b^2 = ${triplet.c}^2 - ${triplet.b}^2 = ${triplet.c * triplet.c} - ${triplet.b * triplet.b} = ${triplet.a * triplet.a}$. Taking the square root gives $a = ${triplet.a}$.`,
      hint: `Subtract b² (${triplet.b * triplet.b}) from c² (${triplet.c * triplet.c}), then take the square root.`,
    };
  }

  // Right triangle area: (a * b) / 2
  const triplet = PYTHAGOREAN_TRIPLETS[normSeed % 4]; // Use smaller triplets
  const area = (triplet.a * triplet.b) / 2;
  return {
    id: `pyth-num-area-${normSeed}`,
    conceptId: 'triangles-pythagoras',
    format: 'numeric',
    question: `A right triangle has perpendicular legs of length $a = ${triplet.a}$ and $b = ${triplet.b}$. What is the area of the triangle?`,
    prompt: `Calculate $\\text{Area} = \\frac{1}{2} \\times \\text{base} \\times \\text{height}$:`,
    answer: String(area),
    explanation: `The area of a right triangle is $\\frac{1}{2} \\times a \\times b = \\frac{1}{2} \\times ${triplet.a} \\times ${triplet.b} = ${area}$.`,
    hint: `Multiply the two legs together (${triplet.a} × ${triplet.b}) and divide by 2.`,
  };
}

/**
 * Unit 3: Area & Perimeter generator
 */
function makeAreaPerimeterProblem(seed, format) {
  const normSeed = Math.abs(seed);
  const w = 4 + (normSeed % 8);
  const h = 5 + ((normSeed * 3) % 9);

  if (format === 'rule' || normSeed % 2 === 0) {
    return {
      id: `geom-area-${normSeed}`,
      conceptId: 'area-perimeter',
      format: 'numeric',
      question: `A rectangular steel plate has a length of $${w}$ meters and a width of $${h}$ meters. What is its surface area in square meters?`,
      prompt: `Calculate $\\text{Area} = \\text{length} \\times \\text{width}$:`,
      answer: String(w * h),
      explanation: `$\\text{Area} = ${w} \\times ${h} = ${w * h}\\text{ m}^2$.`,
      hint: `Multiply length by width.`,
    };
  }

  return {
    id: `geom-perim-${normSeed}`,
    conceptId: 'area-perimeter',
    format: 'numeric',
    question: `A rectangular enclosure has length $${w}$ and width $${h}$. What is the total perimeter?`,
    prompt: `Calculate $\\text{Perimeter} = 2(w + h)$:`,
    answer: String(2 * (w + h)),
    explanation: `$\\text{Perimeter} = 2 \\times (${w} + ${h}) = ${2 * (w + h)}$.`,
    hint: `Add width and height, then multiply by 2.`,
  };
}

/**
 * Unit 4: Circles & Radians generator
 */
function makeCirclesRadiansProblem(seed, format) {
  const normSeed = Math.abs(seed);
  const r = 2 + (normSeed % 8);

  if (format === 'rule') {
    return {
      id: `geom-circle-rad-${normSeed}`,
      conceptId: 'circles-radians',
      format: 'rule',
      question: 'How many radians are in a full circular rotation of 360°?',
      prompt: 'Select the equivalent radians for a full circle:',
      answer: 2, // Representing 2pi
      options: ['π', '2π', '3π', '4π'],
      explanation: 'A complete circle circumference is 2πr, which subtends exactly 2π radians (approx 6.28 rad).',
      hint: '360° corresponds to 2π radians.',
    };
  }

  // Diameter from radius
  return {
    id: `geom-circle-diam-${normSeed}`,
    conceptId: 'circles-radians',
    format: 'numeric',
    question: `A cylindrical pipe has an internal radius of $r = ${r}$ inches. What is the internal diameter of the pipe?`,
    prompt: `Calculate $\\text{Diameter} = 2r$:`,
    answer: String(2 * r),
    explanation: `The diameter is twice the radius: $2 \\times ${r} = ${2 * r}$ inches.`,
    hint: `Multiply the radius by 2.`,
  };
}

/**
 * Unit 5: Volume & Surface Area generator
 */
function makeVolumeProblem(seed) {
  const normSeed = Math.abs(seed);
  const l = 3 + (normSeed % 5);
  const w = 2 + ((normSeed * 2) % 4);
  const h = 4 + ((normSeed * 3) % 6);

  return {
    id: `geom-vol-${normSeed}`,
    conceptId: 'volume-surface-area',
    format: 'numeric',
    question: `A concrete foundation block has dimensions length = $${l}$, width = $${w}$, and height = $${h}$. What is its volume in cubic units?`,
    prompt: `Calculate $\\text{Volume} = l \\times w \\times h$:`,
    answer: String(l * w * h),
    explanation: `$\\text{Volume} = ${l} \\times ${w} \\times ${h} = ${l * w * h}$.`,
    hint: `Multiply length × width × height.`,
  };
}

/**
 * Unit 6: Coordinate Geometry & Slope generator
 */
function makeCoordinateProblem(seed) {
  const normSeed = Math.abs(seed);
  const dx = 2 + (normSeed % 5);
  const dy = dx * (1 + (normSeed % 3)); // Ensure integer slope

  return {
    id: `geom-slope-${normSeed}`,
    conceptId: 'coordinate-geometry',
    format: 'numeric',
    question: `A structural truss member connects point $(0, 0)$ to point $(${dx}, ${dy})$. What is the slope $m = \\frac{\\Delta y}{\\Delta x}$ of this member?`,
    prompt: `Calculate $m = \\frac{${dy} - 0}{${dx} - 0}$:`,
    answer: String(dy / dx),
    explanation: `Slope $m = \\frac{\\Delta y}{\\Delta x} = \\frac{${dy}}{${dx}} = ${dy / dx}$. This represents the rate of change or grade of the beam.`,
    hint: `Divide change in y (${dy}) by change in x (${dx}).`,
  };
}
