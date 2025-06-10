import { Schema } from "mongoose";

export interface IBlockHeight {
    height: number;
    length: number;
}

export const blockHeightSchema: Schema<IBlockHeight> = new Schema({
    height: { type: Number, required: true },
    length: { type: Number, required: true }
}, {
    _id: false
});