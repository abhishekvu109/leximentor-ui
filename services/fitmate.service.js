import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const fitmateService = {
    getExercises: () => {
        return apiClient.get(ENDPOINTS.FITMATE.EXERCISES);
    },
    searchExercises: (payload) => {
        return apiClient.post(`${ENDPOINTS.FITMATE.EXERCISES}/search`, payload);
    },
    getExercise: (id) => {
        return apiClient.get(ENDPOINTS.FITMATE.EXERCISE(id));
    },
    getRoutines: () => {
        return apiClient.get(`${ENDPOINTS.FITMATE.ROUTINES}/routine`);
    },
    getRoutinesList: () => {
        return apiClient.get(`${ENDPOINTS.FITMATE.ROUTINES}/routines`);
    },
    getRoutine: (id) => {
        return apiClient.get(ENDPOINTS.FITMATE.ROUTINE(id));
    },
    createRoutine: (payload) => {
        return apiClient.post(`${ENDPOINTS.FITMATE.ROUTINES}/routine`, payload);
    },
    updateRoutine: (payload) => {
        return apiClient.put(`${ENDPOINTS.FITMATE.ROUTINES}/routine`, payload);
    },
    deleteRoutine: (refId) => {
        return apiClient.delete(`${ENDPOINTS.FITMATE.ROUTINES}/routine`, { data: [{ refId }] });
    },
    updateDrill: (payload) => {
        return apiClient.put(`${ENDPOINTS.FITMATE.DRILLS}/drill`, payload);
    },
    deleteDrill: (refId) => {
        return apiClient.delete(`${ENDPOINTS.FITMATE.DRILLS}/drill`, { data: { refId } });
    },
    getBodyParts: () => {
        return apiClient.get(ENDPOINTS.FITMATE.BODY_PARTS);
    },
    addBodyPart: (payload) => {
        return apiClient.post(`${ENDPOINTS.FITMATE.BODY_PARTS}/bodypart`, payload);
    },
    deleteBodyPart: (refId) => {
        return apiClient.delete(`${ENDPOINTS.FITMATE.BODY_PARTS}/bodypart`, {
            data: [{ refId, name: "", description: "", status: "active", primaryName: "" }]
        });
    },
    getTrainings: () => {
        return apiClient.get(`${ENDPOINTS.FITMATE.BASE}/trainings`);
    },
    addTraining: (payload) => {
        return apiClient.post(`${ENDPOINTS.FITMATE.BASE}/trainings/training`, payload);
    },
    updateTraining: (payload) => {
        return apiClient.put(`${ENDPOINTS.FITMATE.BASE}/trainings/training`, payload);
    },
    getMuscles: () => {
        return apiClient.get(`${ENDPOINTS.FITMATE.BASE}/muscles`);
    },
    addExercise: (payload) => {
        return apiClient.post(ENDPOINTS.FITMATE.EXERCISES, payload);
    },
    deleteExercise: (refId) => {
        return apiClient.delete(`${ENDPOINTS.FITMATE.EXERCISES}/exercise`, { data: [{ refId }] });
    },
    getThumbnail: (refId) => {
        return apiClient.get(`${ENDPOINTS.FITMATE.EXERCISES}/exercise/resources/resource`, {
            params: { refId, placeholder: 'THUMBNAIL', resourceId: '' },
            responseType: 'blob'
        });
    },
    uploadThumbnail: (refId, formData) => {
        return apiClient.put(`${ENDPOINTS.FITMATE.EXERCISES}/exercise/resources`, formData, {
            params: { refId, placeholder: 'THUMBNAIL' },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    getExerciseResource: (refId, placeholder) => {
        return apiClient.get(`${ENDPOINTS.FITMATE.EXERCISES}/exercise/resources/resource`, {
            params: { refId, placeholder, resourceId: '' },
            responseType: 'blob'
        });
    },
    updateExerciseResources: (refId, placeholder, formData) => {
        return apiClient.put(`${ENDPOINTS.FITMATE.EXERCISES}/exercise/resources`, formData, {
            params: { refId, placeholder },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },
    updateExercise: (payload) => {
        return apiClient.put(`${ENDPOINTS.FITMATE.EXERCISES}/exercise`, payload);
    },
    generateRoutine: (payload) => {
        return apiClient.post(`${ENDPOINTS.FITMATE.ROUTINES}/routine/generate`, payload);
    },
    getExerciseHistory: (exerciseName) => {
        return apiClient.get(`${ENDPOINTS.FITMATE.BASE}/drill/${encodeURIComponent(exerciseName)}`);
    },
    getOverallAnalytics: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_OVERALL, { params: { username } });
    },
    getExerciseAnalytics: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_EXERCISE, { params: { username } });
    },
    getWorkoutLogs: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.LOGS, { params: { username } });
    },
    getWorkoutTrends: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_WORKOUT_TRENDS, { params: { username } });
    },
    getBodyPartWorkoutVolume: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_BODY_PART_VOLUME, { params: { username } });
    },
    getMostFrequentExercises: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_MOST_FREQUENT_EXERCISES, { params: { username } });
    },
    getRoutineDistribution: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_ROUTINE_DISTRIBUTION, { params: { username } });
    },
    getExerciseProgressions: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_EXERCISE_PROGRESSIONS, { params: { username } });
    },
    getRoutineEfficiency: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_ROUTINE_EFFICIENCY, { params: { username } });
    },
    getActivityConsistency: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_ACTIVITY_CONSISTENCY, { params: { username } });
    },
    getCaloriesDuration: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.ANALYTICS_CALORIES_DURATION, { params: { username } });
    }
};

export default fitmateService;
