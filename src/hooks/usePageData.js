
import { useEffect } from 'react';
import { useData } from '@/contexts/DataContext';

export const usePageData = (requiredDataKeys) => {
  const { ensureDataLoaded, loadingStates, data } = useData();

  useEffect(() => {
    if (requiredDataKeys && requiredDataKeys.length > 0) {
      ensureDataLoaded(requiredDataKeys);
    }
  }, [ensureDataLoaded, requiredDataKeys]);

  const isLoading = requiredDataKeys?.some(key => loadingStates[key]) || false;

  return {
    data,
    isLoading,
    loadingStates
  };
};
