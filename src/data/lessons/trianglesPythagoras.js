/**
 * src/data/lessons/trianglesPythagoras.js
 *
 * Interactive Guided Ladder lesson for Unit 2: Triangles & The Pythagorean Theorem.
 * Follows the 6-stage Guided Ladder pedagogy:
 * 1. Predict Hook (Physical square tile puzzle and angle sum)
 * 2. Visual Model (Synchronized Pythagorean Visualizer with 3-Part Card)
 * 3. Guided Co-Solve / Micro-Check 1 (Formative triangle angle sum check)
 * 4. Solo Micro-Check 2 (Formative right triangle hypotenuse calculation)
 * 5. Key Rule & Pitfall (The Pythagorean Invariant, Save to Rulebook)
 * 6. Transition (Launch into Unit 2 Practice)
 */

export const trianglesPythagorasLesson = {
  id: 'triangles-pythagoras-lesson',
  unitId: 'triangles-pythagoras',
  unitPath: 'geometry/triangles-pythagoras',
  title: 'Triangles & The Pythagorean Theorem',
  subtitle: 'The Triangle Invariant & Physical Conservation of Area',
  estimatedMinutes: 9,
  totalSteps: 6,
  steps: [
    {
      id: 'step-1-hook',
      type: 'explain',
      title: 'The Closed Triangle & Area Conservation',
      subtitle: 'Predict Hook',
      content:
        'Triangles are the rigid building blocks of physical structures. If you pin three rigid wooden beams together at their ends, the triangle can never flex or wobble without snapping the wood.\n\nFirst, an infallible universal truth: **The interior angles of every flat triangle always sum to exactly $180^\\circ$**.\n\n$$\\angle A + \\angle B + \\angle C = 180^\\circ$$\n\nNow consider a right triangle with legs of lengths $3$ and $4$. If you build a square sheet of tiles on leg $a$ ($3 \\times 3 = 9$ tiles) and another on leg $b$ ($4 \\times 4 = 16$ tiles), how many tiles are needed to build a square on the diagonal hypotenuse $c$?\n\n$$9 + 16 = 25 = 5^2$$\n\nThe physical tiles from both legs pack together to fill the hypotenuse square!',
      threePartCard: {
        visual: 'A right-angle corner with square tile grids growing out from legs a, b, and hypotenuse c.',
        math: 'a^2 + b^2 = c^2 \\iff 3^2 + 4^2 = 9 + 16 = 25 = 5^2',
        rationale: 'The Pythagorean theorem is not just an algebra formula; it is the geometric conservation of physical area.',
      },
      callout: {
        title: 'The Rigidity Principle',
        text: 'In civil and mechanical design, trusses and bridge spans are made exclusively of interconnected triangles because their geometry is self-locking.',
      },
    },
    {
      id: 'step-2-visual-pythagoras',
      type: 'visual',
      title: 'Interactive Square-Tile Visualizer',
      subtitle: 'Synchronized Visual Model',
      content:
        'Interact with the right triangle model below. Adjust the vertical leg $a$ and horizontal leg $b$ using the sliders or select preset Pythagorean triplets.\n\nClick **"Verify Tile Packing"** to watch the area of squares $a^2$ and $b^2$ account for the total area of the hypotenuse square $c^2$.',
      visualizer: 'pythagoras',
      props: {
        initialA: 3,
        initialB: 4,
        embedded: true,
      },
      threePartCard: {
        visual: 'Leg a square (9 units) and leg b square (16 units) sum to the hypotenuse square (25 units).',
        math: 'c = \\sqrt{a^2 + b^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5',
        rationale: 'Every distance calculation in 2D Cartesian space, robotics kinematics, and CAD geometry is derived from this relationship.',
      },
    },
    {
      id: 'step-3-micro-check-1',
      type: 'micro-check',
      title: 'Quick Check: Triangle Angle Sum',
      subtitle: 'Formative Check 1',
      prompt: 'A structural triangular support has two interior angles measuring $65^\\circ$ and $75^\\circ$:',
      question: 'What is the measure of the third angle in degrees?',
      answer: '40',
      expectedAnswer: '40',
      explanation: 'The angles of any triangle must sum to $180^\\circ$. $180^\\circ - (65^\\circ + 75^\\circ) = 180^\\circ - 140^\\circ = 40^\\circ$.',
      hint: 'Add 65 and 75, then subtract the sum from 180.',
    },
    {
      id: 'step-4-micro-check-2',
      type: 'micro-check',
      title: 'Quick Check: The 6-8-10 Triplet',
      subtitle: 'Formative Check 2',
      prompt: 'A right triangle has perpendicular legs measuring $a = 6$ meters and $b = 8$ meters:',
      question: 'What is the length of the diagonal hypotenuse $c = \\sqrt{6^2 + 8^2}$?',
      answer: '10',
      expectedAnswer: '10',
      explanation: '$a^2 + b^2 = 6^2 + 8^2 = 36 + 64 = 100$. Taking the square root gives $\\sqrt{100} = 10$. (This is a 3-4-5 triangle scaled by a factor of 2).',
      hint: 'Compute 6 × 6 (36) and 8 × 8 (64), add them together (100), and find the square root.',
    },
    {
      id: 'step-5-rule',
      type: 'key-rule',
      title: 'Core Rule: The Pythagorean Theorem & Distance Invariant',
      subtitle: 'Key Rule',
      ruleId: 'rule-pythagorean-invariant',
      ruleSummary:
        'In any right triangle, the square of the hypotenuse equals the sum of the squares of the legs: a² + b² = c². The interior angles of all triangles always sum to 180°.',
      ruleDetails: [
        'The hypotenuse c is ALWAYS the side opposite the 90° right angle and is the longest side.',
        'To find the hypotenuse: c = √(a² + b²).',
        'To find a missing leg: a = √(c² - b²).',
        'Common integer triplets: (3, 4, 5), (6, 8, 10), (5, 12, 13), (8, 15, 17).',
        'Cartesian Distance Formula: d = √((x₂ - x₁)² + (y₂ - y₁)²).',
      ],
      category: 'Geometry',
      pitfall: 'Never add legs directly without squaring (3 + 4 ≠ 5); always compute squares first before taking the square root.',
      whenToUse: 'Whenever calculating distances between coordinates, diagonal bracing lengths, or resolving vector components.',
    },
    {
      id: 'step-6-transition',
      type: 'transition',
      title: 'Ready for Unit 2 Practice',
      subtitle: 'Lesson Complete',
      summary:
        'You have mastered the foundational relationships of triangles and the Pythagorean area theorem. Now verify your intuition with independent practice problems.',
      takeaways: [
        'All triangle interior angles sum to 180°',
        'The Pythagorean theorem reflects physical area conservation: a² + b² = c²',
        'Square roots resolve the hypotenuse length from summed leg squares',
      ],
      callToAction: 'Start Unit 2 Practice →',
      targetUrl: '/courses/geometry/triangles-pythagoras/practice',
    },
  ],
};
