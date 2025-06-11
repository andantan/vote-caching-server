import { Schema } from "mongoose";

export interface IBalletOptions {
    [option: string]: number;
}

export interface IBalletResult {
    count: number;
    options: IBalletOptions;
}

export const balletResultSchema: Schema<IBalletResult> = new Schema({
    count: { type: Number, default: 0 },
    options: { type: Map, of: Number, default: {} }
}, {
    _id: false
})