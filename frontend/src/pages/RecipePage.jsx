import { Clock, Users, ChefHat, Heart, Share2, ArrowLeft, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useRecipe } from '../hooks/useRecipes';

const RecipePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [isFavorite, setIsFavorite] = useState(false);

    // Récupération de la recette avec React Query + Axios
    const { data: recipe, isLoading: loading, error } = useRecipe(id);

    // Même logique que RecipeCard pour les URLs d'images
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const API_BASE_URL = API_URL.replace('/api', '');

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        return `${API_BASE_URL}${imageUrl}`;
    };

    const getDifficultyLabel = (difficulty) => {
        const levels = {
            EASY: 'Facile',
            MEDIUM: 'Moyen',
            HARD: 'Difficile',
        };
        return levels[difficulty] || difficulty;
    };

    const getTypeLabel = (type) => {
        const types = {
            MAIN: 'Plat principal',
            STARTER: 'Entrée',
            DESSERT: 'Dessert',
            SNACK: 'Snack',
            DRINK: 'Boisson',
        };
        return types[type] || type;
    };

    const parseInstructions = (instructions) => {
        if (!instructions) return [];
        return instructions
            .split(/\r?\n/)
            .map((step) => step.trim())
            .filter((step) => step !== '');
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <div className="text-xl text-gray-600">Chargement de la recette...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto mb-6">
                    <p className="text-red-800 font-semibold mb-2">❌ Erreur</p>
                    <p className="text-red-600">
                        {error.message || 'Erreur lors du chargement de la recette'}
                    </p>
                </div>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    if (!recipe) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-4">Recette non trouvée</p>
                <button onClick={() => navigate('/')} className="btn-primary">
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    const steps = parseInstructions(recipe.instructions);
    const imageUrl = getImageUrl(recipe.imageUrl);

    return (
        <div>
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary hover:text-secondary mb-6 transition-colors font-medium"
            >
                <ArrowLeft size={20} />
                <span>Retour aux recettes</span>
            </button>

            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg overflow-hidden mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {imageUrl && (
                        <div className="h-64 lg:h-96 p-4 lg:p-6 flex items-center justify-center">
                            <img
                                src={imageUrl}
                                alt={recipe.title}
                                className="w-full h-full object-cover object-center rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.target.src = '/placeholder-recipe.jpg';
                                }}
                            />
                        </div>
                    )}

                    <div
                        className={`p-8 lg:p-12 flex flex-col justify-center ${
                            !imageUrl ? 'lg:col-span-2' : ''
                        }`}
                    >
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                                {recipe.country}
                            </span>
                            <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                                {getTypeLabel(recipe.type)}
                            </span>
                            {recipe.diet &&
                                recipe.diet.map((dietType, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm"
                                    >
                                        {dietType}
                                    </span>
                                ))}
                        </div>

                        <h1 className="text-4xl font-bold mb-4">{recipe.title}</h1>
                        <p className="text-xl mb-6 opacity-95">{recipe.description}</p>

                        <div className="flex flex-wrap gap-6 mb-6">
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-80">Temps total</span>
                                    <span className="font-semibold">
                                        {recipe.prepTime + recipe.cookTime} min
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={20} />
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-80">Portions</span>
                                    <span className="font-semibold">{recipe.servings} pers.</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <ChefHat size={20} />
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-80">Difficulté</span>
                                    <span className="font-semibold">
                                        {getDifficultyLabel(recipe.difficulty)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-white/20">
                            {recipe.averageRating !== undefined && recipe.averageRating > 0 ? (
                                <div className="flex items-center gap-2">
                                    <Star size={20} fill="currentColor" />
                                    <div className="flex flex-col">
                                        <span className="text-xl font-bold">
                                            {recipe.averageRating.toFixed(1)}/5
                                        </span>
                                        <span className="text-sm opacity-80">
                                            {recipe.ratingsCount || 0} avis
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Star size={20} />
                                    <span className="text-sm opacity-80">Aucun avis</span>
                                </div>
                            )}

                            {recipe.author && (
                                <div className="flex flex-col">
                                    <span className="text-sm opacity-80">Créé par</span>
                                    <span className="font-semibold">@{recipe.author.username}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all font-medium ${
                                    isFavorite
                                        ? 'bg-white text-primary shadow-lg'
                                        : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                                }`}
                            >
                                <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                                <span>{isFavorite ? 'Ajouté' : 'Favoris'}</span>
                            </button>
                            <button className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-medium">
                                <Share2 size={20} />
                                <span>Partager</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="card sticky top-4">
                        <div className="flex items-center gap-2 mb-6">
                            <ChefHat className="text-primary" size={24} />
                            <h2 className="text-2xl font-bold">Ingrédients</h2>
                        </div>

                        {recipe.ingredients && recipe.ingredients.length > 0 ? (
                            <ul className="space-y-3">
                                {recipe.ingredients.map((ingredient) => (
                                    <li
                                        key={ingredient.id}
                                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <span className="text-secondary mt-1 text-lg">•</span>
                                        <span className="flex-1">
                                            <span className="font-semibold text-primary">
                                                {ingredient.quantity} {ingredient.unit}
                                            </span>{' '}
                                            <span className="text-gray-700">{ingredient.name}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">Aucun ingrédient</p>
                        )}

                        {recipe._count && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="font-semibold text-gray-700 mb-3">Statistiques</h3>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <Heart size={16} className="text-red-500" />
                                            Favoris
                                        </span>
                                        <span className="font-semibold">
                                            {recipe._count.favorites}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 flex items-center gap-2">
                                            <Star size={16} className="text-yellow-500" />
                                            Notes
                                        </span>
                                        <span className="font-semibold">
                                            {recipe._count.ratings}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {recipe.createdAt && (
                            <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500">
                                <p>Créée le {formatDate(recipe.createdAt)}</p>
                                {recipe.updatedAt &&
                                    recipe.updatedAt !== recipe.createdAt && (
                                        <p className="mt-1">
                                            Modifiée le {formatDate(recipe.updatedAt)}
                                        </p>
                                    )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="card mb-8">
                        <h2 className="text-2xl font-bold mb-6">Préparation</h2>

                        {steps.length > 0 ? (
                            <div className="space-y-6">
                                {steps.map((step, index) => (
                                    <div key={index} className="flex gap-4 group">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-secondary to-primary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 pt-2">
                                            <p className="text-gray-700 leading-relaxed">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic">
                                Pas d'instructions disponibles
                            </p>
                        )}
                    </div>

                    <div className="card bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Clock className="text-primary" size={22} />
                            Temps de préparation détaillé
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Préparation</p>
                                <p className="text-2xl font-bold text-primary">
                                    {recipe.prepTime} min
                                </p>
                            </div>
                            <div className="bg-white/50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">Cuisson</p>
                                <p className="text-2xl font-bold text-secondary">
                                    {recipe.cookTime} min
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipePage;
