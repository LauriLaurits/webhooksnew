import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DateTime } from 'luxon';
import { UnitOfWorkDto } from './dtos/unit-of-work.dto';
import { ChildProcessWithoutNullStreams, spawn, SpawnOptionsWithoutStdio } from 'child_process';
import { ExecutionResultDto } from './dtos/execution-result.dto';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

@Injectable()
export class TaskRunnerService {
  private readonly logger = new Logger(this.constructor.name, {
    timestamp: true,
  });
  private readonly queue: UnitOfWorkDto[] = [];
  private lastTaskStartedAt: DateTime = null;
  private runningProcess: ChildProcessWithoutNullStreams;

  constructor() {
    this.logger.verbose('TaskRunner initialized');
  }

  addTaskQueue(unitOfWork: UnitOfWorkDto): number {
    this.logger.verbose(`Added task to queue with configuration: ${JSON.stringify(unitOfWork)}`);
    return this.queue.push(unitOfWork);
  }

  @Cron('*/1 * * * * *') // for testing
  async handleCron() {
    if (this.queue.length === 0) {
      return;
    }

    if (this.lastTaskStartedAt !== null) {
      this.logger.verbose(
        `Task already in progress. Can't run another ${this.lastTaskStartedAt.toISO()} . Queue length:  ${
          this.queue.length
        }`,
      );
      return;
    }

    if (this.queue.length !== 0) {
      await this.runTask(this.queue.shift());
    }
  }

  private async runTask(unitOfWork: UnitOfWorkDto) {
    this.lastTaskStartedAt = DateTime.now();
    this.logger.verbose(`Started to run task with configuration: ${JSON.stringify(unitOfWork)}`);

    let tmpDir;
    let cloneResult: ExecutionResultDto = null;
    let switchBranch: ExecutionResultDto = null;
    let buildConfig;
    //TODO checks if /build-config.js is there if not clean tmpDir

    console.log('RunConf', unitOfWork);

    try {
      tmpDir = await this.makeTemporaryDirectory();
      cloneResult = await this.cloneRepository(unitOfWork, tmpDir);
      switchBranch = await this.checkoutBranch(unitOfWork, tmpDir);
      buildConfig = await this.getBuildConfig(tmpDir);
      console.log(buildConfig);
      if (buildConfig.branchesToFollow) {
        this.logger.verbose(`Going to build`);
      } else {
        this.logger.verbose(`Not going to build deleting tmpDir: ${tmpDir}`);
        rmSync(tmpDir, { recursive: true });
        // this.lastTaskStartedAt = null;
      }
      //TODO

      //TODO execute build commands
      console.log('BuildConfig clientName: ' + buildConfig.clientName);
      console.log('BuildConfig projectName: ' + buildConfig.projectName);
      console.log('BuildConfig BuildDirectory: ' + buildConfig.buildDirectory);
      console.log('BuildConfig NpmBuildCommand: ' + buildConfig.npmBuildCommand);
      console.log('BuildConfig branchesToFollow: ' + buildConfig.branchesToFollow);
      console.log(`Clone result: ${JSON.stringify(cloneResult)}`);
      console.log(`Switched to : ${JSON.stringify(switchBranch)}`);
    } catch (e) {
      this.logger.error(e);
    }

    //TODO Delete tempDir

    // Delete tmp directory after use
    /*  Import existsSync, rmSync
     if (existsSync(tmpDir)) {
      rmSync(tmpDir, {
        recursive: true,
      });
      this.logger.verbose(`Deleted tmp directory ${tmpDir}`);
      this.lastTaskStartedAt = null;
    }*/
  }

  // Helper Functions

  private async runCmd(
    cmd: string,
    args: string[],
    options: SpawnOptionsWithoutStdio = {},
  ): Promise<ExecutionResultDto> {
    return new Promise((resolve, reject) => {
      this.runningProcess = spawn(cmd, args, options);
      let stdout = '';
      this.runningProcess.stdout.on('data', (data) => (stdout += data.toString()));

      let stderr = '';
      this.runningProcess.stderr.on('data', (data) => (stderr += data.toString()));
      this.runningProcess.on('exit', (code) => {
        if (code !== 0) {
          return reject({
            stdout,
            stderr,
            code,
          });
        }
        resolve({
          stdout,
          stderr,
          code,
        });
      });
    });
  }

  private async makeTemporaryDirectory() {
    try {
      const tmpDir = mkdtempSync(join(tmpdir(), 'tempDir-'));
      this.logger.verbose(`Creating tempDir: ${tmpDir}`);
      return tmpDir;
    } catch (e) {
      this.logger.error(`Failed to create tmpDir. Error: ${e}`);
    }
  }

  private async cloneRepository(unitOfWork: UnitOfWorkDto, tmpDir: string) {
    this.logger.verbose(`Cloned from URL:  ${unitOfWork.sshUrl}`);
    return this.runCmd('git', ['clone', unitOfWork.sshUrl, tmpDir]);
  }

  private async checkoutBranch(unitOfWork: UnitOfWorkDto, tmpDir: string) {
    this.logger.verbose(`Switched to branch: ${unitOfWork.branchName}`);
    return this.runCmd('git', ['checkout', unitOfWork.branchName], {
      cwd: tmpDir,
    });
  }
  private async getBuildConfig(tmpDir: string) {
    const buildConfig = tmpDir + '/build-config.js';
    const exist = existsSync(buildConfig);
    if (exist) {
      return require(buildConfig);
    }
    this.logger.error(`build-config missing`);
  }
}
