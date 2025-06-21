import { CommonErrorStatus } from "./common/commonEventError";

export enum ProposalQueryEventErrorSpecificStatus {
    PROPOSAL_NOT_FOUND = "PROPOSAL_NOT_FOUND",
    PAGING_OUT_OF_BOUNDS = "PAGING_OUT_OF_BOUNDS",
    SKIP_ZERO_PARAM = "SKIP_ZERO_PARAM",
    LIMIT_ZERO_PARAM = "LIMIT_ZERO_PARAM"
}

export const ProposalQueryEventErrorStatus = {
    ...CommonErrorStatus,
    ...ProposalQueryEventErrorSpecificStatus
} as const;

export class ProposalQueryEventError extends Error {
    public readonly status: typeof ProposalQueryEventErrorStatus[keyof typeof ProposalQueryEventErrorStatus];
    public readonly type: string;

    constructor(status: typeof ProposalQueryEventErrorStatus[keyof typeof ProposalQueryEventErrorStatus], options?: { cause?: unknown }) {
        super(`Proposal Query Event error: ${status}`, options);

        this.type = "ProposalQueryEventError";
        this.status = status;

        Object.setPrototypeOf(this, ProposalQueryEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ProposalQueryEventError);
        }
    }
}