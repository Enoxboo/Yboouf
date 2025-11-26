import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import {ChefHat, User, LogOut, Plus} from 'lucide-react';

const Navbar = () => {
    const {user, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 text-primary font-bold text-xl">
                        <ChefHat size={28}/>
                        <span>World Recipes</span>
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/add-recipe" className="btn-primary flex items-center space-x-2">
                                    <Plus size={18}/>
                                    <span>Ajouter une recette</span>
                                </Link>

                                <Link to="/profile"
                                      className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                                    <User size={20}/>
                                    <span>{user.username}</span>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-red-500"
                                >
                                    <LogOut size={20}/>
                                    <span>Déconnexion</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary">
                                    Connexion
                                </Link>
                                <Link to="/register" className="btn-primary">
                                    Inscription
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;