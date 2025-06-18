import { Timestamp } from "../../generated/google/protobuf/timestamp.js";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from "../../generated/web_event/ballot_query_event_message.js";

import { ballotQueryEventProcessor } from "../processor/ballotQueryEventProcessor.js";
import { BallotQueryEventError, BallotQueryEventErrorStatus } from "../error/ballotQueryEventError.js";


export async function getUserBallots(
    call: ServerUnaryCall<Event.GetUserBallotsRequest, Event.GetUserBallotsResponse>,
    callback: sendUnaryData<Event.GetUserBallotsResponse>
): Promise<void> {
    const { userHash } = call.request;

    logger.debug(`[grpcBallotQueryEventHandler::getUserBallots] Received GetUserBallots request for UserHash: "${userHash}"`);

    let queried: boolean = true;
    let statusCode: string = "OK";
    let ballots: Event.Ballot[] = [];
    
    try {
        const userBallots = await ballotQueryEventProcessor.getUserBallots(userHash);

        ballots = userBallots.map(ballot => {
            const ballotMessage: Event.Ballot = Event.Ballot.create({
                voteHash: ballot.voteHash,
                topic: ballot.topic,
                submittedAt: Timestamp.fromDate(ballot.submittedAt)
            });

            return ballotMessage;
        });

        logger.info(`[grpcBallotQueryEventHandler::getUserBallots] Successfully retrieved ${ballots.length} ballots for UserHash: "${userHash}".`);
    } catch (error: unknown) {
        queried = false;
        ballots = []

        if (error instanceof BallotQueryEventError) {
            statusCode = error.status;

            switch (statusCode) {
                case BallotQueryEventErrorStatus.USER_NOT_FOUND:
                    logger.warn(`[grpcBallotQueryEventHandler::getUserBallots] User with hash "${userHash}" not found.`);
                    break;
                default:
                    logger.error(`[grpcBallotQueryEventHandler::getUserBallots] Processed error getting ballots for UserHash: "${userHash}". Status: "${statusCode}". Internal message: "${error.message}"`);
                    break;
            }
        } else {
            statusCode = BallotQueryEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcBallotQueryEventHandler::getUserBallots] Unhandled or unexpected error getting ballots for UserHash: "${userHash}". Error:`, error);
        }
    } finally {
        const response: Event.GetUserBallotsResponse = Event.GetUserBallotsResponse.create({
            queried: queried,
            status: statusCode,
            ballots: ballots
        });

        callback(null, response);
    }
}