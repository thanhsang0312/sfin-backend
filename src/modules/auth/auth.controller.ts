import { ResponseType } from "@common/dtos";
import { AuthGuard } from "@common/guards";
import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginRequestDto, UserExternalProfileDto } from "./dtos";
import { PublisherGuard } from "./guards";
// import { TelegramAuthGuard } from "./guards/telegram-auth.guard";
import { IAuthPayload, ITeleAuthPayload } from "./interfaces";
import { GoogleOauth2Guard } from "@modules/google/guards";
import { Role } from "@common/enums/role.enum";
import { CurrentUser } from "@common/decorators/current-user.decorator";

@ApiTags("Auth")
@ApiBearerAuth("access-token")
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) { }
    // @Post("login-telegram")
    // @UseGuards(TelegramAuthGuard)
    // @ApiOkResponse({ type: ResponseType })
    // async telegramLogin(@CurrentUser() user: ITeleAuthPayload): Promise<ResponseType> {
    //     return this.authService.telegramLogin(user);
    // }

    @Post("login/:role")
    @ApiOkResponse({ type: ResponseType })
    @HttpCode(HttpStatus.OK)
    async login(@Param("role") role: string, @Body() loginRequestDto: LoginRequestDto) {
        return this.authService.login(loginRequestDto, role as Role);
    }

    @Post("user/logout")
    @ApiOkResponse({ type: ResponseType })
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    public async userLogout(@CurrentUser() req: IAuthPayload) {
        return this.authService.logoutSession(req.id, req.sessionId, Role.USER);
    }

    @Post("publisher/logout")
    @ApiOkResponse({ type: ResponseType })
    @HttpCode(HttpStatus.OK)
    @UseGuards(PublisherGuard)
    public async publisherLogout(@CurrentUser() req: IAuthPayload) {
        return this.authService.logoutSession(req.id, req.sessionId, Role.PUBLISHER);
    }

    @Get("google/callback/user")
    @UseGuards(GoogleOauth2Guard)
    @HttpCode(HttpStatus.FOUND)
    async handleGoogleCallbackUser(@CurrentUser() user: UserExternalProfileDto, @Res() res: Response) {
        return this.authService.handleGoogleCallback(user, res, Role.USER);
    }

    @Get("refreshAccessToken")
    @UseGuards(AuthGuard)
    async refreshAccessToken(@CurrentUser() request: IAuthPayload): Promise<any> {
        return this.authService.refreshAccessToken(request)
    }

    // @Get("google/callback/publisher")
    // @UseGuards(PublisherGoogleOAuth2Guard)
    // @HttpCode(HttpStatus.FOUND)
    // async handleGoogleCallbackPublisher(@CurrentUser() user: UserExternalProfileDto, @Res() res: Response) {
    //     return this.authService.handleGoogleCallback(user, res, Role.PUBLISHER);
    // }
}
