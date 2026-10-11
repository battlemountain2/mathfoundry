import { useState } from 'react';
import MathBlock from '../Lesson/MathBlock';

const range = n => Array.from({length:n},(_,i)=>i);
const divisors = n => range(n).map(i=>i+1).filter(d=>n%d===0);
const dot = (x,y,label,key) => <g key={key}><circle cx={x} cy={y} r="5" className="figure-dot"/><text x={x} y={y-12} textAnchor="middle">{label}</text></g>;

// Diagrams use question parameters. Showing calculations is a separate, explicit choice.
export default function ConceptFigure({ visual:v }) {
  const [reveal,setReveal] = useState(false);
  const [split,setSplit] = useState(1);
  const [stage,setStage] = useState(0);
  if(!v) return null;
  let title, description, diagram, controls, calculation;
  switch(v.kind) {
    case 'arithmetic': {
      const multiply = v.op==='×' || v.op==='÷';
      const rows = v.op==='÷' ? v.b : v.a, cols = v.op==='÷' ? v.a/v.b : v.b;
      title=multiply ? 'See equal groups.' : 'Move between quantities.';
      if(multiply) {
        diagram=<div className="figure-array" style={{gridTemplateColumns:`repeat(${cols},1fr)`}} aria-label={`${rows} equal rows, each with ${cols} counters`}>{range(rows*cols).map(i=><span key={i} className={Math.floor(i/cols)<split ? 'part-a' : 'part-b'}/>)}</div>;
        controls=<label className="figure-control">Separate the first {split} {split===1?'row':'rows'}<input aria-label="Rows in the first group" type="range" min="1" max={rows} value={split} onChange={e=>setSplit(Number(e.target.value))}/></label>;
        description=`The two colors separate ${split} ${split===1?'row':'rows'} from ${rows-split} ${rows-split===1?'row':'rows'}. Every row still contains ${cols} counters.`;
        calculation=`${split} × ${cols} + ${rows-split} × ${cols} = ${rows*cols}. ${v.op==='÷' ? `${v.a} ÷ ${v.b} = ${cols}.` : `${v.a} × ${v.b} = ${rows*cols}.`}`;
      } else {
        const end=v.op==='+'?v.a+v.b:v.a-v.b, min=Math.min(0,end), max=Math.max(v.a,end)+5;
        const px=n=>30+(n-min)/(max-min)*260;
        diagram=<svg viewBox="0 0 320 140" role="img" aria-label={`Start at ${v.a} and move ${v.b} ${v.op==='+'?'right':'left'}`}><line x1="30" x2="290" y1="90" y2="90"/>{dot(px(0),90,'0','zero')}{dot(px(v.a),90,v.a,'start')}<path d={`M ${px(v.a)} 75 Q ${(px(v.a)+px(end))/2} 10 ${px(end)} 75`} className="figure-change"/>{dot(px(end),90,reveal ? end : '?','end')}<text x="160" y="30" textAnchor="middle">{v.op}{v.b}</text></svg>;
        description='Follow the movement from the starting quantity. The direction comes from the operation.';
        calculation=`${v.a} ${v.op} ${v.b} = ${end}.`;
      } break;
    }
    case 'number-line': {
      title='Direction matters.';const end=v.start+v.change,min=Math.min(v.start,end,0)-2,max=Math.max(v.start,end,0)+2,px=n=>25+(n-min)/(max-min)*270;
      diagram=<svg viewBox="0 0 320 160" role="img" aria-label={`Number line from ${min} to ${max}, starting at ${v.start}, change ${v.change}`}><line x1="25" x2="295" y1="100" y2="100"/>{range(max-min+1).map(i=><g key={i}><line x1={px(min+i)} x2={px(min+i)} y1="95" y2="105"/>{(min+i===0||i===0||i===max-min)&&<text x={px(min+i)} y="128" textAnchor="middle">{min+i}</text>}</g>)}{dot(px(v.start),100,v.start,'start')}<path d={`M ${px(v.start)} 80 Q ${(px(v.start)+px(end))/2} 15 ${px(end)} 80`} className="figure-change"/>{dot(px(end),100,reveal ? end : '?','end')}</svg>;
      description=`Start at ${v.start}. Move ${Math.abs(v.change)} places ${v.change<0?'left':'right'}. Zero is a reference point, not a barrier.`;
      calculation=`${v.start} ${v.change<0?'−':'+'} ${Math.abs(v.change)} = ${end}.`;break;
    }
    case 'hundred-grid':
    case 'ratio': {
      const count=v.kind==='ratio'?v.percent:v.count;
      title=v.kind==='ratio'?'A part of the whole.':'One whole. One hundred parts.';
      diagram=<div className="figure-hundred" aria-label={`${count} shaded cells out of 100`}>{range(100).map(i=><span className={i<count?'part-a':''} key={i}/>)}</div>;
      description=v.kind==='ratio'?`The entire grid represents ${v.total}. ${count} of its 100 equal parts are selected.`:`Each small square is one hundredth. ${count} squares are selected.`;
      calculation=v.kind==='ratio'?`${v.percent}/100 × ${v.total} = ${v.percent*v.total/100}.`:`${v.count}/100 = ${(v.count/100).toFixed(2)}.`;break;
    }
    case 'factors': {
      title='Find a grouping that works twice.';
      const common=divisors(v.a).filter(d=>v.b%d===0);
      controls=<label className="figure-control">Try a group size<select aria-label="Factor group size" value={split} onChange={e=>setSplit(Number(e.target.value))}>{range(Math.max(v.a,v.b)).map(i=><option key={i} value={i+1}>{i+1}</option>)}</select></label>;
      diagram=<div className="figure-factor-pair">{[v.a,v.b].map(n=><div key={n}><strong>{n} counters</strong><div className="figure-factor-groups">{range(Math.ceil(n/split)).map(i=><span key={i} className="factor-group">{Math.min(split,n-i*split)}</span>)}</div><p>{n%split===0?'All groups are complete.':`Last group has ${n%split} of ${split}; not a divisor.`}</p></div>)}</div>;
      description='A common divisor makes complete groups in both quantities. Try several sizes, then choose the largest that works.';
      calculation=`Common divisors: ${common.join(', ')}. Greatest: ${common.at(-1)}.`;break;
    }
    case 'expression': {
      title='See the expression’s structure.';
      diagram=<div className="figure-expression"><span>{v.a}</span><span>+</span><div className="figure-operation"><span>{v.b} × {v.c}</span><small>First operation</small></div></div>;
      description='The multiplication forms one part of the addition. Read that part before combining the quantities.';
      calculation=`${v.b} × ${v.c} = ${v.b*v.c}; then ${v.a} + ${v.b*v.c} = ${v.a+v.b*v.c}.`;break;
    }
    case 'balance': {
      title='Make the same change on both sides.';
      const left=stage===0?`${v.a}x + ${v.b}`:stage===1?`${v.a}x`:'x';
      const right=stage===0?v.total:stage===1?v.total-v.b:(v.total-v.b)/v.a;
      diagram=<svg viewBox="0 0 320 170" role="img" aria-label={`Balanced equation: ${left} equals ${right}`}><line x1="35" y1="65" x2="285" y2="65"/><path d="M 160 65 L 130 140 L 190 140 Z" className="figure-soft"/><path d="M 45 65 L 35 115 L 115 115 L 105 65 M 215 65 L 205 115 L 285 115 L 275 65"/><text x="75" y="45" textAnchor="middle">{left}</text><text x="245" y="45" textAnchor="middle">{right}</text><text x="160" y="55" textAnchor="middle">=</text></svg>;
      controls=<div className="study-actions"><button className="study-button secondary" onClick={()=>setStage(Math.min(2,stage+1))} disabled={stage===2}>{stage===0?`Subtract ${v.b} from both sides`:stage===1?`Divide both sides by ${v.a}`:'Unknown isolated'}</button><button className="study-text-button" onClick={()=>setStage(0)}>Reset model</button></div>;
      description=stage===0?'Equal heights represent equal values. Undo the added amount first.':stage===1?'The same amount was removed from each side. Equality is preserved.':'Both sides were divided by the same nonzero coefficient. Check the value in the original equation.';
      calculation=`x = ${(v.total-v.b)/v.a}; ${v.a} × ${(v.total-v.b)/v.a} + ${v.b} = ${v.total}.`;break;
    }
    case 'fraction-product': {
      title='A part of a part.';
      diagram=<div className="figure-product" style={{gridTemplateColumns:`repeat(${v.e},1fr)`}} aria-label={`${v.d} rows and ${v.e} columns, overlapping ${v.a} rows and ${v.b} columns`}>{range(v.d*v.e).map(i=><span key={i} className={Math.floor(i/v.e)<v.a&&i%v.e<v.b?'overlap':Math.floor(i/v.e)<v.a?'part-a':i%v.e<v.b?'part-b':''}/>)}</div>;
      description=`One direction selects ${v.a}/${v.d}; the other selects ${v.b}/${v.e}. The overlap is the part selected in both directions.`;
      calculation=`${v.a*v.b} overlapping parts out of ${v.d*v.e}: (${v.a}/${v.d}) × (${v.b}/${v.e}) = ${v.a*v.b}/${v.d*v.e}.`;break;
    }
    case 'fraction-groups': {
      title='Count portions, not pieces of a new whole.';
      const common=v.d*v.e, amount=v.a*v.e, portion=v.b*v.d;
      diagram=<div className="figure-portions" aria-label={`Amount ${v.a}/${v.d}; each portion ${v.b}/${v.e}`}><p>Available amount: {v.a}/{v.d}</p><div className="figure-product" style={{gridTemplateColumns:`repeat(${common},1fr)`}}>{range(common).map(i=><span key={i} className={i<amount?'part-a':''}/>)}</div><p>Size of one portion: {v.b}/{v.e}</p><div className="figure-product" style={{gridTemplateColumns:`repeat(${common},1fr)`}}>{range(common).map(i=><span key={i} className={i<portion?'part-b':''}/>)}</div></div>;
      description='Both strips use the same whole and the same-sized subdivisions. How many copies of the lower amount fit inside the upper amount?';
      calculation=`${amount} small parts ÷ ${portion} parts per portion = ${amount/portion} portions.`;break;
    }
    case 'angle': {
      title='Read the angle relationship.';
      const parallel=['alternate','consecutive','corresponding'].includes(v.relationship);
      if(parallel) {
        const knownX=v.relationship==='consecutive'?196:v.relationship==='corresponding'?160:122, unknownX=v.relationship==='corresponding'?210:212;
        diagram=<svg viewBox="0 0 320 200" role="img" aria-label={`Parallel lines crossed by a transversal; ${v.relationship} angle relationship`}><line x1="20" y1="60" x2="300" y2="60"/><line x1="20" y1="145" x2="300" y2="145"/><line x1="90" y1="15" x2="245" y2="185"/><text x={knownX} y={v.relationship==='corresponding'?45:88}>{v.known}°</text><text x={unknownX} y={v.relationship==='corresponding'?130:130}>x</text><text x="35" y="45">L₁</text><text x="35" y="130">L₂</text></svg>;
      } else {
        const radians=v.known*Math.PI/180;
        diagram=<svg viewBox="0 0 320 200" role="img" aria-label={`${v.relationship==='right'?'Right corner':'Straight line'} divided by an angle of ${v.known} degrees`}><line x1="155" y1="155" x2="285" y2="155"/><line x1="155" y1="155" x2={v.relationship==='right'?155:25} y2={v.relationship==='right'?25:155}/><line x1="155" y1="155" x2={155+115*Math.cos(radians)} y2={155-115*Math.sin(radians)}/><text x="212" y="135">{v.known}°</text><text x={v.relationship==='right'?168:107} y={v.relationship==='right'?65:105}>x</text></svg>;
      }
      description=parallel?'The sketch shows the positions; it is not drawn to scale. Match the angle pair before choosing equality or a sum.':'The given angle and x together fill the marked corner or straight line.';
      calculation=['straight','consecutive'].includes(v.relationship)?`x = 180° − ${v.known}° = ${180-v.known}°.`:v.relationship==='right'?`x = 90° − ${v.known}° = ${90-v.known}°.`:`x = ${v.known}°.`;break;
    }
    case 'triangle-angles': {
      title='Three corners make a straight angle.';
      diagram=<svg viewBox="0 0 320 200" role="img" aria-label={`Triangle with two known angles ${v.a} and ${v.b} degrees, third angle x; schematic`}><path d="M 40 160 L 155 25 L 280 160 Z" className="figure-soft"/><text x="68" y="149">{v.a}°</text><text x="238" y="149">{v.b}°</text><text x="151" y="62">x</text></svg>;
      description='This is a schematic triangle. The three interior angles always sum to 180°.';
      calculation=`x = 180° − (${v.a}° + ${v.b}°) = ${180-v.a-v.b}°.`;break;
    }
    case 'triangle': {
      title=v.unknown==='area'?'Half of the surrounding rectangle.':'Lengths connect through square areas.';
      const scale=140/Math.max(v.a,v.b),right=55+v.b*scale,top=175-v.a*scale;
      diagram=<svg viewBox="0 0 320 220" role="img" aria-label={`Right triangle; perpendicular legs a and b, hypotenuse c`}><path d={`M 55 ${top} L 55 175 L ${right} 175 Z`} className="figure-soft"/><path d="M 55 161 L 69 161 L 69 175"/><text x="30" y={(top+175)/2}>{v.unknown==='a'?'a = ?':`a = ${v.a}`}</text><text x={(right+55)/2} y="198" textAnchor="middle">b = {v.b}</text><text x={(right+55)/2+14} y={(top+175)/2-8}>{v.unknown==='c'?'c = ?':`c = ${v.c}`}</text></svg>;
      description='The small corner marks the right angle. Only this case permits a² + b² = c². The diagram follows the side proportions.';
      calculation=v.unknown==='area'?`Area = (${v.a} × ${v.b}) / 2 = ${v.a*v.b/2}.`:`${v.a}² + ${v.b}² = ${v.c}²; ${v.a*v.a} + ${v.b*v.b} = ${v.c*v.c}.`;break;
    }
    case 'rectangle': {
      title='Surface or boundary?';const scale=210/Math.max(v.w,v.h),w=v.w*scale,h=v.h*scale;
      diagram=<svg viewBox="0 0 320 290" role="img" aria-label={`Rectangle width ${v.w}, height ${v.h}`}><rect x="45" y="35" width={w} height={h} className={stage?'figure-boundary':'figure-soft'}/>{!stage&&range(v.w+1).map(i=><line key={`x${i}`} x1={45+i*scale} x2={45+i*scale} y1="35" y2={35+h} className="figure-grid-line"/>)}{!stage&&range(v.h+1).map(i=><line key={`y${i}`} x1="45" x2={45+w} y1={35+i*scale} y2={35+i*scale} className="figure-grid-line"/>)}<text x={45+w/2} y={58+h} textAnchor="middle">{v.w} units</text><text x="10" y={35+h/2}>{v.h}</text></svg>;
      controls=<div className="study-actions"><button className="study-button secondary" aria-pressed={!stage} onClick={()=>setStage(0)}>Count square units</button><button className="study-button secondary" aria-pressed={Boolean(stage)} onClick={()=>setStage(1)}>Trace the boundary</button></div>;
      description=stage?'The boundary has two widths and two heights. Perimeter is a length.':'The surface has rows and columns of unit squares. Area uses square units.';
      calculation=`Area = ${v.w*v.h} square units. Perimeter = 2 × (${v.w} + ${v.h}) = ${2*(v.w+v.h)} units.`;break;
    }
    case 'circle': {
      title='Two radii span the circle.';
      diagram=<svg viewBox="0 0 320 240" role="img" aria-label={`Circle with radius ${v.r}; a diameter crosses its center`}><circle cx="160" cy="115" r="88" className="figure-soft"/><line x1="72" y1="115" x2="248" y2="115"/>{dot(160,115,'center','center')}<text x="203" y="143" textAnchor="middle">r = {v.r}</text><text x="114" y="143" textAnchor="middle">r</text></svg>;
      description='A diameter joins opposite edges through the center. Each half is a radius.';
      calculation=`Diameter = 2 × ${v.r} = ${2*v.r}.`;break;
    }
    case 'box': {
      title='Stack equal layers.';
      diagram=<svg viewBox="0 0 320 230" role="img" aria-label={`Cuboid length ${v.l}, width ${v.w}, height ${v.h}; schematic`}><path d="M 55 75 L 215 75 L 215 190 L 55 190 Z M 55 75 L 105 35 L 265 35 L 215 75 M 215 190 L 265 150 L 265 35" className="figure-soft"/>{range(v.h-1).map(i=><line key={i} x1="55" x2="215" y1={75+115*(i+1)/v.h} y2={75+115*(i+1)/v.h} className="figure-grid-line"/>)}<text x="135" y="218" textAnchor="middle">length {v.l}</text><text x="230" y="58">{v.w}</text><text x="14" y="135">{v.h}</text></svg>;
      description=`Each horizontal layer contains ${v.l} × ${v.w} unit cubes. Stack ${v.h} layers. The drawing is schematic.`;
      calculation=`${v.l*v.w} cubes per layer × ${v.h} layers = ${v.l*v.w*v.h} cubic units.`;break;
    }
    case 'coordinates': {
      title='Read rise and run.';const x=50+v.dx/Math.max(v.dx,v.dy)*160,y=195-v.dy/Math.max(v.dx,v.dy)*160;
      diagram=<svg viewBox="0 0 320 240" role="img" aria-label={`Coordinate segment from zero to (${v.dx}, ${v.dy}); equal axis scales`}><line x1="50" y1="195" x2="295" y2="195"/><line x1="50" y1="195" x2="50" y2="20"/><path d={`M 50 195 L ${x} ${y}`} className="figure-change"/><path d={`M 50 195 L ${x} 195 L ${x} ${y}`} className="figure-dashed"/>{dot(x,y,`(${v.dx}, ${v.dy})`,'point')}<text x={(x+50)/2} y="220" textAnchor="middle">run {v.dx}</text><text x={x+10} y={(y+195)/2}>rise {v.dy}</text><text x="30" y="210">0</text></svg>;
      description='Horizontal change is run; vertical change is rise. The slope compares these changes, not the segment’s length.';
      calculation=`Slope = ${v.dy}/${v.dx} = ${v.dy/v.dx}.`;break;
    }
    default: return null;
  }
  return <figure className="v3-figure concept-figure"><figcaption><span className="eyebrow">Visual reasoning</span><h3>{title}</h3></figcaption>{diagram}{controls}<p aria-live="polite">{description}</p><button className="study-text-button" aria-expanded={reveal} onClick={()=>setReveal(!reveal)}>{reveal?'Hide the calculation':'Connect the model to the calculation'}</button>{reveal&&<div className="figure-calculation"><MathBlock content={calculation}/></div>}</figure>;
}
