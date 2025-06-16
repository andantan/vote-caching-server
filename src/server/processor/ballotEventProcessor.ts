import logger from "../../config/logger";

import BallotEventMongoActor from "../../database/actor/ballotEventMongoActor";
import ProposalEventMongoActor from "../../database/actor/proposalEventMongoActor";
import UserEventMongoActor from "../../database/actor/userEventMongoActor";
import { IUser } from "../../database/models/users/user";
import { IVote } from "../../database/models/votes/vote";

import { BallotEventError, BallotEventErrorStatus } from "../error/ballotEventError";

export class BallotEventProcessor {
    private readonly userActor: UserEventMongoActor;
    private readonly ballotActor: BallotEventMongoActor;
    private readonly proposalActor: ProposalEventMongoActor;

    private static instance: BallotEventProcessor;

    private constructor() {
        this.userActor = new UserEventMongoActor();
        this.ballotActor = new BallotEventMongoActor();
        this.proposalActor = new ProposalEventMongoActor();
    }

    public static getInstance(): BallotEventProcessor {
        if (!BallotEventProcessor.instance) {
            BallotEventProcessor.instance = new BallotEventProcessor();
        }
        return BallotEventProcessor.instance;
    }

    public async validateNewBallot(userHash: string, topic: string, option: string): Promise<void> {
        logger.debug(`[BallotEventProcessor] Starting validation for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}"`);

        try {
            await this.validateUser(userHash);
            await this.validateDuplication(userHash, topic);
            await this.validateExistence(topic);
            await this.validateOption(userHash, topic, option);

            logger.info(`[BallotEventProcessor] All ballot validations passed. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "OK".`);
        } catch (error: unknown) {
            if (error instanceof BallotEventError) {
                logger.warn(`[BallotEventProcessor] Ballot validation failed for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Status: "${error.status}". Cause: "${error.message}"`);
                throw error;
            } else {
                logger.error(`[BallotEventProcessor] Unexpected error during ballot validation for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Error:`, error);
                throw new BallotEventError(BallotEventErrorStatus.UNKNOWN_ERROR, { cause: error });
            }
        }
    }

    private async validateUser(userHash: string): Promise<void> {
        try {
            // strict section -> Will migrate to register logic
            logger.debug(`[BallotEventProcessor] Checking/Creating user for UserHash: "${userHash}" (Temporary user registration logic)`);
            await this.userActor.saveNewUserIfNotExists(userHash);
            logger.debug(`[BallotEventProcessor] User check/creation complete for UserHash: "${userHash}"`);
            // strict section end
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor] Failed to validate/create user for UserHash: "${userHash}". Error:`, error);
            throw new BallotEventError(BallotEventErrorStatus.MONGO_ACCESS_ERROR, { cause: error });
        }
    }

    private async validateDuplication(userHash: string, topic: string): Promise<void> {
        let alreadyVoted: IUser | null;

        try {
            alreadyVoted = await this.ballotActor.findIfExistsBallot(userHash, topic);
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor] Database access error during duplicate vote validation for UserHash: "${userHash}", Topic: "${topic}". Error:`, error);
            throw new BallotEventError(BallotEventErrorStatus.MONGO_ACCESS_ERROR, { cause: error });
        }

        if (alreadyVoted !== null) {
            logger.warn(`[BallotEventProcessor] Validation failed: Duplicate ballot submission. UserHash: "${userHash}", Topic: "${topic}".`);
            throw new BallotEventError(BallotEventErrorStatus.DUPLICATE_VOTE_SUBMISSION);
        }

        logger.info(`[BallotEventProcessor] No duplicate vote found for UserHash: "${userHash}", Topic: "${topic}".`);
    }

    private async validateExistence(topic: string): Promise<void> {
        let existingProposal: IVote | null;

        try {
            existingProposal = await this.proposalActor.findIfExistsProposal(topic);
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor] Database access error during proposal existence validation for Topic: "${topic}". Error:`, error);
            throw new BallotEventError(BallotEventErrorStatus.MONGO_ACCESS_ERROR, { cause: error });
        }

        if (existingProposal === null) {
            logger.warn(`[BallotEventProcessor] Validation failed: Proposal does not exist. Topic: "${topic}".`);
            throw new BallotEventError(BallotEventErrorStatus.PROPOSAL_NOT_FOUND);
        }

        if (existingProposal.expired) {
            logger.warn(`[BallotEventProcessor] Validation failed: Proposal is expired. Topic: "${topic}".`);
            throw new BallotEventError(BallotEventErrorStatus.PROPOSAL_EXPIRED);
        }

        logger.info(`[BallotEventProcessor] Proposal found and is open. UserHash: Topic: "${topic}".`);
    }

    private async validateOption(userHash: string, topic: string, option: string): Promise<void> {
        let validOption: boolean;

        try {
            validOption = await this.proposalActor.isValidVoteOption(topic, option);
        } catch (error: unknown) {
            logger.error(`[BallotEventProcessor] Database access error during option validation for UserHash: "${userHash}", Topic: "${topic}", Option: "${option}". Error:`, error);
            throw new BallotEventError(BallotEventErrorStatus.MONGO_ACCESS_ERROR, { cause: error });
        }

        if (!validOption) {
            logger.warn(`[BallotEventProcessor] Validation failed: Invalid option selected. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}".`);
            throw new BallotEventError(BallotEventErrorStatus.INVALID_OPTION);
        }

        logger.info(`[BallotEventProcessor] Option validation successful. UserHash: "${userHash}", Topic: "${topic}", Option: "${option}".`);
    }
}

export const ballotEventProcessor = BallotEventProcessor.getInstance();