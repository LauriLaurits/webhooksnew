// import { Injectable, Logger } from '@nestjs/common';
// import { Cron } from '@nestjs/schedule';
// import {
//   ChildProcessWithoutNullStreams,
//   spawn,
//   SpawnOptionsWithoutStdio,
// } from 'child_process';
// import { existsSync, mkdtempSync, rmSync } from 'fs';
// import { DateTime } from 'luxon';
// import { tmpdir } from 'os';
// import { join } from 'path';
// import { RunConfiguration } from './run-configuration.interface';
// import { createTransport } from 'nodemailer';

export interface ExecutionResult {
  code: number;
  stdout: string;
  stderr: string;
}

import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { mkdtemp, mkdtempSync, rm, rmdir } from 'fs';
import { workerData } from 'worker_threads';
import { TaskDto } from '../dtos/task-queue/task.dto';
import { tmpdir } from 'os';
import { join, sep } from 'path';

@Injectable()
export class ProtoTaskRunnerService {
  private readonly logger = new Logger(this.constructor.name);
  //   private readonly queue: RunConfiguration[] = [];
  //   private lastTaskStartedAt: DateTime = null;
  //   private runningProcess: ChildProcessWithoutNullStreams;
  //
  //   constructor() {
  //     this.logger.log('TaskRunner initialized');
  //   }
  //
  //   addTask(configuration: RunConfiguration): number {
  //     return this.queue.push(configuration);
  //   }
  //
  //   private async runTask(runConfiguration: RunConfiguration) {
  //     this.lastTaskStartedAt = DateTime.now();
  //     this.logger.log(`Running task ${JSON.stringify(runConfiguration)}`);
  //     let tmpDir;
  //     let cloneResult: ExecutionResult = null;
  //     let buildResult: ExecutionResult = null;
  //     let evaluationResult: ExecutionResult = null;
  //     let dockerCleanupResult: ExecutionResult = null;
  //
  //     try {
  //       tmpDir = mkdtempSync(join(tmpdir(), 'aoc-'));
  //       this.logger.verbose(`Created tmp directory ${tmpDir}`);
  //       cloneResult = await this.cloneRepository(runConfiguration, tmpDir);
  //       buildResult = await this.dockerBuild(tmpDir);
  //       evaluationResult = await this.dockerRun();
  //       dockerCleanupResult = await this.dockerCleanup();
  //       console.log(cloneResult);
  //       console.log(buildResult);
  //       console.log(evaluationResult);
  //       console.log(dockerCleanupResult);
  //     } catch (e) {
  //       this.logger.error(e);
  //     } finally {
  //       this.sendReport(runConfiguration, {
  //         cloneResult,
  //         buildResult,
  //         evaluationResult,
  //         dockerCleanupResult,
  //       });
  //
  //       if (existsSync(tmpDir)) {
  //         rmSync(tmpDir, {
  //           recursive: true,
  //         });
  //         this.logger.verbose(`Cleaned up tmp directory ${tmpDir}`);
  //         this.lastTaskStartedAt = null;
  //       }
  //     }
  //   }
  //

  //   private async dockerBuild(tmpDir: string) {
  //     return this.runCmd('docker', ['build', '-t', 'solution', '.'], {
  //       cwd: tmpDir,
  //     });
  //   }
  //
  //   private async dockerRun() {
  //     return this.runCmd('docker', ['run', '--rm', 'solution']);
  //   }
  //
  //   private async dockerCleanup() {
  //     return this.runCmd('bash', ['docker-cleanup.sh'], {
  //       cwd: process.cwd(),
  //     });
  //   }
  //
  //   private async sendReport(
  //     runConfiguration: RunConfiguration,
  //     reports: {
  //       buildResult: ExecutionResult;
  //       dockerCleanupResult: ExecutionResult;
  //       cloneResult: ExecutionResult;
  //       evaluationResult: ExecutionResult;
  //     },
  //   ) {
  //     const transport = createTransport({
  //       service: 'gmail',
  //       host: 'smtp.gmail.com',
  //       requireTLS: true,
  //       ignoreTLS: true,
  //       auth: {
  //         user: process.env.GMAIL_USER,
  //         pass: process.env.GMAIL_PASS,
  //       },
  //     });
  //     const result = await transport.sendMail({
  //       from: 'advent.of.code.2021@gmail.com',
  //       to: runConfiguration.reportToAddress,
  //       bcc: process.env.REPORT_BCC,
  //       subject: 'AOC2021 Results',
  //       text: this.composeMailBody(reports),
  //     });
  //     this.logger.log('e-mail send results', result);
  //   }
  //
  //   private composeMailBody(reports: {
  //     cloneResult: ExecutionResult;
  //     buildResult: ExecutionResult;
  //     evaluationResult: ExecutionResult;
  //     dockerCleanupResult: ExecutionResult;
  //   }) {
  //     let message = '';
  //     if (reports.cloneResult) {
  //       message += `Stage clone status ${reports.cloneResult.code}`;
  //       message += this.getMessagePart(reports.cloneResult);
  //     }
  //     if (reports.buildResult) {
  //       message += `Stage build status ${reports.buildResult.code}`;
  //       message += this.getMessagePart(reports.buildResult);
  //     }
  //     if (reports.evaluationResult) {
  //       message += `Stage evaluate status ${reports.evaluationResult.code}`;
  //       message += this.getMessagePart(reports.evaluationResult);
  //     }
  //     // if (reports.dockerCleanupResult) {
  //     //   message += `Stage cleanup status ${reports.dockerCleanupResult.code}`;
  //     //   message += this.getMessagePart(reports.dockerCleanupResult);
  //     // }
  //     return message;
  //   }
  //
  //   // noinspection JSMethodCanBeStatic
  //   private getMessagePart(result: ExecutionResult) {
  //     let message = '\n';
  //     message += 'stdout:\n' + result.stdout;
  //     message += 'stderr:\n' + result.stderr;
  //     message += '\n';
  //     return message;
  //   }
  async runTask(task: TaskDto) {
    let workDir;

    try {
      workDir = await this.createWorkdir();
      const cloneResult = await this.cloneRepository(task.repository, task.branch, workDir);
      console.log('CloneResult', cloneResult);
    } catch (e) {
    } finally {
      await this.cleanupWorkdir(workDir);
    }
  }

  private async cloneRepository(repository: string, branch: string, dir: string) {
    console.log({
      repository,
      branch,
      dir,
    });
    return this.runCmd('git', ['clone', repository, '-b', branch, '--single-branch', dir]);
  }

  private async runCmd(cmd: string, args: string[]): Promise<ExecutionResult> {
    return new Promise((resolve, reject) => {
      const cp = spawn(cmd, args);
      const timeout = setTimeout(() => {
        this.logger.log('Killing child process');
        cp.kill('SIGKILL');
      }, 1000 * 1000);
      let stdout = '';
      cp.stdout.on('data', (data) => (stdout += data.toString()));

      let stderr = '';
      cp.stderr.on('data', (data) => (stderr += data.toString()));
      cp.on('close', (code) => {
        clearTimeout(timeout);
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

  private createWorkdir(): Promise<string> {
    return new Promise((resolve, reject) => {
      const tmpDir = tmpdir();
      mkdtemp(`${tmpDir}${sep}`, (err, directory) => {
        if (err) {
          return reject(err);
        }
        this.logger.log(`Created working directory "${directory}"`);
        return resolve(directory);
      });
    });
  }

  private cleanupWorkdir(workDir: string | undefined): Promise<void> {
    if (!workDir) {
      return;
    }
    return new Promise((resolve, reject) => {
      return rm(
        workDir,
        {
          recursive: true,
          force: true,
        },
        (err) => {
          if (err) {
            this.logger.error(`Cleanup failed "${workDir}"`);
            return reject(err);
          }
          this.logger.log(`Cleaned up directory "${workDir}"`);
          return resolve();
        },
      );
    });
  }
}
