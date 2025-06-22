import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import logger from "../../config/logger.js";

import * as Event from "../../generated/web_event/proposal_query_event_message.js";

import { proposalQueryEventProcessor } from "../processor/proposalQueryEventProcessor.js";
import { ProposalQueryEventError, ProposalQueryEventErrorStatus } from "../error/proposalQueryEventError.js";


export async function getProposalDetail(
    call: ServerUnaryCall<Event.GetProposalDetailRequest, Event.GetProposalDetailResponse>,
    callback: sendUnaryData<Event.GetProposalDetailResponse>
): Promise<void> {
    const { topic } = call.request;

    logger.debug(`[grpcProposalQueryEventHandler::getProposalDetail] Received GetProposal request for Topic: "${topic}"`);

    let queried: boolean = true;
    let statusCode: string = "OK";
    let proposalMessage: Event.Proposal | null = null;

    try {
        const proposal = await proposalQueryEventProcessor.processProposalDetailQuery(topic);
        proposalMessage = proposalQueryEventProcessor.toProposalMessage(proposal);

        logger.info(`[grpcProposalQueryEventHandler::getProposalDetail] Successfully retrieved proposal for Topic: "${topic}".`);
    } catch (error: unknown) {
        queried = false;
        proposalMessage = null;

        if (error instanceof ProposalQueryEventError) {
            statusCode = error.status;

            switch (statusCode) {
                case ProposalQueryEventErrorStatus.PROPOSAL_NOT_FOUND:
                    logger.warn(`[grpcProposalQueryEventHandler::getProposalDetail] Proposal for Topic: "${topic}" not found.`);
                    break;
                case ProposalQueryEventErrorStatus.DATABASE_ACCESS_ERROR:
                    logger.error(`[grpcProposalQueryEventHandler::getProposalDetail] Database access error during filtered proposal retrieval. Status: "${statusCode}". Internal message: "${error.message}"`, error);
                    break;
                default:
                    logger.error(`[grpcProposalQueryEventHandler::getProposalDetail] Processed error getting proposal for Topic: "${topic}". Status: "${statusCode}". Internal message: "${error.message}"`, error);
                    break;
            }
        } else {
            statusCode = ProposalQueryEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalQueryEventHandler::getProposalDetail] Unhandled or unexpected error getting proposal for Topic: "${topic}". Error:`, error);
        }
    } finally {
        const response: Event.GetProposalDetailResponse = Event.GetProposalDetailResponse.create({
            queried: queried,
            status: statusCode,
            ...(proposalMessage !== null && { proposal: proposalMessage }) 
        });
        
        callback(null, response);
    }
}

export async function getFilteredProposalList(
    call: ServerUnaryCall<Event.GetFilteredProposalListRequest, Event.GetFilteredProposalListResponse>,
    callback: sendUnaryData<Event.GetFilteredProposalListResponse>
): Promise<void> {
    const { filter, sort, paging } = call.request;

    logger.debug(`[grpcProposalQueryEventHandler::getFilteredProposalList] Received GetFilteredProposalsRequest. Filter: ${JSON.stringify(filter)}, Sort: ${JSON.stringify(sort)}, Paging: ${JSON.stringify(paging)}`);

    let queried: boolean = true;
    let statusCode: string = "OK";
    let proposalMessageList: Event.Proposal[] = [];

    try {
        const proposals = await proposalQueryEventProcessor.processFilteredProposalListQuery(filter!, sort!, paging!);

        proposalMessageList = proposals.map(proposalMessage => {
            const grpcProposal: Event.Proposal = proposalQueryEventProcessor.toProposalMessage(proposalMessage);

            return grpcProposal;
        });

        logger.info(`[grpcProposalQueryEventHandler::getFilteredProposalList] Successfully retrieved ${proposalMessageList.length} filtered proposals.`);
    } catch (error: unknown) {
        queried = false;

        if (error instanceof ProposalQueryEventError) {
            statusCode = error.status;

            switch (statusCode) {
                case ProposalQueryEventErrorStatus.INVALID_SORT_ORDER_PARAM:
                    logger.warn(`[grpcProposalQueryEventHandler::getFilteredProposalList] Invalid sort order parameter received. Status: "${statusCode}".`);
                    break;
                case ProposalQueryEventErrorStatus.INVALID_SORT_BY_PARAM:
                    logger.warn(`[grpcProposalQueryEventHandler::getFilteredProposalList] Invalid sort by parameter received. Status: "${statusCode}".`);
                    break;
                case ProposalQueryEventErrorStatus.LIMIT_ZERO_PARAM:
                    logger.warn(`[grpcProposalQueryEventHandler::getFilteredProposalList] Invalid limit parameter received. Status: "${statusCode}".`);
                    break;
                case ProposalQueryEventErrorStatus.PAGING_OUT_OF_BOUNDS:
                    logger.warn(`[grpcProposalQueryEventHandler::getFilteredProposalList] Requested page range is out of bounds. Status: "${statusCode}".`);
                    break;
                case ProposalQueryEventErrorStatus.SKIP_ZERO_PARAM:
                    logger.warn(`[grpcProposalQueryEventHandler::getFilteredProposalList] Invalid skip parameter received. Status: "${statusCode}".`);
                    break;
                case ProposalQueryEventErrorStatus.DATABASE_ACCESS_ERROR:
                    logger.error(`[grpcProposalQueryEventHandler::getFilteredProposalList] Database access error during filtered proposal retrieval. Status: "${statusCode}". Internal message: "${error.message}"`, error);
                    break;
                default:
                    logger.error(`[grpcProposalQueryEventHandler::getFilteredProposalList] Processed error getting filtered proposals. Status: "${statusCode}". Internal message: "${error.message}"`, error);
                    break;
            }
        } else {
            statusCode = ProposalQueryEventErrorStatus.UNKNOWN_ERROR;
            logger.error(`[grpcProposalQueryEventHandler::getFilteredProposalList] Unhandled or unexpected error getting filtered proposals. Error:`, error);
        }
    } finally {
        const response: Event.GetFilteredProposalListResponse = Event.GetFilteredProposalListResponse.create({
            queried: queried,
            status: statusCode,
            proposalList: proposalMessageList 
        });
        
        callback(null, response);
    }
}
