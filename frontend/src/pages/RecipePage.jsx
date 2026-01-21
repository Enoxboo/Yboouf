import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

function RecipePage() {
    const { id } = useParams();
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/recipes/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setRecipe(data);
            } catch (err) {
                console.error('Erreur fetch:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {recipe.imageUrl && (
                    <img
                        src={`${import.meta.env.VITE_API_URL}${recipe.imageUrl}`}
                        alt={recipe.title}
                        className="w-full h-96 object-cover"
                    />
                )}

                <div className="p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {recipe.title}
                    </h1>

                    <div className="flex items-center gap-4 mb-6 text-gray-600">
                        <span className="flex items-center">
                            ⭐ {recipe.averageRating || 0}
                        </span>
                        <span>•</span>
                        <span>Par {recipe.author.username}</span>
                    </div>

                    <p className="text-gray-700 text-lg mb-8">
                        {recipe.description}
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary">
                                {recipe.prepTime}
                            </div>
                            <div className="text-sm text-gray-600">Préparation (min)</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary">
                                {recipe.cookTime}
                            </div>
                            <div className="text-sm text-gray-600">Cuisson (min)</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary">
                                {recipe.servings}
                            </div>
                            <div className="text-sm text-gray-600">Portions</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary">
                                {recipe.difficulty}
                            </div>
                            <div className="text-sm text-gray-600">Difficulté</div>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Ingrédients
                        </h2>
                        <ul className="space-y-2">
                            {recipe.ingredients.map((ing, index) => (
                                <li key={index} className="flex items-center gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{ing.quantity} {ing.unit} {ing.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Instructions
                        </h2>
                        <div className="prose max-w-none">
                            {recipe.instructions}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipePage;
