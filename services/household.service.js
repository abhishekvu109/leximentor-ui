import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const householdService = {
    getHouseholds: () => {
        return apiClient.get(ENDPOINTS.CASHFLOW.HOUSEHOLDS);
    },
    getHousehold: (id) => {
        return apiClient.get(ENDPOINTS.CASHFLOW.HOUSEHOLD(id));
    },
    inviteMember: (payload) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.HOUSEHOLD_MEMBERS, payload);
    },
    addBudget: (payload) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.BUDGETS, payload);
    },
    updateBudget: (payload) => {
        return apiClient.put(ENDPOINTS.CASHFLOW.BUDGETS, payload);
    },
    addDeposit: (payload) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.DEPOSITS, payload);
    },
    searchCategories: (payload = {}) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.CATEGORIES, payload);
    },
    searchExpenses: (payload) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.EXPENSE_SEARCH, payload);
    },
    addExpense: (payload) => {
        return apiClient.post(ENDPOINTS.CASHFLOW.EXPENSES, payload);
    },
    deleteBudget: (payload) => {
        return apiClient.delete(ENDPOINTS.CASHFLOW.BUDGETS, { data: payload });
    },
    updateDeposit: (payload) => {
        return apiClient.put(ENDPOINTS.CASHFLOW.DEPOSITS, payload);
    },
    deleteDeposit: (payload) => {
        return apiClient.delete(ENDPOINTS.CASHFLOW.DEPOSITS, { data: payload });
    },
    updateExpense: (payload) => {
        return apiClient.put(ENDPOINTS.CASHFLOW.EXPENSES, payload);
    },
    deleteExpense: (payload) => {
        return apiClient.delete(ENDPOINTS.CASHFLOW.EXPENSES, { data: payload });
    },
    searchBudgets: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.BUDGETS}/search`, payload);
    },
    searchDeposits: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.DEPOSITS}/search`, payload);
    },
    createHousehold: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.BASE}/households/household`, payload);
    },
    searchHouseholds: (payload) => {
        return apiClient.post(`${ENDPOINTS.CASHFLOW.BASE}/households/household/search`, payload);
    }
};

export default householdService;
