import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { ExpiredPendingEvent, ReportPendingEventResponse } from "../../generated/pending_event_message.js";

export default function reportExpiredPendingEvent(
    call: ServerUnaryCall<ExpiredPendingEvent, ReportPendingEventResponse>,
    callback: sendUnaryData<ReportPendingEventResponse>
): void {
    const { topic, count, options } = call.request;

    console.log(`[gRPC-MongoDB-Cache-Server] ExpiredPendingEventService.reportExpiredPendingEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Count: ${count}`);
    console.log(`  Options:`, options); 

    {
        // TODO: MongoDB service code section
    }

    const response: ReportPendingEventResponse = {
        success: true,
        message: `Pending event { topic: ${topic}, count: ${count}, optons: ${JSON.stringify(options)} }`
    };

    console.log(`[gRPC-MongoDB-Cache-Server] ExpiredPendingEventService.reportExpiredPendingEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);

    callback(null, response);
}