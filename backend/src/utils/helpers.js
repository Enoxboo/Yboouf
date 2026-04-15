export const isPrismaNotFoundError = (error) => {
    return error?.code === 'P2025';
};

export const isPrismaKnownRequestError = (error) => {
    return typeof error?.code === 'string' && error.code.startsWith('P');
};

export const sendError = (res, status, error, code, details) => {
    const payload = { error };
    if (code) {
        payload.code = code;
    }
    if (details) {
        payload.details = details;
    }
    return res.status(status).json(payload);
};

