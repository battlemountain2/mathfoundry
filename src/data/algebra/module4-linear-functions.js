export const moduleData = {
  id: 'linear-functions',
  title: 'Slope, Rates of Change & Linear Functions',
  description: 'Understand how variables relate to one another. Learn to calculate and interpret slope as a rate of change—a fundamental concept for analyzing sensor data, modeling constant velocity, and predicting system behavior.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-4-1',
      title: 'The Cartesian Plane & Rate of Change',
      content: `
        <h3>Visualizing Data</h3>
        <p>Engineers don't just solve equations; they model relationships. The Cartesian plane (x-y graph) is our canvas for visualizing how one variable responds to changes in another.</p>
        <p>A <strong>linear function</strong> graphs as a straight line. This means the relationship between the variables has a <em>constant rate of change</em>.</p>
        <p>Imagine tracking a drone's battery voltage over time. If it drops by 0.1V every minute consistently, that relationship is linear. The "rate of change" is the ratio of the change in the dependent variable ($y$, voltage) to the change in the independent variable ($x$, time).</p>
      `,
      keyTakeaways: [
        'A linear function represents a relationship with a constant rate of change.',
        'Graphing equations allows us to visually analyze system behavior.'
      ],
    },
    {
      id: 'lesson-4-2',
      title: 'The Slope Formula',
      content: `
        <h3>Rise over Run</h3>
        <p>In algebra, the rate of change is called <strong>slope</strong>, denoted by the letter $m$. Slope measures the steepness and direction of a line.</p>
        <p>Given any two points on a line, $(x_1, y_1)$ and $(x_2, y_2)$, the slope is calculated as the "Rise" (vertical change) divided by the "Run" (horizontal change):</p>
        <p>$$m = \\frac{\\text{Rise}}{\\text{Run}} = \\frac{y_2 - y_1}{x_2 - x_1}$$</p>
        <ul>
          <li>Positive slope ($m > 0$): Line rises from left to right (e.g., accelerating speed).</li>
          <li>Negative slope ($m < 0$): Line falls from left to right (e.g., depleting fuel).</li>
          <li>Zero slope ($m = 0$): Horizontal line (no change, e.g., steady altitude).</li>
          <li>Undefined slope: Vertical line (impossible in most physical time-series).</li>
        </ul>
      `,
      keyTakeaways: [
        'Slope is the ratio of vertical change to horizontal change.',
        'The slope formula is $m = \\frac{y_2 - y_1}{x_2 - x_1}$.'
      ],
    },
    {
      id: 'lesson-4-3',
      title: 'Slope-Intercept Form',
      content: `
        <h3>$y = mx + b$</h3>
        <p>The most useful way to write a linear equation is in <strong>Slope-Intercept Form</strong>:</p>
        <p>$$y = mx + b$$</p>
        <p>Where:</p>
        <ul>
          <li>$m$ is the slope (the rate of change).</li>
          <li>$b$ is the y-intercept (the starting value when $x = 0$).</li>
        </ul>
        <p><strong>Engineering Context:</strong> A temperature sensor outputs a voltage. If the voltage $V$ relates to temperature $T$ by $V = 0.05T + 1.2$, we immediately know:</p>
        <p>1. At $0^\\circ$C, the sensor outputs 1.2V (the $y$-intercept, $b$).<br>
        2. For every $1^\\circ$C increase, the voltage increases by 0.05V (the slope, $m$).</p>
        <p>This equation lets a microcontroller translate raw voltage back into useful temperature data instantly.</p>
      `,
      keyTakeaways: [
        'Slope-intercept form ($y = mx + b$) clearly displays the rate of change and the initial value.',
        'It is the most intuitive form for modeling real-world linear relationships.'
      ],
    },
    {
      id: 'lesson-4-4',
      title: 'Other Forms: Point-Slope & Standard',
      content: `
        <h3>Different Tools for Different Jobs</h3>
        <p>While $y = mx + b$ is great for graphing, sometimes you are given different starting information.</p>
        <p><strong>Point-Slope Form:</strong> $y - y_1 = m(x - x_1)$<br>
        Use this when you know the slope $m$ and any random point $(x_1, y_1)$ on the line, but you don't know the y-intercept. It's incredibly useful for quick equation building.</p>
        <p><strong>Standard Form:</strong> $Ax + By = C$<br>
        Use this when dealing with constraints and budgets. For example, if aluminum costs \\$5/kg ($x$) and steel costs \\$2/kg ($y$), and you have a budget of \\$100, the equation is $5x + 2y = 100$. Standard form makes it easy to find the x and y intercepts (how much of one material you can buy if you buy zero of the other).</p>
      `,
      keyTakeaways: [
        'Point-Slope form is best for quickly writing an equation from a slope and a single data point.',
        'Standard form is useful for constraint equations and finding intercepts.'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Find the slope of the line passing through the points $(2, 3)$ and $(5, 9)$.',
      options: ['2', '$\\frac{1}{2}$', '6', '$\\frac{1}{3}$'],
      correctAnswer: 0,
      explanation: 'Use the slope formula $m = \\frac{y_2 - y_1}{x_2 - x_1}$. Plug in the points: $m = \\frac{9 - 3}{5 - 2} = \\frac{6}{3} = 2$.',
      hint: 'Remember: it\'s the change in y divided by the change in x. Rise over run!',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'What is the y-intercept of the line given by the equation $y = -3x + 7$?',
      options: ['-3', '7', '0', '-7'],
      correctAnswer: 1,
      explanation: 'The equation is in slope-intercept form $y = mx + b$. The y-intercept is $b$, which is 7.',
      hint: 'Look at the constant term when the equation is solved for y.',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'Convert the equation $y - 4 = 2(x + 1)$ into slope-intercept form ($y = mx + b$).',
      options: ['$y = 2x + 5$', '$y = 2x - 2$', '$y = 2x + 6$', '$y = 2x + 2$'],
      correctAnswer: 2,
      explanation: 'First, distribute the 2 on the right side: $y - 4 = 2x + 2$. Next, isolate $y$ by adding 4 to both sides: $y = 2x + 6$.',
      hint: 'Distribute the slope, then isolate y.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'Find the x-intercept and y-intercept of the line $3x - 4y = 12$.',
      options: ['x-int: 4, y-int: -3', 'x-int: 3, y-int: -4', 'x-int: -4, y-int: 3', 'x-int: -3, y-int: 4'],
      correctAnswer: 0,
      explanation: 'To find the x-intercept, set $y = 0$: $3x - 4(0) = 12 \\implies 3x = 12 \\implies x = 4$. To find the y-intercept, set $x = 0$: $3(0) - 4y = 12 \\implies -4y = 12 \\implies y = -3$.',
      hint: 'The x-intercept is where y is 0. The y-intercept is where x is 0.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Write the equation of the line that passes through $(-2, 5)$ and has a slope of $-1$.',
      options: ['$y = -x + 3$', '$y = -x + 7$', '$y = -x - 3$', '$y = x + 3$'],
      correctAnswer: 0,
      explanation: 'Use point-slope form: $y - y_1 = m(x - x_1)$. Plug in the values: $y - 5 = -1(x - (-2))$. Simplify: $y - 5 = -1(x + 2)$. Distribute: $y - 5 = -x - 2$. Add 5: $y = -x + 3$.',
      hint: 'Start with point-slope form and then convert it to slope-intercept form.',
      difficulty: 'hard'
    },
    {
      id: 'p6',
      question: 'A water tank contains 500 gallons and is draining at a constant rate of 20 gallons per minute. Which equation represents the volume $V$ of water after $t$ minutes?',
      options: ['$V = 20t + 500$', '$V = -20t + 500$', '$V = 500t - 20$', '$V = -500t + 20$'],
      correctAnswer: 1,
      explanation: 'The initial amount (y-intercept) is 500. The tank is draining, so the rate of change (slope) is negative: $-20$. Thus, $V = -20t + 500$.',
      hint: 'Identify the starting value ($b$) and the rate of change ($m$). Is the volume increasing or decreasing?',
      difficulty: 'medium'
    },
    {
      id: 'p7',
      question: 'Lines that are parallel have the <em>same</em> slope. Lines that are perpendicular have <em>negative reciprocal</em> slopes. If Line A is $y = \\frac{2}{3}x - 4$, what is the slope of a line perpendicular to Line A?',
      options: ['$\\frac{2}{3}$', '$-\\frac{2}{3}$', '$\\frac{3}{2}$', '$-\\frac{3}{2}$'],
      correctAnswer: 3,
      explanation: 'The slope of Line A is $\\frac{2}{3}$. The negative reciprocal is found by flipping the fraction and changing the sign, which gives $-\\frac{3}{2}$.',
      hint: 'Flip the fraction and flip the sign.',
      difficulty: 'medium'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Find the slope between $(1, -4)$ and $(3, 4)$.',
      options: ['4', '0', '8', '$\\frac{1}{4}$'],
      correctAnswer: 0,
      explanation: '$m = \\frac{4 - (-4)}{3 - 1} = \\frac{8}{2} = 4$.'
    },
    {
      id: 'q2',
      question: 'What is the slope of the line $y = 5$?',
      options: ['5', '0', '1', 'Undefined'],
      correctAnswer: 1,
      explanation: 'The line $y = 5$ is a horizontal line. It has no vertical "rise", so its slope is 0. You can also think of it as $y = 0x + 5$.'
    },
    {
      id: 'q3',
      question: 'Write the equation of a line with slope $\\frac{1}{2}$ and y-intercept $-6$.',
      options: ['$y = -6x + \\frac{1}{2}$', '$y = \\frac{1}{2}x - 6$', '$y = 2x - 6$', '$y = \\frac{1}{2}x + 6$'],
      correctAnswer: 1,
      explanation: 'Plug $m = \\frac{1}{2}$ and $b = -6$ into $y = mx + b$ to get $y = \\frac{1}{2}x - 6$.'
    },
    {
      id: 'q4',
      question: 'Convert $2x + 5y = 10$ to slope-intercept form.',
      options: ['$y = -\\frac{2}{5}x + 2$', '$y = \\frac{2}{5}x + 2$', '$y = -2x + 10$', '$y = -\\frac{5}{2}x + 5$'],
      correctAnswer: 0,
      explanation: 'Subtract $2x$: $5y = -2x + 10$. Divide by 5: $y = -\\frac{2}{5}x + 2$.'
    },
    {
      id: 'q5',
      question: 'A sensor measures strain on an airplane wing. The strain $S$ is modeled by $S = 0.003L + 0.1$, where $L$ is the load in kg. What does the $0.003$ represent?',
      options: ['The strain when there is no load.', 'The maximum safe load.', 'The increase in strain for every 1 kg increase in load.', 'The total strain on the wing.'],
      correctAnswer: 2,
      explanation: 'The value $0.003$ is the slope ($m$), which represents the rate of change: how much the strain ($S$) increases for each unit increase in the independent variable ($L$, load).'
    }
  ]
};
export default moduleData;
