import { makeGeometryProblem } from '../data/geometryProblems.js';
import { makeProblem } from '../data/foundations.js';
import { makeExtendedMathProblem } from './extendedMath.js';

export const teachingPrinciples = {
  arithmetic:['Break a calculation into parts you can check.','Equal groups explain multiplication; division asks how many groups fit. Addition and subtraction move between quantities.'],
  equivalence:['Change the pieces, keep the amount.','Scaling the numerator and denominator by the same nonzero factor changes the number of pieces, not their total size.'],
  comparison:['Compare quantities using the same whole.','Equal-sized parts or a common number line make the larger quantity visible.'],
  addition:['Use equal-sized parts before combining.','A denominator names the size of the pieces. Rewrite the quantities with a common denominator before adding or subtracting numerators.'],
  multiplication:['Take a part of a part.','An overlapping area shows why the numerators and denominators multiply.'],
  division:['Count how many portions fit.','The amount divided by the size of one portion gives the number of portions. Multiplying by the reciprocal calculates the same quantity.'],
  'negative-numbers':['Numbers have position and direction.','Adding a positive amount moves right on a number line. Subtracting a positive amount moves left, including past zero.'],
  'decimals-place-value':['Locate each part of a whole.','Tenths divide one whole into ten parts; hundredths divide it into one hundred. Position determines the value of a digit.'],
  'ratios-percentages':['Identify the whole before its part.','Percent means per hundred. Scale the fraction of the whole rather than adding a percent as a fixed amount.'],
  'factors-multiples':['Find shared building blocks.','A factor divides a number into complete equal groups. A common factor works for both numbers.'],
  'order-of-operations':['Read the structure before calculating.','Grouping, powers, multiplication/division, then addition/subtraction set the order. Equal-priority operations proceed left to right.'],
  'intro-algebra':['Keep the equation balanced.','An equation says that two expressions have the same value. Apply the same inverse operation to both sides to isolate the unknown.'],
  'angles-lines':['Look for the relationship between angles.','A straight line gives 180° and a right corner gives 90°. Opposite angles are equal; parallel lines create equal corresponding and alternate angles.'],
  'triangles-pythagoras':['Connect length, angle, and area.','Triangle angles sum to 180°. For a right triangle only, the squares on its two legs have total area equal to the square on the hypotenuse.'],
  'area-perimeter':['Inside and boundary measure different things.','Area counts square units covering a surface. Perimeter adds lengths around its edge.'],
  'circles-radians':['Build a circle from its radius.','A diameter spans two radii. A radian measures an arc whose length equals one radius; a full turn is 2π radians.'],
  'volume-surface-area':['Build a solid one layer at a time.','Volume counts cubic units inside a solid. Surface area counts square units covering the exposed faces.'],
  'coordinate-geometry':['Read change from a graph.','Slope is vertical change divided by horizontal change. Keep the same point order in both differences.'],
};

const triples = [[3,4,5],[6,8,10],[9,12,15],[12,16,20],[15,20,25],[5,12,13],[10,24,26],[8,15,17],[7,24,25],[20,21,29]];

// Models for geometry follow the generator's explicit seed parameters, never guessed from an answer.
export function makeGeometryStudyProblem(id, seed = 0, format = 'numeric') {
  const s = Math.abs(seed), q = {...makeGeometryProblem(id,seed,format),seed};
  if (q.options) {
    const value = id === 'circles-radians' ? `${q.answer}π` : String(q.answer);
    q.answer = q.options.findIndex(option => String(option) === value);
    if (q.answer < 0) throw new Error('This question needs its answer choices checked.');
  }
  if (format === 'rule' && q.format === 'rule') return {...q,steps:[q.explanation],keyIssue:teachingPrinciples[id]?.[1]};
  switch(id) {
    case 'angles-lines': {
      const kind = s % 5;
      const known = [35 + s * 7 % 55,20 + s * 5 % 50,42 + s * 9 % 40,105 + s * 6 % 45,52 + s * 11 % 35][kind];
      q.visual = {kind:'angle',known,relationship:['straight','right','alternate','consecutive','corresponding'][kind]}; break;
    }
    case 'triangles-pythagoras': {
      if (s % 4 === 0) q.visual = {kind:'triangle-angles',a:30 + s * 7 % 50,b:40 + s * 11 % 45};
      else {const [a,b,c] = triples[s % 4 === 3 ? Math.floor(s/4)%4 : s % triples.length]; q.visual={kind:'triangle',a,b,c,unknown:s % 4 === 1 ? 'c' : s % 4 === 2 ? 'a' : 'area'};} break;
    }
    case 'area-perimeter': q.visual={kind:'rectangle',w:4 + s % 8,h:5 + s * 3 % 9,measure:q.id.startsWith('geom-area') ? 'area' : 'perimeter'}; break;
    case 'circles-radians': q.visual={kind:'circle',r:2 + s % 8}; break;
    case 'volume-surface-area': q.visual={kind:'box',l:3+s%5,w:2+s*2%4,h:4+s*3%6}; break;
    case 'coordinate-geometry': {const dx=2+s%5; q.visual={kind:'coordinates',dx,dy:dx*(1+s%3)}; break;}
  }
  if(q.visual?.kind==='triangle') q.subskill=q.visual.unknown==='a'?'pythagorean-leg':q.visual.unknown==='c'?'pythagorean-hypotenuse':'area';
  return {...q,steps:q.steps || [q.explanation],keyIssue:teachingPrinciples[id]?.[1]};
}

export function enrichStudyProblem(problem) {
  if (!problem) return problem;
  const q = {...problem};
  if (!q.steps && q.explanation) q.steps=[q.explanation];
  if (!q.keyIssue) q.keyIssue=teachingPrinciples[q.conceptId]?.[1];
  if (!q.visual && q.conceptId === 'equivalence' && q.sourceDenominator) q.visual={a:q.numerator,d:q.sourceDenominator,b:Number(q.answer),e:q.denominator,kind:'equivalence'};
  if (!q.visual && ['addition','comparison'].includes(q.conceptId)) {
    const m=q.question.match(/(\d+)\/(\d+) (?:[+−]|or) (\d+)\/(\d+)/);
    if(m) q.visual={a:Number(m[1]),d:Number(m[2]),b:Number(m[3]),e:Number(m[4]),subtract:q.question.includes('−'),kind:q.conceptId === 'comparison' ? 'comparison' : 'fraction-parts'};
  }
  if (q.visual || q.format === 'rule') return q;
  if (q.conceptId === 'arithmetic') {
    const m=q.question.match(/What is (\d+) ([×÷+−]) (\d+)\?/);
    if(m) q.visual={kind:'arithmetic',a:Number(m[1]),b:Number(m[3]),op:m[2]};
  }
  if (q.conceptId === 'multiplication') {
    const m=q.question.match(/(\d+)\/(\d+) of (\d+)\/(\d+)/);
    if(m) q.visual={kind:'fraction-product',a:Number(m[1]),d:Number(m[2]),b:Number(m[3]),e:Number(m[4])};
  }
  if (q.conceptId === 'division') {
    const m=q.question.match(/(\d+)\/(\d+) portions fit into (\d+)\/(\d+)/);
    if(m) q.visual={kind:'fraction-groups',a:Number(m[3]),d:Number(m[4]),b:Number(m[1]),e:Number(m[2])};
  }
  return q;
}

export function makeTeachingExample(unit, activeQuestion) {
  const id=unit.legacyConceptId || unit.id;
  let fallback=null;
  for(let seed=2;seed<65;seed++) {
    let q;
    if(unit.courseId === 'geometry') q=makeGeometryStudyProblem(id,seed);
    else q=makeExtendedMathProblem(id,seed) || enrichStudyProblem(makeProblem(id,seed));
    if(q.question === activeQuestion?.question) continue;
    if(!fallback) fallback=q;
    const target=activeQuestion?.visual;
    if(target && (q.visual?.kind!==target.kind || ['op','relationship','unknown','subtract'].some(key=>target[key]!==undefined&&q.visual?.[key]!==target[key]))) continue;
    return {...q,steps:q.steps || [q.explanation]};
  }
  return fallback;
}
