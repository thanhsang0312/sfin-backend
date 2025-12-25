import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserRepository } from "./repositories/user.repository";
import { User, UserSchema } from "./schemas/user.schema";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { RedisModule } from "@modules/redis/redis.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        RedisModule,
        HttpModule
    ],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository],
    controllers: [UserController]
})
export class UserModule {}
