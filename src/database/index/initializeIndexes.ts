import { VoteModel } from "../models/votes/schemaVote";
import { UserModel } from "../models/users/schemaUser";
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