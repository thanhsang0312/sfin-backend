import { ApiResponseProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";
import { IUser } from "../interfaces";

@Exclude()
export class UserReponseDto implements IUser {
    @ApiResponseProperty()
    @Exclude()
    userName: string;

    @ApiResponseProperty()
    @Exclude()
    avatar: string;

    @ApiResponseProperty()
    @Exclude()
    email: string;

    @ApiResponseProperty()
    @Exclude()
    lastLoginDate: Date;
}
