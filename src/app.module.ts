import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@modules/auth/auth.module';
import { GoogleModule } from '@modules/google/google.module';
import { RedisModule } from '@modules/redis/redis.module';
import { UserModule } from '@modules/user';
import { Web2AuthModule } from '@modules/web2-auth';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from '@common/configs';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { GmailModule } from '@modules/gmail/gmail.module';
import { CategoryModule } from '@modules/category/category.module';
import { BalanceModule } from '@modules/balance/balance.module';
import { TransactionModule } from '@modules/transaction/transaction.module';

@Module({
  imports: [
    AuthModule,
    GoogleModule,
    RedisModule,
    UserModule,
    Web2AuthModule,
    HttpModule,
    GmailModule,
    BalanceModule,
    CategoryModule,
    TransactionModule,
    MongooseModule.forRootAsync({ useClass: MongooseConfigService }),
    JwtModule.register({
      global: true
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
