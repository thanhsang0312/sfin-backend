import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { UserModule } from '@modules/user';

@Module({
  imports: [UserModule],
  providers: [TransactionService],
  controllers: [TransactionController],
  exports: []
})
export class TransactionModule {}
