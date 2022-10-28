import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';
import { existsSync, mkdtemp, rm } from 'fs';
import { Task } from '../task';
import { tmpdir } from 'os';
import { sep } from 'path';
import { ExecutionResultInterface } from '../execution-result.interface';

@Injectable()
export class ProtoTaskRunnerService {
  private readonly logger = new Logger(this.constructor.name);

  async runTask(task: Task) {
    let workDir;

    try {
      workDir = await this.createWorkdir();
      const cloneResult = await this.cloneRepository(task.repository, task.branch, workDir);
      const buildConfig = await this.getBuildConfig(workDir);
      console.log('BuildConfig', buildConfig);
      console.log('CloneResult', cloneResult);
    } catch (e) {
    } finally {
      console.log('Finished');
      //TODO delete user temp Dir
      //await this.cleanupWorkdir(workDir);
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

  private async runCmd(cmd: string, args: string[]): Promise<ExecutionResultInterface> {
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

  private async getBuildConfig(workDir: string) {
    const buildConfig = workDir + '/build-config.js';
    const exist = existsSync(buildConfig);
    if (exist) {
      console.log('WorkDir', workDir);
      console.log('buildConfig', buildConfig);
      return require(buildConfig);
    }
    //TODO delete work Dir
    this.logger.verbose(`build-config.js missing`);
  }
}
