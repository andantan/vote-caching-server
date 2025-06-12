import { Schema } from "mongoose";

export interface IBallot {
    voteHash: string,
    topic: string,
    submittedAt: Date,
};

export const ballotSchema: Schema<IBallot> = new Schema({
    voteHash: { type: String, require: true },
    topic: { type: String, require: true },
    submittedAt: { type: Date, default: Date.now }
}, {
    _id: false
});