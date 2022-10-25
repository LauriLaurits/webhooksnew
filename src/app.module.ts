import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskRunnerService } from './task-runner.service';
import { ScheduleModule } from '@nestjs/schedule';
import { BitbucketModule } from './bitbucket/bitbucket.module';

@Module({
  imports: [ScheduleModule.forRoot(), BitbucketModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
