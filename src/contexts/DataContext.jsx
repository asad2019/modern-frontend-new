
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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
    fabricStock: 'fabric-stock',
    dailyProduction: 'daily-production',
    processingOrders: 'processing-orders',
    invoices: 'invoices',
    finishingUnits: 'finishing-units',
    maintenanceSchedules: 'maintenance-schedules',
    qcRecords: 'qc-records',
};

const coreDataKeys = ['notifications', 'settings'];

export const DataProvider = ({ children }) => {
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();
    const [data, setData] = useState(Object.keys(endpointMap).reduce((acc, key) => ({...acc, [key]: []}), {}));
    const [loadingStates, setLoadingStates] = useState({});
    const [loadedKeys, setLoadedKeys] = useState(new Set());
    const [coreLoading, setCoreLoading] = useState(true);

    const fetchData = useCallback(async (keys, force = false) => {
        const keysToFetch = (Array.isArray(keys) ? keys : [keys]).filter(key => force || !loadedKeys.has(key));
        if (keysToFetch.length === 0) return;

        const newLoadingStates = {};
        keysToFetch.forEach(key => { newLoadingStates[key] = true; });
        setLoadingStates(prev => ({ ...prev, ...newLoadingStates }));

        const requests = keysToFetch.map(key =>
            api.get(`/${endpointMap[key]}`).catch(err => {
                console.error(`Failed to fetch ${key}:`, err);
                toast({ title: `Error loading ${key}`, description: 'Could not load required data.', variant: 'destructive' });
                return { data: { data: key === 'settings' ? {} : [] }};
            })
        );
        
        const responses = await Promise.all(requests);
        
        setData(prevData => {
            const newData = { ...prevData };
            responses.forEach((response, index) => {
                const key = keysToFetch[index];
                newData[key] = response.data.data ?? (key === 'settings' ? {} : []);
            });
            return newData;
        });
        
        setLoadedKeys(prev => new Set([...prev, ...keysToFetch]));

        const clearedLoadingStates = {};
        keysToFetch.forEach(key => { clearedLoadingStates[key] = false; });
        setLoadingStates(prev => ({ ...prev, ...clearedLoadingStates }));

    }, [loadedKeys, toast]);
    
    useEffect(() => {
        if (isAuthenticated) {
            setCoreLoading(true);
            fetchData(coreDataKeys, true).finally(() => setCoreLoading(false));
        } else {
            setCoreLoading(false);
            setData(Object.keys(endpointMap).reduce((acc, key) => ({...acc, [key]: []}), {}));
            setLoadedKeys(new Set());
        }
    }, [isAuthenticated, fetchData]);

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

    const addData = (key, item) => apiAction('post', `/${endpointMap[key]}`, item, 'Item added successfully.');
    const updateData = (key, id, updatedItem) => apiAction('put', `/${endpointMap[key]}/${id}`, updatedItem, 'Item updated successfully.');
    const deleteData = (key, id) => apiAction('delete', `/${endpointMap[key]}/${id}`, null, 'Item deleted successfully.');
    
    const value = { 
        data, 
        loadingStates,
        coreLoading,
        ensureDataLoaded: (keys) => fetchData(keys, false),
        refetchData: (keys) => fetchData(keys, true),
        addData,
        updateData,
        deleteData,
        updateSettings: (newSettings) => apiAction('put', '/settings', newSettings, 'Settings updated successfully.'),
        markNotificationsAsRead: () => apiAction('post', '/notifications/mark-as-read', {}, 'Notifications marked as read.'),
        receiveYarn: (payload) => apiAction('post', '/yarn-stock/receive', payload, 'Yarn received successfully.'),
        purchaseYarn: (payload) => apiAction('post', '/yarn-stock/purchase', payload, 'Yarn purchased successfully.'),
        issueYarn: (payload) => apiAction('post', '/yarn-stock/issue', payload, 'Yarn issued successfully.'),
        receiveFabric: (payload) => apiAction('post', '/fabric-stock/receive', payload, 'Fabric received successfully.'),
        issueFabric: (payload) => apiAction('post', '/fabric-stock/issue', payload, 'Fabric issued successfully.'),
        addDailyProduction: (payload) => apiAction('post', '/daily-production', payload, 'Daily production logged.'),
        createProcessingOrder: (payload) => apiAction('post', '/processing-orders', payload, 'Processing order created.'),
        updateProcessingOrderStatus: (orderId, status) => apiAction('put', `/processing-orders/${orderId}/status`, { status }, 'Order status updated.'),
        closeContract: (contractId) => apiAction('put', `/contracts/${contractId}/close`, {}, 'Contract closed successfully.'),
        performTransaction: (payload) => apiAction('post', '/stock/transfer', payload, 'Stock transferred successfully.'),
        createInvoice: (payload) => apiAction('post', '/invoices', payload, 'Invoice created successfully.'),
        resetData: () => apiAction('post', '/system/reset-data', {}, 'Data reset successfully initiated.').then(() => fetchData(coreDataKeys, true)),
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
