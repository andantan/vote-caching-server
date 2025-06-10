import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import * as ProposalEvent from "../../generated/web_event/proposal_event_message.js";
import { ProposalEventMongoDBActor } from "../../database/actor/votes/proposalEventMongoActor.js";
import logger from "../../config/logger.js";

const actor = new ProposalEventMongoDBActor()

export async function validateNewProposalEvent(
    call: ServerUnaryCall<ProposalEvent.ValidateProposalEventRequest, ProposalEvent.ValidateProposalEventResponse>,
    callback: sendUnaryData<ProposalEvent.ValidateProposalEventResponse>
): Promise<void> {
    const { topic } = call.request;

    logger.info(`[ProposalEvent] ValidateNewProposalEvent - Topic: "${topic}"`);

    let validation = true;
    let status = '';

    try {
        const validatedVote = await actor.findIfExistsProposal(topic);

        if (validatedVote === null) {
            status = "OK";
            logger.info(`[ProposalEvent] ValidateNewProposalEvent - Topic: "${topic}", Status: "${status}", Validation: ${validation}`);
        } else {
            validation = false;
            status = validatedVote.expired ? "PROPOSAL_EXPIRED" : "PROPOSAL_ALREADY_OPEN";
            logger.warn(`[ProposalEvent] ValidateNewProposalEvent - Topic: "${topic}", Status: "${status}", Validation: ${validation}`);
        }
    } catch (error: unknown) {
        validation = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[ProposalEvent] ValidateNewProposalEvent - Topic: "${topic}", UNKNOWN_ERROR: `, error);
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
    const { topic, duration } = call.request;

    logger.info(`[ProposalEvent] CacheNewProposalEvent - Topic: "${topic}"`);

    let cached = true;
    let status = '';

    try {
        await actor.saveNewProposal(topic, duration);
        status = "OK";
        logger.info(`[ProposalEvent] CacheNewProposalEvent - Topic: "${topic}", Status: "${status}", Cached: ${cached}`);
    } catch (error: unknown) {
        cached = false;
        status = "UNKNOWN_ERROR";
        logger.error(`[ProposalEvent] CacheNewProposalEvent - Topic: "${topic}", Unknown error:`, error);
    }

    const response: ProposalEvent.CacheProposalEventResponse = {
        cached: cached,
        status: status
    };

    callback(null, response);
}