/**
 * src/data/lessons/arithmetic.js
 *
 * Interactive guided lesson walkthrough for Unit 1: Arithmetic Relationships.
 * Brilliant-style step-by-step interactive lesson with 6 steps.
 */

export const arithmeticLesson = {
  id: 'arithmetic-relationships',
  unitId: 'arithmetic',
  unitPath: 'math/arithmetic',
  title: 'Arithmetic Relationships',
  subtitle: 'The Four Operations & Mental Decomposition',
  estimatedMinutes: 6,
  totalSteps: 6,
  steps: [
    {
      id: 'step-1-decomposition',
      type: 'explain',
      title: 'Breaking Numbers Down: Decomposition',
      subtitle: 'Mental Math Foundation',
      content:
        'When doing arithmetic on paper or in your head, you never have to memorize massive multiplication tables.\n\nYou can **decompose** complex numbers into friendly sums:\n\n$$7 \\times 6 = (5 + 2) \\times 6 = (5 \\times 6) + (2 \\times 6)$$\n\nBecause $5 \\times 6 = 30$ and $2 \\times 6 = 12$, we immediately get:\n\n$$30 + 12 = 42$$\n\nBreaking problems apart into smaller, manageable pieces is the foundational skill engineers use to estimate loads, circuits, and dimensions quickly.',
      callout: {
        title: 'Core Intuition',
        text: 'Multiplication distributes over addition. Split numbers by place value (tens and ones) or into friendly numbers (5s and 10s).',
      },
    },
    {
      id: 'step-2-inverse-operations',
      type: 'explain',
      title: 'Multiplication and Division Are Inverses',
      subtitle: 'Reversing Operations',
      content:
        'Every division problem is simply a multiplication question asked in reverse:\n\n$$\\text{If } a \\times b = c, \\quad \\text{then } c \\div a = b$$\n\nFor example:\n\n$$42 \\div 6 = 7 \\iff 7 \\times 6 = 42$$\n\nWhenever you calculate a quotient, **always check your answer by multiplying**. If the product doesn\'t return the dividend, a slip happened.',
    },
    {
      id: 'step-3-micro-check-1',
      type: 'micro-check',
      title: 'Quick Check: Decomposition',
      subtitle: 'Formative Check',
      prompt: 'Using decomposition, calculate $8 \\times 7$ by splitting $8$ into $5 + 3$:',
      question: 'What is $(5 \\times 7) + (3 \\times 7)$?',
      answer: '56',
      expectedAnswer: '56',
      explanation: '$5 \\times 7 = 35$, and $3 \\times 7 = 21$. Adding them together: $35 + 21 = 56$.',
      hint: 'Compute 5 × 7 (which is 35), then 3 × 7 (which is 21), then add them.',
    },
    {
      id: 'step-4-micro-check-2',
      type: 'micro-check',
      title: 'Quick Check: Inverse Relationship',
      subtitle: 'Checking Division',
      prompt: 'If $72 \\div 8 = 9$, which calculation confirms the result?',
      format: 'choice',
      options: [
        '9 × 8 = 72',
        '72 - 8 = 64',
        '72 + 8 = 80',
        '9 + 8 = 17',
      ],
      answer: 0,
      expectedAnswer: 0,
      explanation: 'Multiplication and division undo each other. Multiplying the quotient (9) by the divisor (8) gives back 72.',
      hint: 'Remember that multiplication undoes division.',
    },
    {
      id: 'step-5-rule',
      type: 'key-rule',
      title: 'Core Rule: The Arithmetic Check',
      subtitle: 'Key Rule',
      ruleId: 'rule-arithmetic-check',
      ruleSummary:
        'To verify division, multiply the quotient by the divisor ($Q \\times D = \\text{Dividend}$). To multiply large numbers, decompose them across tens and ones.',
      ruleDetails: [
        'Multiplication and division are reciprocal operations.',
        'Decompose two-digit numbers: 23 × 4 = (20 × 4) + (3 × 4) = 80 + 12 = 92.',
        'Always verify paper scratch work with inverse checking before moving forward.',
      ],
      category: 'Arithmetic',
      pitfall: 'Do not rely solely on mental memory for multi-digit calculations; paper-first decomposition avoids sign and carry slips.',
      whenToUse: 'Whenever simplifying ratios, verifying factors, or dividing dimensions on drawings.',
    },
    {
      id: 'step-6-transition',
      type: 'transition',
      title: 'Ready for Independent Practice',
      subtitle: 'Lesson Complete',
      summary:
        'You have mastered the core relationships between operations and decomposition strategies. Now it is time to practice paper-first problems at your own pace.',
      takeaways: [
        'Decomposition simplifies mental and written arithmetic',
        'Multiplication and division directly undo each other',
        'Paper-first scratch calculations build infallible consistency',
      ],
      callToAction: 'Start Unit 1 Practice →',
      targetUrl: '/courses/math/arithmetic/practice',
    },
  ],
};
