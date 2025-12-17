import {useState} from 'react';
import RecipeCard from '../components/recipe/RecipeCard';
import PopularRecipesCarousel from '../components/recipe/PopularRecipesCarousel';
import SearchBar from '../components/common/SearchBar';
import {useRecipes, useRecipeFilters} from '../hooks/useRecipes';

const Home = () => {
    const [search, setSearch] = useState('');
    const [country, setCountry] = useState('');
    const [type, setType] = useState('');
    const [diet, setDiet] = useState('');
    const [ingredient, setIngredient] = useState('');

    const {data, isLoading, error} = useRecipes({
        search,
        country,
        type,
        diet,
        ingredient,
    });

    const {data: filters, isLoading: filtersLoading} = useRecipeFilters();

    const recipes = data?.recipes || [];

    if (filtersLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Chargement des filtres...</div>
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

    const typeLabels = {
        STARTER: 'Entrée',
        MAIN: 'Plat principal',
        DESSERT: 'Dessert',
        SNACK: 'Snack',
        DRINK: 'Boisson'
    };

    const dietLabels = {
        VEGETARIAN: 'Végétarien',
        VEGAN: 'Vegan',
        GLUTEN_FREE: 'Sans gluten',
        DAIRY_FREE: 'Sans lactose',
        HALAL: 'Halal',
        KOSHER: 'Casher'
    };

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
            {!search && recipes.length > 0 && (
                <PopularRecipesCarousel recipes={recipes.slice(0, 10)}/>
            )}

            {/* Filtres */}
            <div className="card mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    <div className="md:col-span-1 lg:col-span-1">
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            isLoading={isLoading}
                        />
                    </div>

                    <select
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                    >
                        <option value="">Tous les pays</option>
                        {filters?.countries?.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                    >
                        <option value="">Tous les types</option>
                        {filters?.types?.map((t) => (
                            <option key={t} value={t}>{typeLabels[t]}</option>
                        ))}
                    </select>

                    <select
                        value={ingredient}
                        onChange={(e) => setIngredient(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                    >
                        <option value="">Tous les ingrédients</option>
                        {filters?.ingredients?.map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>

                    <select
                        value={diet}
                        onChange={(e) => setDiet(e.target.value)}
                        className="px-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50"
                    >
                        <option value="">Tous les régimes</option>
                        {filters?.diets?.map((d) => (
                            <option key={d} value={d}>{dietLabels[d]}</option>
                        ))}
                    </select>
                </div>
            </div>


            {/* Titre pour toutes les recettes */}
            <h2 className="text-2xl font-bold mb-6">
                {search ? `Résultats pour "${search}"` : 'Toutes les recettes'}
            </h2>

            {/* Liste des recettes */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="card animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">Aucune recette trouvée</p>
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="mt-4 text-primary hover:underline"
                        >
                            Réinitialiser la recherche
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe}/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
