"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grpcEventServer_js_1 = __importDefault(require("./server/grpcEventServer.js"));
const PORT = 50051;
async function main() {
    try {
        console.log('Starting gRPC server...');
        await (0, grpcEventServer_js_1.default)(PORT);
        console.log('gRPC server is fully operational.');
    }
    catch (error) {
        console.error('Failed to start gRPC server:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map