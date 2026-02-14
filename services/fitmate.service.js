import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';
import axios from 'axios';

const FITMATE_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_FITMATE_SERVICE_BASE_URL || 'http://192.168.1.90:31372/api';

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
    addDrill: (payload) => {
        return apiClient.post(`${ENDPOINTS.FITMATE.DRILLS}/drill`, payload);
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
    },
    upsertNutritionGoal: (payload) => {
        return apiClient.post(ENDPOINTS.FITMATE.NUTRITION_GOALS, payload);
    },
    getNutritionGoal: (username) => {
        return apiClient.get(ENDPOINTS.FITMATE.NUTRITION_GOALS, { params: { username } });
    },
    addFoodEntry: (payload) => {
        return apiClient.post(ENDPOINTS.FITMATE.NUTRITION_ENTRIES, payload);
    },
    addFoodEntriesBatch: (payload) => {
        return apiClient.post(ENDPOINTS.FITMATE.NUTRITION_ENTRIES_BATCH, payload);
    },
    updateFoodEntry: (refId, username, payload) => {
        return apiClient.put(`${ENDPOINTS.FITMATE.NUTRITION_ENTRIES}/${refId}`, payload, { params: { username } });
    },
    deleteFoodEntry: (refId, username) => {
        return apiClient.delete(`${ENDPOINTS.FITMATE.NUTRITION_ENTRIES}/${refId}`, { params: { username } });
    },
    getFoodEntries: (username, fromDate, toDate, mealType) => {
        const params = { username, fromDate, toDate };
        if (mealType) params.mealType = mealType;
        return apiClient.get(ENDPOINTS.FITMATE.NUTRITION_ENTRIES, { params });
    },
    getNutritionDailySummary: (username, date) => {
        return apiClient.get(ENDPOINTS.FITMATE.NUTRITION_DAILY_SUMMARY, { params: { username, date } });
    },
    getNutritionTrends: (username, fromDate, toDate) => {
        return apiClient.get(ENDPOINTS.FITMATE.NUTRITION_TRENDS_SUMMARY, { params: { username, fromDate, toDate } });
    },
    submitNutritionAiBatchEstimate: (payload) => {
        return apiClient.post(`${FITMATE_SERVICE_BASE_URL}${ENDPOINTS.FITMATE.NUTRITION_AI_BATCH_ESTIMATE}`, payload);
    },
    getNutritionAiBatchEstimateStatus: (requestId, username) => {
        return apiClient.get(`${FITMATE_SERVICE_BASE_URL}${ENDPOINTS.FITMATE.NUTRITION_AI_BATCH_ESTIMATE_STATUS(requestId)}`, { params: { username } });
    },
    exportNutrition: (format, username, fromDate, toDate) => {
        return apiClient.get(ENDPOINTS.FITMATE.EXPORT_NUTRITION(format), {
            params: { username, fromDate, toDate },
            responseType: 'blob'
        });
    },
    estimateNutritionWithAI: async ({ foodName, servingQty, servingUnit, notes }) => {
        const endpoint = 'http://192.168.1.90:11434/api/generate';
        const format = {
            type: "object",
            properties: {
                foodName: { type: "string" },
                servingDescription: { type: "string" },
                estimatedNutrition: {
                    type: "object",
                    properties: {
                        calories: { type: "number", minimum: 0 },
                        protein: { type: "number", minimum: 0 },
                        carbs: { type: "number", minimum: 0 },
                        fat: { type: "number", minimum: 0 },
                        fiber: { type: "number", minimum: 0 },
                        sugar: { type: "number", minimum: 0 },
                        sodium: { type: "number", minimum: 0 }
                    },
                    required: ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"]
                },
                assumptions: {
                    type: "array",
                    items: { type: "string" }
                },
                confidence: {
                    type: "integer",
                    minimum: 0,
                    maximum: 100
                }
            },
            required: ["foodName", "servingDescription", "estimatedNutrition", "assumptions", "confidence"]
        };

        const prompt = [
            "You are a certified sports nutrition assistant.",
            "Return ONLY valid JSON matching the provided format schema.",
            "No markdown, no code fences, no extra text.",
            "Estimate nutrition values from the user input. Use realistic values per serving and quantity.",
            "If details are ambiguous, make conservative assumptions and list them clearly.",
            "All nutrition values must be non-negative numbers.",
            "",
            "Input:",
            "<Request>",
            JSON.stringify({
                foodName: foodName || "",
                servingQty: Number(servingQty || 0),
                servingUnit: servingUnit || "",
                notes: notes || ""
            }),
            "</Request>"
        ].join("\n");

        const response = await axios.post(endpoint, {
            model: "ministral-3:3b",
            stream: false,
            format,
            prompt
        }, {
            headers: { "Content-Type": "application/json" }
        });

        return response.data;
    }
};

export default fitmateService;
