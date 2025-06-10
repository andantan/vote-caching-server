import { VoteModel, IVote } from "../../models/votes/vote.js";
import logger from "../../../config/logger.js";

export class ProposalEventMongoActor {
    public async saveNewProposal(topic: string, duration: number): Promise<string> {
        logger.info(`[ProposalEventMongoActor] Attempting to save new proposal: Topic="${topic}", Duration=${duration}`);

        try {
            const newVote: IVote = new VoteModel({
                topic: topic,
                duration: duration
            });

            const savedVote: IVote = await newVote.save();

            const voteId = newVote._id.toString();
            
            logger.info(`[ProposalEventMongoActor] New proposal saved successfully. Vote ID: ${voteId}`);
            logger.info(`[ProposalEventMongoActor] Saved Vote Document:`, savedVote);

            return voteId;
        } catch (error: unknown) {
            const errorMessage = `Failed to save new proposal for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[ProposalEventMongoActor] MongoDB save error:`, error);
            throw new Error(errorMessage);
        }
    }
}
