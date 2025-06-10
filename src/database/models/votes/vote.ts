import mongoose from "mongoose";
import { Schema, Document } from "mongoose";

import { IBalletResult, balletResultSchema } from "./ballet.js";
import { IBlockHeight, blockHeightSchema } from "./block.js";
import * as MongoConfig from "../../../../config/connection_mongodb_config.json";

export interface IVote extends Document {
    _id: mongoose.Types.ObjectId;
    topic: string;
    duration: number;
    createdAt: Date;
    updatedAt: Date;
    expiredAt: Date;
    expired: boolean;
    blockHeights: IBlockHeight;
    result: IBalletResult;
}

const VoteSchema: Schema<IVote> = new Schema({
    topic: { type: String, required: true, unique: true },
    duration: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiredAt: { type: Date, required: false },
    expired: { type: Boolean, default: false },
    blockHeights: {
        type: [blockHeightSchema],
        default: []
    },
    result: {
        type: balletResultSchema,
        default: () => ({ count: 0, options: {} })
    }
}, {
    timestamps: true
})

VoteSchema.pre('save', function (next) {
    if (this.isNew) {
        if (!this.createdAt) {
            this.createdAt = new Date();
        }

        const expirationDate = new Date(this.createdAt);

        expirationDate.setMinutes(expirationDate.getMinutes() + this.duration);

        this.expiredAt = expirationDate;
    }
    next();
});

VoteSchema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});

export const VoteModel = mongoose.model<IVote>('Vote', VoteSchema, MongoConfig.MongoVoteCollection);