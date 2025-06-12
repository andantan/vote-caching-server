import { UserModel, IUser } from "../models/users/user.js";
import { IBallot } from "../models/users/ballot.js";

import logger from "../../config/logger.js";

export default class BallotEventMongoActor {
    public async addBallotToUser(userHash: string, voteHash: string, topic: string, option: string): Promise<IUser | null> {
        logger.debug(`[UserEventMongoActor::addBallotToUser] Attempting to add ballot for user "${userHash}" on topic "${topic}". VoteHash: "${voteHash}"`);

        try {
            const newBallot: IBallot = {
                voteHash: voteHash,
                topic: topic,
                submittedAt: new Date()
            };

            const updatedUser = await UserModel.findOneAndUpdate(
                { userHash: userHash },
                { 
                    $push: { 
                        ballots: newBallot
                    }
                },
                { new: true }
            );

            if (!updatedUser) {
                logger.warn(`[UserEventMongoActor::addBallotToUser] Failed to add ballot. User "${userHash}" not found.`);
                return null;
            }

            logger.info(`[UserEventMongoActor::addBallotToUser] Successfully added ballot for user "${userHash}" on topic "${topic}".`);

            return updatedUser;
        } catch (error: unknown) {
            const errorMessage = `Failed to add ballot for user "${userHash}" and vote "${voteHash}" on topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserEventMongoActor::addBallotToUser] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsBallot(userHash: string, topic: string): Promise<IUser | null> {
        logger.debug(`[UserEventMongoActor::findIfExistsBallot] Checking for existing ballot. UserHash: "${userHash}", Topic: "${topic}"`);

        try {
            const user = await UserModel.findOne(
                {
                    userHash: userHash,
                    "ballots.topic": topic
                }
            );

            if (user) {
                logger.info(`[UserEventMongoActor::findIfExistsBallot] Existing ballot found. UserHash: "${userHash}", Topic: "${topic}"`);
            } else {
                logger.info(`[UserEventMongoActor::findIfExistsBallot] No existing ballot found. UserHash: "${userHash}", Topic: "${topic}"`);
            }

            return user;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existing ballot for UserHash "${userHash}" and Topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserEventMongoActor::findIfExistsBallot] MongoDB query error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}