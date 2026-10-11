import { useState } from 'react';
import ConceptFigure from './ConceptFigure';
import { enrichStudyProblem } from '../../utils/studyTeaching';

const fractionKinds = new Set(['equivalence','comparison','fraction-parts']);
export default function ProblemFigure({ problem }) {
  const q = enrichStudyProblem(problem);
  const v = q?.visual;
  if (v?.kind && !fractionKinds.has(v.kind)) return <ConceptFigure key={q.id} visual={v}/>;
  return <FractionFigure key={q?.id} problem={q}/>;
}

function FractionFigure({ problem }) {
  const v = problem?.visual;
  const [parts, setParts] = useState(v?.d || 2);
  if (!v) return <div className="v3-figure"><p className="eyebrow">Worked example</p><p>{problem?.example?.question || problem?.question}</p><ol>{(problem?.example?.steps || problem?.steps || [problem?.explanation]).filter(Boolean).map(s => <li key={s}>{s}</li>)}</ol></div>;
  const common = v.d * v.e;
  const aligned = parts % v.d === 0 && parts % v.e === 0;
  function bar(n, d, label) { return <div className="v3-bar-row"><span>{label}</span><div className="v3-strip" style={{gridTemplateColumns:`repeat(${parts}, 1fr)`}} aria-label={`${n}/${d}, partitioned into ${parts} pieces`}>{Array.from({length: parts}, (_, i) => <span key={i} style={{'--fill': `${Math.max(0, Math.min(1, n / d * parts - i)) * 100}%`}} />)}</div><strong>{n}/{d}</strong></div>; }
  return <figure className="v3-figure"><figcaption><span className="eyebrow">Figure 01 · Equal-sized parts</span><h3>Change the pieces. Keep the amount.</h3></figcaption>{bar(v.a, v.d, 'A')}{bar(v.b, v.e, 'B')}<label className="v3-partition">Parts per whole <select value={parts} onChange={e => setParts(Number(e.target.value))}>{[...new Set([v.d, v.e, common, common * 2])].sort((a,b)=>a-b).map(p => <option key={p}>{p}</option>)}</select></label><p aria-live="polite">{aligned && v.kind === 'equivalence' ? 'Both bars cover the same amount. Smaller pieces mean more pieces, not a larger value.' : aligned && v.kind === 'comparison' ? `Both bars use equal-sized pieces. Compare ${v.a * parts / v.d} with ${v.b * parts / v.e} pieces.` : aligned ? `Both boundaries align. ${v.a * parts / v.d} parts ${v.subtract ? 'minus' : 'plus'} ${v.b * parts / v.e} parts gives ${v.subtract ? v.a * parts / v.d - v.b * parts / v.e : v.a * parts / v.d + v.b * parts / v.e} of these pieces.` : 'The amounts stay fixed, but these divisions do not yet align with both fractions. Try another partition.'}</p><p className="study-muted">Each bar is one equally sized whole.</p></figure>;
}
