import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from './ApiAuthContext';

const DataContext = createContext(undefined);

const endpointMap = {
    settings: 'settings',
    clients: 'clients',
    brokers: 'brokers',
    sizingAccounts: 'sizing-accounts',
    stockLocations: 'stock-locations',
    looms: 'looms',
    machines: 'machines',
    yarnQualities: 'yarn-qualities',
    fabricQualities: 'fabric-qualities',
    contracts: 'contracts',
    users: 'users',
    departments: 'departments',
    suppliers: 'suppliers',
    activityLog: 'activity-logs',
    notifications: 'notifications',
    yarnStock: 'yarn-stock',
    sizingStock: 'sizing-stock',
    fabricStock: 'fabric-stock',
    dailyProduction: 'daily-production',
    processingOrders: 'processing-orders',
    invoices: 'invoices',
    finishingUnits: 'finishing-units',
    maintenanceSchedules: 'maintenance-schedules',
    qcRecords: 'qc-records',
    po: 'po',
    products: 'products',
    shipmentCodes: 'shipment-codes',
    shipments: 'shipments',
};

export const DataProvider = ({ children }) => {
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();
    const [data, setData] = useState(Object.keys(endpointMap).reduce((acc, key) => ({
        ...acc, 
        [key]: key === 'settings' ? {} : []
    }), {}));
    const [loadingStates, setLoadingStates] = useState({});
    const loadedKeysRef = useRef(new Set());
    const loadingPromisesRef = useRef(new Map());

    const fetchData = useCallback(async (keys, force = false) => {
        if (!isAuthenticated) return;

        const keysArray = Array.isArray(keys) ? keys : [keys];
        const keysToFetch = keysArray.filter(key => {
            if (!endpointMap[key]) return false;
            return force || !loadedKeysRef.current.has(key);
        });

        if (keysToFetch.length === 0) return;

        // Check if any of these keys are already being loaded
        const alreadyLoading = keysToFetch.filter(key => loadingPromisesRef.current.has(key));
        const needToLoad = keysToFetch.filter(key => !loadingPromisesRef.current.has(key));

        // Wait for already loading promises
        if (alreadyLoading.length > 0) {
            await Promise.all(alreadyLoading.map(key => loadingPromisesRef.current.get(key)));
        }

        if (needToLoad.length === 0) return;

        // Set loading states
        setLoadingStates(prev => {
            const newStates = { ...prev };
            needToLoad.forEach(key => { newStates[key] = true; });
            return newStates;
        });

        // Create promises for each key
        const loadPromises = needToLoad.map(async (key) => {
            try {
                const response = await api.get(`/${endpointMap[key]}`);
                return { key, response, success: true };
            } catch (err) {
                console.error(`Failed to fetch ${key}:`, err);
                toast({ 
                    title: `Error loading ${key}`, 
                    description: 'Could not load required data.', 
                    variant: 'destructive' 
                });
                return { 
                    key, 
                    response: { data: { data: key === 'settings' ? {} : [] } }, 
                    success: false 
                };
            }
        });

        // Store promises for deduplication
        needToLoad.forEach((key, index) => {
            loadingPromisesRef.current.set(key, loadPromises[index]);
        });

        try {
            const results = await Promise.all(loadPromises);

            // Update data
            setData(prevData => {
                const newData = { ...prevData };
                results.forEach(({ key, response, success }) => {
                    // Safely extract data with fallbacks
                    let responseData;
                    if (response && response.data && typeof response.data === 'object') {
                        responseData = response.data.data;
                    }

                    // Provide fallback values
                    if (responseData === undefined || responseData === null) {
                        responseData = key === 'settings' ? {} : [];
                    }

                    newData[key] = responseData;
                    if (success) {
                        loadedKeysRef.current.add(key);
                    }
                });
                return newData;
            });
        } finally {
            // Clear loading states and promises
            setLoadingStates(prev => {
                const newStates = { ...prev };
                needToLoad.forEach(key => { 
                    newStates[key] = false;
                    loadingPromisesRef.current.delete(key);
                });
                return newStates;
            });
        }
    }, [isAuthenticated, toast]);

    const apiAction = async (method, endpoint, payload, successMessage) => {
        try {
            const response = await api[method](endpoint, payload);
            if (response.data.success) {
                toast({ title: "Success", description: successMessage });

                const affectedKey = Object.keys(endpointMap).find(key => endpoint.startsWith(`/${endpointMap[key]}`));
                if (affectedKey) {
                    await fetchData([affectedKey], true);
                }

                return response.data.data;
            } else {
                throw new Error(response.data.message || response.data.error?.message || `Failed to perform action.`);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
            throw error;
        }
    };

    // Clear data when not authenticated
    React.useEffect(() => {
        if (!isAuthenticated) {
            setData(Object.keys(endpointMap).reduce((acc, key) => ({
                ...acc, 
                [key]: key === 'settings' ? {} : []
            }), {}));
            loadedKeysRef.current.clear();
            loadingPromisesRef.current.clear();
            setLoadingStates({});
        } else {
            console.log('User authenticated, DataContext ready');
        }
    }, [isAuthenticated]);

    const addData = (key, item) => apiAction('post', `/${endpointMap[key]}`, item, 'Item added successfully.');
    const updateData = (key, id, updatedItem) => apiAction('put', `/${endpointMap[key]}/${id}`, updatedItem, 'Item updated successfully.');
    const deleteData = (key, id) => apiAction('delete', `/${endpointMap[key]}/${id}`, null, 'Item deleted successfully.');

  const receiveYarn = async (data) => {
    try {
      const response = await api.post('/yarn/receive', data);
      console.log('Yarn received successfully:', response.data);
      // Refresh yarn stock data
      await fetchData(['yarnStock']);
      return response.data;
    } catch (error) {
      console.error('Error receiving yarn:', error);
      throw error;
    }
  };

  const purchaseYarn = async (data) => {
    try {
      const response = await api.post('/yarn/purchase', data);
      console.log('Yarn purchased successfully:', response.data);
      // Refresh yarn stock data
      await fetchData(['yarnStock']);
      return response.data;
    } catch (error) {
      console.error('Error purchasing yarn:', error);
      throw error;
    }
  };

  const issueYarn = async (data) => {
    try {
      const response = await api.post('/yarn/issue', data);
      console.log('Yarn issued successfully:', response.data);
      // Refresh yarn stock data
      await fetchData(['yarnStock']);
      return response.data;
    } catch (error) {
      console.error('Error issuing yarn:', error);
      throw error;
    }
  };

  const receiveSizing = async (data) => {
    try {
      const response = await api.post('/sizing/receive', data);
      console.log('Sizing received successfully:', response.data);
      // Refresh relevant data
      await fetchData(['yarnStock']);
      return response.data;
    } catch (error) {
      console.error('Error receiving sizing:', error);
      throw error;
    }
  };

  const issueSizing = async (data) => {
    try {
      const response = await api.post('/sizing/issue', data);
      console.log('Sizing issued successfully:', response.data);
      // Refresh relevant data
      await fetchData(['yarnStock']);
      return response.data;
    } catch (error) {
      console.error('Error issuing sizing:', error);
      throw error;
    }
  };

    const value = { 
        data, 
        loadingStates,
        ensureDataLoaded: fetchData,
        refetchData: (keys) => fetchData(keys, true),
        addData,
        updateData,
        deleteData,
        updateSettings: (newSettings) => apiAction('put', '/settings', newSettings, 'Settings updated successfully.'),
        markNotificationsAsRead: () => apiAction('post', '/notifications/mark-as-read', {}, 'Notifications marked as read.'),
        receiveYarn,
        purchaseYarn,
        issueYarn,
        receiveSizing,
        issueSizing,
        receiveFabric: (payload) => apiAction('post', '/fabric-stock/receive', payload, 'Fabric received successfully.'),
        issueFabric: (payload) => apiAction('post', '/fabric-stock/issue', payload, 'Fabric issued successfully.'),
        addDailyProduction: (payload) => apiAction('post', '/daily-production', payload, 'Daily production logged.'),
        createProcessingOrder: (payload) => apiAction('post', '/processing-orders', payload, 'Processing order created.'),
        updateProcessingOrder: (orderId, payload) => apiAction('put', `/processing-orders/${orderId}`, payload, 'PO updated.'),
        updateProcessingOrderStatus: (orderId, status) => apiAction('put', `/processing-orders/${orderId}/status`, { status }, 'Order status updated.'),
        closeContract: (contractId) => apiAction('put', `/contracts/${contractId}/close`, {}, 'Contract closed successfully.'),
        performTransaction: (payload) => apiAction('post', '/transactions', payload, 'Stock transferred successfully.'),
        createInvoice: (payload) => apiAction('post', '/invoices', payload, 'Invoice created successfully.'),
        resetData: () => apiAction('post', '/system/reset-data', {}, 'Data reset successfully initiated.').then(() => {
            loadedKeysRef.current.clear();
            return fetchData(['notifications', 'settings'], true);
        }),
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};