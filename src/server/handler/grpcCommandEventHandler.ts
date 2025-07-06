import { ServerUnaryCall, sendUnaryData } from "@grpc/grpc-js";

import * as Event from "../../generated/command_event/admin_l3_commands.js";

import { commandEventProcessor, NetworkStatus } from "../processor/commandEventProcessor.js";

export async function checkHealthEvent(
    call: ServerUnaryCall<Event.L3HealthCheckRequest, Event.L3HealthCheckResponse>,
    callback: sendUnaryData<Event.L3HealthCheckResponse>
): Promise<void> {
    const { ping } = call.request;

    const networkStatus: NetworkStatus = commandEventProcessor.getNetworkInfo();

    const response: Event.L3HealthCheckResponse = {
        connected: true,
        status: "OK",
        pong: ping,
        ip: networkStatus.ip,
        ports: networkStatus.ports
    };

    callback(null, response);
}