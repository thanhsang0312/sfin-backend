import { env } from "@environments";
import { IAuthPayload } from "@modules/auth/interfaces";
import { HttpService } from "@nestjs/axios";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { generateRefCode } from "@utils";
import { BloomFilter } from "bloom-filters";
import { Types } from "mongoose";
import { lastValueFrom } from "rxjs";
import { IResultPhotoUrl } from "./interfaces";
import { UserRepository } from "./repositories";
import { User } from "./schemas";
import { CodeResponseEnum } from "@common/enums/code-response.enum";

@Injectable()
export class UserService {
    private userBloomFilter: BloomFilter;
    private userEmailBloomFilter: BloomFilter;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly httpService: HttpService
    ) {
        this.initBloomFilter();
    }

    private async initBloomFilter() {
        this.userBloomFilter = BloomFilter.create(env.bloomFilter.SIZE, env.bloomFilter.FALSE_POSITIVE_RATE);
        this.userEmailBloomFilter = BloomFilter.create(env.bloomFilter.SIZE, env.bloomFilter.FALSE_POSITIVE_RATE);

        try {
            const users = await this.userRepository.findAndCustomSelect({}, { walletAddress: 1, email: 1 });
            users.forEach((user) => {
                if (user.walletAddress) {
                    this.userBloomFilter.add(user.walletAddress.toLowerCase());
                }
                if (user.email) {
                    this.userEmailBloomFilter.add(user.email.toLowerCase());
                }
            });
            // logger.info(`Wallet false positive rate: ${this.userBloomFilter.rate() * 100} %`);
            // logger.info(`Email false positive rate: ${this.userEmailBloomFilter.rate() * 100} %`);
            // logger.info(`Bloom filters initialized with ${users.length} users`);
        } catch (error) {
            // logger.error(`Failed to initialize bloom filters: ${error.message}`);
        }
    }

    async getUserBloomFilter(walletAddress: string) {
        return this.userBloomFilter.has(walletAddress.toLowerCase());
    }

    async getUserEmailBloomFilter(email: string) {
        return this.userEmailBloomFilter.has(email.toLowerCase());
    }

    async createOrUpdateUser(request: {
        walletAddress: string;
        walletType: number;
        referralCode?: string;
        telegramId?: string;
        isTelegramPremium?: boolean;
        email?: string;
        name?: string;
        avatar?: string;
        hashedMnemonic?: string;
        isCreateWallet?: boolean;
        googleAccessToken?: string;
        googleRefreshToken?: string;
    }) {
        const {
            walletAddress,
            walletType,
            referralCode,
            telegramId,
            isTelegramPremium,
            email,
            name,
            avatar,
            hashedMnemonic,
            isCreateWallet,
            googleAccessToken,
            googleRefreshToken
        } = request;
        const normalizedWalletAddress = walletAddress.toLowerCase();

        try {
            const existingUser = await this.userRepository.findOne({ walletAddress: normalizedWalletAddress });

            if (!existingUser) {
                const userRefCode = generateRefCode();

                const user = await this.userRepository.create({
                    email: email,
                    walletAddress: normalizedWalletAddress,
                    walletType,
                    telegramId,
                    isTelegramPremium,
                    refCode: userRefCode,
                    refBy: referralCode,
                    refTime: referralCode ? new Date().getTime() : null,
                    loginTime: 1,
                    lastLoginDate: new Date(),
                    isCreateWallet,
                    name: name || `Default ${Math.random().toString(36).substring(2, 15)}`,
                    avatar,
                    googleAccessToken,
                    googleRefreshToken
                });

                if (email) {
                    this.userEmailBloomFilter.add(email.toLowerCase());
                }
                this.userBloomFilter.add(normalizedWalletAddress);

                if (referralCode) {
                    const isUpdated = await this.updateReferralCode({ userID: user._id.toString(), referralCode });


                    if (!isUpdated.result) {
                        console.error(`updateReferralCode error: ${userRefCode} ${referralCode}, ${isUpdated.error}`);
                    }


                }


                return user;
            }

            if (referralCode && referralCode !== existingUser.refCode && !existingUser.refBy) {
                const isUpdated = await this.updateReferralCode({ userID: existingUser._id.toString(), referralCode });
                if (!isUpdated.result) {
                    console.error(`updateReferralCode error: ${isUpdated.error}`);
                }
            }


            await this.userRepository.findOneAndUpdate(
                { walletAddress: normalizedWalletAddress },
                {
                    $inc: { loginTime: 1 },
                    $set: { lastLoginDate: new Date(), telegramId, isTelegramPremium }
                }
            );

            return existingUser;
        } catch (error) {
            throw new HttpException("createUser error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: error
            });
        }
    }

    private async updateReferralCode(request: { userID: string; referralCode: string }): Promise<{ result: boolean; data?: any; error?: any }> {
        const { userID, referralCode } = request;
        try {
            await Promise.all([
                this.userRepository.findOneAndUpdate({ _id: userID }, { $set: { refBy: referralCode, refTime: new Date().getTime() } }),
                this.userRepository.findOneAndUpdate({ refCode: referralCode }, { $inc: { refCount: 1 } })
            ]);

            return { result: true };
        } catch (error) {
            return {
                result: false,
                error
            };
        }
    }

    async getProfile(request: IAuthPayload) {
        try {
            const { id } = request;
            const user = await this.userRepository.findOne({ _id: id }, true, ["-googleAccessToken", "-googleRefreshToken"]);
            return {
                code: CodeResponseEnum.SUCCESS,
                data: {
                    user
                }
            };
        } catch (error) {
            console.error(error)
        }

    }

    async getUserTmaAvatar(userId: string) {
        try {
            const urlEndpoint = env.telegram.BOT_ENDPOINT;
            const response = await lastValueFrom(this.httpService.get<IResultPhotoUrl>(`${urlEndpoint}/get_user_photo?user_id=${userId}`));

            const url = response.data;

            if (url.photo_url) {
                return url.photo_url;
            }
        } catch (error) {
            console.error(`🚢 Error fetching user ${userId} photo: ${error.message}`);
            return null;
        }
    }

    async getListProfiles(ids: Types.ObjectId[]): Promise<User[]> {
        return await this.userRepository.findUserProfileWithIds(ids);
    }

    async findUserById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ _id: new Types.ObjectId(id) });
    }
}
