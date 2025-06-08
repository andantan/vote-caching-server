import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { CreatedBlockEvent, ReportBlockEventResponse } from "../../generated/blockchain_event/block_event_message.js";
import logger from '../../config/logger.js';

export default function reportCreatedBlockEvent(
    call: ServerUnaryCall<CreatedBlockEvent, ReportBlockEventResponse>,
    callback: sendUnaryData<ReportBlockEventResponse>
): void {
    const { topic, height } = call.request;

    logger.info(`[BlockEvent] CreatedBlockEvent - Topic: ${topic}, Height: ${height}`);

    {
        // TODO: MongoDB service code section
    }

    const response: ReportBlockEventResponse = {
        success: true,
        message: `Block event { topic: ${topic}, height: ${height} }`
    };

    logger.info(`[BlockEvent] ReportBlockEventResponse - Message: ${response.message}, Success: ${response.success}`);

    callback(null, response);
}