import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const cashflowService = {
    searchEarnings: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.BASE}/earnings/earning/search`, payload);
    },
    createEarning: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.BASE}/earnings/earning`, payload);
    }
};

export default cashflowService;
