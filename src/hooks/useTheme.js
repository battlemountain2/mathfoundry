import { useState, useEffect, useCallback } from 'react';
import { getSettings, setSettings, subscribeStore } from '../utils/storage';
export function useTheme() {
  const [error,setError]=useState('');
  const [theme, setThemeState] = useState(() => getSettings().theme || 'light');
  useEffect(()=>subscribeStore(()=>setThemeState(getSettings().theme || 'light')),[]);
  useEffect(() => {
    const root=document.documentElement;
    root.classList.toggle('dark', theme === 'dark' || theme === 'forest');
    root.dataset.theme=theme;
  },[theme]);
  const setTheme=useCallback(value=>{if(!['light','dark','forest'].includes(value))return;try {setSettings({theme:value});setThemeState(value);setError('');} catch(error) {setError(error.message);}},[]);
  const toggleTheme=useCallback(()=>setTheme(({light:'dark',dark:'forest',forest:'light'})[theme] || 'light'),[theme,setTheme]);
  return {theme,toggleTheme,setTheme,error};
}
