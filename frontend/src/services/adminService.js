import api from './api';

const cleanParams = (params = {}) => {
    return Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});
};

const buildUrl = (basePath, params = {}) => {
    const query = new URLSearchParams(cleanParams(params)).toString();
    return query ? `${basePath}?${query}` : basePath;
};

export const adminService = {
    getUsers: async (filters = {}) => {
        const response = await api.get(buildUrl('/admin/users', filters));
        return response.data;
    },

    getUserStats: async () => {
        const response = await api.get('/admin/users/stats');
        return response.data;
    },

    promoteUser: async (id) => {
        const response = await api.put(`/admin/users/${id}/promote`);
        return response.data;
    },

    setUserRole: async (id, role) => {
        const response = await api.patch(`/admin/users/${id}/role`, { role });
        return response.data;
    },

    deleteUser: async (id) => {
        const response = await api.delete(`/admin/users/${id}`);
        return response.data;
    },

    getRecipes: async (filters = {}) => {
        const response = await api.get(buildUrl('/admin/recipes', filters));
        return response.data;
    },

    getPendingRecipes: async (filters = {}) => {
        const response = await api.get(buildUrl('/admin/recipes/pending', filters));
        return response.data;
    },

    getRecipeById: async (id) => {
        const response = await api.get(`/admin/recipes/${id}`);
        return response.data;
    },

    approveRecipe: async (id, note) => {
        const response = await api.put(`/admin/recipes/${id}/approve`, { note });
        return response.data;
    },

    rejectRecipe: async (id, reason) => {
        const response = await api.put(`/admin/recipes/${id}/reject`, { reason });
        return response.data;
    },

    getRecipeStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
};

