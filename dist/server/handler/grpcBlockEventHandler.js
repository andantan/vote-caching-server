"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = reportCreatedBlockEvent;
function reportCreatedBlockEvent(call, callback) {
    const { topic, height } = call.request;
    console.log(`[gRPC-MongoDB-Cache-Server] CreatedBlockEventService.reportCreatedBlockEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Height: ${height}`);
    {
        // TODO: MongoDB service code section
    }
    const response = {
        success: true,
        message: `Block event { topic: ${topic}, height: ${height} }`
    };
    console.log(`[gRPC-MongoDB-Cache-Server] CreatedBlockEventService.reportCreatedBlockEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);
    callback(null, response);
}
//# sourceMappingURL=grpcBlockEventHandler.js.map