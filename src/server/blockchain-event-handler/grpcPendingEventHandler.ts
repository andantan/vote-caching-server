import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { ExpiredPendingEvent, ReportPendingEventResponse } from "../../generated/blockchain_event/pending_event_message.js";
import logger from '../../config/logger.js';

export default function reportExpiredPendingEvent(
    call: ServerUnaryCall<ExpiredPendingEvent, ReportPendingEventResponse>,
    callback: sendUnaryData<ReportPendingEventResponse>
): void {
    const { topic, count, options } = call.request;

    logger.debug(`[PendingEvent] ExpiredPendingEvent - Topic: ${topic}, Count: ${count}, Options: ${JSON.stringify(options)}`);

    {
        // TODO: MongoDB service code section
    }

    const response: ReportPendingEventResponse = {
        success: true,
        message: `Pending event { topic: ${topic}, count: ${count}, optons: ${JSON.stringify(options)} }`
    };

    logger.debug(`[PendingEvent] ReportPendingEventResponse - Message: ${response.message}, Success: ${response.success}`);

    callback(null, response);
}