import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from "../../generated/web_event/user_create_event_message.js";

import { userCreateEventProcessor } from "../processor/userCreateEventProcessor.js";
import { UserCreateEventError, UserCreateEventErrorStatus } from "../error/userCreateEventError.js";

export async function validateUserEvent(
    call: ServerUnaryCall<Event.UserValidateEventRequest, Event.UserValidateEventResponse>,
    callback: sendUnaryData<Event.UserValidateEventResponse>
): Promise<void> {
    const { uid, userHash } = call.request;

    logger.info(`[grpcUserCreateEventHandler::validateUserEvent] Received UserValidateEventRequest for UID: ${uid}, UserHash: "${userHash}"`);

    const numericUid = Number(uid);
    let validationResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await userCreateEventProcessor.processValidateNewUser(numericUid, userHash);

        logger.info(`[grpcUserCreateEventHandler::validateUserEvent] Proposal validation successful. UID: ${uid}, UserHash: "${userHash}", Status: "${statusCode}"`);
    } catch (error: unknown) {
        validationResult = false;

        if (error instanceof UserCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcUserCreateEventHandler::validateUserEvent] Proposal validation failed: UID: ${uid}, UserHash: "${userHash}". Status: "${statusCode}". Internal error message: "${error.message}"`);    
        } else {
            statusCode = UserCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcUserCreateEventHandler::validateUserEvent] Unhandled or unexpected error during proposal validation. UID: ${uid}, UserHash: "${userHash}". Error:`, error);
        }
    } finally {
        const response: Event.UserValidateEventResponse = {
            validation: validationResult,
            status: statusCode
        };

        callback(null, response);
    }
}

export async function cacheUserEvent(
    call: ServerUnaryCall<Event.UserCacheEventRequest, Event.UserCacheEventResponse>,
    callback: sendUnaryData<Event.UserCacheEventResponse>
): Promise<void> {
    const { uid, userHash, gender, birthDate } = call.request;

    logger.info(`[grpcUserCreateEventHandler::cacheUserEvent] Received UserCacheEventRequest for UID: ${uid}, UserHash: "${userHash}"`);

    const numericUid = Number(uid);
    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await userCreateEventProcessor.processCacheNewUser(numericUid, userHash, gender, birthDate!);

        logger.info(`[grpcUserCreateEventHandler::cacheUserEvent] User cached successfully for UID: ${uid}, UserHash: "${userHash}"`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof UserCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcBallotCreateEventHandler::cacheBallotEvent] Ballot caching failed: UserHash: UID: ${uid}, "${userHash}", Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {        
            statusCode = UserCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcBallotCreateEventHandler::cacheBallotEvent] Unhandled or unexpected error during ballot caching for UID: ${uid}, UserHash: "${userHash}". Error:`, error);
        }
    } finally {
        const response: Event.UserCacheEventResponse = {
            cached: cachedResult,
            status: statusCode,
            uid: uid,
            userHash: userHash
        };

        callback(null, response);
    }
}