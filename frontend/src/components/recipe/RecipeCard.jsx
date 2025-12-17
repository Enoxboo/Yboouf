import {Link} from 'react-router-dom';

const RecipeCard = ({recipe}) => {
    return (
        <div className="card hover:shadow-lg transition">
            {/* Image de la recette */}
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <img
                    src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Titre */}
            <h3 className="text-lg font-bold mb-2">
                {recipe.title}
            </h3>

            {/* Pays */}
            <p className="text-gray-600 text-sm mb-4">
                {recipe.country}
            </p>

            {/* Bouton */}
            <Link
                to={`/recipe/${recipe.id}`}
                className="btn-primary text-center block"
            >
                Voir la recette
            </Link>
        </div>
    );
};

export default RecipeCard;
