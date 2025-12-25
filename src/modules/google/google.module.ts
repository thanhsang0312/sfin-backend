import { forwardRef, Module } from "@nestjs/common";
import { GoogleService } from "./google.service";
import { RedisModule } from "@modules/redis/redis.module";
import { GoogleOauth2Strategy } from "./strategies";

@Module({
    imports: [
      forwardRef(() => RedisModule)
    ],
    providers: [GoogleService, GoogleOauth2Strategy],
    exports: [GoogleService]
})
export class GoogleModule {}
