import { AuthGuard, RoleGuard } from "@common/guards";
import { IAuthPayload } from "@modules/auth/interfaces";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { Role } from "@common/enums/role.enum";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { Roles } from "@common/decorators/roles.decorator";

@Controller("users")
@ApiTags("Users")
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard, RoleGuard)
@Roles(Role.USER)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("getUserProfile")
    async getProfile(@CurrentUser() user: IAuthPayload) {
        return this.userService.getProfile(user);
    }
}
