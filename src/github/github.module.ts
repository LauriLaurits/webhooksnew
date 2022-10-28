import { Module } from '@nestjs/common';
import { RecipientModule } from '../recipient/recipient.module';
import { TaskQueueModule } from '../task-queue/task-queue.module';
import { GithubController } from './github.controller';
import { GithubService } from './github.service';

@Module({
  imports: [RecipientModule, TaskQueueModule],
  controllers: [GithubController],
  providers: [GithubService],
})
export class GithubModule {}
