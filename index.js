import { runGrpcServer } from "./server/grpcEventServer.js";

const GRPC_PORT = 50051;

async function main() {
  try {
    console.log('Starting gRPC server...');

    await runGrpcServer(GRPC_PORT);

    console.log('gRPC server is fully operational.');
  } catch (error) {
    console.error('Failed to start gRPC server:', error);

    process.exit(1);
  }
}

main();