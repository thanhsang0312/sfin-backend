import { BaseSchema } from "@common/schemas";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true, versionKey: false })
export class User extends BaseSchema {
    @Prop({ type: String, required: true, unique: true, index: true })
    walletAddress: string;

    @Prop({ type: Number, default: 0 })
    walletType: number; // 0: evm, 1: ton, 2: solana, 3: aptos

    @Prop({ type: String })
    telegramId?: string;

    @Prop({ type: String, default: "" })
    email?: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String, nullable: true })
    avatar: string;

    @Prop({ type: Boolean, default: false })
    isCreateWallet: boolean;

    @Prop({ type: Boolean, default: false })
    isTelegramPremium: boolean;

    @Prop({ type: String, default: "" })
    languageCode: string;

    @Prop({ type: String, nullable: true })
    googleAccessToken: string;

    @Prop({ type: String, nullable: true })
    googleRefreshToken: string;

    @Prop({ type: String, unique: true, required: true, index: true })
    refCode: string;

    @Prop({ type: String, nullable: true })
    refBy: string;

    @Prop({ type: Number, default: 0 })
    refCount: number;

    @Prop({ type: Number, default: 0 })
    refTime: number;

    @Prop({ type: Date, default: Date.now })
    lastLoginDate: Date;

    @Prop({ type: Number, default: 0 })
    loginTime: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
