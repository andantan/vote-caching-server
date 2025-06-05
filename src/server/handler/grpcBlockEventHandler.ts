import { ServerUnaryCall, sendUnaryData } from '@grpc/grpc-js';

import { CreatedBlockEvent, ReportBlockEventResponse } from "../../generated/block_event_message.js";

export default function reportCreatedBlockEvent(
    call: ServerUnaryCall<CreatedBlockEvent, ReportBlockEventResponse>,
    callback: sendUnaryData<ReportBlockEventResponse>
): void {
    const { topic, height } = call.request;

    console.log(`[gRPC-MongoDB-Cache-Server] CreatedBlockEventService.reportCreatedBlockEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Height: ${height}`);

    {
        // TODO: MongoDB service code section
    }

    const response: ReportBlockEventResponse = {
        success: true,
        message: `Block event { topic: ${topic}, height: ${height} }`
    };

    console.log(`[gRPC-MongoDB-Cache-Server] CreatedBlockEventService.reportCreatedBlockEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);

    callback(null, response);
}