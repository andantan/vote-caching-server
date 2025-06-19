import * as grpc from "@grpc/grpc-js";

import { proposalCreateEventServiceDefinition } from "../generated/web_event/proposal_create_event_message.grpc-server.js";
import { proposalQueryEventServiceDefinition } from "../generated/web_event/proposal_query_event_message.grpc-server.js";
import { ballotCreateEventServiceDefinition } from "../generated/web_event/ballot_create_event_message.grpc-server.js";
import { ballotQueryEventServiceDefinition } from "../generated/web_event/ballot_query_event_message.grpc-server.js";
import { pendingEventServiceDefinition } from "../generated/blockchain_event/pending_event_message.grpc-server.js";
import { blockEventServiceDefinition } from "../generated/blockchain_event/block_event_message.grpc-server.js";

import { validateProposalEvent, cacheProposalEvent } from "./handler/grpcProposalCreateEventHandler.js";
import { validateBallotEvent, cacheBallotEvent } from "./handler/grpcBallotCreateEventHandler.js";
import { getProposal } from "./handler/grpcProposalQueryEventHandler.js";
import { getUserBallots } from "./handler/grpcBallotQueryEventHandler.js";
import { reportPendingExpiredEvent } from "./handler/grpcPendingEventHandler.js";
import { reportBlockCreatedEvent } from "./handler/grpcBlockEventHandler.js";

import * as grpcConfig from "../../config/connection_grpc_listener_config.json";
import logger from "../config/logger.js"


const DEFAULT_GRPC_EVENT_LISTENER_PORT: number = grpcConfig.DefaultGrpcEventListenerPort;

export default async function runGrpcServer(port: number = DEFAULT_GRPC_EVENT_LISTENER_PORT): Promise<grpc.Server> {
    const server = new grpc.Server();

    server.addService(proposalCreateEventServiceDefinition, {
        ValidateProposalEvent: validateProposalEvent,
        CacheProposalEvent: cacheProposalEvent
    });

    logger.info("[webclient-event-handler::ProposalCreateEvent] ProposalCreateEventService::validateProposalEvent registered");
    logger.info("[webclient-event-handler::ProposalCreateEvent] ProposalCreateEventService::cacheProposalEvent registered");

    server.addService(proposalQueryEventServiceDefinition, {
        GetProposal: getProposal
    });

    logger.info("[webclient-event-handler::ProposalQueryEvent] ProposalQueryEventService::getProposal registered");

    server.addService(ballotCreateEventServiceDefinition, {
        ValidateBallotEvent: validateBallotEvent,
        CacheBallotEvent: cacheBallotEvent
    });

    logger.info("[webclient-event-handler::BallotCreateEvent] BallotCreateEventService::validateBallotEvent registered");
    logger.info("[webclient-event-handler::BallotCreateEvent] BallotCreateEventService::cacheBallotEvent registered");

    server.addService(ballotQueryEventServiceDefinition, {
        GetUserBallots: getUserBallots 
    });

    logger.info("[webclient-event-handler::BallotQueryEvent] BallotQueryEventService::getUserBallots registered");
    
    server.addService(blockEventServiceDefinition, {
        ReportBlockCreatedEvent: reportBlockCreatedEvent,
    });

    logger.info("[blockchain-event-handler::BlockEvent] CreatedBlockEventService::reportBlockCreatedEvent registered");
    
    server.addService(pendingEventServiceDefinition, {
        ReportPendingExpiredEvent: reportPendingExpiredEvent
    });

    logger.info("[blockchain-event-handler::PendingEvent] ExpiredPendingEventService::reportPendingExpiredEvent registered");
    
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
    logger.info("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+");
    
    return server;
}