import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonPlayer from '../../components/Study/LessonPlayer';
import { addSubtractFractionsLesson } from '../../data/lessons/addSubtractFractions';

export default function LessonView() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  const cId = courseId || 'math';
  const uId = unitId || 'add-subtract-fractions';

  return (
    <LessonPlayer
      courseId={cId}
      unitId={uId}
      unitPath={`${cId}/${uId}`}
      lesson={addSubtractFractionsLesson}
      onExit={() => navigate(`/courses/${cId}/${uId}`)}
      onComplete={() => navigate(`/courses/${cId}/${uId}/practice`)}
    />
  );
}
