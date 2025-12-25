import { MESSAGE_CODES } from "@common/constants";
import { ResponseType } from "@common/dtos";
import { env } from "@environments";
import { UserRepository, UserService } from "@modules/user";
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { LoginRequestDto, UserExternalProfileDto } from "./dtos";
import { IAuthPayload, ITeleAuthPayload } from "./interfaces";
import { LoginProviderEnum, LoginStepEnum, LoginTypeEnum } from "@common/enums/auth.enum";
import { RedisService } from "@modules/redis/redis.service";
import { Web2AuthService } from "@modules/web2-auth";
import { Role } from "@common/enums/role.enum";
import { CodeResponseEnum } from "@common/enums/code-response.enum";
import { Types } from "mongoose";
import { GoogleService } from "@modules/google/google.service";
@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly userRepository: UserRepository,
        private readonly redisService: RedisService,
        private readonly googleService: GoogleService,
        @Inject(forwardRef(() => Web2AuthService)) private readonly web2AuthService: Web2AuthService,
    ) { }
    // async telegramLogin(payload: ITeleAuthPayload): Promise<ResponseType> {
    //     const userId = payload.userId;
    //     let name = payload?.firstName || "";
    //     if (payload?.lastName) {
    //         name = `${payload.firstName} ${payload.lastName}`;
    //     }
    //     const isTelegramPremium = payload.isPremium ? true : false;

    //     try {
    //         const avatarUrl = payload.photoUrl || (await this.userService.getUserTmaAvatar(userId));
    //         const walletData = await this.web2AuthService.loginTelegram({ telegramId: userId });
    //         const userData = {
    //             ...walletData,
    //             telegramId: userId,
    //             name,
    //             avatar: avatarUrl,
    //             isTelegramPremium
    //         };
    //         const user = await this.userService.createOrUpdateUser(userData);

    //         const sessionId = this.generateSessionId(user._id.toString(), Role.USER);
    //         const accessToken = this.generateAccessToken({
    //             walletAddress: walletData.walletAddress,
    //             id: user._id.toString(),
    //             telegramId: userId,
    //             name,
    //             avatar: avatarUrl,
    //             sessionId,
    //             role: Role.USER
    //         });

    //         return {
    //             code: CodeResponseEnum.SUCCESS,
    //             data: {
    //                 accessToken
    //             }
    //         };
    //     } catch (error) {
    //         throw new HttpException("telegramLogin error", HttpStatus.INTERNAL_SERVER_ERROR, {
    //             cause: error
    //         });
    //     }
    // }
    async login(loginRequestDto: LoginRequestDto, role: Role): Promise<ResponseType> {
        const { provider, step, type, data, referralCode } = loginRequestDto;

        switch (provider) {
            case LoginProviderEnum.WEB2:
                switch (step) {
                    case LoginStepEnum.REQUEST: {
                        const getWeb2LoginRequest = await this.web2AuthService.getLoginRequest(
                            {
                                data: {
                                    ...data,
                                    referralCode
                                },
                                type
                            },
                            role
                        );
                        if (getWeb2LoginRequest.code !== CodeResponseEnum.SUCCESS) {
                            return getWeb2LoginRequest;
                        }

                        return {
                            code: CodeResponseEnum.SUCCESS,
                            data: {
                                provider: LoginProviderEnum.WEB2,
                                nextStep: getWeb2LoginRequest.data.nextStep,
                                data: getWeb2LoginRequest.data || null
                            }
                        };
                    }
                    case LoginStepEnum.VERIFY: {
                        const getWeb2LoginVerify = await this.web2AuthService.verifyLoginRequest({ data, type, role });

                        if (getWeb2LoginVerify.code !== CodeResponseEnum.SUCCESS) {
                            return getWeb2LoginVerify;
                        }
                        let user;

                        user = await this.userService.createOrUpdateUser({
                            ...getWeb2LoginVerify.data,
                            referralCode: referralCode
                        });

                        const sessionId = this.generateSessionId(user._id.toString(), role);
                        const accessToken = this.generateAccessToken({
                            walletAddress: getWeb2LoginVerify.data.walletAddress,
                            id: user._id.toString(),
                            role,
                            name: user.name,
                            avatar: user.avatar,
                            sessionId,
                            status: user.status
                        });

                        return {
                            code: CodeResponseEnum.SUCCESS,
                            data: {
                                accessToken
                            }
                        };
                    }
                    default: {
                        return {
                            code: CodeResponseEnum.ERROR,
                            message: MESSAGE_CODES.INVALID_STEP
                        };
                    }
                }
            // case LoginProviderEnum.WEB3:
            //     switch (step) {
            //         case LoginStepEnum.REQUEST:
            //             const getWeb3LoginRequest = await this.web3AuthService.getLoginRequest({ data, type });
            //             if (getWeb3LoginRequest.code !== CodeResponseEnum.SUCCESS) {
            //                 return getWeb3LoginRequest;
            //             }

            //             return {
            //                 code: CodeResponseEnum.SUCCESS,
            //                 data: {
            //                     provider: LoginProviderEnum.WEB3,
            //                     nextStep: LoginStepEnum.VERIFY,
            //                     data: getWeb3LoginRequest.data || null
            //                 }
            //             };
            //         case LoginStepEnum.VERIFY:
            //             const getWeb3LoginVerify = await this.web3AuthService.verifyLoginRequest({ data, type });

            //             if (getWeb3LoginVerify.code !== CodeResponseEnum.SUCCESS) {
            //                 return getWeb3LoginVerify;
            //             }
            //             let user;
            //             if (role === Role.PUBLISHER) {
            //                 user = await this.publisherService.createPublisher({
            //                     ...data,
            //                     walletAddress: data.walletAddress,
            //                     walletType: type,
            //                     isCreateWallet: true
            //                 });
            //             } else {
            //                 user = await this.userService.createOrUpdateUser({
            //                     walletAddress: data.walletAddress,
            //                     walletType: type,
            //                     referralCode: referralCode,
            //                     email: data.email,
            //                     name: data.name,
            //                     avatar: data.avatar,
            //                     isCreateWallet: true
            //                 });
            //             }
            //             const sessionId = this.generateSessionId(user._id.toString(), role);

            //             const accessToken = this.generateAccessToken({
            //                 walletAddress: data.walletAddress,
            //                 id: user._id.toString(),
            //                 role,
            //                 name: user.name,
            //                 avatar: user.avatar,
            //                 sessionId,
            //                 status: user.status
            //             });

            //             return {
            //                 code: CodeResponseEnum.SUCCESS,
            //                 data: {
            //                     accessToken
            //                 }
            //             };
            //         default:
            //             return {
            //                 code: CodeResponseEnum.ERROR,
            //                 message: MESSAGE_CODES.INVALID_STEP
            //             };
            //     }
            // case LoginProviderEnum.KEYLESS:
            //     switch (step) {
            //         case LoginStepEnum.VERIFY:
            //             const getKeylessLoginRequest = await this.keylessAuthService.verifyKeylessAuth({ data, type });
            //             if (getKeylessLoginRequest.code !== CodeResponseEnum.SUCCESS) {
            //                 return getKeylessLoginRequest;
            //             }
            //             let user;
            //             if (role === Role.PUBLISHER) {
            //                 user = await this.publisherService.createPublisher({
            //                     ...data,
            //                     walletAddress: data.walletAddress,
            //                     walletType: 0,
            //                     isCreateWallet: true
            //                 });
            //             } else {
            //                 user = await this.userService.createOrUpdateUser({
            //                     walletAddress: getKeylessLoginRequest.data.wallets[0].public_key,
            //                     walletType: 0,
            //                     referralCode: referralCode,
            //                     email: getKeylessLoginRequest.data?.email,
            //                     name: getKeylessLoginRequest.data?.name,
            //                     avatar: getKeylessLoginRequest.data?.profileImage,
            //                     isCreateWallet: false
            //                 });
            //             }
            //             const sessionId = this.generateSessionId(user._id.toString(), role);

            //             const accessToken = this.generateAccessToken({
            //                 walletAddress: user.walletAddress,
            //                 id: user._id.toString(),
            //                 role,
            //                 name: user.name,
            //                 avatar: user.avatar,
            //                 sessionId,
            //                 status: user.status
            //             });

            //             return {
            //                 code: CodeResponseEnum.SUCCESS,
            //                 data: {
            //                     accessToken
            //                 }
            //             };
            //     }
            //     break;
            default:
                return {
                    code: CodeResponseEnum.ERROR,
                    message: MESSAGE_CODES.INVALID_PROVIDER
                };
        }
    }

    async handleGoogleCallback(user: UserExternalProfileDto, res: Response, role: Role) {
        try {
            const loginData = {
                provider: LoginProviderEnum.WEB2,
                data: user,
                step: LoginStepEnum.VERIFY,
                type: LoginTypeEnum.WEB2_GOOGLE_OAUTH2,
                referralCode: user.preAuthData?.referralCode || null
            };

            const loginResponse = await this.login(loginData, role);

            const redirectUrl =
                loginResponse.code === CodeResponseEnum.SUCCESS
                    ? `${env.CLIENT_URL}?login_oauth2=true&token=${loginResponse.data.accessToken}`
                    : `${env.CLIENT_URL}?login_oauth2=false&error=${loginResponse.message}`;

            return res.redirect(redirectUrl);
        } catch (error) {
            // logger.error(`Error handle Google callback: ${error.message}`, { error });
            return res.redirect(`${env.CLIENT_URL}?login_oauth2=false&error=server_error`);
        }
    }

    async refreshAccessToken(request: IAuthPayload) {
        const { id } = request;

        // 1. Lấy refresh token
        const user = await this.userRepository.findOne({ _id: new Types.ObjectId(id) });

        if (!user?.googleRefreshToken) {
            throw new Error("Google refresh token not found");
        }

        const { access_token, expires_in } =
            await this.googleService.refreshAccessToken(
                user.googleRefreshToken,
                Role.USER
            );

        await this.userRepository.updateOne(
            { _id: id },
            {
                googleAccessToken: access_token,
                googleAccessTokenExpiresAt: Date.now() + expires_in * 1000,
            }
        );

        return {
            code: CodeResponseEnum.SUCCESS,
            data: {
                accessToken: access_token,
                expiresIn: expires_in,
            },
        };
    }

    private generateAccessToken(payload: IAuthPayload) {
        try {
            const { SECRET, EXPIRES_IN } = env.jwt.access;

            return this.jwtService.sign(payload, {
                secret: SECRET,
                expiresIn: `${Number(EXPIRES_IN)}s`
            })

            // return this.jwtService.sign(payload, {
            //     secret: SECRET,
            //     expiresIn: `${EXPIRES_IN}s`
            // });
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR, { cause: error });
        }
    }

    private generateSessionId(userId: string, role: Role) {
        const sessionId = uuidv4();
        const now = Date.now();
        const ttl = 60 * 60; // 1 hours in seconds

        const sessionsKey = role === Role.USER ? `user:${userId}:sessions` : `publisher:${userId}:sessions`;
        // this.saveSessionToRedis(sessionsKey, sessionId, now, ttl).catch((error) => {
        //     logger.error(`Error save session to Redis: ${error.message}`, {
        //         userId,
        //         sessionId,
        //         error
        //     });
        // });

        return sessionId;
    }

    private async saveSessionToRedis(userSessionsKey: string, sessionId: string, timestamp: number, ttl: number): Promise<void> {
        const pipeline = this.redisService.pipeline();

        pipeline.zadd(userSessionsKey, timestamp, sessionId);

        pipeline.expire(userSessionsKey, ttl);

        await pipeline.exec();
    }

    protected async validateSession(userId: string, sessionId: string, role: Role): Promise<boolean> {
        const userSessionsKey = `user:${userId}:sessions`;
        const publisherSessionsKey = `publisher:${userId}:sessions`;
        let score;
        if (role === Role.PUBLISHER) {
            score = await this.redisService.zScore(publisherSessionsKey, sessionId);
        } else {
            score = await this.redisService.zScore(userSessionsKey, sessionId);
        }
        return score !== null;
    }

    async logoutSession(userId: string, sessionId: string, role: Role): Promise<ResponseType> {
        const userSessionsKey = `user:${userId}:sessions`;
        const publisherSessionsKey = `publisher:${userId}:sessions`;
        if (role === Role.PUBLISHER) {
            await this.redisService.zRem(publisherSessionsKey, sessionId);
        } else {
            await this.redisService.zRem(userSessionsKey, sessionId);
        }

        return {
            code: CodeResponseEnum.SUCCESS
        };
    }
}
