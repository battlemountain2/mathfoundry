import { useState } from "react";
import { ActivityContext } from "../../hooks/useStudyActivity";

export function ActivityProvider({ children }) {
  const [activity, setActivity] = useState(null);
  return (
    <ActivityContext.Provider value={{ activity, setActivity }}>
      {children}
    </ActivityContext.Provider>
  );
}
