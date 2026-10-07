/**
 * src/data/lessons/anglesLines.js
 *
 * Interactive Guided Ladder lesson for Unit 1: Angles & Lines.
 * Follows the 6-stage Guided Ladder pedagogy:
 * 1. Predict Hook (Physical scissors / laser scenario)
 * 2. Visual Model (Synchronized Angle & Transversal Explorer with 3-Part Card)
 * 3. Guided Co-Solve / Micro-Check 1 (Formative vertical / linear pair check)
 * 4. Solo Micro-Check 2 (Formative alternate interior / consecutive interior check)
 * 5. Key Rule & Pitfall (The Transversal Invariant, Save to Rulebook)
 * 6. Transition (Launch into Unit 1 Practice)
 */

export const anglesLinesLesson = {
  id: 'angles-lines-lesson',
  unitId: 'angles-lines',
  unitPath: 'geometry/angles-lines',
  title: 'Angles & Lines',
  subtitle: 'Transversals, Intersections & Angle Conservation',
  estimatedMinutes: 8,
  totalSteps: 6,
  steps: [
    {
      id: 'step-1-hook',
      type: 'explain',
      title: 'The Scissors Paradox: Predict First',
      subtitle: 'Predict Hook',
      content:
        'Imagine holding a pair of shears or scissors.\n\nWhen you spread the handles open to an angle of $40^\\circ$, what happens to the blades on the other side of the pivot screw?\n\nThey must open to exactly $40^\\circ$ as well! Because both lines pass straight through a common vertex, the two opposite angles mirror each other identically. In geometry, these are called **vertical angles**.\n\nNow, imagine taking that single intersection and duplicating it along two parallel train tracks. What happens when a straight line cuts across both tracks?',
      threePartCard: {
        visual: 'A straight transversal line slices two parallel horizontal beams, creating 8 angle openings.',
        math: '\\text{Only 2 values exist}: \\quad \\theta \\quad \\text{and} \\quad (180^\\circ - \\theta)',
        rationale: 'Because parallel lines share identical orientation, the second intersection is an exact spatial clone of the first.',
      },
      callout: {
        title: 'Core Geometric Law',
        text: 'Across all 8 angles formed by a transversal cutting parallel lines, there are NEVER more than two distinct numbers! Every angle is either acute (θ) or obtuse (180° - θ).',
      },
    },
    {
      id: 'step-2-explorer',
      type: 'visual',
      title: 'Interactive Transversal Explorer',
      subtitle: 'Synchronized Visual Model',
      content:
        'Use the interactive tool below. Drag the angle slider or click presets ($45^\\circ, 60^\\circ, 90^\\circ$) to observe how every single angle shifts in real time across both parallel lines.\n\nSwitch between the relationship tabs to observe the **Z-pattern** (Alternate Interior) and the **F-pattern** (Corresponding).',
      visualizer: 'angle-explorer',
      props: {
        initialAngle: 65,
        embedded: true,
      },
      threePartCard: {
        visual: 'Alternate interior angles form an inner "Z" zigzag between parallel tracks.',
        math: '\\angle 3 = \\angle 6 = \\theta, \\quad \\angle 4 = \\angle 5 = (180^\\circ - \\theta)',
        rationale: 'In civil and truss engineering, diagonal cross-braces rely on this equality to transfer tension loads symmetrically.',
      },
    },
    {
      id: 'step-3-micro-check-1',
      type: 'micro-check',
      title: 'Quick Check: Linear Pairs on a Beam',
      subtitle: 'Formative Check 1',
      prompt: 'Two angles sit side-by-side along a straight horizontal beam. One angle measures $125^\\circ$:',
      question: 'What is the measure of angle $x$ such that $x + 125^\\circ = 180^\\circ$?',
      answer: '55',
      expectedAnswer: '55',
      explanation: 'Angles along a straight line form a linear pair and sum to $180^\\circ$. $180^\\circ - 125^\\circ = 55^\\circ$.',
      hint: 'Subtract 125 from 180 to find the supplementary angle.',
    },
    {
      id: 'step-4-micro-check-2',
      type: 'micro-check',
      title: 'Quick Check: The Alternate Interior Z-Rule',
      subtitle: 'Formative Check 2',
      prompt: 'Two parallel beams are intersected by a diagonal brace. An interior angle on the upper left measures $48^\\circ$:',
      question: 'What is the measure of the alternate interior angle on the lower right?',
      answer: '48',
      expectedAnswer: '48',
      explanation: 'Alternate interior angles between parallel lines are strictly congruent (equal). Both measure $48^\\circ$.',
      hint: 'The "Z" pattern inside parallel tracks preserves the exact angle measure.',
    },
    {
      id: 'step-5-rule',
      type: 'key-rule',
      title: 'Core Rule: The Transversal Invariant',
      subtitle: 'Key Rule',
      ruleId: 'rule-transversal-invariant',
      ruleSummary:
        'When two parallel lines are cut by a transversal, all acute angles are equal, all obtuse angles are equal, and any acute plus any obtuse angle sums to 180°.',
      ruleDetails: [
        'Vertical angles (opposite vertex) are strictly congruent.',
        'Alternate interior angles (Z-pattern) are strictly congruent.',
        'Corresponding angles (F-pattern, same relative slot) are strictly congruent.',
        'Consecutive interior angles on the same side are supplementary (sum = 180°).',
      ],
      category: 'Geometry',
      pitfall: 'Do not assume angles are equal unless the lines are confirmed parallel; transversals across non-parallel lines do not conserve angles.',
      whenToUse: 'Whenever calculating truss diagonals, surveying slopes, or analyzing vector angles cut across parallel axes.',
    },
    {
      id: 'step-6-transition',
      type: 'transition',
      title: 'Ready for Unit 1 Practice',
      subtitle: 'Lesson Complete',
      summary:
        'You have mastered the foundational angles of geometry: linear pairs, vertical reflections, and parallel transversals. Now solidify this spatial intuition with paper-first practice problems.',
      takeaways: [
        'Angles along a line always sum to 180°',
        'Transversals generate only two unique angle measures across 8 corners',
        'Alternate interior angles provide the basis for engineering cross-bracing',
      ],
      callToAction: 'Start Unit 1 Practice →',
      targetUrl: '/courses/geometry/angles-lines/practice',
    },
  ],
};
