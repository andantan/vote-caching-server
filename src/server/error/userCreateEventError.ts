import { CommonErrorStatus } from "./common/commonEventError";

export enum UserCreateEventSpecificStatus {
    INVALID_PARAMETER = "INVALID_PARAMETER",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    EXIST_USERHASH = "EXIST_USERHASH",
    EXIST_UID = "EXIST_UID",
}

export const UserCreateEventErrorStatus = {
    ...CommonErrorStatus,
    ...UserCreateEventSpecificStatus
} as const;

export class UserCreateEventError extends Error {
    public readonly status: typeof UserCreateEventErrorStatus[keyof typeof UserCreateEventErrorStatus];
    public readonly type: string;

    constructor(status: typeof UserCreateEventErrorStatus[keyof typeof UserCreateEventErrorStatus], options?: { cause?: unknown }) {
        super(`User Create Event error: ${status}`, options);

        this.type = "UserCreateEventError";
        this.status = status;

        Object.setPrototypeOf(this, UserCreateEventError.prototype);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, UserCreateEventError);
        }
    }
}