import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import logger from '../../config/logger.js';

import { CreatedBlockEvent, ReportBlockEventResponse } from "../../generated/blockchain_event/block_event_message.js";

import { BlockEventError, BlockEventErrorStatus } from '../error/blockEventError.js';
import { blockEventProcessor } from '../processor/blockEventProcessor.js';


export async function reportCreatedBlockEvent(
    call: ServerUnaryCall<CreatedBlockEvent, ReportBlockEventResponse>,
    callback: sendUnaryData<ReportBlockEventResponse>
): Promise<void> {
    const { topic, length, height } = call.request;

    logger.debug(`[grpcBlockEventHandler::reportCreatedBlockEvent] Received block event: Topic="${topic}", Length=${length}, Height=${height}`);

    let cachedResult: boolean = true;
    let statusCode: string = "";

    try {
        await blockEventProcessor.addBlockToVote(topic, length, height);

        logger.info(`[grpcBlockEventHandler::reportCreatedBlockEvent] Block successfully processed and cached: Topic="${topic}", Height=${height}`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof BlockEventError) {
            statusCode = error.status;
            logger.warn(`[grpcBlockEventHandler::reportCreatedBlockEvent] Failed to process/cache block: Topic="${topic}", Length=${length}, Height=${height}. Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = BlockEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcBlockEventHandler::reportCreatedBlockEvent] Unhandled or unexpected error during block event processing: Topic="${topic}", Length=${length}, Height=${height}. Error:`, error);
        }
    } finally {
        const response: ReportBlockEventResponse = {
            cached: cachedResult,
            status: statusCode
        };

        callback(null, response);
    }
}