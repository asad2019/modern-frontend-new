import { useEffect } from 'react';
import { useData } from '@/contexts/DataContext';

export const usePageData = (dataKeys = []) => {
  const { data, loadingStates, ensureDataLoaded, refetchData } = useData();

  useEffect(() => {
    if (dataKeys.length > 0) {
      ensureDataLoaded(dataKeys);
    }
  }, [dataKeys, ensureDataLoaded]);

  const isLoading = dataKeys.some(key => loadingStates[key]);

  // Provide fetchDataByKey for backward compatibility
  const fetchDataByKey = (key, force = false) => {
    if (force) {
      return refetchData([key]);
    } else {
      return ensureDataLoaded([key]);
    }
  };

  return {
    data,
    isLoading,
    loadingStates,
    fetchDataByKey,
    refetchData: (keys) => refetchData(keys)
  };
};