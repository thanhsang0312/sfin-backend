import { ResponseType } from "@common/dtos";
import { CodeResponseEnum } from "@common/enums/code-response.enum";
import { IAuthPayload } from "@modules/auth/interfaces";
import { GmailService } from "@modules/gmail/gmail.service";
import { GmailRepository } from "@modules/gmail/repositories/gmail.repository";
import { Injectable } from "@nestjs/common";
import { parseBankSms } from "@utils";

@Injectable()
export class BalanceService {
    constructor(
        private readonly gmailService: GmailService
    ) { }

    async getBalance(request: IAuthPayload): Promise<ResponseType> {
        try {
            const { data: listMessageSmsBankingResponse } = await this.gmailService.getMessageFromLabel(request, process.env.LABEL_SMS_BANKING_ID);
            const { messages } = listMessageSmsBankingResponse
            if (!!!messages || messages?.length === 0) {
                return {
                    code: CodeResponseEnum.ERROR,
                    data: null
                }
            }
            const lastestMessage = messages[0];
            const { data: contentMessageResponse } = await this.gmailService.getMessage(request, lastestMessage.id);
            const contentMessage = contentMessageResponse.message;
            const parseMessage = parseBankSms(contentMessage)
            return {
                code: CodeResponseEnum.SUCCESS,
                data: parseMessage
            }
        } catch (error) {
            throw error
        }
    }
}