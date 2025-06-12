import { VoteModel, IVote } from "../models/votes/vote.js";
import logger from "../../config/logger.js";

export default class ProposalEventMongoDBActor {
    public async saveNewProposal(topic: string, duration: number): Promise<IVote> {
        logger.debug(`[ProposalEventMongoDBActor::saveNewProposal] Attempting to save new proposal. Topic: "${topic}", Duration: ${duration}`);

        try {
            const newVote: IVote = new VoteModel({
                topic: topic,
                duration: duration
            });

            const savedVote = await newVote.save();
            
            logger.info(`[ProposalEventMongoDBActor::saveNewProposal] Successfully saved new proposal. Topic: "${savedVote.topic}"`);

            return savedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to save new proposal for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[ProposalEventMongoDBActor::saveNewProposal] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsProposal(topic: string): Promise<IVote | null> {
        logger.debug(`[ProposalEventMongoDBActor::findIfExistsProposal] Checking for existing proposal. Topic: "${topic}"`);

        try {
            const vote = await VoteModel.findOne({
                topic: topic
            })

            if (vote) {
                logger.info(`[ProposalEventMongoDBActor::findIfExistsProposal] Existing proposal found. Topic: "${topic}"`);
            } else {
                logger.info(`[ProposalEventMongoDBActor::findIfExistsProposal] No existing proposal found. Topic: "${topic}"`);
            }

            return vote
        } catch (error: unknown) {
            const errorMessage = `Failed to check existence for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[ProposalEventMongoDBActor::findIfExistsProposal] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}
