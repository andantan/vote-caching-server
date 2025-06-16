import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import * as BallotEvent from '../../generated/web_event/ballot_event_message.js';
import BallotEventMongoActor from "../../database/actor/ballotEventMongoActor.js";
import logger from "../../config/logger.js";
const ballotActor = new BallotEventMongoActor();

import { ballotEventProcessor } from './../processor/ballotEventProcessor';
import { BallotEventError, BallotEventErrorStatus } from "../error/ballotEventError.js";


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

        logger.info(`[grpcBallotEventHandler] Ballot validation successful. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "OK"`);
    } catch (error: unknown) {
        validationResult = false;

        if (error instanceof BallotEventError) {
            statusCode = error.status;

            logger.warn(`[grpcBallotEventHandler] Ballot validation failed: UserHash: "${userHash}", Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BallotEventErrorStatus.UNKNOWN_ERROR;

            logger.error(`[grpcBallotEventHandler] Unhandled or unexpected error during ballot validation for UserHash: "${userHash}", Topic: "${topic}". Error:`, error);
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

    logger.debug(`[BallotEvent::cacheNewBallotEvent] Received cache request for UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}", Option: "${option}"`);

    let cached: boolean = true;
    let status: string = "";
    
    try {
        await ballotActor.addBallotToUser(userHash, voteHash, topic, option);
        status = "OK";
        logger.info(`[BallotEvent::cacheNewBallotEvent] Ballot successfully cached: UserHash: "${userHash}", Topic: "${topic}", VoteHash: "${voteHash}".`);
    } catch (error: unknown) {
        cached = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[BallotEvent::cacheNewBallotEvent] Error during ballot caching. UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Error:`, error);
    }

    const response: BallotEvent.CacheBallotEventResponse = {
        cached: cached,
        status: status
    };

    callback(null, response);
}