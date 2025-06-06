"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runGrpcServer;
const grpc = __importStar(require("@grpc/grpc-js"));
const block_event_message_grpc_server_js_1 = require("../generated/blockchain_event/block_event_message.grpc-server.js");
const pending_event_message_grpc_server_js_1 = require("../generated/blockchain_event/pending_event_message.grpc-server.js");
const proposal_event_message_grpc_server_js_1 = require("../generated/web_event/proposal_event_message.grpc-server.js");
const grpcBlockEventHandler_js_1 = __importDefault(require("./handler/grpcBlockEventHandler.js"));
const grpcPendingEventHandler_js_1 = __importDefault(require("./handler/grpcPendingEventHandler.js"));
const grpcProposalEventHandler_js_1 = __importDefault(require("./handler/grpcProposalEventHandler.js"));
const GRPC_PORT = 50051;
async function runGrpcServer(port = GRPC_PORT) {
    const server = new grpc.Server();
    server.addService(proposal_event_message_grpc_server_js_1.newProposalEventServiceDefinition, {
        ValidateNewProposalEvent: grpcProposalEventHandler_js_1.default
    });
    console.log("[gRPC Server] NewProposalEventService::validateNewProposalEvent registered");
    server.addService(block_event_message_grpc_server_js_1.createdBlockEventServiceDefinition, {
        ReportCreatedBlockEvent: grpcBlockEventHandler_js_1.default,
    });
    console.log("[gRPC Server] CreatedBlockEventService::reportCreatedBlockEvent registered");
    server.addService(pending_event_message_grpc_server_js_1.expiredPendingEventServiceDefinition, {
        ReportExpiredPendingEvent: grpcPendingEventHandler_js_1.default
    });
    console.log("[gRPC Server] ExpiredPendingEventService::reportExpiredPendingEvent registered");
    await new Promise((resolve, reject) => {
        server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, boundPort) => {
            if (err) {
                console.error(`Error binding gRPC server to port ${port}:`, err);
                return reject(err);
            }
            console.log(`gRPC server successfully bound to http://0.0.0.0:${boundPort}`);
            resolve();
        });
    });
    console.log(`gRPC server is now listening on port ${port}`);
    return server;
}
//# sourceMappingURL=grpcEventServer.js.map