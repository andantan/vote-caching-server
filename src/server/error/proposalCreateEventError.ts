import { CommonErrorStatus } from "./common/commonEventError";

export enum ProposalCreateEventSpecificStatus {
    PROPOSAL_EXPIRED = "PROPOSAL_EXPIRED",
    PROPOSAL_ALREADY_OPEN = "PROPOSAL_ALREADY_OPEN",
}

export const ProposalCreateEventErrorStatus = {
    ...CommonErrorStatus,
    ...ProposalCreateEventSpecificStatus
} as const;

export class ProposalCreateEventError extends Error {
    public readonly status: typeof ProposalCreateEventErrorStatus[keyof typeof ProposalCreateEventErrorStatus];
    public readonly type: string;

    constructor(status: typeof ProposalCreateEventErrorStatus[keyof typeof ProposalCreateEventErrorStatus], options?: { cause?: unknown }) {
        super(`Proposal Create Event error: ${status}`, options);

        this.type = "ProposalCreateEventError";
        this.status = status;

        Object.setPrototypeOf(this, ProposalCreateEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ProposalCreateEventError);
        }
    }
}