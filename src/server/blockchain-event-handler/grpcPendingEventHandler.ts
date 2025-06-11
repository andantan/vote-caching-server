import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { ExpiredPendingEvent, ReportPendingEventResponse } from "../../generated/blockchain_event/pending_event_message.js";
import PendingEventMongoActor from '../../database/actor/pendingEventMongoActor.js';
import logger from '../../config/logger.js';

const actor = new PendingEventMongoActor();

export default async function reportExpiredPendingEvent(
    call: ServerUnaryCall<ExpiredPendingEvent, ReportPendingEventResponse>,
    callback: sendUnaryData<ReportPendingEventResponse>
): Promise<void> {
    const { topic, count, options } = call.request;

    logger.debug(`[PendingEvent] ExpiredPendingEvent - Topic: "${topic}"`);

    let cached: boolean = true;
    let status: string = "";

    try {
        await actor.saveVoteResult(topic, count, options);
        status = "OK";
        logger.info(`[PendingEvent] ExpiredPendingEvent - Topic: "${topic}", Count: ${count}, Options: ${JSON.stringify(options)}`);
    } catch (error: unknown) {
        cached = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[PendingEvent] ExpiredPendingEvent - Topic: "${topic}", Unknown error:`, error);
    }

    const response: ReportPendingEventResponse = {
        cached: cached,
        status: status
    };

    callback(null, response);
}