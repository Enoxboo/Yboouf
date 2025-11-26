import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {recipeService} from '../services/recipeService';

export const useRecipes = (filters) => {
    return useQuery({
        queryKey: ['recipes', filters],
        queryFn: () => recipeService.getAll(filters),
    });
};

export const useRecipe = (id) => {
    return useQuery({
        queryKey: ['recipe', id],
        queryFn: () => recipeService.getById(id),
        enabled: !!id,
    });
};

export const useCreateRecipe = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: recipeService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['recipes']});
        },
    });
};

export const useToggleFavorite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({recipeId, isFavorite}) =>
            isFavorite
                ? recipeService.removeFromFavorites(recipeId)
                : recipeService.addToFavorites(recipeId),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['recipes']});
        },
    });
};