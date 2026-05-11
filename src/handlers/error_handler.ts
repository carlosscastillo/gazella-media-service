import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from 'express-jwt';
import { BaseError } from '../util/error';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[${new Date().toISOString()}] Error: ${err.message}`);

    if (err instanceof UnauthorizedError) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Token inválido o ausente. Debes iniciar sesión para acceder a este recurso.'
        });
    }

    if (err instanceof BaseError) {
        return res.status(err.status).json({
            error: err.name,
            message: err.message
        });
    }

    const status = err.status || 500;
    res.status(status).json({
        error: err.name || 'InternalServerError',
        message: err.message || 'Ha ocurrido un error inesperado en el servidor.'
    });
};