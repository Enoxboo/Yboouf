import { useState } from 'react';
import RecipeCard from '../components/recipe/RecipeCard';
import PopularRecipesCarousel from '../components/recipe/PopularRecipesCarousel';
import { Search } from 'lucide-react';
import { useRecipes } from '../hooks/useRecipes';

const Home = () => {
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [type, setType] = useState('');

    const { data, isLoading, error } = useRecipes({
        search,
        country,
        type,
    });

    const recipes = data?.recipes || [];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Chargement des recettes...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl text-red-600">
                    Erreur lors du chargement des recettes
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-12 mb-8">
                <h1 className="text-4xl font-bold mb-4">
                    Des saveurs du monde délicieuses,
                </h1>
                <p className="text-xl">
                    et votre recette favorite à portée de main.
                </p>
            </div>

            {/* Carousel des recettes populaires */}
            {recipes.length > 0 && (
                <PopularRecipesCarousel recipes={recipes.slice(0, 10)} />
            )}

            {/* Filtres */}
            <div className="card mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Rechercher une recette..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Tous les pays</option>
                        <option value="France">France</option>
                        <option value="Italie">Italie</option>
                        <option value="Japon">Japon</option>
                        <option value="Maroc">Maroc</option>
                        <option value="Espagne">Espagne</option>
                    </select>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Tous les types</option>
                        <option value="STARTER">Entrée</option>
                        <option value="MAIN">Plat principal</option>
                        <option value="DESSERT">Dessert</option>
                        <option value="SNACK">Snack</option>
                        <option value="DRINK">Boisson</option>
                    </select>
                </div>
            </div>

            {/* Titre pour toutes les recettes */}
            <h2 className="text-2xl font-bold mb-6">Toutes les recettes</h2>

            {/* Liste des recettes */}
            {recipes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Aucune recette trouvée</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
