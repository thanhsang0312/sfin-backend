import { MESSAGE_CODES } from "@common/constants";
import { LoginStepEnum, LoginTypeEnum } from "@common/enums/auth.enum";
import { CodeResponseEnum } from "@common/enums/code-response.enum";
import { Role } from "@common/enums/role.enum";
import { env } from "@environments";
import { GoogleService } from "@modules/google/google.service";
import { RedisService } from "@modules/redis/redis.service";
import { UserRepository, UserService } from "@modules/user";
import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { encrypt } from "@utils";
import { ethers } from "ethers";
import otpGenerator from "otp-generator";

@Injectable()
export class Web2AuthService {
    constructor(
        private readonly googleService: GoogleService,
        private readonly redisService: RedisService,
        private readonly userRepository: UserRepository,
        private readonly userService: UserService,
        // private readonly mailQueueService: MailQueueService
    ) { }

    async getLoginRequest(req: { type: LoginTypeEnum; data: any }, role: Role) {
        try {
            switch (req.type) {
                // case LoginTypeEnum.WEB2_EMAIL_OTP:
                //     try {
                //         return this.requestLoginEmailViaOtp(req.data.email);
                //     } catch (error) {
                //         throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, { cause: error });
                //     }
                case LoginTypeEnum.WEB2_GOOGLE_OAUTH2:
                    const authUrl = await this.googleService.getOauth2AuthorUrl(
                        {
                            walletAddress: req.data.walletAddress,
                            referralCode: req.data.referralCode
                        },
                        role
                    );

                    return {
                        code: CodeResponseEnum.SUCCESS,
                        data: {
                            nextStep: null,
                            requireDataFields: [],
                            data: {
                                authUrl
                            }
                        }
                    };
                default:
                    return {
                        code: CodeResponseEnum.ERROR,
                        message: MESSAGE_CODES.INVALID_LOGIN_TYPE
                    };
            }
        } catch (error) {
            throw new HttpException("evm getLoginRequest error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: error
            });
        }
    }

    async verifyLoginRequest(req: { type: LoginTypeEnum; data: any; role: Role }) {
        try {
            switch (req.type) {
                case LoginTypeEnum.WEB2_EMAIL_OTP:
                    return this.verifyLoginEmailViaOtp({
                        otp: req.data.otp,
                        email: req.data.email,
                        role: req.role
                    });
                case LoginTypeEnum.WEB2_GOOGLE_OAUTH2:
                    return this.verifyLoginOauth2(req.data, req.role);
                default:
                    return {
                        code: CodeResponseEnum.ERROR,
                        message: MESSAGE_CODES.INVALID_LOGIN_TYPE,
                        data: null
                    };
            }
        } catch (error) {
            throw new HttpException("evm verifyLoginRequest error", HttpStatus.INTERNAL_SERVER_ERROR, {
                cause: error
            });
        }
    }

    // private async requestLoginEmailViaOtp(email: string) {
    //     const otp = otpGenerator.generate(env.otp.LENGTH, { upperCaseAlphabets: false, specialChars: false, digits: true, lowerCaseAlphabets: false });
    //     await this.redisService.set(`mail:${email}:otp`, otp, { ttl: env.otp.LIFE });

    //     const emailData: OtpEmailData = {
    //         to: email,
    //         otp: otp
    //     };

    //     const isAdded = await this.mailQueueService.addToQueue(EmailType.OTP, emailData);

    //     if (!isAdded.result) {
    //         logger.error(`Failed to add email job to queue: ${isAdded.error}`);
    //         return {
    //             code: CodeResponseEnum.ERROR,
    //             message: MESSAGE_CODES.SEND_MAIL_ERROR
    //         };
    //     }

    //     return {
    //         code: CodeResponseEnum.SUCCESS,
    //         data: {
    //             nextStep: LoginStepEnum.VERIFY,
    //             requireDataFields: ["email", "otp"]
    //         }
    //     };
    // }

    async verifyLoginEmailViaOtp(request: { otp: string; email: string; role: Role }) {
        const normalizedEmail = request.email.toLowerCase();

        const cachedOtpData = await this.redisService.get(`mail:${normalizedEmail}:otp`);

        if (!cachedOtpData) {
            throw new BadRequestException(MESSAGE_CODES.OTP_INVALID);
        }

        if (Number(cachedOtpData) !== Number(request.otp)) {
            throw new BadRequestException(MESSAGE_CODES.OTP_INVALID);
        }

        this.redisService.del(`mail:${normalizedEmail}:otp`).catch((err) => console.error(`Failed to delete OTP: ${err.message}`));

        let user;

        const mayExistResult = await this.userService.getUserEmailBloomFilter(normalizedEmail);
        user = mayExistResult ? await this.userRepository.findOne({ email: normalizedEmail }) : null;


        let walletAddress = user?.walletAddress;
        let encryptedMnemonic = "";

        if (!walletAddress) {
            const result = await this.createUserInternalWallet(request.role);
            walletAddress = result.walletAddress;
            encryptedMnemonic = result.encryptedMnemonic;
        }

        return {
            code: CodeResponseEnum.SUCCESS,
            data: {
                walletAddress,
                walletType: 0,
                hashedMnemonic: encryptedMnemonic,
                email: normalizedEmail,
                name: "",
                avatar: "",
                isCreateWallet: true
            }
        };
    }

    private async createUserInternalWallet(role: Role): Promise<{ walletAddress: string; encryptedMnemonic: string }> {
        try {
            let attempts = 0;
            const maxAttempts = 3;
            let walletAddress: string;
            let encryptedMnemonic: string;
            let isWalletExists = true;

            while (isWalletExists && attempts < maxAttempts) {
                const wallet = ethers.Wallet.createRandom();
                const mnemonic = wallet.mnemonic?.phrase;

                if (!mnemonic) {
                    throw new HttpException("Failed to generate mnemonic", HttpStatus.INTERNAL_SERVER_ERROR);
                }

                encryptedMnemonic = encrypt(mnemonic, env.crypto.PRIVATE_KEY);
                walletAddress = wallet.address;

                const mayExist = await this.userService.getUserBloomFilter(walletAddress);
                if (!mayExist) {
                    isWalletExists = false;
                    break;
                } else {
                    attempts++;
                    console.warn(`Wallet address ${walletAddress} already exists. Attempt ${attempts}/${maxAttempts}`);
                }
            }

            if (isWalletExists) {
                throw new HttpException("Failed to create unique wallet after maximum attempts", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            return { walletAddress, encryptedMnemonic };
        } catch (error) {
            console.error(`Failed to create wallet: ${error.message}`);
            throw new HttpException("Failed to create wallet", HttpStatus.INTERNAL_SERVER_ERROR, { cause: error });
        }
    }

    async verifyLoginOauth2(
        data: { email: string; name: string; avatar: string; accessToken?: string; refreshToken?: string; preAuthData: { walletAddress?: string } },
        role: Role
    ) {
        const normalizedEmail = data.email?.toLowerCase();

        let encryptedMnemonic = null;
        let isCreateWallet = false;
        let walletAddress = null;
        let user;

        user = await this.userRepository.findOne({ email: normalizedEmail });

        if (user) {
            walletAddress = user.walletAddress;
        }

        if (!walletAddress) {
            const result = await this.createUserInternalWallet(role);
            walletAddress = result.walletAddress;
            encryptedMnemonic = result.encryptedMnemonic;
            isCreateWallet = true;
        }

        return {
            code: CodeResponseEnum.SUCCESS,
            data: {
                name: data.name,
                avatar: data.avatar,
                googleAccessToken: data.accessToken,
                googleRefreshToken: data.refreshToken,
                email: normalizedEmail,
                walletType: 0,
                walletAddress: walletAddress,
                hashedMnemonic: isCreateWallet ? encryptedMnemonic : null,
                isCreateWallet: true
            }
        };
    }

    async loginTelegram(data: { telegramId: string }) {
        let encryptedMnemonic = null;
        let isCreateWallet = false;
        let walletAddress = null;
        const user = await this.userRepository.findOne({ telegramId: data.telegramId });
        if (user) {
            walletAddress = user.walletAddress;
        }

        if (!walletAddress) {
            const result = await this.createUserInternalWallet(Role.USER);
            walletAddress = result.walletAddress;
            encryptedMnemonic = result.encryptedMnemonic;
            isCreateWallet = true;
        }

        return {
            walletType: 0,
            walletAddress: walletAddress,
            hashedMnemonic: isCreateWallet ? encryptedMnemonic : null,
            isCreateWallet: true
        };
    }
}
