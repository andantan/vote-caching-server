import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { ExpiredPendingEvent, ReportPendingEventResponse } from "../../generated/blockchain_event/pending_event_message.js";
import PendingEventMongoActor from '../../database/actor/pendingEventMongoActor.js';
import logger from '../../config/logger.js';

const actor = new PendingEventMongoActor();

export async function reportExpiredPendingEvent(
    call: ServerUnaryCall<ExpiredPendingEvent, ReportPendingEventResponse>,
    callback: sendUnaryData<ReportPendingEventResponse>
): Promise<void> {
    const { topic, count, options } = call.request;

    logger.debug(`[PendingEvent::reportExpiredPendingEvent] Received expired pending event: Topic="${topic}", Count=${count}, Options=${JSON.stringify(options)}`);

    let cached: boolean = true;
    let status: string = "";

    try {
        await actor.saveVoteResult(topic, count, options);

        cached = true;
        status = "OK";
        logger.info(`[PendingEvent::reportExpiredPendingEvent] Vote results successfully cached: Topic="${topic}", TotalCount=${count}`);
    } catch (error: unknown) {
        cached = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[PendingEvent::reportExpiredPendingEvent] Failed to save vote results: Topic="${topic}", Count=${count}, Options=${JSON.stringify(options)}. Error:`, error);
    }

    const response: ReportPendingEventResponse = {
        cached: cached,
        status: status
    };

    callback(null, response);
}