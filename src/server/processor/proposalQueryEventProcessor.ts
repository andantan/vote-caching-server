import logger from "../../config/logger";

import MongoVoteCollectionActor, { QueryFilter, QueryPaging, QuerySortOptions } from "../../database/actor/mongoVoteCollectionActor";

import { IVote } from './../../database/models/votes/schemaVote';

import { ProposalQueryEventError, ProposalQueryEventErrorStatus } from './../error/proposalQueryEventError';
import { Proposal, Result, BlockHeight, Filter, Sort, Paging } from "../../generated/web_event/proposal_query_event_message";
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
        const expiredParam: boolean | undefined = filter.expired;
        const queryFilter: QueryFilter = {};

        if (expiredParam === true || expiredParam === false) { 
            queryFilter.expired = expiredParam;
        }

        return queryFilter;
    }

    private _buildMongoQuerySort(sort: Sort): QuerySortOptions {
        const sortOrderParam: string | undefined = sort.sortOrder;
        const sortByParam: string | undefined = sort.sortBy;

        let querySort: QuerySortOptions = {};

        if (sortByParam && sortOrderParam) {
            const lowerCaseSortOrder = sortOrderParam.toLowerCase();
            const isAsc = (lowerCaseSortOrder === "asc");
            const isDesc = (lowerCaseSortOrder === "desc");

            if (isAsc || isDesc) {
                const validSortKey = sortByParam as keyof IVote;

                querySort = { [validSortKey]: isAsc ? 1 : -1 } as QuerySortOptions;
            } else {
                logger.warn(`[MongoVoteCollectionActor::_buildMongoQuerySort] Invalid sort order received: "${sortOrderParam}". Expected 'asc' or 'desc'. Not applying sort.`);
                throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.INVALID_SORT_ORDER_PARAM);
            }
        } else if (sortByParam || sortOrderParam) {
            logger.warn(`[MongoVoteCollectionActor::_buildMongoQuerySort] Incomplete sort parameters. Both 'sortBy' and 'sortOrder' must be provided if sorting. Not applying sort.`);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.INVALID_SORT_BY_PARAM);
        }

        return querySort;
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

    public async processFilteredProposalListQuery(filter: Filter, sort: Sort, paging: Paging): Promise<IVote[]> {
        const expired: boolean | undefined = filter.expired;
        const skip: number = paging.skip;
        const limit: number = paging.limit;

        logger.debug(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Attempting to retrieve filtered proposals. Expired: ${expired}, Skip: ${skip}, Limit: ${limit}`);

        const queryFilter: QueryFilter = this._buildMongoQueryFilter(filter);
        let querySort: QuerySortOptions = {};

        try {
            querySort = this._buildMongoQuerySort(sort);
            logger.debug(querySort);
        } catch (error: unknown) {
            if (error instanceof ProposalQueryEventError) {
                logger.warn(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Error building mongo query filter: Status: "${error.status}", Message: "${error.message}"`);
                throw error;
            }

            logger.error(`[ProposalQueryEventProcessor::processFilteredProposalListQuery] Unexpected error during mongo query filter build:`, error);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

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
            proposals = await this.voteCollection.findProposalListWithFilter(queryFilter, querySort, queryPaging);
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
            proposer: proposal.proposer,
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