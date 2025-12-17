import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

const SearchBar = ({ value, onChange, isLoading }) => {
    const [localValue, setLocalValue] = useState(value || '');
    const debouncedValue = useDebounce(localValue, 500);

    // Déclenche la recherche après le debounce
    useEffect(() => {
        if (debouncedValue !== value) {
            onChange(debouncedValue);
        }
    }, [debouncedValue]);

    const handleClear = () => {
        setLocalValue('');
        onChange('');
    };

    return (
        <div className="relative group">
            <div className="relative">
                <Search
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                    size={20}
                />
                <input
                    type="text"
                    placeholder="Rechercher..."
                    value={localValue}
                    onChange={(e) => setLocalValue(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 outline-none text-gray-700 placeholder:text-gray-400 bg-white shadow-sm hover:border-primary/50"
                />

                {/* Indicateur de chargement ou bouton clear */}
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {isLoading ? (
                        <Loader2 className="text-primary animate-spin" size={20} />
                    ) : localValue ? (
                        <button
                            onClick={handleClear}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-red-50"
                            aria-label="Effacer la recherche"
                        >
                            <X size={18} />
                        </button>
                    ) : null}
                </div>
            </div>

            {/* Barre de progression pendant le chargement */}
            {isLoading && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary animate-progress" />
                </div>
            )}
        </div>
    );
};

export default SearchBar;
