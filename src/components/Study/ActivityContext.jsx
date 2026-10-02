import { createContext, useContext, useEffect, useState } from 'react';
const ActivityContext=createContext(null);
export function ActivityProvider({children}) {
  const [activity,setActivity]=useState(null);
  return <ActivityContext.Provider value={{activity,setActivity}}>{children}</ActivityContext.Provider>;
}
export function useActivityContext() { return useContext(ActivityContext); }
export function useStudyActivity(activity) {
  const {setActivity}=useActivityContext();
  const serialized=JSON.stringify(activity);
  useEffect(()=>{setActivity(JSON.parse(serialized));return ()=>setActivity(null);},[serialized,setActivity]);
}
