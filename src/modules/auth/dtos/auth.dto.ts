import { IUserExternalProfile } from "@modules/google/interfaces";

export class UserExternalProfileDto implements IUserExternalProfile {
    email: string;
    name: string;
    avatar: string;
    preAuthData: { walletAddress?: string; referralCode?: string };
    accessToken: string;
    refreshToken: string;
}
