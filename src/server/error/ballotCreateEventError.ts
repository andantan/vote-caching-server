export enum BallotCreateEventErrorStatus {
    DUPLICATE_VOTE_SUBMISSION = "DUPLICATE_VOTE_SUBMISSION",
    PROPOSAL_NOT_FOUND = "PROPOSAL_NOT_FOUND",
    PROPOSAL_EXPIRED = "PROPOSAL_EXPIRED",
    TIMEOUT_PROPOSAL = "TIMEOUT_PROPOSAL",
    INVALID_OPTION = "INVALID_OPTION",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    CACHE_ACCESS_ERROR = "CACHE_ACCESS_ERROR"
}

export class BallotCreateEventError extends Error {
    public readonly status: BallotCreateEventErrorStatus;
    public readonly type: string;

    constructor(status: BallotCreateEventErrorStatus, options?: { cause?: unknown }) {
        super(`Ballot Create Event error: ${status}`, options);

        this.type = "BallotCreateEventError";
        this.status = status;

        Object.setPrototypeOf(this, BallotCreateEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BallotCreateEventError);
        }
    }
}