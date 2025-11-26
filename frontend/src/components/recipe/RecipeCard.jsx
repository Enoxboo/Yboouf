import {Link} from 'react-router-dom';
import {Clock, Users, Star} from 'lucide-react';

const RecipeCard = ({recipe}) => {
    const totalTime = recipe.prepTime + recipe.cookTime;
    const averageRating = recipe.averageRating || 0;

    return (
        <Link to={`/recipe/${recipe.id}`} className="card hover:shadow-lg transition group">
            {/* Image */}
            <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
                <img
                    src={recipe.imageUrl || '/placeholder-recipe.jpg'}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                />
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-semibold">
                    {recipe.country}
                </div>
            </div>

            {/* Contenu */}
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition">
                {recipe.title}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {recipe.description}
            </p>

            {/* Infos */}
            <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                    <Clock size={16}/>
                    <span>{totalTime} min</span>
                </div>

                <div className="flex items-center space-x-1">
                    <Users size={16}/>
                    <span>{recipe.servings} pers.</span>
                </div>

                <div className="flex items-center space-x-1">
                    <Star size={16} className="fill-yellow-400 text-yellow-400"/>
                    <span>{averageRating.toFixed(1)}</span>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
          {recipe.type}
        </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {recipe.difficulty}
        </span>
            </div>
        </Link>
    );
};

export default RecipeCard;