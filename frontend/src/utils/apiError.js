export const extractApiErrorMessage = (error, fallbackMessage = 'Une erreur est survenue.') => {
    const details = error?.response?.data?.details;
    const firstDetail = Array.isArray(details) && details.length > 0 ? details[0]?.message : null;
    if (firstDetail) {
        return firstDetail;
    }

    const apiMessage = error?.response?.data?.error;
    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        return apiMessage;
    }

    const status = error?.response?.status;
    if (status === 401) {
        return 'Session expiree. Merci de vous reconnecter.';
    }
    if (status === 403) {
        return 'Action non autorisee.';
    }
    if (status === 404) {
        return 'Ressource introuvable ou deja supprimee.';
    }
    if (status === 409) {
        return 'Conflit detecte: la ressource a deja ete modifiee.';
    }
    if (status === 400) {
        return 'Donnees invalides. Verifie les champs puis reessaie.';
    }

    if (error?.code === 'ECONNABORTED') {
        return 'Le serveur met trop de temps a repondre. Reessaie.';
    }

    if (error?.request && !error?.response) {
        return 'Serveur inaccessible. Verifie ta connexion et reessaie.';
    }

    return fallbackMessage;
};

