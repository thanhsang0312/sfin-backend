import { BaseSchema } from "@common/schemas";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true, versionKey: false })
export class Gmail extends BaseSchema {
    @Prop({ type: String, required: true, unique: true })
    gmailId: string;

    @Prop({ type: String })
    message: string

    @Prop({ type: Array, default: "" })
    categories: string[]
}

export const GmailSchema = SchemaFactory.createForClass(Gmail);