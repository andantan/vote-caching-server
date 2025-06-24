import mongoose from "mongoose";

import logger from "../config/logger.js";
import initIndexes from "./index/initializeIndexes.js";
import { mongoConfig } from "../config/mongoConfig.js";

export default async function connectMongoDB(): Promise<void> {
    try {
        await mongoose.connect(mongoConfig.uri);
        logger.info(`MongoDB connected successfully to: ${mongoConfig.uri}`);

        await initIndexes();
    } catch (error: unknown) {
        logger.error(`MongoDB connection error to ${mongoConfig.uri}: `, error);

        process.exit(1)
    }
}

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error after initial connect:', err);
});