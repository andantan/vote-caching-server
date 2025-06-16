import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import * as ProposalEvent from "../../generated/web_event/proposal_event_message.js";
import ProposalEventMongoActor from "../../database/actor/proposalEventMongoActor.js";
import logger from "../../config/logger.js";

const actor = new ProposalEventMongoActor()

export async function validateNewProposalEvent(
    call: ServerUnaryCall<ProposalEvent.ValidateProposalEventRequest, ProposalEvent.ValidateProposalEventResponse>,
    callback: sendUnaryData<ProposalEvent.ValidateProposalEventResponse>
): Promise<void> {
    const { topic } = call.request;

    logger.debug(`[ProposalEvent::validateNewProposalEvent] Received validation request for Topic: "${topic}"`);

    let validation = true;
    let status = "";

    try {
        const validatedVote = await actor.findIfExistsProposal(topic);

        if (validatedVote === null) {
            validation = true;
            status = "OK";
            
            logger.info(`[ProposalEvent::validateNewProposalEvent] Proposal validation successful. Topic: "${topic}", Status: "${status}"`);
        } else {
            validation = false;
            status = validatedVote.expired ? "PROPOSAL_EXPIRED" : "PROPOSAL_ALREADY_OPEN";

            logger.warn(`[ProposalEvent::validateNewProposalEvent] Proposal validation failed: Topic: "${topic}", Status: "${status}"`);
        }

    } catch (error: unknown) {
        validation = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[ProposalEvent::validateNewProposalEvent] Unhandled error during proposal validation. Topic: "${topic}". Error:`, error);
    }

    const response: ProposalEvent.ValidateProposalEventResponse = {
        validation: validation,
        status: status
    };

    callback(null, response);
}

export async function cacheNewProposalEvent(
    call: ServerUnaryCall<ProposalEvent.CacheProposalEventRequest, ProposalEvent.CacheProposalEventResponse>,
    callback: sendUnaryData<ProposalEvent.CacheProposalEventResponse>
): Promise<void> {
    const { topic, duration, options } = call.request;

    logger.debug(`[ProposalEvent::cacheNewProposalEvent] Received request to cache new proposal. Topic: "${topic}", Duration: ${duration}`);

    let cached = true;
    let status = "";

    try {
        await actor.saveNewProposal(topic, duration, options);

        cached = true;
        status = "OK";

        logger.info(`[ProposalEvent::cacheNewProposalEvent] New proposal successfully cached. Topic: "${topic}".`);
    } catch (error: unknown) {
        cached = false;
        status = "UNKNOWN_ERROR";

        logger.error(`[ProposalEvent::cacheNewProposalEvent] Unhandled error during proposal caching. Topic: "${topic}", Duration: ${duration}. Error:`, error);
    }

    const response: ProposalEvent.CacheProposalEventResponse = {
        cached: cached,
        status: status
    };

    callback(null, response);
}