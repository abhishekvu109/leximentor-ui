export const ENDPOINTS = {
    AUTH: {
        BASE: '/auth/v1',
        LOGIN: '/auth/v1/login',
        REGISTER: '/auth/v1/register',
        REFRESH: '/auth/v1/refresh',
        LOGOUT: '/auth/v1/logout',
        USER: '/auth/v1/user',
    },
    CASHFLOW: {
        BASE: '/cashflow',
        HOUSEHOLDS: '/cashflow/households',
        HOUSEHOLD: (id) => `/cashflow/households/${id}`,
        HOUSEHOLD_MEMBERS: '/cashflow/households/household-members/household-member',
        BUDGETS: '/cashflow/households/budgets/budget',
        DEPOSITS: '/cashflow/households/deposits/deposit',
        EXPENSES: '/cashflow/households/expenses/expense',
        EXPENSE_SEARCH: '/cashflow/expenses/expense/search',
        CATEGORIES: '/cashflow/categories/category/search',
    },
    FITMATE: {
        BASE: '/fitmate',
        EXERCISES: '/fitmate/exercises',
        ROUTINES: '/fitmate/routines',
        BODY_PARTS: '/fitmate/bodyparts',
    },
    LEXIMENTOR: {
        BASE: '/leximentor',
        DRILLS: '/leximentor/drills',
        CHALLENGES: '/leximentor/challenges',
        TTS: '/tts/text2speech',
    },
    SYNAPSTER: {
        BASE: '/synapster',
        SUBJECTS: '/synapster/v1/subjects',
        SUBJECT: (id) => `/synapster/v1/subjects/subject/${id}`,
        CREATE_SUBJECT: '/synapster/v1/subjects/subject',
    },
    WRITEWISE: {
        BASE: '/writewise',
        TOPICS: '/writewise/topics',
    }
};
