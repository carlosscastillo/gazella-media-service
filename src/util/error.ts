export class BaseError extends Error {
    public readonly status: number;

    constructor(name: string, status: number, message: string) {
        super(message);
        
        Object.setPrototypeOf(this, BaseError.prototype);
        
        this.name = name;
        this.status = status;
        
        Error.captureStackTrace(this, this.constructor);
    }
}