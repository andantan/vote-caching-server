import { CommonErrorStatus } from "./common/commonEventError";

export enum BlockEventErrorSpecificStatus {
    // TODO: Identify this status
}

export const BlockEventErrorStatus = {
    ...BlockEventErrorSpecificStatus,
    ...CommonErrorStatus,
} as const;

export class BlockEventError extends Error {
    public readonly status: typeof BlockEventErrorStatus[keyof typeof BlockEventErrorStatus];
    public readonly name: string;

    constructor(status: typeof BlockEventErrorStatus[keyof typeof BlockEventErrorStatus], options?: { cause?: unknown }) {
        super(`Block Event Error: ${status}`, options);
        this.name = 'BlockEventError';
        this.status = status;

        Object.setPrototypeOf(this, BlockEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, BlockEventError);
        }
    }
}