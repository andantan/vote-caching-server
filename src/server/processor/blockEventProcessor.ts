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

    public async addBlockToVote(topic: string, length: number, height: number): Promise<void> {
        logger.debug(`[BlockEventProcessor::addBlockToVote] Attempting to process and cache block: Topic="${topic}", Length=${length}, Height=${height}`);

        try {
            await this.voteCollection.addBlockToVote(topic, length, height);
            logger.info(`[BlockEventProcessor::addBlockToVote] Block successfully cached: Topic="${topic}", Height=${height}`);
        } catch (error: unknown) {
            logger.error(`[BlockEventProcessor::addBlockToVote] Database access error during block caching. Topic="${topic}", Length=${length}, Height=${height}. Error:`, error);
            throw new BlockEventError(BlockEventErrorStatus.CACHE_ACCESS_ERROR, { cause: error });
        }
    }
}

export const blockEventProcessor = BlockEventProcessor.getInstance();