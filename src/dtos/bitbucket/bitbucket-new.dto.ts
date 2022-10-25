import { ValidateNested, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { BitbucketDateDto } from './bitbucket-date.dto';

export class BitbucketNewDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => BitbucketDateDto)
  target: BitbucketDateDto;
}
