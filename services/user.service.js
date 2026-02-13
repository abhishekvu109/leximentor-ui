import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const userService = {
    getUsers: () => {
        return apiClient.get(ENDPOINTS.AUTH.USER);
    }
};

export default userService;
