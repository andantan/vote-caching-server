import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import { NewProposalEvent, ValidateProposalEventResponse } from "../../generated/web_event/proposal_event_message.js";

export default function validateNewProposalEvent(
    call: ServerUnaryCall<NewProposalEvent, ValidateProposalEventResponse>,
    callback: sendUnaryData<ValidateProposalEventResponse>
): void {
    const { topic, duration } = call.request;

    console.log(`[gRPC-MongoDB-Cache-Server] NewProposalEventService.validateNewProposalEvent received`);
    console.log(`  Topic: ${topic}`);
    console.log(`  Duration: ${duration}`);

    {
        // TODO: MongoDB service code section
    }

    const response: ValidateProposalEventResponse = {
        success: true,
        message: `NewProposal event { topic: ${topic}, duration: ${duration} }`
    };

    console.log(`[gRPC-MongoDB-Cache-Server] NewProposalEventService.validateNewProposalEvent response:`);
    console.log(`  Message: ${response.message}`);
    console.log(`  Success: ${response.success}`);

    callback(null, response);
}