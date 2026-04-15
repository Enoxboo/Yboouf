import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminService } from '../services/adminService';
import { recipeService } from '../services/recipeService';
import { extractApiErrorMessage } from '../utils/apiError';

const TYPE_OPTIONS = [
    { value: 'STARTER', label: 'Entree' },
    { value: 'MAIN', label: 'Plat principal' },
    { value: 'DESSERT', label: 'Dessert' },
    { value: 'SNACK', label: 'Snack' },
    { value: 'DRINK', label: 'Boisson' },
];

const DIFFICULTY_OPTIONS = [
    { value: 'EASY', label: 'Facile' },
    { value: 'MEDIUM', label: 'Moyen' },
    { value: 'HARD', label: 'Difficile' },
];

const DIET_OPTIONS = [
    { value: 'VEGETARIAN', label: 'Vegetarien' },
    { value: 'VEGAN', label: 'Vegan' },
    { value: 'GLUTEN_FREE', label: 'Sans gluten' },
    { value: 'DAIRY_FREE', label: 'Sans lactose' },
    { value: 'HALAL', label: 'Halal' },
    { value: 'KOSHER', label: 'Casher' },
];

const emptyIngredient = { name: '', quantity: '', unit: '' };

const fieldClass =
    'w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-500 shadow-sm transition focus:border-primary focus:ring-2 focus:ring-primary/25 focus:outline-none dark:border-gray-500 dark:bg-gray-700 dark:text-white';

const selectClass = `${fieldClass} appearance-none pr-10`;

const parseInstructions = (instructions = '') => {
    return String(instructions)
        .split('\n')
        .map((line) => line.replace(/^\s*\d+\.\s*/, '').trim())
        .filter(Boolean);
};

const NumberField = ({ id, label, value, min, max, unit, onChange }) => {
    const parsedValue = value === '' ? '' : Number(value);

    const stepChange = (delta) => {
        const base = Number.isFinite(parsedValue) ? parsedValue : min;
        const next = Math.min(max, Math.max(min, base + delta));
        onChange(String(next));
    };

    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm font-semibold">{label} *</label>
            <div className="flex items-center rounded-xl border-2 border-gray-300 bg-white shadow-sm dark:border-gray-500 dark:bg-gray-700">
                <button
                    type="button"
                    onClick={() => stepChange(-1)}
                    className="h-12 w-12 border-r border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    aria-label={`Diminuer ${label.toLowerCase()}`}
                >
                    <Minus size={16} className="mx-auto" />
                </button>
                <input
                    id={id}
                    type="number"
                    min={min}
                    max={max}
                    required
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    className="h-12 w-full border-0 bg-transparent px-3 text-center text-base font-semibold focus:outline-none"
                />
                <span className="min-w-16 px-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300">{unit}</span>
                <button
                    type="button"
                    onClick={() => stepChange(1)}
                    className="h-12 w-12 border-l border-gray-200 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    aria-label={`Augmenter ${label.toLowerCase()}`}
                >
                    <Plus size={16} className="mx-auto" />
                </button>
            </div>
        </div>
    );
};

const DashboardEditRecipe = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const recipeQuery = useQuery({
        queryKey: ['admin-recipe', id],
        queryFn: () => adminService.getRecipeById(id),
        enabled: !!id,
    });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        country: '',
        prepTime: '15',
        cookTime: '30',
        servings: '4',
        difficulty: 'EASY',
        type: 'MAIN',
    });
    const [ingredients, setIngredients] = useState([emptyIngredient]);
    const [steps, setSteps] = useState(['']);
    const [selectedDiets, setSelectedDiets] = useState([]);
    const [image, setImage] = useState(null);
    const [formError, setFormError] = useState('');

    // Hydrate le formulaire une fois les donnees admin chargees.
    useEffect(() => {
        const recipe = recipeQuery.data?.recipe;
        if (!recipe) {
            return;
        }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
            title: recipe.title || '',
            description: recipe.description || '',
            country: recipe.country || '',
            prepTime: String(recipe.prepTime ?? '15'),
            cookTime: String(recipe.cookTime ?? '30'),
            servings: String(recipe.servings ?? '4'),
            difficulty: recipe.difficulty || 'EASY',
            type: recipe.type || 'MAIN',
        });
        setIngredients(recipe.ingredients?.length ? recipe.ingredients.map((item) => ({
            name: item.name || '',
            quantity: item.quantity || '',
            unit: item.unit || '',
        })) : [emptyIngredient]);
        setSteps(parseInstructions(recipe.instructions));
        setSelectedDiets(Array.isArray(recipe.diet) ? recipe.diet : []);
    }, [recipeQuery.data?.recipe]);

    const updateRecipe = useMutation({
        mutationFn: (payload) => recipeService.update(id, payload),
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, field, value) => {
        setIngredients((prev) => prev.map((ingredient, i) => (i === index ? { ...ingredient, [field]: value } : ingredient)));
    };

    const toggleDiet = (dietValue) => {
        setSelectedDiets((prev) => (prev.includes(dietValue) ? prev.filter((diet) => diet !== dietValue) : [...prev, dietValue]));
    };

    const handleStepChange = (index, value) => {
        setSteps((prev) => prev.map((step, i) => (i === index ? value : step)));
    };

    const saveRecipe = async (event) => {
        event.preventDefault();
        setFormError('');

        const cleanIngredients = ingredients
            .map((ingredient) => ({
                name: ingredient.name.trim(),
                quantity: ingredient.quantity.trim(),
                unit: ingredient.unit.trim(),
            }))
            .filter((ingredient) => ingredient.name && ingredient.quantity && ingredient.unit);

        const cleanSteps = steps.map((step) => step.trim()).filter(Boolean);

        if (cleanIngredients.length === 0) {
            setFormError('Ajoute au moins un ingredient complet.');
            return;
        }

        if (cleanSteps.length === 0) {
            setFormError('Ajoute au moins une etape de preparation.');
            return;
        }

        const instructions = cleanSteps.map((step, index) => `${index + 1}. ${step}`).join('\n');

        const payload = new FormData();
        payload.append('title', formData.title.trim());
        payload.append('description', formData.description.trim());
        payload.append('country', formData.country.trim());
        payload.append('prepTime', formData.prepTime);
        payload.append('cookTime', formData.cookTime);
        payload.append('servings', formData.servings);
        payload.append('difficulty', formData.difficulty);
        payload.append('type', formData.type);
        if (selectedDiets.length > 0) {
            payload.append('diet', selectedDiets.join(','));
        }
        payload.append('instructions', instructions);
        payload.append('ingredients', JSON.stringify(cleanIngredients));
        if (image) {
            payload.append('image', image);
        }

        try {
            await updateRecipe.mutateAsync(payload);
            toast.success('Recette mise a jour avec succes');
            navigate('/dashboard');
        } catch (error) {
            const message = extractApiErrorMessage(error, 'Impossible de mettre a jour la recette.');
            setFormError(message);
            toast.error(message);
        }
    };

    const recipeTitle = useMemo(() => recipeQuery.data?.recipe?.title || 'Recette', [recipeQuery.data?.recipe?.title]);

    if (recipeQuery.isLoading) {
        return <p className="text-sm">Chargement de la recette...</p>;
    }

    if (recipeQuery.isError || !recipeQuery.data?.recipe) {
        return <p className="text-sm text-red-600">{extractApiErrorMessage(recipeQuery.error, 'Impossible de charger cette recette.')}</p>;
    }

    return (
        <section className="mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
            <div className="mb-6 rounded-2xl bg-linear-to-r from-[#095d63] to-white px-4 py-5 shadow-md dark:from-primary dark:to-secondary">
                <h1 className="hero-text text-2xl font-bold sm:text-3xl">Modifier une recette</h1>
                <p className="hero-text mt-2 text-sm sm:text-base">Edition admin dediee pour: {recipeTitle}</p>
            </div>

            {formError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900 dark:text-red-200">
                    {formError}
                </div>
            )}

            <form onSubmit={saveRecipe} className="grid gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                    <div className="card rounded-2xl">
                        <h2 className="mb-4 text-lg font-semibold sm:text-xl">Infos principales</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="title" className="mb-2 block text-sm font-semibold">Titre *</label>
                                <input id="title" name="title" type="text" value={formData.title} onChange={handleInputChange} className={fieldClass} required minLength={3} maxLength={100} />
                            </div>
                            <div>
                                <label htmlFor="description" className="mb-2 block text-sm font-semibold">Description *</label>
                                <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} className={`${fieldClass} min-h-24`} required minLength={10} maxLength={500} />
                            </div>
                            <div>
                                <label htmlFor="country" className="mb-2 block text-sm font-semibold">Pays *</label>
                                <input id="country" name="country" type="text" value={formData.country} onChange={handleInputChange} className={fieldClass} required />
                            </div>
                        </div>
                    </div>

                    <div className="card rounded-2xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold sm:text-xl">Ingredients *</h2>
                            <button type="button" onClick={() => setIngredients((prev) => [...prev, { ...emptyIngredient }])} className="btn-secondary inline-flex items-center gap-2 text-sm">
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {ingredients.map((ingredient, index) => (
                                <div key={`ing-${index}`} className="rounded-xl border border-gray-200 p-3 dark:border-gray-600">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-xs font-semibold">Ingredient {index + 1}</p>
                                        <button type="button" onClick={() => setIngredients((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))} className="rounded-md p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        <input type="text" value={ingredient.name} onChange={(event) => handleIngredientChange(index, 'name', event.target.value)} className={fieldClass} placeholder="Nom" />
                                        <div className="grid grid-cols-2 gap-3">
                                            <input type="text" value={ingredient.quantity} onChange={(event) => handleIngredientChange(index, 'quantity', event.target.value)} className={fieldClass} placeholder="Quantite" />
                                            <input type="text" value={ingredient.unit} onChange={(event) => handleIngredientChange(index, 'unit', event.target.value)} className={fieldClass} placeholder="Unite" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card rounded-2xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-lg font-semibold sm:text-xl">Preparation *</h2>
                            <button type="button" onClick={() => setSteps((prev) => [...prev, ''])} className="btn-secondary inline-flex items-center gap-2 text-sm">
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div key={`step-${index}`} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-600 sm:flex-row">
                                    <span className="min-w-6 text-sm font-semibold text-white">{index + 1}.</span>
                                    <textarea value={step} onChange={(event) => handleStepChange(index, event.target.value)} className={`${fieldClass} min-h-20`} placeholder="Decris cette etape..." />
                                    <button type="button" onClick={() => setSteps((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))} className="mt-1 rounded-md p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 sm:mt-3">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="space-y-6 lg:col-span-4">
                    <div className="card rounded-2xl lg:sticky lg:top-24">
                        <h2 className="mb-4 text-lg font-semibold sm:text-xl">Details recette</h2>
                        <div className="space-y-4">
                            <NumberField id="servings" label="Portions" min={1} max={50} unit="pers." value={formData.servings} onChange={(value) => setFormData((prev) => ({ ...prev, servings: value }))} />
                            <NumberField id="prepTime" label="Preparation" min={0} max={1440} unit="min" value={formData.prepTime} onChange={(value) => setFormData((prev) => ({ ...prev, prepTime: value }))} />
                            <NumberField id="cookTime" label="Cuisson" min={0} max={1440} unit="min" value={formData.cookTime} onChange={(value) => setFormData((prev) => ({ ...prev, cookTime: value }))} />

                            <div>
                                <label htmlFor="difficulty" className="mb-2 block text-sm font-semibold">Difficulte *</label>
                                <div className="relative">
                                    <select id="difficulty" name="difficulty" value={formData.difficulty} onChange={handleInputChange} className={selectClass} required>
                                        {DIFFICULTY_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="type" className="mb-2 block text-sm font-semibold">Type *</label>
                                <div className="relative">
                                    <select id="type" name="type" value={formData.type} onChange={handleInputChange} className={selectClass} required>
                                        {TYPE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div>
                                <p className="mb-3 text-sm font-semibold">Regimes alimentaires</p>
                                <div className="flex flex-wrap gap-2">
                                    {DIET_OPTIONS.map((dietOption) => {
                                        const isSelected = selectedDiets.includes(dietOption.value);
                                        return (
                                            <button
                                                key={dietOption.value}
                                                type="button"
                                                onClick={() => toggleDiet(dietOption.value)}
                                                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                                                    isSelected
                                                        ? 'border-primary bg-primary text-white'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary/60 dark:border-gray-500 dark:bg-gray-700 dark:text-white'
                                                }`}
                                            >
                                                {dietOption.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="image" className="mb-2 block text-sm font-semibold">Remplacer la photo</label>
                                <input id="image" type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" onChange={(event) => setImage(event.target.files?.[0] || null)} className={fieldClass} />
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-600">
                            <button type="submit" className="btn-primary w-full py-3 text-sm dark:text-black" disabled={updateRecipe.isPending}>
                                {updateRecipe.isPending ? 'Mise a jour...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </div>
                </aside>
            </form>
        </section>
    );
};

export default DashboardEditRecipe;






