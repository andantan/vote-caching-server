import { Schema } from "mongoose";

export interface IVoteOptions {
    [option: string]: number;
}

export interface IVoteResult {
    count: number;
    options: IVoteOptions;
}

export const voteResultSchema: Schema<IVoteResult> = new Schema({
    count: { type: Number, default: 0 },
    options: { type: Map, of: Number, default: {} }
}, {
    _id: false
})