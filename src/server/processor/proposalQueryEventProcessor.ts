import logger from "../../config/logger";

import MongoVoteCollectionActor, { QueryFilter, QueryPaging } from "../../database/actor/mongoVoteCollectionActor";

import { IVote } from './../../database/models/votes/schemaVote';

import { ProposalQueryEventError, ProposalQueryEventErrorStatus } from './../error/proposalQueryEventError';
import { Proposal, Result, BlockHeight, Filter, Paging } from "../../generated/web_event/proposal_query_event_message";
import { Timestamp } from "../../generated/google/protobuf/timestamp";

type ResultOptions = { [key: string]: number };

export class ProposalQueryEventProcessor {
    private readonly voteCollection: MongoVoteCollectionActor;

    private static instance: ProposalQueryEventProcessor;

    private constructor() {
        this.voteCollection = new MongoVoteCollectionActor();
    }

    public static getInstance(): ProposalQueryEventProcessor {
        if (!ProposalQueryEventProcessor.instance) {
            ProposalQueryEventProcessor.instance = new ProposalQueryEventProcessor();
        }

        return ProposalQueryEventProcessor.instance;
    }

    private _buildMongoQueryFilter(filter: Filter): QueryFilter {
        const expired: boolean | undefined = filter.expired;
        const queryFilter: QueryFilter = {};

        if (expired === true || expired === false) { 
            queryFilter.expired = expired;
        }
        
        return queryFilter;
    } 

    private _buildMongoQueryPaging(paging: Paging): QueryPaging {
        let queryPaging: QueryPaging = {
            skip: 0,
            limit: 0
        };

        if (paging !== undefined) {
            queryPaging = {
                skip: paging.skip,
                limit: paging.limit
            };
        }        

        return queryPaging;
    }

    public async processProposalDetailQuery(topic: string): Promise<IVote> {
        logger.debug(`[ProposalQueryEventProcessor::processProposalDetailQuery] Attempting to retrieve proposal for Topic: "${topic}"`);

        let proposal: IVote | null;

        try {
            proposal = await this.voteCollection.findIfExistsProposal(topic);
        } catch (error: unknown) {
            logger.error(`[ProposalQueryEventProcessor::processProposalDetailQuery] Database access error during proposal retrieval for Topic: "${topic}". Error:`, error);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        // Matching proposal does not exist.
        if (proposal === null) {
            logger.warn(`[ProposalQueryEventProcessor::processProposalDetailQuery] Proposal for Topic: "${topic}" not found.`);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.PROPOSAL_NOT_FOUND);
        }

        logger.info(`[ProposalQueryEventProcessor::processProposalDetailQuery] Successfully retrieved proposal for Topic: "${topic}".`);
        return proposal;
    }

    public async processFilteredProposalListQuery(filter: Filter, paging: Paging): Promise<IVote[]> {
        const expired: boolean | undefined = filter.expired;
        const skip: number = paging.skip;
        const limit: number = paging.limit;

        logger.debug(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Attempting to retrieve filtered proposals. Expired: ${expired}, Skip: ${skip}, Limit: ${limit}`);

        const queryFilter: QueryFilter = this._buildMongoQueryFilter(filter);
        const queryPaging: QueryPaging = this._buildMongoQueryPaging(paging);

        let totalCount: number = 0;

        try {
            totalCount = await this.voteCollection.countProposalsWithFilter(queryFilter);
            logger.debug(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Total proposals matching filter: ${totalCount}`);
        } catch (error: unknown) {
            logger.error(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Database access error during total count retrieval. Error:`, error);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        // Request is beyond total available proposals
        if (skip >= totalCount && totalCount > 0) {
            logger.warn(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Requested skip (${skip}) is beyond total available proposals (${totalCount})`);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.PAGING_OUT_OF_BOUNDS);
        }

        if (limit <= 0) {
            logger.warn(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Requested limit less or equal than 0`);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.LIMIT_ZERO_PARAM);
        }

        if (skip < 0) {
            logger.warn(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Requested skip less than 0`);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.SKIP_ZERO_PARAM);
        }

        let proposals: IVote[] = [];

        try {
            proposals = await this.voteCollection.findProposalListWithFilter(queryFilter, queryPaging);
        } catch (error: unknown) {
            logger.error(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Database access error during filtered proposal retrieval. Expired: ${expired}, Skip: ${skip}, Limit: ${limit}. Error:`, error);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        logger.info(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Successfully retrieved ${proposals.length} filtered proposals. Expired: ${expired}, Skip: ${skip}, Limit: ${limit}.`);

        return proposals
    }

    public toProposalMessage(proposal: IVote): Proposal {
        const resultMessage: Result = this.getResultMessage(proposal);
        const blockHeightsMessage: BlockHeight[] = this.getBlockHeightsMessage(proposal);
        const createdAtTimestamp: Timestamp = Timestamp.fromDate(proposal.createdAt);
        const expiredAtTimestamp: Timestamp = Timestamp.fromDate(proposal.expiredAt);

        const grpcProposal: Proposal = Proposal.create({
            topic: proposal.topic,
            duration: proposal.duration,
            expired: proposal.expired,
            result: resultMessage,
            blockHeights: blockHeightsMessage,
            createdAt: createdAtTimestamp, 
            expiredAt: expiredAtTimestamp, 
            options: proposal.options,
        })

        return grpcProposal;
    }

    public getResultMessage(proposal: IVote): Result {
        const resultOptions:ResultOptions = Object.fromEntries(
            Object.entries(proposal.result.options)
        ) as ResultOptions;

        const resultMessage: Result = Result.create({
            count: proposal.result.count,
            options: resultOptions
        });

        return resultMessage;
    }

    public getBlockHeightsMessage(proposal: IVote): BlockHeight[] {
        const blockHeightsMessage: BlockHeight[] = proposal.blockHeights.map(blockHeight => {
            const blockHeightMessage: BlockHeight = BlockHeight.create({
                height: blockHeight.height,
                length: blockHeight.length
            });
            
            return blockHeightMessage;
        });

        return blockHeightsMessage;
    }
}

export const proposalQueryEventProcessor = ProposalQueryEventProcessor.getInstance();