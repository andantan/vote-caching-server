import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as BallotEvent from '../../generated/web_event/ballot_event_message.js';

import { BallotEventError, BallotEventErrorStatus } from "../error/ballotEventError.js";
import { ballotEventProcessor } from './../processor/ballotEventProcessor';


export async function validateNewBallotEvent(
    call: ServerUnaryCall<BallotEvent.ValidateBallotEventRequest, BallotEvent.ValidateBallotEventResponse>,
    callback: sendUnaryData<BallotEvent.ValidateBallotEventResponse>
): Promise<void> {
    const { userHash, topic, option } = call.request;

    logger.debug(`[grpcBallotEventHandler::validateNewBallotEvent] Received validation request for UserHash: "${userHash}", Topic: "${topic}"`);

    let validationResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await ballotEventProcessor.validateNewBallot(userHash, topic, option);

        logger.info(`[grpcBallotEventHandler::validateNewBallotEvent] Ballot validation successful. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "OK"`);
    } catch (error: unknown) {
        validationResult = false;

        if (error instanceof BallotEventError) {
            statusCode = error.status;

            logger.warn(`[grpcBallotEventHandler::validateNewBallotEvent] Ballot validation failed: UserHash: "${userHash}", Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BallotEventErrorStatus.UNKNOWN_ERROR;

            logger.error(`[grpcBallotEventHandler::validateNewBallotEvent] Unhandled or unexpected error during ballot validation for UserHash: "${userHash}", Topic: "${topic}". Error:`, error);
        }
    } finally {
        const response: BallotEvent.ValidateBallotEventResponse = {
            validation: validationResult,
            status: statusCode
        };

        callback(null, response);
    }
}

export async function cacheNewBallotEvent(
    call: ServerUnaryCall<BallotEvent.CacheBallotEventRequest, BallotEvent.CacheBallotEventResponse>,
    callback: sendUnaryData<BallotEvent.CacheBallotEventResponse>
): Promise<void> {
    const { userHash, voteHash, topic, option } = call.request;

    logger.debug(`[grpcBallotEventHandler::cacheNewBallotEvent] Received validation request for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}"`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await ballotEventProcessor.addBallotToCache(userHash, voteHash, topic, option);

        logger.info(`[grpcBallotEventHandler::cacheNewBallotEvent] Ballot successfully cached: UserHash: "${userHash}", Topic: "${topic}", VoteHash: "${voteHash}".`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof BallotEventError) {
            statusCode = error.status;
            logger.warn(`[grpcBallotEventHandler::cacheNewBallotEvent] Ballot caching failed: UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BallotEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcBallotEventHandler::cacheNewBallotEvent] Unhandled or unexpected error during ballot caching for UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Error:`, error);
        }
    } finally {
        const response: BallotEvent.CacheBallotEventResponse = {
            cached: cachedResult,
            status: statusCode
        };

        callback(null, response);
    }
}