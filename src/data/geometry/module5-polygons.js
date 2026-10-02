export const moduleData = {
  id: 'polygons',
  title: 'Module 5: Polygons',
  description: 'Learn about the properties, angles, and areas of polygons.',
  category: 'polygons',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Quadrilateral Types',
      content: `
        <h3>Understanding Quadrilaterals</h3>
        <p>A quadrilateral is a polygon with four edges and four vertices. The sum of the interior angles of a simple quadrilateral is always $360^\\circ$. Let's examine the special types of quadrilaterals based on their properties.</p>
        
        <h4>Parallelogram</h4>
        <p>A parallelogram has opposite sides that are parallel and equal in length. Opposite angles are also equal.</p>
        <p>Area: $A = b \\times h$ (where $b$ is base and $h$ is height)</p>
        
        <h4>Rectangle</h4>
        <p>A rectangle is a parallelogram with four right angles ($90^\\circ$). The diagonals are equal in length and bisect each other.</p>
        <p>Area: $A = l \\times w$</p>
        
        <h4>Rhombus</h4>
        <p>A rhombus is a parallelogram with all four sides equal in length. The diagonals bisect each other at right angles ($90^\\circ$).</p>
        <p>Area: $A = \\frac{1}{2} d_1 d_2$ (where $d_1$ and $d_2$ are the lengths of the diagonals)</p>
        
        <h4>Square</h4>
        <p>A square is both a rectangle (four right angles) and a rhombus (four equal sides). It is a regular quadrilateral.</p>
        <p>Area: $A = s^2$</p>

        <h4>Trapezoid</h4>
        <p>A trapezoid (or trapezium) has at least one pair of parallel sides. The parallel sides are called bases.</p>
        <p>Area: $A = \\frac{a+b}{2} h$ (where $a$ and $b$ are bases, and $h$ is height)</p>
      `,
      keyTakeaways: [
        'A parallelogram has parallel and equal opposite sides.',
        'A square is a special type of rectangle and rhombus.',
        'The interior angles of any simple quadrilateral sum to 360 degrees.'
      ]
    },
    {
      id: 'lesson-2',
      title: 'Regular Polygons',
      content: `
        <h3>What is a Regular Polygon?</h3>
        <p>A polygon is a closed two-dimensional shape formed by straight line segments. A <strong>regular polygon</strong> is both equilateral (all sides are equal in length) and equiangular (all interior angles are equal in measure).</p>
        <p>Common examples include the equilateral triangle (3 sides) and the square (4 sides). A regular pentagon has 5 equal sides, and a regular hexagon has 6.</p>
        <p>Engineers often use regular hexagons in structural design (like honeycomb structures) because they tile the plane perfectly and provide maximum strength-to-weight ratio.</p>
      `,
      keyTakeaways: [
        'Regular polygons are both equilateral and equiangular.',
        'An equilateral triangle and a square are regular polygons.'
      ]
    },
    {
      id: 'lesson-3',
      title: 'Interior Angle Sum Formula',
      content: `
        <h3>Calculating the Sum of Interior Angles</h3>
        <p>Any simple polygon with $n$ sides can be divided into $n-2$ triangles using non-intersecting diagonals. For a convex polygon, these diagonals can all be drawn from one vertex; a concave polygon may require diagonals from multiple vertices.</p>
        <p>Since the sum of interior angles of a single triangle is $180^\\circ$, the sum of the interior angles $S$ of an $n$-sided polygon is:</p>
        <p>$$S = (n - 2) \\times 180^\\circ$$</p>
        
        <h4>Measure of a Single Interior Angle</h4>
        <p>If the polygon is regular, all $n$ interior angles are equal. The measure of a single interior angle is:</p>
        <p>$$\\text{Angle} = \\frac{(n - 2) \\times 180^\\circ}{n}$$</p>
        <p>For example, for a regular hexagon ($n = 6$):</p>
        <p>$$\\text{Angle} = \\frac{(6 - 2) \\times 180^\\circ}{6} = \\frac{4 \\times 180^\\circ}{6} = 120^\\circ$$</p>
      `,
      keyTakeaways: [
        'The sum of interior angles is $(n-2) \\times 180^\\circ$.',
        'A single interior angle in a regular polygon is $\\frac{(n-2) \\times 180^\\circ}{n}$.'
      ]
    },
    {
      id: 'lesson-4',
      title: 'Area of Polygons',
      content: `
        <h3>Finding Area of Regular Polygons</h3>
        <p>The area of a regular polygon can be found using the apothem. The <strong>apothem</strong> ($a$) is a line segment from the center to the midpoint of one of its sides. It is also the height of the isosceles triangle formed by the center and two adjacent vertices.</p>
        <p>The formula for the area $A$ of a regular polygon is:</p>
        <p>$$A = \\frac{1}{2} a p$$</p>
        <p>Where $a$ is the apothem and $p$ is the perimeter. This is derived by splitting the polygon into $n$ identical triangles, each with base $s$ (side length) and height $a$. The area of one triangle is $\\frac{1}{2} s a$, and since $p = n \\times s$, the total area is $\\frac{1}{2} a p$.</p>
      `,
      keyTakeaways: [
        'The apothem is the distance from the center to the midpoint of a side.',
        'Area of a regular polygon is $A = \\frac{1}{2} a p$.'
      ]
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'What is the sum of the interior angles of a nonagon (9 sides)?',
      options: ['$1080^\\circ$', '$1260^\\circ$', '$1440^\\circ$', '$1620^\\circ$'],
      correctAnswer: 1,
      explanation: 'Use the formula $S = (n-2) \\times 180^\\circ$. For $n=9$, $S = (9-2) \\times 180^\\circ = 7 \\times 180^\\circ = 1260^\\circ$.',
      hint: 'A nonagon has $n=9$ sides. Apply the angle sum formula.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'Find the measure of a single interior angle in a regular octagon.',
      options: ['$120^\\circ$', '$135^\\circ$', '$140^\\circ$', '$150^\\circ$'],
      correctAnswer: 1,
      explanation: 'Formula: $\\frac{(n-2) \\times 180^\\circ}{n}$. For $n=8$: $\\frac{(8-2) \\times 180^\\circ}{8} = \\frac{6 \\times 180^\\circ}{8} = \\frac{1080^\\circ}{8} = 135^\\circ$.',
      hint: 'First find the total sum of the interior angles, then divide by 8.',
      difficulty: 'medium'
    },
    {
      id: 'p3',
      question: 'A regular polygon has an interior angle sum of $2340^\\circ$. How many sides does it have?',
      options: ['13', '14', '15', '16'],
      correctAnswer: 2,
      explanation: 'Solve $2340 = (n-2) \\times 180$. Dividing by $180$ gives $13 = n-2$. Therefore, $n = 15$.',
      hint: 'Set up the equation $(n-2) \\times 180^\\circ = 2340^\\circ$ and solve for $n$.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'What is the area of a regular hexagon with side length $s=10$ and apothem $a=5\\sqrt{3}$?',
      options: ['$150$', '$150\\sqrt{3}$', '$300$', '$300\\sqrt{3}$'],
      correctAnswer: 1,
      explanation: 'First, find the perimeter: $p = 6 \\times 10 = 60$. Then use the area formula $A = \\frac{1}{2}ap = \\frac{1}{2}(5\\sqrt{3})(60) = 150\\sqrt{3}$.',
      hint: 'Calculate the perimeter first, then use $A = \\frac{1}{2} a p$.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Which of the following is true for all rhombuses?',
      options: ['All angles are $90^\\circ$', 'Diagonals are equal in length', 'Diagonals intersect at $90^\\circ$', 'There are exactly two pairs of equal adjacent sides'],
      correctAnswer: 2,
      explanation: 'In a rhombus, all four sides are equal, and the diagonals always bisect each other at right angles ($90^\\circ$).',
      hint: 'Think about the properties of the diagonals in a rhombus.',
      difficulty: 'easy'
    },
    {
      id: 'p6',
      question: 'A trapezoid has bases of length $8$ and $12$, and an area of $50$. What is its height?',
      options: ['$4$', '$5$', '$6$', '$7$'],
      correctAnswer: 1,
      explanation: 'Using the area formula $A = \\frac{a+b}{2} h$, we have $50 = \\frac{8+12}{2} h = \\frac{20}{2} h = 10h$. Thus, $h = 5$.',
      hint: 'Plug the known values into the area formula for a trapezoid and solve for $h$.',
      difficulty: 'medium'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'What is the sum of the exterior angles of any convex polygon?',
      options: ['$180^\\circ$', '$360^\\circ$', '$(n-2) \\times 180^\\circ$', 'It depends on the number of sides'],
      correctAnswer: 1,
      explanation: 'The sum of the exterior angles (one at each vertex) of any convex polygon is always $360^\\circ$, regardless of the number of sides.'
    },
    {
      id: 'q2',
      question: 'Which quadrilateral always has diagonals that bisect each other?',
      options: ['Trapezoid', 'Kite', 'Parallelogram', 'Isosceles Trapezoid'],
      correctAnswer: 2,
      explanation: 'By definition, the diagonals of a parallelogram bisect each other. A rectangle, rhombus, and square are types of parallelograms and share this property.'
    },
    {
      id: 'q3',
      question: 'What is the measure of each interior angle of a regular dodecagon (12 sides)?',
      options: ['$144^\\circ$', '$150^\\circ$', '$160^\\circ$', '$165^\\circ$'],
      correctAnswer: 1,
      explanation: 'Angle = $\\frac{(12-2) \\times 180^\\circ}{12} = \\frac{10 \\times 180^\\circ}{12} = \\frac{1800^\\circ}{12} = 150^\\circ$.'
    },
    {
      id: 'q4',
      question: 'A square has a diagonal of length $d$. What is its area?',
      options: ['$d^2$', '$\\frac{d^2}{2}$', '$2d^2$', '$\\frac{d^2}{4}$'],
      correctAnswer: 1,
      explanation: 'A square is a rhombus, so its area is $\\frac{1}{2}d_1 d_2$. Since $d_1 = d_2 = d$, the area is $\\frac{1}{2} d^2 = \\frac{d^2}{2}$.'
    },
    {
      id: 'q5',
      question: 'If the measure of an interior angle of a regular polygon is $144^\\circ$, how many sides does it have?',
      options: ['8', '10', '12', '14'],
      correctAnswer: 1,
      explanation: 'The exterior angle is $180^\\circ - 144^\\circ = 36^\\circ$. The number of sides $n = \\frac{360^\\circ}{36^\\circ} = 10$.'
    }
  ]
};
