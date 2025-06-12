import { VoteModel, IVote } from "../models/votes/vote.js";
import { IBlockHeight } from './../models/votes/block.js';

import logger from "../../config/logger.js";

export default class BlockEventMongoDBActor {
    public async addBlockToVote(topic: string, length: number, height: number): Promise<IVote | null> {
        try {
            logger.debug(`[BlockEventMongoDBActor::addBlockToVote] Attempting to add block. Topic: "${topic}", Length: ${length}, Height: ${height}`);
    
            const blockHeight: IBlockHeight = { 
                height: height, 
                length: length 
            };

            const updatedVote = await VoteModel.findOneAndUpdate(
                { topic: topic },
                {
                    $push: {
                        blockHeights: blockHeight
                    }
                },
                { new: true }
            );

            if (!updatedVote) {
                logger.warn(`[BlockEventMongoDBActor::addBlockToVote] Failed to add block. No proposal found for topic: "${topic}", or update failed.`);
                return null;
            }

            logger.info(`[BlockEventMongoDBActor::addBlockToVote] Successfully added block. Topic: "${topic}", Height: ${height}`);
            
            return updatedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to add block to vote for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[BlockEventMongoDBActor::addBlockToVote] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}