import { CommonErrorStatus } from "./common/commonEventError";

export enum BallotQueryEventErrorSpecificStatus {
    USER_NOT_FOUND = "USER_NOT_FOUND",
}

export const BallotQueryEventErrorStatus = {
    ...CommonErrorStatus,
    ...BallotQueryEventErrorSpecificStatus
} as const;

export class BallotQueryEventError extends Error {
    public readonly status: typeof BallotQueryEventErrorStatus[keyof typeof BallotQueryEventErrorStatus];
    public readonly name: string;

    constructor(status: typeof BallotQueryEventErrorStatus[keyof typeof BallotQueryEventErrorStatus], options?: { cause?: unknown }) {
        super(`Ballot Query Event Error: ${status}`, options);
        this.name = 'BallotQueryEventError';
        this.status = status;

        Object.setPrototypeOf(this, BallotQueryEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BallotQueryEventError);
        }
    }
}