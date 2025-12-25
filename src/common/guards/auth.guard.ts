// auth.guard.ts
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from "@nestjs/common";
  import { Reflector } from "@nestjs/core";
  import { JwtService } from "@nestjs/jwt";
  import { IS_PUBLIC_KEY } from "@common/decorators/skip-auth.decorator";
  import { env } from "@environments";
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private jwtService: JwtService,
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;
  
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
  
      if (!authHeader) {
        throw new UnauthorizedException("Missing Authorization header");
      }
  
      const [type, token] = authHeader.split(" ");
      if (type !== "Bearer" || !token) {
        throw new UnauthorizedException("Invalid Authorization format");
      }
  
      try {
        const payload = this.jwtService.verify(token, {
          secret: env.jwt.access.SECRET,
        });
  
        request.user = payload;
        return true;
      } catch (error) {
        throw new UnauthorizedException("Invalid or expired token");
      }
    }
  }
  