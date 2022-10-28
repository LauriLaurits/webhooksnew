import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ChildProcessWithoutNullStreams } from 'child_process';
import { DateTime } from 'luxon';
import { ProtoTaskRunnerService } from '../proto/proto.service';
import { Task } from '../task';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(this.constructor.name, { timestamp: true });
  private readonly queue: Task[] = [];
  private lastTaskStartedAt: DateTime = null;
  private runningProcess: ChildProcessWithoutNullStreams;

  constructor(private readonly protoTaskRunnerService: ProtoTaskRunnerService) {}

  @Cron('* * * * * *')
  async handleSchedule() {
    if (this.queue.length === 0) {
      // this.logger.debug('Nothing to do');
      return;
    }

    this.lastTaskStartedAt = DateTime.now();
    const task = this.queue.shift();
    await this.protoTaskRunnerService.runTask(task);
    // if (this.lastTaskStartedAt !== null) {
    //   this.logger.debug(
    //     `Cannot run another task ${this.lastTaskStartedAt.toISO()} ${
    //       this.queue.length
    //     }`,
    //   );
    //   return;
    // }
    // if (this.queue.length !== 0) {
    //   await this.runTask(this.queue.shift());
    // }
  }

  addTask(task: Task) {
    this.queue.push(task);
  }
}
