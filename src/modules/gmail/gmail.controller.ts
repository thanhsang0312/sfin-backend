import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { AuthGuard, RoleGuard } from '@common/guards';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@modules/auth/interfaces';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ResponseType } from '@common/dtos';

@Controller('gmail')
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard, RoleGuard)
export class GmailController {
    constructor(private readonly gmailService: GmailService) { }

    @Get('profile')
    async getProfile(@CurrentUser() request: IAuthPayload) {
        return this.gmailService.getProfile(request)
    }

    @Get('list-labels')
    async getListLabel(@CurrentUser() request: IAuthPayload) {
        return this.gmailService.getListLabels(request)
    }

    @Get('labelStats/:labelId')
    async getLabelStats(@CurrentUser() request: IAuthPayload, @Param("labelId") labelId: string) {
        return this.gmailService.getLabelStats(request, labelId)
    }

    @Get('messagesFromLabel/:labelId')
    async getMessagesFromLabel(@CurrentUser() request: IAuthPayload, @Param("labelId") labelId: string): Promise<ResponseType> {
        return this.gmailService.getMessageFromLabel(request, labelId)
    }

    @Get('message/:messageId')
    async getMessage(@CurrentUser() request: IAuthPayload, @Param("messageId") messageId: string): Promise<ResponseType> {
        return this.gmailService.getMessage(request, messageId)
    }
}
