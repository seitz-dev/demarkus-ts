
export class DemarkusInvalidUrlError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, DemarkusInvalidUrlError.prototype);
        this.name = 'DemarkusInvalidUrlError';
    }
}