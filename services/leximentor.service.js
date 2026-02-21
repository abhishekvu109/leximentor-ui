import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const leximentorService = {
    getDrills: () => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata`);
    },
    createDrill: (params) => {
        return apiClient.post(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata`, null, { params });
    },
    deleteDrill: (refId) => {
        return apiClient.delete(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/${refId}`);
    },
    assignDrillName: (refId) => {
        return apiClient.post(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/assign-name/${refId}`);
    },
    getDrillsMetadata: () => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata`);
    },
    getChallengeReport: (challengeId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.CHALLENGE(challengeId)}/report`);
    },
    getWordDetails: (wordRefId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/inventory/words/${wordRefId}`);
    },
    getWordSourceData: (wordId, source) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/inventory/words/${wordId}/sources/${source}`);
    },
    getWordSources: (wordId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/inventory/words/${wordId}/sources`);
    },
    getDrillAnalytics: (drillRefId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/analytics/drill/${drillRefId}`);
    },
    getChallengeMetadataAnalytics: () => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/analytics/drill/challenge/metadata`);
    },
    getChallenges: (drillId, username) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/challenges/${drillId}`, {
            params: { username }
        });
    },
    createChallenge: (drillId, drillType, username) => {
        return apiClient.post(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/challenges/challenge`, null, {
            params: { drillId, drillType, username }
        });
    },
    getChallenge: (id) => {
        return apiClient.get(ENDPOINTS.LEXIMENTOR.CHALLENGE(id));
    },
    deleteChallenge: (refId) => {
        return apiClient.delete(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/challenges/${refId}`);
    },
    getEvaluators: (challengeRefId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/challenges/challenge/evaluators`, {
            params: { challengeRefId }
        });
    },
    submitEvaluation: (challengeId, evaluator) => {
        return apiClient.post(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/challenges/challenge/${challengeId}/evaluate`, null, {
            params: { challengeId, evaluator }
        });
    },
    getDrillSetWords: (drillRefId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/sets/words/data/${drillRefId}`);
    },
    getChallengeScores: (challengeId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.CHALLENGE(challengeId)}/scores`);
    },
    getEvaluationStatus: (challengeId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.CHALLENGE(challengeId)}/evaluation-status`);
    },
    getDrillSet: (drillId) => {
        return apiClient.get(`${ENDPOINTS.LEXIMENTOR.BASE}/drill/metadata/sets/${drillId}`);
    },
    updateChallengeScores: (challengeId, payload) => {
        return apiClient.put(`${ENDPOINTS.LEXIMENTOR.CHALLENGE(challengeId)}/scores`, payload);
    },
    textToSpeech: (text) => {
        return apiClient.post(ENDPOINTS.LEXIMENTOR.TTS, { text }, {
            responseType: 'arraybuffer'
        });
    }
};

export default leximentorService;
