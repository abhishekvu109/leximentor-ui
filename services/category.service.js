import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const categoryService = {
    searchCategories: (payload = {}) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.CATEGORY_SEARCH, payload);
    },
    getCategory: (refId) => {
        return apiClient.get(`${ENDPOINTS.CASHFLOW.BASE}/categories/category/${refId}`);
    }
};

export default categoryService;
