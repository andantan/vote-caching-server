import dotenv from "dotenv";
import logger from "./logger";

export function loadEnv(): void {
    const result = dotenv.config();

    if (result.error) {
        logger.error('Error loading .env file:', result.error.message);

        process.exit(1);
    } else {
        logger.info('Environment variables successfully loaded from .env file.');

        const serverName = getEnvVar("SERVER_NAME");

        logger.info(`=======================================================================================`);
        logger.info(`                  Welcome! Starting ${serverName}`);
        logger.info(`=======================================================================================`);
    }
}

export function getEnvVar(varName: string): string {
    const value = process.env[varName];
    if (value === undefined) {
        logger.error(`CRITICAL ERROR: Required environment variable "${varName}" is not defined. Application will exit.`);
        
        process.exit(1);
    }
    return value;
}

export function getNumberEnvVar(varName: string): number {
    const stringValue = getEnvVar(varName);
    const numberValue = parseInt(stringValue, 10);

    if (isNaN(numberValue)) {
        logger.error(`CRITICAL ERROR: Environment variable "${varName}" ("${stringValue}") is not a valid number. Application will exit.`);
        process.exit(1);
    }
    return numberValue;
}