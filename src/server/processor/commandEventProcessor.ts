import * as os from 'os';
import * as net from 'net';

import * as env from "../../config/env.js";

import logger from "../../config/logger";

export interface NetworkStatus {
    ip: string;
    ports: number[];
}

export class CommandEventProcessor {
    private static instance: CommandEventProcessor;

    private serverIp: string;
    private serverPorts: number[];

    private constructor() {
        this.serverIp = this.getSystemIpAddress();
        this.serverPorts = this.getListeningPorts();
    }

    public static getInstance(): CommandEventProcessor {
        if (!CommandEventProcessor.instance) {
            CommandEventProcessor.instance = new CommandEventProcessor();
        }

        return CommandEventProcessor.instance;
    }

    public getNetworkInfo(): NetworkStatus {
        logger.debug(`[CommandEventProcessor::getNetworkInfo] Retrieving network information.`);

        const networkStatus: NetworkStatus = {
            ip: this.serverIp,
            ports: this.serverPorts
        };

        logger.info(`[CommandEventProcessor::getNetworkInfo] Network information retrieved. IP: ${networkStatus.ip}, Ports: [${networkStatus.ports.join(', ')}]`);
        
        return networkStatus;
    }

    private getSystemIpAddress(): string {
        const networkInterfaces = os.networkInterfaces();
        for (const devName in networkInterfaces) {
            const iface = networkInterfaces[devName];
            if (iface) {
                for (const alias of iface) {
                    if (alias.family === 'IPv4' && !alias.internal) {
                        return alias.address;
                    }
                }
            }
        }
        return '0.0.0.0';
    }

    private getListeningPorts(): number[] {
        const ports: number[] = [];

        try {
            const grpcPort = env.getNumberEnvVar("GRPC_EVENT_LISTENER_PORT");

            if (!isNaN(grpcPort) && grpcPort > 0) {
                ports.push(grpcPort);
            }

        } catch (error) {
            logger.warn(`[CommandEventProcessor] Could not get GRPC_EVENT_LISTENER_PORT: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        return ports;
    }
}

export const commandEventProcessor = CommandEventProcessor.getInstance();