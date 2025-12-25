import { MESSAGE_CODES } from "@common/constants";
import { CodeResponseEnum } from "@common/enums/code-response.enum";
import { ApiResponseProperty } from "@nestjs/swagger";

export class ResponseType<T = any> {
    @ApiResponseProperty({ example: CodeResponseEnum.SUCCESS })
    code: number;

    @ApiResponseProperty({ example: MESSAGE_CODES.SUCCESS })
    message?: string | null;

    @ApiResponseProperty()
    data?: T | null;

    constructor(partial: Partial<ResponseType<T>>) {
        Object.assign(this, partial);
    }
}
