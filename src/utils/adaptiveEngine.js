import { practiceBank } from '../data/practiceBank';

/**
 * Generate an adaptive practice session weighted toward the student's weak areas.
 * 
 * @param {Object} options
 * @param {Object} options.progress - Module completion progress
 * @param {Object} options.diagnosticResults - Diagnostic quiz results with weakAreas/moderateAreas
 * @param {Array}  options.practiceHistory - Past session results
 * @param {Object} options.formatPerformance - Per-format correct/total stats
 * @param {Object} options.mastery - Per-module mastery scores
 * @param {number} options.questionCount - Number of questions (default 12)
 * @returns {Array} Selected and shuffled questions
 */
export function generateAdaptiveSession({
  progress = {},
  diagnosticResults = null,
  practiceHistory = [],
  formatPerformance = {},
  mastery = {},
  questionCount = 12,
} = {}) {
  const allQuestions = [...practiceBank];
  
  // Score each question by how much the student needs it
  const scored = allQuestions.map(q => {
    let weight = 1;
    
    // Boost questions from weak diagnostic areas (3x weight)
    if (diagnosticResults?.weakAreas?.length) {
      const moduleCategory = getCategoryForModule(q.moduleId);
      if (diagnosticResults.weakAreas.includes(moduleCategory) || 
          diagnosticResults.weakAreas.includes(q.moduleId)) {
        weight += 3;
      }
    }
    
    // Boost questions from moderate diagnostic areas (1.5x)
    if (diagnosticResults?.moderateAreas?.length) {
      const moduleCategory = getCategoryForModule(q.moduleId);
      if (diagnosticResults.moderateAreas.includes(moduleCategory) ||
          diagnosticResults.moderateAreas.includes(q.moduleId)) {
        weight += 1.5;
      }
    }
    
    // Boost questions from low-mastery modules
    const moduleMastery = mastery[q.moduleId];
    if (moduleMastery) {
      const score = moduleMastery.score ?? 50;
      if (score < 40) weight += 3;        // very weak
      else if (score < 60) weight += 2;    // weak
      else if (score < 80) weight += 1;    // moderate
      // strong modules get no boost
    } else {
      // Never practiced — slight boost for untested modules
      weight += 1;
    }
    
    // Boost question formats the student struggles with
    const fmtPerf = formatPerformance[q.format];
    if (fmtPerf && fmtPerf.total >= 3) {
      const accuracy = fmtPerf.correct / fmtPerf.total;
      if (accuracy < 0.5) weight += 2;       // struggling with this format
      else if (accuracy < 0.7) weight += 1;  // moderate
    }
    
    // Add randomness to prevent identical sessions
    weight *= (0.7 + Math.random() * 0.6);
    
    return { question: q, weight };
  });
  
  // Sort by weight (highest first = most needed)
  scored.sort((a, b) => b.weight - a.weight);
  
  // Select questions ensuring format diversity
  const selected = [];
  const formatCounts = {};
  const maxPerFormat = Math.ceil(questionCount / 3); // No format dominates
  
  for (const { question } of scored) {
    if (selected.length >= questionCount) break;
    
    const fmt = question.format;
    formatCounts[fmt] = (formatCounts[fmt] || 0);
    
    // Don't let any format take more than ~40% of the session
    if (formatCounts[fmt] >= maxPerFormat) continue;
    
    // Don't repeat questions
    if (selected.find(s => s.id === question.id)) continue;
    
    selected.push(question);
    formatCounts[fmt]++;
  }
  
  // If we don't have enough (unlikely with 60+ questions), backfill
  if (selected.length < questionCount) {
    for (const { question } of scored) {
      if (selected.length >= questionCount) break;
      if (!selected.find(s => s.id === question.id)) {
        selected.push(question);
      }
    }
  }
  
  // Shuffle final selection so formats are mixed
  return shuffle(selected);
}

/**
 * Map moduleId to diagnostic category name.
 * The diagnostic uses category strings like 'angles', 'triangles', 'basic-shapes'.
 */
function getCategoryForModule(moduleId) {
  const map = {
    'points-lines': 'basic-shapes',
    'angles': 'angles',
    'triangles': 'triangles',
    'pythagorean': 'pythagorean',
    'polygons': 'polygons',
    'circles': 'circles',
    'area-perimeter': 'area-perimeter',
    'volume-surface': 'volume-surface',
    'coordinate': 'coordinate-geometry',
    'transformations': 'transformations',
    'variables-expressions': 'algebra',
    'linear-equations': 'algebra',
    'linear-inequalities': 'algebra',
    'linear-functions': 'algebra',
    'systems-equations': 'algebra',
    'exponents-radicals': 'algebra',
    'polynomials-factoring': 'algebra',
    'quadratic-equations': 'algebra',
  };
  return map[moduleId] || moduleId;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
