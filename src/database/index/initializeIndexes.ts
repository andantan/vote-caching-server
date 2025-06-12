import { VoteModel } from "../models/votes/vote";
import { UserModel } from "../models/users/user";
import logger from "../../config/logger";

export default async function initializeAllModelIndexes() {
    try {
        await VoteModel.createIndexes();

        logger.info('VoteModel indexes synchronized.');

        await UserModel.createIndexes();

        logger.info('UserModel indexes synchronized.');

    } catch (error: unknown) {
        logger.error('Error synchronizing model indexes:', error);
        throw error;
    }
}