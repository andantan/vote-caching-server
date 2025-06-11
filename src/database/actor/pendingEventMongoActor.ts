import { VoteModel, IVote } from "../models/votes/vote.js";
import { IBalletResult, IBalletOptions } from "../models/votes/ballet.js";

import logger from "../../config/logger.js";

export default class PendingEventMongoActor {
    public async saveVoteResult(topic: string, totalCount: number, optionsResult: IBalletOptions): Promise<IVote | null> {
        try {
            logger.info(`[PendingEventMongoActor] Attempting to save vote result - Topic: "${topic}", Count: ${totalCount}, Options: ${JSON.stringify(optionsResult)}`);

            const voteResult: IBalletResult = {
                count: totalCount,
                options: optionsResult
            };

            const updatedVote = await VoteModel.findOneAndUpdate(
                { topic: topic },
                {
                    $set: {
                        result: voteResult,
                        expired: true,
                        settledAt: new Date()
                    }
                }, 
                { new: true }
            );

            if (!updatedVote) {
                logger.warn(`[PendingEventMongoActor] No proposal found with topic "${topic}" to save vote result.`);
                return null;
            }

            logger.info(`[PendingEventMongoActor] Successfully saved vote result and marked proposal "${topic}" as expired.`);

            return updatedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to save vote result for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[PendingEventMongoActor] MongoDB save vote result error:`, error);
            throw new Error(errorMessage);
        }
    }
}