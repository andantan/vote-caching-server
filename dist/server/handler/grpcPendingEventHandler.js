"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = reportExpiredPendingEvent;
function reportExpiredPendingEvent(call, callback) {
    const { topic, count, options } = call.request;
    console.log(`[gRPC-MongoDB-Cache-Server] ExpiredPendingEventService.reportExpiredPendingEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Count: ${count}`);
    console.log(`  Options:`, options);
    {
        // TODO: MongoDB service code section
    }
    const response = {
        success: true,
        message: `Pending event { topic: ${topic}, count: ${count}, optons: ${JSON.stringify(options)} }`
    };
    console.log(`[gRPC-MongoDB-Cache-Server] ExpiredPendingEventService.reportExpiredPendingEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);
    callback(null, response);
}
//# sourceMappingURL=grpcPendingEventHandler.js.map