import { BaseSchema } from "@common/schemas";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true, versionKey: false })
export class Category extends BaseSchema {
    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Number })
    limitSpend: number

    @Prop({ type: String, default: "" })
    description: string

    @Prop({ type: Boolean, default: false })
    isSafe: boolean

    @Prop({ type: String })
    tag: string
}

export const CategorySchema = SchemaFactory.createForClass(Category);