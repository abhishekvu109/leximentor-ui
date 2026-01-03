import { API_REFRESH_URL } from './constants';

const getAuthToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const getRefreshToken = () => typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

const setTokens = (token, refreshToken) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
    }
};

const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    }
};

const refreshAuthToken = async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch(API_REFRESH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.token) {
                setTokens(result.data.token, result.data.refreshToken || refreshToken);
                return result.data.token;
            }
        }
    } catch (error) {
        console.error('Failed to refresh token:', error);
    }
    clearTokens();
    return null;
};

const fetchWithAuth = async (URL, options = {}) => {
    let token = getAuthToken();
    const headers = { ...options.headers };
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    let response = await fetch(URL, { ...options, headers });

    if (response.status === 401) {
        const newToken = await refreshAuthToken();
        if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await fetch(URL, { ...options, headers });
        } else {
            // Dispatch custom event for session expiry
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('session-expired'));
            }
        }
    }

    return response;
};

export const fetchData = async (URL) => {
    try {
        const response = await fetchWithAuth(URL, { method: 'GET' });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
    }
};

export const postData = async (URL, formData = {}) => {
    try {
        const response = await fetchWithAuth(URL, {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const POST = async (URL, formData = {}) => {
    try {
        const response = await fetchWithAuth(URL, {
            method: 'POST',
            body: formData, // Keeping as is since it might be FormData or raw
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to save the data' + error);
    }
};

export const postDataAsJson = async (URL, formData = {}) => {
    try {
        console.log("Form data" + JSON.stringify(formData));
        const response = await fetchWithAuth(URL, {
            method: 'POST',
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const updateData = async (URL, formData = {}) => {
    try {
        const response = await fetchWithAuth(URL, {
            method: 'PUT',
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const deleteData = async (URL) => {
    try {
        const response = await fetchWithAuth(URL, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const DeleteByObject = async (URL, formData) => {
    try {
        console.log("Data before deletion: " + JSON.stringify(formData));
        const response = await fetchWithAuth(URL, {
            method: 'DELETE',
            body: JSON.stringify(formData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Response data:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

export const ModelData = ['ministral-3:8b', 'gemma3', 'gemma3:1b', 'phi4-mini-reasoning:3.8b', 'llama3.2:latest', 'deepseek-r1:1.5b', "phi4-mini:latest", 'qwen3:8b', 'mistral:7b', 'deepseek-r1:7b']

export { setTokens, clearTokens, getAuthToken, fetchWithAuth };
