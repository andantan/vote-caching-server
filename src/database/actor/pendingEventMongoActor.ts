import { VoteModel, IVote } from "../models/votes/vote.js";
import { IVoteResult, IVoteOptions } from "../models/votes/result.js";

import logger from "../../config/logger.js";

export default class PendingEventMongoActor {
    public async saveVoteResult(topic: string, totalCount: number, optionsResult: IVoteOptions): Promise<IVote | null> {
        try {
            logger.debug(`[PendingEventMongoActor::saveVoteResult] Attempting to save vote result. Topic: "${topic}", TotalCount: ${totalCount}, Options: ${JSON.stringify(optionsResult)}`);

            const voteResult: IVoteResult = {
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
                logger.warn(`[PendingEventMongoActor::saveVoteResult] Failed to save vote result. No proposal found for topic: "${topic}".`);
                return null;
            }

            logger.info(`[PendingEventMongoActor::saveVoteResult] Successfully saved vote result and marked proposal as expired. Topic: "${topic}", TotalCount: ${totalCount}`);

            return updatedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to save vote result for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[PendingEventMongoActor::saveVoteResult] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}