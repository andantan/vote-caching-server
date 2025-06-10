import { VoteModel } from "../models/votes/vote";
import logger from "../../config/logger";

export default async function initializeAllModelIndexes() {
    try {
        await VoteModel.createIndexes();

        logger.info('VoteModel indexes synchronized.');

    } catch (error: unknown) {
        logger.error('Error synchronizing model indexes:', error);
        throw error;
    }
}