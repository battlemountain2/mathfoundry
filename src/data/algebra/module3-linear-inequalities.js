export const moduleData = {
  id: 'linear-inequalities',
  title: 'Linear Inequalities & Tolerance Limits',
  description: 'Explore the mathematics of safety margins. Discover how inequalities represent ranges of acceptable values, crucial for understanding engineering tolerances, system constraints, and failure limits.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-3-1',
      title: 'Inequality Symbols & Number Lines',
      content: `
        <h3>Beyond Exact Values</h3>
        <p>In the real world, exactness is often impossible or unnecessary. A bridge doesn't need to hold <em>exactly</em> 10,000 lbs; it needs to hold <em>at least</em> 10,000 lbs. An inequality compares two expressions that are not necessarily equal.</p>
        <ul>
          <li>$<$ : Less than</li>
          <li>$>$ : Greater than</li>
          <li>$\\le$ : Less than or equal to</li>
          <li>$\\ge$ : Greater than or equal to</li>
        </ul>
        <p>We graph inequalities on a number line to show all possible solutions. An open circle ($\\circ$) is used for $<$ or $>$, meaning the boundary point is NOT included. A closed solid circle ($\\bullet$) is used for $\\le$ or $\\ge$, meaning the boundary point IS included.</p>
      `,
      keyTakeaways: [
        'Inequalities represent a range of infinite possible solutions.',
        'Use open circles for strict inequalities ($<, >$) and closed circles for inclusive inequalities ($\\le, \\ge$).'
      ],
    },
    {
      id: 'lesson-3-2',
      title: 'Solving Inequalities & The Sign-Flip Rule',
      content: `
        <h3>The Golden Rule, with an Exception</h3>
        <p>Solving a linear inequality is almost identical to solving a linear equation. You use inverse operations to isolate the variable. Whatever you do to one side, you do to the other.</p>
        <p><strong>HOWEVER, there is one critical difference:</strong> If you multiply or divide both sides of an inequality by a NEGATIVE number, you MUST flip the inequality symbol.</p>
        <p>Why? Consider the true statement: $2 < 5$<br>
        If we multiply both sides by $-1$, we get $-2$ and $-5$. But $-2$ is <em>greater</em> than $-5$! So we must flip the sign: $-2 > -5$ for the statement to remain true.</p>
        <p>Example: $-3x \\ge 12$<br>
        Divide by $-3$ (and flip the sign!): $x \\le -4$</p>
      `,
      keyTakeaways: [
        'Solve inequalities just like equations to isolate the variable.',
        'FLIP the inequality sign when multiplying or dividing by a negative number.'
      ],
    },
    {
      id: 'lesson-3-3',
      title: 'Compound Inequalities (AND / OR)',
      content: `
        <h3>Setting Upper and Lower Limits</h3>
        <p>Engineering tolerances often require a value to be between two limits. A machined part might need a diameter $d$ that is greater than 4.9mm AND less than 5.1mm. This is a compound inequality.</p>
        <p><strong>"AND" Inequalities (Intersection)</strong><br>
        Written as: $4.9 < d < 5.1$<br>
        The solution is the overlapping region between the two limits. The value must satisfy both conditions simultaneously.</p>
        <p><strong>"OR" Inequalities (Union)</strong><br>
        Written as: $x < -2$ OR $x > 5$<br>
        The solution includes values that satisfy <em>either</em> condition. These graph as two arrows pointing away from each other.</p>
      `,
      keyTakeaways: [
        '"AND" inequalities define a continuous range between two bounds.',
        '"OR" inequalities define two separate ranges outside of a central gap.'
      ],
    },
    {
      id: 'lesson-3-4',
      title: 'Engineering Tolerances and Safety Factors',
      content: `
        <h3>Designing for Safety</h3>
        <p>Inequalities are the mathematical language of safety. When designing a structure, engineers calculate the maximum stress $\\sigma$ the material will experience.</p>
        <p>The material has an allowable stress limit, $\\sigma_{\\text{allow}}$. The core requirement for structural safety is a simple inequality:</p>
        <p>$$\\sigma \\le \\sigma_{\\text{allow}}$$</p>
        <p>If this inequality is false, the bridge collapses. Engineers also use Factor of Safety (FS). If $FS = 2$, they design the structure to handle twice the expected load, ensuring that even under extreme, unexpected conditions, the fundamental inequality $\\text{Load} < \\text{Capacity}$ holds true.</p>
      `,
      keyTakeaways: [
        'Inequalities are used to define system constraints and safety margins.',
        'A design is only safe if its operating conditions satisfy the limit inequalities.'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Solve the inequality: $x - 7 < -2$',
      options: ['$x < 5$', '$x > 5$', '$x < -9$', '$x > -9$'],
      correctAnswer: 0,
      explanation: 'Add 7 to both sides: $x < -2 + 7 \\implies x < 5$. The sign does not flip because we only added.',
      hint: 'Isolate $x$ just like you would in an equation.',
      difficulty: 'easy'
    },
    {
      id: 'p2',
      question: 'Solve the inequality: $-4y \\ge 24$',
      options: ['$y \\ge -6$', '$y \\le -6$', '$y \\ge 6$', '$y \\le 6$'],
      correctAnswer: 1,
      explanation: 'Divide both sides by $-4$. Because we are dividing by a negative number, we MUST flip the inequality symbol: $y \\le -6$.',
      hint: 'Remember the special rule for multiplying or dividing by a negative number!',
      difficulty: 'easy'
    },
    {
      id: 'p3',
      question: 'Solve for $a$: $3a + 5 > 14$',
      options: ['$a > 3$', '$a < 3$', '$a > \\frac{19}{3}$', '$a < \\frac{19}{3}$'],
      correctAnswer: 0,
      explanation: 'Subtract 5 from both sides: $3a > 9$. Divide by 3 (a positive number, so don\'t flip the sign): $a > 3$.',
      hint: 'Undo the addition first, then the multiplication.',
      difficulty: 'medium'
    },
    {
      id: 'p4',
      question: 'Solve the compound inequality: $-5 < 2x - 1 \\le 7$',
      options: ['$-2 < x \\le 4$', '$-3 < x \\le 3$', '$-2 < x < 4$', '$-3 \\le x \\le 4$'],
      correctAnswer: 0,
      explanation: 'Perform operations on all three parts simultaneously. Add 1 to all parts: $-4 < 2x \\le 8$. Divide all parts by 2: $-2 < x \\le 4$.',
      hint: 'Whatever you do to the middle, you must do to BOTH the left and the right boundaries.',
      difficulty: 'medium'
    },
    {
      id: 'p5',
      question: 'Solve: $5 - 2(x + 3) > 11$',
      options: ['$x < -6$', '$x > -6$', '$x < -1$', '$x > -1$'],
      correctAnswer: 0,
      explanation: 'Distribute the $-2$: $5 - 2x - 6 > 11$. Combine terms: $-1 - 2x > 11$. Add 1: $-2x > 12$. Divide by $-2$ and flip the sign: $x < -6$.',
      hint: 'Simplify the left side first. Watch out for the negative sign when distributing and when dividing at the end.',
      difficulty: 'hard'
    },
    {
      id: 'p6',
      question: 'A 3D printer bed temperature $T$ must be maintained between $60^\\circ$C and $65^\\circ$C for optimal PLA adhesion. Which inequality represents this?',
      options: ['$T < 60$ or $T > 65$', '$60 < T < 65$', '$60 \\le T \\le 65$', '$T > 65$ and $T < 60$'],
      correctAnswer: 2,
      explanation: 'The temperature can be exactly $60$ or $65$, and anything in between. This is an inclusive "AND" inequality: $60 \\le T \\le 65$.',
      hint: 'Does the phrase "between [a] and [b]" usually imply a continuous range (AND) or two separate ranges (OR)?',
      difficulty: 'medium'
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Solve: $-2x + 7 < 15$',
      options: ['$x < -4$', '$x > -4$', '$x < 4$', '$x > 4$'],
      correctAnswer: 1,
      explanation: 'Subtract 7: $-2x < 8$. Divide by $-2$ and flip sign: $x > -4$.'
    },
    {
      id: 'q2',
      question: 'When graphing $x \\le 3$ on a number line, you use a...',
      options: ['Closed circle and shade right', 'Open circle and shade left', 'Closed circle and shade left', 'Open circle and shade right'],
      correctAnswer: 2,
      explanation: '$\\le$ means the value is included, so use a closed circle. "Less than" means smaller values, so shade to the left.'
    },
    {
      id: 'q3',
      question: 'Solve: $4(n - 2) \\ge 6n + 4$',
      options: ['$n \\le -6$', '$n \\ge -6$', '$n \\le -2$', '$n \\ge 6$'],
      correctAnswer: 0,
      explanation: 'Distribute: $4n - 8 \\ge 6n + 4$. Subtract $6n$: $-2n - 8 \\ge 4$. Add 8: $-2n \\ge 12$. Divide by $-2$ and flip: $n \\le -6$.'
    },
    {
      id: 'q4',
      question: 'Solve the compound inequality: $x + 4 < 2$ OR $3x \\ge 15$',
      options: ['$x < -2$ OR $x \\ge 5$', '$x > -2$ OR $x \\le 5$', '$-2 < x \\le 5$', '$x < -2$ AND $x \\ge 5$'],
      correctAnswer: 0,
      explanation: 'Solve each separately. Left: $x + 4 < 2 \\implies x < -2$. Right: $3x \\ge 15 \\implies x \\ge 5$. Combine with OR.'
    },
    {
      id: 'q5',
      question: 'An elevator has a maximum capacity of $2500$ lbs. If an average person weighs $160$ lbs, which inequality represents the number of people $p$ it can carry safely?',
      options: ['$160p > 2500$', '$160p < 2500$', '$160p \\le 2500$', '$p \\le 160 \\cdot 2500$'],
      correctAnswer: 2,
      explanation: 'Total weight is $160p$. This total must be less than or equal to the maximum capacity: $160p \\le 2500$.'
    }
  ]
};
export default moduleData;
