import { UserModel, IUser, NullableUser } from "../models/users/schemaUser.js";
import { IBallot } from "../models/users/schemaBallot.js";

import logger from "../../config/logger.js";

export default class MongoUserCollectionActor {
    public async findUserByUserHash(userHash: string): Promise<NullableUser> {
        logger.debug(`[MongoUserCollectionActor::findIfExistsUser] Checking for existing user. UserHash: "${userHash}"`);

        try {
            const userPojo: NullableUser = await UserModel.findOne({
                userHash: userHash
            }).lean();

            return userPojo;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existence for UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::findIfExistsUser] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findUserByUid(uid: number): Promise<NullableUser> {
        logger.debug(`[MongoUserCollectionActor::findUserByUid] Checking for existing user. UID: "${uid}"`);

        try {
            const userPojo: NullableUser = await UserModel.findOne({
                uid: uid
            }).lean();

            return userPojo;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existence for UID "${uid}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::findUserByUid] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async saveUser(userHash: string, uid: number, gender: string, birthDate: Date): Promise<IUser> {
        try {
            logger.debug(`[MongoUserCollectionActor::saveUser] Attempting to find or create user. UserHash: "${userHash}"`);

            const userDocument: IUser = new UserModel({
                uid: uid,
                userHash: userHash,
                gender: gender,
                birthDate: birthDate
            });

            const newUserDocument: IUser = await userDocument.save();

            logger.info(`[MongoUserCollectionActor::saveUser] New user (UID: ${newUserDocument.uid}, UserHash: "${newUserDocument.userHash}") successfully cached and saved to MongoDB.`);

            return newUserDocument;
        } catch (error: unknown) {
            const errorMessage = `Failed to cache and save new user (UserHash: "${userHash}", UID: "${uid}"): ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::saveUser] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async saveNewUserIfNotExists(userHash: string): Promise<IUser> {
        try {
            logger.debug(`[MongoUserCollectionActor::saveNewUserIfNotExists] Attempting to find or create user. UserHash: "${userHash}"`);

            let userDocument: NullableUser = await UserModel.findOne({ 
                userHash: userHash 
            });

            // User does not exists in user collection
            if (!userDocument) {
                const newUserDocument: IUser = new UserModel({
                    userHash: userHash
                });

                userDocument = await newUserDocument.save();

                logger.info(`[MongoUserCollectionActor::saveNewUserIfNotExists] New user (${userHash}) successfully saved to users collection.`);
            } 

            return userDocument;
        } catch (error: unknown) {
            const errorMessage = `Failed to find or create user with UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::saveNewUserIfNotExists] MongoDB operation error: ${errorMessage}`, error);
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

            const updatedUserDocument = await UserModel.findOneAndUpdate(
                { userHash: userHash },
                { $push: { ballots: newBallot } },
                { new: true }
            );

            // User does not exists in user collection
            if (!updatedUserDocument) {
                logger.info(`[MongoUserCollectionActor::addBallotToUser] User with UserHash "${userHash}" not found. Could not add ballot for topic "${topic}".`);
                return null;
            }

            logger.info(`[MongoUserCollectionActor::addBallotToUser] Successfully added ballot for user "${userHash}" on topic "${topic}".`);

            return updatedUserDocument;
        } catch (error: unknown) {
            const errorMessage = `Failed to add ballot for user "${userHash}" and vote "${voteHash}" on topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::addBallotToUser] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsBallot(userHash: string, topic: string): Promise<NullableUser> {
        logger.debug(`[MongoUserCollectionActor::findIfExistsBallot] Checking for existing ballot. UserHash: "${userHash}", Topic: "${topic}"`);

        try {
            const userPojo: NullableUser = await UserModel.findOne(
                {
                    userHash: userHash,
                    "ballots.topic": topic
                }
            ).lean();

            return userPojo;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existing ballot for UserHash "${userHash}" and Topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoUserCollectionActor::findIfExistsBallot] MongoDB query error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findUserBallots(userHash: string): Promise<IBallot[] | null> {
        logger.debug(`[MongoUserCollectionActor::findUserBallots] Finding all ballots for UserHash: "${userHash}"`);

        try {
            const userPojo = await UserModel.findOne(
                {
                    userHash: userHash
                },
                {
                    _id: false,
                    ballots: true
                }
            ).lean<Pick<IUser, "ballots" | "userHash">>();

            // User does not exists in user collection
            if (!userPojo) {
                return null;
            }

            const ballots: IBallot[] = userPojo.ballots || [];

            logger.info(`[UserEventMongoActor::findUserBallots] Found ${ballots.length} ballots for UserHash: "${userHash}".`);

            return ballots;
        } catch (error: unknown) {
            const errorMessage = `Failed to find user ballots for UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserEventMongoActor::findUserBallots] MongoDB query error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}