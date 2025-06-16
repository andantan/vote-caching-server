import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as ProposalEvent from "../../generated/web_event/proposal_event_message.js";

import { ProposalEventError, ProposalEventErrorStatus } from "../error/proposalEventError.js";
import { proposalEventProcessor } from "../processor/proposalEventProcessor.js";

export async function validateNewProposalEvent(
    call: ServerUnaryCall<ProposalEvent.ValidateProposalEventRequest, ProposalEvent.ValidateProposalEventResponse>,
    callback: sendUnaryData<ProposalEvent.ValidateProposalEventResponse>
): Promise<void> {
    const { topic } = call.request;

    logger.debug(`[grpcProposalEventHandler::validateNewProposalEvent] Received validation request for Topic: "${topic}"`);

    let validation = true;
    let statusCode = "";

    try {
        await proposalEventProcessor.validateNewProposal(topic);

        logger.info(`[grpcProposalEventHandler::validateNewProposalEvent] Proposal validation successful. Topic: "${topic}", Status: "${statusCode}"`);
    } catch (error: unknown) {
        validation = false;

        if (error instanceof ProposalEventError) {
            statusCode = error.status;
            logger.warn(`[grpcProposalEventHandler::validateNewProposalEvent] Proposal validation failed: Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = ProposalEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalEventHandler::validateNewProposalEvent] Unhandled or unexpected error during proposal validation. Topic: "${topic}". Error:`, error);
        }
        
    } finally {
        const response: ProposalEvent.ValidateProposalEventResponse = {
            validation: validation,
            status: statusCode
        };

        callback(null, response);
    }
}

export async function cacheNewProposalEvent(
    call: ServerUnaryCall<ProposalEvent.CacheProposalEventRequest, ProposalEvent.CacheProposalEventResponse>,
    callback: sendUnaryData<ProposalEvent.CacheProposalEventResponse>
): Promise<void> {
    const { topic, duration, options } = call.request;

    logger.debug(`[grpcProposalEventHandler::cacheNewProposalEvent] Received request to cache new proposal. Topic: "${topic}", Duration: ${duration}`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await proposalEventProcessor.saveNewProposal(topic, duration, options);

        logger.info(`[grpcProposalEventHandler] New proposal successfully cached. Topic: "${topic}".`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof ProposalEventError) {
            statusCode = error.status;
            logger.warn(`[grpcProposalEventHandler] Proposal caching failed: Topic: "${topic}", Duration: ${duration}. Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = ProposalEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalEventHandler] Unhandled or unexpected error during proposal caching. Topic: "${topic}", Duration: ${duration}. Error:`, error);
        }
    } finally {
        const response: ProposalEvent.CacheProposalEventResponse = {
            cached: cachedResult,
            status: statusCode
        };
        callback(null, response);
    }
}