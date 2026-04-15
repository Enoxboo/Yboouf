import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/adminService';

export const useAdminUsers = (filters) => useQuery({
	queryKey: ['admin-users', filters],
	queryFn: () => adminService.getUsers(filters),
});

export const useAdminUserStats = () => useQuery({
	queryKey: ['admin-user-stats'],
	queryFn: adminService.getUserStats,
});

export const usePromoteUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminService.promoteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] });
			queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
		},
	});
};

export const useSetUserRole = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, role }) => adminService.setUserRole(id, role),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] });
			queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: adminService.deleteUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-users'] });
			queryClient.invalidateQueries({ queryKey: ['admin-user-stats'] });
		},
	});
};

export const useAdminRecipes = (filters) => useQuery({
	queryKey: ['admin-recipes', filters],
	queryFn: () => adminService.getRecipes(filters),
});

export const usePendingRecipes = (filters) => useQuery({
	queryKey: ['admin-pending-recipes', filters],
	queryFn: () => adminService.getPendingRecipes(filters),
});

export const useAdminRecipeStats = () => useQuery({
	queryKey: ['admin-recipe-stats'],
	queryFn: adminService.getRecipeStats,
});

export const useApproveRecipe = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, note }) => adminService.approveRecipe(id, note),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-pending-recipes'] });
			queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
			queryClient.invalidateQueries({ queryKey: ['admin-recipe-stats'] });
			queryClient.invalidateQueries({ queryKey: ['recipes'] });
		},
	});
};

export const useRejectRecipe = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, reason }) => adminService.rejectRecipe(id, reason),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['admin-pending-recipes'] });
			queryClient.invalidateQueries({ queryKey: ['admin-recipes'] });
			queryClient.invalidateQueries({ queryKey: ['admin-recipe-stats'] });
			queryClient.invalidateQueries({ queryKey: ['recipes'] });
		},
	});
};

