export const moduleData = {
  id: 'angles',
  title: 'Angles and Their Relationships',
  description: 'Understand the types of angles, how to measure them, and the special relationships they share when lines intersect or are parallel.',
  category: 'angles',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Types of Angles',
      content: `
        <h3>Classifying Angles</h3>
        <p>An angle is formed by two rays sharing a common vertex. We measure the "opening" between the rays in <strong>degrees ($^\\circ$)</strong>.</p>
        <ul>
          <li><strong>Acute Angle:</strong> Measures greater than $0^\\circ$ and less than $90^\\circ$.</li>
          <li><strong>Right Angle:</strong> Measures exactly $90^\\circ$. It's like the corner of a square.</li>
          <li><strong>Obtuse Angle:</strong> Measures greater than $90^\\circ$ and less than $180^\\circ$.</li>
          <li><strong>Straight Angle:</strong> Measures exactly $180^\\circ$, forming a straight line.</li>
          <li><strong>Reflex Angle:</strong> Measures greater than $180^\\circ$ and less than $360^\\circ$.</li>
        </ul>
      `,
      keyTakeaways: ['Angles are measured in degrees.', 'Acute < 90, Right = 90, Obtuse between 90 and 180.', 'Straight = 180.'],
    },
    {
      id: 'lesson-2',
      title: 'Measuring Angles',
      content: `
        <h3>Using a Protractor</h3>
        <p>A protractor is a tool used to measure angles. To use it, you place the center point of the protractor on the vertex of the angle and align the $0^\\circ$ mark with one ray. Then read the measurement where the other ray crosses the scale.</p>
        <p>The notation $m\\angle A$ means "the measure of angle A." So, if an angle measures 45 degrees, we write $m\\angle A = 45^\\circ$.</p>
      `,
      keyTakeaways: ['Protractors are used to measure angles in degrees.', '$m\\angle$ denotes the measure of an angle.'],
    },
    {
      id: 'lesson-3',
      title: 'Complementary and Supplementary',
      content: `
        <h3>Angle Pairs</h3>
        <p>Angles often relate to one another in special ways based on their sum:</p>
        <ul>
          <li><strong>Complementary Angles:</strong> Two angles whose measures add up to $90^\\circ$. (e.g., $30^\\circ$ and $60^\\circ$)</li>
          <li><strong>Supplementary Angles:</strong> Two angles whose measures add up to $180^\\circ$. (e.g., $110^\\circ$ and $70^\\circ$)</li>
        </ul>
        <p>A linear pair is a pair of adjacent angles formed by intersecting lines. They are always supplementary.</p>
      `,
      keyTakeaways: ['Complementary sum is 90.', 'Supplementary sum is 180.', 'Adjacent angles share a vertex and one side.'],
    },
    {
      id: 'lesson-4',
      title: 'Vertical Angles',
      content: `
        <h3>Intersecting Lines</h3>
        <p>When two lines intersect, they form four angles around the point of intersection. The angles that are opposite each other are called <strong>vertical angles</strong>.</p>
        <p><strong>Vertical Angles Theorem:</strong> Vertical angles are always equal in measure (they are congruent).</p>
        <p>If two lines intersect and one angle is $40^\\circ$, its vertical angle is also $40^\\circ$. The adjacent angles will be supplementary to it ($180^\\circ - 40^\\circ = 140^\\circ$).</p>
      `,
      keyTakeaways: ['Vertical angles are opposite each other when lines intersect.', 'Vertical angles are always congruent.'],
    },
    {
      id: 'lesson-5',
      title: 'Angles with Parallel Lines',
      content: `
        <h3>Transversals and Parallel Lines</h3>
        <p>A <strong>transversal</strong> is a line that intersects two or more coplanar lines. When a transversal intersects <em>parallel</em> lines, special angle relationships are formed:</p>
        <ul>
          <li><strong>Corresponding Angles:</strong> Are in the same relative position at each intersection. They are equal.</li>
          <li><strong>Alternate Interior Angles:</strong> Are on opposite sides of the transversal and between the parallel lines. They are equal.</li>
          <li><strong>Alternate Exterior Angles:</strong> Are on opposite sides of the transversal and outside the parallel lines. They are equal.</li>
          <li><strong>Consecutive Interior Angles:</strong> Are on the same side of the transversal and between parallel lines. They are <em>supplementary</em> (add to $180^\\circ$).</li>
        </ul>
      `,
      keyTakeaways: ['Corresponding, Alternate Interior, and Alternate Exterior angles are congruent.', 'Consecutive Interior angles are supplementary.'],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'An angle measures $125^\\circ$. What type of angle is it?',
      options: ['Acute', 'Right', 'Obtuse', 'Straight'],
      correctAnswer: 2,
      explanation: 'Since $125^\\circ$ is between $90^\\circ$ and $180^\\circ$, it is an obtuse angle.',
      hint: 'Is it bigger or smaller than a right angle ($90^\\circ$)?',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'Find the complement of an angle that measures $53^\\circ$.',
      options: ['$37^\\circ$', '$47^\\circ$', '$127^\\circ$', '$137^\\circ$'],
      correctAnswer: 0,
      explanation: 'Complementary angles add to $90^\\circ$. So, $90^\\circ - 53^\\circ = 37^\\circ$.',
      hint: 'Complementary means they add to 90 degrees.',
      difficulty: 'easy',
    },
    {
      id: 'p3',
      question: 'Find the supplement of an angle that measures $108^\\circ$.',
      options: ['$72^\\circ$', '$82^\\circ$', '$18^\\circ$', '$108^\\circ$'],
      correctAnswer: 0,
      explanation: 'Supplementary angles add to $180^\\circ$. So, $180^\\circ - 108^\\circ = 72^\\circ$.',
      hint: 'Supplementary means they add to 180 degrees.',
      difficulty: 'easy',
    },
    {
      id: 'p4',
      question: 'Angles $\\angle 1$ and $\\angle 2$ are vertical angles. If $m\\angle 1 = (3x + 10)^\\circ$ and $m\\angle 2 = (x + 40)^\\circ$, what is the value of $x$?',
      options: ['$10$', '$15$', '$20$', '$25$'],
      correctAnswer: 1,
      explanation: 'Vertical angles are equal. Set them equal: $3x + 10 = x + 40$. Subtract $x$ from both sides: $2x + 10 = 40$. Subtract 10: $2x = 30$. Divide by 2: $x = 15$.',
      hint: 'Vertical angles are always equal to each other.',
      difficulty: 'medium',
    },
    {
      id: 'p5',
      question: 'Two parallel lines are cut by a transversal. If an alternate interior angle measures $75^\\circ$, what is the measure of the other alternate interior angle?',
      options: ['$15^\\circ$', '$75^\\circ$', '$105^\\circ$', '$180^\\circ$'],
      correctAnswer: 1,
      explanation: 'Alternate interior angles are congruent when lines are parallel, so they are equal. The other angle is $75^\\circ$.',
      hint: 'Think about the properties of alternate interior angles.',
      difficulty: 'medium',
    },
    {
      id: 'p6',
      question: 'Angles $\\angle A$ and $\\angle B$ form a linear pair. If $m\\angle A = 4x$ and $m\\angle B = 5x$, find $m\\angle A$.',
      options: ['$20^\\circ$', '$40^\\circ$', '$80^\\circ$', '$100^\\circ$'],
      correctAnswer: 2,
      explanation: 'A linear pair is supplementary, so $4x + 5x = 180$. Then $9x = 180$, which means $x = 20$. Since $m\\angle A = 4x$, we have $4(20) = 80^\\circ$.',
      hint: 'A linear pair adds up to 180 degrees.',
      difficulty: 'hard',
    },
    {
      id: 'p7',
      question: 'In a system of parallel lines cut by a transversal, two consecutive interior angles measure $(2x)^\\circ$ and $(x - 30)^\\circ$. What is the value of $x$?',
      options: ['$40$', '$50$', '$60$', '$70$'],
      correctAnswer: 3,
      explanation: 'Consecutive interior angles are supplementary. $2x + (x - 30) = 180$. $3x - 30 = 180$. $3x = 210$. $x = 70$.',
      hint: 'Consecutive interior angles add up to 180 degrees.',
      difficulty: 'hard',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Which angle measures exactly $90^\\circ$?',
      options: ['Acute', 'Obtuse', 'Right', 'Straight'],
      correctAnswer: 2,
      explanation: 'A right angle is exactly 90 degrees.',
    },
    {
      id: 'q2',
      question: 'What is the sum of two complementary angles?',
      options: ['$90^\\circ$', '$180^\\circ$', '$270^\\circ$', '$360^\\circ$'],
      correctAnswer: 0,
      explanation: 'Complementary angles add up to 90 degrees.',
    },
    {
      id: 'q3',
      question: 'Vertical angles are always:',
      options: ['Supplementary', 'Complementary', 'Adjacent', 'Congruent'],
      correctAnswer: 3,
      explanation: 'Vertical angles are opposite angles formed by intersecting lines and are always equal (congruent).',
    },
    {
      id: 'q4',
      question: 'An angle is $60^\\circ$. Its supplement is:',
      options: ['$30^\\circ$', '$60^\\circ$', '$120^\\circ$', '$300^\\circ$'],
      correctAnswer: 2,
      explanation: 'Supplementary angles sum to 180. $180 - 60 = 120$.',
    },
    {
      id: 'q5',
      question: 'Alternate interior angles are congruent when:',
      options: ['The lines are intersecting', 'The transversal is perpendicular', 'The lines are parallel', 'They are adjacent'],
      correctAnswer: 2,
      explanation: 'When two parallel lines are cut by a transversal, alternate interior angles are equal.',
    }
  ]
};
