import logger from "../../config/logger";

import { Timestamp } from "../../generated/google/protobuf/timestamp";

import MongoUserCollectionActor from "../../database/actor/mongoUserCollectionActor";
import { IUser, NullableUser } from './../../database/models/users/schemaUser';

import { UserCreateEventError, UserCreateEventErrorStatus } from "../error/userCreateEventError";

export class UserCreateEventProcessor {
    private readonly userCollection: MongoUserCollectionActor;

    private static instance: UserCreateEventProcessor;

    private constructor() {
        this.userCollection = new MongoUserCollectionActor();
    }

    public static getInstance(): UserCreateEventProcessor {
        if (!UserCreateEventProcessor.instance) {
            UserCreateEventProcessor.instance = new UserCreateEventProcessor();
        }

        return UserCreateEventProcessor.instance;
    }

    public async processValidateNewUser(uid: number, userHash: string): Promise<void> {
        logger.debug(`[UserCreateEventProcessor::processValidateNewUser] Validating new user with UID: "${uid}", UserHash: "${userHash}"`);

        if (typeof uid !== 'number' || uid <= 0) {
            logger.warn(`[UserCreateEventProcessor::processValidateNewUser] Invalid input parameters. UID: "${uid}"`);  
            throw new UserCreateEventError(UserCreateEventErrorStatus.INVALID_PARAMETER);
        }

        if (!userHash || userHash.trim() === "") {
            logger.warn(`[UserCreateEventProcessor::processValidateNewUser] Invalid input parameters. UserHash: ${userHash}`);
            throw new UserCreateEventError(UserCreateEventErrorStatus.INVALID_PARAMETER);
        }

        let existingUserByUid: NullableUser;

        try {
            existingUserByUid = await this.userCollection.findUserByUid(uid);
        } catch (error: unknown) {
            const errorMessage = `An unexpected error occurred during new user validation for UID "${uid}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserCreateEventProcessor::processValidateNewUser] Unexpected error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }

        if (existingUserByUid) {
            logger.warn(`[UserCreateEventProcessor::processValidateNewUser] User already exists with UID: "${uid}"`);
            
            throw new UserCreateEventError(UserCreateEventErrorStatus.EXIST_UID);
        }

        let existingUserByUserHash: NullableUser;

        try {
            existingUserByUserHash = await this.userCollection.findUserByUserHash(userHash);
        } catch (error: unknown) {
            const errorMessage = `An unexpected error occurred during new user validation for UserHash "${userHash}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[UserCreateEventProcessor::processValidateNewUser] Unexpected error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }

        if (existingUserByUserHash) {
            logger.warn(`[UserCreateEventProcessor::processValidateNewUser] User already exists with UserHash: "${userHash}"`);

            throw new UserCreateEventError(UserCreateEventErrorStatus.EXIST_USERHASH);
        }
    }

    public async processCacheNewUser(uid: number, userHash: string, gender: string, birthDate: Timestamp): Promise<void> {
        try {
            logger.debug(`[UserCreateEventProcessor::processCacheNewUser] Checking/Creating user for UserHash: "${userHash}" (Temporary user registration logic)`);

            const userBirthDate: Date = Timestamp.toDate(birthDate);

            await this.userCollection.saveUser(userHash, uid, gender, userBirthDate);

            logger.debug(`[UserCreateEventProcessor::processCacheNewUser] User check/creation complete for UserHash: "${userHash}"`);
        } catch (error: unknown) {
            logger.error(`[UserCreateEventProcessor::processCacheNewUser] Failed to validate/create user for UserHash: "${userHash}". Error:`, error);
            throw new UserCreateEventError(UserCreateEventErrorStatus.DATABASE_ACCESS_ERROR, { cause: error });
        }
    }
}

export const userCreateEventProcessor = UserCreateEventProcessor.getInstance();