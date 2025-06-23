import * as env from "./config/env.js";

env.loadEnv();

import runGrpcServer from "./server/grpcEventServer.js";
import connectMongoDB from "./database/mongoConnection.js";

import logger from "./config/logger.js";

async function main() {
    const GRPC_EVENT_LISTENER_PORT: number = env.getNumberEnvVar("GRPC_EVENT_LISTENER_PORT");

    try {
        logger.info("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+");
        logger.info("Connecting to MongoDB...");
        
        await connectMongoDB();
      
        logger.info('Starting gRPC server...');

        await runGrpcServer(GRPC_EVENT_LISTENER_PORT);

    } catch (error) {
        logger.error('Failed to start gRPC server:', error);

        process.exit(1);
    }
}

main();