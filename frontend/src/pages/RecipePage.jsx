import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getRecipeImageUrl, RECIPE_PLACEHOLDER_URL } from '../utils/media';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

function RecipePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await recipeService.getById(id);
                setRecipe(data);
                setUserRating(data.userRating || null);
                setIsFavorite(data.isFavorite || false);
            } catch (err) {
                console.error('Erreur fetch:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    const handleRate = async (score) => {
        if (!user) return;
        try {
            const response = await recipeService.rate(id, score);
            setRecipe(prev => ({
                ...prev,
                averageRating: response.averageRating,
                ratingsCount: response.ratingsCount,
            }));
            setUserRating(score);
        } catch (err) {
            console.error('Erreur rate:', err);
        }
    };

    const handleToggleFavorite = async () => {
        if (!user) return;
        try {
            if (isFavorite) {
                await recipeService.removeFromFavorites(id);
                setIsFavorite(false);
            } else {
                await recipeService.addToFavorites(id);
                setIsFavorite(true);
            }
        } catch (err) {
            console.error('Erreur favorite:', err);
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Lien copié dans le presse-papiers !');
        } catch (err) {
            console.error('Erreur share:', err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Chargement...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-500">
                    Erreur: {error}
                </div>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Recette non trouvée</div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <img
                    src={getRecipeImageUrl(recipe.imageUrl)}
                    alt={recipe.title}
                    className="w-full h-48 sm:h-72 md:h-96 object-cover"
                    onError={(e) => {
                        e.currentTarget.src = RECIPE_PLACEHOLDER_URL;
                    }}
                />

                <div className="p-4 sm:p-6 md:p-8">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">
                        {recipe.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 sm:mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                            ⭐ {recipe.averageRating || 0}
                        </span>
                        <span>•</span>
                        <span>Par {recipe.author.username}</span>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg mb-6 sm:mb-8">
                        {recipe.description}
                    </p>

                    {user && (
                        <div className="flex flex-wrap items-center gap-4 mb-6 sm:mb-8">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Noter :</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRate(star)}
                                        className={`text-xl ${userRating >= star ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleToggleFavorite}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                                    isFavorite
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                                } hover:opacity-80`}
                            >
                                ❤️ {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 font-medium hover:opacity-80"
                            >
                                🔗 Partager
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-xl sm:text-2xl font-bold text-primary">
                                {recipe.prepTime}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Préparation (min)</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-xl sm:text-2xl font-bold text-primary">
                                {recipe.cookTime}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Cuisson (min)</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-xl sm:text-2xl font-bold text-primary">
                                {recipe.servings}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Portions</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg text-center">
                            <div className="text-xl sm:text-2xl font-bold text-primary">
                                {recipe.difficulty}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Difficulté</div>
                        </div>
                    </div>

                    <div className="mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            Ingrédients
                        </h2>
                        <ul className="space-y-1 sm:space-y-2">
                            {recipe.ingredients.map((ing, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                    <span className="text-primary">•</span>
                                    <span>{ing.name} {ing.quantity} {ing.unit} </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            Instructions
                        </h2>
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-line text-sm sm:text-base text-gray-700 dark:text-gray-300">                            {recipe.instructions}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipePage;
