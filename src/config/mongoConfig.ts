import * as env from "./env.js";

interface MongoDbConfig {
    host: string;
    port: number;
    database: string;
    uri: string;
    userCollection: string;
    voteCollection: string;
}

export const mongoConfig: MongoDbConfig = (function() {
    const host = env.getEnvVar("MONGODB_HOST");
    const port = env.getNumberEnvVar("MONGODB_PORT");
    const database = env.getEnvVar("MONGODB_DATABASE");
    const userCollection = env.getEnvVar("MONGODB_USER_COLLECTION");
    const voteCollection = env.getEnvVar("MONGODB_VOTE_COLLECTION");

    const uri = `mongodb://${host}:${port}/${database}`;

    return {
        host,
        port,
        database,
        uri,
        userCollection,
        voteCollection
    };
})();