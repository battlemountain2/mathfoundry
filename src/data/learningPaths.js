export const learningPaths = [
  {
    id: 'geometry',
    title: 'Geometry Foundations',
    description: 'Master the building blocks of shapes, space, and measurement — essential for physical engineering.',
    icon: '📐',
    color: 'indigo',
    status: 'active',
    modules: [
      {
        id: 'points-lines',
        title: 'Points, Lines & Planes',
        description: 'The fundamental building blocks of geometry.',
        icon: '📍',
        category: 'basic-shapes',
        order: 1,
        totalLessons: 4,
        estimatedMinutes: 20,
      },
      {
        id: 'angles',
        title: 'Angles',
        description: 'Types of angles, measuring, and angle relationships.',
        icon: '📏',
        category: 'angles',
        order: 2,
        totalLessons: 5,
        estimatedMinutes: 25,
      },
      {
        id: 'triangles',
        title: 'Triangles',
        description: 'Classification, properties, congruence, and similarity.',
        icon: '🔺',
        category: 'triangles',
        order: 3,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
      {
        id: 'pythagorean',
        title: 'Pythagorean Theorem',
        description: 'Proof, applications, and the distance formula.',
        icon: '📐',
        category: 'pythagorean',
        order: 4,
        totalLessons: 4,
        estimatedMinutes: 25,
      },
      {
        id: 'polygons',
        title: 'Quadrilaterals & Polygons',
        description: 'Properties, classification, and area formulas.',
        icon: '⬡',
        category: 'polygons',
        order: 5,
        totalLessons: 4,
        estimatedMinutes: 25,
      },
      {
        id: 'circles',
        title: 'Circles',
        description: 'Radius, diameter, circumference, area, arcs, and sectors.',
        icon: '⭕',
        category: 'circles',
        order: 6,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
      {
        id: 'area-perimeter',
        title: 'Area & Perimeter',
        description: 'Combined formulas and composite figures.',
        icon: '📊',
        category: 'area-perimeter',
        order: 7,
        totalLessons: 4,
        estimatedMinutes: 25,
      },
      {
        id: 'volume-surface',
        title: 'Volume & Surface Area',
        description: '3D shapes — prisms, cylinders, cones, and spheres.',
        icon: '🧊',
        category: 'volume-surface',
        order: 8,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
      {
        id: 'coordinate',
        title: 'Coordinate Geometry',
        description: 'Plotting points, distance, midpoint, and slope.',
        icon: '📈',
        category: 'coordinate-geometry',
        order: 9,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
      {
        id: 'transformations',
        title: 'Transformations',
        description: 'Translations, rotations, reflections, and dilations.',
        icon: '🔄',
        category: 'transformations',
        order: 10,
        totalLessons: 4,
        estimatedMinutes: 25,
      },
    ],
  },
  {
    id: 'algebra',
    title: 'Algebra Foundations',
    description: 'Variables, linear equations, functions, factoring, and quadratics — the symbolic language of engineering.',
    icon: '∑',
    color: 'emerald',
    status: 'active',
    modules: [
      {
        id: 'variables-expressions',
        title: 'Variables, Expressions & Balance',
        description: 'Variables as physical quantities, PEMDAS in code, and like terms.',
        icon: '𝑥',
        category: 'algebra',
        order: 1,
        totalLessons: 4,
        estimatedMinutes: 20,
      },
      {
        id: 'linear-equations',
        title: 'Linear Equations in One Variable',
        description: 'The balanced scale principle, inverse operations, and Ohm\'s Law.',
        icon: '⚖️',
        category: 'algebra',
        order: 2,
        totalLessons: 5,
        estimatedMinutes: 25,
      },
      {
        id: 'linear-inequalities',
        title: 'Linear Inequalities & Tolerances',
        description: 'Number line regions, sign flipping, and engineering tolerance limits.',
        icon: '≤',
        category: 'algebra',
        order: 3,
        totalLessons: 4,
        estimatedMinutes: 20,
      },
      {
        id: 'linear-functions',
        title: 'Slope & Linear Functions',
        description: 'Rate of change, slope-intercept form (y = mx + b), and perpendicular slopes.',
        icon: '📈',
        category: 'algebra',
        order: 4,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
      {
        id: 'systems-equations',
        title: 'Systems of Linear Equations',
        description: 'Substitution, elimination, and Kirchhoff\'s circuit current balance.',
        icon: '⛓️',
        category: 'algebra',
        order: 5,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
      {
        id: 'exponents-radicals',
        title: 'Exponents, Radicals & Scientific Scale',
        description: 'Power laws, negative exponents, square roots, and engineering prefixes.',
        icon: '√',
        category: 'algebra',
        order: 6,
        totalLessons: 4,
        estimatedMinutes: 25,
      },
      {
        id: 'polynomials-factoring',
        title: 'Polynomials & Factoring',
        description: 'Polynomial anatomy, FOIL multiplication, GCF, and quadratic factoring.',
        icon: '🧩',
        category: 'algebra',
        order: 7,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
      {
        id: 'quadratic-equations',
        title: 'Quadratic Equations & Trajectories',
        description: 'The Quadratic Formula, parabolas, and projectile flight paths.',
        icon: '🚀',
        category: 'algebra',
        order: 8,
        totalLessons: 5,
        estimatedMinutes: 30,
      },
    ],
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry & Vectors',
    description: 'Unit circle, sine/cosine, and periodic oscillation — critical for statics and AC electronics.',
    icon: '∿',
    color: 'amber',
    status: 'coming-soon',
    modules: [],
  },
  {
    id: 'calculus',
    title: 'Pre-Calculus & Calculus',
    description: 'Limits, derivatives, and integrals — the mathematics of continuous change.',
    icon: '∫',
    color: 'rose',
    status: 'coming-soon',
    modules: [],
  },
];

export function getPath(pathId) {
  return learningPaths.find(p => p.id === pathId);
}

export function getModule(pathId, moduleId) {
  // If pathId is unknown or generic, search all paths
  if (pathId) {
    const path = getPath(pathId);
    if (path) {
      const m = path.modules.find(mod => mod.id === moduleId);
      if (m) return m;
    }
  }
  for (const track of learningPaths) {
    const m = track.modules.find(mod => mod.id === moduleId);
    if (m) return m;
  }
  return null;
}

export function getNextModule(pathId, currentModuleId) {
  let targetPath = getPath(pathId);
  if (!targetPath) {
    // Detect which path has this module
    targetPath = learningPaths.find(p => p.modules.some(m => m.id === currentModuleId));
  }
  if (!targetPath) return null;
  const idx = targetPath.modules.findIndex(m => m.id === currentModuleId);
  if (idx === -1 || idx === targetPath.modules.length - 1) return null;
  return targetPath.modules[idx + 1];
}
