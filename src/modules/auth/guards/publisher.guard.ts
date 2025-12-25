import { env } from "@environments";
import { RedisService } from "@modules/redis/redis.service";
import { CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { IAuthPayload } from "../interfaces";
import { IS_PUBLIC_KEY } from "@common/decorators/skip-auth.decorator";

@Injectable()
export class PublisherGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
        private redisService: RedisService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]);
        if (isPublic) {
            return true;
        }
        try {
            const { authToken } = this.extractCredentialFromHeader(request);
            const decoded: IAuthPayload = this.jwtService.verify(authToken, {
                secret: env.jwt.access.SECRET
            });
            if (!decoded || !decoded.sessionId || !decoded.id) {
                throw new ForbiddenException("Invalid token or missing session data.");
            }

            const publisherSessionsKey = `publisher:${decoded.id}:sessions`;
            const sessionExists = await this.redisService.zScore(publisherSessionsKey, decoded.sessionId);
            if (sessionExists === null) {
                throw new ForbiddenException("Session not found or expired.");
            }

            request.user = decoded;

            return true;
        } catch (error) {
            throw new HttpException("Unauthorized", HttpStatus.UNAUTHORIZED, {
                cause: error
            });
        }
    }

    private extractCredentialFromHeader(request: any): { authToken: string } {
        const authHeader = request.headers["authorization"];
        if (!authHeader) {
            throw new ForbiddenException("Missing authorization header.");
        }

        const authToken = authHeader.split(" ")[1];
        if (!authToken) {
            throw new ForbiddenException("Invalid authorization format.");
        }

        return { authToken };
    }
}
