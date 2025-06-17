import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from '../../generated/web_event/ballot_create_event_message.js';

import { ballotCreateEventProcessor } from '../processor/ballotCreateEventProcessor.js';
import { BallotCreateEventError, BallotCreateEventErrorStatus } from "../error/ballotCreateEventError.js";


export async function validateNewBallotEvent(
    call: ServerUnaryCall<Event.ValidateBallotEventRequest, Event.ValidateBallotEventResponse>,
    callback: sendUnaryData<Event.ValidateBallotEventResponse>
): Promise<void> {
    const { userHash, topic, option } = call.request;

    logger.debug(`[grpcBallotCreateEventHandler::validateNewBallotEvent] Received validation request for UserHash: "${userHash}", Topic: "${topic}"`);

    let validationResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await ballotCreateEventProcessor.validateNewBallot(userHash, topic, option);

        logger.info(`[grpcBallotCreateEventHandler::validateNewBallotEvent] Ballot validation successful. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "OK"`);
    } catch (error: unknown) {
        validationResult = false;

        if (error instanceof BallotCreateEventError) {
            statusCode = error.status;

            logger.warn(`[grpcBallotCreateEventHandler::validateNewBallotEvent] Ballot validation failed: UserHash: "${userHash}", Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BallotCreateEventErrorStatus.UNKNOWN_ERROR;

            logger.error(`[grpcBallotCreateEventHandler::validateNewBallotEvent] Unhandled or unexpected error during ballot validation for UserHash: "${userHash}", Topic: "${topic}". Error:`, error);
        }
    } finally {
        const response: Event.ValidateBallotEventResponse = {
            validation: validationResult,
            status: statusCode
        };

        callback(null, response);
    }
}

export async function cacheNewBallotEvent(
    call: ServerUnaryCall<Event.CacheBallotEventRequest, Event.CacheBallotEventResponse>,
    callback: sendUnaryData<Event.CacheBallotEventResponse>
): Promise<void> {
    const { userHash, voteHash, topic, option } = call.request;

    logger.debug(`[grpcBallotCreateEventHandler::cacheNewBallotEvent] Received validation request for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}"`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await ballotCreateEventProcessor.addBallotToCache(userHash, voteHash, topic, option);

        logger.info(`[grpcBallotCreateEventHandler::cacheNewBallotEvent] Ballot successfully cached: UserHash: "${userHash}", Topic: "${topic}", VoteHash: "${voteHash}".`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof BallotCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcBallotCreateEventHandler::cacheNewBallotEvent] Ballot caching failed: UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BallotCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcBallotCreateEventHandler::cacheNewBallotEvent] Unhandled or unexpected error during ballot caching for UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Error:`, error);
        }
    } finally {
        const response: Event.CacheBallotEventResponse = {
            cached: cachedResult,
            status: statusCode
        };

        callback(null, response);
    }
}