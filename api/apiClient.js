import axios from 'axios';
import { ENDPOINTS } from './endpoints';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Inject Token
apiClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Refresh & Errors
apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH}`, {
                        refreshToken,
                    });

                    if (response.data?.data?.token) {
                        const newToken = response.data.data.token;
                        localStorage.setItem('token', newToken);
                        if (response.data.data.refreshToken) {
                            localStorage.setItem('refreshToken', response.data.data.refreshToken);
                        }
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error('Refresh token failed:', refreshError);
            }

            // Cleanup and redirect if refresh fails
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('username');
                window.dispatchEvent(new CustomEvent('session-expired'));
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
