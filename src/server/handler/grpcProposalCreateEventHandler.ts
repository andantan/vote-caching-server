import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from "../../generated/web_event/proposal_create_event_message.js";

import { ProposalCreateEventError, ProposalCreateEventErrorStatus } from "../error/proposalCreateEventError.js";
import { proposalCreateEventProcessor } from "../processor/proposalCreateEventProcessor.js";

export async function validateProposalEvent(
    call: ServerUnaryCall<Event.ProposalValidateEventRequest, Event.ProposalValidateEventResponse>,
    callback: sendUnaryData<Event.ProposalValidateEventResponse>
): Promise<void> {
    const { topic } = call.request;

    logger.debug(`[grpcProposalCreateEventHandler::validateProposalEvent] Received validation request for Topic: "${topic}"`);

    let validationResult = true;
    let statusCode = "OK";

    try {
        await proposalCreateEventProcessor.processValidateProposal(topic);

        logger.info(`[grpcProposalCreateEventHandler::validateProposalEvent] Proposal validation successful. Topic: "${topic}", Status: "${statusCode}"`);
    } catch (error: unknown) {
        validationResult = false;

        if (error instanceof ProposalCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcProposalCreateEventHandler::validateProposalEvent] Proposal validation failed: Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = ProposalCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalCreateEventHandler::validateProposalEvent] Unhandled or unexpected error during proposal validation. Topic: "${topic}". Error:`, error);
        }
        
    } finally {
        const response: Event.ProposalValidateEventResponse = {
            validation: validationResult,
            status: statusCode
        };

        callback(null, response);
    }
}

export async function cacheProposalEvent(
    call: ServerUnaryCall<Event.ProposalCacheEventRequest, Event.ProposalCacheEventResponse>,
    callback: sendUnaryData<Event.ProposalCacheEventResponse>
): Promise<void> {
    const { topic, proposer, duration, options } = call.request;

    logger.debug(`[grpcProposalCreateEventHandler::cacheProposalEvent] Received request to cache new proposal. Topic: "${topic}", Proposer: "${proposer}", Duration: ${duration}`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await proposalCreateEventProcessor.processCacheProposal(topic, proposer, duration, options);

        logger.info(`[grpcProposalCreateEventHandler::cacheProposalEvent] New proposal successfully cached. Topic: "${topic}".`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof ProposalCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcProposalCreateEventHandler::cacheProposalEvent] Proposal caching failed: Topic: "${topic}", Duration: ${duration}. Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = ProposalCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalCreateEventHandler::cacheProposalEvent] Unhandled or unexpected error during proposal caching. Topic: "${topic}", Duration: ${duration}. Error:`, error);
        }
    } finally {
        const response: Event.ProposalCacheEventResponse = {
            cached: cachedResult,
            status: statusCode
        };
        callback(null, response);
    }
}