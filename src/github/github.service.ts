import { Injectable, Logger } from '@nestjs/common';
import { RecipientResolverService } from '../recipient/recipient-resolver.service';
import { Task } from '../task';
import { TaskActor } from '../task-actor';
import { GithubPayloadDto } from '../dtos/github/github-payload.dto';
import { GithubAuthorDto } from '../dtos/github/github-author.dto';
import { audit } from 'rxjs';

@Injectable()
export class GithubService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly recipientResolverService: RecipientResolverService) {}

  async extractTasksFromPayload(payload: GithubPayloadDto): Promise<any> {
    const actor = this.extractActor(payload.head_commit.author);
    console.log('Payload', payload);

    const task = new Task();
    task.repository = payload.repository.clone_url;
    task.branch = payload.repository.default_branch;
    task.actor = actor;
    console.log('Task', task);
    return task;
  }

  private extractActor(bbActor: GithubAuthorDto): TaskActor {
    const actor = new TaskActor();
    actor.email = this.getActorEmail(bbActor);
    return actor;
  }

  private getActorEmail(actor: GithubAuthorDto): string {
    console.log('Actor', actor);
    const values = [actor.name, actor.email];
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
