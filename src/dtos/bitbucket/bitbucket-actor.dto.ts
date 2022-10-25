import { IsString, IsNotEmpty } from 'class-validator';

export class BitbucketActorDto {
  @IsNotEmpty()
  @IsString()
  display_name: string;

  @IsNotEmpty()
  @IsString()
  uuid: string;

  @IsNotEmpty()
  @IsString()
  account_id: string;

  @IsNotEmpty()
  @IsString()
  nickname: string;
}
