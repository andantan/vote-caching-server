import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import { NewBallotEvent, ValidateBallotEventResponse } from './../../generated/web_event/ballot_event_message';
import logger from "../../config/logger";

export default function validateNewBallotEvent(
    call: ServerUnaryCall<NewBallotEvent, ValidateBallotEventResponse>,
    callback: sendUnaryData<ValidateBallotEventResponse>
): void {
    const { hash, option, topic } = call.request;

    logger.info(`[BallotEvent] NewBallotEvent - Topic: ${topic}, Hash: ${hash}, option: ${option}`);

    {
        // TODO: MongoDB service code section
    }

    const response: ValidateBallotEventResponse = {
        success: true,
        message: `NewBallot event { topic: ${topic}, Hash: ${hash}, option: ${option} }`
    };

    logger.info(`[BallotEvent] ValidateBallotEventResponse - Message: ${response.message}, Success: ${response.success}`);

    callback(null, response);
}