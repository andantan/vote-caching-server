import logger from "../../config/logger";

import MongoUserCollectionActor from "../../database/actor/mongoUserCollectionActor";
import { IBallot } from "../../database/models/users/schemaBallot";

import { BallotQueryEventError, BallotQueryEventErrorStatus } from "../error/ballotQueryEventError";

export class BallotQueryEventProcessor {
    private readonly userCollection: MongoUserCollectionActor;

    private static instance: BallotQueryEventProcessor;

    private constructor() {
        this.userCollection = new MongoUserCollectionActor();
    }

    public static getInstance(): BallotQueryEventProcessor {
        if (!BallotQueryEventProcessor.instance) {
            BallotQueryEventProcessor.instance = new BallotQueryEventProcessor();
        }

        return BallotQueryEventProcessor.instance;
    }

    public async getUserBallots(userHash: string): Promise<IBallot[]> {
        logger.debug(`[BallotQueryEventProcessor::getUserBallots] Attempting to retrieve ballots for UserHash: "${userHash}"`);

        let ballots: IBallot[] | null;
        
        try {
            ballots = await this.userCollection.findUserBallots(userHash);
        } catch (error: unknown) {
            logger.error(`[BallotQueryEventProcessor::getUserBallots] Database access error during ballot retrieval for UserHash: "${userHash}". Error:`, error);
            throw new BallotQueryEventError(BallotQueryEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }

        // Matching user does not exist.
        if (ballots === null) {
            logger.warn(`[BallotQueryEventProcessor::getUserBallots] User with hash "${userHash}" not found.`);
            throw new BallotQueryEventError(BallotQueryEventErrorStatus.USER_NOT_FOUND);
        }

        logger.info(`[BallotQueryEventProcessor::getUserBallots] Successfully retrieved ${ballots.length} ballots for UserHash: "${userHash}".`);

        return ballots;
    }
}

export const ballotQueryEventProcessor = BallotQueryEventProcessor.getInstance();