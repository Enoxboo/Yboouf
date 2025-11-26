import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import RecipeCard from '../components/recipe/RecipeCard';
import { Search } from 'lucide-react';

const Home = () => {
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [type, setType] = useState('');

    const { data: recipes, isLoading, error } = useRecipes({
        search,
        country,
        type
    });


    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-12 mb-8">
                <h1 className="text-4xl font-bold mb-4">
                    Découvrez les saveurs du monde
                </h1>
                <p className="text-xl">
                    Des milliers de recettes authentiques à portée de main
                </p>
            </div>

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
                        <option value="Italy">Italie</option>
                        <option value="Japan">Japon</option>
                        <option value="Mexico">Mexique</option>
                        {/* Ajouter plus de pays */}
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
                    </select>
                </div>
            </div>

            {/* Liste des recettes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes?.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
            </div>

            {recipes?.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    Aucune recette trouvée 😢
                </div>
            )}
        </div>
    );
};

export default Home;