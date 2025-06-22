import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from '../../generated/web_event/ballot_create_event_message.js';

import { ballotCreateEventProcessor } from '../processor/ballotCreateEventProcessor.js';
import { BallotCreateEventError, BallotCreateEventErrorStatus } from "../error/ballotCreateEventError.js";


export async function validateBallotEvent(
    call: ServerUnaryCall<Event.BallotValidateEventRequest, Event.BallotValidateEventResponse>,
    callback: sendUnaryData<Event.BallotValidateEventResponse>
): Promise<void> {
    const { userHash, topic, option } = call.request;

    logger.debug(`[grpcBallotCreateEventHandler::validateBallotEvent] Received validation request for UserHash: "${userHash}", Topic: "${topic}"`);

    let validationResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await ballotCreateEventProcessor.processValidateBallot(userHash, topic, option);

        logger.info(`[grpcBallotCreateEventHandler::validateBallotEvent] Ballot validation successful. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "OK"`);
    } catch (error: unknown) {
        validationResult = false;

        if (error instanceof BallotCreateEventError) {
            statusCode = error.status;

            logger.warn(`[grpcBallotCreateEventHandler::validateBallotEvent] Ballot validation failed: UserHash: "${userHash}", Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BallotCreateEventErrorStatus.UNKNOWN_ERROR;

            logger.error(`[grpcBallotCreateEventHandler::validateBallotEvent] Unhandled or unexpected error during ballot validation for UserHash: "${userHash}", Topic: "${topic}". Error:`, error);
        }
    } finally {
        const response: Event.BallotValidateEventResponse = {
            validation: validationResult,
            status: statusCode
        };

        callback(null, response);
    }
}

export async function cacheBallotEvent(
    call: ServerUnaryCall<Event.BallotCacheEventRequest, Event.BallotCacheEventResponse>,
    callback: sendUnaryData<Event.BallotCacheEventResponse>
): Promise<void> {
    const { userHash, voteHash, topic } = call.request;

    logger.debug(`[grpcBallotCreateEventHandler::cacheBallotEvent] Received validation request for UserHash: "${userHash}", Topic: "${topic}"`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await ballotCreateEventProcessor.processCacheBallot(userHash, voteHash, topic);

        logger.info(`[grpcBallotCreateEventHandler::cacheBallotEvent] Ballot successfully cached: UserHash: "${userHash}", Topic: "${topic}", VoteHash: "${voteHash}".`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof BallotCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcBallotCreateEventHandler::cacheBallotEvent] Ballot caching failed: UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BallotCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcBallotCreateEventHandler::cacheBallotEvent] Unhandled or unexpected error during ballot caching for UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Error:`, error);
        }
    } finally {
        const response: Event.BallotCacheEventResponse = {
            cached: cachedResult,
            status: statusCode
        };

        callback(null, response);
    }
}