import { useLocation } from 'react-router-dom';
import StudyWorkspace from '../../components/Study/StudyWorkspace';
export default function UnitQuiz() {
  const { pathname } = useLocation();
  return <StudyWorkspace key={pathname} mode="quiz" />;
}
