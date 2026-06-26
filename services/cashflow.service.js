import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const cashflowService = {
    searchEarnings: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.BASE}/earnings/earning/search`, payload);
    },
    createEarning: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.BASE}/earnings/earning`, payload);
    },
    searchCategories: (payload = {}) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.CATEGORY_SEARCH, payload);
    },
    createCategory: (payload) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.CATEGORY, payload);
    },
    updateCategory: (payload) => {
        return apiClient.put(ENDPOINTS.CASHFLOW.CATEGORY, payload);
    },
    deleteCategory: (payload) => {
        return apiClient.delete(ENDPOINTS.CASHFLOW.CATEGORY, { data: payload });
    },
    exportExpenses: (filter = {}) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.EXPORT_EXPENSES, filter, { responseType: 'blob' });
    },
    exportEarnings: (filter = {}) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.EXPORT_EARNINGS, filter, { responseType: 'blob' });
    },
    exportDeposits: (filter = {}) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.EXPORT_DEPOSITS, filter, { responseType: 'blob' });
    },
};

export default cashflowService;
