import { ResponseType } from '@common/dtos';
import { CodeResponseEnum } from '@common/enums/code-response.enum';
import { env } from '@environments';
import { IAuthPayload } from '@modules/auth/interfaces';
import { UserRepository } from '@modules/user';
import { Injectable } from '@nestjs/common';
import { parseBankSms } from '@utils';
import axios from 'axios';
import { Types } from 'mongoose';
import { extractBody } from 'src/utils/parse-content-email.util';

@Injectable()
export class TransactionService {
    constructor(
        private readonly userRepository: UserRepository
    ) {
        // const request = {
        //     id: "694ceef47bdfd3468c7019c6",
        //     role: "user",
        //     name: "Thành Sang Cao",
        //     avatar: "https://lh3.googleusercontent.com/a/ACg8ocJnvizX2mw1uoFqq-PHWbCnbm3m5oCYU5nfdOxkwVHWVjTssQ=s96-c",
        //     walletAddress: "0xe61ef1edbb0ce0bacb5a5150a24605b709eb84fe",
        //     sessionId: "",
        // };
        // this.getListTransactions(request, "Label_3692019417488893923")
    }

    async getListTransactions(request: IAuthPayload, labelId: string): Promise<ResponseType> {
        try {
            const { data } = await this.getListMessage(request, labelId);
            const { messages } = data;
            const results = await Promise.all(
                messages.map(m => this.getMessage(request, m.id) )
            )
            const resultData = results.map(result => parseBankSms(result.data))
            return {
                code: CodeResponseEnum.SUCCESS,
                data: resultData
            }
        } catch (error) {
            throw error;
        }
    }

    private async getGoogleAccessToken(id: string) {
        const userProfile = await this.userRepository.findOne({ _id: new Types.ObjectId(id) });
        return {
            googleAccessToken: userProfile.googleAccessToken
        }
    }

    private async getListMessage(request: IAuthPayload, labelId: string): Promise<ResponseType> {
        try {
            const { id: userId } = request
            const { googleAccessToken } = await this.getGoogleAccessToken(userId)
            const { data } = await axios.get(
                `${env.gmailApi.ENDPOINT}/gmail/v1/users/me/messages?labelIds=${labelId}`,
                {
                    headers: {
                        Authorization: `Bearer ${googleAccessToken}`,
                    },
                }
            );
            return {
                code: 0,
                data
            }
        } catch (error) {
            console.error("Gmail getMessageFromLabel error:", error?.response?.data || error);
            throw error;
        }
    }

    private async getMessage(request: IAuthPayload, messageId: string): Promise<ResponseType> {
        try {
            const { id: userId } = request
            const { googleAccessToken } = await this.getGoogleAccessToken(userId)

            const { data } = await axios.get(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
                {
                    headers: {
                        Authorization: `Bearer ${googleAccessToken}`,
                    },
                }
            );
            const payload = data?.payload?.body;

            const decodePayload = extractBody(payload)

            return {
                code: 0,
                data: decodePayload
            }
        } catch (error) {
            console.error("Gmail getMessage error:", error?.response?.data || error);
            throw error;
        }
    }
}
