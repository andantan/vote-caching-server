export enum PendingEventErrorStatus {
    CACHE_ACCESS_ERROR = "CACHE_ACCESS_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class PendingEventError extends Error {
    public readonly status: PendingEventErrorStatus;
    public readonly name: string;

    constructor(status: PendingEventErrorStatus, options?: { cause?: unknown }) {
        super(`Pending Event Error: ${status}`, options);
        this.name = 'PendingEventError';
        this.status = status;

        Object.setPrototypeOf(this, PendingEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PendingEventError);
        }
    }
}