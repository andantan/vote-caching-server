import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from "../../generated/web_event/proposal_create_event_message.js";

import { ProposalCreateEventError, ProposalCreateEventErrorStatus } from "../error/proposalCreateEventError.js";
import { proposalCreateEventProcessor } from "../processor/proposalCreateEventProcessor.js";

export async function validateNewProposalEvent(
    call: ServerUnaryCall<Event.ValidateProposalEventRequest, Event.ValidateProposalEventResponse>,
    callback: sendUnaryData<Event.ValidateProposalEventResponse>
): Promise<void> {
    const { topic } = call.request;

    logger.debug(`[grpcProposalCreateEventHandler::validateNewProposalEvent] Received validation request for Topic: "${topic}"`);

    let validationResult = true;
    let statusCode = "OK";

    try {
        await proposalCreateEventProcessor.validateNewProposal(topic);

        logger.info(`[grpcProposalCreateEventHandler::validateNewProposalEvent] Proposal validation successful. Topic: "${topic}", Status: "${statusCode}"`);
    } catch (error: unknown) {
        validationResult = false;

        if (error instanceof ProposalCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcProposalCreateEventHandler::validateNewProposalEvent] Proposal validation failed: Topic: "${topic}". Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = ProposalCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalCreateEventHandler::validateNewProposalEvent] Unhandled or unexpected error during proposal validation. Topic: "${topic}". Error:`, error);
        }
        
    } finally {
        const response: Event.ValidateProposalEventResponse = {
            validation: validationResult,
            status: statusCode
        };

        callback(null, response);
    }
}

export async function cacheNewProposalEvent(
    call: ServerUnaryCall<Event.CacheProposalEventRequest, Event.CacheProposalEventResponse>,
    callback: sendUnaryData<Event.CacheProposalEventResponse>
): Promise<void> {
    const { topic, duration, options } = call.request;

    logger.debug(`[grpcProposalCreateEventHandler::cacheNewProposalEvent] Received request to cache new proposal. Topic: "${topic}", Duration: ${duration}`);

    let cachedResult: boolean = true;
    let statusCode: string = "OK";

    try {
        await proposalCreateEventProcessor.saveProposalToCache(topic, duration, options);

        logger.info(`[grpcProposalCreateEventHandler::cacheNewProposalEvent] New proposal successfully cached. Topic: "${topic}".`);
    } catch (error: unknown) {
        cachedResult = false;

        if (error instanceof ProposalCreateEventError) {
            statusCode = error.status;
            logger.warn(`[grpcProposalCreateEventHandler::cacheNewProposalEvent] Proposal caching failed: Topic: "${topic}", Duration: ${duration}. Status: "${statusCode}". Internal error message: "${error.message}"`);
        } else {
            statusCode = ProposalCreateEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalCreateEventHandler::cacheNewProposalEvent] Unhandled or unexpected error during proposal caching. Topic: "${topic}", Duration: ${duration}. Error:`, error);
        }
    } finally {
        const response: Event.CacheProposalEventResponse = {
            cached: cachedResult,
            status: statusCode
        };
        callback(null, response);
    }
}