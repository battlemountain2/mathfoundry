export const moduleData = {
  id: 'pythagorean',
  title: 'The Pythagorean Theorem',
  description: 'Master one of the most famous theorems in mathematics. Learn how to relate the sides of a right triangle and apply it to real-world problems.',
  category: 'pythagorean',
  lessons: [
    {
      id: 'lesson-1',
      title: 'The Pythagorean Theorem',
      content: `
        <h3>What is it?</h3>
        <p>The Pythagorean Theorem is a fundamental rule in geometry that applies ONLY to <strong>right-angled triangles</strong>.</p>
        <p>It states that the square of the hypotenuse (the side opposite the right angle) is equal to the sum of the squares of the other two sides (the legs).</p>
        <p>The formula is: $$a^2 + b^2 = c^2$$</p>
        <p>Where:</p>
        <ul>
          <li><strong>$c$</strong> is the hypotenuse (always the longest side).</li>
          <li><strong>$a$</strong> and <strong>$b$</strong> are the legs.</li>
        </ul>
      `,
      keyTakeaways: ['Only applies to right triangles.', 'Formula: $a^2 + b^2 = c^2$', '$c$ must be the hypotenuse.'],
    },
    {
      id: 'lesson-2',
      title: 'Finding the Hypotenuse',
      content: `
        <h3>Calculating the Unknown</h3>
        <p>If you know the lengths of both legs, you can find the hypotenuse.</p>
        <p><strong>Example:</strong> A right triangle has legs of $3$ and $4$. What is the hypotenuse?</p>
        <p>$$a^2 + b^2 = c^2$$</p>
        <p>$$3^2 + 4^2 = c^2$$</p>
        <p>$$9 + 16 = c^2$$</p>
        <p>$$25 = c^2$$</p>
        <p>$$c = \\sqrt{25} = 5$$</p>
        <p>The numbers $(3, 4, 5)$ form a "Pythagorean Triple" - a set of three integers that perfectly satisfy the theorem.</p>
      `,
      keyTakeaways: ['Square the legs, add them, then take the square root to find the hypotenuse.', 'Pythagorean Triples are handy to memorize (e.g., $3,4,5$; $5,12,13$).'],
    },
    {
      id: 'lesson-3',
      title: 'Finding a Leg',
      content: `
        <h3>When the Hypotenuse is Known</h3>
        <p>If you know the hypotenuse and one leg, you subtract to find the other leg.</p>
        <p><strong>Example:</strong> A right triangle has a hypotenuse of $13$ and one leg of $5$. What is the other leg?</p>
        <p>$$a^2 + b^2 = c^2$$</p>
        <p>$$5^2 + b^2 = 13^2$$</p>
        <p>$$25 + b^2 = 169$$</p>
        <p>$$b^2 = 169 - 25 = 144$$</p>
        <p>$$b = \\sqrt{144} = 12$$</p>
      `,
      keyTakeaways: ['Rearrange the formula: $a^2 = c^2 - b^2$', 'Always subtract the leg squared from the hypotenuse squared.'],
    },
    {
      id: 'lesson-4',
      title: 'The Distance Formula',
      content: `
        <h3>Pythagoras on a Grid</h3>
        <p>The Pythagorean Theorem is the basis for the <strong>Distance Formula</strong> in coordinate geometry.</p>
        <p>To find the distance $d$ between two points $(x_1, y_1)$ and $(x_2, y_2)$, imagine them forming a right triangle where the horizontal distance is $a$ and the vertical distance is $b$.</p>
        <p>$$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$</p>
        <p>This is literally just $c = \\sqrt{a^2 + b^2}$ applied to a coordinate plane!</p>
      `,
      keyTakeaways: ['The distance formula is derived directly from the Pythagorean theorem.', 'Horizontal difference is one leg; vertical difference is the other leg.'],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'In a right triangle, the legs are $6$ and $8$. What is the length of the hypotenuse?',
      options: ['$10$', '$12$', '$14$', '$100$'],
      correctAnswer: 0,
      explanation: '$6^2 + 8^2 = 36 + 64 = 100$. $c = \\sqrt{100} = 10$.',
      hint: 'Use $a^2 + b^2 = c^2$.',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'A right triangle has a hypotenuse of $15$ and a leg of $9$. What is the length of the other leg?',
      options: ['$10$', '$12$', '$14$', '$144$'],
      correctAnswer: 1,
      explanation: '$9^2 + b^2 = 15^2 \\rightarrow 81 + b^2 = 225 \\rightarrow b^2 = 144 \\rightarrow b = 12$.',
      hint: 'You need to subtract. $b^2 = c^2 - a^2$.',
      difficulty: 'medium',
    },
    {
      id: 'p3',
      question: 'Which of the following is a Pythagorean triple?',
      options: ['$2, 3, 4$', '$4, 5, 6$', '$8, 15, 17$', '$9, 12, 16$'],
      correctAnswer: 2,
      explanation: '$8^2 + 15^2 = 64 + 225 = 289$. Since $17^2 = 289$, it is a valid triple.',
      hint: 'Check which set satisfies $a^2 + b^2 = c^2$.',
      difficulty: 'medium',
    },
    {
      id: 'p4',
      question: 'A $13$ ft ladder is leaning against a wall. The base of the ladder is $5$ ft from the wall. How high up the wall does the ladder reach?',
      options: ['$8$ ft', '$10$ ft', '$12$ ft', '$14$ ft'],
      correctAnswer: 2,
      explanation: 'The ladder is the hypotenuse ($13$), the base is one leg ($5$). $5^2 + x^2 = 13^2 \\rightarrow 25 + x^2 = 169 \\rightarrow x^2 = 144 \\rightarrow x = 12$.',
      hint: 'Draw a picture! The ladder is the hypotenuse.',
      difficulty: 'medium',
    },
    {
      id: 'p5',
      question: 'Find the distance between the points $(1, 2)$ and $(4, 6)$.',
      options: ['$3$', '$4$', '$5$', '$7$'],
      correctAnswer: 2,
      explanation: '$d = \\sqrt{(4-1)^2 + (6-2)^2} = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.',
      hint: 'Use the distance formula: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$',
      difficulty: 'hard',
    },
    {
      id: 'p6',
      question: 'A right triangle has legs of length $x$ and $x+2$. Its hypotenuse is $10$. What is the value of $x$?',
      options: ['$4$', '$6$', '$8$', '$10$'],
      correctAnswer: 1,
      explanation: '$x^2 + (x+2)^2 = 10^2 \\rightarrow x^2 + x^2 + 4x + 4 = 100 \\rightarrow 2x^2 + 4x - 96 = 0 \\rightarrow x^2 + 2x - 48 = 0$. Factoring gives $(x+8)(x-6)=0$. Since length must be positive, $x=6$.',
      hint: 'Set up an equation and expand: $x^2 + (x+2)^2 = 10^2$.',
      difficulty: 'hard',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'The Pythagorean Theorem only works on what type of shape?',
      options: ['Right triangles', 'All triangles', 'Squares', 'Acute triangles'],
      correctAnswer: 0,
      explanation: 'It is strictly for right-angled triangles.',
    },
    {
      id: 'q2',
      question: 'What is the correct formula for the Pythagorean Theorem?',
      options: ['$a + b = c$', '$a^2 + b^2 = c^2$', '$a^2 - b^2 = c^2$', '$(a+b)^2 = c$'],
      correctAnswer: 1,
      explanation: 'The sum of the squares of the legs equals the square of the hypotenuse.',
    },
    {
      id: 'q3',
      question: 'If a right triangle has legs of $5$ and $12$, what is the hypotenuse?',
      options: ['$13$', '$15$', '$17$', '$169$'],
      correctAnswer: 0,
      explanation: '$5^2 + 12^2 = 25 + 144 = 169$. $\\sqrt{169} = 13$.',
    },
    {
      id: 'q4',
      question: 'The hypotenuse is always:',
      options: ['The shortest side', 'Adjacent to the right angle', 'The longest side', 'Equal to the sum of the legs'],
      correctAnswer: 2,
      explanation: 'The hypotenuse is always the longest side in a right triangle, located opposite the $90^\\circ$ angle.',
    },
    {
      id: 'q5',
      question: 'The Distance Formula is derived from the Pythagorean Theorem.',
      options: ['True', 'False', 'Only for integers', 'Depends on the quadrant'],
      correctAnswer: 0,
      explanation: 'True. The distance formula is essentially $c = \\sqrt{a^2 + b^2}$ on a coordinate grid.',
    }
  ]
};
