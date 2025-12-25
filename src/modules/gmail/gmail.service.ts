import { ResponseType } from '@common/dtos';
import { IAuthPayload } from '@modules/auth/interfaces';
import { UserRepository } from '@modules/user';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Types } from 'mongoose';
import { extractBody } from 'src/utils/parse-content-email.util';
import { GmailRepository } from './repositories/gmail.repository';

@Injectable()
export class GmailService {
    constructor(
        private readonly httpService: HttpService,
        private readonly userRepository: UserRepository,
        private readonly gmailRepository: GmailRepository
    ) { }

    async getProfile(request: IAuthPayload) {
        try {
            const { id } = request
            const { googleAccessToken } = await this.getGoogleAccessToken(id)
            const { data } = await axios.get(
                'https://gmail.googleapis.com/gmail/v1/users/me/profile',
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
            return error
        }
    }

    async getListLabels(request: IAuthPayload) {
        try {
            const { id } = request
            const { googleAccessToken } = await this.getGoogleAccessToken(id)
            const { data } = await axios.get(
                'https://gmail.googleapis.com/gmail/v1/users/me/labels',
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
            return error
        }
    }

    async getLabelStats(request: IAuthPayload, labelId: string) {
        try {
            const { id: userId } = request
            const { googleAccessToken } = await this.getGoogleAccessToken(userId)
            const { data } = await axios.get(
                `https://gmail.googleapis.com/gmail/v1/users/me/labels/${labelId}`,
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
            return error
        }
    }

    async getMessageFromLabel(request: IAuthPayload, labelId: string): Promise<ResponseType> {
        try {
            const { id: userId } = request
            const { googleAccessToken } = await this.getGoogleAccessToken(userId)
            const { data } = await axios.get(
                `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${labelId}`,
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

    async getMessage(request: IAuthPayload, messageId: string): Promise<ResponseType> {
        try {
            const { id: userId } = request
            const { googleAccessToken } = await this.getGoogleAccessToken(userId)
            const existMessage = await this.gmailRepository.findOne({ gmailId: messageId });
            if (existMessage) {
                return {
                    code: 0,
                    data: existMessage
                }
            }
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

            const result = await this.gmailRepository.create({
                gmailId: messageId,
                message: decodePayload,
                categories: []
            })

            return {
                code: 0,
                data: result
            }
        } catch (error) {
            console.error("Gmail getMessage error:", error?.response?.data || error);
            throw error;
        }
    }

    private async getGoogleAccessToken(id: string) {
        const userProfile = await this.userRepository.findOne({ _id: new Types.ObjectId(id) });
        return {
            googleAccessToken: userProfile.googleAccessToken
        }
    }
}
