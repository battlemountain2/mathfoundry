import { createContext, useContext, useEffect } from "react";

export const ActivityContext = createContext(null);
export function useActivityContext() {
  return useContext(ActivityContext);
}
export function useStudyActivity(activity) {
  const { setActivity } = useActivityContext();
  const serialized = JSON.stringify(activity);
  useEffect(() => {
    setActivity(JSON.parse(serialized));
    return () => setActivity(null);
  }, [serialized, setActivity]);
}
