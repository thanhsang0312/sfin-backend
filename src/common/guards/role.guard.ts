// role.guard.ts
import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
  } from "@nestjs/common";
  import { Reflector } from "@nestjs/core";
  import { ROLES } from "@common/decorators/roles.decorator";
  import { IS_PUBLIC_KEY } from "@common/decorators/skip-auth.decorator";
  import { ROLE_PRIORITY } from "@common/constants";
  import { Role } from "@common/enums/role.enum";
  
  @Injectable()
  export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}
  
    canActivate(context: ExecutionContext): boolean {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;
  
      const requiredRole = this.reflector.getAllAndOverride<Role>(
        ROLES,
        [context.getHandler(), context.getClass()],
      );
  
      if (!requiredRole) return true;
  
      const request = context.switchToHttp().getRequest();
      const user = request.user;
  
      if (!user || !user.role) {
        throw new ForbiddenException("User role not found");
      }
  
      if (ROLE_PRIORITY[user.role] < ROLE_PRIORITY[requiredRole]) {
        throw new ForbiddenException("Insufficient role privileges");
      }
  
      return true;
    }
  }
  