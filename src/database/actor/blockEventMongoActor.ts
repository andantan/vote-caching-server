import { VoteModel, IVote } from "../models/votes/vote.js";
import { IBlockHeight } from './../models/votes/block.js';

import logger from "../../config/logger.js";

export default class BlockEventMongoDBActor {
    public async addBlockToVote(topic: string, length: number, height: number): Promise<IVote | null> {
        try {
            logger.info(`[BlockEventMongoDBActor] Attempting to add block - Topic: "${topic}", Length: ${length}, Height: ${height}`);
    
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
                logger.warn(`[BlockEventMongoDBActor] No proposal found with topic "${topic}" to add block, or update failed.`);
                return null;
            }

            logger.info(`[ProposalEventMongoActor] New block saved successfully - Topic: "${topic}", Length: ${length}, Height: ${height}`);
            
            return updatedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to add block to vote for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[BlockEventMongoDBActor] MongoDB add block error:`, error);
            throw new Error(errorMessage); 
        }
    }
}