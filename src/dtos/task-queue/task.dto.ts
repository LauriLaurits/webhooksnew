import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TaskActorDto } from './task-actor.dto';

export class TaskDto {
  @ValidateNested()
  @Type(() => TaskActorDto)
  actor: TaskActorDto;

  @IsNotEmpty()
  @IsString()
  repository: string;

  @IsNotEmpty()
  @IsString()
  branch: string;
}
