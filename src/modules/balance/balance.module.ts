import { Module } from "@nestjs/common";
import { BalanceService } from "./balance.service";
import { GmailModule } from "@modules/gmail/gmail.module";
import { BalanceController } from "./balance.controller";

@Module({
    imports:[GmailModule],
    providers: [BalanceService],
    exports: [BalanceService],
    controllers: [BalanceController]
})
export class BalanceModule {}