import * as grpc from "@grpc/grpc-js";

import { createdBlockEventServiceDefinition } from "../generated/blockchain_event/block_event_message.grpc-server.js";
import { expiredPendingEventServiceDefinition } from "../generated/blockchain_event/pending_event_message.grpc-server.js";
import { newProposalEventServiceDefinition } from "../generated/web_event/proposal_event_message.grpc-server.js";

import reportCreatedBlockEvent from "./handler/grpcBlockEventHandler.js";
import reportExpiredPendingEvent from "./handler/grpcPendingEventHandler.js";
import validateNewProposalEvent from "./handler/grpcProposalEventHandler.js";

import * as grpcConfig from "../../config/connection_grpc_listener_config.json";
import logger from "../config/logger.js";


const DEFAULT_GRPC_EVENT_LISTENER_PORT: number = grpcConfig.DefaultGrpcEventListenerPort;

export default async function runGrpcServer(port: number = DEFAULT_GRPC_EVENT_LISTENER_PORT): Promise<grpc.Server> {
    const server = new grpc.Server();

    server.addService(newProposalEventServiceDefinition, {
        ValidateNewProposalEvent: validateNewProposalEvent
    });

    logger.info("[ProposalEvent] NewProposalEventService::validateNewProposalEvent registered");

    server.addService(createdBlockEventServiceDefinition, {
        ReportCreatedBlockEvent: reportCreatedBlockEvent,
    });

    logger.info("[BlockEvent] CreatedBlockEventService::reportCreatedBlockEvent registered");
    
    server.addService(expiredPendingEventServiceDefinition, {
        ReportExpiredPendingEvent: reportExpiredPendingEvent
    });

    logger.info("[PendingEvent] ExpiredPendingEventService::reportExpiredPendingEvent registered");

    await new Promise<void>((resolve, reject) => {
        server.bindAsync(
            `0.0.0.0:${port}`,
            grpc.ServerCredentials.createInsecure(),
            (err: Error | null, boundPort: number) => {
                if (err) {
                    logger.error(`Error binding gRPC server to port ${port}:`, err);
                    return reject(err);
                }

                logger.info(`gRPC server successfully bound to http://0.0.0.0:${boundPort}`);
                resolve();
            }
        );
    });

    logger.info(`gRPC server is now listening on port ${port}`);

    return server;
}