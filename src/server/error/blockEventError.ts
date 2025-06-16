export enum BlockEventErrorStatus {
    CACHE_ACCESS_ERROR = "CACHE_ACCESS_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class BlockEventError extends Error {
    public readonly status: BlockEventErrorStatus;
    public readonly name: string;

    constructor(status: BlockEventErrorStatus, options?: { cause?: unknown }) {
        super(`Block Event Error: ${status}`, options);
        this.name = 'BlockEventError';
        this.status = status;

        Object.setPrototypeOf(this, BlockEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BlockEventError);
        }
    }
}