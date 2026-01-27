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
        HOUSEHOLD: (id) => `/cashflow/households/household/${id}`,
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
        EXERCISE: (id) => `/fitmate/exercises/exercise/${id}`,
        ROUTINES: '/fitmate/routines',
        ROUTINE: (id) => `/fitmate/routines/routine/${id}`,
        BODY_PARTS: '/fitmate/bodyparts',
    },
    LEXIMENTOR: {
        BASE: '/leximentor',
        DRILLS: '/leximentor/drill/metadata',
        CHALLENGES: '/leximentor/drill/metadata/challenges',
        CHALLENGE: (id) => `/leximentor/drill/metadata/challenges/challenge/${id}`,
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
