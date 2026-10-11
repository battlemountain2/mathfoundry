import { useLocation } from 'react-router-dom';
import StudyWorkspace from '../../components/Study/StudyWorkspace';
export default function LessonView() { const {pathname}=useLocation(); return <StudyWorkspace key={pathname} initialSupport="learn" />; }
