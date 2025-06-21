import logger from "../../config/logger";

import MongoVoteCollectionActor from "../../database/actor/mongoVoteCollectionActor";
import { IVoteOptions } from "../../database/models/votes/schemaResult";
import { PendingEventError, PendingEventErrorStatus } from "../error/pendingEventError";

export class PendingEventProcessor {
    private readonly voteCollection: MongoVoteCollectionActor;

    private static instance: PendingEventProcessor;

    private constructor() {
        this.voteCollection = new MongoVoteCollectionActor();
    }

    public static getInstance(): PendingEventProcessor {
        if (!PendingEventProcessor.instance) {
            PendingEventProcessor.instance = new PendingEventProcessor();
        }
        return PendingEventProcessor.instance;
    }

    public async processCacheResult(topic: string, count: number, options: IVoteOptions): Promise<void> {
        logger.debug(`[PendingEventProcessor::processCacheResult] Attempting to save expired pending event result: Topic="${topic}", Count=${count}, Options=${JSON.stringify(options)}`);

        try {
            await this.voteCollection.saveVoteResult(topic, count, options);
            logger.info(`[PendingEventProcessor::processCacheResult] Vote results successfully saved: Topic="${topic}", TotalCount=${count}`);
        } catch (error: unknown) {
            logger.error(`[PendingEventProcessor::processCacheResult] Database access error during saving vote results. Topic="${topic}", Count=${count}, Options=${JSON.stringify(options)}. Error:`, error);
            throw new PendingEventError(PendingEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }
    }
}

export const pendingEventProcessor = PendingEventProcessor.getInstance();