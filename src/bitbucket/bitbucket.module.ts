import { Module } from '@nestjs/common';
import { RecipientModule } from '../recipient/recipient.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { BitbucketController } from './bitbucket.controller';
import { BitbucketService } from './bitbucket.service';

@Module({
  imports: [RecipientModule, TaskQueueModule],
  controllers: [BitbucketController],
  providers: [BitbucketService],
})
export class BitbucketModule {}
