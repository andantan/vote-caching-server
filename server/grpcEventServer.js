import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

import reportCreatedBlockEvent from "./handler/grpcBlockEventHandler.js"
import reportExpiredPendingEvent from "./handler/grpcPendingEventHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BLOCK_EVENT_PROTO_FILE_NAME = "block_event_message.proto";
const PENDING_EVENT_PROTO_FLE_NAME = "pending_event_message.proto";

const PROTO_FILES = [
    join(__dirname, '..', 'proto', BLOCK_EVENT_PROTO_FILE_NAME),
    join(__dirname, '..', 'proto', PENDING_EVENT_PROTO_FLE_NAME)
];

export async function runGrpcServer(port) {
    const packageDefinition = protoLoader.loadSync(PROTO_FILES, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    const grpcObject = grpc.loadPackageDefinition(packageDefinition);

    const blockEventMessagePackage = grpcObject.block_event_message;
    const pendingEventMessagePackage = grpcObject.pending_event_message;
    
    const server = new grpc.Server();

    server.addService(blockEventMessagePackage.CreatedBlockEventService.service, {
        ReportCreatedBlockEvent: reportCreatedBlockEvent,
    });

    server.addService(pendingEventMessagePackage.ExpiredPendingEventService.service, {
        ReportExpiredPendingEvent: reportExpiredPendingEvent
    });

    console.log()
    console.log("Service (CreatedBlockEventService) Definition being added");
    console.log(`   ${blockEventMessagePackage.CreatedBlockEventService.service.ReportCreatedBlockEvent.path}`);
    console.log("Service (ExpiredPendingEventService) Definition being added");
    console.log(`   ${pendingEventMessagePackage.ExpiredPendingEventService.service.ReportExpiredPendingEvent.path}`);
    console.log()
    
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