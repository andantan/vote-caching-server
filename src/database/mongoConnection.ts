import mongoose from "mongoose";

import logger from "../config/logger.js";
import initializeAllModelIndexes from "./index/initializeIndexes.js";

import * as mongoConfig from "../../config/connection_mongodb_config.json";

const MongoURI: string = `mongodb://${mongoConfig.MongoHost}:${mongoConfig.MongoPort}/${mongoConfig.MongoDatabase}`;

export default async function connectMongoDB(): Promise<void> {
    try {
        await mongoose.connect(MongoURI);
        logger.info("MongoDB connected successfully");

        await initializeAllModelIndexes();
    } catch (error: unknown) {
        logger.error("MongoDB connection error: ", error)

        process.exit(1)
    }
}

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error after initial connect:', err);
});