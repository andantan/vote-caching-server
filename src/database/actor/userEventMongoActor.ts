import { UserModel, IUser } from "../models/users/user";

import logger from "../../config/logger";

export default class UserEventMongoActor {
    public async saveNewUserIfNotExists(userHash: string): Promise<IUser> {
        try {
            logger.debug(`[UserEventMongoActor::saveNewUserIfNotExists] Attempting to find or create user. UserHash: "${userHash}"`);

            let user = await UserModel.findOne({ userHash: userHash });

            if (user) {
                logger.info(`[UserEventMongoActor::saveNewUserIfNotExists] User already exists. UserHash: "${userHash}"`);
                return user;
            }

            const newUser = new UserModel({
                userHash: userHash
            });

            user = await newUser.save();

            logger.info(`[UserEventMongoActor::saveNewUserIfNotExists] Successfully created new user. UserHash: "${userHash}"`);

            return user;
        } catch (error: unknown) {
            const errorMessage = `Failed to find or create user with UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserEventMongoActor::saveNewUserIfNotExists] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsUser(userHash: string): Promise<IUser | null> {
        logger.debug(`[UserEventMongoActor::findIfExistsUser] Checking for existing user. UserHash: "${userHash}"`);

        try {
            const user = await UserModel.findOne({
                userHash: userHash
            });

            if (user) {
                logger.info(`[UserEventMongoActor::findIfExistsUser] User found. UserHash: "${userHash}"`);
            } else {
                logger.info(`[UserEventMongoActor::findIfExistsUser] User not found. UserHash: "${userHash}"`);
            }

            return user;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existence for UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserEventMongoActor::findIfExistsUser] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}