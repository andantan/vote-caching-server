import runGrpcServer from "./server/grpcEventServer.js";

import * as grpcConfig from "../config/connection_grpc_listener_config.json";
import logger from "./config/logger.js";

const GRPC_EVENT_LISTENER_PORT: number = grpcConfig.GrpcEventListenerPort;

async function main() {
  try {
    logger.info('Starting gRPC server...');

    await runGrpcServer(GRPC_EVENT_LISTENER_PORT);

    logger.info('gRPC server is fully operational.');
  } catch (error) {
    logger.error('Failed to start gRPC server:', error);

    process.exit(1);
  }
}

main();