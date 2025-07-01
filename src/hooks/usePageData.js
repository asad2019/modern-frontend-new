
import { useEffect, useRef } from 'react';
import { useData } from '@/contexts/DataContext';

export const usePageData = (requiredDataKeys) => {
  const { ensureDataLoaded, loadingStates, data } = useData();
  const keysRef = useRef();
  const loadedRef = useRef(false);

  // Only update if keys actually changed
  const keysChanged = JSON.stringify(keysRef.current) !== JSON.stringify(requiredDataKeys);
  
  useEffect(() => {
    if (requiredDataKeys && requiredDataKeys.length > 0 && (keysChanged || !loadedRef.current)) {
      keysRef.current = requiredDataKeys;
      loadedRef.current = true;
      ensureDataLoaded(requiredDataKeys);
    }
  }, [ensureDataLoaded, keysChanged, requiredDataKeys]);

  const isLoading = requiredDataKeys?.some(key => loadingStates[key]) || false;

  return {
    data,
    isLoading,
    loadingStates
  };
};
