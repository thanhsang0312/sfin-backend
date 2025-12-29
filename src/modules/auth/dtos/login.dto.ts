import { ApiProperty, ApiPropertyOptional, IntersectionType, PartialType } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsObject, IsOptional, IsString } from "class-validator";
import { UserExternalProfileDto } from "./auth.dto";
import { Role } from "@common/enums/role.enum";
import { LoginProviderEnum, LoginStepEnum, LoginTypeEnum } from "@common/enums/auth.enum";

export class LoginRequest_DataDto extends PartialType(IntersectionType(UserExternalProfileDto)) {
    @IsOptional()
    @IsString()
    walletAddress?: string;

    @IsOptional()
    @IsString()
    signature?: string;

    @IsOptional()
    @IsString()
    otp?: string;

    @IsOptional()
    @IsObject()
    walletInfo?: object;

    @IsOptional()
    @IsObject()
    tonProof?: object;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsString()
    idToken?: string;

    @IsOptional()
    @IsString()
    appPubKey?: string;
}

export class LoginRequestDto {
    @ApiProperty({
        enum: LoginProviderEnum,
        example: LoginProviderEnum.WEB2
    })
    @IsEnum(LoginProviderEnum)
    provider: LoginProviderEnum;

    @ApiProperty({
        enum: LoginStepEnum,
        example: LoginStepEnum.REQUEST
    })
    @IsEnum(LoginStepEnum)
    step: LoginStepEnum;

    @ApiProperty({
        enum: LoginTypeEnum,
        example: LoginTypeEnum.WEB2_GOOGLE_OAUTH2
    })
    @IsEnum(LoginTypeEnum)
    type: LoginTypeEnum;
    @IsOptional()
    @IsObject()
    @Type(() => LoginRequest_DataDto)
    data: LoginRequest_DataDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    referralCode?: string;
}
