import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { CreatedBlockEvent, ReportBlockEventResponse } from "../../generated/blockchain_event/block_event_message.js";
import { BlockEventMongoDBActor } from "../../database/actor/blockEventMongoActor.js";
import logger from '../../config/logger.js';

const actor = new BlockEventMongoDBActor();

export async function reportCreatedBlockEvent(
    call: ServerUnaryCall<CreatedBlockEvent, ReportBlockEventResponse>,
    callback: sendUnaryData<ReportBlockEventResponse>
): Promise<void> {
    const { topic, length, height } = call.request;

    logger.info(`[BlockEvent] CreatedBlockEvent - Topic: ${topic}`);

    let cached = true;
    let status = "";

    try {
        await actor.addBlockToVote(topic, length, height);
        status = "OK";
        logger.info(`[ProposalEvent] CreatedBlockEvent - Topic: "${topic}", Length: ${length}, Height: ${height}`);
    } catch (error: unknown) {
        cached = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[ProposalEvent] CreatedBlockEvent - Topic: "${topic}", Unknown error:`, error);
    }

    const response: ReportBlockEventResponse = {
        cached: cached,
        status: status
    };
    
    callback(null, response);
}