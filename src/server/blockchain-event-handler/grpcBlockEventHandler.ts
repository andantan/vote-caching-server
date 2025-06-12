import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { CreatedBlockEvent, ReportBlockEventResponse } from "../../generated/blockchain_event/block_event_message.js";
import BlockEventMongoDBActor from "../../database/actor/blockEventMongoActor.js";
import logger from '../../config/logger.js';

const actor = new BlockEventMongoDBActor();

export async function reportCreatedBlockEvent(
    call: ServerUnaryCall<CreatedBlockEvent, ReportBlockEventResponse>,
    callback: sendUnaryData<ReportBlockEventResponse>
): Promise<void> {
    const { topic, length, height } = call.request;

    logger.debug(`[BlockEvent::reportCreatedBlockEvent] Received block event: Topic="${topic}", Length=${length}, Height=${height}`);

    let cached: boolean = true;
    let status: string = "";

    try {
        await actor.addBlockToVote(topic, length, height);

        cached = true;
        status = "OK";
        logger.info(`[BlockEvent::reportCreatedBlockEvent] Block successfully cached: Topic="${topic}", Height=${height}`);
    } catch (error: unknown) {
        cached = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[BlockEvent::reportCreatedBlockEvent] Failed to cache block: Topic="${topic}", Length=${length}, Height=${height}. Error:`, error);
    }

    const response: ReportBlockEventResponse = {
        cached: cached,
        status: status
    };
    
    callback(null, response);
}