import { Injectable, Logger } from '@nestjs/common';
import { RecipientResolverService } from '../recipient/recipient-resolver.service';
import { TaskDto } from '../dtos/task-queue/task.dto';
import { TaskActorDto } from '../dtos/task-queue/task-actor.dto';
import { BitbucketPayloadDto } from '../dtos/bitbucket/bitbucket-payload.dto';
import { BitbucketActorDto } from '../dtos/bitbucket/bitbucket-actor.dto';

@Injectable()
export class BitbucketService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly recipientResolverService: RecipientResolverService) {}

  async extractTasksFromPayload(payload: BitbucketPayloadDto): Promise<TaskDto[]> {
    const actor = this.extractActor(payload.actor);
    console.log('Actor', actor);
    const repository = `git@bitbucket.org:${payload.repository.full_name}.git`;
    return payload.push.changes
      .filter((change) => change.new !== null)
      .map((change) => {
        const task = new TaskDto();
        task.actor = actor;
        task.repository = repository;
        task.branch = change.new.name;
        return task;
      });
  }

  private extractActor(bbActor: BitbucketActorDto): TaskActorDto{
    const actor = new TaskActorDto();
    actor.email = this.getActorEmail(bbActor);
    return actor;
  }

  private getActorEmail(actor: BitbucketActorDto): string {
    console.log('Actor', actor);
    const values = [actor.nickname, actor.account_id, actor.uuid, actor.display_name];
    for (const needle in values) {
      console.log('###########################');
      console.log('Needle', needle);
      console.log('values', values);
      console.log('###########################');
      if (this.recipientResolverService.getRecipient(needle)) {
        console.log('Needle', this.recipientResolverService.getRecipient(needle));
        return this.recipientResolverService.getRecipient(needle);
      }
    }
    //console.log('default', this.recipientResolverService.getDefaultRecipient());
    return this.recipientResolverService.getDefaultRecipient();
  }
}
