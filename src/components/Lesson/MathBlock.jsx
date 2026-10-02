import React from 'react';
import { processContent } from '../../utils/mathHelpers';

export const MathBlock = ({ content }) => {
  if (!content) return null;
  
  return (
    <div 
      className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
      dangerouslySetInnerHTML={{ __html: processContent(content) }}
    />
  );
};
export default MathBlock;
