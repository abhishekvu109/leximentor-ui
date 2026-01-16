// export const API_BASE_URL = 'http://nginx-service-k8s.default.svc.cluster.local:6060/api';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// export const API_BASE_URL = 'http://localhost:9191/api';
export const API_LEXIMENTOR_BASE_URL = `${process.env.NEXT_PUBLIC_LEXIMENTOR_BASE_URL}/leximentor`;
export const API_WRITEWISE_BASE_URL = `${process.env.NEXT_PUBLIC_WRITEWISE_BASE_URL}/writewise`;
export const API_SYNAPSTER_BASE_URL = `${API_BASE_URL}/synapster`;
export const API_FITMATE_BASE_URL = `${process.env.NEXT_PUBLIC_FITMATE_BASE_URL}/fitmate`;
export const API_TEXT_TO_SPEECH = `${API_BASE_URL}/tts/text2speech`;
export const API_CASHFLOW_BASE_URL = `${process.env.NEXT_PUBLIC_CASHFLOW_BASE_URL}/cashflow`;
export const API_AUTH_URL = `${process.env.NEXT_PUBLIC_AUTH_BASE_URL}/auth/v1`;
export const API_LOGIN_URL = `${API_AUTH_URL}/login`;
export const API_REGISTER_URL = `${API_AUTH_URL}/register`;
export const API_REFRESH_URL = `${API_AUTH_URL}/refresh`;
export const API_LOGOUT_URL = `${API_AUTH_URL}/logout`;
export const API_CATEGORY_SEARCH_URL = `${API_CASHFLOW_BASE_URL}/categories/category/search`;

export const FITMATE_MEASUREMENT_UNITS = {
    "Time": ['Hour', 'Minute', 'Second'],
    "Weight": ['Kilogram', 'Pound', 'Gram'],
    "Reps": ['Count'],
    "Distance": ['Miles', 'Kilometer']
}
