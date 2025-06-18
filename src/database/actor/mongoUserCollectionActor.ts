import { UserModel, IUser, NullableUser } from "../models/users/schemaUser.js";
import { IBallot } from "../models/users/schemaBallot.js";

import logger from "../../config/logger.js";

export default class MongoUserCollectionActor {
    public async saveNewUserIfNotExists(userHash: string): Promise<IUser> {
        try {
            logger.debug(`[MongoUserCollectionActor::saveNewUserIfNotExists] Attempting to find or create user. UserHash: "${userHash}"`);

            let user = await UserModel.findOne({ userHash: userHash });

            if (user) {
                logger.info(`[MongoUserCollectionActor::saveNewUserIfNotExists] User already exists. UserHash: "${userHash}"`);
                return user;
            }

            const newUser = new UserModel({
                userHash: userHash
            });

            user = await newUser.save();

            logger.info(`[MongoUserCollectionActor::saveNewUserIfNotExists] Successfully created new user. UserHash: "${userHash}"`);

            return user;
        } catch (error: unknown) {
            const errorMessage = `Failed to find or create user with UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::saveNewUserIfNotExists] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsUser(userHash: string): Promise<NullableUser> {
        logger.debug(`[MongoUserCollectionActor::findIfExistsUser] Checking for existing user. UserHash: "${userHash}"`);

        try {
            const user: NullableUser = await UserModel.findOne({
                userHash: userHash
            }).lean();

            if (user) {
                logger.info(`[MongoUserCollectionActor::findIfExistsUser] User found. UserHash: "${userHash}"`);
            } else {
                logger.info(`[MongoUserCollectionActor::findIfExistsUser] User not found. UserHash: "${userHash}"`);
            }

            return user;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existence for UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::findIfExistsUser] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async addBallotToUser(userHash: string, voteHash: string, topic: string): Promise<NullableUser> {
        logger.debug(`[MongoUserCollectionActor::addBallotToUser] Attempting to add ballot for user "${userHash}" on topic "${topic}". VoteHash: "${voteHash}"`);

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
                logger.warn(`[MongoUserCollectionActor::addBallotToUser] Failed to add ballot. User "${userHash}" not found.`);
                return null;
            }

            logger.info(`[MongoUserCollectionActor::addBallotToUser] Successfully added ballot for user "${userHash}" on topic "${topic}".`);

            return updatedUser;
        } catch (error: unknown) {
            const errorMessage = `Failed to add ballot for user "${userHash}" and vote "${voteHash}" on topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::addBallotToUser] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsBallot(userHash: string, topic: string): Promise<NullableUser> {
        logger.debug(`[MongoUserCollectionActor::findIfExistsBallot] Checking for existing ballot. UserHash: "${userHash}", Topic: "${topic}"`);

        try {
            const user: NullableUser = await UserModel.findOne(
                {
                    userHash: userHash,
                    "ballots.topic": topic
                }
            ).lean();

            if (user) {
                logger.info(`[MongoUserCollectionActor::findIfExistsBallot] Existing ballot found. UserHash: "${userHash}", Topic: "${topic}"`);
            } else {
                logger.info(`[MongoUserCollectionActor::findIfExistsBallot] No existing ballot found. UserHash: "${userHash}", Topic: "${topic}"`);
            }

            return user;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existing ballot for UserHash "${userHash}" and Topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::findIfExistsBallot] MongoDB query error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findUserBallots(userHash: string): Promise<IBallot[] | null> {
        logger.debug(`[MongoUserCollectionActor::findUserBallots] Finding all ballots for UserHash: "${userHash}"`);

        try {
            const user = await UserModel.findOne(
                {
                    userHash: userHash
                },
                {
                    _id: false,
                    ballots: true
                }
            ).lean<Pick<IUser, "ballots" | "userHash">>();

            if (!user) {
                logger.warn(`[MongoUserCollectionActor::findUserBallots] User with hash "${userHash}" not found.`);
                return null;
            }

            const ballots: IBallot[] = user.ballots || [];

            logger.info(`[UserEventMongoActor::findUserBallots] Found ${ballots.length} ballots for UserHash: "${userHash}".`);

            return ballots;
        } catch (error: unknown) {
            const errorMessage = `Failed to find user ballots for UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserEventMongoActor::findUserBallots] MongoDB query error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}