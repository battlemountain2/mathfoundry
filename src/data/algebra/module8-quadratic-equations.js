export const moduleData = {
  id: 'quadratic-equations',
  title: 'Quadratic Equations & Projectile Trajectories',
  description: 'Learn how to solve quadratics and understand their pivotal role in describing parabolic motion and optimization problems in engineering.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-1',
      title: 'The Nature of Parabolas',
      content: `
        <h3>U-shaped Curves</h3>
        <p>A quadratic equation is a second-degree polynomial, usually written in standard form: $ax^2 + bx + c = 0$.</p>
        <p>Its graph is a parabola. If $a$ is positive, it opens upward. If $a$ is negative, it opens downward.</p>
        <p>The <strong>roots</strong> (or zeros) of the quadratic equation are the x-intercepts of the parabola—the points where the curve crosses the x-axis.</p>
      `,
      keyTakeaways: [
        'Standard form: $ax^2 + bx + c = 0$',
        'Graph is a parabola. Roots are x-intercepts.'
      ],
    },
    {
      id: 'lesson-2',
      title: 'Solving by Factoring',
      content: `
        <h3>The Zero Product Property</h3>
        <p>If we can factor the quadratic into something like $(x - m)(x - n) = 0$, we can use the <strong>Zero Product Property</strong>. If the product of two things is zero, at least one of them must be zero.</p>
        <p>So, we set each factor to zero: $x - m = 0 \\implies x = m$ and $x - n = 0 \\implies x = n$.</p>
        <p>Example: $x^2 - 5x + 6 = 0 \\implies (x-2)(x-3) = 0$. The roots are $x=2$ and $x=3$.</p>
      `,
      keyTakeaways: [
        'Factor the quadratic, then set each factor equal to zero.',
        'Zero Product Property is key to solving by factoring.'
      ],
    },
    {
      id: 'lesson-3',
      title: 'The Quadratic Formula',
      content: `
        <h3>The Universal Tool</h3>
        <p>Not all quadratics can be factored easily. The quadratic formula works for <em>every</em> quadratic equation.</p>
        <p>$$ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} $$</p>
        <p>The $\\pm$ symbol gives us two possible solutions: one by adding the square root, and one by subtracting it.</p>
      `,
      keyTakeaways: [
        'Memorize: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
        'Works for every quadratic, even if it has complex roots.'
      ],
    },
    {
      id: 'lesson-4',
      title: 'The Discriminant',
      content: `
        <h3>Predicting the Roots</h3>
        <p>The expression under the square root, $b^2 - 4ac$, is called the <strong>discriminant</strong>. It tells us the nature of the roots without fully solving.</p>
        <ul>
          <li>If $b^2 - 4ac > 0$: Two distinct real roots (crosses x-axis twice).</li>
          <li>If $b^2 - 4ac = 0$: One repeated real root (touches x-axis at vertex).</li>
          <li>If $b^2 - 4ac < 0$: Two complex roots (never crosses x-axis).</li>
        </ul>
      `,
      keyTakeaways: [
        'Discriminant $\\Delta = b^2 - 4ac$',
        'Predicts number and type of solutions.'
      ],
    },
    {
      id: 'lesson-5',
      title: 'Engineering Trajectories & Optimization',
      content: `
        <h3>Projectiles and Max/Min</h3>
        <p>In physics and engineering, the trajectory of any object in free fall (like a rocket or thrown ball) traces a parabola, modeled by $h(t) = -\\frac{1}{2}gt^2 + v_0 t + h_0$.</p>
        <p>To find when it hits the ground, we set $h(t) = 0$ and use the quadratic formula.</p>
        <p>To find the maximum height, we find the <strong>vertex</strong> of the parabola, which occurs at $t = -\\frac{b}{2a}$.</p>
      `,
      keyTakeaways: [
        'Projectile motion is governed by quadratic equations.',
        'The vertex $x = -\\frac{b}{2a}$ gives the max or min value.'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Solve by factoring: $x^2 - 9x + 20 = 0$',
      options: ['$x=4, x=5$', '$x=-4, x=-5$', '$x=2, x=10$', '$x=-2, x=-10$'],
      correctAnswer: 0,
      explanation: 'Factors to $(x-4)(x-5) = 0$. By Zero Product Property, $x=4$ or $x=5$.',
      hint: 'Find numbers that multiply to 20 and add to -9.',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'Find the discriminant of $2x^2 + 5x - 3 = 0$',
      options: ['$49$', '$1$', '$-1$', '$25$'],
      correctAnswer: 0,
      explanation: '$\\\\Delta = b^2 - 4ac = (5)^2 - 4(2)(-3) = 25 - (-24) = 49$.',
      hint: 'Use $b^2 - 4ac$.',
      difficulty: 'medium',
    },
    {
      id: 'p3',
      question: 'Solve $x^2 - 6x + 9 = 0$',
      options: ['$x=3$', '$x=-3$', '$x=3, x=-3$', '$x=9$'],
      correctAnswer: 0,
      explanation: 'Factors to $(x-3)^2 = 0$. Since it\'s a perfect square, there is one repeated root at $x=3$.',
      hint: 'This is a perfect square trinomial.',
      difficulty: 'easy',
    },
    {
      id: 'p4',
      question: 'A rocket\'s height is given by $h(t) = -16t^2 + 64t$. At what time $t$ does it reach its maximum height?',
      options: ['$2$ seconds', '$4$ seconds', '$8$ seconds', '$1$ second'],
      correctAnswer: 0,
      explanation: 'Max height occurs at the vertex: $t = -\\frac{b}{2a} = -\\frac{64}{2(-16)} = \\frac{-64}{-32} = 2$.',
      hint: 'The x-coordinate of the vertex is $-b / (2a)$.',
      difficulty: 'hard',
    },
    {
      id: 'p5',
      question: 'How many real roots does $x^2 + 2x + 5 = 0$ have?',
      options: ['$0$', '$1$', '$2$', 'Infinitely many'],
      correctAnswer: 0,
      explanation: 'Calculate discriminant: $2^2 - 4(1)(5) = 4 - 20 = -16$. Since it\'s negative, there are 0 real roots (2 complex roots).',
      hint: 'Check the sign of $b^2 - 4ac$.',
      difficulty: 'medium',
    },
    {
      id: 'p6',
      question: 'Solve using the quadratic formula: $x^2 - 4x - 5 = 0$',
      options: ['$x=5, x=-1$', '$x=-5, x=1$', '$x=4, x=1$', '$x=-4, x=-1$'],
      correctAnswer: 0,
      explanation: '$x = \\frac{-(-4) \\pm \\sqrt{(-4)^2 - 4(1)(-5)}}{2(1)} = \\frac{4 \\pm \\sqrt{16 + 20}}{2} = \\frac{4 \\pm 6}{2}$. This gives $\\frac{10}{2}=5$ and $\\frac{-2}{2}=-1$.',
      hint: 'Apply $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$',
      difficulty: 'medium',
    },
    {
      id: 'p7',
      question: 'If $x^2 = 36$, what is x?',
      options: ['$x=6$', '$x=-6$', '$x=6, x=-6$', '$x=18$'],
      correctAnswer: 2,
      explanation: 'Taking the square root of both sides gives $x = \\pm \\sqrt{36}$, so $x = 6$ or $x = -6$.',
      hint: 'Don\'t forget the plus or minus when taking a square root!',
      difficulty: 'easy',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'What is the sum of the roots of the equation $ax^2 + bx + c = 0$?',
      options: ['$-\\frac{b}{a}$', '$\\frac{c}{a}$', '$\\frac{b}{a}$', '$b^2 - 4ac$'],
      correctAnswer: 0,
      explanation: 'By Vieta\'s formulas, the sum of the roots is $-\\frac{b}{a}$.',
    },
    {
      id: 'q2',
      question: 'If the discriminant is exactly 0, what does the parabola look like?',
      options: ['It never touches the x-axis', 'It crosses the x-axis twice', 'Its vertex is exactly on the x-axis', 'It is a straight line'],
      correctAnswer: 2,
      explanation: 'A discriminant of 0 means one repeated root, so the parabola just kisses the x-axis at its vertex.',
    },
    {
      id: 'q3',
      question: 'Solve $2x^2 = 8$',
      options: ['$x=2, x=-2$', '$x=4$', '$x=4, x=-4$', '$x=2$'],
      correctAnswer: 0,
      explanation: 'Divide by 2: $x^2 = 4$. Square root both sides: $x = \\pm 2$.',
    },
    {
      id: 'q4',
      question: 'What is the y-intercept of the parabola $y = 3x^2 - 7x + 4$?',
      options: ['$(0, 3)$', '$(0, -7)$', '$(0, 4)$', '$(4, 0)$'],
      correctAnswer: 2,
      explanation: 'Set x=0 to find the y-intercept: $y = 3(0)^2 - 7(0) + 4 = 4$.',
    },
    {
      id: 'q5',
      question: 'In projectile motion $h(t) = -16t^2 + v_0 t + h_0$, what does $h_0$ represent?',
      options: ['Initial velocity', 'Maximum height', 'Initial height', 'Time to hit ground'],
      correctAnswer: 2,
      explanation: '$h_0$ is the height at $t=0$, which is the initial height.',
    }
  ],
};
export default moduleData;
