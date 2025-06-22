import logger from "../../config/logger";

import MongoVoteCollectionActor from "../../database/actor/mongoVoteCollectionActor";

import { BlockEventError, BlockEventErrorStatus } from "../error/blockEventError";

export class BlockEventProcessor {
    private readonly voteCollection: MongoVoteCollectionActor;

    private static instance: BlockEventProcessor;

    private constructor() {
        this.voteCollection = new MongoVoteCollectionActor();
    }

    public static getInstance(): BlockEventProcessor {
        if (!BlockEventProcessor.instance) {
            BlockEventProcessor.instance = new BlockEventProcessor();
        }
        return BlockEventProcessor.instance;
    }

    public async processCacheBlock(topic: string, transactionCount: number, height: number): Promise<void> {
        logger.debug(`[BlockEventProcessor::processCacheBlock] Attempting to process and cache block: Topic="${topic}", TransactionCount=${transactionCount}, Height=${height}`);

        try {
            await this.voteCollection.addBlockToVote(topic, transactionCount, height);
            logger.info(`[BlockEventProcessor::processCacheBlock] Block successfully cached: Topic="${topic}", Height=${height}`);
        } catch (error: unknown) {
            logger.error(`[BlockEventProcessor::processCacheBlock] Database access error during block caching. Topic="${topic}", TransactionCount=${transactionCount}, Height=${height}. Error:`, error);
            throw new BlockEventError(BlockEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }
    }
}

export const blockEventProcessor = BlockEventProcessor.getInstance();