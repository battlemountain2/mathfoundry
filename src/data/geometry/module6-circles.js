export const moduleData = {
  id: 'circles',
  title: 'Module 6: Circles',
  description: 'Understand the properties, circumference, area, and segments of circles.',
  category: 'circles',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Circle Basics',
      content: `
        <h3>Elements of a Circle</h3>
        <p>A circle is the set of all points in a plane that are at a given distance (the <strong>radius</strong>, $r$) from a given point (the center).</p>
        
        <ul>
          <li><strong>Radius ($r$):</strong> A line segment from the center of the circle to any point on its circumference.</li>
          <li><strong>Diameter ($d$):</strong> A line segment passing through the center of the circle and whose endpoints lie on the circle. It is twice the length of the radius: $d = 2r$.</li>
          <li><strong>Chord:</strong> A line segment whose endpoints lie on the circle. The diameter is the longest chord of a circle.</li>
          <li><strong>Secant:</strong> A line that intersects a circle at two points.</li>
          <li><strong>Tangent:</strong> A line that touches the circle at exactly one point, never entering the circle's interior. A tangent is always perpendicular to the radius at the point of tangency.</li>
        </ul>
      `,
      keyTakeaways: [
        'The diameter is exactly twice the length of the radius.',
        'A tangent line is perpendicular to the radius at the point of contact.'
      ]
    },
    {
      id: 'lesson-2',
      title: 'Circumference',
      content: `
        <h3>Perimeter of a Circle</h3>
        <p>The distance around a circle is called its <strong>circumference</strong> ($C$). In ancient times, mathematicians discovered that the ratio of a circle's circumference to its diameter is a constant for all circles. This constant is denoted by the Greek letter $\\pi$ (pi).</p>
        <p>$$ \\pi = \\frac{C}{d} \\approx 3.14159... $$</p>
        <p>From this definition, we can derive the formula for circumference:</p>
        <p>$$ C = \\pi d $$</p>
        <p>Or, in terms of the radius:</p>
        <p>$$ C = 2 \\pi r $$</p>
        <p>Engineers use this concept extensively when dealing with rotational systems, such as calculating the speed of a car given the tire's rotational velocity and radius.</p>
      `,
      keyTakeaways: [
        '$\\pi$ is the ratio of circumference to diameter.',
        'Circumference formulas: $C = \\pi d$ or $C = 2\\pi r$.'
      ]
    },
    {
      id: 'lesson-3',
      title: 'Area of Circles',
      content: `
        <h3>Calculating the Enclosed Area</h3>
        <p>The area of a circle is the space enclosed within its circumference. The formula for the area $A$ of a circle is:</p>
        <p>$$ A = \\pi r^2 $$</p>
        <p>To understand why this is true, imagine slicing a circle into many small, equal-sized sectors (like a pie). If you arrange these sectors alternately pointing up and down, they form a shape that resembles a parallelogram. The height of this parallelogram is approximately the radius $r$, and the base is approximately half the circumference, $\\pi r$. The area of this parallelogram is base times height, which gives $(\\pi r) \\times r = \\pi r^2$.</p>
      `,
      keyTakeaways: [
        'The area of a circle is calculated using the formula $A = \\pi r^2$.'
      ]
    },
    {
      id: 'lesson-4',
      title: 'Arcs and Central Angles',
      content: `
        <h3>Measuring Parts of a Circle</h3>
        <p>A <strong>central angle</strong> is an angle whose vertex is at the center of the circle. Its sides contain two radii of the circle.</p>
        <p>An <strong>arc</strong> is a portion of the circumference. The measure of an arc (in degrees) is equal to the measure of its corresponding central angle.</p>
        <p>The length of an arc $s$ is a fraction of the total circumference, determined by the central angle $\\theta$ (in degrees):</p>
        <p>$$ s = \\frac{\\theta}{360^\\circ} \\times 2 \\pi r $$</p>
        <p>If the angle $\\theta$ is measured in radians, the formula simplifies to:</p>
        <p>$$ s = r \\theta $$</p>
      `,
      keyTakeaways: [
        'An arc measure corresponds to its central angle.',
        'Arc length formula: $s = \\frac{\\theta}{360} \times 2\\pi r$.'
      ]
    },
    {
      id: 'lesson-5',
      title: 'Sectors and Segments',
      content: `
        <h3>Areas of Circle Sections</h3>
        <h4>Sector of a Circle</h4>
        <p>A <strong>sector</strong> is the region bounded by two radii and an arc (like a slice of pizza). The area of a sector is a fraction of the total circle's area, proportional to its central angle $\\theta$:</p>
        <p>$$ A_{\\text{sector}} = \\frac{\\theta}{360^\\circ} \\times \\pi r^2 $$</p>
        
        <h4>Segment of a Circle</h4>
        <p>A <strong>segment</strong> is the region bounded by a chord and an arc. To find the area of a segment, you find the area of the sector and subtract the area of the triangle formed by the two radii and the chord.</p>
        <p>$$ A_{\\text{segment}} = A_{\\text{sector}} - A_{\\text{triangle}} $$</p>
      `,
      keyTakeaways: [
        'Sector area is a fraction of the total area, $A = \\frac{\\theta}{360} \\pi r^2$.',
        'Segment area is found by subtracting a triangle area from a sector area.'
      ]
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'A circle has a diameter of $14$ cm. What is its circumference? (Use $\\pi \\approx \\frac{22}{7}$)',
      options: ['22 cm', '44 cm', '88 cm', '154 cm'],
      correctAnswer: 1,
      explanation: 'Use $C = \\pi d$. $C = \\frac{22}{7} \\times 14 = 22 \\times 2 = 44$ cm.',
      hint: 'The formula for circumference is $C = \\pi d$.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'Find the area of a circle with a radius of $10$ m.',
      options: ['$10\\pi$ m$^2$', '$20\\pi$ m$^2$', '$50\\pi$ m$^2$', '$100\\pi$ m$^2$'],
      correctAnswer: 3,
      explanation: 'Area $A = \\pi r^2$. For $r=10$, $A = \\pi (10)^2 = 100\\pi$ m$^2$.',
      hint: 'Plug the radius into the area formula $A = \\pi r^2$.',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'The circumference of a circle is $18\\pi$. What is its area?',
      options: ['$18\\pi$', '$36\\pi$', '$81\\pi$', '$324\\pi$'],
      correctAnswer: 2,
      explanation: 'From $C = 2\\pi r = 18\\pi$, we find $r = 9$. Then $A = \\pi r^2 = \\pi (9)^2 = 81\\pi$.',
      hint: 'First find the radius from the circumference, then calculate the area.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'An arc of a circle with radius $12$ subtends a central angle of $60^\\circ$. What is the arc length?',
      options: ['$2\\pi$', '$4\\pi$', '$6\\pi$', '$12\\pi$'],
      correctAnswer: 1,
      explanation: 'Arc length $s = \\frac{60}{360} \\times 2\\pi(12) = \\frac{1}{6} \\times 24\\pi = 4\\pi$.',
      hint: 'Use the arc length formula: $s = \\frac{\\theta}{360} \\times 2\\pi r$.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'What is the area of a sector with a central angle of $90^\\circ$ and a radius of $8$?',
      options: ['$16\\pi$', '$32\\pi$', '$64\\pi$', '$128\\pi$'],
      correctAnswer: 0,
      explanation: 'Sector area = $\\frac{90}{360} \\times \\pi (8)^2 = \\frac{1}{4} \\times 64\\pi = 16\\pi$.',
      hint: 'A $90^\\circ$ sector is exactly one-quarter of the circle.',
      difficulty: 'medium'
    },
    {
      id: 'p6',
      question: 'A car tire has a radius of $0.4$ meters. How far does the car travel in $10$ full revolutions of the tire?',
      options: ['$4\\pi$ m', '$8\\pi$ m', '$16\\pi$ m', '$32\\pi$ m'],
      correctAnswer: 1,
      explanation: 'One revolution is the circumference $C = 2\\pi(0.4) = 0.8\\pi$ meters. For 10 revolutions, distance = $10 \\times 0.8\\pi = 8\\pi$ meters.',
      hint: 'The distance covered in one revolution equals the circumference of the tire.',
      difficulty: 'hard'
    },
    {
      id: 'p7',
      question: 'In a circle of radius $5$, the area of a sector is $10\\pi$. What is the central angle in degrees?',
      options: ['$72^\\circ$', '$90^\\circ$', '$120^\\circ$', '$144^\\circ$'],
      correctAnswer: 3,
      explanation: 'Area $= \\frac{\\theta}{360} \\times \\pi(5)^2$. So $10\\pi = \\frac{\\theta}{360} \\times 25\\pi$. Dividing by $25\\pi$ gives $\\frac{10}{25} = \\frac{\\theta}{360}$, so $\\theta = 360 \\times \\frac{2}{5} = 144^\\circ$.',
      hint: 'Set the sector area formula equal to $10\\pi$ and solve for $\\theta$.',
      difficulty: 'hard'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Which of the following is the longest chord in a circle?',
      options: ['Radius', 'Secant', 'Diameter', 'Tangent'],
      correctAnswer: 2,
      explanation: 'The diameter passes through the center of the circle, making it the longest possible chord.'
    },
    {
      id: 'q2',
      question: 'If the area of a circle is numerically equal to its circumference, what is its radius?',
      options: ['1', '2', '$\\pi$', '$2\\pi$'],
      correctAnswer: 1,
      explanation: 'Set $A = C$, so $\\pi r^2 = 2\\pi r$. Assuming $r > 0$, divide by $\\pi r$ to get $r = 2$.'
    },
    {
      id: 'q3',
      question: 'A line that intersects a circle at exactly one point is called a:',
      options: ['Chord', 'Secant', 'Tangent', 'Diameter'],
      correctAnswer: 2,
      explanation: 'A tangent line touches the circle at a single point of tangency.'
    },
    {
      id: 'q4',
      question: 'What happens to the area of a circle if its radius is doubled?',
      options: ['It is doubled', 'It is tripled', 'It is quadrupled', 'It is halved'],
      correctAnswer: 2,
      explanation: 'Since area is proportional to the square of the radius ($A = \\pi r^2$), doubling $r$ gives $\\pi (2r)^2 = 4\\pi r^2$, which is four times the original area.'
    },
    {
      id: 'q5',
      question: 'What is the measure of the arc subtended by a central angle of $1$ radian in a circle of radius $r$?',
      options: ['$r$', '$r^2$', '$\\pi r$', '$2\\pi r$'],
      correctAnswer: 0,
      explanation: 'Arc length $s = r\\theta$. If $\\theta = 1$ radian, then $s = r(1) = r$.'
    }
  ]
};
