export const moduleData = {
  id: 'area-perimeter',
  title: 'Module 7: Area and Perimeter',
  description: 'Master the calculation of area and perimeter for composite and irregular figures.',
  category: 'area-perimeter',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Review of Basic Formulas',
      content: `
        <h3>Fundamental Shapes</h3>
        <p>Before diving into complex figures, let's review the fundamental area and perimeter formulas.</p>
        <ul>
          <li><strong>Rectangle:</strong> Perimeter $P = 2l + 2w$, Area $A = l \\times w$</li>
          <li><strong>Triangle:</strong> Perimeter $P = a + b + c$, Area $A = \\frac{1}{2} b h$</li>
          <li><strong>Circle:</strong> Circumference $C = 2\\pi r$, Area $A = \\pi r^2$</li>
        </ul>
        <p>Remember that perimeter is a one-dimensional measure of distance around a shape, so it has linear units (e.g., cm, inches). Area is a two-dimensional measure of surface space, so it has square units (e.g., cm$^2$, square inches).</p>
      `,
      keyTakeaways: [
        'Perimeter uses linear units.',
        'Area uses square units.'
      ]
    },
    {
      id: 'lesson-2',
      title: 'Composite Figures',
      content: `
        <h3>Breaking Shapes Apart</h3>
        <p>A <strong>composite figure</strong> is a shape made up of two or more basic geometric figures. To find the area of a composite figure, we can decompose (break down) the figure into basic shapes (like rectangles, triangles, and semicircles), calculate their individual areas, and then add them together.</p>
        <p>For example, a house shape can be decomposed into a triangle (the roof) and a rectangle (the body).</p>
        <p>$$ A_{\\text{total}} = A_{\\text{triangle}} + A_{\\text{rectangle}} $$</p>
        <p>Conversely, sometimes it's easier to find the area of a larger basic shape and subtract the missing pieces (the "cut-out" method).</p>
      `,
      keyTakeaways: [
        'Composite figures are formed from basic shapes.',
        'Add areas to find total area, or subtract areas of cut-outs.'
      ]
    },
    {
      id: 'lesson-3',
      title: 'Irregular Shapes',
      content: `
        <h3>Estimating the Area of Irregular Shapes</h3>
        <p>Real-world objects like lakes or leaves are often irregular shapes that cannot be neatly decomposed into standard geometric figures. In these cases, we use estimation methods.</p>
        <h4>Grid Method</h4>
        <p>Place the shape on a grid and count the number of full squares it completely covers. Then, count the number of partial squares it covers and estimate their combined area (often by assuming two partial squares roughly equal one full square).</p>
        <h4>Trapezoidal Rule (Advanced)</h4>
        <p>In surveying and engineering, the area of irregular plots of land is estimated by dividing the shape into a series of parallel trapezoids.</p>
      `,
      keyTakeaways: [
        'Irregular areas can be estimated using grids.',
        'Engineering often relies on numerical approximations like the trapezoidal rule.'
      ]
    },
    {
      id: 'lesson-4',
      title: 'Real-World Applications',
      content: `
        <h3>Geometry in the Wild</h3>
        <p>Area and perimeter calculations are essential in many professions.</p>
        <ul>
          <li><strong>Architecture and Construction:</strong> Calculating the perimeter of a room to determine the length of baseboard needed, or calculating the floor area to purchase tile or carpet.</li>
          <li><strong>Agriculture:</strong> Determining the perimeter of a field for fencing, and calculating the area for planting seeds or applying fertilizer.</li>
          <li><strong>Manufacturing:</strong> Optimizing how many smaller shapes can be cut from a larger sheet of metal (nesting) to minimize waste.</li>
        </ul>
      `,
      keyTakeaways: [
        'Perimeter is used for boundaries (fencing, trim).',
        'Area is used for surface coverage (paint, flooring, land).'
      ]
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'A rectangular room is $15$ feet long and $12$ feet wide. What is the area of the floor?',
      options: ['54 sq ft', '150 sq ft', '180 sq ft', '225 sq ft'],
      correctAnswer: 2,
      explanation: 'Area $= l \\times w = 15 \\times 12 = 180$ sq ft.',
      hint: 'Multiply the length by the width.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'If you want to put a fence around a square garden with an area of $64$ square meters, how many meters of fencing do you need?',
      options: ['16', '24', '32', '64'],
      correctAnswer: 2,
      explanation: 'Since the area is $64$, the side length is $\\sqrt{64} = 8$ m. The perimeter of the square is $4 \\times 8 = 32$ m.',
      hint: 'Find the side length first from the area, then calculate the perimeter.',
      difficulty: 'medium'
    },
    {
      id: 'p3',
      question: 'A composite figure consists of a rectangle measuring $4$ by $6$ attached to a semicircle on its $4$-unit side. What is the total area? (Use $\\pi \\approx 3$)',
      options: ['24', '30', '36', '48'],
      correctAnswer: 1,
      explanation: 'The rectangle area is $4 \\times 6 = 24$. The semicircle has a diameter of $4$, so its radius is $2$. Its area is $\\frac{1}{2} \\pi r^2 = \\frac{1}{2} (3) (2^2) = 6$. Total area is $24 + 6 = 30$.',
      hint: 'Calculate the area of the rectangle and the semicircle separately, then add them.',
      difficulty: 'hard'
    },
    {
      id: 'p4',
      question: 'A circular swimming pool with a $20$ ft diameter is surrounded by a $5$ ft wide concrete deck. What is the area of the deck?',
      options: ['$100\\pi$', '$125\\pi$', '$225\\pi$', '$400\\pi$'],
      correctAnswer: 1,
      explanation: 'The pool has radius $r=10$. The pool + deck forms a larger circle with radius $R = 10 + 5 = 15$. Deck Area = Area of larger circle - Area of pool = $\\pi(15)^2 - \\pi(10)^2 = 225\\pi - 100\\pi = 125\\pi$.',
      hint: 'Find the area of the larger circle (pool + deck) and subtract the area of the pool.',
      difficulty: 'hard'
    },
    {
      id: 'p5',
      question: 'A triangular piece of fabric has a base of $10$ inches and a height of $8$ inches. What is its area?',
      options: ['20 sq in', '40 sq in', '80 sq in', '100 sq in'],
      correctAnswer: 1,
      explanation: 'Area $= \\frac{1}{2} b h = \\frac{1}{2} (10) (8) = 40$ sq in.',
      hint: 'Use the triangle area formula $A = \\frac{1}{2}bh$.',
      difficulty: 'easy'
    },
    {
      id: 'p6',
      question: 'A rectangular wall measures $10$ m by $4$ m. It has a window measuring $2$ m by $1$ m. What is the area of the wall excluding the window?',
      options: ['36 m$^2$', '38 m$^2$', '40 m$^2$', '42 m$^2$'],
      correctAnswer: 1,
      explanation: 'Total wall area $= 10 \\times 4 = 40$. Window area $= 2 \\times 1 = 2$. Wall area without window $= 40 - 2 = 38$ m$^2$.',
      hint: 'Subtract the area of the window from the total area of the wall.',
      difficulty: 'medium'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'What is the relationship between the perimeter of a square and its side length?',
      options: ['P = s', 'P = 2s', 'P = 4s', 'P = s^2'],
      correctAnswer: 2,
      explanation: 'A square has 4 equal sides, so its perimeter is $P = 4s$.'
    },
    {
      id: 'q2',
      question: 'If two rectangles have the same area, must they have the same perimeter?',
      options: ['Yes, always', 'No, never', 'Only if they are squares', 'Not necessarily'],
      correctAnswer: 3,
      explanation: 'A $2 \\times 6$ rectangle and a $3 \\times 4$ rectangle both have an area of 12, but their perimeters are 16 and 14, respectively.'
    },
    {
      id: 'q3',
      question: 'A room is $4$ m long and $3$ m wide. How many square tiles of side $0.5$ m are needed to cover the floor?',
      options: ['12', '24', '48', '96'],
      correctAnswer: 2,
      explanation: 'Area of room $= 12$ m$^2$. Area of one tile $= 0.5 \\times 0.5 = 0.25$ m$^2$. Number of tiles $= \\frac{12}{0.25} = 48$.'
    },
    {
      id: 'q4',
      question: 'To find the amount of water needed to fill a swimming pool, which measurement is most appropriate?',
      options: ['Perimeter', 'Area', 'Volume', 'Surface Area'],
      correctAnswer: 2,
      explanation: 'Filling the pool requires measuring its 3D capacity, which is volume. Area only measures the 2D surface.'
    },
    {
      id: 'q5',
      question: 'The perimeter of an equilateral triangle is $24$. What is the length of one side?',
      options: ['4', '6', '8', '12'],
      correctAnswer: 2,
      explanation: 'An equilateral triangle has 3 equal sides. $3s = 24$, so $s = 8$.'
    }
  ]
};
