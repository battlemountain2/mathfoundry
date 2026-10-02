export const moduleData = {
  id: 'variables-expressions',
  title: 'Variables, Expressions & The Balance Principle',
  description: 'Understand the core language of algebra. Learn how variables act as placeholders for changing physical quantities—like fluctuating voltage or varying loads—and master the rules for evaluating and simplifying mathematical expressions used in engineering.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-1-1',
      title: 'What is a Variable?',
      content: `
        <h3>Variables as Placeholders</h3>
        <p>In elementary math, a box $\\square$ might represent an unknown number. In algebra, we use letters called <strong>variables</strong> (like $x, y, V, F$) to represent unknown or changing quantities.</p>
        <p>Why do this? Because in engineering, quantities are rarely static. A variable allows us to write a single equation that works for <em>any</em> situation.</p>
        <p>For example, Ohm's Law relates Voltage ($V$), Current ($I$), and Resistance ($R$):</p>
        <p>$$V = I \\cdot R$$</p>
        <p>Here, $V$, $I$, and $R$ are variables. If current $I$ is held fixed, changing resistance $R$ changes voltage $V$. If voltage is held fixed instead, the current changes. Variables give us the power to describe universal relationships rather than single specific cases.</p>
      `,
      keyTakeaways: [
        'A variable is a letter used to represent an unknown or changing quantity.',
        'Variables allow us to write general formulas (like $F = m \\cdot a$) that apply universally.'
      ],
    },
    {
      id: 'lesson-1-2',
      title: 'Evaluating Expressions & Order of Operations',
      content: `
        <h3>The Rules of the Road (PEMDAS)</h3>
        <p>An algebraic expression is a combination of numbers, variables, and mathematical operations (like $3x + 5$). To <em>evaluate</em> an expression means to substitute a specific value for the variable and calculate the result.</p>
        <p>When calculating, you must follow the <strong>Order of Operations</strong> (PEMDAS):</p>
        <ul>
          <li><strong>P</strong>arentheses</li>
          <li><strong>E</strong>xponents</li>
          <li><strong>M</strong>ultiplication & <strong>D</strong>ivision (Left to Right)</li>
          <li><strong>A</strong>ddition & <strong>S</strong>ubtraction (Left to Right)</li>
        </ul>
        <p>In software engineering or when writing code for microcontrollers, the computer strictly follows these rules. Missing a parenthesis can cause a rocket navigation system to fail because $5 + 3 \\cdot 2$ is $11$, but $(5 + 3) \\cdot 2$ is $16$.</p>
      `,
      keyTakeaways: [
        'Evaluating an expression means plugging in numbers for variables.',
        'Always follow PEMDAS to ensure unambiguous calculations.'
      ],
    },
    {
      id: 'lesson-1-3',
      title: 'Translating Word Problems into Math',
      content: `
        <h3>The Language of Engineering</h3>
        <p>Real-world engineering problems don't arrive neatly formatted as equations. They arrive as project requirements, client requests, or physical constraints.</p>
        <p>You must translate English into Algebra:</p>
        <ul>
          <li>"Sum", "more than", "increased by" $\\rightarrow$ Addition ($+$)</li>
          <li>"Difference", "less than", "decreased by" $\\rightarrow$ Subtraction ($-$)</li>
          <li>"Product", "times", "twice" $\\rightarrow$ Multiplication ($\\cdot$)</li>
          <li>"Quotient", "ratio", "half" $\\rightarrow$ Division ($\\div$ or fraction)</li>
        </ul>
        <p><strong>Example:</strong> "The total weight is 50 pounds more than twice the payload weight $p$."<br>
        Translation: $$W = 2p + 50$$</p>
      `,
      keyTakeaways: [
        'Identify key action words to determine the mathematical operation.',
        'Translating physical constraints into expressions is the first step in engineering design.'
      ],
    },
    {
      id: 'lesson-1-4',
      title: 'Combining Like Terms',
      content: `
        <h3>Simplifying Your Design</h3>
        <p>Terms in an expression are separated by $+$ or $-$. <strong>Like terms</strong> are terms that have the exact same variables raised to the exact same powers.</p>
        <p>You can combine like terms by adding or subtracting their coefficients (the numbers in front of the variables). You cannot combine unlike terms.</p>
        <p>$$3x + 5x = 8x$$</p>
        <p>$$4y^2 + 2y - y^2 = 3y^2 + 2y$$</p>
        <p>Why do we do this? In engineering, a simpler equation means less computational load for a processor, fewer chances for manual calculation errors, and a clearer understanding of the system's behavior.</p>
      `,
      keyTakeaways: [
        'Like terms have identical variable parts.',
        'Combine like terms by adding their coefficients to simplify expressions.'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Evaluate the expression $4x^2 - 3x + 2$ when $x = -2$.',
      options: ['24', '10', '12', '-8'],
      correctAnswer: 0,
      explanation: 'Substitute $x = -2$ into the expression: $4(-2)^2 - 3(-2) + 2$. Using PEMDAS, first evaluate the exponent: $(-2)^2 = 4$. Then multiply: $4(4) - (-6) + 2 = 16 + 6 + 2 = 24$.',
      hint: 'Remember that squaring a negative number results in a positive number, and subtracting a negative is the same as adding a positive.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'Simplify the expression by combining like terms: $5a - 2b + 3a + 7b - 4$',
      options: ['$8a + 5b - 4$', '$15ab - 4$', '$2a + 9b - 4$', '$8a - 5b - 4$'],
      correctAnswer: 0,
      explanation: 'Group the like terms together: $(5a + 3a) + (-2b + 7b) - 4$. Combine their coefficients: $8a + 5b - 4$.',
      hint: 'You can only combine terms that have the exact same variable.',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'Translate the following phrase into an algebraic expression: "Five less than the product of three and a number $n$."',
      options: ['$5 - 3n$', '$3n - 5$', '$3(n - 5)$', '$\\frac{3}{n} - 5$'],
      correctAnswer: 1,
      explanation: 'The "product of three and a number $n$" is $3n$. "Five less than" means you subtract 5 from that product, resulting in $3n - 5$. Note that "$5 - 3n$" would be "the product of 3 and $n$ less than 5".',
      hint: 'Pay close attention to "less than"—it usually means the subtraction comes at the end.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'Evaluate $\\frac{x^2 - y}{2x}$ when $x = 4$ and $y = -8$.',
      options: ['1', '3', '2', '-1'],
      correctAnswer: 1,
      explanation: 'Substitute the values: $\\frac{4^2 - (-8)}{2(4)}$. Evaluate the numerator: $16 - (-8) = 16 + 8 = 24$. Evaluate the denominator: $2(4) = 8$. Divide: $\\frac{24}{8} = 3$.',
      hint: 'A fraction bar acts as a grouping symbol. Evaluate the entire numerator and the entire denominator before dividing.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Simplify: $2(3x - 4) - (x + 5)$',
      options: ['$5x - 13$', '$5x + 3$', '$6x - 13$', '$5x - 9$'],
      correctAnswer: 0,
      explanation: 'First, distribute the $2$ and the $-1$: $6x - 8 - x - 5$. Then combine like terms: $(6x - x) + (-8 - 5) = 5x - 13$.',
      hint: 'Don\'t forget to distribute the negative sign to both terms inside the second set of parentheses.',
      difficulty: 'hard'
    },
    {
      id: 'p6',
      question: 'A structural beam has length $L$. A second beam is 3 meters longer than twice the length of the first beam. What is the total length of both beams combined?',
      options: ['$2L + 3$', '$3L + 3$', '$3L - 3$', '$L + 3$'],
      correctAnswer: 1,
      explanation: 'The first beam is $L$. The second beam is $2L + 3$. The total length is $L + (2L + 3)$. Combining like terms gives $3L + 3$.',
      hint: 'Write an expression for the second beam first, then add it to the first beam\'s length.',
      difficulty: 'hard'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Evaluate $10 - 2 \\cdot 3^2$.',
      options: ['72', '-8', '28', '-26'],
      correctAnswer: 1,
      explanation: 'By PEMDAS, evaluate the exponent first: $3^2 = 9$. Then multiply: $2 \\cdot 9 = 18$. Finally subtract: $10 - 18 = -8$.'
    },
    {
      id: 'q2',
      question: 'Simplify: $4x^2 - 3x + x^2 + 7x$.',
      options: ['$5x^2 + 4x$', '$3x^2 + 4x$', '$5x^4 + 4x^2$', '$9x$'],
      correctAnswer: 0,
      explanation: 'Combine the $x^2$ terms: $4x^2 + 1x^2 = 5x^2$. Combine the $x$ terms: $-3x + 7x = 4x$. The simplified expression is $5x^2 + 4x$.'
    },
    {
      id: 'q3',
      question: 'Translate: "The quotient of a number $y$ and 4, increased by 7."',
      options: ['$\\frac{4}{y} + 7$', '$\\frac{y + 7}{4}$', '$\\frac{y}{4} + 7$', '$4y + 7$'],
      correctAnswer: 2,
      explanation: '"Quotient of $y$ and 4" is $\\frac{y}{4}$. "Increased by 7" means add 7, resulting in $\\frac{y}{4} + 7$.'
    },
    {
      id: 'q4',
      question: 'Evaluate $a^2b - b^2$ for $a = 3$ and $b = -2$.',
      options: ['-14', '-22', '-10', '14'],
      correctAnswer: 1,
      explanation: 'Substitute: $(3)^2(-2) - (-2)^2$. Evaluate exponents: $(9)(-2) - (4)$. Multiply: $-18 - 4$. Subtract: $-22$.'
    },
    {
      id: 'q5',
      question: 'Simplify: $-(2x - 5) + 3(x - 1)$',
      options: ['$x + 2$', '$x - 8$', '$-x + 2$', '$5x - 8$'],
      correctAnswer: 0,
      explanation: 'Distribute: $-2x + 5 + 3x - 3$. Combine like terms: $(-2x + 3x) + (5 - 3) = x + 2$.'
    }
  ]
};
export default moduleData;
