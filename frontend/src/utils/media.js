const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const MEDIA_BASE_URL = API_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');

export const RECIPE_PLACEHOLDER_URL = '/placeholder-recipe.svg';

export const getRecipeImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return RECIPE_PLACEHOLDER_URL;
    }

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
        return imageUrl;
    }

    const normalizedPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    return `${MEDIA_BASE_URL}${normalizedPath}`;
};
