import { CommonErrorStatus } from "./common/commonEventError";

export enum PendingEventErrorSpecificStatus {
    // TODO: Identify this status
}

export const PendingEventErrorStatus = {
    ...PendingEventErrorSpecificStatus,
    ...CommonErrorStatus,
} as const;

export class PendingEventError extends Error {
    public readonly status: typeof PendingEventErrorStatus[keyof typeof PendingEventErrorStatus];
    public readonly name: string;

    constructor(status: typeof PendingEventErrorStatus[keyof typeof PendingEventErrorStatus], options?: { cause?: unknown }) {
        super(`Pending Event Error: ${status}`, options);
        this.name = 'PendingEventError';
        this.status = status;

        Object.setPrototypeOf(this, PendingEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PendingEventError);
        }
    }
}