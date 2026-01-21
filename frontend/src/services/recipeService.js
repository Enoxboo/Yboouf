import api from './api';

export const recipeService = {
    getAll: async (filters = {}) => {
        const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});

        const params = new URLSearchParams(cleanFilters).toString();
        const url = params ? `/recipes?${params}` : '/recipes';
        const response = await api.get(url);
        return response.data;
    },

    getFilters: async () => {
        const response = await api.get('/recipes/filters');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/recipes/${id}`);
        return response.data;
    },

    create: async (formData) => {
        const response = await api.post('/recipes', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    update: async (id, formData) => {
        const response = await api.put(`/recipes/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/recipes/${id}`);
        return response.data;
    },

    addToFavorites: async (recipeId) => {
        const response = await api.post(`/recipes/${recipeId}/favorite`);
        return response.data;
    },

    removeFromFavorites: async (recipeId) => {
        const response = await api.delete(`/recipes/${recipeId}/favorite`);
        return response.data;
    },

    rate: async (recipeId, score) => {
        const response = await api.post(`/recipes/${recipeId}/rate`, { score });
        return response.data;
    },

    comment: async (recipeId, content) => {
        const response = await api.post(`/recipes/${recipeId}/comment`, { content });
        return response.data;
    },
};