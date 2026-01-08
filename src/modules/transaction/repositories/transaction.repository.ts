import { BaseMongoRepository } from "@common/repositories";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Transaction } from "../schemas";

@Injectable()
export class TransactionRepository extends BaseMongoRepository<Transaction> {
    constructor(@InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>) {
        super(transactionModel);
    }
}