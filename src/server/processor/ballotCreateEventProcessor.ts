import logger from "../../config/logger";

import MongoUserCollectionActor from "../../database/actor/mongoUserCollectionActor";
import MongoVoteCollectionActor from "../../database/actor/mongoVoteCollectionActor";
import { IUser } from "../../database/models/users/schemaUser";
import { IVote } from "../../database/models/votes/schemaVote";

import { BallotCreateEventError, BallotCreateEventErrorStatus } from "../error/ballotCreateEventError";

export class BallotCreateEventProcessor {
    private readonly userCollection: MongoUserCollectionActor;
    private readonly voteCollection: MongoVoteCollectionActor;

    private static instance: BallotCreateEventProcessor;

    private constructor() {
        this.userCollection = new MongoUserCollectionActor();
        this.voteCollection = new MongoVoteCollectionActor();
    }

    public static getInstance(): BallotCreateEventProcessor {
        if (!BallotCreateEventProcessor.instance) {
            BallotCreateEventProcessor.instance = new BallotCreateEventProcessor();
        }
        return BallotCreateEventProcessor.instance;
    }

    public async validateNewBallot(userHash: string, topic: string, option: string): Promise<void> {
        logger.debug(`[BallotEventProcessor::validateNewBallot] Starting validation for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}"`);

        try {
            await this.validateUser(userHash);
            await this.validateDuplication(userHash, topic);
            await this.validateExistence(topic);
            await this.validateOption(userHash, topic, option);

            logger.info(`[BallotEventProcessor::validateNewBallot] All ballot validations passed. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "OK".`);
        } catch (error: unknown) {
            if (error instanceof BallotCreateEventError) {
                logger.warn(`[BallotEventProcessor::validateNewBallot] Ballot validation failed for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "${error.status}". Cause: "${error.message}"`);
                throw error;
            } else {
                logger.error(`[BallotEventProcessor::validateNewBallot] Unexpected error during ballot validation for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Error:`, error);
                throw new BallotCreateEventError(BallotCreateEventErrorStatus.UNKNOWN_ERROR, { cause: error });
            }
        }
    }

    private async validateUser(userHash: string): Promise<void> {
        try {
            // strict section -> Will migrate to register logic
            logger.debug(`[BallotEventProcessor::validateUser] Checking/Creating user for UserHash: "${userHash}" (Temporary user registration logic)`);
            await this.userCollection.saveNewUserIfNotExists(userHash);
            logger.debug(`[BallotEventProcessor::validateUser] User check/creation complete for UserHash: "${userHash}"`);
            // strict section end
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor::validateUser] Failed to validate/create user for UserHash: "${userHash}". Error:`, error);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }
    }

    private async validateDuplication(userHash: string, topic: string): Promise<void> {
        let alreadyVoted: IUser | null;

        try {
            alreadyVoted = await this.userCollection.findIfExistsBallot(userHash, topic);
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor::validateDuplication] Database access error during duplicate vote validation for UserHash: "${userHash}", Topic: "${topic}". Error:`, error);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        if (alreadyVoted !== null) {
            logger.warn(`[BallotEventProcessor::validateDuplication] Validation failed: Duplicate ballot submission. UserHash: "${userHash}", Topic: "${topic}".`);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.DUPLICATE_VOTE_SUBMISSION);
        }

        logger.info(`[BallotEventProcessor::validateDuplication] No duplicate vote found for UserHash: "${userHash}", Topic: "${topic}".`);
    }

    private async validateExistence(topic: string): Promise<void> {
        let existingProposal: IVote | null;

        try {
            existingProposal = await this.voteCollection.findIfExistsProposal(topic);
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor::validateExistence] Database access error during proposal existence validation for Topic: "${topic}". Error:`, error);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        if (existingProposal === null) {
            logger.warn(`[BallotEventProcessor::validateExistence] Validation failed: Proposal does not exist. Topic: "${topic}".`);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.PROPOSAL_NOT_FOUND);
        }

        if (existingProposal.expired) {
            logger.warn(`[BallotEventProcessor::validateExistence] Validation failed: Proposal is expired. Topic: "${topic}".`);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.PROPOSAL_EXPIRED);
        }

        logger.info(`[BallotEventProcessor::validateExistence] Proposal found and is open. UserHash: Topic: "${topic}".`);
    }

    private async validateOption(userHash: string, topic: string, option: string): Promise<void> {
        let validOption: boolean;

        try {
            validOption = await this.voteCollection.isValidVoteOption(topic, option);
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor::validateOption] Database access error during option validation for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Error:`, error);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        if (!validOption) {
            logger.warn(`[BallotEventProcessor::validateOption] Validation failed: Invalid option selected. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}".`);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.INVALID_OPTION);
        }

        logger.info(`[BallotEventProcessor::validateOption] Option validation successful. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}".`);
    }

    public async addBallotToCache(userHash: string, voteHash: string, topic: string): Promise<void> {
        logger.debug(`[BallotEventProcessor::addBallotToCache] Attempting to cache ballot for UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}".`);
        try {
            await this.userCollection.addBallotToUser(userHash, voteHash, topic);
            logger.info(`[BallotEventProcessor::addBallotToCache] Ballot successfully cached: UserHash: "${userHash}", Topic: "${topic}", VoteHash: "${voteHash}".`);
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor::addBallotToCache] Database access error during ballot caching for UserHash: "${userHash}", VoteHash: "${voteHash}", Topic: "${topic}". Error:`, error);
            throw new BallotCreateEventError(BallotCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }
    }
}

export const ballotCreateEventProcessor = BallotCreateEventProcessor.getInstance();