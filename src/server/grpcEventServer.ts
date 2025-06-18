import * as grpc from "@grpc/grpc-js";

import { newProposalEventServiceDefinition } from "../generated/web_event/proposal_create_event_message.grpc-server.js";
import { proposalQueryEventServiceDefinition } from "../generated/web_event/proposal_query_event_message.grpc-server.js";
import { newBallotEventServiceDefinition } from "../generated/web_event/ballot_create_event_message.grpc-server.js";
import { ballotQueryEventServiceDefinition } from "../generated/web_event/ballot_query_event_message.grpc-server.js";
import { expiredPendingEventServiceDefinition } from "../generated/blockchain_event/pending_event_message.grpc-server.js";
import { createdBlockEventServiceDefinition } from "../generated/blockchain_event/block_event_message.grpc-server.js";

import { validateNewProposalEvent, cacheNewProposalEvent } from "./handler/grpcProposalCreateEventHandler.js";
import { validateNewBallotEvent, cacheNewBallotEvent } from "./handler/grpcBallotCreateEventHandler.js";
import { getProposal } from "./handler/grpcProposalQueryEventHandler.js";
import { getUserBallots } from "./handler/grpcBallotQueryEventHandler.js";
import { reportExpiredPendingEvent } from "./handler/grpcPendingEventHandler.js";
import { reportCreatedBlockEvent } from "./handler/grpcBlockEventHandler.js";

import * as grpcConfig from "../../config/connection_grpc_listener_config.json";
import logger from "../config/logger.js"


const DEFAULT_GRPC_EVENT_LISTENER_PORT: number = grpcConfig.DefaultGrpcEventListenerPort;

export default async function runGrpcServer(port: number = DEFAULT_GRPC_EVENT_LISTENER_PORT): Promise<grpc.Server> {
    const server = new grpc.Server();

    server.addService(newProposalEventServiceDefinition, {
        ValidateNewProposalEvent: validateNewProposalEvent,
        CacheNewProposalEvent: cacheNewProposalEvent
    });

    logger.info("[webclient-event-handler::ProposalCreateEvent] NewProposalEventService::validateNewProposalEvent registered");
    logger.info("[webclient-event-handler::ProposalCreateEvent] NewProposalEventService::cacheNewProposalEvent registered");

    server.addService(proposalQueryEventServiceDefinition, {
        GetProposal: getProposal
    });

    logger.info("[webclient-event-handler::ProposalQueryEvent] ProposalQueryEventService::getProposal registered");

    server.addService(newBallotEventServiceDefinition, {
        ValidateNewBallotEvent: validateNewBallotEvent,
        CacheNewBallotEvent: cacheNewBallotEvent
    });

    logger.info("[webclient-event-handler::BallotCreateEvent] NewBallotEventService::validateNewBallotEvent registered");
    logger.info("[webclient-event-handler::BallotCreateEvent] NewBallotEventService::cacheNewBallotEvent registered");

    server.addService(ballotQueryEventServiceDefinition, {
        GetUserBallots: getUserBallots 
    });

    logger.info("[webclient-event-handler::BallotQueryEvent] BallotQueryEventService::getUserBallots registered");
    
    server.addService(createdBlockEventServiceDefinition, {
        ReportCreatedBlockEvent: reportCreatedBlockEvent,
    });

    logger.info("[blockchain-event-handler::BlockEvent] CreatedBlockEventService::reportCreatedBlockEvent registered");
    
    server.addService(expiredPendingEventServiceDefinition, {
        ReportExpiredPendingEvent: reportExpiredPendingEvent
    });

    logger.info("[blockchain-event-handler::PendingEvent] ExpiredPendingEventService::reportExpiredPendingEvent registered");
    


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