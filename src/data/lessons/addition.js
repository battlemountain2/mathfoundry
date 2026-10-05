/**
 * Lesson: Add and Subtract Fractions (Milestone 3 - F-09)
 *
 * Course: Math Foundations (`math`)
 * Unit: Add & Subtract Fractions (`add-subtract-fractions`)
 * Legacy Concept ID: `addition`
 *
 * An 8-step Brilliant-style guided walkthrough that builds deep conceptual understanding:
 * 1. Step 0 (explain): Why equal pieces matter (KaTeX math rendering)
 * 2. Step 1 (visual): FractionBarVisualizer embedding (1/2 + 1/3 = 5/6)
 * 3. Step 2 (interact): Repartitioning into equal sixths
 * 4. Step 3 (micro-check): Least Common Denominator question (Expected: "12")
 * 5. Step 4 (explain): Rewriting numerators with common denominator (3/12 + 2/12)
 * 6. Step 5 (micro-check): Numerator addition question (Expected: "5/12")
 * 7. Step 6 (key-rule): Adding & Subtracting Fractions rule with "Save to Rulebook"
 * 8. Step 7 (transition): Takeaway summary linking to practice
 */

export const addSubtractFractionsLesson = {
  id: 'add-subtract-fractions',
  unitId: 'add-subtract-fractions',
  unitPath: 'math/add-subtract-fractions',
  courseId: 'math',
  conceptId: 'addition',
  title: 'Add and Subtract Fractions',
  subtitle: 'Why equal pieces matter and how to combine unequal parts',
  description: 'Discover why fractions require common denominators before adding or subtracting, visualize repartitioning using fraction bars, and master the golden rule.',
  estimatedMinutes: 15,
  totalSteps: 8,
  steps: [
    // ------------------------------------------------------------------------
    // Step 0: EXPLAIN - Why equal pieces matter
    // ------------------------------------------------------------------------
    {
      id: 'step-0',
      step: 0,
      type: 'explain',
      title: 'Why equal pieces matter',
      subtitle: 'The fundamental meaning of adding fractions',
      content: `### Why Can't We Just Add Straight Across?

When we add whole numbers like $2 + 3 = 5$, we are counting objects of identical size: $2$ apples plus $3$ apples makes $5$ apples.

In fractions, the **numerator** (top number) counts *how many pieces* you have.
The **denominator** (bottom number) names *the size of each piece* — specifically, how many equal pieces make up one whole.

Now imagine combining two different portions:

$$\\frac{1}{2} + \\frac{1}{3}$$

A very common blunder is adding straight across:

$$\\frac{1 + 1}{2 + 3} = \\frac{2}{5} \\quad \\text{(INCORRECT!)}$$ ❌

Why is this impossible?
Notice that $\\frac{1}{2} = 0.5$, while $\\frac{2}{5} = 0.4$. If you start with a half and add more positive quantity to it, you cannot possibly end up with *less* than what you started with!

To add fractions like $1/2 + 1/3$, we must find equal-sized parts:

$$\\frac{1}{2} + \\frac{1}{3} = \\frac{5}{6}$$

Before we can count pieces together, the pieces must be sliced into the **exact same size**. Denominators are piece-size labels, not numbers to add!`,
      callout: {
        type: 'concept',
        title: 'Core Intuition',
        message: 'Denominators name the size of each slice. You cannot combine halves and thirds directly without finding a shared slice size.',
      },
    },

    // ------------------------------------------------------------------------
    // Step 1: VISUAL - Embedding FractionBarVisualizer (1/2 + 1/3 = 5/6)
    // ------------------------------------------------------------------------
    {
      id: 'step-1',
      step: 1,
      type: 'visual',
      title: 'Fraction bars visual demonstration',
      subtitle: 'Comparing half-sized and third-sized pieces',
      visualizer: 'fraction-bars',
      component: 'FractionBarVisualizer',
      props: {
        f1: { n: 1, d: 2 },
        f2: { n: 1, d: 3 },
        targetD: 6,
        sum: '5/6',
        availablePartitions: [2, 3, 4, 5, 6, 12],
      },
      content: `Look at the two fraction bars below. Both whole bars have the **exact same total length**, but their subdivisions differ:

- The top bar is partitioned into $2$ equal parts: each piece is $\\frac{1}{2}$.
- The second bar is partitioned into $3$ equal parts: each piece is $\\frac{1}{3}$.

Notice that their partition lines do not align! We cannot simply say we have "2 pieces" because the pieces are not identical in size.

When both bars are divided into **6 equal parts (sixths)**:
- The $\\frac{1}{2}$ bar covers exactly $3$ sixths ($\\frac{3}{6}$).
- The $\\frac{1}{3}$ bar covers exactly $2$ sixths ($\\frac{2}{6}$).

Combined together:
$$\\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$$`,
      callout: {
        type: 'insight',
        title: 'Visual Proof',
        message: 'Sixths align perfectly with both halves (2 × 3 = 6) and thirds (3 × 2 = 6).',
      },
    },

    // ------------------------------------------------------------------------
    // Step 2: INTERACT - Repartitioning into equal sixths
    // ------------------------------------------------------------------------
    {
      id: 'step-2',
      step: 2,
      type: 'interact',
      title: 'Repartitioning into sixths',
      subtitle: 'Find the common partition size',
      component: 'repartition',
      interactType: 'repartition',
      initialPartition: 2,
      targetPartition: 6,
      userPartition: 2,
      availablePartitions: [2, 3, 4, 5, 6, 12],
      instruction: 'Select partition sizes below to discover which division splits BOTH wholes into whole, equal pieces.',
      content: `Try different partition buttons to see how the wholes subdivide:

- **4 parts**: $4$ splits halves evenly ($2$ fourths), but $4$ cannot split thirds into whole pieces!
- **5 parts**: Neither a half nor a third splits evenly into fifths.
- **6 parts**: Both halves ($3$ sixths) and thirds ($2$ sixths) divide with zero remainder!

For a partition to work for both fractions, the number of parts must be a **common multiple** of both denominators.`,
      validation: {
        target: 6,
        successMessage: 'Perfect! Both wholes are now partitioned into equal sixths: 3/6 and 2/6.',
        hintMessage: 'Choose 6 parts: 6 is a multiple of both 2 and 3.',
      },
    },

    // ------------------------------------------------------------------------
    // Step 3: MICRO-CHECK - LCD of 1/4 and 1/6
    // ------------------------------------------------------------------------
    {
      id: 'step3',
      step: 3,
      type: 'micro-check',
      checkKey: 'step3',
      stepIndex: 3,
      title: 'Check Your Understanding: Finding the Common Denominator',
      question: 'What is the least common denominator of 1/4 and 1/6?',
      expectedAnswer: '12',
      acceptableAnswers: ['12'],
      format: 'numeric',
      placeholder: 'Enter a number (e.g. 12)',
      hint: 'List the positive multiples of each denominator: Multiples of 4: 4, 8, 12, 16... Multiples of 6: 6, 12, 18...',
      explanation: 'Multiples of 4: 4, 8, 12... Multiples of 6: 6, 12. LCD is 12.',
      pitfallWarning: 'Do NOT add 4 + 6 = 10! Also, while 4 × 6 = 24 is a common denominator, 12 is smaller and the LEAST common denominator.',
    },

    // ------------------------------------------------------------------------
    // Step 4: EXPLAIN - Rewriting numerators with common denominator
    // ------------------------------------------------------------------------
    {
      id: 'step-4',
      step: 4,
      type: 'explain',
      title: 'Rewriting numerators',
      subtitle: 'Converting each fraction into twelfths',
      content: `### How to Rewrite Numerators

Now that we know the least common denominator for $\\frac{1}{4}$ and $\\frac{1}{6}$ is **$12$**, how do we convert both fractions without changing their value?

By the **Golden Rule of Equivalent Fractions**, multiplying numerator and denominator by the exact same non-zero number is multiplying by $1$ (since $\\frac{k}{k} = 1$). The amount never changes!

#### 1. Convert $\\frac{1}{4}$ to twelfths:
Ask: *What factor turns $4$ into $12$?*
$$12 \\div 4 = 3$$
Multiply numerator and denominator by $3$:
$$\\frac{1 \\times 3}{4 \\times 3} = \\frac{3}{12}$$

#### 2. Convert $\\frac{1}{6}$ to twelfths:
Ask: *What factor turns $6$ into $12$?*
$$12 \\div 6 = 2$$
Multiply numerator and denominator by $2$:
$$\\frac{1 \\times 2}{6 \\times 2} = \\frac{2}{12}$$

#### 3. Rewritten problem:
Now both quantities are measured in identical units (twelfths):
So 1/4 becomes 3/12, and 1/6 becomes 2/12:

$$\\frac{1}{4} + \\frac{1}{6} = \\frac{3}{12} + \\frac{2}{12}$$`,
      callout: {
        type: 'rule',
        title: 'Golden Rule',
        message: 'Always scale the numerator by the same multiplier used for the denominator: 1/4 = (1×3)/(4×3) = 3/12.',
      },
    },

    // ------------------------------------------------------------------------
    // Step 5: MICRO-CHECK - Adding rewritten fractions (3/12 + 2/12)
    // ------------------------------------------------------------------------
    {
      id: 'step5',
      step: 5,
      type: 'micro-check',
      checkKey: 'step5',
      stepIndex: 5,
      title: 'Check Your Understanding: Combining the Numerators',
      question: 'What is 3/12 + 2/12?',
      expectedAnswer: '5/12',
      acceptableAnswers: ['5/12'],
      format: 'numeric',
      placeholder: 'Enter a fraction (e.g. 5/12)',
      hint: 'Add only the top numbers (the numerators: 3 + 2). Keep the bottom number (the denominator: 12) unchanged!',
      explanation: 'Keep the common denominator 12 and add the numerators: 3 + 2 = 5. So 3/12 + 2/12 = 5/12.',
      pitfallWarning: 'Do NOT add denominators: 3/12 + 2/12 is NOT 5/24. Denominators name the size of each piece; they do not get added.',
    },

    // ------------------------------------------------------------------------
    // Step 6: KEY-RULE - Rule summary for Adding and Subtracting Fractions
    // ------------------------------------------------------------------------
    {
      id: 'step-6',
      step: 6,
      type: 'key-rule',
      ruleId: 'rule:add-subtract-fractions',
      conceptId: 'addition',
      category: 'fractions',
      title: 'Adding and Subtracting Fractions',
      whenToUse: 'When adding or subtracting fractions with different (or like) denominators.',
      explanation: 'To add or subtract fractions, find a common denominator, convert numerators, and combine.',
      pitfall: 'Do NOT add denominators together (e.g. 1/2 + 1/3 is NOT 2/5). Denominators represent the size of each piece, not the quantity.',
      notes: 'Remember to check LCD first!',
      coreSteps: [
        '1. Find a common denominator (the least common multiple of both denominators).',
        '2. Scale each fraction: multiply both numerator and denominator by the factor needed to reach the common denominator.',
        '3. Add or subtract numerators only. Keep the common denominator unchanged.',
        '4. Simplify the resulting fraction to lowest terms if possible.',
      ],
      formula: '$$\\frac{a}{c} + \\frac{b}{c} = \\frac{a + b}{c} \\quad \\text{and} \\quad \\frac{a}{c} - \\frac{b}{c} = \\frac{a - b}{c}$$',
    },

    // ------------------------------------------------------------------------
    // Step 7: TRANSITION - Ready for Practice!
    // ------------------------------------------------------------------------
    {
      id: 'step-7',
      step: 7,
      type: 'transition',
      title: 'Ready for Practice!',
      subtitle: 'You have mastered the foundations of adding and subtracting fractions.',
      targetUrl: '/courses/math/add-subtract-fractions/practice',
      unitPath: 'math/add-subtract-fractions',
      summary: [
        'Equal pieces are required',
        'Convert to common denominator',
        'Keep the denominator, add numerators',
      ],
      detailedSummary: [
        'Equal pieces are required: Fractions must have matching denominators before they can be combined.',
        'Convert to common denominator: Multiply top and bottom by the same factor so the value remains equivalent.',
        'Keep the denominator, add numerators: Add or subtract the piece counts while keeping the piece size unchanged.',
      ],
      callToAction: 'Start Unit Practice →',
      badgeText: 'Lesson Completed!',
    },
  ],
};

// Aliases for versatile imports across curriculum and legacy routes
export const additionLesson = addSubtractFractionsLesson;
export const lesson = addSubtractFractionsLesson;

/**
 * Accessor helper to safely retrieve a lesson step by index with bounds checking.
 *
 * @param {number} stepIndex - 0-based step index
 * @returns {object|null} The step definition or null if out of bounds
 */
export function getStep(stepIndex) {
  if (typeof stepIndex !== 'number' || stepIndex < 0 || stepIndex >= addSubtractFractionsLesson.steps.length) {
    return null;
  }
  return addSubtractFractionsLesson.steps[stepIndex];
}

/**
 * Generates the default initial progress state for this lesson.
 *
 * @returns {object} Initial progress record
 */
export function createDefaultLessonProgress() {
  return {
    currentStepIndex: 0,
    completed: false,
    completedAt: null,
    microCheckAnswers: {},
  };
}

export default addSubtractFractionsLesson;
