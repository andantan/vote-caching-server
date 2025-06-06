import * as grpc from "@grpc/grpc-js";

import { createdBlockEventServiceDefinition } from "../generated/blockchain_event/block_event_message.grpc-server.js";
import { expiredPendingEventServiceDefinition } from "../generated/blockchain_event/pending_event_message.grpc-server.js";
import { newProposalEventServiceDefinition } from "../generated/web_event/proposal_event_message.grpc-server.js";

import reportCreatedBlockEvent from "./handler/grpcBlockEventHandler.js";
import reportExpiredPendingEvent from "./handler/grpcPendingEventHandler.js";
import validateNewProposalEvent from "./handler/grpcProposalEventHandler.js";

const GRPC_PORT = 50051;

export default async function runGrpcServer(port: number = GRPC_PORT): Promise<grpc.Server> {
    const server = new grpc.Server();

    server.addService(newProposalEventServiceDefinition, {
        ValidateNewProposalEvent: validateNewProposalEvent
    });

    console.log("[gRPC Server] NewProposalEventService::validateNewProposalEvent registered");

    server.addService(createdBlockEventServiceDefinition, {
        ReportCreatedBlockEvent: reportCreatedBlockEvent,
    });

    console.log("[gRPC Server] CreatedBlockEventService::reportCreatedBlockEvent registered");
    
    server.addService(expiredPendingEventServiceDefinition, {
        ReportExpiredPendingEvent: reportExpiredPendingEvent
    });

    console.log("[gRPC Server] ExpiredPendingEventService::reportExpiredPendingEvent registered");

    await new Promise<void>((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (err: Error | null, boundPort: number) => {
                if (err) {
                    console.error(`Error binding gRPC server to port ${port}:`, err);
                    return reject(err);
                }

                console.log(`gRPC server successfully bound to http://0.0.0.0:${boundPort}`);
                resolve();
            }
        );
    });

    console.log(`gRPC server is now listening on port ${port}`);

    return server;
}