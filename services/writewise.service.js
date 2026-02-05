import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const writewiseService = {
    getTopics: () => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/topics`);
    },
    getTopicGenerations: () => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/topic-generations`);
    },
    getSubmittedResponses: () => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/response/submitted-responses`);
    },
    getEvaluatedResponses: () => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/response/evaluated-responses`);
    },
    createTopics: (payload) => {
        return apiClient.post(`${ENDPOINTS.WRITEWISE.BASE}/v1/topics`, payload);
    },
    deleteTopicGeneration: (refId) => {
        return apiClient.delete(`${ENDPOINTS.WRITEWISE.BASE}/v1/topic-generations/topic-generation/${refId}`);
    },
    getTopic: (id) => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/topics/topic/${id}`);
    },
    getResponseVersions: (topicRefId) => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/response/response-version/${topicRefId}`);
    },
    saveResponse: (payload) => {
        return apiClient.post(`${ENDPOINTS.WRITEWISE.BASE}/v1/response`, payload);
    },
    getResponseVersion: (topicRefId, versionRefId) => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/topics/topic/${topicRefId}/versions/version/${versionRefId}`);
    },
    evaluateResponse: (payload) => {
        return apiClient.post(`${ENDPOINTS.WRITEWISE.BASE}/v1/topics/topic/versions/version/evaluate-response`, payload);
    },
    validateEvaluation: (payload) => {
        return apiClient.post(`${ENDPOINTS.WRITEWISE.BASE}/v1/topics/topic/versions/version/evaluate-response/validate`, payload);
    },
    submitEvaluationResults: (payload) => {
        return apiClient.post(`${ENDPOINTS.WRITEWISE.BASE}/v1/topics/topic/versions/version/submit-results`, payload);
    },
    getEvaluationResult: (responseRefId, versionRefId) => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/responses/response/${responseRefId}/versions/version/${versionRefId}`);
    },
    getTopicGenerationDetails: (id) => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/v1/topic-generations/topic-generation/${id}`);
    },
    getDashboardStats: () => {
        return apiClient.get(`${ENDPOINTS.WRITEWISE.BASE}/dashboard`);
    }
};

export default writewiseService;
