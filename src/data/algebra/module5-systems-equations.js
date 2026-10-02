export const moduleData = {
  id: 'systems-equations',
  title: 'Systems of Linear Equations',
  description: 'Understand the geometric meaning of systems of equations and apply them to solve multi-variable problems in engineering like circuit analysis and mixture balances.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-1',
      title: 'What is a System of Equations',
      content: `
        <h3>The Intersection of Lines</h3>
        <p>A system of linear equations is simply a set of two or more linear equations that we want to solve simultaneously. Geometrically, finding the solution to a system of two variables is equivalent to finding the exact point where two lines intersect.</p>
        <p>For example, if we have:</p>
        <p>$$ y = 2x + 1 $$</p>
        <p>$$ y = -x + 4 $$</p>
        <p>The solution is the $(x, y)$ coordinate that satisfies both equations at the same time.</p>
        <p>In engineering, this represents the equilibrium state or a point where multiple constraints are met simultaneously.</p>
      `,
      keyTakeaways: [
        'A system of equations asks for a solution that satisfies multiple equations simultaneously.',
        'Graphically, the solution is the point of intersection between lines.'
      ],
    },
    {
      id: 'lesson-2',
      title: 'Solving by Substitution',
      content: `
        <h3>The Substitution Method</h3>
        <p>Substitution involves isolating one variable in one equation, and "substituting" that expression into the other equation. This reduces the problem to a single equation with a single variable.</p>
        <p>For example, if $x + y = 5$ and $y = 2x - 1$. Since we know what $y$ equals, we substitute it into the first equation:</p>
        <p>$$ x + (2x - 1) = 5 $$</p>
        <p>$$ 3x - 1 = 5 \\implies 3x = 6 \\implies x = 2 $$</p>
        <p>Then substitute $x$ back to find $y$: $y = 2(2) - 1 = 3$. The solution is $(2, 3)$.</p>
      `,
      keyTakeaways: [
        'Isolate one variable in one equation.',
        'Substitute that expression into the other equation to solve.'
      ],
    },
    {
      id: 'lesson-3',
      title: 'Solving by Elimination',
      content: `
        <h3>The Elimination Method</h3>
        <p>Elimination involves manipulating the equations (usually by multiplying by a constant) so that when you add or subtract the equations, one variable is entirely eliminated.</p>
        <p>Example:</p>
        <p>$$ 2x + 3y = 8 $$</p>
        <p>$$ 4x - 3y = -2 $$</p>
        <p>Adding them directly eliminates $y$:</p>
        <p>$$ (2x + 4x) + (3y - 3y) = 8 - 2 \\implies 6x = 6 \\implies x = 1 $$</p>
      `,
      keyTakeaways: [
        'Scale equations so coefficients of one variable are opposites.',
        'Add the equations to eliminate a variable and solve.'
      ],
    },
    {
      id: 'lesson-4',
      title: 'Independent vs Inconsistent vs Dependent',
      content: `
        <h3>Types of Systems</h3>
        <p>Not all systems have exactly one solution.</p>
        <p><strong>Independent Systems:</strong> The lines intersect at exactly one point. There is exactly one unique solution.</p>
        <p><strong>Inconsistent Systems:</strong> The lines are parallel and never intersect. There is no solution (e.g., $x+y=1$ and $x+y=2$).</p>
        <p><strong>Dependent Systems:</strong> The equations represent the exact same line, overlapping perfectly. There are infinitely many solutions.</p>
      `,
      keyTakeaways: [
        'Independent: 1 solution (intersecting lines)',
        'Inconsistent: 0 solutions (parallel lines)',
        'Dependent: $\\infty$ solutions (same line)'
      ],
    },
    {
      id: 'lesson-5',
      title: 'Engineering Applications',
      content: `
        <h3>Why this matters</h3>
        <p>Systems of equations are the bedrock of engineering analysis. In electrical engineering, <strong>Kirchhoff\'s Laws</strong> dictate the flow of current and voltage drops across a circuit, naturally forming systems of linear equations.</p>
        <p>In chemical engineering, <strong>Material Balances</strong> track the inflow and outflow of multiple chemical species in a reactor. If you have 3 unknown flow rates, you set up 3 balance equations and solve the system.</p>
      `,
      keyTakeaways: [
        'Circuit analysis uses linear systems to find node voltages or mesh currents.',
        'Mass and energy balances in engineering rely on systems of equations.'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Solve the system: $y = 3x - 2$ and $y = -x + 6$',
      options: ['$(2, 4)$', '$(1, 1)$', '$(3, 7)$', '$(4, 2)$'],
      correctAnswer: 0,
      explanation: 'Set them equal: $3x - 2 = -x + 6 \\implies 4x = 8 \\implies x = 2$. Then $y = 3(2) - 2 = 4$.',
      hint: 'Since both are equal to y, set the right sides equal to each other.',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'Solve using elimination: $x + y = 10$ and $x - y = 4$',
      options: ['$(3, 7)$', '$(7, 3)$', '$(6, 4)$', '$(8, 2)$'],
      correctAnswer: 1,
      explanation: 'Add equations: $(x+x) + (y-y) = 10+4 \\implies 2x = 14 \\implies x = 7$. Substitute back: $7 + y = 10 \\implies y = 3$.',
      hint: 'Add the two equations together to eliminate y.',
      difficulty: 'easy',
    },
    {
      id: 'p3',
      question: 'Solve: $2x + 4y = 14$ and $3x - y = 7$',
      options: ['$(3, 2)$', '$(4, 5)$', '$(2, 3)$', '$(1, -4)$'],
      correctAnswer: 0,
      explanation: 'Multiply the second equation by 4: $12x - 4y = 28$. Add to first: $14x = 42 \\implies x = 3$. Then $3(3) - y = 7 \\implies y = 2$.',
      hint: 'Try multiplying the second equation by 4 to eliminate y.',
      difficulty: 'medium',
    },
    {
      id: 'p4',
      question: 'What type of system is $y = 2x + 1$ and $2y = 4x + 2$?',
      options: ['Independent', 'Inconsistent', 'Dependent', 'Cannot be determined'],
      correctAnswer: 2,
      explanation: 'Dividing the second equation by 2 gives $y = 2x + 1$, which is identical to the first. They represent the same line.',
      hint: 'Simplify the second equation.',
      difficulty: 'medium',
    },
    {
      id: 'p5',
      question: 'What type of system is $y = 3x - 4$ and $y = 3x + 5$?',
      options: ['Independent', 'Inconsistent', 'Dependent', 'Cannot be determined'],
      correctAnswer: 1,
      explanation: 'The lines have the same slope (3) but different y-intercepts. They are parallel and never intersect.',
      hint: 'Look at the slopes of the lines.',
      difficulty: 'easy',
    },
    {
      id: 'p6',
      question: 'A mixture problem requires 100 liters of a 20% acid solution. You have 10% and 50% solutions available. Let $x$ be the 10% solution and $y$ be the 50% solution. Which system represents this?',
      options: [
        '$x + y = 100$, $0.1x + 0.5y = 20$',
        '$x + y = 20$, $0.1x + 0.5y = 100$',
        '$x + y = 100$, $10x + 50y = 20$',
        '$x + y = 100$, $0.1x + 0.5y = 0.2$'
      ],
      correctAnswer: 0,
      explanation: 'The total volume is $x+y=100$. The total acid is $0.1x + 0.5y = 0.2(100) = 20$.',
      hint: 'One equation is for total volume, the other is for the volume of pure acid.',
      difficulty: 'hard',
    },
    {
      id: 'p7',
      question: 'Solve for x: $5x - 2y = 4$ and $3x + y = 9$',
      options: ['$1$', '$2$', '$3$', '$4$'],
      correctAnswer: 1,
      explanation: 'Multiply second by 2: $6x + 2y = 18$. Add to first: $11x = 22 \\implies x = 2$.',
      hint: 'Multiply the second equation by 2.',
      difficulty: 'medium',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'If two lines are perpendicular, their system of equations is:',
      options: ['Always dependent', 'Always independent', 'Always inconsistent', 'Sometimes independent'],
      correctAnswer: 1,
      explanation: 'Perpendicular lines have different slopes, so they must intersect at exactly one point, making the system independent.',
    },
    {
      id: 'q2',
      question: 'Solve the system: $x = 3y$ and $x + y = 16$',
      options: ['$(12, 4)$', '$(4, 12)$', '$(9, 3)$', '$(6, 2)$'],
      correctAnswer: 0,
      explanation: 'Substitute $x = 3y$ into the second equation: $3y + y = 16 \\implies 4y = 16 \\implies y = 4$. Then $x = 3(4) = 12$.',
    },
    {
      id: 'q3',
      question: 'Find the y-value of the solution: $4x + 3y = 2$ and $x - y = -3$',
      options: ['$-2$', '$2$', '$-1$', '$1$'],
      correctAnswer: 1,
      explanation: 'From second eq, $x = y - 3$. Substitute: $4(y - 3) + 3y = 2 \\implies 4y - 12 + 3y = 2 \\implies 7y = 14 \\implies y = 2$.',
    },
    {
      id: 'q4',
      question: 'A system of linear equations can have exactly 2 solutions.',
      options: ['True', 'False', 'Only if nonlinear', 'Depends on the variables'],
      correctAnswer: 1,
      explanation: 'A system of linear equations can have 0, 1, or infinitely many solutions. Never exactly 2.',
    },
    {
      id: 'q5',
      question: 'In circuit analysis, Kirchhoff\'s Current Law states that the sum of currents entering a node equals the sum leaving. If $I_1 + I_2 = I_3$ and $I_1 = 2A, I_3 = 5A$, find $I_2$.',
      options: ['$7A$', '$3A$', '$-3A$', '$2.5A$'],
      correctAnswer: 1,
      explanation: '$2 + I_2 = 5 \\implies I_2 = 3A$.',
    }
  ],
};
export default moduleData;
