import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import { NewProposalEvent, ValidateProposalEventResponse } from "../../generated/web_event/proposal_event_message.js";
import { ProposalEventMongoActor } from "../../database/actor/votes/proposalEventMongoActor.js";
import logger from "../../config/logger.js";

const proposalMongoActor = new ProposalEventMongoActor()

export default async function validateNewProposalEvent(
    call: ServerUnaryCall<NewProposalEvent, ValidateProposalEventResponse>,
    callback: sendUnaryData<ValidateProposalEventResponse>
): Promise<void> {
    const { topic, duration } = call.request;

    logger.info(`[ProposalEvent] NewProposalEvent - Topic: ${topic}, Duration: ${duration}`);

    let success = true;
    let message = '';

    try {
        const voteId = await proposalMongoActor.saveNewProposal(topic, duration);
        message = `New proposal for topic "${topic}" (duration: ${duration} min) accepted and saved. Vote ID: ${voteId}`;
        logger.info(`[ProposalEvent] Successfully processed and saved new proposal.`);
    } catch (error: unknown) {
        success = false;
        message = `Failed to validate or save new proposal for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
        logger.error(`[ProposalEvent] Error processing new proposal:`, error);
    }

    const response: ValidateProposalEventResponse = {
        success: true,
        message: message
    };

    logger.info(`[ProposalEvent] ValidateProposalEventResponse - Message: ${response.message}, Success: ${response.success}`);

    callback(null, response);
}