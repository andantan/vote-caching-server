export enum ProposalCreateEventErrorStatus {
    PROPOSAL_EXPIRED = "PROPOSAL_EXPIRED",
    PROPOSAL_ALREADY_OPEN = "PROPOSAL_ALREADY_OPEN",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    CACHE_ACCESS_ERROR = "CACHE_ACCESS_ERROR"
}

export class ProposalCreateEventError extends Error {
    public readonly status: ProposalCreateEventErrorStatus;
    public readonly type: string;

    constructor(status: ProposalCreateEventErrorStatus, options?: { cause?: unknown }) {
        super(`Proposal Create Event error: ${status}`, options);

        this.type = "ProposalCreateEventError";
        this.status = status;

        Object.setPrototypeOf(this, ProposalCreateEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ProposalCreateEventError);
        }
    }
}