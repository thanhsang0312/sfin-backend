import { forwardRef, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RedisModule } from "@modules/redis/redis.module";
import { UserModule } from "@modules/user";
import { Web2AuthModule } from "@modules/web2-auth";
import { GoogleModule } from "@modules/google/google.module";

@Module({
    imports: [
        JwtModule.register({
            global: true
        }),
        RedisModule,
        UserModule,
        GoogleModule,
        forwardRef(() => Web2AuthModule)
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule {}
