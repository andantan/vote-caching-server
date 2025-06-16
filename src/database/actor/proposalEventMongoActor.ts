import { VoteModel, IVote } from "../models/votes/vote.js";
import logger from "../../config/logger.js";

export default class ProposalEventMongoActor {
    public async saveNewProposal(topic: string, duration: number, options: string[]): Promise<IVote> {
        logger.debug(`[ProposalEventMongoDBActor::saveNewProposal] Attempting to save new proposal. Topic: "${topic}", Duration: ${duration}`);

        try {
            const newVote: IVote = new VoteModel({
                topic: topic,
                duration: duration,
                options: options
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

    public async isValidVoteOption(topic: string, option: string): Promise<boolean> {
        logger.debug(`[BallotEventMongoActor::isValidVoteOption] Checking option validity. Topic: "${topic}", option: "${option}"`);

        try {
            const proposal = await VoteModel.findOne(
                {
                    topic: topic
                }
            ).select("options");

            if (!proposal) {
                logger.warn(`[BallotEventMongoActor::isValidVoteOption] Proposal not found for topic: "${topic}". Cannot validate option.`);
                return false;
            }

            const isValid = proposal.options.includes(option);

            if (isValid) {
                logger.info(`[BallotEventMongoActor::isValidVoteOption] Option is valid. Topic: "${topic}", option: "${option}"`);
            } else {
                logger.warn(`[BallotEventMongoActor::isValidVoteOption] Option is invalid. Topic: "${topic}", option: "${option}", ValidOptions: "${proposal.options.join(', ')}"`);
            }

            return isValid;
        } catch (error: unknown) {
            const errorMessage = `Failed to validate vote option for Topic "${topic}", option "${option}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[BallotEventMongoActor::isValidVoteOption] MongoDB operation error: ${errorMessage}`, error);
            return false;
        }
    }
}
