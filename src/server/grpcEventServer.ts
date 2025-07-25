import * as grpc from "@grpc/grpc-js";

import { l3CommandsDefinition } from "../generated/command_event/admin_l3_commands.grpc-server";
import { userCreateEventServiceDefinition } from "../generated/web_event/user_create_event_message.grpc-server";
import { proposalCreateEventServiceDefinition } from "../generated/web_event/proposal_create_event_message.grpc-server.js";
import { proposalQueryEventServiceDefinition } from "../generated/web_event/proposal_query_event_message.grpc-server.js";
import { ballotCreateEventServiceDefinition } from "../generated/web_event/ballot_create_event_message.grpc-server.js";
import { ballotQueryEventServiceDefinition } from "../generated/web_event/ballot_query_event_message.grpc-server.js";
import { pendingEventServiceDefinition } from "../generated/blockchain_event/pending_event_message.grpc-server.js";
import { blockEventServiceDefinition } from "../generated/blockchain_event/block_event_message.grpc-server.js";

import { checkHealthEvent } from "./handler/grpcCommandEventHandler";
import { validateUserEvent, cacheUserEvent } from "./handler/grpcUserCreateEventHandler";
import { validateProposalEvent, cacheProposalEvent } from "./handler/grpcProposalCreateEventHandler.js";
import { validateBallotEvent, cacheBallotEvent } from "./handler/grpcBallotCreateEventHandler.js";
import { getProposalDetail, getFilteredProposalList } from "./handler/grpcProposalQueryEventHandler.js";
import { getUserBallots } from "./handler/grpcBallotQueryEventHandler.js";
import { reportPendingExpiredEvent } from "./handler/grpcPendingEventHandler.js";
import { reportBlockCreatedEvent } from "./handler/grpcBlockEventHandler.js";

import logger from "../config/logger.js"


export default async function runGrpcServer(port: number): Promise<grpc.Server> {
    const server = new grpc.Server();

    server.addService(l3CommandsDefinition, {
        CheckHealth: checkHealthEvent
    });

    logger.debug("[command-event-handler::CheckHealth] l3Commands::checkHealthEvent registered");

    server.addService(userCreateEventServiceDefinition, {
        ValidateUserEvent: validateUserEvent,
        CacheUserEvent: cacheUserEvent
    });

    logger.debug("[webclient-event-handler::CacheUserEvent] UserCreateEventService::validateUserEvent registered");
    logger.debug("[webclient-event-handler::CacheUserEvent] UserCreateEventService::cacheUserEvent registered");

    server.addService(proposalCreateEventServiceDefinition, {
        ValidateProposalEvent: validateProposalEvent,
        CacheProposalEvent: cacheProposalEvent
    });

    logger.debug("[webclient-event-handler::ProposalCreateEvent] ProposalCreateEventService::validateProposalEvent registered");
    logger.debug("[webclient-event-handler::ProposalCreateEvent] ProposalCreateEventService::cacheProposalEvent registered");

    server.addService(proposalQueryEventServiceDefinition, {
        GetProposalDetail: getProposalDetail,
        GetFilteredProposalList: getFilteredProposalList
    });

    logger.debug("[webclient-event-handler::ProposalQueryEvent] ProposalQueryEventService::getProposalDetail registered");
    logger.debug("[webclient-event-handler::ProposalQueryEvent] ProposalQueryEventService::getFilteredProposalList registered");

    server.addService(ballotCreateEventServiceDefinition, {
        ValidateBallotEvent: validateBallotEvent,
        CacheBallotEvent: cacheBallotEvent
    });

    logger.debug("[webclient-event-handler::BallotCreateEvent] BallotCreateEventService::validateBallotEvent registered");
    logger.debug("[webclient-event-handler::BallotCreateEvent] BallotCreateEventService::cacheBallotEvent registered");

    server.addService(ballotQueryEventServiceDefinition, {
        GetUserBallots: getUserBallots 
    });

    logger.debug("[webclient-event-handler::BallotQueryEvent] BallotQueryEventService::getUserBallots registered");
    
    server.addService(blockEventServiceDefinition, {
        ReportBlockCreatedEvent: reportBlockCreatedEvent,
    });

    logger.debug("[blockchain-event-handler::BlockEvent] CreatedBlockEventService::reportBlockCreatedEvent registered");
    
    server.addService(pendingEventServiceDefinition, {
        ReportPendingExpiredEvent: reportPendingExpiredEvent
    });

    logger.debug("[blockchain-event-handler::PendingEvent] ExpiredPendingEventService::reportPendingExpiredEvent registered");
    
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
    logger.info("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+");
    
    return server;
}