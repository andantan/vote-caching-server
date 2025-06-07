import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import { NewProposalEvent, ValidateProposalEventResponse } from "../../generated/web_event/proposal_event_message.js";
import logger from "../../config/logger.js";

export default function validateNewProposalEvent(
    call: ServerUnaryCall<NewProposalEvent, ValidateProposalEventResponse>,
    callback: sendUnaryData<ValidateProposalEventResponse>
): void {
    const { topic, duration } = call.request;

    logger.info(`[ProposalEvent] NewProposalEvent - Topic: ${topic}, Duration: ${duration}`);

    {
        // TODO: MongoDB service code section
    }

    const response: ValidateProposalEventResponse = {
        success: true,
        message: `NewProposal event { topic: ${topic}, duration: ${duration} }`
    };

    logger.info(`[ProposalEvent] ValidateProposalEventResponse - Message: ${response.message}, Success: ${response.success}`);

    callback(null, response);
}