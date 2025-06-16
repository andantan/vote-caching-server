import logger from "../../config/logger";

import MongoVoteCollectionActor from "../../database/actor/mongoVoteCollectionActor";
import { IVote } from "../../database/models/votes/schemaVote";
import { ProposalEventError, ProposalEventErrorStatus } from "../error/proposalEventError";

export class ProposalEventProcessor {
    private readonly voteCollection: MongoVoteCollectionActor;

    private static instance: ProposalEventProcessor;

    private constructor() {
        this.voteCollection = new MongoVoteCollectionActor();
    }

    public static getInstance(): ProposalEventProcessor {
        if (!ProposalEventProcessor.instance) {
            ProposalEventProcessor.instance = new ProposalEventProcessor();
        }
        return ProposalEventProcessor.instance;
    }

    public async validateNewProposal(topic: string): Promise<void> {
        logger.debug(`[ProposalEventProcessor::validateNewProposal] Starting validation for new proposal: Topic: "${topic}"`);

        try {
            await this.validateExistence(topic);

            logger.info(`[ProposalEventProcessor::validateNewProposal] Proposal is valid for creation: Topic: "${topic}".`);
        } catch (error: unknown) {
            if (error instanceof ProposalEventError) {
                logger.warn(`[ProposalEventProcessor::validateNewProposal] Proposal validation failed during new proposal check. Topic: "${topic}". Status: "${error.status}". Cause: "${error.message}"`);
                throw error;
            } else {
                logger.error(`[ProposalEventProcessor::validateNewProposal] Unexpected error during new proposal validation for Topic: "${topic}". Error:`, error);
                throw new ProposalEventError(ProposalEventErrorStatus.UNKNOWN_ERROR, { cause: error });
            }
        }
    }

    private async validateExistence(topic: string): Promise<void> {
        let existingProposal: IVote | null;

        try {
            existingProposal = await this.voteCollection.findIfExistsProposal(topic);
        } catch (error: unknown) {
            logger.error(`[ProposalEventProcessor::validateExistence] Database access error during proposal existence check for Topic: "${topic}". Error:`, error);
            throw new ProposalEventError(ProposalEventErrorStatus.CACHE_ACCESS_ERROR, { cause: error });
        }

        if (existingProposal !== null) {
            if (existingProposal.expired) {
                logger.warn(`[ProposalEventProcessor::validateExistence] Validation failed: Proposal is expired. Topic: "${topic}".`);
                throw new ProposalEventError(ProposalEventErrorStatus.PROPOSAL_EXPIRED);
            } else {
                logger.warn(`[ProposalEventProcessor::validateExistence] Validation failed: Proposal already exists and is open. Topic: "${topic}".`);
                throw new ProposalEventError(ProposalEventErrorStatus.PROPOSAL_ALREADY_OPEN);
            }
        }

        logger.info(`[ProposalEventProcessor::validateExistence] Proposal validation successful: Topic: "${topic}"`);
    }

    public async saveProposalToCache(topic: string, duration: number, options: string[]): Promise<void> {
        logger.debug(`[ProposalEventProcessor::saveProposalToCache] Attempting to save new proposal. Topic: "${topic}", Duration: ${duration}.`);
        try {
            await this.voteCollection.saveNewVote(topic, duration, options);
            
            logger.info(`[ProposalEventProcessor::saveProposalToCache] New proposal successfully saved. Topic: "${topic}".`);
        } catch (error: unknown) {
            logger.error(`[ProposalEventProcessor::saveProposalToCache] Database access error during new proposal saving. Topic: "${topic}", Duration: ${duration}. Error:`, error);
            throw new ProposalEventError(ProposalEventErrorStatus.CACHE_ACCESS_ERROR, { cause: error });
        }
    }
}

export const proposalEventProcessor = ProposalEventProcessor.getInstance();