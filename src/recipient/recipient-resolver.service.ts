import { Injectable } from '@nestjs/common';

@Injectable()
export class RecipientResolverService {
  private defaultRecipient = 'andero@opus.ee';
  private map = {
    laurilaurits: 'lauri.laurits@opusonline.ee',
    '{88c28b49-7b1d-4f36-baed-29bf24281c9c}': 'lauri.laurits@opusonline.ee',
    allankikkas: 'allan@opus.ee',
    '{6a3feeef-e815-47f0-944a-49258dc66a6b}': 'allan@opus.ee',
    anderokoplus: 'andero@opus.ee',
    '{b5d4d41f-fe79-4c30-a522-bafff347f98c}': 'andero@opus.ee',
  };
  //TODO
  public getRecipient(token: string): string | undefined {
    return this.map[token];
  }
  public getDefaultRecipient(): string {
    return this.defaultRecipient;
  }
}
