import logger from "../../config/logger.js";

import { IVoteOptions, IVoteResult } from "../models/votes/schemaResult.js";
import { VoteModel, IVote } from "../models/votes/schemaVote.js";
import { IBlockHeight } from "../models/votes/schemaBlock.js";


export interface QueryFilter {
    expired?: boolean;
    sort?: QuerySortOptions;
};

export type QuerySortOptions = {
    [key in keyof IVote]?: 1 | -1;
}

export interface QueryPaging {
    skip: number;
    limit: number;
}

export default class MongoVoteCollectionActor {
    public async saveNewVote(topic: string, proposer: string, duration: number, options: string[]): Promise<IVote> {
        logger.debug(`[MongoVoteCollectionActor::saveNewProposal] Attempting to save new proposal. Topic: "${topic}", Duration: ${duration}`);

        try {
            const newVote: IVote = new VoteModel({
                topic: topic,
                proposer: proposer,
                duration: duration,
                options: options
            });

            const savedVote = await newVote.save();
            
            logger.info(`[MongoVoteCollectionActor::saveNewProposal] Successfully saved new proposal. Topic: "${savedVote.topic}"`);

            return savedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to save new proposal for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoVoteCollectionActor::saveNewProposal] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findIfExistsProposal(topic: string): Promise<IVote | null> {
        logger.debug(`[MongoVoteCollectionActor::findIfExistsProposal] Checking for existing proposal. Topic: "${topic}"`);

        try {
            const vote = await VoteModel.findOne({
                topic: topic
            }).lean();

            if (vote) {
                logger.info(`[MongoVoteCollectionActor::findIfExistsProposal] Existing proposal found. Topic: "${topic}"`);
            } else {
                logger.info(`[MongoVoteCollectionActor::findIfExistsProposal] No existing proposal found. Topic: "${topic}"`);
            }

            return vote as IVote | null;
        } catch (error: unknown) {
            const errorMessage = `Failed to check existence for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoVoteCollectionActor::findIfExistsProposal] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async findProposalListWithFilter(filter: QueryFilter, sort: QuerySortOptions, paging: QueryPaging): Promise<IVote[]> {
        const expired: boolean | undefined = filter.expired;
        const skip: number = paging.skip;
        const limit: number = paging.limit;
        
        logger.debug(`[MongoVoteCollectionActor::findProposalListWithFilter] Attempting to retrieve filtered proposals. Expired: ${expired}, Skip: ${skip}, Limit: ${limit}, Sort: ${JSON.stringify(sort)}`);

        try {
            const proposals: IVote[] = await VoteModel.find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();
                
            logger.info(`[MongoVoteCollectionActor::findProposalListWithFilter] Retrieved ${proposals.length} proposals with Expired: ${expired}, Skip: ${skip}, Limit: ${limit}.`);

            return proposals;
        } catch (error: unknown) {
            const errorMessage = `Failed to retrieve filtered proposals with Expired: ${expired}, Skip: ${skip}, Limit: ${limit}. Error: ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoVoteCollectionActor::findProposalListWithFilter] MongoDB operation failed: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async countProposalsWithFilter(queryFilter: QueryFilter): Promise<number> {
        const expired: boolean | undefined = queryFilter.expired;

        logger.debug(`[MongoVoteCollectionActor::countProposalsWithFilter] Attempting to count proposals with filter. Expired: ${expired}.`);

        try {
            const count: number = await VoteModel.countDocuments(queryFilter);

            logger.info(`[MongoVoteCollectionActor::countProposalsWithFilter] Counted ${count} proposals with filter. Expired: ${expired}.`);

            return count;
        } catch (error: unknown) {
            const errorMessage = `Failed to count proposals with filter Expired: ${expired}. Error: ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoVoteCollectionActor::countProposalsWithFilter] MongoDB count operation failed: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async isValidVoteOption(topic: string, option: string): Promise<boolean> {
        logger.debug(`[MongoVoteCollectionActor::isValidVoteOption] Checking option validity. Topic: "${topic}", option: "${option}"`);

        try {
            const proposal = await VoteModel.findOne(
                {
                    topic: topic
                }
            ).select("options").lean();

            if (!proposal) {
                logger.warn(`[MongoVoteCollectionActor::isValidVoteOption] Proposal not found for topic: "${topic}". Cannot validate option.`);
                return false;
            }

            const isValid = proposal.options.includes(option);

            if (isValid) {
                logger.info(`[MongoVoteCollectionActor::isValidVoteOption] Option is valid. Topic: "${topic}", option: "${option}"`);
            } else {
                logger.warn(`[MongoVoteCollectionActor::isValidVoteOption] Option is invalid. Topic: "${topic}", option: "${option}", ValidOptions: "${proposal.options.join(', ')}"`);
            }

            return isValid;
        } catch (error: unknown) {
            const errorMessage = `Failed to validate vote option for Topic "${topic}", option "${option}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoVoteCollectionActor::isValidVoteOption] MongoDB operation error: ${errorMessage}`, error);
            return false;
        }
    }

    public async addBlockToVote(topic: string, length: number, height: number): Promise<IVote | null> {
        try {
            logger.debug(`[MongoVoteCollectionActor::addBlockToVote] Attempting to add block. Topic: "${topic}", Length: ${length}, Height: ${height}`);
    
            const blockHeight: IBlockHeight = { 
                height: height, 
                length: length 
            };

            const updatedVote = await VoteModel.findOneAndUpdate(
                { topic: topic },
                {
                    $push: {
                        blockHeights: blockHeight
                    }
                },
                { new: true }
            );

            if (!updatedVote) {
                logger.warn(`[MongoVoteCollectionActor::addBlockToVote] Failed to add block. No proposal found for topic: "${topic}", or update failed.`);
                return null;
            }

            logger.info(`[MongoVoteCollectionActor::addBlockToVote] Successfully added block. Topic: "${topic}", Height: ${height}`);
            
            return updatedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to add block to vote for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoVoteCollectionActor::addBlockToVote] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }

    public async saveVoteResult(topic: string, totalCount: number, optionsResult: IVoteOptions): Promise<IVote | null> {
        try {
            logger.debug(`[MongoVoteCollectionActor::saveVoteResult] Attempting to save vote result. Topic: "${topic}", TotalCount: ${totalCount}, Options: ${JSON.stringify(optionsResult)}`);

            const voteResult: IVoteResult = {
                count: totalCount,
                options: optionsResult
            };

            const updatedVote = await VoteModel.findOneAndUpdate(
                { topic: topic },
                {
                    $set: {
                        result: voteResult,
                        expired: true,
                        settledAt: new Date()
                    }
                }, 
                { new: true }
            );

            if (!updatedVote) {
                logger.warn(`[MongoVoteCollectionActor::saveVoteResult] Failed to save vote result. No proposal found for topic: "${topic}".`);
                return null;
            }

            logger.info(`[MongoVoteCollectionActor::saveVoteResult] Successfully saved vote result and marked proposal as expired. Topic: "${topic}", TotalCount: ${totalCount}`);

            return updatedVote;
        } catch (error: unknown) {
            const errorMessage = `Failed to save vote result for topic "${topic}": ${error instanceof Error ? error.message : String(error)}`;
            logger.error(`[MongoVoteCollectionActor::saveVoteResult] MongoDB operation error: ${errorMessage}`, error);
            throw new Error(errorMessage);
        }
    }
}
