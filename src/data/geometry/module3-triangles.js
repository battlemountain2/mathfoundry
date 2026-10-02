export const moduleData = {
  id: 'triangles',
  title: 'Triangles: Properties and Relationships',
  description: 'Dive deep into triangles, learning how to classify them, discover the sums of their angles, and prove congruence and similarity.',
  category: 'triangles',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Triangle Classification',
      content: `
        <h3>Classifying by Sides</h3>
        <p>Triangles can be classified based on the lengths of their sides:</p>
        <ul>
          <li><strong>Equilateral Triangle:</strong> All three sides are equal in length.</li>
          <li><strong>Isosceles Triangle:</strong> At least two sides are equal in length.</li>
          <li><strong>Scalene Triangle:</strong> No sides are equal in length.</li>
        </ul>
        <h3>Classifying by Angles</h3>
        <p>Triangles can also be classified by their interior angles:</p>
        <ul>
          <li><strong>Acute Triangle:</strong> All three angles are acute (less than $90^\\circ$).</li>
          <li><strong>Right Triangle:</strong> Has exactly one right angle ($90^\\circ$).</li>
          <li><strong>Obtuse Triangle:</strong> Has exactly one obtuse angle (greater than $90^\\circ$).</li>
        </ul>
      `,
      keyTakeaways: ['Triangles are classified by both their sides and their angles.', 'An equilateral triangle is also equiangular (all angles are $60^\\circ$).'],
    },
    {
      id: 'lesson-2',
      title: 'Interior Angles Sum',
      content: `
        <h3>The Triangle Sum Theorem</h3>
        <p>The sum of the interior angles of ANY triangle is always exactly $180^\\circ$.</p>
        <p>$$m\\angle A + m\\angle B + m\\angle C = 180^\\circ$$</p>
        <p>This is one of the most fundamental rules in geometry. If you know two angles of a triangle, you can always find the third by subtracting their sum from $180^\\circ$.</p>
        <h3>Exterior Angle Theorem</h3>
        <p>The measure of an exterior angle of a triangle is equal to the sum of the measures of its two remote (non-adjacent) interior angles.</p>
      `,
      keyTakeaways: ['Interior angles of a triangle sum to $180^\\circ$.', 'Exterior angle = sum of two remote interior angles.'],
    },
    {
      id: 'lesson-3',
      title: 'Triangle Congruence',
      content: `
        <h3>What is Congruence?</h3>
        <p>Two triangles are <strong>congruent</strong> ($\\cong$) if they are exactly the same shape and size. This means all their corresponding parts (sides and angles) are equal.</p>
        <p>We don't need to check all 6 parts to prove congruence. We can use these shortcuts:</p>
        <ul>
          <li><strong>SSS (Side-Side-Side):</strong> All three corresponding sides are equal.</li>
          <li><strong>SAS (Side-Angle-Side):</strong> Two sides and the included angle are equal.</li>
          <li><strong>ASA (Angle-Side-Angle):</strong> Two angles and the included side are equal.</li>
          <li><strong>AAS (Angle-Angle-Side):</strong> Two angles and a non-included side are equal.</li>
          <li><strong>HL (Hypotenuse-Leg):</strong> For right triangles only.</li>
        </ul>
        <p><em>Note: AAA and SSA do NOT guarantee congruence.</em></p>
      `,
      keyTakeaways: ['Congruent triangles have identical corresponding sides and angles.', 'SSS, SAS, ASA, AAS, and HL are valid congruence postulates.'],
    },
    {
      id: 'lesson-4',
      title: 'Similar Triangles',
      content: `
        <h3>What is Similarity?</h3>
        <p>Two triangles are <strong>similar</strong> ($\\sim$) if they have the same shape, but not necessarily the same size. Their corresponding angles are equal, and their corresponding sides are proportional.</p>
        <p>Shortcuts for similarity:</p>
        <ul>
          <li><strong>AA (Angle-Angle):</strong> If two angles of one triangle are congruent to two angles of another, the triangles are similar.</li>
          <li><strong>SAS Similarity:</strong> Two sides are proportional, and their included angle is congruent.</li>
          <li><strong>SSS Similarity:</strong> All three corresponding sides are proportional.</li>
        </ul>
      `,
      keyTakeaways: ['Similar triangles have congruent angles and proportional sides.', 'AA, SAS, and SSS are valid similarity postulates.'],
    },
    {
      id: 'lesson-5',
      title: 'Triangle Inequality',
      content: `
        <h3>Can these sides make a triangle?</h3>
        <p>Not every set of three lengths can form a triangle. The <strong>Triangle Inequality Theorem</strong> states that the sum of the lengths of any two sides of a triangle must be strictly greater than the length of the third side.</p>
        <p>For sides $a$, $b$, and $c$, all three of these must be true:</p>
        <ul>
          <li>$a + b > c$</li>
          <li>$a + c > b$</li>
          <li>$b + c > a$</li>
        </ul>
        <p>A quick trick is to check if the sum of the two smaller sides is greater than the largest side.</p>
      `,
      keyTakeaways: ['Sum of any two sides must be > the third side.', 'Used to determine if three lengths can form a valid triangle.'],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'A triangle has angles measuring $40^\\circ$, $60^\\circ$, and $80^\\circ$. What type of triangle is this by its angles?',
      options: ['Right', 'Obtuse', 'Acute', 'Straight'],
      correctAnswer: 2,
      explanation: 'Since all three angles are less than $90^\\circ$, it is an acute triangle.',
      hint: 'Look at the largest angle.',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'Two angles of a triangle are $45^\\circ$ and $55^\\circ$. What is the measure of the third angle?',
      options: ['$70^\\circ$', '$80^\\circ$', '$90^\\circ$', '$100^\\circ$'],
      correctAnswer: 1,
      explanation: 'The sum of angles in a triangle is $180^\\circ$. $180 - (45 + 55) = 180 - 100 = 80^\\circ$.',
      hint: 'Subtract the sum of the known angles from 180.',
      difficulty: 'easy',
    },
    {
      id: 'p3',
      question: 'Which of the following sets of side lengths can form a triangle?',
      options: ['$3, 4, 8$', '$5, 5, 10$', '$6, 7, 12$', '$1, 2, 4$'],
      correctAnswer: 2,
      explanation: 'Using the Triangle Inequality Theorem, the sum of the two smaller sides must be greater than the largest side. Only $6 + 7 = 13$, which is $> 12$, works.',
      hint: 'Check if small + small > large.',
      difficulty: 'medium',
    },
    {
      id: 'p4',
      question: 'If $\\triangle ABC \\cong \\triangle DEF$, and $AB = 5$, what is $DE$?',
      options: ['$5$', '$10$', 'Cannot be determined', 'Depends on the angles'],
      correctAnswer: 0,
      explanation: 'Corresponding parts of congruent triangles are equal (CPCTC). Since $AB$ and $DE$ correspond, $DE = 5$.',
      hint: 'The order of letters in congruence statements matters.',
      difficulty: 'medium',
    },
    {
      id: 'p5',
      question: 'An exterior angle of a triangle measures $120^\\circ$. The two remote interior angles measure $x^\\circ$ and $2x^\\circ$. What is $x$?',
      options: ['$30$', '$40$', '$50$', '$60$'],
      correctAnswer: 1,
      explanation: 'By the Exterior Angle Theorem, $x + 2x = 120$. So $3x = 120$, giving $x = 40$.',
      hint: 'Exterior angle = sum of remote interior angles.',
      difficulty: 'hard',
    },
    {
      id: 'p6',
      question: 'Which of the following is NOT a valid congruence shortcut?',
      options: ['SSS', 'SAS', 'AAA', 'AAS'],
      correctAnswer: 2,
      explanation: 'AAA only guarantees similarity, not congruence, because you can have two triangles with the same angles but different sizes.',
      hint: 'Think about zooming in on a shape.',
      difficulty: 'medium',
    },
    {
      id: 'p7',
      question: 'In $\\triangle XYZ$, $\\angle X = 50^\\circ$ and $\\angle Y = 60^\\circ$. Which side is the longest?',
      options: ['$XY$', '$YZ$', '$XZ$', 'All are equal'],
      correctAnswer: 0,
      explanation: 'First, find $\\angle Z = 180 - (50 + 60) = 70^\\circ$. The longest side is opposite the largest angle. Opposite $\\angle Z$ is side $XY$.',
      hint: 'Find the largest angle first. The longest side is across from it.',
      difficulty: 'hard',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'What do the interior angles of a triangle add up to?',
      options: ['$90^\\circ$', '$180^\\circ$', '$270^\\circ$', '$360^\\circ$'],
      correctAnswer: 1,
      explanation: 'The Triangle Sum Theorem states they always sum to 180 degrees.',
    },
    {
      id: 'q2',
      question: 'A triangle with no equal sides is called:',
      options: ['Equilateral', 'Isosceles', 'Scalene', 'Acute'],
      correctAnswer: 2,
      explanation: 'A scalene triangle has three unequal sides.',
    },
    {
      id: 'q3',
      question: 'Which postulate states that if three sides of one triangle are congruent to three sides of another, the triangles are congruent?',
      options: ['ASA', 'SAS', 'SSS', 'AAS'],
      correctAnswer: 2,
      explanation: 'SSS stands for Side-Side-Side.',
    },
    {
      id: 'q4',
      question: 'Two triangles with exactly the same angles are definitely:',
      options: ['Congruent', 'Similar', 'Equilateral', 'Right'],
      correctAnswer: 1,
      explanation: 'AAA similarity postulate means they are similar. They are not necessarily congruent (same size).',
    },
    {
      id: 'q5',
      question: 'Can sides of length 2, 3, and 5 form a triangle?',
      options: ['Yes', 'No', 'Only if it is a right triangle', 'Depends on the angles'],
      correctAnswer: 1,
      explanation: 'No, because $2 + 3 = 5$. The sum of two sides must be strictly GREATER than the third side.',
    }
  ]
};
