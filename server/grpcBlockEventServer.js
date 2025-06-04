import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import { reportCreatedBlockEvent } from "./grpcBlockEventHandler.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BLOCK_EVENT_PROTO_FILE_NAME = "block_event_message.proto";
const BLOCK_EVENT_PROTO_FILE_PATH = join(__dirname, '..', 'proto', BLOCK_EVENT_PROTO_FILE_NAME);

export async function runGrpcServer(port) {
    const packageDefinition = protoLoader.loadSync(BLOCK_EVENT_PROTO_FILE_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    const grpcObject = grpc.loadPackageDefinition(packageDefinition);
    const blockEventMessagePackage = grpcObject.block_event_message;
    
    const server = new grpc.Server();

    server.addService(blockEventMessagePackage.CreatedBlockEventService.service, {
        ReportCreatedBlockEvent: reportCreatedBlockEvent,
    });

    console.log("Service Definition being added:", blockEventMessagePackage.CreatedBlockEventService.service);

    await new Promise((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (err, boundPort) => {
                if (err) {
                    console.error(`Error binding gRPC server to port ${port}:`, err);
                    return reject(err);
                }

                console.log(`gRPC server successfully bound to http://0.0.0.0:${boundPort}`);
                resolve(boundPort);
            }
        );
    });


    console.log(`gRPC server is now listening on port ${port}`);

    return server;
}