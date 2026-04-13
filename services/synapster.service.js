import apiClient from '../api/apiClient';
import { ENDPOINTS } from '../api/endpoints';

const synapsterService = {
    getAllSubjects: () => {
        return apiClient.get(ENDPOINTS.SYNAPSTER.SUBJECTS);
    },
    createSubjects: (payload) => {
        return apiClient.post(ENDPOINTS.SYNAPSTER.CREATE_SUBJECT, payload);
    },
    deleteSubject: (id) => {
        return apiClient.delete(ENDPOINTS.SYNAPSTER.SUBJECT(id));
    }
};

export default synapsterService;
