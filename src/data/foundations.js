export const concepts = [
  { id:'arithmetic', title:'Arithmetic relationships', description:'Use the four operations and decomposition with paper or mentally.', prerequisites:[], bridge:'Supports fraction simplification, ratios and unit conversions.' },
  { id:'equivalence', title:'Equivalent fractions', description:'Change the parts without changing the amount.', prerequisites:['arithmetic'], bridge:'Supports common denominators and scale drawings.' },
  { id:'comparison', title:'Compare fractions', description:'Reason about size before doing a calculation.', prerequisites:['equivalence'], bridge:'Supports estimation and checking reasonable answers.' },
  { id:'addition', title:'Add and subtract fractions', description:'Use equal-sized parts, then combine them.', prerequisites:['equivalence'], bridge:'Supports algebra with rational expressions.' },
  { id:'multiplication', title:'Multiply fractions', description:'Find a fraction of a fraction.', prerequisites:['arithmetic','equivalence'], bridge:'Supports proportions, scaling and quantitative science.' },
  { id:'division', title:'Divide fractions', description:'Count how many groups fit into an amount.', prerequisites:['multiplication'], bridge:'Supports rates, ratios and later physics.' },
];
const gcd = (a,b) => b ? gcd(b,a%b) : Math.abs(a);
export function fraction(n,d) { const g=gcd(n,d); return d/g===1 ? String(n/g) : `${n/g}/${d/g}`; }
const examples = {
  arithmetic: { question:'What is 7 × 6?', steps:['Split 7 into 5 + 2.','5 × 6 = 30 and 2 × 6 = 12.','30 + 12 = 42. Check: 42 ÷ 6 = 7.'] },
  equivalence:{ question:'Write 2/5 with denominator 15.', steps:['15 is 5 × 3.','Multiply the numerator by that same 3: 2 × 3 = 6.','2/5 = 6/15. The pieces are smaller, but the amount stays the same.'] },
  comparison:{ question:'Which is larger: 3/4 or 2/3?', steps:['Write both in twelfths: 3/4 = 9/12 and 2/3 = 8/12.','The parts now have the same size.','9 parts is more than 8, so 3/4 is larger.'] },
  addition:{ question:'Add 1/4 + 1/6.', steps:['Use a common denominator of 12.','1/4 = 3/12; 1/6 = 2/12.','3/12 + 2/12 = 5/12. It is a little less than 1/2, which makes sense.'] },
  multiplication:{ question:'Find 2/3 of 3/5.', steps:['“Of” means multiply: (2 × 3)/(3 × 5) = 6/15.','Simplify by dividing both numerator and denominator by 3: 2/5.','The result is smaller than 3/5 because we only took part of it.'] },
  division:{ question:'How many 1/4 portions fit into 3/4?', steps:['Three quarters contains three quarter-sized portions.','Calculate (3/4) ÷ (1/4) = (3/4) × (4/1) = 3.','Check: 3 × 1/4 = 3/4.'] },
};
export function makeProblem(conceptId, seed = 0, format = 'numeric') {
  const v=Math.abs(seed)%6;
  const base={conceptId, example:examples[conceptId], format, id:`${conceptId}-${seed}-${format}`};
  if (format==='rule') {
    const rules={
      arithmetic:['To check a division answer, which operation can undo division?',['Multiplication','Addition','Subtract the divisor'],0,'Multiplication and division undo each other.'],
      equivalence:['To keep a fraction equivalent, what must you do?',['Multiply only the denominator','Multiply numerator and denominator by the same nonzero number','Add the same number to both'],1,'Scaling both numerator and denominator by the same factor preserves the value.'],
      comparison:['Once two fractions have the same positive denominator, how do you compare them?',['Compare numerators','The smaller numerator is larger','Multiply denominators again'],0,'With equal-sized parts, more parts means a larger amount.'],
      addition:['To add fractions with different denominators, what comes first?',['Add the denominators','Multiply the numerators','Rewrite using a common denominator'],2,'Rewrite in equal-sized parts, then add numerators and keep the common denominator.'],
      multiplication:['How do you multiply two fractions?',['Add numerators and denominators','Multiply numerators, multiply denominators, then simplify','Always find a common denominator first'],1,'Multiply across. A common denominator is not required.'],
      division:['To divide by a nonzero fraction, which rule works?',['Multiply by its reciprocal','Invert both fractions','Divide the numerators and keep the first denominator'],0,'Multiply by the reciprocal of the divisor. Check by multiplying the quotient by the original divisor.'],
    };
    const [question,options,answer,explanation]=rules[conceptId]; return {...base,question,options,answer,explanation};
  }
  switch(conceptId) {
    case 'arithmetic': {
      const a=8+v,b=3+v,kind=seed%4;
      if(kind===0) return {...base,question:`What is ${a} × ${b}?`,answer:String(a*b),explanation:`${a} × ${b} = ${a*b}. Check with ${a*b} ÷ ${a} = ${b}. Use decomposition or written arithmetic.`};
      if(kind===1) return {...base,question:`What is ${a*b} ÷ ${a}?`,answer:String(b),explanation:`${a} × ${b} = ${a*b}, so ${a*b} ÷ ${a} = ${b}.`};
      const example=kind===2?{question:'What is 27 + 18?',steps:['Split 18 into 10 + 8.','27 + 10 = 37.','37 + 8 = 45. Check: 45 − 18 = 27.']}:{question:'What is 43 − 17?',steps:['Split 17 into 10 + 7.','43 − 10 = 33.','33 − 7 = 26. Check: 26 + 17 = 43.']};
      const x=20+a,y=10+b;
      return {...base,example,question:`What is ${x} ${kind===2?'+':'−'} ${y}?`,answer:String(kind===2?x+y:x-y),explanation:kind===2?`${x} + ${y} = ${x+y}. Check: ${x+y} − ${y} = ${x}.`:`${x} − ${y} = ${x-y}. Check: ${x-y} + ${y} = ${x}.`};
    }
    case 'equivalence': { const n=1+v%3,d=n+2,k=2+v%2; return {...base,format:format==='visual'?'visual':'numeric',question:`${n}/${d} = ?/${d*k}. How many of the ${d*k} smaller parts represent the same amount?`, denominator:d*k, numerator:n, sourceDenominator:d, answer:String(n*k), explanation:`Multiply the denominator by ${k}, and the numerator by ${k}: ${n} × ${k} = ${n*k}. ${n}/${d} = ${n*k}/${d*k}.`}; }
    case 'comparison': { const pairs=[[1,2,2,5],[2,3,3,5],[3,5,5,8],[3,4,4,5],[1,3,2,7],[5,6,7,9]]; const [a,b,c,d]=pairs[v]; const left=a*d>c*b; return {...base,format:'rule',question:`Which is larger: ${a}/${b} or ${c}/${d}?`,options:[`${a}/${b}`,`${c}/${d}`],answer:left?0:1,explanation:`Use denominator ${b*d}: ${a*d}/${b*d} versus ${c*b}/${b*d}. ${left?a*d:c*b} parts is larger.`}; }
    case 'addition': { const d=3+v,e=d+1,subtract=v%2===1,n=subtract?e-d:e+d;
      return {...base,example:subtract?{question:'Subtract 3/4 − 1/6.',steps:['Use a common denominator of 12.','3/4 = 9/12; 1/6 = 2/12.','9/12 − 2/12 = 7/12. Check: 7/12 + 2/12 = 9/12 = 3/4.']}:base.example,question:`${subtract?'Subtract':'Add'} 1/${d} ${subtract?'−':'+'} 1/${e}. Enter a fraction.`, answer:fraction(n,d*e),explanation:`Use denominator ${d*e}: ${e}/${d*e} ${subtract?'−':'+'} ${d}/${d*e} = ${n}/${d*e}, or ${fraction(n,d*e)} simplified.`}; }
    case 'multiplication': { const d=4+v,e=3+v; return {...base,question:`Find 2/${d} of 1/${e}. Enter a fraction.`,answer:fraction(2,d*e),explanation:`Multiply: (2 × 1)/(${d} × ${e}) = 2/${d*e}, or ${fraction(2,d*e)} simplified.`}; }
    case 'division': { const d=5+v,n=2+v%3; return {...base,question:`How many 1/${d} portions fit into ${n}/${d}?`,answer:String(n),explanation:`${n}/${d} ÷ 1/${d} = ${n}/${d} × ${d}/1 = ${n}. Check: ${n} × 1/${d} = ${n}/${d}.`}; }
    default: throw new Error('Unknown concept');
  }
}
export function makeFoundationSession(mode, conceptId, previous = [], minutes = 30) {
  const id=crypto.randomUUID();
  const seed=mode==='baseline'?previous.length:previous.filter(attempt=>attempt.conceptId===conceptId).length;
  const questions=['baseline','mixed'].includes(mode) ? concepts.map((concept,i)=>makeProblem(concept.id,seed+i,mode==='mixed' && i===1?'visual':'numeric')) : Array.from({length:6},(_,i)=>makeProblem(conceptId,seed+i,i===0?'rule':i===2 && conceptId==='equivalence'?'visual':'numeric'));
  return {id,mode,minutes,questions,index:0,answers:[],input:'',assisted:false,checked:false,exampleOpen:false,createdAt:new Date().toISOString()};
}


export function makeEngineeringSession(previous = []) {
  const id=crypto.randomUUID();
  const questions=[
    {id:'scale-half',conceptId:'multiplication',format:'numeric',question:'A model drawing uses half the real length. A real beam is 3/4 metre long. How many metres long is it in the drawing? Enter the number only.',answer:'3/8',explanation:'The drawing length is (1/2) × (3/4) = 3/8 metre. A half-scale drawing must be shorter than the real beam.',example:{question:'At half scale, how long is a 2/3 metre beam in the drawing?',steps:['Multiply real length by scale: (1/2) × (2/3).','Multiply across: 2/6 = 1/3 metre.','Check: twice 1/3 metre is the original 2/3 metre.']}},
    {id:'measure-sections',conceptId:'addition',format:'numeric',question:'Two straight sections end to end measure 1/2 metre and 1/4 metre. Ignore any overlap. What is the total length in metres? Enter the number only.',answer:'3/4',explanation:'Rewrite 1/2 as 2/4. Add 2/4 + 1/4 = 3/4 metre. The total is greater than either individual section.',example:{question:'Combine lengths of 1/3 metre and 1/6 metre, with no overlap.',steps:['Rewrite 1/3 as 2/6.','2/6 + 1/6 = 3/6 = 1/2 metre.','Keep the unit: both inputs and the sum are lengths in metres.']}},
  ];
  return {id,mode:'application',minutes:30,questions,index:0,answers:[],input:'',assisted:false,checked:false,exampleOpen:false,createdAt:new Date().toISOString(),previousCount:previous.length};
}
