import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import * as BallotEvent from './../../generated/web_event/ballot_event_message.js';
import UserEventMongoActor from "../../database/actor/userEventMongoActor.js";
import BallotEventMongoActor from "../../database/actor/ballotEventMongoActor.js";
import logger from "../../config/logger.js";

const userActor = new UserEventMongoActor();
const cacheActor = new BallotEventMongoActor();

export async function validateNewBallotEvent(
    call: ServerUnaryCall<BallotEvent.ValidateBallotEventRequest, BallotEvent.ValidateBallotEventResponse>,
    callback: sendUnaryData<BallotEvent.ValidateBallotEventResponse>
): Promise<void> {
    const { userHash, topic } = call.request;

    logger.debug(`[BallotEvent::validateNewBallotEvent] Received validation request for UserHash: "${userHash}", Topic: "${topic}"`);

    let validation: boolean = true;
    let status: string = "";

    try {
        // Tempor section -> Will migrate to register logic
        logger.debug(`[BallotEvent::validateNewBallotEvent] Checking/Creating user for UserHash: "${userHash}" (Temporary user registration logic)`);
        await userActor.saveNewUserIfNotExists(userHash); 
        // Tempor section end

        logger.debug(`[BallotEvent::validateNewBallotEvent] User check/creation complete for UserHash: "${userHash}"`);

        const alreadyVoted = await cacheActor.findIfExistsBallot(userHash, topic);

        if (alreadyVoted === null) {
            validation = true;
            status = "OK";

            logger.info(`[BallotEvent::validateNewBallotEvent] Ballot validation successful. UserHash: "${userHash}", Topic: "${topic}". Status: "${status}"`);
        } else {
            validation = false;
            status = "DUPLICATE_VOTE_SUBMISSION";

            logger.warn(`[BallotEvent::validateNewBallotEvent] Duplicate ballot submission attempt. UserHash: "${userHash}", Topic: "${topic}". Status: "${status}"`);
        }
        
    } catch (error: unknown) {
        validation = false;
        status = "UNKNOWN_ERROR";
        
        logger.error(`[BallotEvent::validateNewBallotEvent] Error during ballot validation. UserHash: "${userHash}", Topic: "${topic}". Error:`, error);
    }

    const response: BallotEvent.ValidateBallotEventResponse = {
        validation: validation,
        status: status
    };

    callback(null, response);
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
        await cacheActor.addBallotToUser(userHash, voteHash, topic, option);
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