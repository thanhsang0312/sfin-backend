import { AuthGuard, RoleGuard } from "@common/guards";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { BalanceService } from "./balance.service";
import { CurrentUser } from "@common/decorators/current-user.decorator";
import { IAuthPayload } from "@modules/auth/interfaces";
import { ResponseType } from "@common/dtos";

@Controller("balance")
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard, RoleGuard)
export class BalanceController {
    constructor(
        private readonly balanceService: BalanceService
    ) { }

    @Get('latest')
    async getLatestBalance(@CurrentUser() request: IAuthPayload): Promise<ResponseType> {
        return this.balanceService.getBalance(request)
    }
}