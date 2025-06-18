import logger from "../../config/logger";

import MongoVoteCollectionActor from "../../database/actor/mongoVoteCollectionActor";

import { IVote } from './../../database/models/votes/schemaVote';

import { ProposalQueryEventError, ProposalQueryEventErrorStatus } from './../error/proposalQueryEventError';
import { Proposal, Result, BlockHeight } from "../../generated/web_event/proposal_query_event_message";
import { Timestamp } from "../../generated/google/protobuf/timestamp";

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

    public async getProposal(topic: string): Promise<IVote> {
        logger.debug(`[ProposalQueryEventProcessor::getProposal] Attempting to retrieve proposal for Topic: "${topic}"`);

        let proposal: IVote | null;

        try {
            proposal = await this.voteCollection.findIfExistsProposal(topic);
        } catch (error: unknown) {
            logger.error(`[ProposalQueryEventProcessor::getProposal] Database access error during proposal retrieval for Topic: "${topic}". Error:`, error);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        // Matching proposal does not exist.
        if (proposal === null) {
            logger.warn(`[ProposalQueryEventProcessor::getProposal] Proposal for Topic: "${topic}" not found.`);
            throw new ProposalQueryEventError(ProposalQueryEventErrorStatus.PROPOSAL_NOT_FOUND);
        }

        logger.info(`[ProposalQueryEventProcessor::getProposal] Successfully retrieved proposal for Topic: "${topic}".`);
        return proposal;
    }

    public toGrpcProposal(proposal: IVote): Proposal {
        const resultOptions: { [key: string]: number } = Object.fromEntries(
            Object.entries(proposal.result.options)
        ) as { [key: string]: number };

        const grpcResult: Result = Result.create({
            count: proposal.result.count,
            options: resultOptions
        });

        const grpcBlockHeights: BlockHeight[] = proposal.blockHeights.map(blockHeight => {
            const grpcBlockHeight: BlockHeight = BlockHeight.create({
                height: blockHeight.height,
                length: blockHeight.length
            });
            
            return grpcBlockHeight;
        });

        const createdAtTimestamp: Timestamp = Timestamp.fromDate(proposal.createdAt);
        const expiredAtTimestamp: Timestamp = Timestamp.fromDate(proposal.expiredAt);

        const grpcProposal: Proposal = Proposal.create({
            topic: proposal.topic,
            duration: proposal.duration,
            expired: proposal.expired,
            result: grpcResult,
            blockHeights: grpcBlockHeights,
            createdAt: createdAtTimestamp, 
            expiredAt: expiredAtTimestamp, 
            options: proposal.options,
        })

        return grpcProposal;
    }
}

export const proposalQueryEventProcessor = ProposalQueryEventProcessor.getInstance();