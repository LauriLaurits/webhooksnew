import { Body, Controller, Logger, Post } from '@nestjs/common';
import { QueueService } from '../task-queue/queue.service';
import { GithubPayloadDto } from '../dtos/github/github-payload.dto';
import { GithubService } from './github.service';

@Controller('github')
export class GithubController {
  private readonly logger = new Logger(this.constructor.name, { timestamp: true });

  constructor(
    private readonly githubService: GithubService,
    private readonly queueService: QueueService,
  ) {}
  @Post()
  async processPayload(@Body() payload: GithubPayloadDto) {
    this.logger.log('New Github Payload', payload);
    const tasks = await this.githubService.extractTasksFromPayload(payload);
    return this.queueService.addTask(tasks);
    //console.log(inspect(tasks, false, null, true));
  }
}
