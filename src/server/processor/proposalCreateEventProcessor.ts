import logger from "../../config/logger";

import MongoVoteCollectionActor from "../../database/actor/mongoVoteCollectionActor";
import { IVote } from "../../database/models/votes/schemaVote";
import { ProposalCreateEventError, ProposalCreateEventErrorStatus } from "../error/proposalCreateEventError";

export class ProposalCreateEventProcessor {
    private readonly voteCollection: MongoVoteCollectionActor;

    private static instance: ProposalCreateEventProcessor;

    private constructor() {
        this.voteCollection = new MongoVoteCollectionActor();
    }

    public static getInstance(): ProposalCreateEventProcessor {
        if (!ProposalCreateEventProcessor.instance) {
            ProposalCreateEventProcessor.instance = new ProposalCreateEventProcessor();
        }
        return ProposalCreateEventProcessor.instance;
    }

    public async processValidateProposal(topic: string): Promise<void> {
        logger.debug(`[ProposalCreateEventProcessor::processValidateProposal] Starting validation for new proposal: Topic: "${topic}"`);

        try {
            await this.validateExistence(topic);

            logger.info(`[ProposalCreateEventProcessor::processValidateProposal] Proposal is valid for creation: Topic: "${topic}".`);
        } catch (error: unknown) {
            if (error instanceof ProposalCreateEventError) {
                logger.warn(`[ProposalCreateEventProcessor::processValidateProposal] Proposal validation failed during new proposal check. Topic: "${topic}". Status: "${error.status}". Cause: "${error.message}"`);
                throw error;
            } else {
                logger.error(`[ProposalCreateEventProcessor::processValidateProposal] Unexpected error during new proposal validation for Topic: "${topic}". Error:`, error);
                throw new ProposalCreateEventError(ProposalCreateEventErrorStatus.UNKNOWN_ERROR, { cause: error });
            }
        }
    }

    private async validateExistence(topic: string): Promise<void> {
        let existingProposal: IVote | null;

        try {
            existingProposal = await this.voteCollection.findIfExistsProposal(topic);
        } catch (error: unknown) {
            logger.error(`[ProposalCreateEventProcessor::validateExistence] Database access error during proposal existence check for Topic: "${topic}". Error:`, error);
            throw new ProposalCreateEventError(ProposalCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        if (existingProposal !== null) {
            if (existingProposal.expired) {
                logger.warn(`[ProposalCreateEventProcessor::validateExistence] Validation failed: Proposal is expired. Topic: "${topic}".`);
                throw new ProposalCreateEventError(ProposalCreateEventErrorStatus.PROPOSAL_EXPIRED);
            } else {
                logger.warn(`[ProposalCreateEventProcessor::validateExistence] Validation failed: Proposal already exists and is open. Topic: "${topic}".`);
                throw new ProposalCreateEventError(ProposalCreateEventErrorStatus.PROPOSAL_ALREADY_OPEN);
            }
        }

        logger.info(`[ProposalCreateEventProcessor::validateExistence] Proposal validation successful: Topic: "${topic}"`);
    }

    public async processCacheProposal(topic: string, duration: number, options: string[]): Promise<void> {
        logger.debug(`[ProposalCreateEventProcessor::processCacheProposal] Attempting to save new proposal. Topic: "${topic}", Duration: ${duration}.`);
        try {
            await this.voteCollection.saveNewVote(topic, duration, options);
            
            logger.info(`[ProposalCreateEventProcessor::processCacheProposal] New proposal successfully saved. Topic: "${topic}".`);
        } catch (error: unknown) {
            logger.error(`[ProposalCreateEventProcessor::processCacheProposal] Database access error during new proposal saving. Topic: "${topic}", Duration: ${duration}. Error:`, error);
            throw new ProposalCreateEventError(ProposalCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }
    }
}

export const proposalCreateEventProcessor = ProposalCreateEventProcessor.getInstance();