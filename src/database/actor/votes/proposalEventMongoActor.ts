import { VoteModel, IVote } from "../../models/votes/vote.js";
import logger from "../../../config/logger.js";

export class ProposalEventMongoDBActor {
    public async saveNewProposal(topic: string, duration: number): Promise<IVote> {
        logger.info(`[ProposalEventMongoDBActor] Attempting to save new proposal: Topic: "${topic}", Duration: ${duration}`);

        try {
            const newVote: IVote = new VoteModel({
                topic: topic,
                duration: duration
            });

            const savedVote = await newVote.save();
            
            logger.info(`[ProposalEventMongoDBActor] New proposal saved successfully. topic: "${savedVote.topic}"`);

            return savedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to save new proposal for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[ProposalEventMongoDBActor] MongoDB save error:`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsProposal(topic: string): Promise<IVote | null> {
        logger.info(`[ProposalEventMongoDBActor] Attempting to find exists new proposal: Topic: "${topic}"`);

        try {
            const vote = await VoteModel.findOne({
                topic: topic
            })

            return vote
        } catch (error: unknown) {
            const errorMessage = `Failed to check existence for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[ProposalEventMongoDBActor] MongoDB existence check error:`, error);
            throw new Error(errorMessage);
        }
    }
}
