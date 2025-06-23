import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

import { IBallot, ballotSchema } from "./schemaBallot";
import { mongoConfig } from "../../../config/mongoConfig";

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    userHash: string;
    ballots: IBallot[]
};

export const UserSchema: Schema<IUser> = new Schema({
    userHash: { type: String, require: true, unique: true, immutable: true },
    ballots: {
        type: [ballotSchema],
        default: []
    }
}, {
    timestamps: true
});

export type NullableUser = IUser | null;
export const UserModel = mongoose.model<IUser>('User', UserSchema, mongoConfig.userCollection);