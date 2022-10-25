import { IsString, IsNotEmpty } from 'class-validator';

export class TaskActorDto {
  @IsNotEmpty()
  @IsString()
  public email: string;
}
