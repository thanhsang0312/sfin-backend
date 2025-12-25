import { Injectable } from "@nestjs/common";
import { Role } from "@common/enums/role.enum";
import { GoogleOauth2Strategy } from "./strategies";

@Injectable()
export class GoogleService {
    constructor(
        private readonly googleOAuth2Strategy: GoogleOauth2Strategy,
    ) { }

    async getOauth2AuthorUrl(preAuthData: { walletAddress?: string; referralCode?: string }, role: Role): Promise<string> {

        return this.googleOAuth2Strategy.getAuthorizeUrl(preAuthData);

    }

    async getUserInfo(accessToken: string, role: Role): Promise<any> {

        return this.googleOAuth2Strategy.getUserInfo(accessToken);

    }

    async refreshAccessToken(refreshToken: string, role: Role): Promise<any> {

        return this.googleOAuth2Strategy.refreshAccessToken(refreshToken);

    }

    async revokePermission(token: string, role: Role): Promise<any> {
        return this.googleOAuth2Strategy.revokeToken(token);
    }
}
