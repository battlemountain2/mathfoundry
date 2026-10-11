import { useLocation } from 'react-router-dom';
import StudyWorkspace from '../../components/Study/StudyWorkspace';
export default function UnitPractice() {
  const { pathname } = useLocation();
  return <StudyWorkspace key={pathname} mode={pathname.endsWith('/application') ? 'application' : 'practice'} />;
}
