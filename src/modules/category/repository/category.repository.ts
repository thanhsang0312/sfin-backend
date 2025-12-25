import { BaseMongoRepository } from "@common/repositories";
import { Injectable } from "@nestjs/common";
import { Category } from "../schemas";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class CategoryRepository extends BaseMongoRepository<Category> {
    constructor(@InjectModel(Category.name) private readonly categoryModel: Model<Category>) {
        super(categoryModel);
    }
}