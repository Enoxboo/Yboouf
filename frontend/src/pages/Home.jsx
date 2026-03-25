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
            <div className="bg-linear-to-r from-primary to-secondary text-black rounded-lg px-4 py-6 sm:px-8 sm:py-8 mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">
                    Des saveurs du monde délicieuses,
                </h1>
                <p className="text-base sm:text-lg lg:text-xl">
                    et votre recette favorite à portée de main.
                </p>
            </div>

            {/* Carousel des recettes populaires */}
            {!search && recipes.length > 0 && (
                <PopularRecipesCarousel recipes={recipes.slice(0, 10)}/>
            )}

            {/* Filtres */}
            <div className="card mb-6 sm:mb-8">
                <div className="flex flex-col gap-2 sm:gap-3">
                    {/* SearchBar - Pleine largeur sur mobile */}
                    <div>
                        <SearchBar
                            value={search}
                            onChange={setSearch}
                            isLoading={isLoading}
                        />
                    </div>

                    {/* Grille de filtres - 2 cols mobile, 3 cols sm, 4 cols md */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                        <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50 appearance-none bg-white cursor-pointer text-sm sm:text-base
    bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    bg-no-repeat bg-size-[20px] bg-position-[right_0.75rem_center]
    hover:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmYWM1MWQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    focus:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')]"
                        >
                            <option value="">Pays</option>
                            {filters?.countries?.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>

                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50 appearance-none bg-white cursor-pointer text-sm sm:text-base
    bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    bg-no-repeat bg-size-[20px] bg-position-[right_0.75rem_center]
    hover:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmYWM1MWQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    focus:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')]"
                        >
                            <option value="">Types</option>
                            {filters?.types?.map((t) => (
                                <option key={t} value={t}>{typeLabels[t]}</option>
                            ))}
                        </select>

                        <select
                            value={ingredient}
                            onChange={(e) => setIngredient(e.target.value)}
                            className="px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50 appearance-none bg-white cursor-pointer text-sm sm:text-base
    bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    bg-no-repeat bg-size-[20px] bg-position-[right_0.75rem_center]
    hover:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmYWM1MWQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    focus:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')]"
                        >
                            <option value="">Ingrédients</option>
                            {filters?.ingredients?.map((i) => (
                                <option key={i} value={i}>{i}</option>
                            ))}
                        </select>

                        <select
                            value={diet}
                            onChange={(e) => setDiet(e.target.value)}
                            className="px-3 py-2 sm:px-4 sm:py-3 pr-8 sm:pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none hover:border-primary/50 appearance-none bg-white cursor-pointer text-sm sm:text-base
    bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    bg-no-repeat bg-size-[20px] bg-position-[right_0.75rem_center]
    hover:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmYWM1MWQiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]
    focus:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwOTVkNjMiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]"
                        >
                            <option value="">Régimes</option>
                            {filters?.diets?.map((d) => (
                                <option key={d} value={d}>{dietLabels[d]}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>


            {/* Titre pour toutes les recettes */}
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                {search ? `Résultats pour "${search}"` : 'Toutes les recettes'}
            </h2>

            {/* Liste des recettes */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {recipes.map((recipe) => (
                        <RecipeCard key={recipe.id} recipe={recipe}/>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;
