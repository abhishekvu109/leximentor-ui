// export const API_BASE_URL = 'http://nginx-service-k8s.default.svc.cluster.local:6060/api';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// export const API_BASE_URL = 'http://localhost:9191/api';
export const API_TEXT_TO_SPEECH = `${API_BASE_URL}/tts/text2speech`;

export const MODEL_DATA = ['ministral-3:8b', 'gemma3', 'gemma3:1b', 'phi4-mini-reasoning:3.8b', 'llama3.2:latest', 'deepseek-r1:1.5b', "phi4-mini:latest", 'qwen3:8b', 'mistral:7b', 'deepseek-r1:7b'];

export const FITMATE_MEASUREMENT_UNITS = {
    "Time": ['Hour', 'Minute', 'Second'],
    "Weight": ['Kilogram', 'Pound', 'Gram'],
    "Reps": ['Count'],
    "Distance": ['Miles', 'Kilometer']
}
