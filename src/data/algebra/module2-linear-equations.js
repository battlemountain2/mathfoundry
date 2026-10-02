export const moduleData = {
  id: 'linear-equations',
  title: 'Linear Equations in One Variable',
  description: 'Master the art of solving equations. Learn to use inverse operations to isolate variables, mirroring how engineers work backwards from a desired outcome (like a required voltage or target structural strength) to determine the necessary system inputs.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-2-1',
      title: 'The Equal Sign as a Balanced Scale',
      content: `
        <h3>The Golden Rule of Algebra</h3>
        <p>An equation is simply a statement that two expressions are equal. Think of the equal sign ($=$) as the pivot of a balanced scale.</p>
        <p>If you add weight to one side of a scale, you must add the exact same amount of weight to the other side to keep it balanced. This is the <strong>Properties of Equality</strong>: Whatever you do to one side of an equation, you MUST do to the other.</p>
        <p>In structural engineering, equilibrium is key. The sum of the forces pushing down must perfectly equal the sum of the forces pushing up. Solving an equation is an exercise in maintaining that perfect equilibrium while rearranging the pieces.</p>
      `,
      keyTakeaways: [
        'An equation is a balanced scale.',
        'Whatever mathematical operation you perform on the left side, you must perform on the right side.'
      ],
    },
    {
      id: 'lesson-2-2',
      title: 'One-Step and Two-Step Equations',
      content: `
        <h3>Inverse Operations</h3>
        <p>To solve for a variable, your goal is to <em>isolate</em> it (get it by itself on one side of the equal sign). We do this using <strong>inverse operations</strong>—operations that undo each other.</p>
        <ul>
          <li>Addition $\\leftrightarrow$ Subtraction</li>
          <li>Multiplication $\\leftrightarrow$ Division</li>
        </ul>
        <p>Consider the equation $2x + 5 = 13$. We want $x$ alone. We reverse the order of operations (SADMEP instead of PEMDAS):</p>
        <p>1. Undo addition/subtraction: Subtract $5$ from both sides.<br>
           $$2x = 8$$</p>
        <p>2. Undo multiplication/division: Divide both sides by $2$.<br>
           $$x = 4$$</p>
      `,
      keyTakeaways: [
        'Use inverse operations to undo the operations applied to the variable.',
        'When isolating variables, generally work in the reverse order of operations.'
      ],
    },
    {
      id: 'lesson-2-3',
      title: 'Multi-Step Equations',
      content: `
        <h3>Simplifying Before Solving</h3>
        <p>Real-world models often result in messy equations. Before you start moving terms across the equal sign, you must simplify both sides independently.</p>
        <p><strong>Steps for Multi-Step Equations:</strong></p>
        <ol>
          <li>Distribute to clear any parentheses.</li>
          <li>Combine like terms on the left side.</li>
          <li>Combine like terms on the right side.</li>
          <li>Move all variable terms to one side (by adding/subtracting).</li>
          <li>Move all constant terms to the other side.</li>
          <li>Isolate the variable (multiply/divide).</li>
        </ol>
        <p>For example: $3(x - 2) = 5x + 4$<br>
        Distribute: $3x - 6 = 5x + 4$<br>
        Subtract $3x$: $-6 = 2x + 4$<br>
        Subtract $4$: $-10 = 2x$<br>
        Divide by $2$: $x = -5$</p>
      `,
      keyTakeaways: [
        'Always simplify both sides of the equation completely before trying to solve.',
        'Get all terms containing the variable onto the same side of the equation.'
      ],
    },
    {
      id: 'lesson-2-4',
      title: 'Engineering Applications: Working Backwards',
      content: `
        <h3>Solving Literal Equations</h3>
        <p>Engineers often have a formula but need to solve for a different variable. This is called a literal equation.</p>
        <p>Take Newton's Second Law: Force = mass $\\cdot$ acceleration ($F = m \\cdot a$). If you know the Force your motor can output and the mass of your robot, what is the acceleration?</p>
        <p>You need to solve $F = m \\cdot a$ for $a$. Treat $m$ just like a number. To undo the multiplication, divide both sides by $m$:</p>
        <p>$$a = \\frac{F}{m}$$</p>
        <p>You have just derived a new formula that directly gives you the information you need. This algebraic manipulation is the bread and butter of engineering analysis.</p>
      `,
      keyTakeaways: [
        'Literal equations are formulas with multiple variables.',
        'You can solve for any variable in a formula by treating the other variables as constants and using inverse operations.'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Solve for $x$: $x - 12 = -5$',
      options: ['$x = -17$', '$x = 7$', '$x = -7$', '$x = 17$'],
      correctAnswer: 1,
      explanation: 'To isolate $x$, perform the inverse operation of subtracting 12, which is adding 12 to both sides: $x - 12 + 12 = -5 + 12 \\implies x = 7$.',
      hint: 'What is the opposite of subtracting 12?',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'Solve for $y$: $\\frac{y}{4} = -8$',
      options: ['$y = -2$', '$y = 32$', '$y = -32$', '$y = 2$'],
      correctAnswer: 2,
      explanation: 'To isolate $y$, undo the division by multiplying both sides by 4: $4 \\cdot (\\frac{y}{4}) = -8 \\cdot 4 \\implies y = -32$.',
      hint: 'Multiply both sides by the denominator.',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'Solve for $m$: $3m + 7 = -14$',
      options: ['$m = -7$', '$m = -\\frac{7}{3}$', '$m = 7$', '$m = -21$'],
      correctAnswer: 0,
      explanation: 'First, undo the addition by subtracting 7 from both sides: $3m = -14 - 7 \\implies 3m = -21$. Then, undo the multiplication by dividing by 3: $m = \\frac{-21}{3} \\implies m = -7$.',
      hint: 'Undo the addition/subtraction before you undo the multiplication/division.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'Solve for $k$: $5(k - 2) = 2k + 11$',
      options: ['$k = 7$', '$k = 3$', '$k = \\frac{13}{3}$', '$k = 4$'],
      correctAnswer: 0,
      explanation: 'Distribute the 5: $5k - 10 = 2k + 11$. Subtract $2k$ from both sides: $3k - 10 = 11$. Add 10 to both sides: $3k = 21$. Divide by 3: $k = 7$.',
      hint: 'Distribute first, then get all the $k$ terms on one side.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Solve the equation for $W$: $P = 2L + 2W$ (Perimeter of a rectangle)',
      options: ['$W = P - 2L$', '$W = \\frac{P}{2} - L$', '$W = \\frac{P - L}{2}$', '$W = P - L$'],
      correctAnswer: 1,
      explanation: 'Subtract $2L$ from both sides: $P - 2L = 2W$. Divide every term by 2: $\\frac{P - 2L}{2} = W$, which simplifies to $W = \\frac{P}{2} - L$.',
      hint: 'Treat $P$ and $L$ as if they were regular numbers. Isolate the term with $W$ first.',
      difficulty: 'hard'
    },
    {
      id: 'p6',
      question: 'Solve for $x$: $\\frac{2x - 5}{3} = 7$',
      options: ['$x = 6$', '$x = 13$', '$x = 18$', '$x = 16$'],
      correctAnswer: 1,
      explanation: 'Multiply both sides by 3 to clear the fraction: $2x - 5 = 21$. Add 5 to both sides: $2x = 26$. Divide by 2: $x = 13$.',
      hint: 'Get rid of the fraction first by multiplying both sides by the denominator.',
      difficulty: 'medium'
    },
    {
      id: 'p7',
      question: 'An engineer is designing a circuit. The voltage $V$ is 24 volts. The formula is $V = IR$. If the desired current $I$ is 1.5 amps, what must the resistance $R$ be?',
      options: ['$16 \\,\\Omega$', '$36 \\,\\Omega$', '$12 \\,\\Omega$', '$25.5 \\,\\Omega$'],
      correctAnswer: 0,
      explanation: 'Substitute the known values: $24 = 1.5 \\cdot R$. Divide both sides by 1.5: $R = \\frac{24}{1.5} = 16$.',
      hint: 'Plug in the numbers you know, then solve the resulting one-step equation for $R$.',
      difficulty: 'medium'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Solve for $x$: $-4x = 28$',
      options: ['$x = 32$', '$x = 7$', '$x = -7$', '$x = -32$'],
      correctAnswer: 2,
      explanation: 'Divide both sides by $-4$: $x = \\frac{28}{-4} = -7$.'
    },
    {
      id: 'q2',
      question: 'Solve for $y$: $10 - 3y = 4y - 11$',
      options: ['$y = 3$', '$y = -1$', '$y = 21$', '$y = -3$'],
      correctAnswer: 0,
      explanation: 'Add $3y$ to both sides: $10 = 7y - 11$. Add 11: $21 = 7y$. Divide by 7: $y = 3$.'
    },
    {
      id: 'q3',
      question: 'Solve for $t$: $2(t + 4) - 5 = 3t + 8$',
      options: ['$t = -5$', '$t = 1$', '$t = -1$', '$t = 5$'],
      correctAnswer: 0,
      explanation: 'Distribute: $2t + 8 - 5 = 3t + 8$. Simplify: $2t + 3 = 3t + 8$. Subtract $2t$: $3 = t + 8$. Subtract 8: $t = -5$.'
    },
    {
      id: 'q4',
      question: 'Solve the formula $d = rt$ for $t$.',
      options: ['$t = dr$', '$t = d - r$', '$t = \\frac{r}{d}$', '$t = \\frac{d}{r}$'],
      correctAnswer: 3,
      explanation: 'To isolate $t$, divide both sides by $r$: $\\frac{d}{r} = t$.'
    },
    {
      id: 'q5',
      question: 'Which of the following is an inverse operation to dividing by 5?',
      options: ['Subtracting 5', 'Multiplying by 5', 'Adding 5', 'Dividing by $\\frac{1}{5}$'],
      correctAnswer: 1,
      explanation: 'Multiplication and division are inverse operations. To undo dividing by 5, you multiply by 5.'
    }
  ]
};
export default moduleData;
