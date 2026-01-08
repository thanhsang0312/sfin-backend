import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IAuthPayload } from '@modules/auth/interfaces';
import { ResponseType } from '@common/dtos';
import { AuthGuard, RoleGuard } from '@common/guards';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('transaction')
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard, RoleGuard)
export class TransactionController {
    constructor(
        private readonly transactionService: TransactionService
    ) { }

    @Get("list/:labelId")
    async getListTransactions(@CurrentUser() request: IAuthPayload, @Param("labelId") labelId: string): Promise<ResponseType> {
        return this.transactionService.getListTransactions(request, labelId)
    }
}
