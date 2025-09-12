import { useState, useEffect } from 'react';
import {
    fetchIndividualReq,
    getAllCurrencyData,
    dispalyIsApproved,
} from '../../../../../api/service/adminServices';

const useRequestData = (requestId, userId, role) => {
    const [request, setRequest] = useState(null);
    const [currencies, setCurrencies] = useState([]);
    const [reqLogs, setReqLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDisabled, setIsDisabled] = useState(false);
    const [error, setError] = useState(null);

    // Fetch individual request data
    const fetchRequest = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await fetchIndividualReq(requestId);
            
            if (response.status === 200) {
                setRequest(response.data.data);
                setReqLogs(response.data.requestorLog);
            } else {
                throw new Error('Failed to fetch request data');
            }
        } catch (error) {
            console.error("Error fetching request:", error);
            setError(error.message || 'Failed to fetch request data');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch currency data
    const fetchCurrencies = async () => {
        try {
            const response = await getAllCurrencyData();
            if (response.status === 200) {
                setCurrencies(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    };

    // Check if user can approve
    const checkApprovalPermission = async () => {
        if (!userId || !requestId || !role) return;
        
        try {
            const response = await dispalyIsApproved(userId, requestId, role);
            if (response.status === 200) {
                setIsDisabled(response.data.isDisplay);
            }
        } catch (error) {
            console.error("Error checking approval permission:", error);
        }
    };

    // Format currency using the loaded currency data
    const formatCurrency = (value, currencyCode = null) => {
        if (!currencies.length || !value) return "N/A";
        
        const selectedCurrency = currencyCode || request?.supplies?.selectedCurrency;
        const currency = currencies.find(c => c.code === selectedCurrency);
        
        if (!currency) return `${value} ${selectedCurrency || ''}`;

        try {
            return new Intl.NumberFormat(currency.locale, {
                style: "currency",
                currency: currency.code,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(value);
        } catch (error) {
            return `${value} ${currency.code}`;
        }
    };

    // Refresh request data
    const refreshRequestData = async () => {
        await fetchRequest();
        await checkApprovalPermission();
    };

    // Update request status locally (optimistic update)
    const updateRequestStatus = (newStatus) => {
        setRequest(prevRequest => ({
            ...prevRequest,
            status: newStatus
        }));
    };

    // Add new approval log locally
    const addApprovalLog = (newLog) => {
        setRequest(prevRequest => ({
            ...prevRequest,
            approvals: [...(prevRequest.approvals || []), newLog]
        }));
    };

    // Initial data fetch
    useEffect(() => {
        if (requestId) {
            fetchRequest();
        }
    }, [requestId]);

    // Fetch currencies on mount
    useEffect(() => {
        fetchCurrencies();
    }, []);

    // Check approval permission when dependencies change
    useEffect(() => {
        checkApprovalPermission();
    }, [userId, requestId, role, isDisabled]);

    // Derived state for convenience
    const isRequestLoaded = !!request;
    const canApprove = !isDisabled && role !== "Employee";
    const isPending = request?.status === "Pending";
    const isApproved = request?.status === "Approved";
    const isRejected = request?.status === "Rejected";
    const isOnHold = request?.status === "Hold";

    return {
        // Data
        request,
        currencies,
        reqLogs,
        
        // Loading states
        isLoading,
        isDisabled,
        error,
        
        // Derived states
        isRequestLoaded,
        canApprove,
        isPending,
        isApproved,
        isRejected,
        isOnHold,
        
        // Actions
        refreshRequestData,
        updateRequestStatus,
        addApprovalLog,
        formatCurrency,
        
        // Setters (for external updates)
        setRequest,
        setCurrencies,
        setReqLogs,
        setIsDisabled,
    };
};

export default useRequestData;