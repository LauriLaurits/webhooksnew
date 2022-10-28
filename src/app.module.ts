import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BitbucketModule } from './bitbucket/bitbucket.module';
import { GithubModule } from './github/github.module';

@Module({
  imports: [ScheduleModule.forRoot(), BitbucketModule, GithubModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
