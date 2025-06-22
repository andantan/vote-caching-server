import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import logger from '../../config/logger.js';

import * as Event from "../../generated/blockchain_event/pending_event_message.js";

import { PendingEventError, PendingEventErrorStatus } from '../error/pendingEventError.js';
import { pendingEventProcessor } from '../processor/pendingEventProcessor.js';


export async function reportPendingExpiredEvent(
    call: ServerUnaryCall<Event.PendingExpiredEventRequest, Event.PendingExpiredEventResponse>,
    callback: sendUnaryData<Event.PendingExpiredEventResponse>
): Promise<void> {
    const { topic, count, options } = call.request;

    logger.debug(`[grpcPendingEventHandler::reportPendingExpiredEvent] Received expired pending event: Topic="${topic}", Count=${count}, Options=${JSON.stringify(options)}`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await pendingEventProcessor.processCacheResult(topic, count, options);
        logger.info(`[grpcPendingEventHandler::reportPendingExpiredEvent] Vote results successfully saved: Topic="${topic}", TotalCount=${count}`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof PendingEventError) {
            statusCode = error.status;
            logger.warn(`[grpcPendingEventHandler::reportPendingExpiredEvent] Failed to save vote results: Topic="${topic}", Count=${count}, Options=${JSON.stringify(options)}. Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = PendingEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcPendingEventHandler::reportPendingExpiredEvent] Unhandled or unexpected error during pending event processing: Topic="${topic}", Count=${count}, Options=${JSON.stringify(options)}. Error:`, error);
        }
    } finally {
        const response: Event.PendingExpiredEventResponse = {
            cached: cachedResult,
            status: statusCode
        };
        callback(null, response);
    }
}