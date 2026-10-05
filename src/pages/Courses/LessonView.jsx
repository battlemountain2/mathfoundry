import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LessonPlayer from '../../components/Study/LessonPlayer';
import { addSubtractFractionsLesson } from '../../data/lessons/addSubtractFractions';
import { arithmeticLesson } from '../../data/lessons/arithmetic';

const lessonRegistry = {
  'arithmetic': arithmeticLesson,
  'add-subtract-fractions': addSubtractFractionsLesson,
};

export default function LessonView() {
  const { courseId, unitId } = useParams();
  const navigate = useNavigate();

  const cId = courseId || 'math';
  const uId = unitId || 'arithmetic';
  const selectedLesson = lessonRegistry[uId] || addSubtractFractionsLesson;

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
