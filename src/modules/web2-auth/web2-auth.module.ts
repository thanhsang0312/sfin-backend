import { UserModule } from "@modules/user";
import { Module } from "@nestjs/common";
import { Web2AuthService } from "./web2-auth.service";
import { RedisModule } from "@modules/redis/redis.module";
import { GoogleModule } from "@modules/google/google.module";

@Module({
    imports: [GoogleModule, RedisModule, UserModule],
    providers: [Web2AuthService],
    exports: [Web2AuthService]
})
export class Web2AuthModule {}
