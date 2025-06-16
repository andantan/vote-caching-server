export enum BallotEventErrorStatus {
    DUPLICATE_VOTE_SUBMISSION = "DUPLICATE_VOTE_SUBMISSION",
    PROPOSAL_NOT_FOUND = "PROPOSAL_NOT_FOUND",
    PROPOSAL_EXPIRED = "PROPOSAL_EXPIRED",
    TIMEOUT_PROPOSAL = "TIMEOUT_PROPOSAL",
    INVALID_OPTION = "INVALID_OPTION",
    INVALID_HASH_LENGTH = "INVALID_HASH_LENGTH",
    DECODE_ERROR = "DECODE_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    MONGO_ACCESS_ERROR = "MONGO_ACCESS_ERROR"
}

export class BallotEventError extends Error {
    public readonly status: BallotEventErrorStatus;
    public readonly type: string;

    constructor(status: BallotEventErrorStatus, options?: { cause?: unknown }) {
        super(`Ballot Event error: ${status}`, options);

        this.type = "BallotEventError";
        this.status = status;

        Object.setPrototypeOf(this, BallotEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BallotEventError);
        }
    }
}