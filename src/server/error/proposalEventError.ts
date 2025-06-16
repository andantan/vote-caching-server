export enum ProposalEventErrorStatus {
    PROPOSAL_EXPIRED = "PROPOSAL_EXPIRED",
    PROPOSAL_ALREADY_OPEN = "PROPOSAL_ALREADY_OPEN",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    CACHE_ACCESS_ERROR = "CACHE_ACCESS_ERROR"
}

export class ProposalEventError extends Error {
    public readonly status: ProposalEventErrorStatus;
    public readonly type: string;

    constructor(status: ProposalEventErrorStatus, options?: { cause?: unknown }) {
        super(`Proposal Event error: ${status}`, options);

        this.type = "ProposalEventError";
        this.status = status;

        Object.setPrototypeOf(this, ProposalEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ProposalEventError);
        }
    }
}