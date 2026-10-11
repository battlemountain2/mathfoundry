import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import LessonPlayer from '../../components/Study/LessonPlayer';
import { addSubtractFractionsLesson } from '../../data/lessons/addSubtractFractions';
import { arithmeticLesson } from '../../data/lessons/arithmetic';
import { anglesLinesLesson } from '../../data/lessons/anglesLines';
import { trianglesPythagorasLesson } from '../../data/lessons/trianglesPythagoras';

const lessonRegistry = {
  'arithmetic': arithmeticLesson,
  'add-subtract-fractions': addSubtractFractionsLesson,
  'angles-lines': anglesLinesLesson,
  'triangles-pythagoras': trianglesPythagorasLesson,
};

export default function LessonView() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  const cId = courseId || 'math';
  const uId = unitId || 'arithmetic';
  const selectedLesson = lessonRegistry[uId];
  if (!selectedLesson) return <div className="study-page"><h1>This lesson is still being authored.</h1><p>Choose an available activity from the unit.</p><Link to={`/courses/${cId}/${uId}`}>Back to unit</Link></div>;

  return (
    <LessonPlayer
      courseId={cId}
      unitId={uId}
      unitPath={`${cId}/${uId}`}
      lesson={selectedLesson}
      onExit={() => navigate(`/courses/${cId}/${uId}`)}
      onComplete={() => navigate(`/courses/${cId}/${uId}/practice`)}
    />
  );
}
