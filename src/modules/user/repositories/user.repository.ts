import { BaseMongoRepository } from "@common/repositories";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, Types } from "mongoose";
// Mongoose v9 drops the FilterQuery export; use a lightweight local alias
type FilterQuery<T> = Record<string, unknown>;
import { User } from "../schemas/user.schema";

@Injectable()
export class UserRepository extends BaseMongoRepository<User> {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {
        super(userModel);
    }

    async updateWalletAddress(req: { userId: string; walletAddress: string; walletType: number }) {
    const filter = { _id: new mongoose.Types.ObjectId(req.userId) } as any;
        return this.userModel
            .findOneAndUpdate(filter, { walletAddress: req.walletAddress, walletType: req.walletType }, { new: true })
            .exec();
    }

    async increaseRefPoint(refCode: string) {
        return this.userModel
            .findOneAndUpdate(
                {
                    refCode
                },
                {
                    $inc: { refPoint: 1 }
                }
            )
            .exec();
    }

    async createUser(user: Partial<User>) {
        return this.userModel.create({ ...user });
    }

    async findAndCustomSelect(filter: FilterQuery<User>, select: { [key: string]: number }, isLean: boolean = true) {
        return isLean ? this.userModel.find(filter).select(select).lean().exec() : this.userModel.find(filter).select(select).exec();
    }

    async findUserProfileWithIds(ids: Types.ObjectId[]): Promise<User[]> {
        const filter = { _id: { $in: ids } } as any;
        return this.userModel
            .find(filter)
            .lean()
            .exec();
    }
}
