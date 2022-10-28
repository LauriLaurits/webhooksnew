import { Body, Controller, Logger, Post } from '@nestjs/common';
import { inspect } from 'util';
import { QueueService } from '../task-queue/queue.service';
import { BitbucketPayloadDto } from '../dtos/bitbucket/bitbucket-payload.dto';
import { BitbucketService } from './bitbucket.service';

@Controller('bitbucket')
export class BitbucketController {
  private readonly logger = new Logger(this.constructor.name, { timestamp: true });

  constructor(
    private readonly bitbucketService: BitbucketService,
    private readonly queueService: QueueService,
  ) {}

  @Post()
  async processPayload(@Body() payload: BitbucketPayloadDto) {
    this.logger.log('New payload', payload);
    const tasks = await this.bitbucketService.extractTasksFromPayload(payload);
    tasks.map((task) => this.queueService.addTask(task));
    //console.log(inspect(tasks, false, null, true));
  }
}
