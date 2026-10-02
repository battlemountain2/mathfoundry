export const moduleData = {
  id: 'polynomials-factoring',
  title: 'Polynomials & Factoring Techniques',
  description: 'Understand polynomials as mathematical building blocks and master factoring to simplify complex engineering expressions.',
  category: 'algebra',
  track: 'algebra',
  lessons: [
    {
      id: 'lesson-1',
      title: 'Classification and Anatomy of Polynomials',
      content: `
        <h3>What is a Polynomial?</h3>
        <p>A polynomial is an expression consisting of variables and coefficients, involving only the operations of addition, subtraction, multiplication, and non-negative integer exponents of variables.</p>
        <p>We classify them by terms:</p>
        <ul>
          <li><strong>Monomial:</strong> 1 term (e.g., $3x^2$)</li>
          <li><strong>Binomial:</strong> 2 terms (e.g., $2x + 5$)</li>
          <li><strong>Trinomial:</strong> 3 terms (e.g., $x^2 + 3x - 4$)</li>
        </ul>
        <p>The <strong>degree</strong> is the highest exponent. A quadratic polynomial has degree 2.</p>
      `,
      keyTakeaways: [
        'Polynomials have non-negative integer exponents.',
        'Degree is the highest power of the variable.'
      ],
    },
    {
      id: 'lesson-2',
      title: 'Multiplying Polynomials',
      content: `
        <h3>FOIL and the Box Method</h3>
        <p>To multiply binomials like $(x+2)(x+3)$, we distribute every term in the first binomial to every term in the second.</p>
        <p><strong>FOIL</strong>: First, Outer, Inner, Last.</p>
        <p>$$ (x+2)(x+3) = x(x) + x(3) + 2(x) + 2(3) = x^2 + 5x + 6 $$</p>
        <p>The <strong>Box Method</strong> sets up a grid to organize the multiplication, which is especially useful for larger polynomials.</p>
      `,
      keyTakeaways: [
        'Distribute every term to every other term.',
        'Combine like terms after multiplying.'
      ],
    },
    {
      id: 'lesson-3',
      title: 'Greatest Common Factor (GCF)',
      content: `
        <h3>Pulling out the commonalities</h3>
        <p>Factoring is the reverse of distributing. The simplest form of factoring is finding the GCF—the largest term that divides evenly into all terms of the polynomial.</p>
        <p>For $6x^3 + 9x^2$, the numbers share a factor of 3, and the variables share $x^2$.</p>
        <p>$$ 6x^3 + 9x^2 = 3x^2(2x + 3) $$</p>
      `,
      keyTakeaways: [
        'Always look for a GCF first when factoring.',
        'Factor out the lowest power of a shared variable.'
      ],
    },
    {
      id: 'lesson-4',
      title: 'Factoring Quadratics',
      content: `
        <h3>Trinomials and Difference of Squares</h3>
        <p>To factor $x^2 + bx + c$ into $(x+m)(x+n)$, find two numbers $m$ and $n$ that <strong>multiply to $c$</strong> and <strong>add to $b$</strong>.</p>
        <p>For $x^2 + 5x + 6$, numbers that multiply to 6 and add to 5 are 2 and 3. So, $(x+2)(x+3)$.</p>
        <p><strong>Difference of Squares:</strong> $A^2 - B^2 = (A - B)(A + B)$. For example, $x^2 - 16 = (x - 4)(x + 4)$.</p>
      `,
      keyTakeaways: [
        'For $x^2+bx+c$, find numbers that multiply to c and add to b.',
        '$A^2 - B^2 = (A - B)(A + B)$'
      ],
    }
  ],
  practiceProblems: [
    {
      id: 'p1',
      question: 'Expand: $(x - 4)(x + 5)$',
      options: ['$x^2 + x - 20$', '$x^2 - 9x - 20$', '$x^2 + 9x - 20$', '$x^2 - x - 20$'],
      correctAnswer: 0,
      explanation: 'FOIL: $x(x) + x(5) - 4(x) - 4(5) = x^2 + 5x - 4x - 20 = x^2 + x - 20$.',
      hint: 'Use FOIL: First, Outer, Inner, Last.',
      difficulty: 'easy',
    },
    {
      id: 'p2',
      question: 'Factor out the GCF: $15x^4 - 10x^3 + 5x^2$',
      options: ['$5(3x^4 - 2x^3 + x^2)$', '$5x(3x^3 - 2x^2 + x)$', '$5x^2(3x^2 - 2x + 1)$', '$x^2(15x^2 - 10x + 5)$'],
      correctAnswer: 2,
      explanation: 'The GCF of the coefficients is 5. The GCF of the variables is $x^2$. Pulling out $5x^2$ leaves $3x^2 - 2x + 1$.',
      hint: 'Find the largest number and largest power of x that goes into all terms.',
      difficulty: 'medium',
    },
    {
      id: 'p3',
      question: 'Factor the trinomial: $x^2 - 7x + 10$',
      options: ['$(x - 2)(x - 5)$', '$(x + 2)(x + 5)$', '$(x - 1)(x - 10)$', '$(x + 2)(x - 5)$'],
      correctAnswer: 0,
      explanation: 'We need two numbers that multiply to 10 and add to -7. Those numbers are -2 and -5. So, $(x - 2)(x - 5)$.',
      hint: 'Find numbers that multiply to 10 and add to -7.',
      difficulty: 'easy',
    },
    {
      id: 'p4',
      question: 'Factor the difference of squares: $4x^2 - 49$',
      options: ['$(2x - 7)^2$', '$(2x - 7)(2x + 7)$', '$(4x - 7)(x + 7)$', '$(2x - 49)(2x + 1)$'],
      correctAnswer: 1,
      explanation: 'Use $A^2 - B^2 = (A-B)(A+B)$. Here $A = 2x$ and $B = 7$. Thus, $(2x-7)(2x+7)$.',
      hint: 'Take the square root of both terms.',
      difficulty: 'medium',
    },
    {
      id: 'p5',
      question: 'Expand: $(2x + 3)^2$',
      options: ['$4x^2 + 9$', '$4x^2 + 6x + 9$', '$4x^2 + 12x + 9$', '$2x^2 + 12x + 9$'],
      correctAnswer: 2,
      explanation: '$(2x+3)(2x+3) = 4x^2 + 6x + 6x + 9 = 4x^2 + 12x + 9$. Don\'t just square the terms!',
      hint: 'Write it out as $(2x+3)(2x+3)$ and FOIL.',
      difficulty: 'medium',
    },
    {
      id: 'p6',
      question: 'Factor completely: $3x^2 - 27$',
      options: ['$3(x-3)^2$', '$3(x-9)(x+9)$', '$(3x-9)(x+3)$', '$3(x-3)(x+3)$'],
      correctAnswer: 3,
      explanation: 'First pull out GCF: $3(x^2 - 9)$. Then factor difference of squares: $3(x-3)(x+3)$.',
      hint: 'Always check for a GCF first!',
      difficulty: 'hard',
    },
    {
      id: 'p7',
      question: 'Factor: $x^2 + x - 12$',
      options: ['$(x+4)(x-3)$', '$(x-4)(x+3)$', '$(x+6)(x-2)$', '$(x-6)(x+2)$'],
      correctAnswer: 0,
      explanation: 'Need numbers that multiply to -12 and add to 1. 4 and -3 work.',
      hint: 'Multiply to -12, add to 1.',
      difficulty: 'easy',
    }
  ],
  quiz: [
    {
      id: 'q1',
      question: 'What is the degree of the polynomial $5x^4 - 2x^2 + 7$?',
      options: ['$4$', '$2$', '$5$', '$7$'],
      correctAnswer: 0,
      explanation: 'The degree is the highest exponent of the variable, which is 4.',
    },
    {
      id: 'q2',
      question: 'Factor: $x^2 - 8x + 16$',
      options: ['$(x-4)(x+4)$', '$(x+4)^2$', '$(x-8)(x-2)$', '$(x-4)^2$'],
      correctAnswer: 3,
      explanation: 'Numbers that multiply to 16 and add to -8 are -4 and -4. $(x-4)(x-4) = (x-4)^2$.',
    },
    {
      id: 'q3',
      question: 'Which of the following is NOT a polynomial?',
      options: ['$x^2 + 3x$', '$\\frac{1}{x} + 2$', '$5$', '$x^3 - x$'],
      correctAnswer: 1,
      explanation: 'Polynomials cannot have negative exponents, and $\\frac{1}{x} = x^{-1}$.',
    },
    {
      id: 'q4',
      question: 'Expand $x(x^2 - 4x + 5)$',
      options: ['$x^3 - 4x^2 + 5x$', '$x^2 - 4x^2 + 5$', '$x^3 - 4x + 5$', '$x^3 - 4x^2 + 5$'],
      correctAnswer: 0,
      explanation: 'Distribute the x to each term: $x \\cdot x^2 - x \\cdot 4x + x \\cdot 5 = x^3 - 4x^2 + 5x$.',
    },
    {
      id: 'q5',
      question: 'Factor out the negative GCF: $-4x^2 - 8x$',
      options: ['$-4x(x - 2)$', '$-4(x^2 + 2x)$', '$-4x(x + 2)$', '$4x(-x - 2)$'],
      correctAnswer: 2,
      explanation: 'Pull out $-4x$: $-4x(x + 2)$.',
    }
  ],
};
export default moduleData;
