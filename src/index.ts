import runGrpcServer from "./server/grpcEventServer.js";

const PORT = 50051;

async function main() {
  try {
    console.log('Starting gRPC server...');

    await runGrpcServer(PORT);

    console.log('gRPC server is fully operational.');
  } catch (error) {
    console.error('Failed to start gRPC server:', error);

    process.exit(1);
  }
}

main();