// Mathematical strategy hints that guide procedure and reasoning without leaking the answer.

export function getProblemHint(problem) {
  if (!problem) return 'Work through the problem step by step on paper, and check each calculation carefully.';
  if (problem.hint) return problem.hint;

  const cid = problem.conceptId;
  if (cid) {
    switch (cid) {
      case 'arithmetic':
        return 'Break the calculation into friendlier pieces: decompose numbers into tens and ones (e.g., 7 × 6 = 5 × 6 + 2 × 6), or work out intermediate steps on paper.';
      case 'equivalence':
        return 'Remember that multiplying or dividing both the numerator and denominator by the same non-zero factor keeps the fraction\'s quantity unchanged.';
      case 'comparison':
        return 'Find a common denominator so both fractions use equal-sized parts, or compare each fraction to a benchmark like 1/2.';
      case 'addition':
        return 'Check whether both fractions share the same denominator. If not, rewrite each fraction using a common denominator before combining numerators.';
      case 'multiplication':
        return 'Multiply numerators straight across and denominators straight across: (a × c) / (b × d). Simplify common factors if possible.';
      case 'division':
        return 'Dividing by a fraction is equivalent to multiplying by its reciprocal (invert the second fraction).';
      default:
        break;
    }
  }

  const mid = problem.moduleId;
  if (mid) {
    switch (mid) {
      case 'angles':
        return 'Check whether the angles are supplementary (sum to 180°) or complementary (sum to 90°).';
      case 'pythagorean':
        return 'Use a² + b² = c², ensuring c is the hypotenuse opposite the right angle.';
      case 'linear-equations':
        return 'Apply inverse operations to both sides of the equation to isolate the variable term first.';
      case 'linear-inequalities':
        return 'Treat this like an equation, but reverse the inequality sign whenever multiplying or dividing both sides by a negative number.';
      case 'linear-functions':
        return 'Identify the slope (rate of change) and y-intercept (value when x = 0) from y = mx + b.';
      case 'systems-equations':
        return 'Use substitution if one variable is already isolated, or elimination by adding or subtracting the two equations.';
      case 'exponents-radicals':
        return 'Recall exponent rules: add exponents when multiplying like bases (xᵃ · xᵇ = xᵃ⁺ᵇ); multiply exponents when raising a power to a power.';
      case 'polynomials-factoring':
        return 'Look for a common factor first, or find factor pairs of the constant term that sum to the middle coefficient.';
      case 'quadratic-equations':
        return 'Rearrange into ax² + bx + c = 0, then try factoring or apply the quadratic formula.';
      case 'triangles':
        return 'Remember interior angles of any triangle always sum to 180°, and the sum of any two sides must exceed the third.';
      case 'polygons':
        return 'The sum of interior angles in an n-sided polygon is (n − 2) × 180°.';
      case 'circles':
        return 'Distinguish circumference (C = 2πr, distance around) from area (A = πr², space enclosed).';
      case 'area-perimeter':
        return 'Perimeter is the total boundary length around the outside; area is the number of square units covered inside.';
      case 'volume-surface':
        return 'Volume measures three-dimensional space inside, while surface area is the sum of all exposed outer faces.';
      case 'coordinate':
      case 'coordinate-geometry':
        return 'Use the distance formula √((x₂−x₁)² + (y₂−y₁)²) or slope formula (y₂−y₁)/(x₂−x₁).';
      case 'transformations':
        return 'Translations slide position, reflections flip across a mirror line, and rotations turn around a fixed center.';
      default:
        break;
    }
  }

  if (problem.format === 'blunder') {
    return 'Read each step from Step 1 onward to identify where the algebraic property or calculation first deviated.';
  }
  if (problem.format === 'sequence') {
    return 'Determine which operation must be completed first to simplify or isolate terms before final resolution.';
  }
  if (problem.format === 'tf-reason') {
    return 'Check whether the statement is universally true in every case, or if a single counterexample disproves it.';
  }
  if (problem.format === 'rule') {
    return 'Recall the core principle: which mathematical property preserves truth across operations?';
  }

  return 'Work through the problem step by step on paper, and check if your answer makes sense with the given values.';
}
