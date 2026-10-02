export const moduleData = {
  id: 'exponents-radicals',
  title: 'Exponents, Radicals & Scientific Scale',
  description: 'Master the rules of exponents and roots to handle very large and very small numbers effortlessly.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-1',
      title: 'The Rules of Exponents',
      content: `
        <h3>Product, Quotient, and Power Rules</h3>
        <p>Exponents are a shorthand for repeated multiplication. The rules of exponents allow us to simplify complex expressions.</p>
        <p><strong>Product Rule:</strong> $x^m \\cdot x^n = x^{m+n}$. When multiplying same bases, add exponents.</p>
        <p><strong>Quotient Rule:</strong> $\\frac{x^m}{x^n} = x^{m-n}$. When dividing same bases, subtract exponents.</p>
        <p><strong>Power Rule:</strong> $(x^m)^n = x^{m \\cdot n}$. When raising a power to a power, multiply exponents.</p>
      `,
      keyTakeaways: [
        '$x^a x^b = x^{a+b}$',
        '$(x^a)^b = x^{ab}$'
      ],
    },
    {
      id: 'lesson-2',
      title: 'Negative and Zero Exponents',
      content: `
        <h3>What does $x^{-2}$ mean?</h3>
        <p>A negative exponent means division, or taking the reciprocal.</p>
        <p>$$ x^{-n} = \\frac{1}{x^n} $$</p>
        <p>Any non-zero number to the power of zero is 1.</p>
        <p>$$ x^0 = 1 $$</p>
        <p>This follows from the quotient rule: $\\frac{x^2}{x^2} = x^{2-2} = x^0$, and any number divided by itself is 1.</p>
      `,
      keyTakeaways: [
        '$x^0 = 1$ for any $x \\neq 0$',
        '$x^{-n} = \\frac{1}{x^n}$'
      ],
    },
    {
      id: 'lesson-3',
      title: 'Fractional Exponents & Radicals',
      content: `
        <h3>Roots are just fractions in the exponent</h3>
        <p>A fractional exponent corresponds to a radical or root.</p>
        <p>$$ x^{1/n} = \\sqrt[n]{x} $$</p>
        <p>For example, $x^{1/2} = \\sqrt{x}$, the square root.</p>
        <p>More generally, the numerator is the power, and the denominator is the root:</p>
        <p>$$ x^{m/n} = \\sqrt[n]{x^m} = (\\sqrt[n]{x})^m $$</p>
      `,
      keyTakeaways: [
        'The denominator of a fractional exponent determines the root.',
        '$x^{m/n} = \\sqrt[n]{x^m}$'
      ],
    },
    {
      id: 'lesson-4',
      title: 'Scientific Notation & Engineering Prefixes',
      content: `
        <h3>Dealing with the very large and very small</h3>
        <p>In engineering, you deal with nano-seconds ($10^{-9}$ s) and Giga-watts ($10^9$ W). Scientific notation expresses numbers as $a \\times 10^b$, where $1 \\le a < 10$.</p>
        <p>Engineering prefixes map to specific powers of 10, typically multiples of 3:</p>
        <ul>
          <li><strong>kilo (k)</strong>: $10^3$</li>
          <li><strong>Mega (M)</strong>: $10^6$</li>
          <li><strong>Giga (G)</strong>: $10^9$</li>
          <li><strong>milli (m)</strong>: $10^{-3}$</li>
          <li><strong>micro ($\\mu$)</strong>: $10^{-6}$</li>
          <li><strong>nano (n)</strong>: $10^{-9}$</li>
        </ul>
      `,
      keyTakeaways: [
        'Scientific notation puts numbers in terms of powers of 10.',
        'Engineering prefixes standardize powers of 10 in multiples of 3.'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Simplify: $x^3 \\cdot x^5$',
      options: ['$x^{15}$', '$x^8$', '$x^2$', '$2x^8$'],
      correctAnswer: 1,
      explanation: 'Using the product rule, add the exponents: $3 + 5 = 8$.',
      hint: 'When multiplying same bases, add the exponents.',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'Simplify: $(2x^4)^3$',
      options: ['$2x^{12}$', '$6x^7$', '$8x^{12}$', '$8x^7$'],
      correctAnswer: 2,
      explanation: 'Apply the power to both the coefficient and the variable: $2^3 \\cdot (x^4)^3 = 8x^{12}$.',
      hint: 'Don\'t forget to cube the constant 2 as well.',
      difficulty: 'medium',
    },
    {
      id: 'p3',
      question: 'Evaluate $16^{-1/2}$',
      options: ['$-4$', '$-8$', '$\\frac{1}{4}$', '$\\frac{1}{8}$'],
      correctAnswer: 2,
      explanation: 'The negative flips it: $\\frac{1}{16^{1/2}}$. The $1/2$ power is a square root. So $\\frac{1}{\\sqrt{16}} = \\frac{1}{4}$.',
      hint: 'Negative exponent means reciprocal. 1/2 power means square root.',
      difficulty: 'hard',
    },
    {
      id: 'p4',
      question: 'Simplify: $\\frac{x^7}{x^2}$',
      options: ['$x^5$', '$x^9$', '$x^{14}$', '$x^{3.5}$'],
      correctAnswer: 0,
      explanation: 'Using the quotient rule, subtract the exponents: $7 - 2 = 5$.',
      hint: 'When dividing same bases, subtract exponents.',
      difficulty: 'easy',
    },
    {
      id: 'p5',
      question: 'Write $0.000045$ in scientific notation.',
      options: ['$45 \\times 10^{-6}$', '$4.5 \\times 10^{-5}$', '$4.5 \\times 10^{-4}$', '$0.45 \\times 10^{-3}$'],
      correctAnswer: 1,
      explanation: 'Move the decimal 5 places to the right to get 4.5. Since the number is less than 1, the exponent is negative: $4.5 \\times 10^{-5}$.',
      hint: 'Move the decimal point until you have a number between 1 and 10.',
      difficulty: 'medium',
    },
    {
      id: 'p6',
      question: 'How many Watts are in 3 Megawatts (3 MW)?',
      options: ['$3 \\times 10^3$', '$3 \\times 10^6$', '$3 \\times 10^9$', '$3 \\times 10^{-6}$'],
      correctAnswer: 1,
      explanation: 'Mega (M) stands for $10^6$ (million). So 3 MW is $3 \\times 10^6$ Watts.',
      hint: 'Think of a megabyte.',
      difficulty: 'easy',
    },
    {
      id: 'p7',
      question: 'Simplify: $(x^{-2} y^3)^{-4}$',
      options: ['$x^8 y^{-12}$', '$x^{-6} y^{-1}$', '$x^6 y^7$', '$x^{16} y^{81}$'],
      correctAnswer: 0,
      explanation: 'Multiply each exponent by -4: $(-2)(-4) = 8$ and $(3)(-4) = -12$. Result: $x^8 y^{-12}$.',
      hint: 'Multiply exponents.',
      difficulty: 'medium',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'Simplify $\\sqrt[3]{x^6}$',
      options: ['$x^2$', '$x^3$', '$x^{18}$', '$x^{1/2}$'],
      correctAnswer: 0,
      explanation: 'Rewrite as a fractional exponent: $x^{6/3} = x^2$.',
    },
    {
      id: 'q2',
      question: 'Evaluate $8^{2/3}$',
      options: ['$\\frac{16}{3}$', '$4$', '$6$', '$\\frac{64}{3}$'],
      correctAnswer: 1,
      explanation: '$8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4$.',
    },
    {
      id: 'q3',
      question: 'Simplify: $\\frac{4x^5 y^2}{2x^3 y^4}$',
      options: ['$2x^2 y^2$', '$2x^8 y^6$', '$2x^2 y^{-2}$', '$2x^{-2} y^2$'],
      correctAnswer: 2,
      explanation: 'Divide coefficients: $4/2 = 2$. Subtract x exponents: $5-3=2$. Subtract y exponents: $2-4=-2$. Result: $2x^2 y^{-2}$ or $\\frac{2x^2}{y^2}$.',
    },
    {
      id: 'q4',
      question: 'Which of the following is equivalent to a microfarad ($\\mu F$)?',
      options: ['$10^{-3} F$', '$10^{-6} F$', '$10^{-9} F$', '$10^6 F$'],
      correctAnswer: 1,
      explanation: 'The prefix micro ($\\mu$) means $10^{-6}$.',
    },
    {
      id: 'q5',
      question: 'Simplify $x^0 \\cdot y^3$',
      options: ['$0$', '$x y^3$', '$y^3$', '$1$'],
      correctAnswer: 2,
      explanation: 'Since $x^0 = 1$, the expression simplifies to $1 \\cdot y^3 = y^3$.',
    }
  ],
};
export default moduleData;
