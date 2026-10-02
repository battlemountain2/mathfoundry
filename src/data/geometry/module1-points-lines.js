export const moduleData = {
  id: 'points-lines',
  title: 'Points, Lines, and Planes',
  description: 'The fundamental building blocks of geometry. Learn about points, lines, segments, rays, and planes.',
  category: 'basic-shapes',
  lessons: [
    {
      id: 'lesson-1',
      title: 'What is a Point?',
      content: `
        <h3>The Foundation of Geometry</h3>
        <p>In geometry, a <strong>point</strong> is an exact location in space. It has no size—no length, width, or depth. We usually represent a point with a dot and name it using a capital letter, like point $A$.</p>
        <p>Because points have no dimension, they are purely conceptual. Everything else in geometry is built from points!</p>
      `,
      keyTakeaways: ['A point has zero dimensions.', 'It represents an exact position.', 'It is named with a capital letter (e.g., $P$).'],
    },
    {
      id: 'lesson-2',
      title: 'Lines and Line Segments',
      content: `
        <h3>Lines Extend Forever</h3>
        <p>A <strong>line</strong> is a straight arrangement of points that extends infinitely in two opposite directions. It has one dimension (length) but no thickness.</p>
        <p>We write a line passing through points $A$ and $B$ as $\\overleftrightarrow{AB}$.</p>
        <h3>Line Segments</h3>
        <p>A <strong>line segment</strong> is a part of a line bounded by two distinct endpoints. It has a specific, measurable length.</p>
        <p>We write a segment with endpoints $A$ and $B$ as $\\overline{AB}$. The distance between $A$ and $B$ is the length of $\\overline{AB}$, sometimes simply written as $AB$.</p>
      `,
      keyTakeaways: ['A line goes on forever in both directions (1 dimension).', 'A line segment has two endpoints and a definite length.', 'Points that lie on the same line are called collinear.'],
    },
    {
      id: 'lesson-3',
      title: 'Rays and Angles Introduction',
      content: `
        <h3>Rays: One Endpoint, Infinite Extent</h3>
        <p>A <strong>ray</strong> is a part of a line that has one endpoint and extends infinitely in one direction. Think of a laser pointer or a ray of sunlight.</p>
        <p>A ray starting at point $A$ and going through point $B$ is denoted as $\\overrightarrow{AB}$. The endpoint must be written first.</p>
        <h3>Forming Angles</h3>
        <p>When two rays share the same endpoint, they form an <strong>angle</strong>. The shared endpoint is the <em>vertex</em> of the angle, and the two rays are the <em>sides</em>.</p>
      `,
      keyTakeaways: ['A ray has exactly one endpoint.', '$\\overrightarrow{AB}$ is not the same as $\\overrightarrow{BA}$.', 'Two rays with a common endpoint form an angle.'],
    },
    {
      id: 'lesson-4',
      title: 'Planes in Space',
      content: `
        <h3>Two Dimensions: Planes</h3>
        <p>A <strong>plane</strong> is a flat, two-dimensional surface that extends infinitely in all directions. It has length and width, but no depth.</p>
        <p>Any three non-collinear points (points not on the same line) define exactly one plane. We often name a plane by a script letter, like Plane $\\mathcal{P}$, or by three points on it, like Plane $ABC$.</p>
        <p>Lines that lie in the same plane are called <em>coplanar</em>.</p>
      `,
      keyTakeaways: ['A plane is a flat surface with 2 dimensions.', 'Three non-collinear points determine a plane.', 'Coplanar points and lines exist on the same plane.'],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Which of the following geometric figures has exactly one endpoint?',
      options: ['Line', 'Line segment', 'Ray', 'Point'],
      correctAnswer: 2,
      explanation: 'A line has $0$ endpoints, a line segment has $2$, and a point is just a location. A ray has exactly $1$ endpoint.',
      hint: 'Think of a flashlight beam.',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'Points $A$, $B$, and $C$ lie on the same line. What term describes these points?',
      options: ['Coplanar', 'Collinear', 'Concurrent', 'Coincident'],
      correctAnswer: 1,
      explanation: 'Points on the same line are called collinear. Coplanar refers to points on the same plane.',
      hint: '"Co-" means together, and "-linear" refers to a line.',
      difficulty: 'easy',
    },
    {
      id: 'p3',
      question: 'How many dimensions does a plane have?',
      options: ['$0$', '$1$', '$2$', '$3$'],
      correctAnswer: 2,
      explanation: 'A plane has length and width, but no depth, making it $2$-dimensional.',
      hint: 'A point is 0D, a line is 1D.',
      difficulty: 'easy',
    },
    {
      id: 'p4',
      question: 'If ray $\\overrightarrow{PQ}$ and ray $\\overrightarrow{PR}$ are opposite rays, what do they form together?',
      options: ['An angle', 'A line', 'A plane', 'A line segment'],
      correctAnswer: 1,
      explanation: 'Opposite rays share an endpoint and go in completely opposite directions, forming a straight line.',
      hint: 'Imagine two rays starting at P going left and right.',
      difficulty: 'medium',
    },
    {
      id: 'p5',
      question: 'What is the minimum number of points required to determine a unique plane?',
      options: ['1', '2', '3', '4'],
      correctAnswer: 2,
      explanation: 'Any $3$ non-collinear points uniquely define a plane.',
      hint: 'A tripod has 3 legs for a reason.',
      difficulty: 'medium',
    },
    {
      id: 'p6',
      question: 'Which notation represents a line segment with endpoints $X$ and $Y$?',
      options: ['$\\overleftrightarrow{XY}$', '$\\overrightarrow{XY}$', '$\\overline{XY}$', '$XY$'],
      correctAnswer: 2,
      explanation: '$\\overline{XY}$ represents a segment. $\\overleftrightarrow{XY}$ is a line, $\\overrightarrow{XY}$ is a ray, and $XY$ represents the length of the segment.',
      hint: 'Look for the symbol without any arrows.',
      difficulty: 'hard',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'A geometric entity with zero dimensions is a:',
      options: ['Point', 'Line', 'Plane', 'Space'],
      correctAnswer: 0,
      explanation: 'A point has no length, width, or depth.',
    },
    {
      id: 'q2',
      question: 'Which of the following extends infinitely in two directions?',
      options: ['Ray', 'Line Segment', 'Line', 'Angle'],
      correctAnswer: 2,
      explanation: 'A line has no endpoints and goes on forever in both directions.',
    },
    {
      id: 'q3',
      question: 'What do two intersecting lines form?',
      options: ['A point', 'A line', 'A plane', 'A space'],
      correctAnswer: 0,
      explanation: 'Two lines intersect at exactly one point.',
    },
    {
      id: 'q4',
      question: 'Points that lie on the same plane are called:',
      options: ['Collinear', 'Coplanar', 'Concurrent', 'Parallel'],
      correctAnswer: 1,
      explanation: 'Coplanar points are points in the same plane.',
    },
    {
      id: 'q5',
      question: 'The shared endpoint of two rays forming an angle is called the:',
      options: ['Node', 'Origin', 'Intersection', 'Vertex'],
      correctAnswer: 3,
      explanation: 'The common endpoint of an angle is known as its vertex.',
    }
  ]
};
