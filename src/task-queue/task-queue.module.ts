import { Module } from '@nestjs/common';
import { ProtoModule } from '../proto/proto.module';
import { QueueService } from './queue.service';

@Module({
  imports: [ProtoModule],
  controllers: [],
  providers: [QueueService],
  exports: [QueueService],
})
export class TaskQueueModule {}
