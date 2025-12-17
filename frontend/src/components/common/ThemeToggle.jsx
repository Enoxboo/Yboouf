import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative w-16 h-8 rounded-full bg-gray-300 dark:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Toggle theme"
        >
            <div
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                    isDark ? 'translate-x-8' : 'translate-x-0'
                }`}
            >
                {isDark ? (
                    <Moon className="text-gray-700" size={14} />
                ) : (
                    <Sun className="text-yellow-500" size={14} />
                )}
            </div>

            <div className="absolute inset-0 flex items-center justify-between px-2">
                <Sun className="text-yellow-400 opacity-70" size={14} />
                <Moon className="text-gray-200 opacity-70" size={14} />
            </div>
        </button>
    );
};

export default ThemeToggle;
