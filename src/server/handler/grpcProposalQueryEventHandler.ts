import { Timestamp } from "../../generated/google/protobuf/timestamp.js";
import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from "../../generated/web_event/proposal_query_event_message.js";

import { proposalQueryEventProcessor } from "../processor/proposalQueryEventProcessor.js";
import { ProposalQueryEventError, ProposalQueryEventErrorStatus } from "../error/proposalQueryEventError.js";

interface GrpcProposal {
    queried: boolean;
    status: string;
    proposals?: Event.Proposal;
}

export async function getProposal(
    call: ServerUnaryCall<Event.GetProposalRequest, Event.GetProposalResponse>,
    callback: sendUnaryData<Event.GetProposalResponse>
): Promise<void> {
    const { topic } = call.request;

    logger.debug(`[grpcProposalQueryEventHandler::getProposal] Received GetProposal request for Topic: "${topic}"`);

    let queried: boolean = true;
    let statusCode: string = "OK";
    let grpcProposal: Event.Proposal | null = null;

    try {
        const proposal = await proposalQueryEventProcessor.getProposal(topic);
        grpcProposal = proposalQueryEventProcessor.toGrpcProposal(proposal);

        logger.info(`[grpcProposalQueryEventHandler::getProposal] Successfully retrieved proposal for Topic: "${topic}".`);
        
        queried = true;
        statusCode = "OK";
    } catch (error: unknown) {
        queried = false;
        grpcProposal = null;

        if (error instanceof ProposalQueryEventError) {
            statusCode = error.status;

            switch (statusCode) {
                case ProposalQueryEventErrorStatus.PROPOSAL_NOT_FOUND:
                    logger.warn(`[grpcProposalQueryEventHandler::getProposal] Proposal for Topic: "${topic}" not found.`);
                    break;
                default:
                    logger.error(`[grpcProposalQueryEventHandler::getProposal] Processed error getting proposal for Topic: "${topic}". Status: "${status}". Internal message: "${error.message}"`, error);
                    break;
            }
        } else {
            statusCode = ProposalQueryEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalQueryEventHandler::getProposal] Unhandled or unexpected error getting proposal for Topic: "${topic}". Error:`, error);
        }
    } finally {
        const responseData: GrpcProposal = {
            queried: queried,
            status: statusCode
        };

        if (grpcProposal !== null) {
            responseData.proposals = grpcProposal;
        }
        
        const response: Event.GetProposalResponse = Event.GetProposalResponse.create(responseData);
        
        callback(null, response);
    }
}