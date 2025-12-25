import { RedisService } from "@modules/redis/redis.service";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GoogleModule } from "../google.module";
import { OAuthProvidersEnum } from "@common/enums/auth.enum";

@Injectable()
export class GoogleOauth2Guard extends AuthGuard("google-user") {
    constructor (
        private readonly redisService: RedisService
    ) {
        super()
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const state = request.query.state;

        if(!state) return false; // No state provided

        const storedPreAuthData = await this.redisService.get(`:${GoogleModule.name}:${OAuthProvidersEnum.GOOGLE}:user:${state}`);

        if(!storedPreAuthData) return false; // Invalid state

        this.redisService.del(`:${GoogleModule.name}:${OAuthProvidersEnum.GOOGLE}:user:${state}`);

        request.preAuthData = storedPreAuthData;

        return super.canActivate(context) as boolean;
    }
}