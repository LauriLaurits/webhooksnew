import { Module } from '@nestjs/common';
import { ProtoTaskRunnerService } from './proto.service';

@Module({
  imports: [],
  controllers: [],
  providers: [ProtoTaskRunnerService],
  exports: [ProtoTaskRunnerService],
})
export class ProtoModule {}
