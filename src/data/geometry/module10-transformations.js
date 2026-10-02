export const moduleData = {
  id: 'transformations',
  title: 'Module 10: Transformations',
  description: 'Learn how shapes move, flip, and scale on the coordinate plane.',
  category: 'transformations',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Translations',
      content: `
        <h3>Sliding Shapes</h3>
        <p>A <strong>transformation</strong> is an operation that maps an original geometric figure (the pre-image) onto a new figure (the image).</p>
        <p>A <strong>translation</strong> simply slides a figure in a specific direction for a specific distance without changing its size, shape, or orientation. In computer graphics, moving a character across the screen uses translations.</p>
        <p>On a coordinate plane, a translation is described by adding or subtracting values to the x and y coordinates:</p>
        <p>$$ (x, y) \\rightarrow (x + a, y + b) $$</p>
        <p>Here, $a$ is the horizontal shift (right is positive, left is negative), and $b$ is the vertical shift (up is positive, down is negative).</p>
      `,
      keyTakeaways: [
        'A translation "slides" a figure without rotating or resizing it.',
        'It changes the position by adding to the $(x, y)$ coordinates.'
      ]
    },
    {
      id: 'lesson-2',
      title: 'Reflections',
      content: `
        <h3>Flipping over a Line</h3>
        <p>A <strong>reflection</strong> is a transformation representing a "flip" of a figure over a line of symmetry, called the line of reflection. The pre-image and image are mirror halves.</p>
        <p>Common coordinate plane reflections:</p>
        <ul>
          <li><strong>Over the x-axis:</strong> The y-coordinate changes sign. $(x, y) \\rightarrow (x, -y)$</li>
          <li><strong>Over the y-axis:</strong> The x-coordinate changes sign. $(x, y) \\rightarrow (-x, y)$</li>
          <li><strong>Over the line $y = x$:</strong> The coordinates swap. $(x, y) \\rightarrow (y, x)$</li>
        </ul>
      `,
      keyTakeaways: [
        'A reflection creates a mirror image.',
        'Reflecting over an axis changes the sign of the opposite coordinate.'
      ]
    },
    {
      id: 'lesson-3',
      title: 'Rotations',
      content: `
        <h3>Turning around a Point</h3>
        <p>A <strong>rotation</strong> turns a figure around a fixed point called the center of rotation. We specify the angle of rotation and the direction (clockwise or counterclockwise).</p>
        <p>Standard rotations around the origin $(0,0)$ in the counterclockwise direction:</p>
        <ul>
          <li><strong>$90^\\circ$ rotation:</strong> $(x, y) \\rightarrow (-y, x)$</li>
          <li><strong>$180^\\circ$ rotation:</strong> $(x, y) \\rightarrow (-x, -y)$</li>
          <li><strong>$270^\\circ$ rotation:</strong> $(x, y) \\rightarrow (y, -x)$</li>
        </ul>
        <p>Notice that a $180^\\circ$ rotation has the same effect as reflecting over both the x and y axes consecutively.</p>
      `,
      keyTakeaways: [
        'A rotation turns a figure around a center point.',
        'Standard rules apply for 90, 180, and 270 degree turns around the origin.'
      ]
    },
    {
      id: 'lesson-4',
      title: 'Dilations',
      content: `
        <h3>Scaling Up or Down</h3>
        <p>A <strong>dilation</strong> is a transformation that changes the size of a figure but not its shape. It creates a similar figure. This is heavily used in 3D rendering and digital imaging when you zoom in or scale an object.</p>
        <p>A dilation requires a center of dilation and a <strong>scale factor</strong> $k$. If the center of dilation is the origin $(0,0)$:</p>
        <p>$$ (x, y) \\rightarrow (kx, ky) $$</p>
        <ul>
          <li>If $k > 1$, the image is larger than the pre-image (enlargement).</li>
          <li>If $0 < k < 1$, the image is smaller (reduction).</li>
        </ul>
        <p>Note: Translations, reflections, and rotations preserve the size and shape of the figure, so they are called <strong>rigid transformations</strong> (or isometries). Dilation is a non-rigid transformation.</p>
      `,
      keyTakeaways: [
        'Dilation changes size but preserves shape, creating similar figures.',
        'Multiply coordinates by the scale factor $k$.'
      ]
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'A point at $(3, 4)$ is translated 2 units left and 5 units up. What is its new location?',
      options: ['(1, 9)', '(5, -1)', '(1, -1)', '(5, 9)'],
      correctAnswer: 0,
      explanation: 'Left 2 means $x - 2$, up 5 means $y + 5$. So $(3-2, 4+5) = (1, 9)$.',
      hint: 'Left is negative $x$, up is positive $y$.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'What are the coordinates of the point $(-2, 7)$ after a reflection over the x-axis?',
      options: ['(2, 7)', '(-2, -7)', '(2, -7)', '(7, -2)'],
      correctAnswer: 1,
      explanation: 'Reflecting over the x-axis changes the sign of the y-coordinate: $(x, y) \\rightarrow (x, -y)$. So $(-2, 7) \\rightarrow (-2, -7)$.',
      hint: 'For an x-axis reflection, keep the x value and flip the y sign.',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'A point is rotated $180^\\circ$ counterclockwise around the origin. If its pre-image was $(4, -1)$, what is the image?',
      options: ['(-4, 1)', '(1, 4)', '(-1, -4)', '(4, 1)'],
      correctAnswer: 0,
      explanation: 'The rule for a $180^\\circ$ rotation is $(x, y) \\rightarrow (-x, -y)$. So $(4, -1) \\rightarrow (-4, 1)$.',
      hint: 'A $180^\\circ$ rotation flips the sign of both coordinates.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'Triangle ABC is dilated by a scale factor of $3$ centered at the origin. If vertex A is at $(2, 3)$, where is A\'?',
      options: ['(5, 6)', '(6, 9)', '(2/3, 1)', '(9, 6)'],
      correctAnswer: 1,
      explanation: 'Multiply both coordinates by the scale factor $k=3$: $(2 \\times 3, 3 \\times 3) = (6, 9)$.',
      hint: 'Multiply the coordinates by the scale factor.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Which of the following transformations does NOT preserve the area of a figure?',
      options: ['Translation', 'Reflection', 'Rotation', 'Dilation'],
      correctAnswer: 3,
      explanation: 'Translations, reflections, and rotations are rigid transformations that preserve size and shape. Dilation changes the size, and therefore changes the area.',
      hint: 'Which transformation changes the size of the shape?',
      difficulty: 'easy'
    },
    {
      id: 'p6',
      question: 'A point $(x, y)$ is reflected over the y-axis, and then translated 3 units right. What is the final algebraic rule?',
      options: ['(-x + 3, y)', '(-x, y + 3)', '(x - 3, y)', '(-x - 3, y)'],
      correctAnswer: 0,
      explanation: 'First, reflect over y-axis: $(x, y) \\rightarrow (-x, y)$. Then, translate 3 right: add 3 to the new x-coordinate. Final: $(-x + 3, y)$.',
      hint: 'Perform the operations sequentially on the generic coordinates.',
      difficulty: 'hard'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'If a shape is slid across a plane without turning or flipping, what transformation has occurred?',
      options: ['Rotation', 'Translation', 'Reflection', 'Dilation'],
      correctAnswer: 1,
      explanation: 'A sliding motion is formally known as a translation.'
    },
    {
      id: 'q2',
      question: 'What is the image of the point $(5, -2)$ after a rotation of $90^\\circ$ counterclockwise around the origin?',
      options: ['(-2, -5)', '(2, 5)', '(2, -5)', '(-5, 2)'],
      correctAnswer: 1,
      explanation: 'The rule for a $90^\\circ$ counterclockwise rotation is $(x, y) \\rightarrow (-y, x)$. So $(5, -2) \\rightarrow (-(-2), 5) = (2, 5)$.'
    },
    {
      id: 'q3',
      question: 'If a square with an area of $4$ is dilated by a scale factor of $k = 3$, what is the area of the new square?',
      options: ['12', '16', '36', '64'],
      correctAnswer: 2,
      explanation: 'When a 2D figure is dilated by a factor of $k$, its area scales by $k^2$. The new area is $4 \\times 3^2 = 4 \\times 9 = 36$.'
    },
    {
      id: 'q4',
      question: 'Reflecting a figure across the line $y = x$ results in which coordinate change?',
      options: ['(x, y) -> (-x, -y)', '(x, y) -> (x, -y)', '(x, y) -> (y, x)', '(x, y) -> (-y, -x)'],
      correctAnswer: 2,
      explanation: 'Reflecting across the line $y=x$ swaps the x and y coordinates.'
    },
    {
      id: 'q5',
      question: 'A rigid transformation is also known as a(n):',
      options: ['Enlargement', 'Isometry', 'Dilation', 'Reduction'],
      correctAnswer: 1,
      explanation: 'An isometry is a transformation that preserves distance between points, maintaining the original shape and size.'
    }
  ]
};
