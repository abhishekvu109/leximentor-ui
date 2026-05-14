import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const flashcardService = {
    // ── Categories ────────────────────────────────────────────────────────────
    getAllGenres: () =>
        apiClient.get(ENDPOINTS.FLASHCARD.CATEGORIES),

    getCategoryById: (id) =>
        apiClient.get(ENDPOINTS.FLASHCARD.CATEGORY(id)),

    getSubCategories: (id) =>
        apiClient.get(ENDPOINTS.FLASHCARD.CATEGORY_SUBCATEGORIES(id)),

    createCategory: (payload) =>
        apiClient.post(ENDPOINTS.FLASHCARD.CATEGORIES, payload),

    updateCategory: (id, payload) =>
        apiClient.put(ENDPOINTS.FLASHCARD.CATEGORY(id), payload),

    deleteCategory: (id) =>
        apiClient.delete(ENDPOINTS.FLASHCARD.CATEGORY(id)),

    // ── Decks ─────────────────────────────────────────────────────────────────
    getDecks: (params = {}) =>
        apiClient.get(ENDPOINTS.FLASHCARD.DECKS, { params }),

    getDeckById: (id) =>
        apiClient.get(ENDPOINTS.FLASHCARD.DECK(id)),

    createDeck: (payload) =>
        apiClient.post(ENDPOINTS.FLASHCARD.DECKS, payload),

    updateDeck: (id, payload) =>
        apiClient.put(ENDPOINTS.FLASHCARD.DECK(id), payload),

    deleteDeck: (id) =>
        apiClient.delete(ENDPOINTS.FLASHCARD.DECK(id)),

    // ── Flashcards ────────────────────────────────────────────────────────────
    getFlashcardsByDeck: (deckId) =>
        apiClient.get(ENDPOINTS.FLASHCARD.DECK_FLASHCARDS(deckId)),

    getFlashcardById: (id) =>
        apiClient.get(ENDPOINTS.FLASHCARD.FLASHCARD(id)),

    createFlashcard: (deckId, payload) =>
        apiClient.post(ENDPOINTS.FLASHCARD.DECK_FLASHCARDS(deckId), payload),

    updateFlashcard: (id, payload) =>
        apiClient.put(ENDPOINTS.FLASHCARD.FLASHCARD(id), payload),

    deleteFlashcard: (id) =>
        apiClient.delete(ENDPOINTS.FLASHCARD.FLASHCARD(id)),

    reorderFlashcards: (deckId, orderedRefIds) =>
        apiClient.patch(ENDPOINTS.FLASHCARD.DECK_FLASHCARDS_REORDER(deckId), { orderedRefIds }),
};

export default flashcardService;
