export const moduleData = {
  id: 'coordinate',
  title: 'Module 9: Coordinate Geometry',
  description: 'Unify algebra and geometry by studying shapes on the Cartesian coordinate plane.',
  category: 'coordinate-geometry',
  lessons: [
    {
      id: 'lesson-1',
      title: 'The Coordinate Plane',
      content: `
        <h3>The Cartesian System</h3>
        <p>The coordinate plane is formed by the intersection of a horizontal number line called the <strong>x-axis</strong> and a vertical number line called the <strong>y-axis</strong>. Their point of intersection is called the <strong>origin</strong>, denoted by $(0, 0)$.</p>
        <p>The axes divide the plane into four regions called <strong>quadrants</strong>, numbered counterclockwise from I to IV:</p>
        <ul>
          <li>Quadrant I: (+x, +y)</li>
          <li>Quadrant II: (-x, +y)</li>
          <li>Quadrant III: (-x, -y)</li>
          <li>Quadrant IV: (+x, -y)</li>
        </ul>
      `,
      keyTakeaways: [
        'The origin is the intersection of the x-axis and y-axis at $(0,0)$.',
        'Quadrants are numbered I through IV counterclockwise.'
      ]
    },
    {
      id: 'lesson-2',
      title: 'Plotting and Identifying Points',
      content: `
        <h3>Ordered Pairs</h3>
        <p>Every point on the coordinate plane is represented by an <strong>ordered pair</strong> $(x, y)$.</p>
        <ul>
          <li>The first number is the <strong>x-coordinate</strong> (or abscissa), indicating the horizontal distance from the y-axis.</li>
          <li>The second number is the <strong>y-coordinate</strong> (or ordinate), indicating the vertical distance from the x-axis.</li>
        </ul>
        <p>To plot the point $(3, -2)$, start at the origin, move 3 units to the right along the positive x-axis, and then move 2 units down parallel to the negative y-axis.</p>
      `,
      keyTakeaways: [
        'Points are written as $(x, y)$.',
        'x tells you left/right, y tells you up/down.'
      ]
    },
    {
      id: 'lesson-3',
      title: 'Distance Formula',
      content: `
        <h3>Distance Between Two Points</h3>
        <p>To find the straight-line distance $d$ between two points $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ on the coordinate plane, we use the distance formula. This formula is derived directly from the Pythagorean theorem by drawing a right triangle between the two points.</p>
        <p>$$ d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2} $$</p>
        <p>This formula allows you to analyze geometric shapes algebraically, such as proving that a triangle drawn on the plane is isosceles by showing two sides have the same length.</p>
      `,
      keyTakeaways: [
        'The distance formula is a direct application of the Pythagorean theorem.',
        '$d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$'
      ]
    },
    {
      id: 'lesson-4',
      title: 'Midpoint Formula',
      content: `
        <h3>Finding the Middle</h3>
        <p>The <strong>midpoint</strong> is the exact center point of a line segment connecting two points. Its coordinates are the average of the x-coordinates and the average of the y-coordinates of the endpoints.</p>
        <p>For points $(x_1, y_1)$ and $(x_2, y_2)$, the midpoint $M$ is:</p>
        <p>$$ M = \\left( \\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2} \\right) $$</p>
        <p>Engineers and architects use this concept to find the center of mass or the balance point of structural beams.</p>
      `,
      keyTakeaways: [
        'The midpoint coordinates are the averages of the endpoints\' coordinates.'
      ]
    },
    {
      id: 'lesson-5',
      title: 'Slope of a Line',
      content: `
        <h3>Steepness and Direction</h3>
        <p>The <strong>slope</strong> $m$ of a line measures its steepness and direction. It is the ratio of the vertical change (rise) to the horizontal change (run) between any two points on the line.</p>
        <p>$$ m = \\frac{\\text{rise}}{\\text{run}} = \\frac{y_2 - y_1}{x_2 - x_1} $$</p>
        <ul>
          <li>A <strong>positive slope</strong> means the line rises from left to right.</li>
          <li>A <strong>negative slope</strong> means the line falls from left to right.</li>
          <li>A <strong>zero slope</strong> indicates a horizontal line.</li>
          <li>An <strong>undefined slope</strong> indicates a vertical line (since division by zero is undefined).</li>
        </ul>
        <p>Parallel lines have the same slope. Perpendicular lines have slopes that are negative reciprocals of each other ($m_1 \\times m_2 = -1$).</p>
      `,
      keyTakeaways: [
        'Slope $m = \\frac{\\Delta y}{\\Delta x}$.',
        'Parallel lines have equal slopes; perpendicular lines have negative reciprocal slopes.'
      ]
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Which quadrant contains the point $(-4, 5)$?',
      options: ['Quadrant I', 'Quadrant II', 'Quadrant III', 'Quadrant IV'],
      correctAnswer: 1,
      explanation: 'The x-coordinate is negative and the y-coordinate is positive. This corresponds to Quadrant II.',
      hint: 'Think about the signs: (-, +) is in the upper left.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'What is the distance between the points $(0, 0)$ and $(3, 4)$?',
      options: ['4', '5', '6', '7'],
      correctAnswer: 1,
      explanation: 'Using the distance formula: $d = \\sqrt{(3-0)^2 + (4-0)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$.',
      hint: 'Use the distance formula or recognize the 3-4-5 right triangle.',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'Find the distance between $(-2, 1)$ and $(4, 9)$.',
      options: ['8', '10', '12', '14'],
      correctAnswer: 1,
      explanation: '$d = \\sqrt{(4 - (-2))^2 + (9 - 1)^2} = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.',
      hint: 'Be careful with double negatives: $(4 - (-2)) = 6$.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'What is the midpoint of the line segment connecting $(2, 4)$ and $(8, 12)$?',
      options: ['(3, 4)', '(5, 8)', '(6, 16)', '(10, 16)'],
      correctAnswer: 1,
      explanation: '$M = (\\frac{2+8}{2}, \\frac{4+12}{2}) = (\\frac{10}{2}, \\frac{16}{2}) = (5, 8)$.',
      hint: 'Average the x-values and average the y-values.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Find the slope of the line passing through $(-1, 3)$ and $(2, 9)$.',
      options: ['-2', '0.5', '2', '6'],
      correctAnswer: 2,
      explanation: 'Slope $m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{9 - 3}{2 - (-1)} = \\frac{6}{3} = 2$.',
      hint: 'Use the slope formula: rise over run.',
      difficulty: 'medium'
    },
    {
      id: 'p6',
      question: 'Line A has a slope of $2/3$. Line B is perpendicular to Line A. What is the slope of Line B?',
      options: ['2/3', '-2/3', '3/2', '-3/2'],
      correctAnswer: 3,
      explanation: 'Perpendicular lines have slopes that are negative reciprocals. Flip the fraction and change the sign: $-3/2$.',
      hint: 'Perpendicular slopes multiply to -1.',
      difficulty: 'medium'
    },
    {
      id: 'p7',
      question: 'The midpoint of segment AB is $(3, 4)$. If point A is $(1, 1)$, what are the coordinates of point B?',
      options: ['(2, 2.5)', '(4, 3)', '(5, 7)', '(7, 5)'],
      correctAnswer: 2,
      explanation: 'Let B be $(x, y)$. Using midpoint formula: $\\frac{1+x}{2} = 3 \\implies 1+x = 6 \\implies x=5$. And $\\frac{1+y}{2} = 4 \\implies 1+y = 8 \\implies y=7$. Point B is $(5, 7)$.',
      hint: 'Set up the midpoint equations and work backward to solve for the missing endpoint.',
      difficulty: 'hard'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'A point lies on the y-axis. What must be true about its coordinates?',
      options: ['The y-coordinate is 0', 'The x-coordinate is 0', 'Both coordinates are 0', 'The coordinates are equal'],
      correctAnswer: 1,
      explanation: 'Any point on the vertical y-axis has a horizontal distance of 0 from the origin, so its x-coordinate is 0.'
    },
    {
      id: 'q2',
      question: 'What is the slope of a horizontal line?',
      options: ['1', '-1', '0', 'Undefined'],
      correctAnswer: 2,
      explanation: 'A horizontal line has a vertical change (rise) of 0 between any two points. $0$ divided by any non-zero run is $0$.'
    },
    {
      id: 'q3',
      question: 'Which equation correctly represents the Distance Formula?',
      options: ['$d = \\sqrt{(x_2+x_1)^2 + (y_2+y_1)^2}$', '$d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$', '$d = (x_2-x_1)^2 + (y_2-y_1)^2$', '$d = |x_2-x_1| + |y_2-y_1|$'],
      correctAnswer: 1,
      explanation: 'The distance formula is derived from $a^2 + b^2 = c^2$, making $c = \\sqrt{a^2 + b^2}$, where $a = \\Delta x$ and $b = \\Delta y$.'
    },
    {
      id: 'q4',
      question: 'If two distinct lines have the same slope, they must be:',
      options: ['Intersecting', 'Perpendicular', 'Parallel', 'Vertical'],
      correctAnswer: 2,
      explanation: 'Lines with the same steepness and direction will never intersect, meaning they are parallel.'
    },
    {
      id: 'q5',
      question: 'A circle is centered at $(0,0)$ and passes through the point $(3,4)$. What is its radius?',
      options: ['5', '7', '12', '25'],
      correctAnswer: 0,
      explanation: 'The radius is the distance from the center to any point on the circle. The distance from $(0,0)$ to $(3,4)$ is $\\sqrt{3^2 + 4^2} = 5$.'
    }
  ]
};
