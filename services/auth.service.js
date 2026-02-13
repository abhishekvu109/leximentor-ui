import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const authService = {
    login: (username, password) => {
        return apiClient.post(ENDPOINTS.AUTH.LOGIN, { username, password });
    },
    register: (userData) => {
        return apiClient.post(ENDPOINTS.AUTH.REGISTER, userData);
    },
    logout: () => {
        return apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    },
    getUsers: () => {
        return apiClient.get(ENDPOINTS.AUTH.USER);
    }
};

export default authService;
