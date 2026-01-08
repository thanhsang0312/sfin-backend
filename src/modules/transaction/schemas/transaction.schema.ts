import { BaseSchema } from "@common/schemas";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true, versionKey: false })
export class Transaction extends BaseSchema {
    @Prop({ type: String })
    message: string

    @Prop({ type: Array, default: "" })
    categories: string[]
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);