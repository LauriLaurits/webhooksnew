import { IsNotEmpty, IsString } from 'class-validator';

export class GithubRepositoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  clone_url: string;

  @IsNotEmpty()
  @IsString()
  default_branch: string;
}
