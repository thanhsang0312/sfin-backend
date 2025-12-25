import { BaseMongoRepository } from "@common/repositories";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Gmail } from "../schemas";

@Injectable()
export class GmailRepository extends BaseMongoRepository<Gmail> {
    constructor(@InjectModel(Gmail.name) private readonly gmailModel: Model<Gmail>) {
        super(gmailModel);
    }
}