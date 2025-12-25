import { Module } from '@nestjs/common';
import { GmailService } from './gmail.service';
import { GmailController } from './gmail.controller';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '@modules/user';
import { Gmail, GmailSchema } from './schemas';
import { MongooseModule } from '@nestjs/mongoose';
import { GmailRepository } from './repositories/gmail.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gmail.name, schema: GmailSchema }]),
    HttpModule,
    UserModule
  ],
  providers: [GmailService, GmailRepository],
  controllers: [GmailController],
  exports: [GmailService, GmailRepository]
})
export class GmailModule { }
