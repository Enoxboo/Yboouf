import { Link } from 'react-router-dom';
import { getRecipeImageUrl, RECIPE_PLACEHOLDER_URL } from '../../utils/media';

const RecipeCard = ({ recipe }) => {
    const imageUrl = getRecipeImageUrl(recipe.imageUrl);

    return (
        <div className="card hover:shadow-lg transition">
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <img
                    src={imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = RECIPE_PLACEHOLDER_URL;
                    }}
                />
            </div>

            <h3 className="text-lg font-bold mb-2">
                {recipe.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4">
                {recipe.country}
            </p>

            <Link
                to={`/recipe/${recipe.id}`}
                className="btn-primary text-center  text-white dark:text-black block"
                text-sm
            >
                Voir la recette
            </Link>
        </div>
    );
};

export default RecipeCard;
