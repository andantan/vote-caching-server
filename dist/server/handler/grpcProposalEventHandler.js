"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = validateNewProposalEvent;
function validateNewProposalEvent(call, callback) {
    const { topic, duration } = call.request;
    console.log(`[gRPC-MongoDB-Cache-Server] NewProposalEventService.validateNewProposalEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Duration: ${duration}`);
    {
        // TODO: MongoDB service code section
    }
    const response = {
        success: true,
        message: `Proposal event { topic: ${topic}, duration: ${duration} }`
    };
    console.log(`[gRPC-MongoDB-Cache-Server] NewProposalEventService.validateNewProposalEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);
    callback(null, response);
}
//# sourceMappingURL=grpcProposalEventHandler.js.map