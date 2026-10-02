export const moduleData = {
  id: 'volume-surface',
  title: 'Module 8: Volume and Surface Area',
  description: 'Explore the 3D world by calculating the volume and surface area of solid figures.',
  category: 'volume-surface',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Prisms and Cubes',
      content: `
        <h3>Understanding Prisms</h3>
        <p>A <strong>prism</strong> is a 3D solid with two identical, parallel bases. The other faces are parallelograms (or rectangles in a right prism). The shape of the base gives the prism its name (e.g., rectangular prism, triangular prism).</p>
        
        <h4>Volume</h4>
        <p>The volume $V$ of any prism is the area of its base $B$ multiplied by its height $h$:</p>
        <p>$$ V = B \\times h $$</p>
        <p>For a rectangular prism, the base area is $l \\times w$, so $V = l \\times w \\times h$.</p>
        
        <h4>Surface Area</h4>
        <p>The surface area (SA) is the sum of the areas of all its faces. For a rectangular prism:</p>
        <p>$$ SA = 2(lw + lh + wh) $$</p>
        
        <h4>Cube</h4>
        <p>A cube is a special rectangular prism where all edges have the same length $s$.</p>
        <p>Volume: $V = s^3$<br>Surface Area: $SA = 6s^2$</p>
      `,
      keyTakeaways: [
        'Volume of a prism is the base area times the height: $V = Bh$.',
        'Surface area is the sum of the areas of all the outer faces.'
      ]
    },
    {
      id: 'lesson-2',
      title: 'Cylinders',
      content: `
        <h3>Properties of Cylinders</h3>
        <p>A <strong>cylinder</strong> is similar to a prism, but its bases are circles rather than polygons. Think of a soup can.</p>
        
        <h4>Volume</h4>
        <p>Just like a prism, the volume is the area of the base times the height. Since the base is a circle with area $\\pi r^2$:</p>
        <p>$$ V = \\pi r^2 h $$</p>
        
        <h4>Surface Area</h4>
        <p>To find the surface area, imagine cutting the cylinder open and unrolling it. You get two circles (the top and bottom bases) and a rectangle (the side surface). The width of the rectangle is the height $h$, and the length is the circumference of the base $2\\pi r$.</p>
        <p>Lateral Area: $2\\pi r h$<br>
        Total Surface Area: $SA = 2\\pi r^2 + 2\\pi r h$</p>
      `,
      keyTakeaways: [
        'Volume of a cylinder is $V = \\pi r^2 h$.',
        'Unrolling the lateral surface of a cylinder forms a rectangle.'
      ]
    },
    {
      id: 'lesson-3',
      title: 'Pyramids and Cones',
      content: `
        <h3>Shapes that Taper to a Point</h3>
        <p><strong>Pyramids</strong> have a polygonal base and triangular faces that meet at a common vertex (the apex). <strong>Cones</strong> are similar, but have a circular base.</p>
        
        <h4>Volume</h4>
        <p>A remarkable geometric fact is that the volume of a pyramid or cone is exactly one-third the volume of a prism or cylinder with the same base and height.</p>
        <p>Pyramid: $V = \\frac{1}{3} B h$<br>
        Cone: $V = \\frac{1}{3} \\pi r^2 h$</p>
        
        <h4>Surface Area of a Cone</h4>
        <p>The surface area of a cone requires knowing its slant height, $l$. Using the Pythagorean theorem, $l = \\sqrt{r^2 + h^2}$.</p>
        <p>Lateral Area: $\\pi r l$<br>
        Total Surface Area: $SA = \\pi r^2 + \\pi r l$</p>
      `,
      keyTakeaways: [
        'Pyramids and cones have $\\frac{1}{3}$ the volume of their corresponding prism/cylinder.',
        'Slant height ($l$) is needed to calculate the surface area of a cone.'
      ]
    },
    {
      id: 'lesson-4',
      title: 'Spheres',
      content: `
        <h3>The Perfectly Symmetrical Solid</h3>
        <p>A <strong>sphere</strong> is a 3D solid where every point on the surface is an equal distance $r$ from the center.</p>
        
        <h4>Volume</h4>
        <p>The formula for the volume of a sphere was famously discovered by Archimedes:</p>
        <p>$$ V = \\frac{4}{3} \\pi r^3 $$</p>
        
        <h4>Surface Area</h4>
        <p>Archimedes also discovered that the surface area of a sphere is equal to the lateral surface area of the smallest cylinder that can contain it.</p>
        <p>$$ SA = 4 \\pi r^2 $$</p>
      `,
      keyTakeaways: [
        'Volume of a sphere is $V = \\frac{4}{3} \\pi r^3$.',
        'Surface area of a sphere is exactly four times the area of its great circle ($SA = 4\\pi r^2$).'
      ]
    },
    {
      id: 'lesson-5',
      title: 'Composite 3D Shapes',
      content: `
        <h3>Combining Solids</h3>
        <p>Real-world objects are often made by combining simple 3D shapes. These are called <strong>composite solids</strong>.</p>
        <p>To find the <strong>volume</strong> of a composite solid, simply add (or subtract) the volumes of the individual parts. For instance, a silo is a cylinder with a hemisphere (half-sphere) on top.</p>
        <p>$$ V_{\\text{silo}} = V_{\\text{cylinder}} + V_{\\text{hemisphere}} $$</p>
        <p>Finding the <strong>surface area</strong> requires more care. You must only calculate the area of the faces that are exposed on the outside. Surfaces where the two shapes are glued together are hidden and must NOT be included in the total surface area.</p>
      `,
      keyTakeaways: [
        'Add component volumes to find total volume.',
        'For surface area, only include exterior faces. Do not count overlapping faces.'
      ]
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'What is the volume of a rectangular prism with length 5, width 4, and height 3?',
      options: ['30', '60', '94', '120'],
      correctAnswer: 1,
      explanation: 'Volume $V = l \\times w \\times h = 5 \\times 4 \\times 3 = 60$.',
      hint: 'Multiply the length, width, and height.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'Find the surface area of a cube with a side length of 4 cm.',
      options: ['16 cm$^2$', '64 cm$^2$', '96 cm$^2$', '128 cm$^2$'],
      correctAnswer: 2,
      explanation: 'A cube has 6 identical square faces. Area of one face $= 4^2 = 16$. Total SA $= 6 \\times 16 = 96$ cm$^2$.',
      hint: 'Calculate the area of one face and multiply by 6.',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'A cylinder has a radius of 3 m and a height of 10 m. What is its volume?',
      options: ['$30\\pi$ m$^3$', '$60\\pi$ m$^3$', '$90\\pi$ m$^3$', '$180\\pi$ m$^3$'],
      correctAnswer: 2,
      explanation: 'Volume $V = \\pi r^2 h = \\pi (3)^2 (10) = 90\\pi$ m$^3$.',
      hint: 'Use the cylinder volume formula $V = \\pi r^2 h$.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'What is the volume of a cone with radius 6 and height 8?',
      options: ['$32\\pi$', '$96\\pi$', '$144\\pi$', '$288\\pi$'],
      correctAnswer: 1,
      explanation: 'Volume $V = \\frac{1}{3}\\pi r^2 h = \\frac{1}{3}\\pi (6)^2 (8) = \\frac{1}{3}\\pi (36)(8) = 12 \\times 8\\pi = 96\\pi$.',
      hint: 'The volume of a cone is one-third the volume of a cylinder.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Calculate the surface area of a sphere with a radius of 5 units.',
      options: ['$20\\pi$', '$25\\pi$', '$100\\pi$', '$500\\pi$'],
      correctAnswer: 2,
      explanation: 'Surface Area $SA = 4\\pi r^2 = 4\\pi (5)^2 = 4\\pi (25) = 100\\pi$.',
      hint: 'Use the sphere surface area formula $SA = 4\\pi r^2$.',
      difficulty: 'medium'
    },
    {
      id: 'p6',
      question: 'A square pyramid has a base area of 36 square units and a height of 10 units. What is its volume?',
      options: ['120', '180', '360', '720'],
      correctAnswer: 0,
      explanation: 'Volume $V = \\frac{1}{3}Bh = \\frac{1}{3}(36)(10) = 12 \\times 10 = 120$.',
      hint: 'Multiply the base area by the height, and divide by 3.',
      difficulty: 'medium'
    },
    {
      id: 'p7',
      question: 'If the volume of a sphere is $36\\pi$, what is its radius?',
      options: ['2', '3', '4', '6'],
      correctAnswer: 1,
      explanation: 'Volume $V = \\frac{4}{3}\\pi r^3 = 36\\pi$. Divide by $\\pi$: $\\frac{4}{3}r^3 = 36$. Multiply by $\\frac{3}{4}$: $r^3 = 27$. So $r = 3$.',
      hint: 'Set the sphere volume formula equal to $36\\pi$ and solve for $r$.',
      difficulty: 'hard'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Which of the following describes the shape of the lateral surface of a cylinder when unrolled?',
      options: ['Circle', 'Rectangle', 'Triangle', 'Trapezoid'],
      correctAnswer: 1,
      explanation: 'Unrolling a cylinder produces a flat rectangle whose length is the circumference of the base.'
    },
    {
      id: 'q2',
      question: 'If you double the radius of a cylinder while keeping the height the same, what happens to its volume?',
      options: ['It doubles', 'It triples', 'It quadruples', 'It becomes 8 times larger'],
      correctAnswer: 2,
      explanation: 'Volume $V = \\pi r^2 h$. Since the radius is squared, doubling $r$ multiplies the volume by $2^2 = 4$.'
    },
    {
      id: 'q3',
      question: 'A prism and a pyramid have identical bases and identical heights. What is the ratio of the volume of the pyramid to the volume of the prism?',
      options: ['1:2', '1:3', '2:3', '1:4'],
      correctAnswer: 1,
      explanation: 'The volume of a pyramid is exactly one-third the volume of a prism with the same base and height.'
    },
    {
      id: 'q4',
      question: 'Which 3D shape has the maximum volume for a given surface area?',
      options: ['Cube', 'Cylinder', 'Cone', 'Sphere'],
      correctAnswer: 3,
      explanation: 'A sphere is the most efficient shape in geometry, enclosing the maximum possible volume for a given amount of surface area (which is why bubbles are spherical).'
    },
    {
      id: 'q5',
      question: 'What is the volume of a hemisphere with radius $r$?',
      options: ['$\\frac{1}{3}\\pi r^3$', '$\\frac{2}{3}\\pi r^3$', '$\\frac{4}{3}\\pi r^3$', '$\\pi r^3$'],
      correctAnswer: 1,
      explanation: 'A hemisphere is half of a sphere. Half of $\\frac{4}{3}\\pi r^3$ is $\\frac{2}{3}\\pi r^3$.'
    }
  ]
};
