export enum BallotQueryEventErrorStatus {
    USER_NOT_FOUND = "USER_NOT_FOUND",
    CACHE_ACCESS_ERROR = "CACHE_ACCESS_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class BallotQueryEventError extends Error {
    public readonly status: BallotQueryEventErrorStatus;
    public readonly name: string;

    constructor(status: BallotQueryEventErrorStatus, options?: { cause?: unknown }) {
        super(`Ballot Query Event Error: ${status}`, options);
        this.name = 'BallotQueryEventError';
        this.status = status;

        Object.setPrototypeOf(this, BallotQueryEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BallotQueryEventError);
        }
    }
}