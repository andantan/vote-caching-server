import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import logger from '../../config/logger.js';

import * as Event from "../../generated/blockchain_event/block_event_message.js";

import { BlockEventError, BlockEventErrorStatus } from '../error/blockEventError.js';
import { blockEventProcessor } from '../processor/blockEventProcessor.js';


export async function reportBlockCreatedEvent(
    call: ServerUnaryCall<Event.ReportBlockCreatedEventRequest, Event.ReportBlockCreatedEventResponse>,
    callback: sendUnaryData<Event.ReportBlockCreatedEventResponse>
): Promise<void> {
    const { topic, transactionCount, height } = call.request;

    logger.debug(`[grpcBlockEventHandler::reportBlockCreatedEvent] Received block event: Topic="${topic}", TransactionCount=${transactionCount}, Height=${height}`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await blockEventProcessor.addBlockToVote(topic, transactionCount, height);

        logger.info(`[grpcBlockEventHandler::reportBlockCreatedEvent] Block successfully processed and cached: Topic="${topic}", Height=${height}`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof BlockEventError) {
            statusCode = error.status;
            logger.warn(`[grpcBlockEventHandler::reportBlockCreatedEvent] Failed to process/cache block: Topic="${topic}", TransactionCount=${transactionCount}, Height=${height}. Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BlockEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcBlockEventHandler::reportBlockCreatedEvent] Unhandled or unexpected error during block event processing: Topic="${topic}", TransactionCount=${transactionCount}, Height=${height}. Error:`, error);
        }
    } finally {
        const response: Event.ReportBlockCreatedEventResponse = {
            cached: cachedResult,
            status: statusCode
        };

        callback(null, response);
    }
}