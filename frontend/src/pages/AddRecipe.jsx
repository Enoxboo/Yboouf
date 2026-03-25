import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Minus, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateRecipe } from '../hooks/useRecipes';
import { useAuth } from '../context/AuthContext';

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

const AddRecipe = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const createRecipe = useCreateRecipe();

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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleIngredientChange = (index, field, value) => {
        setIngredients((prev) =>
            prev.map((ingredient, i) => (i === index ? { ...ingredient, [field]: value } : ingredient))
        );
    };

    const addIngredient = () => {
        setIngredients((prev) => [...prev, { ...emptyIngredient }]);
    };

    const removeIngredient = (index) => {
        setIngredients((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    };

    const handleStepChange = (index, value) => {
        setSteps((prev) => prev.map((step, i) => (i === index ? value : step)));
    };

    const addStep = () => {
        setSteps((prev) => [...prev, '']);
    };

    const removeStep = (index) => {
        setSteps((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
    };

    const toggleDiet = (dietValue) => {
        setSelectedDiets((prev) =>
            prev.includes(dietValue) ? prev.filter((diet) => diet !== dietValue) : [...prev, dietValue]
        );
    };

    const handleSubmit = async (event) => {
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
        if (instructions.length < 20) {
            setFormError('La preparation doit contenir au moins 20 caracteres.');
            return;
        }

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
            await createRecipe.mutateAsync(payload);

            toast.success(
                user?.role === 'ADMIN'
                    ? 'Recette publiee avec succes.'
                    : 'Recette envoyee pour validation.'
            );

            navigate('/');
        } catch (error) {
            const details = error?.response?.data?.details;
            const firstDetail = Array.isArray(details) && details.length > 0 ? details[0].message : null;
            const message = firstDetail || error?.response?.data?.error || 'Impossible de creer la recette.';
            setFormError(message);
            toast.error(message);
        }
    };

    return (
        <section className="mx-auto max-w-6xl">
            <div className="mb-6 rounded-2xl bg-linear-to-r from-primary to-secondary px-6 py-7 shadow-md">
                <h1 className="text-3xl font-bold">Ajouter une recette</h1>
                <p className="mt-2 text-base">Partage une recette du monde avec la communaute Yboouf.</p>
            </div>

            {formError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-12">
                <div className="space-y-6 lg:col-span-8">
                    <div className="card rounded-2xl">
                        <h2 className="mb-4 text-xl font-semibold">Infos principales</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label htmlFor="title" className="mb-2 block text-sm font-semibold">Titre *</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={fieldClass}
                                    required
                                    minLength={3}
                                    maxLength={100}
                                    placeholder="Ex: Couscous royal traditionnel"
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="mb-2 block text-sm font-semibold">Description *</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={`${fieldClass} min-h-28`}
                                    required
                                    minLength={10}
                                    maxLength={500}
                                    placeholder="Donne envie en quelques lignes..."
                                />
                            </div>

                            <div>
                                <label htmlFor="country" className="mb-2 block text-sm font-semibold">Pays *</label>
                                <input
                                    id="country"
                                    name="country"
                                    type="text"
                                    value={formData.country}
                                    onChange={handleInputChange}
                                    className={fieldClass}
                                    required
                                    placeholder="Ex: Maroc"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card rounded-2xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Ingredients *</h2>
                            <button type="button" onClick={addIngredient} className="btn-secondary inline-flex items-center gap-2">
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {ingredients.map((ingredient, index) => (
                                <div key={`ingredient-${index}`} className="rounded-xl border border-gray-200 p-3 dark:border-gray-600">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-sm font-semibold">Ingredient {index + 1}</p>
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="rounded-md p-2 text-red-600 hover:bg-red-50"
                                            aria-label={`Supprimer l'ingredient ${index + 1}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        <input
                                            type="text"
                                            value={ingredient.name}
                                            onChange={(event) => handleIngredientChange(index, 'name', event.target.value)}
                                            className={fieldClass}
                                            placeholder="Nom (ex: Semoule)"
                                        />
                                        <input
                                            type="text"
                                            value={ingredient.quantity}
                                            onChange={(event) => handleIngredientChange(index, 'quantity', event.target.value)}
                                            className={fieldClass}
                                            placeholder="Quantite (ex: 300)"
                                        />
                                        <input
                                            type="text"
                                            value={ingredient.unit}
                                            onChange={(event) => handleIngredientChange(index, 'unit', event.target.value)}
                                            className={fieldClass}
                                            placeholder="Unite (ex: g)"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card rounded-2xl">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Preparation *</h2>
                            <button type="button" onClick={addStep} className="btn-secondary inline-flex items-center gap-2">
                                <Plus size={16} /> Ajouter
                            </button>
                        </div>
                        <div className="space-y-3">
                            {steps.map((step, index) => (
                                <div key={`step-${index}`} className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-gray-600">
                                    <span className="mt-3 min-w-7 text-sm font-semibold text-gray-500">{index + 1}.</span>
                                    <textarea
                                        value={step}
                                        onChange={(event) => handleStepChange(index, event.target.value)}
                                        className={`${fieldClass} min-h-20`}
                                        placeholder="Decris cette etape..."
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeStep(index)}
                                        className="mt-1 rounded-md p-2 text-red-600 hover:bg-red-50"
                                        aria-label={`Supprimer l'etape ${index + 1}`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <aside className="space-y-6 lg:col-span-4">
                    <div className="card rounded-2xl lg:sticky lg:top-24">
                        <h2 className="mb-4 text-xl font-semibold">Details recette</h2>

                        <div className="space-y-4">
                            <NumberField
                                id="servings"
                                label="Portions"
                                min={1}
                                max={50}
                                unit="pers."
                                value={formData.servings}
                                onChange={(value) => setFormData((prev) => ({ ...prev, servings: value }))}
                            />
                            <NumberField
                                id="prepTime"
                                label="Preparation"
                                min={0}
                                max={1440}
                                unit="min"
                                value={formData.prepTime}
                                onChange={(value) => setFormData((prev) => ({ ...prev, prepTime: value }))}
                            />
                            <NumberField
                                id="cookTime"
                                label="Cuisson"
                                min={0}
                                max={1440}
                                unit="min"
                                value={formData.cookTime}
                                onChange={(value) => setFormData((prev) => ({ ...prev, cookTime: value }))}
                            />

                            <div>
                                <label htmlFor="difficulty" className="mb-2 block text-sm font-semibold">Difficulte *</label>
                                <div className="relative">
                                    <select
                                        id="difficulty"
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleInputChange}
                                        className={selectClass}
                                        required
                                    >
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
                                    <select
                                        id="type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleInputChange}
                                        className={selectClass}
                                        required
                                    >
                                        {TYPE_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                </div>
                            </div>

                            <div>
                                <p className="mb-2 block text-sm font-semibold">Regimes alimentaires</p>
                                <div className="flex flex-wrap gap-2">
                                    {DIET_OPTIONS.map((dietOption) => {
                                        const isSelected = selectedDiets.includes(dietOption.value);
                                        return (
                                            <button
                                                key={dietOption.value}
                                                type="button"
                                                onClick={() => toggleDiet(dietOption.value)}
                                                className={`rounded-full border px-3 py-1.5 text-sm transition ${
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
                                <label htmlFor="image" className="mb-2 block text-sm font-semibold">Photo de la recette</label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                                    onChange={(event) => setImage(event.target.files?.[0] || null)}
                                    className={fieldClass}
                                />
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-5 dark:border-gray-600">
                            <button type="submit" className="btn-primary w-full py-3" disabled={createRecipe.isPending}>
                                {createRecipe.isPending ? 'Envoi en cours...' : 'Envoyer la recette'}
                            </button>
                        </div>
                    </div>
                </aside>
            </form>
        </section>
    );
};

export default AddRecipe;
